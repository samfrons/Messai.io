'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sphere, Box, Text } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import { animateBiofilmGrowth } from '../utils/animations'

interface BiofilmSimulationProps {
  surfaceWidth: number
  surfaceHeight: number
  thickness: number
  growthRate?: number
  material: THREE.Material
  showGrowthStages?: boolean
}

interface BiofilmCluster {
  position: THREE.Vector3
  size: number
  growthPhase: number
  color: THREE.Color
}

export default function BiofilmSimulation({
  surfaceWidth,
  surfaceHeight,
  thickness,
  growthRate = 0.1,
  material,
  showGrowthStages = true,
}: BiofilmSimulationProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  
  // Generate biofilm clusters
  const clusters = useMemo(() => {
    const clusterList: BiofilmCluster[] = []
    const clusterCount = Math.floor(surfaceWidth * surfaceHeight * 100)
    
    for (let i = 0; i < clusterCount; i++) {
      const cluster: BiofilmCluster = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * surfaceWidth * 0.9,
          (Math.random() - 0.5) * surfaceHeight * 0.9,
          Math.random() * thickness
        ),
        size: 0.02 + Math.random() * 0.03,
        growthPhase: Math.random(),
        color: new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.6, 0.5),
      }
      clusterList.push(cluster)
    }
    
    return clusterList
  }, [surfaceWidth, surfaceHeight, thickness])
  
  // Animation
  useFrame((state, delta) => {
    timeRef.current += delta
    
    if (groupRef.current) {
      // Animate overall biofilm growth
      const growthScale = animateBiofilmGrowth(timeRef.current, 1, growthRate)
      groupRef.current.scale.setScalar(growthScale)
      
      // Animate individual clusters
      groupRef.current.children.forEach((child, index) => {
        const cluster = clusters[index]
        if (cluster) {
          const phase = (timeRef.current + cluster.growthPhase * 10) % 10
          const localGrowth = 1 + Math.sin(phase) * 0.1
          child.scale.setScalar(cluster.size * localGrowth)
        }
      })
    }
  })
  
  // Growth stages visualization
  const growthStageOpacity = useSpring({
    opacity: showGrowthStages ? 0.8 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  })
  
  return (
    <group ref={groupRef}>
      {/* Base biofilm layer */}
      <Box args={[surfaceWidth, surfaceHeight, thickness * 0.5]} position={[0, 0, thickness * 0.25]}>
        <primitive attach="material" object={material.clone()} transparent opacity={0.6} />
      </Box>
      
      {/* Biofilm clusters */}
      {clusters.map((cluster, index) => (
        <Sphere
          key={index}
          args={[cluster.size, 8, 6]}
          position={cluster.position}
        >
          <meshPhysicalMaterial
            color={cluster.color}
            roughness={0.9}
            clearcoat={0.5}
            clearcoatRoughness={0.8}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
      
      {/* Growth stage indicators */}
      {showGrowthStages && (
        <animated.group opacity={growthStageOpacity.opacity}>
          {/* Early stage - sparse coverage */}
          <group position={[0, 0, -thickness]}>
            <Text
              position={[0, surfaceHeight / 2 + 0.1, 0]}
              fontSize={0.05}
              color="#666666"
              anchorX="center"
            >
              Early Stage (0-24h)
            </Text>
          </group>
          
          {/* Mature stage - full coverage */}
          <group position={[0, 0, thickness]}>
            <Text
              position={[0, -surfaceHeight / 2 - 0.1, 0]}
              fontSize={0.05}
              color="#666666"
              anchorX="center"
            >
              Mature Biofilm (7+ days)
            </Text>
          </group>
        </animated.group>
      )}
    </group>
  )
}