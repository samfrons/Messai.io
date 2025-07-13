'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadThree, loadOrbitControls } from './utils/loader';
import { checkWebGLSupport, getWebGLCapabilities, getQualitySettings } from './utils/webgl';
import { PerformanceMonitor, AdaptiveQuality, disposeObject } from './utils/performance';
import { rendererPool } from './utils/renderer-pool';
import { MESSModel3DProps, ThreeContext } from './types';
import { modelDefinitions } from './models';
import { createMaterial } from './models/shared/materials';

// Generate unique ID for each component instance
let instanceCounter = 0;

/**
 * Main 3D model component for MESSAi
 * Consolidates all 3D rendering functionality
 */
export function MESSModel3D({
  design,
  interactive = true,
  showGrid = false,
  autoRotate = false,
  rotationSpeed = 0.01,
  className = '',
  onLoad,
  onError,
  onClick,
  showLabels = false,
  performanceMode = false,
}: MESSModel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<ThreeContext | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const performanceRef = useRef<PerformanceMonitor | null>(null);
  const qualityRef = useRef<AdaptiveQuality | null>(null);
  const instanceId = useRef(`mess-3d-${++instanceCounter}`);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Initialize Three.js scene
  const initScene = useCallback(async () => {
    if (!mountRef.current) return;

    try {
      // Check WebGL support
      if (!checkWebGLSupport()) {
        throw new Error('WebGL is not supported on this device');
      }

      // Load Three.js
      const THREE = await loadThree();
      
      // Get quality settings
      const capabilities = getWebGLCapabilities();
      const qualitySettings = getQualitySettings(capabilities);
      
      if (!qualitySettings) {
        throw new Error('Unable to determine quality settings');
      }

      // Initialize performance monitoring
      performanceRef.current = new PerformanceMonitor();
      qualityRef.current = new AdaptiveQuality(
        performanceRef.current,
        performanceMode ? 'low' : qualitySettings.quality as 'low' | 'medium' | 'high'
      );

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      
      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 5, 5);

      // Get renderer from pool
      const currentQuality = qualityRef.current.getQualitySettings();
      const { renderer, canvas, isNew } = await rendererPool.getRenderer(
        instanceId.current,
        mountRef.current,
        THREE,
        {
          antialias: currentQuality.antialias,
          alpha: true,
          powerPreference: performanceMode ? 'low-power' : 'high-performance',
          pixelRatio: currentQuality.pixelRatio,
        }
      );

      // Update renderer size
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = currentQuality.shadowsEnabled;

      // Controls setup
      let controls: any = null;
      if (interactive) {
        const OrbitControls = await loadOrbitControls(THREE);
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = rotationSpeed * 60;
      }

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = currentQuality.shadowsEnabled;
      if (directionalLight.shadow) {
        directionalLight.shadow.mapSize.width = currentQuality.shadowMapSize;
        directionalLight.shadow.mapSize.height = currentQuality.shadowMapSize;
      }
      scene.add(directionalLight);

      // Grid helper
      if (showGrid) {
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        scene.add(gridHelper);
      }

      // Store context
      contextRef.current = {
        scene,
        camera,
        renderer,
        controls,
      };

      // Load model
      await loadModel(THREE, scene);

      // Handle clicks
      if (onClick && canvas) {
        canvas.addEventListener('click', handleClick);
      }

      // Start render loop
      animate();

      setIsLoading(false);
      onLoad?.();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize 3D scene');
      setError(error);
      setWebglSupported(checkWebGLSupport());
      onError?.(error);
      console.error('MESSModel3D initialization error:', error);
    }
  }, [design, interactive, showGrid, autoRotate, rotationSpeed, onClick, onLoad, onError, performanceMode]);

  // Load model geometry
  const loadModel = useCallback(async (THREE: any, scene: any) => {
    const modelDef = modelDefinitions[design];
    if (!modelDef) {
      throw new Error(`Unknown design type: ${design}`);
    }

    // Create model group
    const modelGroup = new THREE.Group();
    
    // Apply transformations
    if (modelDef.position) {
      modelGroup.position.set(...modelDef.position);
    }
    if (modelDef.rotation) {
      modelGroup.rotation.set(...modelDef.rotation);
    }
    if (modelDef.scale) {
      modelGroup.scale.setScalar(modelDef.scale);
    }

    try {
      // Create geometry
      let geometry: any;
      if (modelDef.createGeometry) {
        geometry = await modelDef.createGeometry(THREE);
      } else {
        // Default to a box if no custom geometry
        geometry = new THREE.BoxGeometry(2, 2, 2);
      }

      // Ensure geometry is valid
      if (!geometry || !geometry.attributes) {
        console.warn(`Invalid geometry for ${design}, using default box`);
        geometry = new THREE.BoxGeometry(2, 2, 2);
      }

      // Create material with safe defaults
      const materialConfig = {
        name: modelDef.name,
        type: (modelDef.materialProps?.type || 'standard') as 'physical' | 'standard' | 'basic',
        color: modelDef.color || 0x808080,
        metalness: modelDef.materialProps?.metalness ?? 0.5,
        roughness: modelDef.materialProps?.roughness ?? 0.5,
        transparent: modelDef.materialProps?.transparent ?? false,
        opacity: modelDef.materialProps?.opacity ?? 1,
        emissive: modelDef.emissiveColor || 0x000000,
        emissiveIntensity: 0.1,
      };

      const material = createMaterial(THREE, materialConfig);

      // Create mesh with error handling
      let mesh;
      try {
        mesh = new THREE.Mesh(geometry, material);
      } catch (meshError) {
        console.error('Error creating mesh, using basic material:', meshError);
        const basicMaterial = new THREE.MeshBasicMaterial({ color: modelDef.color || 0x808080 });
        mesh = new THREE.Mesh(geometry, basicMaterial);
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = design;

      // Add animation if specified
      if (modelDef.animation) {
        mesh.userData.animation = modelDef.animation;
      }

      modelGroup.add(mesh);
      scene.add(modelGroup);

    } catch (modelError) {
      console.error(`Error creating model ${design}:`, modelError);
      // Add a fallback cube
      const fallbackGeometry = new THREE.BoxGeometry(2, 2, 2);
      const fallbackMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        wireframe: true 
      });
      const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      modelGroup.add(fallbackMesh);
      scene.add(modelGroup);
    }
  }, [design, showLabels]);

  // Handle click events
  const handleClick = useCallback((event: MouseEvent) => {
    if (!contextRef.current || !onClick) return;

    const { camera, renderer, scene } = contextRef.current;
    const THREE = (window as any).THREE;
    if (!THREE) return;

    // Calculate mouse position in normalized device coordinates
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      onClick(object.name || undefined);
    }
  }, [onClick]);

  // Animation loop
  const animate = useCallback(() => {
    if (!contextRef.current) return;

    const { scene, camera, renderer, controls } = contextRef.current;

    // Update performance monitor
    performanceRef.current?.update();
    performanceRef.current?.updateMemoryUsage(renderer);

    // Update adaptive quality
    qualityRef.current?.update();

    // Apply quality settings if changed
    const currentQuality = qualityRef.current?.getQualitySettings();
    if (currentQuality && renderer.getPixelRatio() !== currentQuality.pixelRatio) {
      renderer.setPixelRatio(currentQuality.pixelRatio);
    }

    // Update controls
    if (controls) {
      controls.update();
    }

    // Animate models
    scene.traverse((child: any) => {
      if (child.userData.animation) {
        const time = performance.now() * 0.001;
        const anim = child.userData.animation;
        
        switch (anim.type) {
          case 'rotate':
            child.rotation.y = time * (anim.speed || 1);
            break;
          case 'float':
            child.position.y = Math.sin(time * (anim.speed || 1)) * (anim.amplitude || 0.1);
            break;
          case 'pulse':
            const scale = 1 + Math.sin(time * (anim.speed || 1)) * (anim.amplitude || 0.05);
            child.scale.setScalar(scale);
            break;
        }
      }
    });

    // Render
    renderer.render(scene, camera);
    
    // Continue animation
    animationIdRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!contextRef.current || !mountRef.current) return;
      
      const { camera, renderer } = contextRef.current;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize scene
  useEffect(() => {
    initScene();

    // Cleanup
    return () => {
      // Cancel animation
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Clean up Three.js objects
      if (contextRef.current) {
        const { scene, controls } = contextRef.current;
        
        // Dispose controls
        if (controls && controls.dispose) {
          controls.dispose();
        }
        
        // Dispose scene objects
        scene.traverse((child: any) => {
          disposeObject(child);
        });
        scene.clear();
      }
      
      // Release renderer from pool
      rendererPool.releaseRenderer(instanceId.current);
    };
  }, [initScene]);

  // Render states
  if (!webglSupported) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">WebGL is not supported on your device</p>
          <p className="text-sm text-gray-400">
            Please use a modern browser with WebGL support to view 3D models.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load 3D model</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Performance indicator (dev mode only) */}
      {process.env.NODE_ENV === 'development' && performanceRef.current && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
          FPS: {performanceRef.current.getFPS()}
        </div>
      )}
    </div>
  );
}

// Export as default for lazy loading
export default MESSModel3D;