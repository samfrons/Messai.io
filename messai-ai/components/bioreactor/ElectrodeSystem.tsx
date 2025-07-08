import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BioreactorModel } from '@/lib/bioreactor-catalog'
import { isMeshStandardMaterial, isMeshBasicMaterial, isMeshPhysicalMaterial } from '@/lib/types/three-helpers'

interface ElectrodeSystemProps {
  model: BioreactorModel
  parameters: {
    electrodeVoltage: number
    temperature: number
    ph: number
    [key: string]: number
  }
  webgpuSupported: boolean
}

export function ElectrodeSystem({ model, parameters, webgpuSupported }: ElectrodeSystemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const electricFieldRef = useRef<THREE.Mesh>(null)

  // Generate electrode configuration based on model
  const electrodes = useMemo(() => {
    return generateElectrodeConfiguration(model)
  }, [model])

  // Electric field visualization
  const electricField = useMemo(() => {
    if (!webgpuSupported) return null

    return generateElectricField(model, parameters.electrodeVoltage)
  }, [model, parameters.electrodeVoltage, webgpuSupported])

  // Animation for electric field and electron flow
  useFrame((state, delta) => {
    if (electricFieldRef.current) {
      // Animate electric field intensity
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      const material = electricFieldRef.current.material
      if (isMeshBasicMaterial(material)) {
        material.opacity = intensity * parameters.electrodeVoltage / 100
      }
    }

    // Animate electron flow along electrodes
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        if (child.name.includes('electron-flow')) {
          child.rotation.z += delta * parameters.electrodeVoltage * 0.1
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Render electrodes */}
      {electrodes.map((electrode, index) => (
        <ElectrodeComponent
          key={`electrode-${index}`}
          electrode={electrode}
          parameters={parameters}
          webgpuSupported={webgpuSupported}
        />
      ))}

      {/* Electric field visualization */}
      {electricField && (
        <mesh ref={electricFieldRef} geometry={electricField.geometry} material={electricField.material} />
      )}

      {/* Biofilm visualization */}
      <BiofilmVisualization model={model} parameters={parameters} />
    </group>
  )
}

interface ElectrodeConfig {
  type: 'anode' | 'cathode'
  position: THREE.Vector3
  geometry: 'plate' | 'brush' | 'mesh' | 'composite'
  material: string[]
  dimensions: {
    width: number
    height: number
    depth: number
  }
  surfaceArea: number
}

function generateElectrodeConfiguration(model: BioreactorModel): ElectrodeConfig[] {
  const electrodes: ElectrodeConfig[] = []
  const spacing = model.electrodes.spacing || 4

  switch (model.electrodes.configuration) {
    case 'single':
      electrodes.push(
        {
          type: 'anode',
          position: new THREE.Vector3(-spacing / 200, 0, 0), // Convert cm to m
          geometry: model.electrodes.anode.geometry,
          material: model.electrodes.anode.material,
          dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
          surfaceArea: model.electrodes.anode.surfaceArea || 100
        },
        {
          type: 'cathode',
          position: new THREE.Vector3(spacing / 200, 0, 0),
          geometry: model.electrodes.cathode.geometry,
          material: model.electrodes.cathode.material,
          dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
          surfaceArea: 100
        }
      )
      break

    case 'multiple':
      // Create multiple electrode pairs
      const pairs = 3
      for (let i = 0; i < pairs; i++) {
        const y = (i - (pairs - 1) / 2) * 0.4
        electrodes.push(
          {
            type: 'anode',
            position: new THREE.Vector3(-spacing / 200, y, 0),
            geometry: model.electrodes.anode.geometry,
            material: model.electrodes.anode.material,
            dimensions: { width: 0.6, height: 0.3, depth: 0.05 },
            surfaceArea: (model.electrodes.anode.surfaceArea || 100) / pairs
          },
          {
            type: 'cathode',
            position: new THREE.Vector3(spacing / 200, y, 0),
            geometry: model.electrodes.cathode.geometry,
            material: model.electrodes.cathode.material,
            dimensions: { width: 0.6, height: 0.3, depth: 0.05 },
            surfaceArea: 100 / pairs
          }
        )
      }
      break

    case 'serpentine':
      // Create serpentine electrode pattern
      const segments = 5
      for (let i = 0; i < segments; i++) {
        const z = (i - (segments - 1) / 2) * 0.3
        const x = (i % 2 === 0) ? -spacing / 200 : spacing / 200
        const type = (i % 2 === 0) ? 'anode' : 'cathode'
        
        electrodes.push({
          type: type as 'anode' | 'cathode',
          position: new THREE.Vector3(x, 0, z),
          geometry: 'plate',
          material: type === 'anode' ? model.electrodes.anode.material : model.electrodes.cathode.material,
          dimensions: { width: 0.05, height: 1.0, depth: 0.25 },
          surfaceArea: (model.electrodes.anode.surfaceArea || 100) / segments
        })
      }
      break

    case 'interdigitate':
      // Create interdigitated electrode pattern
      const fingers = 8
      for (let i = 0; i < fingers; i++) {
        const z = (i - (fingers - 1) / 2) * 0.2
        const type = (i % 2 === 0) ? 'anode' : 'cathode'
        const x = (type === 'anode') ? -0.1 : 0.1
        
        electrodes.push({
          type: type,
          position: new THREE.Vector3(x, 0, z),
          geometry: 'plate',
          material: type === 'anode' ? model.electrodes.anode.material : model.electrodes.cathode.material,
          dimensions: { width: 0.02, height: 1.0, depth: 0.15 },
          surfaceArea: (model.electrodes.anode.surfaceArea || 100) / fingers
        })
      }
      break

    default:
      // Default single pair
      electrodes.push(
        {
          type: 'anode',
          position: new THREE.Vector3(-0.5, 0, 0),
          geometry: 'plate',
          material: ['Carbon cloth'],
          dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
          surfaceArea: 100
        },
        {
          type: 'cathode',
          position: new THREE.Vector3(0.5, 0, 0),
          geometry: 'plate',
          material: ['Stainless steel'],
          dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
          surfaceArea: 100
        }
      )
  }

  return electrodes
}

function ElectrodeComponent({ 
  electrode, 
  parameters, 
  webgpuSupported 
}: { 
  electrode: ElectrodeConfig
  parameters: any
  webgpuSupported: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Generate geometry based on electrode type
  const geometry = useMemo(() => {
    switch (electrode.geometry) {
      case 'plate':
        return new THREE.BoxGeometry(
          electrode.dimensions.width,
          electrode.dimensions.height,
          electrode.dimensions.depth
        )
      
      case 'brush':
        return createBrushGeometry(electrode.dimensions)
      
      case 'mesh':
        return createMeshGeometry(electrode.dimensions)
      
      case 'composite':
        return createCompositeGeometry(electrode.dimensions)
      
      default:
        return new THREE.BoxGeometry(
          electrode.dimensions.width,
          electrode.dimensions.height,
          electrode.dimensions.depth
        )
    }
  }, [electrode])

  // Generate material based on electrode material
  const material = useMemo(() => {
    return createElectrodeMaterial(electrode, parameters)
  }, [electrode, parameters])

  // Animation for electrode activity
  useFrame((state, delta) => {
    if (meshRef.current && isMeshStandardMaterial(material)) {
      // Simulate electrode activity with emissive intensity
      const activity = electrode.type === 'anode' 
        ? 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05
        : 0.05 + Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.03
      
      material.emissiveIntensity = activity * parameters.electrodeVoltage / 100
    }
  })

  return (
    <group position={electrode.position}>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
      
      {/* Electron flow visualization */}
      <ElectronFlow electrode={electrode} parameters={parameters} webgpuSupported={webgpuSupported} />
      
      {/* Current density visualization */}
      <CurrentDensityField electrode={electrode} parameters={parameters} />
    </group>
  )
}

function createBrushGeometry(dimensions: { width: number; height: number; depth: number }) {
  // For now, return a simple box geometry to represent the brush electrode
  // TODO: Implement proper brush geometry using merged geometries
  return new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  )
}

function createMeshGeometry(dimensions: { width: number; height: number; depth: number }) {
  // Create mesh-like geometry with wireframe appearance
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  )

  // Add wireframe overlay
  const wireframe = new THREE.WireframeGeometry(geometry)
  return wireframe
}

function createCompositeGeometry(dimensions: { width: number; height: number; depth: number }) {
  // For now, return a simple box geometry to represent the composite electrode
  // TODO: Implement proper composite geometry using merged geometries
  return new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  )
}

function createElectrodeMaterial(electrode: ElectrodeConfig, parameters: any) {
  const materialName = electrode.material[0].toLowerCase()
  
  if (materialName.includes('carbon')) {
    return new THREE.MeshStandardMaterial({
      color: electrode.type === 'anode' ? 0x2d3748 : 0x4a5568,
      metalness: 0.1,
      roughness: 0.9,
      emissive: electrode.type === 'anode' ? 0x1a202c : 0x2d3748,
      emissiveIntensity: 0.1
    })
  } else if (materialName.includes('stainless steel')) {
    return new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x666666,
      emissiveIntensity: 0.05
    })
  } else if (materialName.includes('platinum')) {
    return new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0xe0e0e0,
      emissiveIntensity: 0.02
    })
  } else if (materialName.includes('graphene')) {
    return new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.3,
      roughness: 0.7,
      emissive: 0x9b59b6,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.8
    })
  } else if (materialName.includes('gold')) {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffd700,
      emissiveIntensity: 0.1
    })
  } else {
    // Default material
    return new THREE.MeshStandardMaterial({
      color: electrode.type === 'anode' ? 0x8b4513 : 0x696969,
      metalness: 0.5,
      roughness: 0.5,
      emissive: electrode.type === 'anode' ? 0x8b4513 : 0x696969,
      emissiveIntensity: 0.05
    })
  }
}

function ElectronFlow({ electrode, parameters, webgpuSupported }: {
  electrode: ElectrodeConfig
  parameters: any
  webgpuSupported: boolean
}) {
  const flowRef = useRef<THREE.Group>(null)

  // Create electron flow particles
  const electronParticles = useMemo(() => {
    const particleCount = 20
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.01, 8, 8)
      const material = new THREE.MeshBasicMaterial({
        color: electrode.type === 'anode' ? 0xff4444 : 0x4444ff,
        transparent: true,
        opacity: 0.7
      })

      particles.push(
        <mesh key={`electron-${i}`} geometry={geometry} material={material}>
          <meshBasicMaterial
            color={electrode.type === 'anode' ? 0xff4444 : 0x4444ff}
            transparent
            opacity={0.7}
          />
        </mesh>
      )
    }

    return particles
  }, [electrode.type])

  useFrame((state, delta) => {
    if (flowRef.current) {
      flowRef.current.children.forEach((child, index) => {
        // Animate electron movement
        const speed = parameters.electrodeVoltage * 0.01
        const direction = electrode.type === 'anode' ? 1 : -1
        
        child.position.x += direction * speed * delta
        child.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.002

        // Reset position when out of bounds
        if (Math.abs(child.position.x) > 0.5) {
          child.position.x = -direction * 0.5
          child.position.y = (Math.random() - 0.5) * electrode.dimensions.height
          child.position.z = (Math.random() - 0.5) * electrode.dimensions.width
        }
      })
    }
  })

  return (
    <group ref={flowRef} name="electron-flow" visible={parameters.electrodeVoltage > 0}>
      {electronParticles}
    </group>
  )
}

function CurrentDensityField({ electrode, parameters }: {
  electrode: ElectrodeConfig
  parameters: any
}) {
  const fieldRef = useRef<THREE.Mesh>(null)

  // Create current density visualization
  const fieldGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      electrode.dimensions.width * 1.1,
      electrode.dimensions.height * 1.1
    )
  }, [electrode.dimensions])

  const fieldMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')
    
    if (!context) {
      return new THREE.MeshBasicMaterial({ color: 0xff0000 })
    }

    // Create current density gradient
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, electrode.type === 'anode' ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 100, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  }, [electrode.type])

  useFrame((state) => {
    if (fieldRef.current && isMeshBasicMaterial(fieldMaterial)) {
      // Animate current density intensity
      const intensity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2
      fieldMaterial.opacity = intensity * parameters.electrodeVoltage / 100
    }
  })

  return (
    <mesh
      ref={fieldRef}
      geometry={fieldGeometry}
      material={fieldMaterial}
      position={[0, 0, electrode.dimensions.depth / 2 + 0.01]}
      visible={parameters.electrodeVoltage > 0}
    />
  )
}

function BiofilmVisualization({ model, parameters }: {
  model: BioreactorModel
  parameters: any
}) {
  const biofilmRef = useRef<THREE.Group>(null)

  // Generate biofilm on electrode surfaces
  const biofilmLayers = useMemo(() => {
    const layers = []
    const layerCount = 3

    for (let i = 0; i < layerCount; i++) {
      const thickness = 0.005 * (i + 1)
      const opacity = 0.4 - i * 0.1

      layers.push(
        <mesh key={`biofilm-layer-${i}`} position={[0, 0, thickness * i]}>
          <boxGeometry args={[0.82 + thickness * 2, 1.02 + thickness * 2, thickness]} />
          <meshPhysicalMaterial
            color={0x4caf50}
            transparent
            opacity={opacity}
            transmission={0.2}
            thickness={thickness}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )
    }

    return layers
  }, [])

  useFrame((state, delta) => {
    if (biofilmRef.current) {
      // Animate biofilm growth
      const growthFactor = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      biofilmRef.current.scale.setScalar(growthFactor)

      // pH and temperature effects on biofilm
      const healthFactor = calculateBiofilmHealth(parameters.ph, parameters.temperature)
      biofilmRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && isMeshPhysicalMaterial(child.material)) {
          child.material.opacity = healthFactor * 0.4
        }
      })
    }
  })

  return (
    <group ref={biofilmRef} position={[-0.5, 0, 0]} visible={parameters.showBiofilm}>
      {biofilmLayers}
    </group>
  )
}

function calculateBiofilmHealth(ph: number, temperature: number): number {
  // Optimal conditions: pH 7, temperature 30°C
  const phOptimal = 7.0
  const tempOptimal = 30.0
  
  const phFactor = Math.exp(-Math.pow(ph - phOptimal, 2) / 4)
  const tempFactor = Math.exp(-Math.pow(temperature - tempOptimal, 2) / 200)
  
  return phFactor * tempFactor
}

function generateElectricField(model: BioreactorModel, voltage: number) {
  if (voltage === 0) return null

  // Create electric field visualization between electrodes
  const fieldGeometry = new THREE.BoxGeometry(1, 1, 0.1)
  const fieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  })

  return {
    geometry: fieldGeometry,
    material: fieldMaterial
  }
}