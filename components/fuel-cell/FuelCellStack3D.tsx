'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { motion } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'
import { type FuelCellPredictionResult } from '@/lib/fuel-cell-predictions'

// ============================================================================
// INTERFACES
// ============================================================================

interface FuelCellStack3DProps {
  fuelCellType: FuelCellType
  cellCount: number
  activeArea: number
  prediction?: FuelCellPredictionResult | null
  showGasFlow?: boolean
  showTemperature?: boolean
  showControls?: boolean
  className?: string
}

interface StackConfiguration {
  cellSpacing: number
  stackHeight: number
  cellThickness: number
  manifoldSize: number
  colors: {
    anode: number
    cathode: number
    membrane: number
    bipolarPlate: number
    manifold: number
  }
}

// ============================================================================
// FUEL CELL STACK 3D VISUALIZATION
// ============================================================================

export default function FuelCellStack3D({
  fuelCellType,
  cellCount,
  activeArea,
  prediction,
  showGasFlow = true,
  showTemperature = false,
  showControls = true,
  className = ''
}: FuelCellStack3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const stackGroupRef = useRef<THREE.Group | null>(null)
  const gasFlowRef = useRef<THREE.Group | null>(null)
  
  const [controlsVisible, setControlsVisible] = useState(showControls)

  // Stack configuration based on fuel cell type
  const getStackConfig = (type: FuelCellType): StackConfiguration => {
    const configs: Record<FuelCellType, StackConfiguration> = {
      PEM: {
        cellSpacing: 0.02,
        stackHeight: cellCount * 0.02,
        cellThickness: 0.015,
        manifoldSize: 0.3,
        colors: {
          anode: 0x444444,    // Dark gray
          cathode: 0x666666,  // Gray
          membrane: 0x4fc3f7, // Light blue
          bipolarPlate: 0x333333, // Very dark gray
          manifold: 0x2196f3  // Blue
        }
      },
      SOFC: {
        cellSpacing: 0.025,
        stackHeight: cellCount * 0.025,
        cellThickness: 0.02,
        manifoldSize: 0.4,
        colors: {
          anode: 0x795548,    // Brown
          cathode: 0x8d6e63,  // Light brown
          membrane: 0xffc107, // Amber (ceramic)
          bipolarPlate: 0x424242, // Dark gray
          manifold: 0xff5722  // Deep orange
        }
      },
      PAFC: {
        cellSpacing: 0.03,
        stackHeight: cellCount * 0.03,
        cellThickness: 0.025,
        manifoldSize: 0.35,
        colors: {
          anode: 0x37474f,    // Blue gray
          cathode: 0x546e7a,  // Light blue gray
          membrane: 0x009688, // Teal (phosphoric acid)
          bipolarPlate: 0x263238, // Very dark blue gray
          manifold: 0x00bcd4  // Cyan
        }
      },
      MCFC: {
        cellSpacing: 0.035,
        stackHeight: cellCount * 0.035,
        cellThickness: 0.03,
        manifoldSize: 0.45,
        colors: {
          anode: 0x5d4037,    // Brown
          cathode: 0x6d4c41,  // Light brown
          membrane: 0xe65100, // Deep orange (molten carbonate)
          bipolarPlate: 0x3e2723, // Very dark brown
          manifold: 0xff9800  // Orange
        }
      },
      AFC: {
        cellSpacing: 0.018,
        stackHeight: cellCount * 0.018,
        cellThickness: 0.012,
        manifoldSize: 0.25,
        colors: {
          anode: 0x455a64,    // Blue gray
          cathode: 0x607d8b,  // Light blue gray
          membrane: 0x03a9f4, // Light blue (alkaline)
          bipolarPlate: 0x37474f, // Dark blue gray
          manifold: 0x00e676  // Green
        }
      }
    }
    return configs[type]
  }

  useEffect(() => {
    if (!containerRef.current) return

    const config = getStackConfig(fuelCellType)

    // Initialize scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    scene.fog = new THREE.Fog(0x1a1a1a, 5, 15)
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      100
    )
    camera.position.set(2, 1.5, 2)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 10
    controls.minDistance = 0.5
    controls.enablePan = true
    controls.target.set(0, config.stackHeight / 2, 0)
    controlsRef.current = controls

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(3, 3, 2)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.3)
    pointLight1.position.set(-2, 2, 1)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff5722, 0.3)
    pointLight2.position.set(2, 2, -1)
    scene.add(pointLight2)

    // Create fuel cell stack
    const stackGroup = createFuelCellStack(config, cellCount, activeArea, prediction)
    stackGroupRef.current = stackGroup
    scene.add(stackGroup)

    // Create gas flow visualization
    if (showGasFlow) {
      const gasFlowGroup = createGasFlowVisualization(config, prediction)
      gasFlowRef.current = gasFlowGroup
      scene.add(gasFlowGroup)
    }

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Animate gas flow particles
      if (gasFlowRef.current && showGasFlow) {
        animateGasFlow(gasFlowRef.current)
      }
      
      // Animate temperature effects
      if (showTemperature && prediction) {
        animateTemperatureEffects(stackGroupRef.current, prediction)
      }
      
      if (controls) {
        controls.update()
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (controls) {
        controls.dispose()
      }
      
      if (renderer) {
        renderer.dispose()
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
      
      // Dispose of geometries and materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
    }
  }, [fuelCellType, cellCount, activeArea, prediction, showGasFlow, showTemperature])

  return (
    <div className={`relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      {/* Controls overlay */}
      {controlsVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm space-y-1 max-w-xs"
        >
          <div className="font-semibold mb-2">{fuelCellType} Fuel Cell Stack</div>
          <div>🖱️ Click & drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>📊 {cellCount} cells, {activeArea} cm² each</div>
          {prediction && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div>⚡ {prediction.predictedPower.toFixed(1)}W</div>
              <div>🔋 {prediction.efficiency.toFixed(1)}% efficient</div>
              <div>🌡️ {prediction.operatingPoint.temperature}°C</div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Toggle controls button */}
      <button
        onClick={() => setControlsVisible(!controlsVisible)}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-xs space-y-1">
        <div className="font-semibold mb-2">Components</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-600"></div>
          <span>Anode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-400"></div>
          <span>Cathode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400"></div>
          <span>Membrane</span>
        </div>
        {showGasFlow && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span>H₂ Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-300"></div>
              <span>Air Flow</span>
            </div>
          </>
        )}
      </div>
      
      {/* Performance indicators */}
      {prediction && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-xs space-y-1">
          <div className="font-semibold mb-2">Performance</div>
          <div>Power: {prediction.predictedPower.toFixed(1)} W</div>
          <div>Voltage: {prediction.voltage.toFixed(1)} V</div>
          <div>Current: {prediction.current.toFixed(1)} A</div>
          <div>Efficiency: {prediction.efficiency.toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 3D MODEL CREATION FUNCTIONS
// ============================================================================

function createFuelCellStack(
  config: StackConfiguration, 
  cellCount: number, 
  activeArea: number,
  prediction?: FuelCellPredictionResult | null
): THREE.Group {
  const stackGroup = new THREE.Group()
  
  // Calculate cell dimensions from active area (assuming square cells)
  const cellSize = Math.sqrt(activeArea) / 100 // Convert cm² to m for scaling
  
  for (let i = 0; i < cellCount; i++) {
    const cellGroup = new THREE.Group()
    const yPosition = i * config.cellSpacing
    
    // Create cell components
    createSingleCell(cellGroup, config, cellSize, prediction)
    
    cellGroup.position.y = yPosition
    stackGroup.add(cellGroup)
  }
  
  // Add end plates
  createEndPlates(stackGroup, config, cellSize, cellCount)
  
  // Add manifolds for gas distribution
  createManifolds(stackGroup, config, cellSize, cellCount)
  
  // Add tie rods for structural integrity
  createTieRods(stackGroup, config, cellSize, cellCount)
  
  return stackGroup
}

function createSingleCell(
  cellGroup: THREE.Group, 
  config: StackConfiguration, 
  cellSize: number,
  prediction?: FuelCellPredictionResult | null
): void {
  const thickness = config.cellThickness
  
  // Anode
  const anodeGeometry = new THREE.BoxGeometry(cellSize, thickness * 0.3, cellSize)
  const anodeMaterial = new THREE.MeshStandardMaterial({ 
    color: config.colors.anode,
    roughness: 0.8,
    metalness: 0.3
  })
  const anode = new THREE.Mesh(anodeGeometry, anodeMaterial)
  anode.position.set(0, -thickness * 0.35, 0)
  cellGroup.add(anode)
  
  // Membrane/Electrolyte
  const membraneGeometry = new THREE.BoxGeometry(cellSize * 0.98, thickness * 0.1, cellSize * 0.98)
  const membraneMaterial = new THREE.MeshStandardMaterial({ 
    color: config.colors.membrane,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.1
  })
  const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial)
  membrane.position.set(0, 0, 0)
  cellGroup.add(membrane)
  
  // Cathode
  const cathodeGeometry = new THREE.BoxGeometry(cellSize, thickness * 0.3, cellSize)
  const cathodeMaterial = new THREE.MeshStandardMaterial({ 
    color: config.colors.cathode,
    roughness: 0.8,
    metalness: 0.3
  })
  const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial)
  cathode.position.set(0, thickness * 0.35, 0)
  cellGroup.add(cathode)
  
  // Bipolar plate (if not end cell)
  const bipolarGeometry = new THREE.BoxGeometry(cellSize * 1.1, thickness * 0.2, cellSize * 1.1)
  const bipolarMaterial = new THREE.MeshStandardMaterial({ 
    color: config.colors.bipolarPlate,
    roughness: 0.3,
    metalness: 0.8
  })
  const bipolarPlate = new THREE.Mesh(bipolarGeometry, bipolarMaterial)
  bipolarPlate.position.set(0, thickness * 0.6, 0)
  cellGroup.add(bipolarPlate)
}

function createEndPlates(
  stackGroup: THREE.Group, 
  config: StackConfiguration, 
  cellSize: number, 
  cellCount: number
): void {
  const plateThickness = 0.05
  const plateSize = cellSize * 1.2
  
  // Bottom end plate
  const bottomPlateGeometry = new THREE.BoxGeometry(plateSize, plateThickness, plateSize)
  const plateColor = config.colors.bipolarPlate
  const bottomPlateMaterial = new THREE.MeshStandardMaterial({ 
    color: plateColor,
    roughness: 0.3,
    metalness: 0.9
  })
  const bottomPlate = new THREE.Mesh(bottomPlateGeometry, bottomPlateMaterial)
  bottomPlate.position.set(0, -plateThickness / 2, 0)
  stackGroup.add(bottomPlate)
  
  // Top end plate
  const topPlate = bottomPlate.clone()
  topPlate.position.set(0, config.stackHeight + plateThickness / 2, 0)
  stackGroup.add(topPlate)
}

function createManifolds(
  stackGroup: THREE.Group, 
  config: StackConfiguration, 
  cellSize: number, 
  cellCount: number
): void {
  const manifoldRadius = config.manifoldSize / 10
  const manifoldHeight = config.stackHeight * 1.1
  
  // Fuel manifolds (hydrogen inlet/outlet)
  const fuelManifoldGeometry = new THREE.CylinderGeometry(manifoldRadius, manifoldRadius, manifoldHeight)
  const fuelManifoldMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff4444,
    roughness: 0.2,
    metalness: 0.8
  })
  
  const fuelInletManifold = new THREE.Mesh(fuelManifoldGeometry, fuelManifoldMaterial)
  fuelInletManifold.position.set(-cellSize * 0.7, manifoldHeight / 2, -cellSize * 0.7)
  stackGroup.add(fuelInletManifold)
  
  const fuelOutletManifold = new THREE.Mesh(fuelManifoldGeometry, fuelManifoldMaterial)
  fuelOutletManifold.position.set(-cellSize * 0.7, manifoldHeight / 2, cellSize * 0.7)
  stackGroup.add(fuelOutletManifold)
  
  // Air manifolds (oxidant inlet/outlet)
  const airManifoldMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4444ff,
    roughness: 0.2,
    metalness: 0.8
  })
  
  const airInletManifold = new THREE.Mesh(fuelManifoldGeometry, airManifoldMaterial)
  airInletManifold.position.set(cellSize * 0.7, manifoldHeight / 2, -cellSize * 0.7)
  stackGroup.add(airInletManifold)
  
  const airOutletManifold = new THREE.Mesh(fuelManifoldGeometry, airManifoldMaterial)
  airOutletManifold.position.set(cellSize * 0.7, manifoldHeight / 2, cellSize * 0.7)
  stackGroup.add(airOutletManifold)
}

function createTieRods(
  stackGroup: THREE.Group, 
  config: StackConfiguration, 
  cellSize: number, 
  cellCount: number
): void {
  const rodRadius = 0.01
  const rodHeight = config.stackHeight * 1.2
  const rodOffset = cellSize * 0.8
  
  const rodGeometry = new THREE.CylinderGeometry(rodRadius, rodRadius, rodHeight)
  const rodMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    roughness: 0.3,
    metalness: 0.9
  })
  
  // Four corner tie rods
  const positions = [
    [-rodOffset, rodHeight / 2, -rodOffset],
    [rodOffset, rodHeight / 2, -rodOffset],
    [-rodOffset, rodHeight / 2, rodOffset],
    [rodOffset, rodHeight / 2, rodOffset]
  ]
  
  positions.forEach(pos => {
    const rod = new THREE.Mesh(rodGeometry, rodMaterial)
    rod.position.set(pos[0], pos[1], pos[2])
    stackGroup.add(rod)
  })
}

function createGasFlowVisualization(
  config: StackConfiguration,
  prediction?: FuelCellPredictionResult | null
): THREE.Group {
  const gasFlowGroup = new THREE.Group()
  
  // Create hydrogen flow particles
  const hydrogenParticles = createFlowParticles(0xff4444, 50, 'hydrogen')
  gasFlowGroup.add(hydrogenParticles)
  
  // Create air flow particles
  const airParticles = createFlowParticles(0x4444ff, 30, 'air')
  gasFlowGroup.add(airParticles)
  
  return gasFlowGroup
}

function createFlowParticles(color: number, count: number, flowType: string): THREE.Points {
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    
    // Initial positions
    positions[i3] = (Math.random() - 0.5) * 2
    positions[i3 + 1] = Math.random() * 2
    positions[i3 + 2] = (Math.random() - 0.5) * 2
    
    // Initial velocities
    velocities[i3] = (Math.random() - 0.5) * 0.01
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.01
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.userData = { velocities, flowType }
  
  const material = new THREE.PointsMaterial({
    color,
    size: 0.01,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })
  
  return new THREE.Points(geometry, material)
}

function animateGasFlow(gasFlowGroup: THREE.Group): void {
  gasFlowGroup.children.forEach(child => {
    if (child instanceof THREE.Points) {
      const positions = child.geometry.attributes.position.array as Float32Array
      const velocities = child.geometry.userData.velocities as Float32Array
      const flowType = child.geometry.userData.flowType as string
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update positions
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]
        
        // Reset particles that go out of bounds
        if (Math.abs(positions[i]) > 2 || Math.abs(positions[i + 2]) > 2 || positions[i + 1] > 3) {
          positions[i] = (Math.random() - 0.5) * 2
          positions[i + 1] = -0.5
          positions[i + 2] = (Math.random() - 0.5) * 2
        }
      }
      
      child.geometry.attributes.position.needsUpdate = true
    }
  })
}

function animateTemperatureEffects(
  stackGroup: THREE.Group | null,
  prediction: FuelCellPredictionResult
): void {
  if (!stackGroup) return
  
  const temperature = prediction.operatingPoint.temperature
  const normalizedTemp = Math.min(temperature / 100, 1) // Normalize to 0-1
  
  // Add heat haze effect or color changes based on temperature
  stackGroup.children.forEach(child => {
    if (child instanceof THREE.Group) {
      child.children.forEach(component => {
        if (component instanceof THREE.Mesh && component.material instanceof THREE.MeshStandardMaterial) {
          // Subtle temperature-based color shifting
          const baseColor = component.material.color.clone()
          const heatTint = new THREE.Color(1, 0.5, 0).multiplyScalar(normalizedTemp * 0.2)
          component.material.color = baseColor.clone().add(heatTint)
        }
      })
    }
  })
}