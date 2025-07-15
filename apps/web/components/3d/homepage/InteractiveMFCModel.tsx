'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cylinder, Text, Html } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import * as THREE from 'three'
import { 
  createParticleSystem, 
  updateParticleSystem, 
  createBubbles, 
  updateBubbles,
  Bubble,
  ParticleSystem,
  ANIMATION_CONFIGS 
} from '../utils/animations'

interface ElectronFlowProps {
  active: boolean
  from: THREE.Vector3
  to: THREE.Vector3
}

function ElectronFlow({ active, from, to }: ElectronFlowProps) {
  const groupRef = useRef<THREE.Group>(null)
  const electronsRef = useRef<THREE.Points>(null)
  
  const electronGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(50 * 3)
    const colors = new Float32Array(50 * 3)
    
    for (let i = 0; i < 50; i++) {
      const t = i / 49
      const pos = new THREE.Vector3().lerpVectors(from, to, t)
      
      positions[i * 3] = pos.x
      positions[i * 3 + 1] = pos.y
      positions[i * 3 + 2] = pos.z
      
      // Electric blue color
      colors[i * 3] = 0.2
      colors[i * 3 + 1] = 0.8
      colors[i * 3 + 2] = 1.0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geometry
  }, [from, to])
  
  useFrame((state) => {
    if (electronsRef.current && active) {
      const time = state.clock.elapsedTime
      const positions = electronsRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < 50; i++) {
        const t = (i / 49 + time * 0.5) % 1
        const pos = new THREE.Vector3().lerpVectors(from, to, t)
        
        positions[i * 3] = pos.x
        positions[i * 3 + 1] = pos.y
        positions[i * 3 + 2] = pos.z
      }
      
      electronsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  if (!active) return null
  
  return (
    <points ref={electronsRef}>
      <primitive attach="geometry" object={electronGeometry} />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface SubstrateFlowProps {
  active: boolean
}

function SubstrateFlow({ active }: SubstrateFlowProps) {
  const particleSystemRef = useRef<ParticleSystem>()
  const pointsRef = useRef<THREE.Points>(null)
  
  const particleSystem = useMemo(() => {
    const bounds = {
      min: new THREE.Vector3(-0.8, -1.2, -0.3),
      max: new THREE.Vector3(0.8, -0.8, 0.3)
    }
    return createParticleSystem(100, bounds, 8)
  }, [])
  
  particleSystemRef.current = particleSystem
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(100 * 3)
    const colors = new Float32Array(100 * 3)
    
    particleSystem.particles.forEach((particle, i) => {
      positions[i * 3] = particle.x
      positions[i * 3 + 1] = particle.y
      positions[i * 3 + 2] = particle.z
      
      // Organic brown/yellow colors
      colors[i * 3] = 0.8
      colors[i * 3 + 1] = 0.6
      colors[i * 3 + 2] = 0.2
    })
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geo
  }, [particleSystem])
  
  useFrame((state, delta) => {
    if (!active || !particleSystemRef.current || !pointsRef.current) return
    
    const bounds = {
      min: new THREE.Vector3(-0.8, -1.2, -0.3),
      max: new THREE.Vector3(0.8, 0.8, 0.3)
    }
    
    const forces = new THREE.Vector3(0, 0.5, 0)
    updateParticleSystem(particleSystemRef.current, delta, bounds, forces)
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    particleSystemRef.current.particles.forEach((particle, i) => {
      positions[i * 3] = particle.x
      positions[i * 3 + 1] = particle.y
      positions[i * 3 + 2] = particle.z
    })
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!active) return null
  
  return (
    <points ref={pointsRef}>
      <primitive attach="geometry" object={geometry} />
      <pointsMaterial
        size={0.015}
        vertexColors
        transparent
        opacity={0.7}
      />
    </points>
  )
}

interface BubbleSystemProps {
  active: boolean
}

function BubbleSystem({ active }: BubbleSystemProps) {
  const bubblesRef = useRef<Bubble[]>()
  const groupRef = useRef<THREE.Group>(null)
  
  const bubbles = useMemo(() => {
    const origin = new THREE.Vector3(0, -0.8, 0)
    return createBubbles(20, origin, 0.4)
  }, [])
  
  bubblesRef.current = bubbles
  
  useFrame((state, delta) => {
    if (!active || !bubblesRef.current || !groupRef.current) return
    
    const origin = new THREE.Vector3(0, -0.8, 0)
    updateBubbles(bubblesRef.current, delta, 1.0, origin, 0.4)
    
    groupRef.current.children.forEach((child, i) => {
      const bubble = bubblesRef.current![i]
      if (bubble && child) {
        child.position.copy(bubble.position)
        child.scale.setScalar(bubble.size * (1 + Math.sin(bubble.age * 4) * 0.1))
      }
    })
  })
  
  if (!active) return null
  
  return (
    <group ref={groupRef}>
      {bubbles.map((_, i) => (
        <Sphere key={i} args={[0.01, 8, 6]}>
          <meshPhysicalMaterial
            color="#88ccff"
            transparent
            opacity={0.6}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      ))}
    </group>
  )
}

interface MFCChamberProps {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label: string
  showBiofilm: boolean
}

function MFCChamber({ position, size, color, label, showBiofilm }: MFCChamberProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const { scale } = useSpring({
    scale: showBiofilm ? 1.1 : 1,
    config: ANIMATION_CONFIGS.smooth
  })
  
  useFrame((state) => {
    if (meshRef.current && showBiofilm) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.02
    }
  })
  
  return (
    <group position={position}>
      <animated.mesh ref={meshRef} scale={scale}>
        <Box args={size}>
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.3}
            roughness={0.2}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        </Box>
      </animated.mesh>
      
      {/* Biofilm layer */}
      {showBiofilm && (
        <Box args={[size[0] * 0.9, size[1] * 0.9, size[2] * 0.9]}>
          <meshPhysicalMaterial
            color="#4a5d23"
            transparent
            opacity={0.6}
            roughness={0.9}
            clearcoat={0.3}
          />
        </Box>
      )}
      
      <Html position={[0, size[1] / 2 + 0.2, 0]} center>
        <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          {label}
        </div>
      </Html>
    </group>
  )
}

function ElectrodeComponent({ position, size, color, label }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  label: string
}) {
  return (
    <group position={position}>
      <Cylinder args={size}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.8}
          clearcoat={0.5}
        />
      </Cylinder>
      
      <Html position={[0, size[1] + 0.1, 0]} center>
        <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          {label}
        </div>
      </Html>
    </group>
  )
}

interface MFCModelProps {
  autoRotate?: boolean
  showAnimations?: boolean
}

function MFCModel({ autoRotate = true, showAnimations = true }: MFCModelProps) {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(3, 2, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])
  
  const anodePos = new THREE.Vector3(-0.6, 0, 0)
  const cathodePos = new THREE.Vector3(0.6, 0, 0)
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a90e2" />
      
      {/* Anode Chamber */}
      <MFCChamber
        position={[-0.6, 0, 0]}
        size={[0.8, 1.2, 0.6]}
        color="#8B4513"
        label="Anode Chamber"
        showBiofilm={showAnimations}
      />
      
      {/* Cathode Chamber */}
      <MFCChamber
        position={[0.6, 0, 0]}
        size={[0.8, 1.2, 0.6]}
        color="#4169E1"
        label="Cathode Chamber"
        showBiofilm={false}
      />
      
      {/* Proton Exchange Membrane */}
      <Box args={[0.02, 1.0, 0.5]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#FFD700"
          transparent
          opacity={0.7}
          roughness={0.1}
          clearcoat={0.9}
        />
      </Box>
      
      <Html position={[0, 0.8, 0]} center>
        <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          PEM
        </div>
      </Html>
      
      {/* Electrodes */}
      <ElectrodeComponent
        position={[-0.3, 0, 0]}
        size={[0.03, 0.8, 0.03]}
        color="#2C2C2C"
        label="Anode"
      />
      
      <ElectrodeComponent
        position={[0.3, 0, 0]}
        size={[0.03, 0.8, 0.03]}
        color="#C0C0C0"
        label="Cathode"
      />
      
      {/* External Circuit */}
      <group>
        {/* Wire from anode */}
        <Cylinder args={[0.01, 0.01, 1.5]} position={[-0.3, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshPhysicalMaterial color="#FF6600" roughness={0.2} metalness={0.8} />
        </Cylinder>
        
        {/* Wire to cathode */}
        <Cylinder args={[0.01, 0.01, 1.5]} position={[0.3, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshPhysicalMaterial color="#FF6600" roughness={0.2} metalness={0.8} />
        </Cylinder>
        
        {/* Resistor/Load */}
        <Box args={[0.2, 0.05, 0.05]} position={[0, 0.9, 0]}>
          <meshPhysicalMaterial color="#8B4513" roughness={0.8} />
        </Box>
        
        <Html position={[0, 1.1, 0]} center>
          <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            Load (245.6 mW)
          </div>
        </Html>
      </group>
      
      {/* Animated Elements */}
      {showAnimations && (
        <>
          <SubstrateFlow active={true} />
          <ElectronFlow active={true} from={anodePos} to={cathodePos} />
          <BubbleSystem active={true} />
        </>
      )}
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
        maxDistance={8}
        minDistance={2}
      />
    </>
  )
}

interface InteractiveMFCModelProps {
  height?: string
  autoRotate?: boolean
  showControls?: boolean
  className?: string
}

export default function InteractiveMFCModel({
  height = "500px",
  autoRotate = true,
  showControls = true,
  className = ""
}: InteractiveMFCModelProps) {
  const [showAnimations, setShowAnimations] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
        <MFCModel autoRotate={autoRotate && isPlaying} showAnimations={showAnimations && isPlaying} />
      </Canvas>
      
      {showControls && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors text-sm"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={() => setShowAnimations(!showAnimations)}
            className="px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors text-sm"
          >
            {showAnimations ? 'Hide Flow' : 'Show Flow'}
          </button>
        </div>
      )}
      
      <div className="absolute top-4 right-4">
        <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
          <h3 className="font-medium text-sm mb-2">Microbial Fuel Cell</h3>
          <div className="text-xs space-y-1">
            <div>Power: 245.6 mW</div>
            <div>Voltage: 0.73 V</div>
            <div>Current: 336.4 mA</div>
            <div>Efficiency: 23.4%</div>
          </div>
        </div>
      </div>
    </div>
  )
}