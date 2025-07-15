'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import * as THREE from 'three'
import { ANIMATION_CONFIGS } from '../utils/animations'

interface MicrobialColony {
  id: string
  position: THREE.Vector3
  size: number
  baseSize: number
  growthPhase: number
  species: 'geobacter' | 'shewanella' | 'pseudomonas' | 'escherichia'
  maturity: number
  connections: string[]
  electricalActivity: number
}

interface BiofilmNetworkProps {
  surface: { width: number; height: number; depth: number }
  density: number
  growthRate: number
  showConnections: boolean
  showLabels: boolean
  electricalActivity: boolean
}

const MICROBE_PROPERTIES = {
  geobacter: {
    color: new THREE.Color('#ff6b35'),
    name: 'Geobacter',
    conductivity: 0.9,
    growthRate: 1.2,
    maxSize: 0.04
  },
  shewanella: {
    color: new THREE.Color('#4ecdc4'),
    name: 'Shewanella',
    conductivity: 0.7,
    growthRate: 1.0,
    maxSize: 0.035
  },
  pseudomonas: {
    color: new THREE.Color('#45b7d1'),
    name: 'Pseudomonas',
    conductivity: 0.3,
    growthRate: 0.8,
    maxSize: 0.03
  },
  escherichia: {
    color: new THREE.Color('#f9ca24'),
    name: 'E. coli',
    conductivity: 0.1,
    growthRate: 1.5,
    maxSize: 0.025
  }
}

function MicrobialColonyComponent({ colony, time, electricalActivity }: {
  colony: MicrobialColony
  time: number
  electricalActivity: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const props = MICROBE_PROPERTIES[colony.species]
  
  // Dynamic growth animation
  const growthPulse = Math.sin(time * 2 + colony.growthPhase * 10) * 0.1 + 1
  const maturityScale = Math.min(colony.maturity, 1)
  const finalSize = colony.baseSize * maturityScale * growthPulse
  
  // Electrical activity glow
  const electricalGlow = electricalActivity && colony.electricalActivity > 0.5 ? 
    Math.sin(time * 8 + colony.growthPhase * 20) * 0.3 + 0.7 : 0.3
  
  const { scale, emissiveIntensity } = useSpring({
    scale: finalSize,
    emissiveIntensity: electricalActivity ? electricalGlow : 0.1,
    config: ANIMATION_CONFIGS.smooth
  })
  
  useFrame(() => {
    if (meshRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(time * 1.5 + colony.growthPhase * 5) * 0.02
      meshRef.current.scale.setScalar(finalSize + breathe)
      
      // Electrical activity rotation
      if (electricalActivity && colony.electricalActivity > 0.7) {
        meshRef.current.rotation.y += 0.01
      }
    }
  })
  
  return (
    <animated.mesh
      ref={meshRef}
      position={colony.position}
      scale={scale}
    >
      <Sphere args={[1, 12, 8]}>
        <meshPhysicalMaterial
          color={props.color}
          emissive={props.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.7}
          clearcoat={0.4}
          clearcoatRoughness={0.6}
          transparent
          opacity={0.8 + colony.maturity * 0.2}
        />
      </Sphere>
      
      {/* Species indicator for mature colonies */}
      {colony.maturity > 0.8 && (
        <Html position={[0, 1.5, 0]} center>
          <div className="text-xs text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
            {props.name}
          </div>
        </Html>
      )}
    </animated.mesh>
  )
}

function BiofilmConnections({ colonies, showConnections, electricalActivity }: {
  colonies: MicrobialColony[]
  showConnections: boolean
  electricalActivity: boolean
}) {
  const linesRef = useRef<THREE.Group>(null)
  
  const connections = useMemo(() => {
    const connectionLines: Array<{
      start: THREE.Vector3
      end: THREE.Vector3
      strength: number
      conductivity: number
    }> = []
    
    colonies.forEach(colony => {
      colony.connections.forEach(connectionId => {
        const targetColony = colonies.find(c => c.id === connectionId)
        if (targetColony) {
          const startProps = MICROBE_PROPERTIES[colony.species]
          const endProps = MICROBE_PROPERTIES[targetColony.species]
          const avgConductivity = (startProps.conductivity + endProps.conductivity) / 2
          
          connectionLines.push({
            start: colony.position,
            end: targetColony.position,
            strength: Math.min(colony.maturity, targetColony.maturity),
            conductivity: avgConductivity
          })
        }
      })
    })
    
    return connectionLines
  }, [colonies])
  
  useFrame((state) => {
    if (linesRef.current && electricalActivity) {
      const time = state.clock.elapsedTime
      linesRef.current.children.forEach((child, i) => {
        const connection = connections[i]
        if (connection && connection.conductivity > 0.5) {
          const pulse = Math.sin(time * 4 + i * 0.5) * 0.5 + 0.5
          child.scale.setScalar(pulse * connection.strength)
        }
      })
    }
  })
  
  if (!showConnections) return null
  
  return (
    <group ref={linesRef}>
      {connections.map((connection, i) => {
        const direction = new THREE.Vector3().subVectors(connection.end, connection.start)
        const length = direction.length()
        const center = new THREE.Vector3().addVectors(connection.start, connection.end).multiplyScalar(0.5)
        
        return (
          <mesh key={i} position={center}>
            <cylinderGeometry args={[0.002, 0.002, length, 6]} />
            <meshPhysicalMaterial
              color={new THREE.Color().setHSL(0.6 - connection.conductivity * 0.4, 0.8, 0.5)}
              emissive={new THREE.Color().setHSL(0.6 - connection.conductivity * 0.4, 0.8, 0.3)}
              emissiveIntensity={electricalActivity ? connection.conductivity : 0.1}
              transparent
              opacity={connection.strength * 0.6}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function SubstrateLayer({ surface, time }: {
  surface: { width: number; height: number; depth: number }
  time: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      // Flowing substrate animation
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial
      if (material.map) {
        material.map.offset.x = (time * 0.1) % 1
        material.map.offset.y = (time * 0.05) % 1
      }
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, -surface.depth / 2]}>
      <boxGeometry args={[surface.width, surface.height, surface.depth * 0.1]} />
      <meshPhysicalMaterial
        color="#8B4513"
        transparent
        opacity={0.3}
        roughness={0.9}
      />
    </mesh>
  )
}

export default function EnhancedBiofilmAnimation({
  surface = { width: 1.6, height: 2.4, depth: 0.4 },
  density = 0.8,
  growthRate = 1.0,
  showConnections = true,
  showLabels = false,
  electricalActivity = true
}: Partial<BiofilmNetworkProps>) {
  const timeRef = useRef(0)
  const [colonies, setColonies] = useState<MicrobialColony[]>([])
  
  // Generate initial microbial colonies
  useMemo(() => {
    const newColonies: MicrobialColony[] = []
    const colonyCount = Math.floor(surface.width * surface.height * density * 50)
    const species = Object.keys(MICROBE_PROPERTIES) as Array<keyof typeof MICROBE_PROPERTIES>
    
    for (let i = 0; i < colonyCount; i++) {
      const speciesType = species[Math.floor(Math.random() * species.length)]
      const props = MICROBE_PROPERTIES[speciesType]
      
      const colony: MicrobialColony = {
        id: `colony-${i}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * surface.width * 0.9,
          (Math.random() - 0.5) * surface.height * 0.9,
          (Math.random() - 0.5) * surface.depth
        ),
        size: props.maxSize,
        baseSize: props.maxSize * (0.3 + Math.random() * 0.7),
        growthPhase: Math.random() * Math.PI * 2,
        species: speciesType,
        maturity: Math.random() * 0.3, // Start with low maturity
        connections: [],
        electricalActivity: Math.random()
      }
      
      newColonies.push(colony)
    }
    
    // Generate connections between nearby colonies
    newColonies.forEach(colony => {
      const nearby = newColonies.filter(other => 
        other.id !== colony.id && 
        colony.position.distanceTo(other.position) < 0.2
      )
      
      const maxConnections = 3
      const connectionCount = Math.min(
        Math.floor(Math.random() * maxConnections), 
        nearby.length
      )
      
      for (let i = 0; i < connectionCount; i++) {
        const target = nearby[Math.floor(Math.random() * nearby.length)]
        if (!colony.connections.includes(target.id)) {
          colony.connections.push(target.id)
        }
      }
    })
    
    setColonies(newColonies)
  }, [surface, density])
  
  // Growth animation
  useFrame((state, delta) => {
    timeRef.current += delta
    
    if (timeRef.current > 1) { // Update every second
      setColonies(prevColonies => 
        prevColonies.map(colony => ({
          ...colony,
          maturity: Math.min(colony.maturity + delta * growthRate * 0.1, 1),
          electricalActivity: Math.max(0, colony.electricalActivity + (Math.random() - 0.5) * 0.1)
        }))
      )
      timeRef.current = 0
    }
  })
  
  return (
    <group>
      {/* Substrate layer */}
      <SubstrateLayer surface={surface} time={timeRef.current} />
      
      {/* Microbial colonies */}
      {colonies.map(colony => (
        <MicrobialColonyComponent
          key={colony.id}
          colony={colony}
          time={timeRef.current}
          electricalActivity={electricalActivity}
        />
      ))}
      
      {/* Biofilm connections */}
      <BiofilmConnections
        colonies={colonies}
        showConnections={showConnections}
        electricalActivity={electricalActivity}
      />
      
      {/* Statistics overlay */}
      {showLabels && (
        <Html position={[surface.width / 2 + 0.2, surface.height / 2, 0]}>
          <div className="bg-black/60 text-white p-3 rounded-lg backdrop-blur-sm text-xs">
            <h4 className="font-medium mb-2">Biofilm Stats</h4>
            <div className="space-y-1">
              <div>Colonies: {colonies.length}</div>
              <div>Avg Maturity: {(colonies.reduce((sum, c) => sum + c.maturity, 0) / colonies.length * 100).toFixed(1)}%</div>
              <div>Active Connections: {colonies.reduce((sum, c) => sum + c.connections.length, 0)}</div>
              <div>Electrical Activity: {electricalActivity ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}