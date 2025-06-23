'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Cylinder, Sphere } from '@react-three/drei'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface MFCConfig {
  electrode: {
    material: string
    surface: number
    thickness: number
  }
  microbial: {
    density: number
    species: string
    activity: number
  }
  chamber: {
    volume: number
    shape: string
    material: string
  }
}

interface MFC3DModelProps {
  config: MFCConfig
  onComponentSelect: (component: string) => void
  selectedComponent: string | null
}

function AnodeElectrode({ selected, onClick, config }: { selected: boolean, onClick: () => void, config: MFCConfig }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const getElectrodeColor = () => {
    switch (config.electrode.material) {
      // Traditional materials
      case 'carbon-cloth': return '#2a2a2a'
      case 'graphite': return '#4a4a4a'
      case 'stainless-steel': return '#c0c0c0'
      
      // Graphene materials - blue tones
      case 'graphene-oxide': return '#1e40af'
      case 'reduced-graphene-oxide': return '#1e3a8a'
      case 'graphene-carbon-cloth': return '#3730a3'
      case 'graphene-foam': return '#5b21b6'
      case 'graphene-aerogel': return '#7c3aed'
      
      // CNT materials - green tones
      case 'swcnt': return '#059669'
      case 'mwcnt': return '#047857'
      case 'cnt-carbon-cloth': return '#065f46'
      case 'cnt-graphene': return '#064e3b'
      case 'cnt-paper': return '#0f766e'
      
      // MXene materials - orange/red tones
      case 'ti3c2tx': return '#dc2626'
      case 'ti2ctx': return '#ea580c'
      case 'mxene-carbon-cloth': return '#f97316'
      case 'mxene-graphene': return '#fb923c'
      case 'nb2ctx': return '#f59e0b'
      case 'v2ctx': return '#eab308'
      
      // Upcycled materials - amber/copper tones
      case 'iphone-cord-copper': return '#cd7c0f'
      case 'iphone-cord-copper-etched': return '#b45309'
      case 'iphone-cord-copper-anodized': return '#92400e'
      case 'reclaimed-copper-wire': return '#d97706'
      case 'reclaimed-copper-oxidized': return '#a16207'
      case 'upcycled-copper-mesh': return '#78350f'
      case 'cable-core-composite': return '#f59e0b'
      case 'electroplated-reclaimed': return '#451a03'
      
      default: return '#2a2a2a'
    }
  }
  
  const getElectrodeEmissive = () => {
    if (config.electrode.material.includes('graphene')) return '#1e40af'
    if (config.electrode.material.includes('cnt')) return '#059669'
    if (config.electrode.material.includes('mxene')) return '#dc2626'
    if (config.electrode.material.includes('upcycled') || config.electrode.material.includes('reclaimed') || config.electrode.material.includes('iphone') || config.electrode.material.includes('cable')) return '#d97706'
    return '#000000'
  }
  
  const getElectrodeEmissiveIntensity = () => {
    if (config.electrode.material.includes('aerogel')) return 0.2
    if (config.electrode.material.includes('graphene') || config.electrode.material.includes('cnt')) return 0.1
    if (config.electrode.material.includes('mxene')) return 0.15
    if (config.electrode.material.includes('electroplated') || config.electrode.material.includes('anodized')) return 0.12
    if (config.electrode.material.includes('upcycled') || config.electrode.material.includes('reclaimed')) return 0.05
    return 0
  }
  
  const getElectrodeRoughness = () => {
    if (config.electrode.material.includes('aerogel') || config.electrode.material.includes('foam')) return 0.9
    if (config.electrode.material.includes('graphene')) return 0.3
    if (config.electrode.material.includes('cnt')) return 0.4
    if (config.electrode.material.includes('mxene')) return 0.2
    if (config.electrode.material === 'stainless-steel') return 0.2
    if (config.electrode.material.includes('etched') || config.electrode.material.includes('mesh')) return 0.7
    if (config.electrode.material.includes('copper') || config.electrode.material.includes('reclaimed')) return 0.6
    if (config.electrode.material.includes('electroplated')) return 0.3
    return 0.8
  }
  
  const getElectrodeMetalness = () => {
    if (config.electrode.material.includes('mxene')) return 0.9
    if (config.electrode.material === 'stainless-steel') return 0.8
    if (config.electrode.material.includes('graphene') && !config.electrode.material.includes('oxide')) return 0.7
    if (config.electrode.material.includes('cnt')) return 0.5
    if (config.electrode.material.includes('copper') || config.electrode.material.includes('electroplated')) return 0.9
    if (config.electrode.material.includes('anodized')) return 0.7
    if (config.electrode.material.includes('reclaimed') || config.electrode.material.includes('cable')) return 0.6
    return 0.1
  }

  return (
    <group onClick={onClick}>
      <Box
        ref={meshRef}
        args={[2, 0.2, config.electrode.thickness]}
        position={[-1.5, 0, 0]}
      >
        <meshStandardMaterial 
          color={selected ? '#ff6b6b' : getElectrodeColor()}
          emissive={selected ? '#ff3333' : getElectrodeEmissive()}
          emissiveIntensity={selected ? 0.3 : getElectrodeEmissiveIntensity()}
          roughness={getElectrodeRoughness()}
          metalness={getElectrodeMetalness()}
        />
      </Box>
      {selected && (
        <Text
          position={[-1.5, 1, 0]}
          fontSize={0.3}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Anode ({config.electrode.material})
        </Text>
      )}
    </group>
  )
}

function CathodeElectrode({ selected, onClick, config }: { selected: boolean, onClick: () => void, config: MFCConfig }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <group onClick={onClick}>
      <Box
        ref={meshRef}
        args={[2, 0.2, config.electrode.thickness]}
        position={[1.5, 0, 0]}
      >
        <meshStandardMaterial 
          color={selected ? '#4ecdc4' : '#666666'}
          emissive={selected ? '#2aa198' : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
          roughness={0.6}
          metalness={0.3}
        />
      </Box>
      {selected && (
        <Text
          position={[1.5, 1, 0]}
          fontSize={0.3}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Cathode (O2 Reduction)
        </Text>
      )}
    </group>
  )
}

function MicrobialCommunity({ selected, onClick, config }: { selected: boolean, onClick: () => void, config: MFCConfig }) {
  const getMicrobialColor = () => {
    switch (config.microbial.species) {
      case 'geobacter': return '#00ff00'
      case 'shewanella': return '#ffff00'
      case 'mixed-culture': return '#ff9500'
      default: return '#00ff00'
    }
  }

  const particleCount = Math.floor(config.microbial.density * 10)
  
  return (
    <group onClick={onClick}>
      {/* Biofilm layer */}
      <Box
        args={[1.8, 0.1, 1.5]}
        position={[-1.4, 0.15, 0]}
      >
        <meshStandardMaterial 
          color={selected ? getMicrobialColor() : '#22aa22'}
          transparent
          opacity={selected ? 0.8 : 0.6}
          emissive={selected ? getMicrobialColor() : '#001100'}
          emissiveIntensity={selected ? 0.2 : 0.1}
        />
      </Box>
      
      {/* Microbial particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02]}
          position={[
            -2.2 + Math.random() * 1.4,
            -0.3 + Math.random() * 0.6,
            -0.7 + Math.random() * 1.4
          ]}
        >
          <meshStandardMaterial 
            color={getMicrobialColor()}
            emissive={getMicrobialColor()}
            emissiveIntensity={config.microbial.activity / 100}
          />
        </Sphere>
      ))}
      
      {selected && (
        <Text
          position={[-1.4, 0.8, 0]}
          fontSize={0.25}
          color={getMicrobialColor()}
          anchorX="center"
          anchorY="middle"
        >
          {config.microbial.species} ({config.microbial.density}M cells/mL)
        </Text>
      )}
    </group>
  )
}

function Chamber({ selected, onClick, config }: { selected: boolean, onClick: () => void, config: MFCConfig }) {
  const getChamberComponent = () => {
    switch (config.chamber.shape) {
      case 'cylindrical':
        return (
          <Cylinder
            args={[1.5, 1.5, 3, 32]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshStandardMaterial 
              color={selected ? '#61dafb' : '#87ceeb'}
              transparent
              opacity={0.3}
              emissive={selected ? '#1e90ff' : '#000000'}
              emissiveIntensity={selected ? 0.1 : 0}
            />
          </Cylinder>
        )
      case 'rectangular':
      default:
        return (
          <Box args={[4, 2, 2]}>
            <meshStandardMaterial 
              color={selected ? '#61dafb' : '#87ceeb'}
              transparent
              opacity={0.3}
              emissive={selected ? '#1e90ff' : '#000000'}
              emissiveIntensity={selected ? 0.1 : 0}
            />
          </Box>
        )
    }
  }

  return (
    <group onClick={onClick}>
      {getChamberComponent()}
      {selected && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.3}
          color="#61dafb"
          anchorX="center"
          anchorY="middle"
        >
          {config.chamber.shape} ({config.chamber.volume}L)
        </Text>
      )}
    </group>
  )
}

function ElectronFlow({ config }: { config: MFCConfig }) {
  return (
    <group>
      {/* Electron flow visualization */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.03]}
          position={[
            -1.5 + (i * 0.4),
            0.5 + Math.sin(Date.now() * 0.005 + i) * 0.1,
            0
          ]}
        >
          <meshStandardMaterial 
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  )
}

function MFCScene({ config, onComponentSelect, selectedComponent }: MFC3DModelProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <Chamber 
        selected={selectedComponent === 'chamber'}
        onClick={() => onComponentSelect('chamber')}
        config={config}
      />
      
      <AnodeElectrode 
        selected={selectedComponent === 'anode'}
        onClick={() => onComponentSelect('anode')}
        config={config}
      />
      
      <CathodeElectrode 
        selected={selectedComponent === 'cathode'}
        onClick={() => onComponentSelect('cathode')}
        config={config}
      />
      
      <MicrobialCommunity 
        selected={selectedComponent === 'microbial'}
        onClick={() => onComponentSelect('microbial')}
        config={config}
      />
      
      <ElectronFlow config={config} />
      
      <Environment preset="studio" />
    </>
  )
}

export default function MFC3DModel({ config, onComponentSelect, selectedComponent }: MFC3DModelProps) {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <MFCScene 
          config={config} 
          onComponentSelect={onComponentSelect}
          selectedComponent={selectedComponent}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>
    </div>
  )
}