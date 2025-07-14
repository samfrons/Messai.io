'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox, Text } from '@react-three/drei'

interface ChamberProps {
  width: number
  height: number
  depth: number
  chambers: number
  material: THREE.Material
  showLabels?: boolean
}

export default function Chamber({
  width,
  height,
  depth,
  chambers,
  material,
  showLabels = true,
}: ChamberProps) {
  // Create chamber positions based on number of chambers
  const chamberPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    const chamberWidth = width / chambers
    
    for (let i = 0; i < chambers; i++) {
      const x = -width / 2 + chamberWidth / 2 + i * chamberWidth
      positions.push([x, 0, 0])
    }
    
    return positions
  }, [width, chambers])
  
  const chamberWidth = width / chambers
  const wallThickness = 0.05
  
  return (
    <group>
      {/* Bottom plate */}
      <RoundedBox
        args={[width + wallThickness * 2, wallThickness, depth + wallThickness * 2]}
        position={[0, -height / 2 - wallThickness / 2, 0]}
        radius={0.02}
        smoothness={4}
      >
        <primitive attach="material" object={material} />
      </RoundedBox>
      
      {/* Side walls */}
      {/* Left wall */}
      <RoundedBox
        args={[wallThickness, height, depth + wallThickness * 2]}
        position={[-width / 2 - wallThickness / 2, 0, 0]}
        radius={0.02}
        smoothness={4}
      >
        <primitive attach="material" object={material} />
      </RoundedBox>
      
      {/* Right wall */}
      <RoundedBox
        args={[wallThickness, height, depth + wallThickness * 2]}
        position={[width / 2 + wallThickness / 2, 0, 0]}
        radius={0.02}
        smoothness={4}
      >
        <primitive attach="material" object={material} />
      </RoundedBox>
      
      {/* Front wall */}
      <RoundedBox
        args={[width + wallThickness * 2, height, wallThickness]}
        position={[0, 0, -depth / 2 - wallThickness / 2]}
        radius={0.02}
        smoothness={4}
      >
        <primitive attach="material" object={material.clone()} transparent opacity={0.3} />
      </RoundedBox>
      
      {/* Back wall */}
      <RoundedBox
        args={[width + wallThickness * 2, height, wallThickness]}
        position={[0, 0, depth / 2 + wallThickness / 2]}
        radius={0.02}
        smoothness={4}
      >
        <primitive attach="material" object={material} />
      </RoundedBox>
      
      {/* Chamber dividers */}
      {chambers > 1 && chamberPositions.slice(0, -1).map((_, index) => {
        const x = -width / 2 + (index + 1) * chamberWidth
        return (
          <RoundedBox
            key={`divider-${index}`}
            args={[wallThickness, height, depth]}
            position={[x, 0, 0]}
            radius={0.02}
            smoothness={4}
          >
            <primitive attach="material" object={material} />
          </RoundedBox>
        )
      })}
      
      {/* Chamber labels */}
      {showLabels && chamberPositions.map((pos, index) => {
        const labels = ['Anode', 'Cathode', 'Desalination']
        const label = labels[index] || `Chamber ${index + 1}`
        
        return (
          <Text
            key={`label-${index}`}
            position={[pos[0], height / 2 + 0.1, 0]}
            fontSize={0.1}
            color="#333333"
            anchorX="center"
            anchorY="bottom"
          >
            {label}
          </Text>
        )
      })}
      
      {/* Inlet/Outlet ports */}
      <group>
        {/* Inlet port */}
        <mesh position={[-width / 2, -height / 3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, wallThickness * 2, 16]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        
        {/* Outlet port */}
        <mesh position={[width / 2, height / 3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, wallThickness * 2, 16]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>
    </group>
  )
}