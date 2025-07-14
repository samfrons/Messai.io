'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { useControls } from 'leva'

interface MembraneProps {
  width: number
  height: number
  position: [number, number, number]
  material: THREE.Material
}

export default function Membrane({
  width,
  height,
  position,
  material,
}: MembraneProps) {
  const membraneRef = useRef<THREE.Mesh>(null)
  
  // Controls for membrane visualization
  const { showIonFlow, flowSpeed } = useControls('Membrane', {
    showIonFlow: { value: true, label: 'Show Ion Flow' },
    flowSpeed: { value: 1, min: 0, max: 5, step: 0.1 },
  })
  
  // Animate subtle membrane movement
  useFrame((state) => {
    if (membraneRef.current) {
      const time = state.clock.elapsedTime
      membraneRef.current.position.z = position[2] + Math.sin(time * flowSpeed) * 0.002
    }
  })
  
  const membraneThickness = 0.01
  
  return (
    <group position={position}>
      {/* Main membrane */}
      <Box
        ref={membraneRef}
        args={[membraneThickness, height * 0.9, width * 0.9]}
      >
        <primitive attach="material" object={material} />
      </Box>
      
      {/* Ion flow visualization */}
      {showIonFlow && (
        <IonFlowVisualization
          width={width}
          height={height}
          flowSpeed={flowSpeed}
        />
      )}
    </group>
  )
}

// Ion flow visualization component
function IonFlowVisualization({
  width,
  height,
  flowSpeed,
}: {
  width: number
  height: number
  flowSpeed: number
}) {
  const ionGroupRef = useRef<THREE.Group>(null)
  
  // Animate ions passing through membrane
  useFrame((state) => {
    if (ionGroupRef.current) {
      const time = state.clock.elapsedTime
      
      ionGroupRef.current.children.forEach((ion, index) => {
        const offset = index * 0.5
        const progress = ((time * flowSpeed + offset) % 2) - 1
        ion.position.x = progress * 0.1
        ion.scale.setScalar(1 - Math.abs(progress))
      })
    }
  })
  
  // Create ion particles
  const ionCount = 10
  const ions = Array.from({ length: ionCount }, (_, i) => ({
    key: i,
    position: [0, (i - ionCount / 2) * (height / ionCount), 0] as [number, number, number],
  }))
  
  return (
    <group ref={ionGroupRef}>
      {ions.map((ion) => (
        <mesh key={ion.key} position={ion.position}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}