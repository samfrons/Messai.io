import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BioreactorModel } from '@/lib/bioreactor-catalog'

interface BioreactorGeometryProps {
  model: BioreactorModel
  parameters: {
    temperature: number
    ph: number
    flowRate: number
    mixingSpeed: number
    [key: string]: number
  }
  animationSpeed: number
}

export function BioreactorGeometry({ model, parameters, animationSpeed }: BioreactorGeometryProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Generate geometry based on bioreactor type
  const geometry = useMemo(() => {
    switch (model.reactorType) {
      case 'Membrane Bioreactor with Electrochemical Integration':
        return createEMBRGeometry(model)
      case 'Stirred Tank with Multi-Impeller System':
        return createStirredTankGeometry(model)
      case 'Photobioreactor with Integrated MFC':
        return createPhotobioreactorGeometry(model)
      case 'Airlift with Enhanced Mass Transfer':
        return createAirliftGeometry(model)
      case 'Fractal Geometry Photobioreactor':
        return createFractalGeometry(model)
      default:
        return createGenericGeometry(model)
    }
  }, [model])

  // Animation updates
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate stirred tank impellers
      if (model.reactorType.includes('Stirred Tank')) {
        const impeller = groupRef.current.getObjectByName('impeller')
        if (impeller) {
          impeller.rotation.y += parameters.mixingSpeed * delta * animationSpeed * 0.1
        }
      }

      // Subtle breathing animation for organic-looking systems
      if (model.reactorType.includes('Photobioreactor')) {
        const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
        groupRef.current.scale.setScalar(breathingScale)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {geometry}
    </group>
  )
}

// EMBR (Electrochemical Membrane Bioreactor) Geometry
function createEMBRGeometry(model: BioreactorModel) {
  const components = []

  // Main reactor vessel
  const vesselGeometry = new THREE.BoxGeometry(
    model.geometry.dimensions?.width || 1,
    model.geometry.dimensions?.height || 1.2,
    model.geometry.dimensions?.depth || 0.8
  )
  
  const vesselMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf0f0f0,
    metalness: 0.1,
    roughness: 0.3,
    transmission: 0.9,
    thickness: 0.05,
    ior: 1.5,
    transparent: true,
    opacity: 0.3
  })

  components.push(
    <mesh key="vessel" geometry={vesselGeometry} material={vesselMaterial} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={0xf0f0f0}
        metalness={0.1}
        roughness={0.3}
        transmission={0.9}
        thickness={0.05}
        ior={1.5}
        transparent
        opacity={0.3}
      />
    </mesh>
  )

  // Membrane modules
  const moduleCount = 4
  for (let i = 0; i < moduleCount; i++) {
    const moduleY = -0.4 + (i * 0.2)
    components.push(
      <group key={`module-${i}`} position={[0, moduleY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.15, 0.6]} />
          <meshStandardMaterial
            color={0x37474f}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Membrane surface */}
        <mesh position={[0, 0.08, 0]}>
          <planeGeometry args={[0.75, 0.55]} />
          <meshPhysicalMaterial
            color={0xe8f5e9}
            transparent
            opacity={0.6}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }

  // Flow distribution manifold
  components.push(
    <group key="manifold" position={[0, -0.7, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial
          color={0x546e7a}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )

  // Inlet/outlet pipes
  components.push(
    <group key="pipes">
      <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color={0x546e7a} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color={0x546e7a} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )

  return components
}

// Stirred Tank Bioreactor Geometry
function createStirredTankGeometry(model: BioreactorModel) {
  const components = []
  const radius = (model.geometry.dimensions?.diameter || 0.6) / 2
  const height = model.geometry.dimensions?.height || 1.2

  // Main vessel
  components.push(
    <mesh key="vessel" castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshPhysicalMaterial
        color={0xc0c0c0}
        metalness={0.7}
        roughness={0.3}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.4}
      />
    </mesh>
  )

  // Culture medium
  components.push(
    <mesh key="medium" position={[0, -height * 0.1, 0]}>
      <cylinderGeometry args={[radius * 0.95, radius * 0.95, height * 0.8, 32]} />
      <meshPhysicalMaterial
        color={0x8d6e63}
        transparent
        opacity={0.6}
        transmission={0.3}
        thickness={0.5}
        roughness={0.5}
      />
    </mesh>
  )

  // Impeller system
  components.push(
    <group key="impeller" name="impeller" position={[0, -height * 0.2, 0]}>
      {/* Shaft */}
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, height * 0.8, 16]} />
        <meshStandardMaterial
          color={0x607d8b}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Impeller blades */}
      {[0, 1, 2, 3].map(i => (
        <mesh
          key={`blade-${i}`}
          rotation={[0, (i * Math.PI) / 2, Math.PI / 12]}
          castShadow
        >
          <boxGeometry args={[radius * 0.8, 0.02, 0.1]} />
          <meshStandardMaterial
            color={0x455a64}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )

  // Baffles
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2
    components.push(
      <mesh
        key={`baffle-${i}`}
        position={[
          Math.cos(angle) * radius * 0.9,
          0,
          Math.sin(angle) * radius * 0.9
        ]}
        rotation={[0, angle, 0]}
        castShadow
      >
        <boxGeometry args={[0.02, height * 0.8, 0.05]} />
        <meshStandardMaterial
          color={0x546e7a}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
    )
  }

  // Gas sparger at bottom
  components.push(
    <mesh key="sparger" position={[0, -height * 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius * 0.7, 0.03, 8, 32]} />
      <meshStandardMaterial
        color={0x9e9e9e}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )

  return components
}

// Photobioreactor Geometry
function createPhotobioreactorGeometry(model: BioreactorModel) {
  const components = []
  const width = model.geometry.dimensions?.width || 1.2
  const height = model.geometry.dimensions?.height || 1.5
  const depth = model.geometry.dimensions?.depth || 0.6

  // Main frame
  components.push(
    <mesh key="frame" castShadow receiveShadow>
      <boxGeometry args={[width, height, 0.05]} />
      <meshStandardMaterial
        color={0x9e9e9e}
        metalness={0.8}
        roughness={0.3}
      />
    </mesh>
  )

  // Glass panels (photobioreactor chambers)
  const rows = 2
  const cols = 3
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -width/3 + col * width/3 + width/6
      const y = height/4 - row * height/2
      
      components.push(
        <group key={`chamber-${row}-${col}`} position={[x, y, 0.1]}>
          {/* Glass chamber */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width/3 - 0.05, height/2 - 0.05, depth]} />
            <meshPhysicalMaterial
              color={0xffffff}
              metalness={0}
              roughness={0.1}
              transmission={0.9}
              thickness={0.05}
              ior={1.5}
              transparent
              opacity={0.3}
            />
          </mesh>
          
          {/* Algae culture medium */}
          <mesh>
            <boxGeometry args={[width/3 - 0.1, height/2 - 0.1, depth * 0.9]} />
            <meshPhysicalMaterial
              color={0x2e7d32}
              transparent
              opacity={0.7}
              transmission={0.3}
              thickness={0.3}
              roughness={0.2}
              emissive={0x1b5e20}
              emissiveIntensity={0.05}
            />
          </mesh>
        </group>
      )
    }
  }

  // Light distribution system
  components.push(
    <group key="lighting" position={[0, height/2 + 0.2, -depth/2 - 0.1]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`light-${i}`} position={[(i - 2.5) * 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial
            color={0xffffff}
            emissive={0xffffff}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )

  return components
}

// Airlift Bioreactor Geometry
function createAirliftGeometry(model: BioreactorModel) {
  const components = []
  const radius = (model.geometry.dimensions?.diameter || 1.0) / 2
  const height = model.geometry.dimensions?.height || 3.0

  // Main vessel
  components.push(
    <mesh key="vessel" castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshPhysicalMaterial
        color={0xe2e8f0}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.4}
      />
    </mesh>
  )

  // Draft tube
  const draftTubeRadius = radius * 0.6
  components.push(
    <mesh key="draft-tube" castShadow>
      <cylinderGeometry args={[draftTubeRadius, draftTubeRadius, height * 0.8, 32]} />
      <meshStandardMaterial
        color={0x757575}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  )

  // Gas distributor at bottom
  components.push(
    <mesh key="distributor" position={[0, -height/2 + 0.1, 0]}>
      <cylinderGeometry args={[draftTubeRadius * 0.9, draftTubeRadius * 0.9, 0.05, 32]} />
      <meshStandardMaterial
        color={0x9e9e9e}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )

  // Overflow system
  components.push(
    <mesh key="overflow" position={[radius + 0.1, height * 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.3]} />
      <meshStandardMaterial
        color={0x546e7a}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )

  return components
}

// Fractal Geometry Photobioreactor
function createFractalGeometry(model: BioreactorModel) {
  const components = []

  // Generate fractal branching structure
  function createBranch(level: number, position: THREE.Vector3, direction: THREE.Vector3, radius: number): JSX.Element[] {
    if (level <= 0) return []

    const branchLength = 0.5 / level
    const endPosition = position.clone().add(direction.clone().multiplyScalar(branchLength))
    
    const branchComponents = []

    // Main branch segment
    branchComponents.push(
      <mesh key={`branch-${level}-${position.x}-${position.y}-${position.z}`} position={position.clone().add(endPosition).divideScalar(2)} castShadow>
        <cylinderGeometry args={[radius, radius * 0.8, branchLength, 8]} />
        <meshStandardMaterial
          color={0x4caf50}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
    )

    // Recursive branching
    if (level > 1) {
      const numBranches = 3
      for (let i = 0; i < numBranches; i++) {
        const angle = (i * Math.PI * 2) / numBranches
        const newDirection = new THREE.Vector3(
          direction.x + Math.cos(angle) * 0.5,
          direction.y + 0.3,
          direction.z + Math.sin(angle) * 0.5
        ).normalize()
        
        branchComponents.push(
          ...createBranch(level - 1, endPosition, newDirection, radius * 0.7)
        )
      }
    }

    return branchComponents
  }

  // Create fractal structure
  const rootPosition = new THREE.Vector3(0, -0.8, 0)
  const rootDirection = new THREE.Vector3(0, 1, 0)
  components.push(...createBranch(4, rootPosition, rootDirection, 0.05))

  // Base container
  components.push(
    <mesh key="base" position={[0, -1, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.4, 0.3, 16]} />
      <meshStandardMaterial
        color={0x8d6e63}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )

  return components
}

// Generic bioreactor geometry
function createGenericGeometry(model: BioreactorModel) {
  const components = []

  // Default cylindrical reactor
  const radius = (model.geometry.dimensions?.diameter || 1) / 2
  const height = model.geometry.dimensions?.height || 2

  components.push(
    <mesh key="vessel" castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshPhysicalMaterial
        color={0x4a90e2}
        transparent
        opacity={0.6}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )

  return components
}