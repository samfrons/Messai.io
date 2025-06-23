'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Cylinder, Sphere } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface ExperimentData {
  id: string
  name: string
  designName: string
  status: string
  lastPower: number
  parameters: {
    temperature: number
    ph: number
    substrateConcentration: number
  }
}

interface MFCDashboard3DProps {
  experiments: ExperimentData[]
  selectedExperiment?: string
  onExperimentSelect?: (id: string) => void
}

function AnimatedMFC({ 
  experiment, 
  position, 
  isSelected, 
  onClick 
}: { 
  experiment: ExperimentData
  position: [number, number, number]
  isSelected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  const getPowerColor = (power: number) => {
    if (power > 400) return '#00ff00' // Green for high power
    if (power > 250) return '#ffff00' // Yellow for medium power
    return '#ff6600' // Orange for lower power
  }

  const getStatusEmission = (status: string) => {
    switch (status) {
      case 'running': return 0.3
      case 'completed': return 0.1
      default: return 0.05
    }
  }

  return (
    <group 
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
    >
      {/* MFC Chamber */}
      <Box args={[1, 0.6, 0.8]}>
        <meshStandardMaterial 
          color={isSelected ? '#61dafb' : '#87ceeb'}
          transparent
          opacity={0.6}
          emissive={isSelected ? '#1e90ff' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </Box>
      
      {/* Anode */}
      <Box args={[0.5, 0.05, 0.6]} position={[-0.3, 0, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a"
          emissive={getPowerColor(experiment.lastPower)}
          emissiveIntensity={getStatusEmission(experiment.status)}
        />
      </Box>
      
      {/* Cathode */}
      <Box args={[0.5, 0.05, 0.6]} position={[0.3, 0, 0]}>
        <meshStandardMaterial 
          color="#666666"
          emissive="#4ecdc4"
          emissiveIntensity={getStatusEmission(experiment.status) * 0.7}
        />
      </Box>
      
      {/* Power indicator particles */}
      {experiment.status === 'running' && Array.from({ length: 5 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02]}
          position={[
            -0.3 + (i * 0.15),
            0.2 + Math.sin(Date.now() * 0.01 + i) * 0.05,
            0
          ]}
        >
          <meshStandardMaterial 
            color={getPowerColor(experiment.lastPower)}
            emissive={getPowerColor(experiment.lastPower)}
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}
      
      {/* Labels */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.12}
        color={isSelected ? '#ffffff' : '#333333'}
        anchorX="center"
        anchorY="middle"
      >
        {experiment.name}
      </Text>
      
      <Text
        position={[0, -0.95, 0]}
        fontSize={0.08}
        color={getPowerColor(experiment.lastPower)}
        anchorX="center"
        anchorY="middle"
      >
        {experiment.lastPower.toFixed(1)} mW
      </Text>
      
      {/* Status indicator */}
      <Sphere
        args={[0.05]}
        position={[0.4, 0.4, 0]}
      >
        <meshStandardMaterial 
          color={experiment.status === 'running' ? '#00ff00' : experiment.status === 'completed' ? '#0066ff' : '#ffaa00'}
          emissive={experiment.status === 'running' ? '#00ff00' : experiment.status === 'completed' ? '#0066ff' : '#ffaa00'}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  )
}

function Dashboard3DScene({ experiments, selectedExperiment, onExperimentSelect }: MFCDashboard3DProps) {
  const arrangeExperiments = () => {
    const positions: [number, number, number][] = []
    const rows = Math.ceil(Math.sqrt(experiments.length))
    const cols = Math.ceil(experiments.length / rows)
    
    experiments.forEach((_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = (col - cols / 2) * 2.5
      const z = (row - rows / 2) * 2.5
      positions.push([x, 0, z])
    })
    
    return positions
  }

  const positions = arrangeExperiments()

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} />
      
      {experiments.map((experiment, index) => (
        <AnimatedMFC
          key={experiment.id}
          experiment={experiment}
          position={positions[index]}
          isSelected={selectedExperiment === experiment.id}
          onClick={() => onExperimentSelect?.(experiment.id)}
        />
      ))}
      
      {/* Grid floor */}
      <gridHelper args={[20, 20, '#333333', '#666666']} position={[0, -1, 0]} />
      
      <Environment preset="studio" />
    </>
  )
}

export default function MFCDashboard3D({ experiments, selectedExperiment, onExperimentSelect }: MFCDashboard3DProps) {
  const [showControls, setShowControls] = useState(true)

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 8, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Dashboard3DScene 
          experiments={experiments}
          selectedExperiment={selectedExperiment}
          onExperimentSelect={onExperimentSelect}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>
      
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
  )
}