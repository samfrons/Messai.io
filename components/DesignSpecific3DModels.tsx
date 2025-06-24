'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Cylinder, Sphere, Cone, Plane, RoundedBox } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

interface Design3DModelProps {
  designType: string
  scale?: number
  showLabels?: boolean
}

// Micro MFC Chip - 1cm³ silicon microchamber
function MicroChipModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Silicon substrate */}
      <Box args={[2, 0.1, 1.5]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Microchambers */}
      <Box args={[0.4, 0.15, 0.3]} position={[-0.6, -0.1, 0]}>
        <meshStandardMaterial color="#4299e1" transparent opacity={0.7} />
      </Box>
      <Box args={[0.4, 0.15, 0.3]} position={[0.6, -0.1, 0]}>
        <meshStandardMaterial color="#4299e1" transparent opacity={0.7} />
      </Box>
      
      {/* Gold microelectrodes */}
      <Box args={[0.05, 0.05, 0.25]} position={[-0.3, -0.05, 0]}>
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.05, 0.05, 0.25]} position={[0.3, -0.05, 0]}>
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </Box>
      
      {/* Nafion membrane */}
      <Plane args={[0.02, 0.3]} position={[0, -0.05, 0]} rotation={[0, Math.PI/2, 0]}>
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} />
      </Plane>
      
      {showLabels && (
        <Text position={[0, 0.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
          Micro MFC Chip (1cm³)
        </Text>
      )}
    </group>
  )
}

// Isolinear Bio-Chip - Star Trek inspired microscope slide
function IsolinearChipModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Microscope slide base */}
      <Box args={[3, 0.05, 1]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.9} />
      </Box>
      
      {/* Isolinear pattern channels */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} args={[2.5, 0.03, 0.08]} position={[0, -0.05, -0.32 + i * 0.16]}>
          <meshStandardMaterial color="#4299e1" emissive="#1e40af" emissiveIntensity={0.3} />
        </Box>
      ))}
      
      {/* ITO electrodes (transparent) */}
      <Box args={[0.8, 0.02, 0.8]} position={[-1, -0.03, 0]}>
        <meshStandardMaterial color="#81d4fa" transparent opacity={0.3} metalness={0.7} />
      </Box>
      <Box args={[0.8, 0.02, 0.8]} position={[1, -0.03, 0]}>
        <meshStandardMaterial color="#81d4fa" transparent opacity={0.3} metalness={0.7} />
      </Box>
      
      {/* Optical monitoring ports */}
      <Cylinder args={[0.05, 0.05, 0.1]} position={[-0.8, 0.05, 0.3]}>
        <meshStandardMaterial color="#000000" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.1]} position={[0.8, 0.05, 0.3]}>
        <meshStandardMaterial color="#000000" />
      </Cylinder>
      
      {showLabels && (
        <Text position={[0, 0.4, 0]} fontSize={0.15} color="#1e40af" anchorX="center">
          Isolinear Bio-Chip
        </Text>
      )}
    </group>
  )
}

// Benchtop Bioreactor - 5L stirred tank
function BenchtopBioreactorModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Main reactor vessel */}
      <Cylinder args={[1, 1, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.6} />
      </Cylinder>
      
      {/* Reactor base */}
      <Cylinder args={[1.2, 1.2, 0.2]} position={[0, -1.1, 0]}>
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.3} />
      </Cylinder>
      
      {/* Stirrer shaft */}
      <Cylinder args={[0.02, 0.02, 2.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Impeller blades */}
      <Box args={[0.6, 0.03, 0.1]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.1, 0.03, 0.6]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
      </Box>
      
      {/* Graphite felt electrodes */}
      <Box args={[0.8, 0.2, 0.05]} position={[-0.4, 0, 0.8]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Box>
      <Box args={[0.8, 0.2, 0.05]} position={[0.4, 0, 0.8]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Box>
      
      {/* Sensors */}
      <Cylinder args={[0.03, 0.03, 0.3]} position={[0.8, 0.5, 0]} rotation={[0, 0, Math.PI/4]}>
        <meshStandardMaterial color="#ffd700" metalness={0.8} />
      </Cylinder>
      
      {showLabels && (
        <Text position={[0, 1.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
          Benchtop Bioreactor (5L)
        </Text>
      )}
    </group>
  )
}

// Wastewater Treatment - Large modular system
function WastewaterTreatmentModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Main treatment tank */}
      <Box args={[4, 2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.4} />
      </Box>
      
      {/* Modular compartments */}
      <Box args={[1.8, 1.8, 1.8]} position={[-1, 0, 0]}>
        <meshStandardMaterial color="#2d3748" transparent opacity={0.3} />
      </Box>
      <Box args={[1.8, 1.8, 1.8]} position={[1, 0, 0]}>
        <meshStandardMaterial color="#2d3748" transparent opacity={0.3} />
      </Box>
      
      {/* Stainless steel mesh arrays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} args={[0.1, 1.5, 1.5]} position={[-1.5 + i * 0.4, 0, 0]}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </Box>
      ))}
      
      {/* Ceramic membrane separator */}
      <Plane args={[1.8, 1.8]} position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <meshStandardMaterial color="#f7fafc" roughness={0.8} />
      </Plane>
      
      {/* Inlet/outlet pipes */}
      <Cylinder args={[0.08, 0.08, 1]} position={[-2.5, 0.8, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#4a5568" metalness={0.7} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 1]} position={[2.5, -0.8, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#4a5568" metalness={0.7} />
      </Cylinder>
      
      {showLabels && (
        <Text position={[0, 1.5, 0]} fontSize={0.15} color="#4a90e2" anchorX="center">
          Wastewater Treatment (500L)
        </Text>
      )}
    </group>
  )
}

// Brewery Processing - Food-grade system
function BreweryProcessingModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Stainless steel tank */}
      <Cylinder args={[1.2, 1.2, 2.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Conical bottom */}
      <Cone args={[1.2, 0.8, 8]} position={[0, -1.9, 0]}>
        <meshStandardMaterial color="#d6d9dc" metalness={0.9} roughness={0.1} />
      </Cone>
      
      {/* Carbon brush anodes */}
      <Cylinder args={[0.05, 0.05, 2]} position={[-0.8, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 2]} position={[0.8, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Cylinder>
      
      {/* CIP spray balls */}
      <Sphere args={[0.05]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </Sphere>
      <Sphere args={[0.05]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </Sphere>
      
      {/* Brewery wastewater (golden) */}
      <Cylinder args={[1.1, 1.1, 2.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#d4a574" transparent opacity={0.6} />
      </Cylinder>
      
      {showLabels && (
        <Text position={[0, 1.8, 0]} fontSize={0.15} color="#d4a574" anchorX="center">
          Brewery Processing MFC
        </Text>
      )}
    </group>
  )
}

// Architectural Facade - Building integrated
function ArchitecturalFacadeModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Building facade panel */}
      <Box args={[3, 4, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a5568" metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Modular MFC units */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} args={[0.8, 0.8, 0.15]} position={[-1 + (i % 3) * 1, 0.8 - Math.floor(i / 3) * 1.6, 0.1]}>
          <meshStandardMaterial 
            color="#4299e1" 
            transparent 
            opacity={0.7}
            emissive="#1e40af"
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
      
      {/* Flexible carbon composites */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} args={[0.6, 0.05, 0.6]} position={[-1 + (i % 3) * 1, 0.8 - Math.floor(i / 3) * 1.6, 0.2]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </Box>
      ))}
      
      {/* Weather sealing */}
      <Box args={[3.2, 4.2, 0.05]} position={[0, 0, -0.15]}>
        <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.3} />
      </Box>
      
      {/* Power collection grid */}
      <Box args={[0.05, 4]} position={[-1.5, 0, 0.25]}>
        <meshStandardMaterial color="#ffd700" metalness={0.9} />
      </Box>
      <Box args={[0.05, 4]} position={[1.5, 0, 0.25]}>
        <meshStandardMaterial color="#ffd700" metalness={0.9} />
      </Box>
      
      {showLabels && (
        <Text position={[0, 2.5, 0]} fontSize={0.15} color="#4299e1" anchorX="center">
          BioFacade Power Cell
        </Text>
      )}
    </group>
  )
}

// Benthic Fuel Cell - Marine deployment
function BenthicFuelCellModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Marine-grade housing */}
      <Cylinder args={[0.8, 0.8, 1.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
      </Cylinder>
      
      {/* Sediment layer */}
      <Cylinder args={[2, 2, 0.3]} position={[0, -0.65, 0]}>
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </Cylinder>
      
      {/* Titanium electrodes */}
      <Box args={[1.2, 0.05, 1.2]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </Box>
      
      {/* Anode buried in sediment */}
      <Box args={[0.8, 0.05, 0.8]} position={[0, -0.7, 0]}>
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.2} />
      </Box>
      
      {/* Water column */}
      <Cylinder args={[2.5, 2.5, 2]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#4682b4" transparent opacity={0.3} />
      </Cylinder>
      
      {/* Marine organisms */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Sphere key={i} args={[0.02]} position={[
          -0.6 + Math.random() * 1.2,
          -0.6 + Math.random() * 0.2,
          -0.6 + Math.random() * 1.2
        ]}>
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
        </Sphere>
      ))}
      
      {/* Power cable */}
      <Cylinder args={[0.02, 0.02, 3]} position={[1, 1, 0]} rotation={[0, 0, Math.PI/6]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      
      {showLabels && (
        <Text position={[0, 1, 0]} fontSize={0.15} color="#4682b4" anchorX="center">
          Benthic Sediment MFC
        </Text>
      )}
    </group>
  )
}

// Kitchen Sink Bio-Cell - Under-sink installation
function KitchenSinkModel({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {/* Under-sink housing */}
      <Box args={[2, 1, 1.5]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#f7fafc" metalness={0.1} roughness={0.8} />
      </Box>
      
      {/* Sink connection pipe */}
      <Cylinder args={[0.08, 0.08, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#4a5568" metalness={0.7} />
      </Cylinder>
      
      {/* Food-safe carbon mesh */}
      <Box args={[1.5, 0.1, 1.2]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </Box>
      <Box args={[1.5, 0.1, 1.2]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </Box>
      
      {/* Organic waste particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere key={i} args={[0.03]} position={[
          -0.6 + Math.random() * 1.2,
          -0.3 + Math.random() * 0.4,
          -0.4 + Math.random() * 0.8
        ]}>
          <meshStandardMaterial color="#8b4513" />
        </Sphere>
      ))}
      
      {/* Garbage disposal connection */}
      <Cylinder args={[0.12, 0.12, 0.3]} position={[0.8, 0.2, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.8} />
      </Cylinder>
      
      {/* Power output cable */}
      <Cylinder args={[0.01, 0.01, 0.5]} position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#dc2626" />
      </Cylinder>
      
      {/* LED status indicator */}
      <Sphere args={[0.02]} position={[-0.8, 0.3, 0.6]}>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </Sphere>
      
      {showLabels && (
        <Text position={[0, 0.8, 0]} fontSize={0.15} color="#8b4513" anchorX="center">
          Kitchen Sink Bio-Cell
        </Text>
      )}
    </group>
  )
}

// Main component that renders the appropriate 3D model
export default function DesignSpecific3DModel({ designType, scale = 1, showLabels = false }: Design3DModelProps) {
  const renderDesignModel = () => {
    switch (designType) {
      case 'micro-chip':
        return <MicroChipModel showLabels={showLabels} />
      case 'isolinear-chip':
        return <IsolinearChipModel showLabels={showLabels} />
      case 'benchtop-bioreactor':
        return <BenchtopBioreactorModel showLabels={showLabels} />
      case 'wastewater-treatment':
        return <WastewaterTreatmentModel showLabels={showLabels} />
      case 'brewery-processing':
        return <BreweryProcessingModel showLabels={showLabels} />
      case 'architectural-facade':
        return <ArchitecturalFacadeModel showLabels={showLabels} />
      case 'benthic-fuel-cell':
        return <BenthicFuelCellModel showLabels={showLabels} />
      case 'kitchen-sink':
        return <KitchenSinkModel showLabels={showLabels} />
      default:
        // Fallback to generic MFC model for original designs
        return (
          <group>
            <Box args={[2, 1, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} />
            </Box>
            <Box args={[0.1, 0.8, 0.8]} position={[-0.8, 0, 0]}>
              <meshStandardMaterial color="#2d3748" />
            </Box>
            <Box args={[0.1, 0.8, 0.8]} position={[0.8, 0, 0]}>
              <meshStandardMaterial color="#2d3748" />
            </Box>
            {showLabels && (
              <Text position={[0, 0.8, 0]} fontSize={0.15} color="#4a90e2" anchorX="center">
                {designType.replace('-', ' ').toUpperCase()}
              </Text>
            )}
          </group>
        )
    }
  }

  return (
    <group scale={[scale, scale, scale]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />
      {renderDesignModel()}
      <Environment preset="studio" />
    </group>
  )
}

// Wrapper component for use in design cards
export function Design3DPreview({ designType }: { designType: string }) {
  return (
    <div className="w-full h-24 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <DesignSpecific3DModel designType={designType} scale={0.8} showLabels={false} />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  )
}