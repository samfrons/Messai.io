'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line, Sphere } from '@react-three/drei'
import { useControls } from 'leva'

interface FlowSystemProps {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  chamberDimensions: {
    width: number
    height: number
    depth: number
  }
}

interface FlowParticle {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  age: number
  type: 'substrate' | 'electron' | 'ion'
}

export default function FlowSystem({
  systemType,
  chamberDimensions,
}: FlowSystemProps) {
  const particlesRef = useRef<FlowParticle[]>([])
  const groupRef = useRef<THREE.Group>(null)
  
  const { flowRate, showElectrons, showSubstrate, showIons } = useControls('Flow System', {
    flowRate: { value: 1, min: 0, max: 3, step: 0.1 },
    showSubstrate: { value: true, label: 'Show Substrate Flow' },
    showElectrons: { value: true, label: 'Show Electron Flow' },
    showIons: { value: true, label: 'Show Ion Flow' },
  })
  
  // Initialize particles
  useMemo(() => {
    const particles: FlowParticle[] = []
    const particleCount = 50
    
    for (let i = 0; i < particleCount; i++) {
      const type = i < 20 ? 'substrate' : i < 35 ? 'electron' : 'ion'
      const particle: FlowParticle = {
        id: i,
        position: new THREE.Vector3(
          -chamberDimensions.width / 2,
          (Math.random() - 0.5) * chamberDimensions.height * 0.8,
          (Math.random() - 0.5) * chamberDimensions.depth * 0.8
        ),
        velocity: new THREE.Vector3(0.01, 0, 0),
        age: Math.random() * 100,
        type,
      }
      particles.push(particle)
    }
    
    particlesRef.current = particles
    return particles
  }, [chamberDimensions])
  
  // Update particle positions
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    particlesRef.current.forEach((particle) => {
      // Update position based on flow type
      if (particle.type === 'substrate') {
        // Substrate flows horizontally through the chamber
        particle.position.x += particle.velocity.x * flowRate * delta * 50
        particle.position.y += Math.sin(particle.age * 0.1) * 0.001
      } else if (particle.type === 'electron') {
        // Electrons flow from anode to cathode
        const targetX = chamberDimensions.width / 4
        const direction = new THREE.Vector3(targetX - particle.position.x, 0, 0).normalize()
        particle.position.add(direction.multiplyScalar(flowRate * delta * 30))
      } else if (particle.type === 'ion') {
        // Ions move through the membrane
        particle.position.x += particle.velocity.x * flowRate * delta * 20
        particle.position.z += Math.sin(particle.age * 0.2) * 0.0005
      }
      
      // Reset particles that exit the chamber
      if (particle.position.x > chamberDimensions.width / 2) {
        particle.position.x = -chamberDimensions.width / 2
        particle.position.y = (Math.random() - 0.5) * chamberDimensions.height * 0.8
        particle.age = 0
      }
      
      particle.age += delta
    })
  })
  
  // Flow path lines
  const flowPaths = useMemo(() => {
    const paths: number[][] = []
    
    // Main flow path
    paths.push([
      -chamberDimensions.width / 2, 0, 0,
      chamberDimensions.width / 2, 0, 0
    ])
    
    // Curved paths for complex flow
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * chamberDimensions.height * 0.3
      const curve: number[] = []
      
      for (let t = 0; t <= 1; t += 0.1) {
        const x = -chamberDimensions.width / 2 + t * chamberDimensions.width
        const yOffset = Math.sin(t * Math.PI) * 0.1
        curve.push(x, y + yOffset, 0)
      }
      
      paths.push(curve)
    }
    
    return paths
  }, [chamberDimensions])
  
  // Get particle color based on type
  const getParticleColor = (type: FlowParticle['type']) => {
    switch (type) {
      case 'substrate': return '#4169E1' // Royal Blue
      case 'electron': return '#FFD700' // Gold
      case 'ion': return '#00CED1' // Dark Turquoise
      default: return '#FFFFFF'
    }
  }
  
  return (
    <group ref={groupRef}>
      {/* Flow path indicators */}
      {flowPaths.map((path, index) => (
        <Line
          key={`path-${index}`}
          points={path}
          color="#666666"
          lineWidth={1}
          transparent
          opacity={0.3}
          dashed
          dashScale={10}
          dashSize={0.05}
          gapSize={0.05}
        />
      ))}
      
      {/* Flow particles */}
      {particlesRef.current.map((particle) => {
        const shouldShow = 
          (particle.type === 'substrate' && showSubstrate) ||
          (particle.type === 'electron' && showElectrons) ||
          (particle.type === 'ion' && showIons)
          
        if (!shouldShow) return null
        
        return (
          <Sphere
            key={particle.id}
            args={[particle.type === 'electron' ? 0.008 : 0.01, 8, 8]}
            position={[particle.position.x, particle.position.y, particle.position.z]}
          >
            <meshStandardMaterial
              color={getParticleColor(particle.type)}
              emissive={getParticleColor(particle.type)}
              emissiveIntensity={particle.type === 'electron' ? 0.5 : 0.2}
              transparent
              opacity={0.8}
            />
          </Sphere>
        )
      })}
      
      {/* Flow direction indicators */}
      <group>
        {/* Inlet arrow */}
        <mesh position={[-chamberDimensions.width / 2 - 0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        
        {/* Outlet arrow */}
        <mesh position={[chamberDimensions.width / 2 + 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
      </group>
    </group>
  )
}