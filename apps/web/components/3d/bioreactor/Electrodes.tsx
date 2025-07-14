'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'

interface ElectrodesProps {
  anodeMaterial: THREE.Material
  cathodeMaterial: THREE.Material
  chamberWidth: number
  chamberHeight: number
  chamberDepth: number
  showBiofilm: boolean
  biofilmMaterial: THREE.Material
}

export default function Electrodes({
  anodeMaterial,
  cathodeMaterial,
  chamberWidth,
  chamberHeight,
  chamberDepth,
  showBiofilm,
  biofilmMaterial,
}: ElectrodesProps) {
  const anodeRef = useRef<THREE.Mesh>(null)
  const cathodeRef = useRef<THREE.Mesh>(null)
  const biofilmRef = useRef<THREE.Group>(null)
  
  // Electrode dimensions
  const electrodeThickness = 0.02
  const electrodeWidth = chamberDepth * 0.8
  const electrodeHeight = chamberHeight * 0.8
  const electrodeSpacing = 0.1
  
  // Biofilm animation
  const biofilmSpring = useSpring({
    scale: showBiofilm ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  })
  
  // Generate biofilm particles
  const biofilmParticles = useMemo(() => {
    const particles = []
    const particleCount = 50
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * electrodeWidth * 0.8
      const y = (Math.random() - 0.5) * electrodeHeight * 0.8
      const z = Math.random() * 0.05
      const size = Math.random() * 0.03 + 0.01
      
      particles.push({
        position: [x, y, z] as [number, number, number],
        size,
        key: i
      })
    }
    
    return particles
  }, [electrodeWidth, electrodeHeight])
  
  // Animate biofilm growth
  useFrame((state) => {
    if (biofilmRef.current && showBiofilm) {
      biofilmRef.current.children.forEach((child, index) => {
        const time = state.clock.elapsedTime
        const offset = index * 0.1
        child.scale.setScalar(1 + Math.sin(time + offset) * 0.1)
      })
    }
  })
  
  // Calculate positions based on chamber configuration
  const anodePosition: [number, number, number] = [-chamberWidth / 4 - electrodeSpacing / 2, 0, 0]
  const cathodePosition: [number, number, number] = [chamberWidth / 4 + electrodeSpacing / 2, 0, 0]
  
  return (
    <group>
      {/* Anode */}
      <group position={anodePosition}>
        <Box
          ref={anodeRef}
          args={[electrodeThickness, electrodeHeight, electrodeWidth]}
        >
          <primitive attach="material" object={anodeMaterial} />
        </Box>
        
        {/* Biofilm on anode */}
        {showBiofilm && (
          <animated.group
            ref={biofilmRef}
            scale={biofilmSpring.scale}
            position={[electrodeThickness / 2 + 0.01, 0, 0]}
          >
            {biofilmParticles.map((particle) => (
              <Sphere
                key={particle.key}
                args={[particle.size, 8, 8]}
                position={particle.position}
              >
                <primitive attach="material" object={biofilmMaterial} />
              </Sphere>
            ))}
          </animated.group>
        )}
        
        {/* Connection wire */}
        <mesh position={[0, electrodeHeight / 2 + 0.05, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      </group>
      
      {/* Cathode */}
      <group position={cathodePosition}>
        <Box
          ref={cathodeRef}
          args={[electrodeThickness, electrodeHeight, electrodeWidth]}
        >
          <primitive attach="material" object={cathodeMaterial} />
        </Box>
        
        {/* Connection wire */}
        <mesh position={[0, electrodeHeight / 2 + 0.05, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color="#0000ff" />
        </mesh>
      </group>
      
      {/* External circuit connection */}
      <group>
        {/* Wire from anode */}
        <mesh position={[anodePosition[0], electrodeHeight / 2 + 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, chamberWidth / 4, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Wire from cathode */}
        <mesh position={[cathodePosition[0], electrodeHeight / 2 + 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, chamberWidth / 4, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Load resistor */}
        <Box
          args={[0.2, 0.1, 0.1]}
          position={[0, electrodeHeight / 2 + 0.1, 0]}
        >
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </group>
    </group>
  )
}