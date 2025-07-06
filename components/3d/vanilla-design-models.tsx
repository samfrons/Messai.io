'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface VanillaDesignModelsProps {
  designType: string;
  scale?: number;
  showLabels?: boolean;
  autoRotate?: boolean;
}

export function VanillaDesignModels({ 
  designType, 
  scale = 1, 
  showLabels = false,
  autoRotate = false
}: VanillaDesignModelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
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
        50,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        100
      );
      camera.position.set(3, 2, 3);
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
      controls.enablePan = !autoRotate;
      controls.enableZoom = !autoRotate;
      controls.enableRotate = true;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 2;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.3);
      pointLight.position.set(-5, -5, -5);
      scene.add(pointLight);

      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
      scene.add(hemisphereLight);

      // Create design-specific model
      const modelGroup = new THREE.Group();
      modelGroup.scale.set(scale, scale, scale);
      
      switch (designType) {
        case 'micro-chip':
          createMicroChipModel(modelGroup, showLabels);
          break;
        case 'isolinear-chip':
          createIsolinearChipModel(modelGroup, showLabels);
          break;
        case 'benchtop-bioreactor':
          createBenchtopBioreactorModel(modelGroup, showLabels);
          break;
        case 'wastewater-treatment':
          createWastewaterTreatmentModel(modelGroup, showLabels);
          break;
        case 'brewery-processing':
          createBreweryProcessingModel(modelGroup, showLabels);
          break;
        case 'architectural-facade':
          createArchitecturalFacadeModel(modelGroup, showLabels);
          break;
        case 'benthic-fuel-cell':
          createBenthicFuelCellModel(modelGroup, showLabels);
          break;
        case 'kitchen-sink':
          createKitchenSinkModel(modelGroup, showLabels);
          break;
        default:
          createGenericModel(modelGroup, designType, showLabels);
      }
      
      scene.add(modelGroup);

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
    }
  }, [designType, scale, showLabels, autoRotate]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-red-500 p-4">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"
    />
  );
}

// Model creation functions
function createMicroChipModel(group: THREE.Group, showLabels: boolean) {
  // Silicon substrate
  const substrateGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
  const substrateMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748, 
    metalness: 0.8, 
    roughness: 0.2 
  });
  const substrate = new THREE.Mesh(substrateGeometry, substrateMaterial);
  substrate.position.set(0, -0.25, 0);
  group.add(substrate);

  // Microchambers
  const chamberGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.3);
  const chamberMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4299e1, 
    transparent: true, 
    opacity: 0.7 
  });
  
  const chamber1 = new THREE.Mesh(chamberGeometry, chamberMaterial);
  chamber1.position.set(-0.6, -0.1, 0);
  group.add(chamber1);
  
  const chamber2 = new THREE.Mesh(chamberGeometry, chamberMaterial);
  chamber2.position.set(0.6, -0.1, 0);
  group.add(chamber2);

  // Gold microelectrodes
  const electrodeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.25);
  const electrodeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  
  const electrode1 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode1.position.set(-0.3, -0.05, 0);
  group.add(electrode1);
  
  const electrode2 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode2.position.set(0.3, -0.05, 0);
  group.add(electrode2);

  // Nafion membrane
  const membraneGeometry = new THREE.PlaneGeometry(0.02, 0.3);
  const membraneMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
  membrane.position.set(0, -0.05, 0);
  membrane.rotation.y = Math.PI / 2;
  group.add(membrane);
}

function createIsolinearChipModel(group: THREE.Group, showLabels: boolean) {
  // Microscope slide base
  const slideGeometry = new THREE.BoxGeometry(3, 0.05, 1);
  const slideMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, 
    transparent: true, 
    opacity: 0.9 
  });
  const slide = new THREE.Mesh(slideGeometry, slideMaterial);
  slide.position.set(0, -0.1, 0);
  group.add(slide);

  // Isolinear pattern channels
  const channelGeometry = new THREE.BoxGeometry(2.5, 0.03, 0.08);
  const channelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4299e1, 
    emissive: 0x1e40af, 
    emissiveIntensity: 0.3 
  });
  
  for (let i = 0; i < 5; i++) {
    const channel = new THREE.Mesh(channelGeometry, channelMaterial);
    channel.position.set(0, -0.05, -0.32 + i * 0.16);
    group.add(channel);
  }

  // ITO electrodes
  const itoGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.8);
  const itoMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x81d4fa, 
    transparent: true, 
    opacity: 0.3, 
    metalness: 0.7 
  });
  
  const ito1 = new THREE.Mesh(itoGeometry, itoMaterial);
  ito1.position.set(-1, -0.03, 0);
  group.add(ito1);
  
  const ito2 = new THREE.Mesh(itoGeometry, itoMaterial);
  ito2.position.set(1, -0.03, 0);
  group.add(ito2);
}

function createBenchtopBioreactorModel(group: THREE.Group, showLabels: boolean) {
  // Main reactor vessel
  const vesselGeometry = new THREE.CylinderGeometry(1, 1, 2);
  const vesselMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, 
    transparent: true, 
    opacity: 0.6 
  });
  const vessel = new THREE.Mesh(vesselGeometry, vesselMaterial);
  group.add(vessel);

  // Reactor base
  const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a5568, 
    metalness: 0.8, 
    roughness: 0.3 
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(0, -1.1, 0);
  group.add(base);

  // Stirrer shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.5);
  const shaftMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.set(0, 0.25, 0);
  group.add(shaft);

  // Impeller blades
  const bladeGeometry1 = new THREE.BoxGeometry(0.6, 0.03, 0.1);
  const bladeGeometry2 = new THREE.BoxGeometry(0.1, 0.03, 0.6);
  const bladeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  
  const blade1 = new THREE.Mesh(bladeGeometry1, bladeMaterial);
  blade1.position.set(0, -0.3, 0);
  group.add(blade1);
  
  const blade2 = new THREE.Mesh(bladeGeometry2, bladeMaterial);
  blade2.position.set(0, -0.3, 0);
  group.add(blade2);
}

function createWastewaterTreatmentModel(group: THREE.Group, showLabels: boolean) {
  // Main treatment tank
  const tankGeometry = new THREE.BoxGeometry(4, 2, 2);
  const tankMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2, 
    transparent: true, 
    opacity: 0.4 
  });
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  group.add(tank);

  // Modular compartments
  const compartmentGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  const compartmentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748, 
    transparent: true, 
    opacity: 0.3 
  });
  
  const compartment1 = new THREE.Mesh(compartmentGeometry, compartmentMaterial);
  compartment1.position.set(-1, 0, 0);
  group.add(compartment1);
  
  const compartment2 = new THREE.Mesh(compartmentGeometry, compartmentMaterial);
  compartment2.position.set(1, 0, 0);
  group.add(compartment2);

  // Stainless steel mesh arrays
  const meshGeometry = new THREE.BoxGeometry(0.1, 1.5, 1.5);
  const meshMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xc0c0c0, 
    metalness: 0.8, 
    roughness: 0.2 
  });
  
  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    mesh.position.set(-1.5 + i * 0.4, 0, 0);
    group.add(mesh);
  }
}

function createBreweryProcessingModel(group: THREE.Group, showLabels: boolean) {
  // Stainless steel tank
  const tankGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5);
  const tankMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  group.add(tank);

  // Conical bottom
  const coneGeometry = new THREE.ConeGeometry(1.2, 0.8, 8);
  const coneMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd6d9dc, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.set(0, -1.9, 0);
  group.add(cone);

  // Brewery wastewater
  const wastewaterGeometry = new THREE.CylinderGeometry(1.1, 1.1, 2.2);
  const wastewaterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4a574, 
    transparent: true, 
    opacity: 0.6 
  });
  const wastewater = new THREE.Mesh(wastewaterGeometry, wastewaterMaterial);
  group.add(wastewater);
}

function createArchitecturalFacadeModel(group: THREE.Group, showLabels: boolean) {
  // Building facade panel
  const panelGeometry = new THREE.BoxGeometry(3, 4, 0.2);
  const panelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a5568, 
    metalness: 0.3, 
    roughness: 0.7 
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  group.add(panel);

  // Modular MFC units
  const unitGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.15);
  const unitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4299e1, 
    transparent: true, 
    opacity: 0.7,
    emissive: 0x1e40af,
    emissiveIntensity: 0.1
  });
  
  for (let i = 0; i < 6; i++) {
    const unit = new THREE.Mesh(unitGeometry, unitMaterial);
    const row = Math.floor(i / 3);
    const col = i % 3;
    unit.position.set(-1 + col * 1, 0.8 - row * 1.6, 0.1);
    group.add(unit);
  }
}

function createBenthicFuelCellModel(group: THREE.Group, showLabels: boolean) {
  // Marine-grade housing
  const housingGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5);
  const housingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748, 
    metalness: 0.8, 
    roughness: 0.3 
  });
  const housing = new THREE.Mesh(housingGeometry, housingMaterial);
  housing.position.set(0, 0.25, 0);
  group.add(housing);

  // Sediment layer
  const sedimentGeometry = new THREE.CylinderGeometry(2, 2, 0.3);
  const sedimentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513, 
    roughness: 0.9 
  });
  const sediment = new THREE.Mesh(sedimentGeometry, sedimentMaterial);
  sediment.position.set(0, -0.65, 0);
  group.add(sediment);

  // Water column
  const waterGeometry = new THREE.CylinderGeometry(2.5, 2.5, 2);
  const waterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4682b4, 
    transparent: true, 
    opacity: 0.3 
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.set(0, 1.5, 0);
  group.add(water);
}

function createKitchenSinkModel(group: THREE.Group, showLabels: boolean) {
  // Under-sink housing
  const housingGeometry = new THREE.BoxGeometry(2, 1, 1.5);
  const housingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf7fafc, 
    metalness: 0.1, 
    roughness: 0.8 
  });
  const housing = new THREE.Mesh(housingGeometry, housingMaterial);
  housing.position.set(0, -0.3, 0);
  group.add(housing);

  // Sink connection pipe
  const pipeGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1);
  const pipeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a5568, 
    metalness: 0.7 
  });
  const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe.position.set(0, 0.5, 0);
  group.add(pipe);

  // LED status indicator
  const ledGeometry = new THREE.SphereGeometry(0.02);
  const ledMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x10b981, 
    emissive: 0x10b981, 
    emissiveIntensity: 0.5 
  });
  const led = new THREE.Mesh(ledGeometry, ledMaterial);
  led.position.set(-0.8, 0.3, 0.6);
  group.add(led);
}

function createGenericModel(group: THREE.Group, designType: string, showLabels: boolean) {
  // Generic MFC model
  const chamberGeometry = new THREE.BoxGeometry(2, 1, 1);
  const chamberMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2, 
    transparent: true, 
    opacity: 0.6 
  });
  const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
  group.add(chamber);

  const electrodeGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.8);
  const electrodeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3748 });
  
  const electrode1 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode1.position.set(-0.8, 0, 0);
  group.add(electrode1);
  
  const electrode2 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode2.position.set(0.8, 0, 0);
  group.add(electrode2);
}