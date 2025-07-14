'use client'

import { useRef, useMemo, useState } from 'react'
import { Group, Vector3, Color } from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { animated, useSpring } from '@react-spring/three'
import { Box, Sphere, Cylinder } from '@react-three/drei'

// Caladan Bio inspired color palette
const COLORS = {
  substrate: '#2D4A3E', // Dark green (base)
  algae: '#4A7C59', // Medium green (algae culture)
  electrode: '#8FBC8F', // Light green (electrodes)
  electrolyte: '#E8F5E8', // Very light green (transparent)
  accent: '#1B2F23', // Near black (accents)
  glow: '#90EE90', // Bright green glow
}

interface AlgaeBioreactorProps {
  scale?: number
  showFlow?: boolean
  showAlgae?: boolean
  animate?: boolean
}

export default function AlgaeBioreactorFuelCell({
  scale = 1,
  showFlow = true,
  showAlgae = true,
  animate = true
}: AlgaeBioreactorProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  
  // Animation controls
  const { 
    flowRate,
    algaeDensity,
    rotationSpeed,
    showElectrodes,
    showChannels,
    transparency 
  } = useControls('Microfluidic Algae Cell', {
    flowRate: { value: 1.0, min: 0, max: 3, step: 0.1 },
    algaeDensity: { value: 0.7, min: 0, max: 1, step: 0.1 },
    rotationSpeed: { value: 0.2, min: 0, max: 1, step: 0.1 },
    showElectrodes: { value: true },
    showChannels: { value: true },
    transparency: { value: 0.3, min: 0, max: 1, step: 0.1 }
  })

  // Smooth rotation animation
  useFrame((state) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.y += rotationSpeed * 0.01
    }
  })

  // Spring animation for hover state
  const { modelScale } = useSpring({
    modelScale: hovered ? 1.05 : 1,
    config: { tension: 200, friction: 20 }
  })

  // Algae particles positions
  const algaePositions = useMemo(() => {
    const positions = []
    const particleCount = Math.floor(algaeDensity * 200)
    
    for (let i = 0; i < particleCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 1.8, // X within channel
        (Math.random() - 0.5) * 0.15, // Y within height
        (Math.random() - 0.5) * 0.8   // Z within width
      ])
    }
    return positions
  }, [algaeDensity])

  return (
    <animated.group 
      ref={groupRef}
      scale={modelScale.to(s => s * scale)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main Substrate/Base */}
      <Box
        args={[2.2, 0.2, 1.0]}
        position={[0, -0.15, 0]}
      >
        <meshStandardMaterial 
          color={COLORS.substrate}
          roughness={0.2}
          metalness={0.1}
        />
      </Box>

      {/* Microfluidic Channels */}
      {showChannels && (
        <>
          {/* Main Culture Channel */}
          <Box
            args={[1.8, 0.1, 0.6]}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial 
              color={COLORS.electrolyte}
              transparent
              opacity={transparency}
              roughness={0.1}
            />
          </Box>

          {/* Inlet Channel */}
          <Box
            args={[0.3, 0.08, 0.1]}
            position={[-1.1, 0, -0.3]}
          >
            <meshStandardMaterial 
              color={COLORS.electrolyte}
              transparent
              opacity={transparency + 0.2}
            />
          </Box>

          {/* Outlet Channel */}
          <Box
            args={[0.3, 0.08, 0.1]}
            position={[1.1, 0, 0.3]}
          >
            <meshStandardMaterial 
              color={COLORS.electrolyte}
              transparent
              opacity={transparency + 0.2}
            />
          </Box>
        </>
      )}

      {/* Electrodes */}
      {showElectrodes && (
        <>
          {/* Anode (Left) */}
          <Box
            args={[0.05, 0.12, 0.5]}
            position={[-0.6, 0.02, 0]}
          >
            <meshStandardMaterial 
              color={COLORS.electrode}
              roughness={0.3}
              metalness={0.8}
              emissive={new Color(COLORS.glow)}
              emissiveIntensity={0.1}
            />
          </Box>

          {/* Cathode (Right) */}
          <Box
            args={[0.05, 0.12, 0.5]}
            position={[0.6, 0.02, 0]}
          >
            <meshStandardMaterial 
              color={COLORS.electrode}
              roughness={0.3}
              metalness={0.8}
              emissive={new Color(COLORS.glow)}
              emissiveIntensity={0.1}
            />
          </Box>

          {/* Electrode Connectors */}
          <Cylinder
            args={[0.02, 0.02, 0.3]}
            position={[-0.6, 0.25, 0]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial 
              color={COLORS.accent}
              metalness={0.9}
              roughness={0.1}
            />
          </Cylinder>

          <Cylinder
            args={[0.02, 0.02, 0.3]}
            position={[0.6, 0.25, 0]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial 
              color={COLORS.accent}
              metalness={0.9}
              roughness={0.1}
            />
          </Cylinder>
        </>
      )}

      {/* Algae Culture Particles */}
      {showAlgae && algaePositions.map((position, index) => (
        <AlgaeParticle
          key={index}
          position={position as [number, number, number]}
          flowRate={flowRate}
          index={index}
        />
      ))}

      {/* Inlet/Outlet Ports */}
      <Cylinder
        args={[0.05, 0.05, 0.1]}
        position={[-1.25, 0.1, -0.3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color={COLORS.accent}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>

      <Cylinder
        args={[0.05, 0.05, 0.1]}
        position={[1.25, 0.1, 0.3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color={COLORS.accent}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>

      {/* Flow Visualization */}
      {showFlow && (
        <FlowParticles 
          flowRate={flowRate}
          channelWidth={1.8}
          channelHeight={0.1}
        />
      )}

      {/* Mounting Points */}
      {[-0.9, 0.9].map((x, i) => (
        <Cylinder
          key={i}
          args={[0.03, 0.03, 0.05]}
          position={[x, -0.25, 0.4]}
        >
          <meshStandardMaterial 
            color={COLORS.accent}
            metalness={0.9}
            roughness={0.1}
          />
        </Cylinder>
      ))}
    </animated.group>
  )
}

// Individual algae particle component
function AlgaeParticle({ 
  position, 
  flowRate, 
  index 
}: { 
  position: [number, number, number]
  flowRate: number
  index: number 
}) {
  const particleRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (particleRef.current) {
      // Gentle floating motion
      const time = state.clock.getElapsedTime()
      const offset = index * 0.1
      
      particleRef.current.position.y = position[1] + Math.sin(time + offset) * 0.02
      particleRef.current.position.x = position[0] + Math.sin(time * flowRate + offset) * 0.05
      
      // Subtle rotation
      particleRef.current.rotation.z = time * 0.5 + offset
    }
  })

  return (
    <group ref={particleRef} position={position}>
      <Sphere args={[0.008]}>
        <meshStandardMaterial
          color={COLORS.algae}
          roughness={0.4}
          metalness={0.0}
          emissive={new Color(COLORS.glow)}
          emissiveIntensity={0.05}
        />
      </Sphere>
    </group>
  )
}

// Flow particles for fluid motion visualization
function FlowParticles({ 
  flowRate, 
  channelWidth, 
  channelHeight 
}: { 
  flowRate: number
  channelWidth: number
  channelHeight: number 
}) {
  const particlesRef = useRef<Group>(null)
  
  const flowPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < 20; i++) {
      positions.push([
        (Math.random() - 0.5) * channelWidth,
        (Math.random() - 0.5) * channelHeight,
        (Math.random() - 0.5) * 0.6
      ])
    }
    return positions
  }, [channelWidth, channelHeight])

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime()
      
      particlesRef.current.children.forEach((child, index) => {
        const basePos = flowPositions[index]
        child.position.x = basePos[0] + Math.sin(time * flowRate + index) * 0.2
        child.position.y = basePos[1] + Math.cos(time * flowRate * 0.5 + index) * 0.02
        
        // Reset position when particle flows out
        if (child.position.x > channelWidth / 2) {
          child.position.x = -channelWidth / 2
        }
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {flowPositions.map((position, index) => (
        <Sphere key={index} args={[0.003]} position={position as [number, number, number]}>
          <meshBasicMaterial
            color={COLORS.electrolyte}
            opacity={0.6}
            transparent
          />
        </Sphere>
      ))}
    </group>
  )
}