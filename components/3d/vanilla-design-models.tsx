'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MESSAnimationSystem, MESSAnimationUtils } from '@/lib/animation-system';

interface VanillaDesignModelsProps {
  designType: string;
  scale?: number;
  showLabels?: boolean;
  autoRotate?: boolean;
  enableAnimations?: boolean;
  animationSpeed?: number;
}

export function VanillaDesignModels({ 
  designType, 
  scale = 1, 
  showLabels = false,
  autoRotate = false,
  enableAnimations = true,
  animationSpeed = 1
}: VanillaDesignModelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const animationSystemRef = useRef<MESSAnimationSystem | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const modelDataRef = useRef<any>({});
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
      controls.enablePan = true;
      controls.enableZoom = true;
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

      // Initialize animation system
      if (enableAnimations) {
        animationSystemRef.current = new MESSAnimationSystem(scene);
      }

      // Create design-specific model
      const modelGroup = new THREE.Group();
      modelGroup.scale.set(scale, scale, scale);
      
      switch (designType) {
        case 'micro-chip':
          createMicroChipModel(modelGroup, showLabels, scene, animationSystemRef.current, modelDataRef.current);
          break;
        case 'isolinear-chip':
          createIsolinearChipModel(modelGroup, showLabels);
          break;
        case 'benchtop-bioreactor':
          createBenchtopBioreactorModel(modelGroup, showLabels, scene, animationSystemRef.current, modelDataRef.current);
          break;
        case 'wastewater-treatment':
          createWastewaterTreatmentModel(modelGroup, showLabels, scene, animationSystemRef.current, modelDataRef.current);
          break;
        case 'brewery-processing':
          createBreweryProcessingModel(modelGroup, showLabels);
          break;
        case 'architectural-facade':
          createArchitecturalFacadeModel(modelGroup, showLabels, scene, animationSystemRef.current, modelDataRef.current);
          break;
        case 'benthic-fuel-cell':
          createBenthicFuelCellModel(modelGroup, showLabels, scene, animationSystemRef.current, modelDataRef.current);
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
        
        const deltaTime = clockRef.current.getDelta() * animationSpeed;
        const elapsedTime = clockRef.current.getElapsedTime();
        
        if (controls) {
          controls.update();
        }
        
        // Update animations
        if (enableAnimations && animationSystemRef.current) {
          // Update model-specific animations
          switch (designType) {
            case 'micro-chip':
              updateMicroChipAnimations(modelDataRef.current, elapsedTime, deltaTime);
              break;
            case 'benchtop-bioreactor':
              updateBioreactorAnimations(modelDataRef.current, elapsedTime, deltaTime, animationSystemRef.current);
              break;
            case 'wastewater-treatment':
              updateWastewaterAnimations(modelDataRef.current, elapsedTime, deltaTime, animationSystemRef.current);
              break;
            case 'architectural-facade':
              updateFacadeAnimations(modelDataRef.current, elapsedTime, deltaTime, animationSystemRef.current);
              break;
            case 'benthic-fuel-cell':
              updateBenthicAnimations(modelDataRef.current, elapsedTime, deltaTime, animationSystemRef.current);
              break;
          }
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
        
        // Cleanup animation system
        if (animationSystemRef.current) {
          animationSystemRef.current.dispose();
          animationSystemRef.current = null;
        }
        
        // Clear model data
        modelDataRef.current = {};
      };
    } catch (err) {
      console.error('Error initializing Three.js scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D scene');
    }
  }, [designType, scale, showLabels, autoRotate, enableAnimations, animationSpeed]);

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
function createMicroChipModel(
  group: THREE.Group, 
  showLabels: boolean, 
  scene: THREE.Scene,
  animationSystem: MESSAnimationSystem | null,
  modelData: any
) {
  // Glass slide substrate (75mm × 25mm × 1mm actual scale = 7.5 × 2.5 × 0.1 in model)
  const slideGeometry = new THREE.BoxGeometry(7.5, 0.1, 2.5);
  const slideMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.1,
    ior: 1.5
  });
  const slide = new THREE.Mesh(slideGeometry, slideMaterial);
  slide.position.set(0, 0, 0);
  slide.castShadow = true;
  slide.receiveShadow = true;
  group.add(slide);

  // Y-junction microfluidic channels
  const createChannel = (path: THREE.CatmullRomCurve3) => {
    const channelGeometry = new THREE.TubeGeometry(path, 64, 0.05, 8, false);
    const channelMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x2196f3,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1
    });
    return new THREE.Mesh(channelGeometry, channelMaterial);
  };

  // Main inlet channel
  const inletPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.5, 0.1, 0),
    new THREE.Vector3(-2, 0.1, 0),
    new THREE.Vector3(-1, 0.1, 0)
  ]);
  const inletChannel = createChannel(inletPath);
  group.add(inletChannel);

  // Y-junction split
  const upperPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1, 0.1, 0),
    new THREE.Vector3(0, 0.1, 0.5),
    new THREE.Vector3(1, 0.1, 0.5),
    new THREE.Vector3(2, 0.1, 0.5),
    new THREE.Vector3(3.5, 0.1, 0.5)
  ]);
  const upperChannel = createChannel(upperPath);
  group.add(upperChannel);

  const lowerPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1, 0.1, 0),
    new THREE.Vector3(0, 0.1, -0.5),
    new THREE.Vector3(1, 0.1, -0.5),
    new THREE.Vector3(2, 0.1, -0.5),
    new THREE.Vector3(3.5, 0.1, -0.5)
  ]);
  const lowerChannel = createChannel(lowerPath);
  group.add(lowerChannel);

  // Anode chamber
  const anodeChamberGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.8);
  const anodeChamberMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a237e,
    transparent: true,
    opacity: 0.3,
    roughness: 0.2
  });
  const anodeChamber = new THREE.Mesh(anodeChamberGeometry, anodeChamberMaterial);
  anodeChamber.position.set(-1.5, 0.1, 0);
  group.add(anodeChamber);

  // Cathode chamber
  const cathodeChamber = anodeChamber.clone();
  cathodeChamber.position.set(1.5, 0.1, 0);
  group.add(cathodeChamber);

  // Gold serpentine microelectrodes
  const createSerpentineElectrode = (isAnode: boolean) => {
    const points: THREE.Vector3[] = [];
    const segments = 10;
    const width = 0.7;
    const height = 0.4;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width - width / 2;
      const y = 0.11;
      const z = Math.sin(i * Math.PI) * height * (i % 2 === 0 ? 1 : -1);
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const electrodePath = new THREE.CatmullRomCurve3(points);
    const electrodeGeometry = new THREE.TubeGeometry(electrodePath, 64, 0.02, 8, false);
    const electrodeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffd700,
      emissiveIntensity: 0.1
    });
    
    const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
    electrode.position.x = isAnode ? -1.5 : 1.5;
    return electrode;
  };

  const anodeElectrode = createSerpentineElectrode(true);
  group.add(anodeElectrode);
  modelData.anode = anodeElectrode;

  const cathodeElectrode = createSerpentineElectrode(false);
  group.add(cathodeElectrode);
  modelData.cathode = cathodeElectrode;

  // Transparent ITO cathode layer
  const itoGeometry = new THREE.PlaneGeometry(1.4, 0.7);
  const itoMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x81d4fa,
    transparent: true,
    opacity: 0.2,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide
  });
  const ito = new THREE.Mesh(itoGeometry, itoMaterial);
  ito.position.set(1.5, 0.12, 0);
  ito.rotation.x = -Math.PI / 2;
  group.add(ito);

  // Nafion membrane separator
  const membraneGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.7);
  const membraneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe8f5e9,
    transparent: true,
    opacity: 0.4,
    roughness: 0.8
  });
  const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
  membrane.position.set(0, 0.1, 0);
  group.add(membrane);

  // Inlet/outlet ports
  const createPort = (position: THREE.Vector3) => {
    const portGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x424242,
      metalness: 0.8,
      roughness: 0.2
    });
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.position.copy(position);
    return port;
  };

  const inletPort = createPort(new THREE.Vector3(-3.5, 0.2, 0));
  group.add(inletPort);

  const outletPort1 = createPort(new THREE.Vector3(3.5, 0.2, 0.5));
  group.add(outletPort1);

  const outletPort2 = createPort(new THREE.Vector3(3.5, 0.2, -0.5));
  group.add(outletPort2);

  // Setup flow animation
  if (animationSystem) {
    animationSystem.createFlowField(
      {
        min: new THREE.Vector3(-3.5, 0.05, -1),
        max: new THREE.Vector3(3.5, 0.15, 1)
      },
      {
        flowRate: 1,
        particleCount: 30,
        biofilmGrowthRate: 0.1,
        gasProductionRate: 0,
        bubbleSize: 0.02,
        flowDirection: new THREE.Vector3(1, 0, 0)
      }
    );
  }

  // Store flow paths for animation
  modelData.flowPaths = [inletPath, upperPath, lowerPath];
  modelData.chambers = { anode: anodeChamber, cathode: cathodeChamber };
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

function createBenchtopBioreactorModel(
  group: THREE.Group, 
  showLabels: boolean,
  scene: THREE.Scene,
  animationSystem: MESSAnimationSystem | null,
  modelData: any
) {
  // Main reactor vessel (5L glass bioreactor)
  const vesselRadius = 2;
  const vesselHeight = 4;
  const vesselGeometry = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 32);
  const vesselMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    transmission: 0.8,
    thickness: 0.1,
    roughness: 0.1,
    metalness: 0,
    ior: 1.5
  });
  const vessel = new THREE.Mesh(vesselGeometry, vesselMaterial);
  vessel.castShadow = true;
  vessel.receiveShadow = true;
  group.add(vessel);

  // Reactor medium (culture liquid)
  const mediumGeometry = new THREE.CylinderGeometry(vesselRadius * 0.95, vesselRadius * 0.95, vesselHeight * 0.8, 32);
  const mediumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8d6e63,
    transparent: true,
    opacity: 0.4,
    transmission: 0.2,
    thickness: 1,
    roughness: 0.5
  });
  const medium = new THREE.Mesh(mediumGeometry, mediumMaterial);
  medium.position.y = -vesselHeight * 0.1;
  group.add(medium);
  modelData.medium = medium;

  // Reactor base with magnetic stirrer
  const baseGeometry = new THREE.CylinderGeometry(vesselRadius * 1.2, vesselRadius * 1.3, 0.4, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x263238,
    metalness: 0.8,
    roughness: 0.2
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(0, -vesselHeight/2 - 0.3, 0);
  group.add(base);

  // Control panel on base
  const panelGeometry = new THREE.BoxGeometry(1, 0.3, 0.5);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    metalness: 0.7,
    roughness: 0.3
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.set(vesselRadius + 0.5, -vesselHeight/2 - 0.15, 0);
  group.add(panel);

  // LED indicators
  const createLED = (color: number, x: number) => {
    const ledGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(x, 0.16, 0.26);
    panel.add(led);
    return led;
  };

  createLED(0x00ff00, -0.3); // Power
  createLED(0xffff00, 0); // Stirring
  createLED(0xff0000, 0.3); // Heating

  // Stirrer assembly
  const stirrerGroup = new THREE.Group();
  stirrerGroup.position.set(0, -vesselHeight * 0.3, 0);
  group.add(stirrerGroup);
  modelData.stirrer = stirrerGroup;

  // Stirrer shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, vesselHeight * 1.2, 16);
  const shaftMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x607d8b,
    metalness: 0.9,
    roughness: 0.1
  });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.y = vesselHeight * 0.4;
  stirrerGroup.add(shaft);

  // Impeller with 4 blades
  const impellerGroup = new THREE.Group();
  stirrerGroup.add(impellerGroup);
  modelData.impeller = impellerGroup;

  for (let i = 0; i < 4; i++) {
    const bladeGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.3);
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x455a64,
      metalness: 0.9,
      roughness: 0.1
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.rotation.y = (i * Math.PI) / 2;
    blade.rotation.z = Math.PI / 6; // Angled blades
    impellerGroup.add(blade);
  }

  // External fuel cell stack
  const stackGroup = new THREE.Group();
  stackGroup.position.set(vesselRadius + 2, 0, 0);
  group.add(stackGroup);

  // Stack housing
  const stackGeometry = new THREE.BoxGeometry(1.5, 3, 1);
  const stackMaterial = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    metalness: 0.7,
    roughness: 0.3
  });
  const stackHousing = new THREE.Mesh(stackGeometry, stackMaterial);
  stackGroup.add(stackHousing);

  // Individual fuel cells in stack
  const cellCount = 5;
  for (let i = 0; i < cellCount; i++) {
    const cellGeometry = new THREE.BoxGeometry(1.3, 0.4, 0.8);
    const cellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a237e,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x1a237e,
      emissiveIntensity: 0.1
    });
    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.position.y = (i - cellCount/2 + 0.5) * 0.5;
    stackGroup.add(cell);
  }

  // Connection tubes
  const createTube = (start: THREE.Vector3, end: THREE.Vector3) => {
    const path = new THREE.CatmullRomCurve3([start, end]);
    const tubeGeometry = new THREE.TubeGeometry(path, 32, 0.1, 8, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x546e7a,
      metalness: 0.6,
      roughness: 0.4
    });
    return new THREE.Mesh(tubeGeometry, tubeMaterial);
  };

  const tube1 = createTube(
    new THREE.Vector3(vesselRadius, vesselHeight * 0.3, 0),
    new THREE.Vector3(vesselRadius + 0.75, vesselHeight * 0.3, 0)
  );
  group.add(tube1);

  const tube2 = createTube(
    new THREE.Vector3(vesselRadius, -vesselHeight * 0.3, 0),
    new THREE.Vector3(vesselRadius + 0.75, -vesselHeight * 0.3, 0)
  );
  group.add(tube2);

  // Sampling ports
  const createPort = (height: number, angle: number) => {
    const portGroup = new THREE.Group();
    
    const portGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x607d8b,
      metalness: 0.8,
      roughness: 0.2
    });
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.rotation.z = Math.PI / 2;
    portGroup.add(port);
    
    const capGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      metalness: 0.7,
      roughness: 0.3
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.x = 0.15;
    portGroup.add(cap);
    
    portGroup.position.set(
      Math.cos(angle) * vesselRadius,
      height,
      Math.sin(angle) * vesselRadius
    );
    portGroup.lookAt(new THREE.Vector3(0, height, 0));
    
    return portGroup;
  };

  group.add(createPort(vesselHeight * 0.4, 0));
  group.add(createPort(vesselHeight * 0.2, Math.PI / 3));
  group.add(createPort(0, Math.PI * 2 / 3));

  // Gas sparger at bottom
  const spargerGeometry = new THREE.TorusGeometry(vesselRadius * 0.7, 0.05, 8, 32);
  const spargerMaterial = new THREE.MeshStandardMaterial({
    color: 0x9e9e9e,
    metalness: 0.8,
    roughness: 0.2
  });
  const sparger = new THREE.Mesh(spargerGeometry, spargerMaterial);
  sparger.position.y = -vesselHeight * 0.45;
  sparger.rotation.x = Math.PI / 2;
  group.add(sparger);
  modelData.sparger = sparger;

  // Temperature probe
  const probeGeometry = new THREE.CylinderGeometry(0.03, 0.03, vesselHeight * 0.8, 8);
  const probeMaterial = new THREE.MeshStandardMaterial({
    color: 0xbdbdbd,
    metalness: 0.9,
    roughness: 0.1
  });
  const probe = new THREE.Mesh(probeGeometry, probeMaterial);
  probe.position.set(vesselRadius * 0.8, 0, 0);
  group.add(probe);

  // Setup animations
  if (animationSystem) {
    // Gas bubbles from sparger
    modelData.bubbleSource = new THREE.Vector3(0, -vesselHeight * 0.45, 0);
    
    // Flow circulation
    const circulationPoints = MESSAnimationUtils.createSpiralFlow(
      new THREE.Vector3(0, 0, 0),
      vesselRadius * 0.8,
      vesselHeight * 0.7,
      50
    );
    modelData.circulationPath = circulationPoints;
  }
}

function createWastewaterTreatmentModel(
  group: THREE.Group, 
  showLabels: boolean,
  scene: THREE.Scene,
  animationSystem: MESSAnimationSystem | null,
  modelData: any
) {
  // Main treatment tank (modular system)
  const tankWidth = 8;
  const tankHeight = 3;
  const tankDepth = 4;
  
  // Concrete tank structure
  const tankGeometry = new THREE.BoxGeometry(tankWidth, tankHeight, tankDepth);
  const tankMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8d8d8d,
    roughness: 0.9,
    metalness: 0.1
  });
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);

  // Wastewater liquid
  const liquidGeometry = new THREE.BoxGeometry(
    tankWidth * 0.95, 
    tankHeight * 0.8, 
    tankDepth * 0.95
  );
  const liquidMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x4a4a4a,
    transparent: true,
    opacity: 0.6,
    transmission: 0.2,
    thickness: 0.5,
    roughness: 0.5
  });
  const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
  liquid.position.y = -tankHeight * 0.1;
  group.add(liquid);
  modelData.liquid = liquid;

  // MFC module arrays (5x4 grid)
  const moduleGroup = new THREE.Group();
  const moduleRows = 5;
  const moduleCols = 4;
  const moduleSpacing = 1.5;
  
  for (let row = 0; row < moduleRows; row++) {
    for (let col = 0; col < moduleCols; col++) {
      const moduleContainer = new THREE.Group();
      
      // Module frame
      const frameGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.3);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x37474f,
        metalness: 0.7,
        roughness: 0.3
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      moduleContainer.add(frame);
      
      // Anode (carbon fiber brush)
      const anodeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 32);
      const anodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.2
      });
      const anode = new THREE.Mesh(anodeGeometry, anodeMaterial);
      anode.position.x = -0.25;
      anode.rotation.z = Math.PI / 2;
      moduleContainer.add(anode);
      
      // Cathode (stainless steel mesh)
      const cathodeGeometry = new THREE.PlaneGeometry(0.6, 0.6);
      const cathodeMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.2,
        side: THREE.DoubleSide
      });
      const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
      cathode.position.x = 0.25;
      cathode.rotation.y = Math.PI / 2;
      moduleContainer.add(cathode);
      
      // Position module
      moduleContainer.position.set(
        -tankWidth/2 + 1 + col * moduleSpacing,
        -tankHeight/2 + 0.5 + row * 0.5,
        0
      );
      moduleGroup.add(moduleContainer);
    }
  }
  
  group.add(moduleGroup);
  modelData.modules = moduleGroup;

  // Inlet pipe
  const inletPipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x546e7a,
    metalness: 0.7,
    roughness: 0.3
  });
  const inletPipe = new THREE.Mesh(inletPipeGeometry, pipeMaterial);
  inletPipe.position.set(-tankWidth/2 - 0.5, tankHeight/2 - 0.5, 0);
  inletPipe.rotation.z = Math.PI / 2;
  group.add(inletPipe);

  // Outlet pipe with clarifier
  const outletGroup = new THREE.Group();
  outletGroup.position.set(tankWidth/2 + 1, 0, 0);
  
  // Clarifier tank
  const clarifierGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
  const clarifierMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb0bec5,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.8
  });
  const clarifier = new THREE.Mesh(clarifierGeometry, clarifierMaterial);
  outletGroup.add(clarifier);
  
  // Outlet pipe
  const outletPipe = new THREE.Mesh(inletPipeGeometry, pipeMaterial);
  outletPipe.position.set(0.5, -0.5, 0);
  outletPipe.rotation.z = Math.PI / 2;
  outletGroup.add(outletPipe);
  
  group.add(outletGroup);
  modelData.clarifier = clarifier;

  // Aeration system
  const aerationPipeGeometry = new THREE.TorusGeometry(tankWidth * 0.4, 0.05, 8, 32);
  const aerationPipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x9e9e9e,
    metalness: 0.8,
    roughness: 0.2
  });
  const aerationPipe = new THREE.Mesh(aerationPipeGeometry, aerationPipeMaterial);
  aerationPipe.position.y = -tankHeight/2 + 0.3;
  aerationPipe.rotation.x = Math.PI / 2;
  group.add(aerationPipe);
  modelData.aerationPipe = aerationPipe;

  // Control panel
  const panelGeometry = new THREE.BoxGeometry(1.5, 2, 0.3);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x455a64,
    metalness: 0.4,
    roughness: 0.6
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.set(tankWidth/2 + 0.2, tankHeight/2 + 1.5, 0);
  group.add(panel);

  // Display screen
  const screenGeometry = new THREE.PlaneGeometry(1.2, 0.8);
  const screenMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a237e,
    emissive: 0x1a237e,
    emissiveIntensity: 0.2,
    metalness: 0.1,
    roughness: 0.1
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 0.3, 0.16);
  panel.add(screen);

  // Status LEDs
  const createStatusLED = (color: number, y: number) => {
    const ledGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, y, 0.16);
    panel.add(led);
  };

  createStatusLED(0x4caf50, -0.2); // Operation
  createStatusLED(0xffc107, -0.4); // Maintenance
  createStatusLED(0x2196f3, -0.6); // Flow

  // Setup animations
  if (animationSystem) {
    // Aeration bubbles
    modelData.bubbleSource = aerationPipe.position.clone();
    
    // Flow field bounds
    modelData.flowBounds = {
      min: new THREE.Vector3(-tankWidth/2 + 0.5, -tankHeight/2 + 0.5, -tankDepth/2 + 0.5),
      max: new THREE.Vector3(tankWidth/2 - 0.5, tankHeight/2 - 0.5, tankDepth/2 - 0.5)
    };
    
    // Create initial flow field
    animationSystem.createFlowField(
      modelData.flowBounds,
      {
        flowRate: 0.5,
        particleCount: 100,
        biofilmGrowthRate: 0.2,
        gasProductionRate: 5,
        bubbleSize: 0.08,
        flowDirection: new THREE.Vector3(1, 0, 0)
      }
    );
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

function createArchitecturalFacadeModel(
  group: THREE.Group, 
  showLabels: boolean,
  scene: THREE.Scene,
  animationSystem: MESSAnimationSystem | null,
  modelData: any
) {
  // Building facade frame (3m x 2m panel)
  const frameWidth = 6;
  const frameHeight = 4;
  const frameDepth = 0.5;
  
  // Aluminum frame
  const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x9e9e9e,
    metalness: 0.8,
    roughness: 0.3
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  // Glass panels for photobioreactor chambers
  const createPhotobioreactor = (x: number, y: number) => {
    const chamberGroup = new THREE.Group();
    
    // Glass chamber
    const chamberWidth = frameWidth/3 - 0.2;
    const chamberHeight = frameHeight/2 - 0.2;
    const chamberDepth = frameDepth - 0.1;
    
    const glassGeometry = new THREE.BoxGeometry(chamberWidth, chamberHeight, chamberDepth);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.1,
      ior: 1.5
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    chamberGroup.add(glass);
    
    // Algae culture medium
    const cultureGeometry = new THREE.BoxGeometry(
      chamberWidth * 0.9,
      chamberHeight * 0.85,
      chamberDepth * 0.8
    );
    const cultureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2e7d32,
      transparent: true,
      opacity: 0.7,
      transmission: 0.3,
      thickness: 0.5,
      roughness: 0.2,
      emissive: 0x1b5e20,
      emissiveIntensity: 0.05
    });
    const culture = new THREE.Mesh(cultureGeometry, cultureMaterial);
    culture.position.y = -chamberHeight * 0.05;
    chamberGroup.add(culture);
    
    // Anode electrode (carbon felt)
    const anodeGeometry = new THREE.BoxGeometry(
      chamberWidth * 0.85,
      chamberHeight * 0.8,
      0.05
    );
    const anodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x212121,
      roughness: 0.9,
      metalness: 0.1
    });
    const anode = new THREE.Mesh(anodeGeometry, anodeMaterial);
    anode.position.z = -chamberDepth/2 + 0.1;
    chamberGroup.add(anode);
    
    // Cathode (air-cathode with platinum catalyst)
    const cathodeGeometry = new THREE.PlaneGeometry(
      chamberWidth * 0.85,
      chamberHeight * 0.8
    );
    const cathodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
      emissive: 0xe0e0e0,
      emissiveIntensity: 0.02
    });
    const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
    cathode.position.z = chamberDepth/2 - 0.05;
    chamberGroup.add(cathode);
    
    chamberGroup.position.set(x, y, 0);
    return chamberGroup;
  };

  // Create 2x3 grid of photobioreactors
  const reactors: THREE.Group[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = -frameWidth/3 + col * frameWidth/3 + frameWidth/6;
      const y = frameHeight/4 - row * frameHeight/2;
      const reactor = createPhotobioreactor(x, y);
      group.add(reactor);
      reactors.push(reactor);
    }
  }
  modelData.reactors = reactors;

  // CO2 injection system
  const co2Group = new THREE.Group();
  co2Group.position.set(0, -frameHeight/2 - 0.3, 0);
  
  // CO2 manifold
  const manifoldGeometry = new THREE.BoxGeometry(frameWidth * 0.8, 0.1, 0.1);
  const manifoldMaterial = new THREE.MeshStandardMaterial({
    color: 0x757575,
    metalness: 0.7,
    roughness: 0.3
  });
  const manifold = new THREE.Mesh(manifoldGeometry, manifoldMaterial);
  co2Group.add(manifold);
  
  // CO2 inlet pipes
  for (let i = 0; i < 3; i++) {
    const pipeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x616161,
      metalness: 0.8,
      roughness: 0.2
    });
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe.position.set(-frameWidth/3 + i * frameWidth/3 + frameWidth/6, 0.3, 0);
    co2Group.add(pipe);
  }
  
  group.add(co2Group);
  modelData.co2System = co2Group;

  // Light sensors array
  const sensorGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const sensorGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
    const sensorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.3
    });
    const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
    const row = Math.floor(i / 3);
    const col = i % 3;
    sensor.position.set(
      -frameWidth/3 + col * frameWidth/3 + frameWidth/6,
      frameHeight/4 - row * frameHeight/2,
      frameDepth/2 + 0.1
    );
    sensor.rotation.x = Math.PI / 2;
    sensorGroup.add(sensor);
  }
  group.add(sensorGroup);

  // Electrical connections box
  const electricalBoxGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.3);
  const electricalBoxMaterial = new THREE.MeshStandardMaterial({
    color: 0x424242,
    metalness: 0.6,
    roughness: 0.4
  });
  const electricalBox = new THREE.Mesh(electricalBoxGeometry, electricalBoxMaterial);
  electricalBox.position.set(frameWidth/2 + 0.5, 0, 0);
  group.add(electricalBox);

  // Power output display
  const displayGeometry = new THREE.PlaneGeometry(0.6, 0.3);
  const displayMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    emissive: 0x00ff00,
    emissiveIntensity: 0.3
  });
  const display = new THREE.Mesh(displayGeometry, displayMaterial);
  display.position.set(-0.01, 0.1, 0.16);
  electricalBox.add(display);

  // Building integration mount points
  const createMountPoint = (x: number, y: number) => {
    const mountGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 6);
    const mountMaterial = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      metalness: 0.9,
      roughness: 0.1
    });
    const mount = new THREE.Mesh(mountGeometry, mountMaterial);
    mount.position.set(x, y, -frameDepth/2 - 0.1);
    mount.rotation.x = Math.PI / 2;
    return mount;
  };

  group.add(createMountPoint(-frameWidth/2 + 0.3, frameHeight/2 - 0.3));
  group.add(createMountPoint(frameWidth/2 - 0.3, frameHeight/2 - 0.3));
  group.add(createMountPoint(-frameWidth/2 + 0.3, -frameHeight/2 + 0.3));
  group.add(createMountPoint(frameWidth/2 - 0.3, -frameHeight/2 + 0.3));

  // Setup animations
  if (animationSystem) {
    // Store culture media for photosynthesis animation
    modelData.cultureMeshes = reactors.map(r => r.children[1]);
    
    // Sunlight tracking simulation data
    modelData.sunAngle = 0;
    modelData.lightIntensity = 1;
  }
}

function createBenthicFuelCellModel(
  group: THREE.Group, 
  showLabels: boolean,
  scene: THREE.Scene,
  animationSystem: MESSAnimationSystem | null,
  modelData: any
) {
  // Ocean floor environment
  const environmentRadius = 5;
  
  // Sediment layer with texture
  const sedimentGeometry = new THREE.CylinderGeometry(
    environmentRadius, 
    environmentRadius, 
    0.8, 
    64
  );
  const sedimentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5d4037,
    roughness: 0.95,
    metalness: 0.05
  });
  const sediment = new THREE.Mesh(sedimentGeometry, sedimentMaterial);
  sediment.position.set(0, -2, 0);
  sediment.receiveShadow = true;
  group.add(sediment);
  modelData.sediment = sediment;

  // Buried anode array (carbon fiber mat)
  const anodeGroup = new THREE.Group();
  const anodeRadius = 2;
  const anodeSegments = 8;
  
  for (let i = 0; i < anodeSegments; i++) {
    const angle = (i / anodeSegments) * Math.PI * 2;
    const anodeGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const anodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x212121,
      roughness: 0.9,
      metalness: 0.1
    });
    const anode = new THREE.Mesh(anodeGeometry, anodeMaterial);
    anode.position.set(
      Math.cos(angle) * anodeRadius,
      -1.5,
      Math.sin(angle) * anodeRadius
    );
    anode.rotation.y = angle;
    anodeGroup.add(anode);
  }
  group.add(anodeGroup);
  modelData.anodes = anodeGroup;

  // Central housing unit (marine-grade stainless steel)
  const housingGroup = new THREE.Group();
  housingGroup.position.set(0, 0, 0);
  
  // Main housing cylinder
  const housingGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
  const housingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x37474f,
    metalness: 0.8,
    roughness: 0.2
  });
  const housing = new THREE.Mesh(housingGeometry, housingMaterial);
  housing.castShadow = true;
  housingGroup.add(housing);
  
  // Protective cage
  const cageGroup = new THREE.Group();
  const cageBars = 8;
  for (let i = 0; i < cageBars; i++) {
    const angle = (i / cageBars) * Math.PI * 2;
    const barGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x616161,
      metalness: 0.9,
      roughness: 0.1
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(
      Math.cos(angle) * 1,
      0,
      Math.sin(angle) * 1
    );
    cageGroup.add(bar);
  }
  
  // Cage rings
  const ringGeometry = new THREE.TorusGeometry(1, 0.05, 8, cageBars);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x616161,
    metalness: 0.9,
    roughness: 0.1
  });
  const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
  topRing.position.y = 1.2;
  topRing.rotation.x = Math.PI / 2;
  cageGroup.add(topRing);
  
  const bottomRing = topRing.clone();
  bottomRing.position.y = -1.2;
  cageGroup.add(bottomRing);
  
  housingGroup.add(cageGroup);
  group.add(housingGroup);
  modelData.housing = housingGroup;

  // Cathode assembly (floating above sediment)
  const cathodeGroup = new THREE.Group();
  cathodeGroup.position.set(0, 0.5, 0);
  
  // Cathode disk (platinum-coated titanium mesh)
  const cathodeGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
  const cathodeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe0e0e0,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  });
  const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
  cathodeGroup.add(cathode);
  
  // Support struts
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const strutGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8);
    const strutMaterial = new THREE.MeshStandardMaterial({
      color: 0x757575,
      metalness: 0.8,
      roughness: 0.2
    });
    const strut = new THREE.Mesh(strutGeometry, strutMaterial);
    strut.position.set(
      Math.cos(angle) * 0.7,
      -0.75,
      Math.sin(angle) * 0.7
    );
    strut.rotation.z = Math.PI / 8 * (i % 2 === 0 ? 1 : -1);
    cathodeGroup.add(strut);
  }
  
  group.add(cathodeGroup);
  modelData.cathode = cathodeGroup;

  // Data logger buoy
  const buoyGroup = new THREE.Group();
  buoyGroup.position.set(0, 2.5, 0);
  
  // Buoy body
  const buoyGeometry = new THREE.SphereGeometry(0.4, 32, 16);
  const buoyMaterial = new THREE.MeshStandardMaterial({
    color: 0xff9800,
    metalness: 0.3,
    roughness: 0.7
  });
  const buoy = new THREE.Mesh(buoyGeometry, buoyMaterial);
  buoyGroup.add(buoy);
  
  // Antenna
  const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0x424242,
    metalness: 0.8,
    roughness: 0.2
  });
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.y = 0.6;
  buoyGroup.add(antenna);
  
  // Solar panel
  const solarGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.3);
  const solarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    metalness: 0.4,
    roughness: 0.3
  });
  const solar = new THREE.Mesh(solarGeometry, solarMaterial);
  solar.position.y = 0.42;
  buoyGroup.add(solar);
  
  group.add(buoyGroup);
  modelData.buoy = buoyGroup;

  // Connection cables
  const createCable = (start: THREE.Vector3, end: THREE.Vector3) => {
    const path = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.min(start.y, end.y) - 0.3,
        (start.z + end.z) / 2
      ),
      end
    ]);
    const cableGeometry = new THREE.TubeGeometry(path, 32, 0.04, 8, false);
    const cableMaterial = new THREE.MeshStandardMaterial({
      color: 0x424242,
      metalness: 0.3,
      roughness: 0.7
    });
    return new THREE.Mesh(cableGeometry, cableMaterial);
  };

  // Cable from anode to housing
  const anodeCable = createCable(
    new THREE.Vector3(anodeRadius, -1.5, 0),
    new THREE.Vector3(0.8, -1, 0)
  );
  group.add(anodeCable);

  // Cable from housing to buoy
  const buoyCable = createCable(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 2.1, 0)
  );
  group.add(buoyCable);

  // Water column effect
  const waterGeometry = new THREE.CylinderGeometry(
    environmentRadius * 1.2, 
    environmentRadius * 1.2, 
    8, 
    64
  );
  const waterMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x006994,
    transparent: true,
    opacity: 0.2,
    transmission: 0.8,
    thickness: 2,
    roughness: 0.1,
    metalness: 0,
    ior: 1.33
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.set(0, 2, 0);
  group.add(water);
  modelData.water = water;

  // Marine life particles (plankton)
  if (animationSystem) {
    const planktonCount = 50;
    modelData.plankton = [];
    
    for (let i = 0; i < planktonCount; i++) {
      const planktonGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const planktonMaterial = new THREE.MeshBasicMaterial({
        color: 0x90caf9,
        transparent: true,
        opacity: 0.6
      });
      const plankton = new THREE.Mesh(planktonGeometry, planktonMaterial);
      plankton.position.set(
        (Math.random() - 0.5) * environmentRadius * 2,
        -1.5 + Math.random() * 7,
        (Math.random() - 0.5) * environmentRadius * 2
      );
      group.add(plankton);
      modelData.plankton.push(plankton);
    }
    
    // Tidal flow bounds
    modelData.tidalBounds = {
      min: new THREE.Vector3(-environmentRadius, -1.5, -environmentRadius),
      max: new THREE.Vector3(environmentRadius, 6, environmentRadius)
    };
  }
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

// Animation update functions
function updateMicroChipAnimations(
  modelData: any,
  elapsedTime: number,
  deltaTime: number
) {
  // Pulsing glow effect on electrodes
  if (modelData.anode && modelData.cathode) {
    const glowIntensity = 0.1 + Math.sin(elapsedTime * 2) * 0.05;
    if (modelData.anode.material.emissiveIntensity !== undefined) {
      modelData.anode.material.emissiveIntensity = glowIntensity;
    }
    if (modelData.cathode.material.emissiveIntensity !== undefined) {
      modelData.cathode.material.emissiveIntensity = glowIntensity;
    }
  }
  
  // Subtle flow visualization in chambers
  if (modelData.chambers) {
    const flowOffset = Math.sin(elapsedTime * 3) * 0.02;
    if (modelData.chambers.anode) {
      modelData.chambers.anode.position.y = 0.1 + flowOffset;
    }
    if (modelData.chambers.cathode) {
      modelData.chambers.cathode.position.y = 0.1 - flowOffset;
    }
  }
}

function updateBioreactorAnimations(
  modelData: any,
  elapsedTime: number,
  deltaTime: number,
  animationSystem: MESSAnimationSystem
) {
  // Rotate stirrer
  if (modelData.stirrer) {
    modelData.stirrer.rotation.y += deltaTime * 2; // 2 rad/s
  }
  
  // Create gas bubbles from sparger
  if (modelData.bubbleSource && modelData.sparger) {
    animationSystem.createGasBubbles(
      modelData.bubbleSource,
      3, // production rate
      0.05 // bubble size
    );
  }
  
  // Update gas bubbles
  if (modelData.medium) {
    const liquidHeight = modelData.medium.position.y + 1.5;
    animationSystem.updateGasBubbles(deltaTime, liquidHeight);
  }
  
  // Swirling motion in medium
  if (modelData.medium && modelData.medium.material) {
    const swirl = Math.sin(elapsedTime * 0.5) * 0.02;
    modelData.medium.rotation.y += deltaTime * 0.1;
    modelData.medium.scale.x = 0.95 + swirl;
    modelData.medium.scale.z = 0.95 - swirl;
  }
}

function updateWastewaterAnimations(
  modelData: any,
  elapsedTime: number,
  deltaTime: number,
  animationSystem: MESSAnimationSystem
) {
  // Update flow field
  if (modelData.flowBounds) {
    animationSystem.updateFlow(deltaTime, modelData.flowBounds);
  }
  
  // Create aeration bubbles
  if (modelData.bubbleSource && modelData.aerationPipe) {
    // Create bubbles along the ring
    const bubbleAngle = elapsedTime * 2;
    const bubblePos = new THREE.Vector3(
      Math.cos(bubbleAngle) * 3.2,
      modelData.bubbleSource.y,
      Math.sin(bubbleAngle) * 3.2
    );
    animationSystem.createGasBubbles(bubblePos, 2, 0.08);
  }
  
  // Update bubbles
  if (modelData.liquid) {
    const liquidTop = modelData.liquid.position.y + 1.2;
    animationSystem.updateGasBubbles(deltaTime, liquidTop);
  }
  
  // Subtle liquid surface movement
  if (modelData.liquid && modelData.liquid.material) {
    const ripple = Math.sin(elapsedTime * 1.5) * 0.01;
    modelData.liquid.material.opacity = 0.6 + ripple;
  }
  
  // Clarifier rotation
  if (modelData.clarifier) {
    modelData.clarifier.rotation.y += deltaTime * 0.05;
  }
}

function updateFacadeAnimations(
  modelData: any,
  elapsedTime: number,
  deltaTime: number,
  animationSystem: MESSAnimationSystem
) {
  // Simulate diurnal light cycle
  const dayProgress = (elapsedTime * 0.1) % 1; // Full day cycle
  const sunAngle = dayProgress * Math.PI;
  const lightIntensity = Math.max(0, Math.sin(sunAngle));
  
  modelData.sunAngle = sunAngle;
  modelData.lightIntensity = lightIntensity;
  
  // Update algae culture color based on light
  if (modelData.cultureMeshes) {
    modelData.cultureMeshes.forEach((culture: THREE.Mesh) => {
      if (culture.material && culture.material instanceof THREE.MeshPhysicalMaterial) {
        // Photosynthesis effect - brighter green in light
        const baseColor = new THREE.Color(0x2e7d32);
        const lightColor = new THREE.Color(0x4caf50);
        culture.material.color.lerpColors(baseColor, lightColor, lightIntensity);
        culture.material.emissiveIntensity = 0.05 * lightIntensity;
      }
    });
  }
  
  // CO2 bubble effect (only during daylight)
  if (modelData.co2System && lightIntensity > 0.1) {
    const bubbleRate = lightIntensity * 0.5;
    if (Math.random() < bubbleRate * deltaTime) {
      const co2Pos = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        -1.5,
        0
      );
      animationSystem.createGasBubbles(co2Pos, 1, 0.03);
    }
  }
  
  // Update any existing bubbles
  animationSystem.updateGasBubbles(deltaTime, 2);
  
  // Subtle growth animation
  if (modelData.reactors) {
    modelData.reactors.forEach((reactor: THREE.Group, index: number) => {
      const growthPhase = Math.sin(elapsedTime * 0.2 + index * 0.5) * 0.01;
      reactor.scale.setScalar(1 + growthPhase);
    });
  }
}

function updateBenthicAnimations(
  modelData: any,
  elapsedTime: number,
  deltaTime: number,
  animationSystem: MESSAnimationSystem
) {
  // Tidal flow simulation
  if (modelData.tidalBounds) {
    const tidalFlow = MESSAnimationUtils.createTidalFlow(
      modelData.tidalBounds,
      elapsedTime,
      0.5 // amplitude
    );
    
    // Update flow direction for particles
    animationSystem.updateFlow(deltaTime, modelData.tidalBounds);
  }
  
  // Buoy bobbing
  if (modelData.buoy) {
    const bobAmount = Math.sin(elapsedTime * 1.5) * 0.1;
    const swayAmount = Math.cos(elapsedTime * 1.2) * 0.05;
    modelData.buoy.position.y = 2.5 + bobAmount;
    modelData.buoy.position.x = swayAmount;
    modelData.buoy.rotation.z = swayAmount * 0.2;
  }
  
  // Plankton movement
  if (modelData.plankton) {
    modelData.plankton.forEach((plankton: THREE.Mesh, index: number) => {
      const driftSpeed = 0.1;
      const verticalDrift = Math.sin(elapsedTime * 0.5 + index) * 0.5;
      
      plankton.position.x += Math.sin(elapsedTime * 0.3 + index) * driftSpeed * deltaTime;
      plankton.position.y += verticalDrift * deltaTime;
      plankton.position.z += Math.cos(elapsedTime * 0.4 + index) * driftSpeed * deltaTime;
      
      // Wrap around environment
      if (plankton.position.x > 5) plankton.position.x = -5;
      if (plankton.position.x < -5) plankton.position.x = 5;
      if (plankton.position.z > 5) plankton.position.z = -5;
      if (plankton.position.z < -5) plankton.position.z = 5;
      if (plankton.position.y > 6) plankton.position.y = -1.5;
      if (plankton.position.y < -1.5) plankton.position.y = 6;
    });
  }
  
  // Sediment particle effect
  if (modelData.sediment && Math.random() < 0.02) {
    const particlePos = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      -1.6,
      (Math.random() - 0.5) * 8
    );
    // Could add sediment particles here if needed
  }
  
  // Water caustics effect (simulated with opacity)
  if (modelData.water && modelData.water.material) {
    const causticPattern = Math.sin(elapsedTime * 2) * 0.05;
    modelData.water.material.opacity = 0.2 + causticPattern;
  }
}