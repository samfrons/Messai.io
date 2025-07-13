'use client'

import { useRef, useMemo, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'
import { FuelCellType } from '@/lib/types/fuel-cell-types'
import { memoizeComponent, deepPropsComparison } from '@/lib/performance-optimization'

// ============================================================================
// OPTIMIZED INTERFACES
// ============================================================================

interface FuelCellStack3DProps {
  fuelCellType: FuelCellType
  cellCount: number
  activeArea: number
  prediction?: any
  showGasFlow?: boolean
  showTemperature?: boolean
  showControls?: boolean
  className?: string
}

// ============================================================================
// MEMOIZED CELL COMPONENT
// ============================================================================

const FuelCell = memo(({ 
  position, 
  cellType, 
  temperature = 80,
  showTemperature = false 
}: {
  position: [number, number, number]
  cellType: FuelCellType
  temperature?: number
  showTemperature?: boolean
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Cell dimensions based on type
  const dimensions = useMemo(() => {
    switch (cellType) {
      case 'SOFC':
        return { width: 10, height: 10, depth: 0.3 }
      case 'MCFC':
        return { width: 12, height: 12, depth: 0.5 }
      default:
        return { width: 8, height: 8, depth: 0.2 }
    }
  }, [cellType])

  // Temperature-based color
  const color = useMemo(() => {
    if (!showTemperature) return '#4a5568'
    
    const normalized = Math.min(Math.max((temperature - 20) / 80, 0), 1)
    const r = Math.floor(normalized * 255)
    const b = Math.floor((1 - normalized) * 255)
    return `rgb(${r}, 100, ${b})`
  }, [temperature, showTemperature])

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
    </mesh>
  )
}, (prevProps, nextProps) => {
  return prevProps.position[0] === nextProps.position[0] &&
         prevProps.position[1] === nextProps.position[1] &&
         prevProps.position[2] === nextProps.position[2] &&
         prevProps.cellType === nextProps.cellType &&
         prevProps.temperature === nextProps.temperature &&
         prevProps.showTemperature === nextProps.showTemperature
})

// ============================================================================
// OPTIMIZED GAS FLOW PARTICLES
// ============================================================================

const GasFlowParticles = memo(({ count = 50, flowRate = 5 }: { count?: number; flowRate?: number }) => {
  const particlesRef = useRef<THREE.Points>(null)
  
  // Initialize particle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20 // x
      pos[i * 3 + 1] = Math.random() * 15 - 7.5 // y  
      pos[i * 3 + 2] = -10 // z start position
    }
    return pos
  }, [count])

  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return
    
    const positionAttribute = particlesRef.current.geometry.attributes.position
    const positions = positionAttribute.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      // Move particles forward
      positions[i * 3 + 2] += flowRate * delta * 10
      
      // Reset particles that have moved too far
      if (positions[i * 3 + 2] > 10) {
        positions[i * 3 + 2] = -10
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = Math.random() * 15 - 7.5
      }
    }
    
    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
})

// ============================================================================
// OPTIMIZED MAIN COMPONENT
// ============================================================================

const FuelCellStack3DOptimized = memoizeComponent<FuelCellStack3DProps>(({
  fuelCellType,
  cellCount,
  activeArea,
  prediction,
  showGasFlow = false,
  showTemperature = false,
  showControls = true,
  className = ''
}) => {
  // Calculate stack layout
  const stackLayout = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(cellCount))
    const rows = Math.ceil(cellCount / cols)
    const spacing = 1.5
    
    const cells: Array<{ position: [number, number, number]; index: number }> = []
    let index = 0
    
    for (let row = 0; row < rows && index < cellCount; row++) {
      for (let col = 0; col < cols && index < cellCount; col++) {
        cells.push({
          position: [
            (col - cols / 2) * (8 + spacing),
            0,
            (row - rows / 2) * (0.2 + spacing)
          ],
          index: index++
        })
      }
    }
    
    return cells
  }, [cellCount])

  // Calculate camera position based on stack size
  const cameraPosition = useMemo((): [number, number, number] => {
    const stackSize = Math.max(Math.sqrt(cellCount) * 10, 20)
    return [stackSize * 0.8, stackSize * 0.6, stackSize]
  }, [cellCount])

  return (
    <div className={`w-full h-full bg-gray-900 rounded-lg ${className}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Fuel cell stack */}
        <group>
          {stackLayout.map((cell) => (
            <FuelCell
              key={cell.index}
              position={cell.position}
              cellType={fuelCellType}
              temperature={prediction?.operatingPoint?.temperature || 80}
              showTemperature={showTemperature}
            />
          ))}
        </group>
        
        {/* Gas flow visualization */}
        {showGasFlow && (
          <GasFlowParticles 
            count={Math.min(cellCount * 2, 100)} 
            flowRate={prediction?.fuelFlowRate || 5}
          />
        )}
        
        {/* Labels */}
        <Text
          position={[0, -10, 0]}
          fontSize={1.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {fuelCellType} Stack - {cellCount} cells
        </Text>
        
        {prediction && (
          <Text
            position={[0, -12, 0]}
            fontSize={1}
            color="#60a5fa"
            anchorX="center"
            anchorY="middle"
          >
            {prediction.predictedPower.toFixed(1)} W @ {prediction.efficiency.toFixed(1)}%
          </Text>
        )}
        
        {/* Controls */}
        {showControls && <OrbitControls enablePan enableZoom enableRotate />}
      </Canvas>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return deepPropsComparison(prevProps, nextProps, [
    'fuelCellType',
    'cellCount',
    'activeArea',
    'showGasFlow',
    'showTemperature',
    'showControls'
  ]) && 
  prevProps.prediction?.predictedPower === nextProps.prediction?.predictedPower &&
  prevProps.prediction?.efficiency === nextProps.prediction?.efficiency
})

export default FuelCellStack3DOptimized