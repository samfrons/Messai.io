'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion } from 'framer-motion';

interface ExperimentData {
  id: string;
  name: string;
  designName: string;
  status: string;
  lastPower: number;
  parameters: {
    temperature: number;
    ph: number;
    substrateConcentration: number;
  };
}

interface VanillaDashboard3DProps {
  experiments: ExperimentData[];
  selectedExperiment?: string | null;
  onExperimentSelect?: (id: string) => void;
}

export function VanillaDashboard3D({ 
  experiments, 
  selectedExperiment, 
  onExperimentSelect 
}: VanillaDashboard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const mfcMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x202020, 10, 40);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(5, 8, 5);
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
    controls.maxDistance = 20;
    controls.minDistance = 5;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = 0.3;
    spotLight.penumbra = 1;
    scene.add(spotLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(hemisphereLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x666666);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Create MFC models
    createMFCModels(scene, experiments, selectedExperiment || null, mfcMeshesRef);

    // Add click handling for experiment selection
    if (onExperimentSelect) {
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
          let current = intersects[0].object;
          while (current.parent && !current.userData.experimentId) {
            current = current.parent;
          }
          if (current.userData.experimentId) {
            onExperimentSelect(current.userData.experimentId);
          }
        }
      };

      renderer.domElement.addEventListener('click', handleClick);
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
      
      // Rotate MFC models
      mfcMeshesRef.current.forEach((group) => {
        group.rotation.y += 0.01;
      });
      
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
  }, [experiments, selectedExperiment, onExperimentSelect]);

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      {/* Controls overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm space-y-1"
      >
        <div>🖱️ Click & drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>🎯 Click MFC to select</div>
      </motion.div>
      
      {/* Toggle controls button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-xs space-y-1">
        <div className="font-semibold mb-2">Status Indicators</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Running</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>Setup</span>
        </div>
      </div>
      
      {/* Power scale */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-xs space-y-1">
        <div className="font-semibold mb-2">Power Output</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>&gt;400 mW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>250-400 mW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span>&lt;250 mW</span>
        </div>
      </div>
    </div>
  );
}

function createMFCModels(
  scene: THREE.Scene,
  experiments: ExperimentData[],
  selectedExperiment: string | null,
  mfcMeshesRef: React.MutableRefObject<Map<string, THREE.Group>>
) {
  // Clear existing meshes
  mfcMeshesRef.current.forEach(group => {
    scene.remove(group);
  });
  mfcMeshesRef.current.clear();

  // Calculate positions
  const rows = Math.ceil(Math.sqrt(experiments.length));
  const cols = Math.ceil(experiments.length / rows);

  experiments.forEach((experiment, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = (col - cols / 2) * 2.5;
    const z = (row - rows / 2) * 2.5;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Create MFC chamber
    const chamberGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
    const chamberMaterial = new THREE.MeshStandardMaterial({
      color: selectedExperiment === experiment.id ? 0x61dafb : 0x87ceeb,
      transparent: true,
      opacity: 0.6,
      emissive: selectedExperiment === experiment.id ? 0x1e90ff : 0x000000,
      emissiveIntensity: selectedExperiment === experiment.id ? 0.2 : 0
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    group.add(chamber);

    // Create anode
    const anodeGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.6);
    const anodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      emissive: getPowerColor(experiment.lastPower),
      emissiveIntensity: getStatusEmission(experiment.status)
    });
    const anode = new THREE.Mesh(anodeGeometry, anodeMaterial);
    anode.position.set(-0.3, 0, 0);
    group.add(anode);

    // Create cathode
    const cathodeGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.6);
    const cathodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      emissive: 0x4ecdc4,
      emissiveIntensity: getStatusEmission(experiment.status) * 0.7
    });
    const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial);
    cathode.position.set(0.3, 0, 0);
    group.add(cathode);

    // Status indicator
    const statusGeometry = new THREE.SphereGeometry(0.05);
    const statusMaterial = new THREE.MeshStandardMaterial({
      color: getStatusColor(experiment.status),
      emissive: getStatusColor(experiment.status),
      emissiveIntensity: 0.5
    });
    const statusIndicator = new THREE.Mesh(statusGeometry, statusMaterial);
    statusIndicator.position.set(0.4, 0.4, 0);
    group.add(statusIndicator);

    // Store reference
    group.userData = { experimentId: experiment.id };
    mfcMeshesRef.current.set(experiment.id, group);
    scene.add(group);
  });

}

function getPowerColor(power: number): number {
  if (power > 400) return 0x00ff00; // Green
  if (power > 250) return 0xffff00; // Yellow
  return 0xff6600; // Orange
}

function getStatusEmission(status: string): number {
  switch (status) {
    case 'running': return 0.3;
    case 'completed': return 0.1;
    default: return 0.05;
  }
}

function getStatusColor(status: string): number {
  switch (status) {
    case 'running': return 0x00ff00;
    case 'completed': return 0x0066ff;
    default: return 0xffaa00;
  }
}