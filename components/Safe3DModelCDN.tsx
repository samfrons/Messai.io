'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    THREE: any;
  }
}

interface Safe3DModelProps {
  designName?: string;
  designType?: string;
  className?: string;
}

export default function Safe3DModelCDN({ designName, designType, className = '' }: Safe3DModelProps) {
  const name = designName || designType || 'default';
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;
    let renderer: any;

    const loadThreeJS = async () => {
      try {
        // Load Three.js from CDN
        if (!window.THREE) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const THREE = window.THREE;
        if (!THREE) {
          throw new Error('Three.js failed to load');
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        scene.fog = new THREE.Fog(0x0a0a0a, 5, 20);
        sceneRef.current = scene;

        // Camera
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(2, 2, 2);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, 3, -5);
        scene.add(directionalLight2);

        // Create design-specific geometry
        const geometry = getDesignGeometry(name, THREE);
        const material = new THREE.MeshPhongMaterial({ 
          color: getDesignColor(name),
          emissive: getDesignColor(name),
          emissiveIntensity: 0.1,
          shininess: 100,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(4, 10, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          // Rotate the mesh
          mesh.rotation.y += 0.005;
          mesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
          
          renderer.render(scene, camera);
        };

        animate();
        setLoading(false);

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Handle mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        const handleMouseMove = (event: MouseEvent) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          
          // Update camera position based on mouse
          camera.position.x = 2 + mouseX * 0.5;
          camera.position.y = 2 + mouseY * 0.5;
          camera.lookAt(0, 0, 0);
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          if (containerRef.current) {
            containerRef.current.removeEventListener('mousemove', handleMouseMove);
          }
          cancelAnimationFrame(animationId);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
        setLoading(false);
      }
    };

    const cleanup = loadThreeJS();

    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [name]);

  function getDesignGeometry(name: string, THREE: any): any {
    const normalizedName = name.toLowerCase();
    
    if (normalizedName.includes('micro-chip')) {
      // Micro-chip design - thin rectangular chip
      return new THREE.BoxGeometry(1, 0.1, 0.6);
    } else if (normalizedName.includes('isolinear')) {
      // Isolinear chip - hexagonal prism
      const shape = new THREE.Shape();
      const sides = 6;
      const radius = 0.5;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      
      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else if (normalizedName.includes('bio-neural')) {
      // Bio-neural - organic sphere
      return new THREE.SphereGeometry(0.5, 32, 16);
    } else if (normalizedName.includes('quantum')) {
      // Quantum resonance - torus
      return new THREE.TorusGeometry(0.4, 0.15, 16, 32);
    } else if (normalizedName.includes('earthen')) {
      // Earthen pot - cylinder
      return new THREE.CylinderGeometry(0.4, 0.5, 0.8, 16);
    } else if (normalizedName.includes('mason')) {
      // Mason jar - cylinder with lid
      return new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16);
    } else {
      // Default cube
      return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  function getDesignColor(name: string): number {
    const normalizedName = name.toLowerCase();
    
    if (normalizedName.includes('micro-chip')) {
      return 0x00ff88; // Green
    } else if (normalizedName.includes('isolinear')) {
      return 0xff9900; // Orange
    } else if (normalizedName.includes('bio-neural')) {
      return 0x00aaff; // Blue
    } else if (normalizedName.includes('quantum')) {
      return 0xaa00ff; // Purple
    } else if (normalizedName.includes('earthen')) {
      return 0xcc6633; // Brown
    } else if (normalizedName.includes('mason')) {
      return 0x6699cc; // Blue-gray
    } else {
      return 0x888888; // Gray
    }
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Failed to load 3D model</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-lcars-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${className} cursor-move`} style={{ touchAction: 'none' }} />
  );
}