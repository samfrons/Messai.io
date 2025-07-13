'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface VanillaThreeSceneProps {
  onComponentSelect?: (component: string) => void;
  selectedComponent?: string | null;
  config?: any;
  designType?: string;
}

export function VanillaThreeScene({ 
  onComponentSelect, 
  selectedComponent, 
  config,
  designType 
}: VanillaThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Initialize scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      scene.fog = new THREE.Fog(0x1a1a1a, 10, 30);
      sceneRef.current = scene;

      // Initialize camera
      const camera = new THREE.PerspectiveCamera(
        60,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        100
      );
      camera.position.set(5, 3, 5);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Initialize controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 15;
      controls.minDistance = 3;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -10;
      directionalLight.shadow.camera.right = 10;
      directionalLight.shadow.camera.top = 10;
      directionalLight.shadow.camera.bottom = -10;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(-10, -10, -5);
      scene.add(pointLight);

      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
      scene.add(hemisphereLight);

      // Add MFC components based on config
      if (config) {
        createMFCComponents(scene, camera, renderer, config, selectedComponent || null, onComponentSelect);
      } else {
        // Add a simple test cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
      }

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        if (controls) {
          controls.update();
        }
        
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();
      setIsLoading(false);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        
        if (controls) {
          controls.dispose();
        }
        
        if (renderer) {
          renderer.dispose();
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
        }
        
        // Dispose of all geometries and materials
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      };
    } catch (err) {
      console.error('Error initializing Three.js scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D scene');
      setIsLoading(false);
    }
  }, [config, selectedComponent, onComponentSelect, designType]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-red-500 p-4">
          <p>Error loading 3D scene: {error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}

function createMFCComponents(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  config: any, 
  selectedComponent: string | null,
  onComponentSelect?: (component: string) => void
) {
  // Chamber
  const chamberGeometry = config.chamber.shape === 'cylindrical' 
    ? new THREE.CylinderGeometry(1.5, 1.5, 3, 32)
    : new THREE.BoxGeometry(4, 2, 2);
  
  const chamberMaterial = new THREE.MeshStandardMaterial({
    color: selectedComponent === 'chamber' ? 0x61dafb : 0x87ceeb,
    transparent: true,
    opacity: 0.3,
    emissive: selectedComponent === 'chamber' ? 0x1e90ff : 0x000000,
    emissiveIntensity: selectedComponent === 'chamber' ? 0.1 : 0
  });
  
  const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
  if (config.chamber.shape === 'cylindrical') {
    chamber.rotation.z = Math.PI / 2;
  }
  chamber.userData = { component: 'chamber' };
  scene.add(chamber);

  // Anode electrode
  const anodeGeometry = new THREE.BoxGeometry(2, 0.2, config.electrode.thickness);
  const anodeMaterial = new THREE.MeshStandardMaterial({
    color: selectedComponent === 'anode' ? 0xff6b6b : getElectrodeColor(config.electrode.material),
    emissive: selectedComponent === 'anode' ? 0xff3333 : getElectrodeEmissive(config.electrode.material),
    emissiveIntensity: selectedComponent === 'anode' ? 0.3 : getElectrodeEmissiveIntensity(config.electrode.material),
    roughness: getElectrodeRoughness(config.electrode.material),
    metalness: getElectrodeMetalness(config.electrode.material)
  });
  
  const anode = new THREE.Mesh(anodeGeometry, anodeMaterial);
  anode.position.set(-1.5, 0, 0);
  anode.userData = { component: 'anode' };
  scene.add(anode);

  // Cathode electrode
  const cathodeGeometry = new THREE.BoxGeometry(2, 0.2, config.electrode.thickness);
  const cathodeMaterial = new THREE.MeshStandardMaterial({
    color: selectedComponent === 'cathode' ? 0x4ecdc4 : 0x666666,
    emissive: selectedComponent === 'cathode' ? 0x2aa198 : 0x000000,
    emissiveIntensity: selectedComponent === 'cathode' ? 0.3 : 0,
    roughness: 0.6,
    metalness: 0.3
  });
  
  const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
  cathode.position.set(1.5, 0, 0);
  cathode.userData = { component: 'cathode' };
  scene.add(cathode);

  // Microbial biofilm
  const biofilmGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.5);
  const biofilmMaterial = new THREE.MeshStandardMaterial({
    color: selectedComponent === 'microbial' ? getMicrobialColor(config.microbial.species) : 0x22aa22,
    transparent: true,
    opacity: selectedComponent === 'microbial' ? 0.8 : 0.6,
    emissive: selectedComponent === 'microbial' ? getMicrobialColor(config.microbial.species) : 0x001100,
    emissiveIntensity: selectedComponent === 'microbial' ? 0.2 : 0.1
  });
  
  const biofilm = new THREE.Mesh(biofilmGeometry, biofilmMaterial);
  biofilm.position.set(-1.4, 0.15, 0);
  biofilm.userData = { component: 'microbial' };
  scene.add(biofilm);

  // Add click handling
  if (onComponentSelect) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.component) {
          onComponentSelect(object.userData.component);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);
  }
}

// Helper functions
function getElectrodeColor(material: string): number {
  const colors: Record<string, number> = {
    'carbon-cloth': 0x2a2a2a,
    'graphite': 0x4a4a4a,
    'stainless-steel': 0xc0c0c0,
    'graphene-oxide': 0x1e40af,
    'reduced-graphene-oxide': 0x1e3a8a,
    'graphene-carbon-cloth': 0x3730a3,
    'graphene-foam': 0x5b21b6,
    'graphene-aerogel': 0x7c3aed,
    'swcnt': 0x059669,
    'mwcnt': 0x047857,
    'cnt-carbon-cloth': 0x065f46,
    'cnt-graphene': 0x064e3b,
    'cnt-paper': 0x0f766e,
    'ti3c2tx': 0xdc2626,
    'ti2ctx': 0xea580c,
    'mxene-carbon-cloth': 0xf97316,
    'mxene-graphene': 0xfb923c,
    'nb2ctx': 0xf59e0b,
    'v2ctx': 0xeab308,
    'iphone-cord-copper': 0xcd7c0f,
    'iphone-cord-copper-etched': 0xb45309,
    'iphone-cord-copper-anodized': 0x92400e,
    'reclaimed-copper-wire': 0xd97706,
    'reclaimed-copper-oxidized': 0xa16207,
    'upcycled-copper-mesh': 0x78350f,
    'cable-core-composite': 0xf59e0b,
    'electroplated-reclaimed': 0x451a03
  };
  return colors[material] || 0x2a2a2a;
}

function getElectrodeEmissive(material: string): number {
  if (material.includes('graphene')) return 0x1e40af;
  if (material.includes('cnt')) return 0x059669;
  if (material.includes('mxene')) return 0xdc2626;
  if (material.includes('upcycled') || material.includes('reclaimed') || material.includes('iphone') || material.includes('cable')) return 0xd97706;
  return 0x000000;
}

function getElectrodeEmissiveIntensity(material: string): number {
  if (material.includes('aerogel')) return 0.2;
  if (material.includes('graphene') || material.includes('cnt')) return 0.1;
  if (material.includes('mxene')) return 0.15;
  if (material.includes('electroplated') || material.includes('anodized')) return 0.12;
  if (material.includes('upcycled') || material.includes('reclaimed')) return 0.05;
  return 0;
}

function getElectrodeRoughness(material: string): number {
  if (material.includes('aerogel') || material.includes('foam')) return 0.9;
  if (material.includes('graphene')) return 0.3;
  if (material.includes('cnt')) return 0.4;
  if (material.includes('mxene')) return 0.2;
  if (material === 'stainless-steel') return 0.2;
  if (material.includes('etched') || material.includes('mesh')) return 0.7;
  if (material.includes('copper') || material.includes('reclaimed')) return 0.6;
  if (material.includes('electroplated')) return 0.3;
  return 0.8;
}

function getElectrodeMetalness(material: string): number {
  if (material.includes('mxene')) return 0.9;
  if (material === 'stainless-steel') return 0.8;
  if (material.includes('graphene') && !material.includes('oxide')) return 0.7;
  if (material.includes('cnt')) return 0.5;
  if (material.includes('copper') || material.includes('electroplated')) return 0.9;
  if (material.includes('anodized')) return 0.7;
  if (material.includes('reclaimed') || material.includes('cable')) return 0.6;
  return 0.1;
}

function getMicrobialColor(species: string): number {
  const colors: Record<string, number> = {
    'geobacter': 0x00ff00,
    'shewanella': 0xffff00,
    'mixed-culture': 0xff9500
  };
  return colors[species] || 0x00ff00;
}