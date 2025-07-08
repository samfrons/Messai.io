'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SimpleVisualizationProps {
  bioreactorType: string
  parameters: {
    temperature: number
    ph: number
    mixingSpeed: number
    electrodeVoltage: number
  }
}

export function SimpleVisualization({ bioreactorType, parameters }: SimpleVisualizationProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Simple rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * parameters.mixingSpeed * 0.01
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.5
    }
  })

  // Generate simple particle positions
  const particleCount = 100
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const radius = Math.random() * 0.8
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = (Math.random() - 0.5) * 2
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    // Color based on parameters
    colors[i3] = 0.3 + parameters.temperature / 100
    colors[i3 + 1] = 0.5 + parameters.ph / 14
    colors[i3 + 2] = 0.7 + parameters.electrodeVoltage / 200
  }

  return (
    <group>
      {/* Main reactor vessel */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshPhysicalMaterial
          color={0x4a90e2}
          transparent
          opacity={0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Fluid medium */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 1.8, 32]} />
        <meshPhysicalMaterial
          color={new THREE.Color().setHSL(parameters.ph / 14, 0.7, 0.5)}
          transparent
          opacity={0.6}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Particles - Using lowercase 'points' for R3F */}
      <points ref={particlesRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          vertexColors={true}
        />
      </points>

      {/* Electrodes */}
      <mesh position={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial
          color={0x2d3748}
          emissive={0x1a202c}
          emissiveIntensity={parameters.electrodeVoltage / 500}
        />
      </mesh>

      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial
          color={0xc0c0c0}
          metalness={0.9}
          roughness={0.1}
          emissive={0x666666}
          emissiveIntensity={parameters.electrodeVoltage / 1000}
        />
      </mesh>

      {/* Performance indicator */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={parameters.temperature > 35 ? 0xff4444 : parameters.temperature > 25 ? 0x44ff44 : 0x4444ff}
          emissive={0x333333}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}