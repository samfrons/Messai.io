import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PointMaterial } from '@react-three/drei'
import { BioreactorModel } from '@/lib/bioreactor-catalog'
import { AdvancedPhysicsEngine } from './AdvancedPhysicsEngine'

interface FluidVisualizationProps {
  model: BioreactorModel
  parameters: {
    temperature: number
    ph: number
    flowRate: number
    mixingSpeed: number
    electrodeVoltage: number
    substrateConcentration: number
  }
  physicsEngine: AdvancedPhysicsEngine | null
  animationSpeed: number
}

export function FluidVisualization({
  model,
  parameters,
  physicsEngine,
  animationSpeed
}: FluidVisualizationProps) {
  const fluidPointsRef = useRef<THREE.Points>(null)
  const ionPointsRef = useRef<THREE.Points>(null)
  const bacteriaPointsRef = useRef<THREE.Points>(null)
  const gasPointsRef = useRef<THREE.Points>(null)

  // Generate particle positions and properties
  const particleSystems = useMemo(() => {
    const fluidParticles = physicsEngine?.getFluidParticles()
    const ionParticles = physicsEngine?.getIonParticles()
    const bacteriaParticles = physicsEngine?.getBacteriaParticles()
    const gasParticles = physicsEngine?.getGasParticles()

    return {
      fluid: fluidParticles ? {
        positions: fluidParticles.positions,
        colors: fluidParticles.colors,
        count: fluidParticles.count
      } : generateFallbackFluidParticles(model),
      
      ion: ionParticles ? {
        positions: ionParticles.positions,
        colors: ionParticles.colors,
        count: ionParticles.count
      } : generateFallbackIonParticles(model),
      
      bacteria: bacteriaParticles ? {
        positions: bacteriaParticles.positions,
        colors: bacteriaParticles.colors,
        count: bacteriaParticles.count
      } : generateFallbackBacteriaParticles(model),
      
      gas: gasParticles ? {
        positions: gasParticles.positions,
        colors: gasParticles.colors,
        count: gasParticles.count
      } : generateFallbackGasParticles(model)
    }
  }, [model, physicsEngine])

  // Update particle positions each frame
  useFrame((state, delta) => {
    if (physicsEngine) {
      // Update from physics engine
      updateFromPhysicsEngine()
    } else {
      // Update with CPU fallback
      updateCPUFallback(delta * animationSpeed)
    }
  })

  const updateFromPhysicsEngine = () => {
    const fluidParticles = physicsEngine?.getFluidParticles()
    const ionParticles = physicsEngine?.getIonParticles()
    const bacteriaParticles = physicsEngine?.getBacteriaParticles()
    const gasParticles = physicsEngine?.getGasParticles()

    if (fluidPointsRef.current && fluidParticles) {
      const positions = fluidPointsRef.current.geometry.attributes.position
      if (positions && positions.array.length === fluidParticles.positions.length) {
        positions.array.set(fluidParticles.positions)
        positions.needsUpdate = true
      }

      const colors = fluidPointsRef.current.geometry.attributes.color
      if (colors && colors.array.length === fluidParticles.colors.length) {
        colors.array.set(fluidParticles.colors)
        colors.needsUpdate = true
      }
    }

    if (ionPointsRef.current && ionParticles) {
      const positions = ionPointsRef.current.geometry.attributes.position
      if (positions && positions.array.length === ionParticles.positions.length) {
        positions.array.set(ionParticles.positions)
        positions.needsUpdate = true
      }

      const colors = ionPointsRef.current.geometry.attributes.color
      if (colors && colors.array.length === ionParticles.colors.length) {
        colors.array.set(ionParticles.colors)
        colors.needsUpdate = true
      }
    }

    if (bacteriaPointsRef.current && bacteriaParticles) {
      const positions = bacteriaPointsRef.current.geometry.attributes.position
      if (positions && positions.array.length === bacteriaParticles.positions.length) {
        positions.array.set(bacteriaParticles.positions)
        positions.needsUpdate = true
      }

      const colors = bacteriaPointsRef.current.geometry.attributes.color
      if (colors && colors.array.length === bacteriaParticles.colors.length) {
        colors.array.set(bacteriaParticles.colors)
        colors.needsUpdate = true
      }
    }

    if (gasPointsRef.current && gasParticles) {
      const positions = gasPointsRef.current.geometry.attributes.position
      if (positions && positions.array.length === gasParticles.positions.length) {
        positions.array.set(gasParticles.positions)
        positions.needsUpdate = true
      }

      const colors = gasPointsRef.current.geometry.attributes.color
      if (colors && colors.array.length === gasParticles.colors.length) {
        colors.array.set(gasParticles.colors)
        colors.needsUpdate = true
      }
    }
  }

  const updateCPUFallback = (deltaTime: number) => {
    // Simple CPU-based particle animation
    if (fluidPointsRef.current) {
      updateFluidParticlesCPU(fluidPointsRef.current, deltaTime)
    }
    if (gasPointsRef.current) {
      updateGasParticlesCPU(gasPointsRef.current, deltaTime)
    }
  }

  const updateFluidParticlesCPU = (points: THREE.Points, deltaTime: number) => {
    const positions = points.geometry.attributes.position.array as Float32Array
    const velocity = points.userData.velocity as Float32Array
    
    if (!velocity) {
      // Initialize velocities
      points.userData.velocity = new Float32Array(positions.length)
      for (let i = 0; i < positions.length; i += 3) {
        points.userData.velocity[i] = (Math.random() - 0.5) * 2
        points.userData.velocity[i + 1] = (Math.random() - 0.5) * 2
        points.userData.velocity[i + 2] = (Math.random() - 0.5) * 2
      }
      return
    }

    // Update positions based on flow and mixing
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      // Apply flow forces
      const radius = Math.sqrt(x * x + z * z)
      const flowForce = parameters.flowRate * 0.01

      // Apply mixing forces (rotational)
      if (radius > 0.1) {
        const angle = Math.atan2(z, x)
        velocity[i] += -Math.sin(angle) * parameters.mixingSpeed * 0.01 * deltaTime
        velocity[i + 2] += Math.cos(angle) * parameters.mixingSpeed * 0.01 * deltaTime
      }

      // Apply gravity and buoyancy
      velocity[i + 1] += (-9.81 * 0.001 + flowForce) * deltaTime

      // Apply damping
      velocity[i] *= 0.99
      velocity[i + 1] *= 0.99
      velocity[i + 2] *= 0.99

      // Update positions
      positions[i] += velocity[i] * deltaTime
      positions[i + 1] += velocity[i + 1] * deltaTime
      positions[i + 2] += velocity[i + 2] * deltaTime

      // Boundary conditions
      const bounds = getBounds(model)
      if (radius > bounds.radius) {
        const normal = [x / radius, 0, z / radius]
        velocity[i] -= normal[0] * 2
        velocity[i + 2] -= normal[2] * 2
        positions[i] = normal[0] * bounds.radius * 0.95
        positions[i + 2] = normal[2] * bounds.radius * 0.95
      }

      if (positions[i + 1] < bounds.bottom) {
        positions[i + 1] = bounds.bottom
        velocity[i + 1] = Math.abs(velocity[i + 1]) * 0.8
      } else if (positions[i + 1] > bounds.top) {
        positions[i + 1] = bounds.top
        velocity[i + 1] = -Math.abs(velocity[i + 1]) * 0.8
      }
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  const updateGasParticlesCPU = (points: THREE.Points, deltaTime: number) => {
    const positions = points.geometry.attributes.position.array as Float32Array
    const velocity = points.userData.velocity as Float32Array
    const lifetimes = points.userData.lifetimes as Float32Array

    if (!velocity || !lifetimes) {
      // Initialize gas particle properties
      points.userData.velocity = new Float32Array(positions.length)
      points.userData.lifetimes = new Float32Array(positions.length / 3)
      
      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3
        points.userData.velocity[i] = (Math.random() - 0.5) * 1
        points.userData.velocity[i + 1] = Math.random() * 2 + 1 // Upward bias
        points.userData.velocity[i + 2] = (Math.random() - 0.5) * 1
        points.userData.lifetimes[particleIndex] = Math.random() * 5 + 2
      }
      return
    }

    // Update gas particles (bubbles)
    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3

      // Update lifetime
      lifetimes[particleIndex] -= deltaTime

      // Reset particle if dead
      if (lifetimes[particleIndex] <= 0) {
        resetGasParticle(positions, velocity, lifetimes, i, particleIndex, model)
        continue
      }

      // Apply buoyancy (gas rises)
      velocity[i + 1] += 9.81 * 0.01 * deltaTime

      // Apply some turbulence
      velocity[i] += (Math.random() - 0.5) * 0.1 * deltaTime
      velocity[i + 2] += (Math.random() - 0.5) * 0.1 * deltaTime

      // Update positions
      positions[i] += velocity[i] * deltaTime
      positions[i + 1] += velocity[i + 1] * deltaTime
      positions[i + 2] += velocity[i + 2] * deltaTime

      // Check boundaries
      const bounds = getBounds(model)
      const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2])
      
      if (radius > bounds.radius || positions[i + 1] > bounds.top) {
        resetGasParticle(positions, velocity, lifetimes, i, particleIndex, model)
      }
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  const resetGasParticle = (
    positions: Float32Array,
    velocity: Float32Array,
    lifetimes: Float32Array,
    i: number,
    particleIndex: number,
    model: BioreactorModel
  ) => {
    const bounds = getBounds(model)
    
    // Reset to bottom of reactor
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * bounds.radius * 0.5
    
    positions[i] = Math.cos(angle) * radius
    positions[i + 1] = bounds.bottom + 0.1
    positions[i + 2] = Math.sin(angle) * radius
    
    velocity[i] = (Math.random() - 0.5) * 1
    velocity[i + 1] = Math.random() * 2 + 1
    velocity[i + 2] = (Math.random() - 0.5) * 1
    
    lifetimes[particleIndex] = Math.random() * 5 + 2
  }

  const getBounds = (model: BioreactorModel) => {
    const radius = (model.geometry.dimensions?.diameter || 2) / 2
    const height = model.geometry.dimensions?.height || 2
    
    return {
      radius: radius,
      top: height / 2,
      bottom: -height / 2
    }
  }

  return (
    <group>
      {/* Fluid flow particles */}
      <points ref={fluidPointsRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleSystems.fluid.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleSystems.fluid.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          sizeAttenuation
          transparent
          opacity={0.6}
          vertexColors
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Ion transport particles */}
      <points ref={ionPointsRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleSystems.ion.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleSystems.ion.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.01}
          sizeAttenuation
          transparent
          opacity={0.8}
          vertexColors
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Bacterial particles */}
      <points ref={bacteriaPointsRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleSystems.bacteria.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleSystems.bacteria.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          sizeAttenuation
          transparent
          opacity={0.7}
          vertexColors
        />
      </points>

      {/* Gas bubble particles */}
      <points ref={gasPointsRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleSystems.gas.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleSystems.gas.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          sizeAttenuation
          transparent
          opacity={0.5}
          vertexColors
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Flow visualization vectors */}
      <FlowVectors model={model} parameters={parameters} />

      {/* Concentration gradients */}
      <ConcentrationField model={model} parameters={parameters} />
    </group>
  )
}

// Flow vector visualization
function FlowVectors({ model, parameters }: {
  model: BioreactorModel
  parameters: any
}) {
  const vectorsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (vectorsRef.current) {
      // Rotate vectors based on mixing speed
      vectorsRef.current.rotation.y += parameters.mixingSpeed * 0.001
    }
  })

  // Generate flow vectors based on reactor type
  const vectors = useMemo(() => {
    const vectorComponents = []
    const gridSize = 8
    const bounds = getBounds(model)

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        for (let k = 0; k < gridSize; k++) {
          const x = (i / (gridSize - 1) - 0.5) * bounds.radius * 1.8
          const y = (j / (gridSize - 1) - 0.5) * (bounds.top - bounds.bottom) * 0.8
          const z = (k / (gridSize - 1) - 0.5) * bounds.radius * 1.8

          const radius = Math.sqrt(x * x + z * z)
          if (radius > bounds.radius * 0.9) continue

          // Calculate flow vector based on reactor type
          let flowVector = new THREE.Vector3(0, 0, 0)

          if (model.reactorType.includes('Stirred Tank')) {
            // Circular flow pattern
            const angle = Math.atan2(z, x)
            flowVector.set(-Math.sin(angle), 0, Math.cos(angle))
            flowVector.multiplyScalar(parameters.mixingSpeed * 0.01)
          } else if (model.reactorType.includes('Airlift')) {
            // Vertical circulation
            if (radius < bounds.radius * 0.6) {
              flowVector.set(0, 1, 0) // Upward in center
            } else {
              flowVector.set(0, -1, 0) // Downward on sides
            }
            flowVector.multiplyScalar(parameters.flowRate * 0.01)
          } else {
            // Default mixing pattern
            flowVector.set(
              (Math.random() - 0.5) * parameters.flowRate * 0.01,
              parameters.flowRate * 0.005,
              (Math.random() - 0.5) * parameters.flowRate * 0.01
            )
          }

          vectorComponents.push(
            <mesh key={`vector-${i}-${j}-${k}`} position={[x, y, z]}>
              <coneGeometry args={[0.02, flowVector.length() * 10, 8]} />
              <meshBasicMaterial
                color={0x00ffff}
                transparent
                opacity={0.3}
              />
            </mesh>
          )
        }
      }
    }

    return vectorComponents
  }, [model, parameters])

  return (
    <group ref={vectorsRef} visible={parameters.showVectors}>
      {vectors}
    </group>
  )
}

// Concentration field visualization
function ConcentrationField({ model, parameters }: {
  model: BioreactorModel
  parameters: any
}) {
  const fieldRef = useRef<THREE.Mesh>(null)

  // Generate concentration field texture
  const concentrationTexture = useMemo(() => {
    const size = 64
    const data = new Uint8Array(size * size * size * 4)

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          const x = (i / size - 0.5) * 4
          const y = (j / size - 0.5) * 4
          const z = (k / size - 0.5) * 4

          // Distance from center affects concentration
          const distance = Math.sqrt(x * x + y * y + z * z)
          const concentration = Math.exp(-distance / 2) * parameters.substrateConcentration

          const index = (i + j * size + k * size * size) * 4
          const intensity = Math.min(concentration * 50, 255)

          data[index] = intensity     // Red
          data[index + 1] = intensity * 0.5 // Green
          data[index + 2] = 0         // Blue
          data[index + 3] = intensity * 0.3 // Alpha
        }
      }
    }

    // Use DataTexture instead of Data3DTexture for better compatibility
    const texture = new THREE.DataTexture(data, size * size, size)
    texture.format = THREE.RGBAFormat
    texture.needsUpdate = true

    return texture
  }, [parameters.substrateConcentration])

  return (
    <mesh ref={fieldRef} visible={parameters.showConcentration}>
      <boxGeometry args={[4, 4, 4]} />
      <meshBasicMaterial
        map={concentrationTexture}
        transparent
        opacity={0.2}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Fallback particle generation functions
function generateFallbackFluidParticles(model: BioreactorModel) {
  const count = 1000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const bounds = getBounds(model)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * bounds.radius * 0.9
    
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = (Math.random() - 0.5) * (bounds.top - bounds.bottom) * 0.8
    positions[i3 + 2] = Math.sin(angle) * radius

    // Blue-cyan colors for fluid
    colors[i3] = 0.2 + Math.random() * 0.3
    colors[i3 + 1] = 0.8 + Math.random() * 0.2
    colors[i3 + 2] = 1.0
  }

  return { positions, colors, count }
}

function generateFallbackIonParticles(model: BioreactorModel) {
  const count = 500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const bounds = getBounds(model)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * bounds.radius * 0.9
    
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = (Math.random() - 0.5) * (bounds.top - bounds.bottom) * 0.8
    positions[i3 + 2] = Math.sin(angle) * radius

    // Red-blue colors for ions (positive/negative)
    if (Math.random() > 0.5) {
      colors[i3] = 1.0     // Red (positive)
      colors[i3 + 1] = 0.2
      colors[i3 + 2] = 0.2
    } else {
      colors[i3] = 0.2     // Blue (negative)
      colors[i3 + 1] = 0.2
      colors[i3 + 2] = 1.0
    }
  }

  return { positions, colors, count }
}

function generateFallbackBacteriaParticles(model: BioreactorModel) {
  const count = 300
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const bounds = getBounds(model)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * bounds.radius * 0.9
    
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = (Math.random() - 0.5) * (bounds.top - bounds.bottom) * 0.8
    positions[i3 + 2] = Math.sin(angle) * radius

    // Green colors for bacteria
    colors[i3] = 0.2 + Math.random() * 0.3
    colors[i3 + 1] = 0.8 + Math.random() * 0.2
    colors[i3 + 2] = 0.2 + Math.random() * 0.3
  }

  return { positions, colors, count }
}

function generateFallbackGasParticles(model: BioreactorModel) {
  const count = 500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const bounds = getBounds(model)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * bounds.radius * 0.5
    
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = bounds.bottom + Math.random() * (bounds.top - bounds.bottom)
    positions[i3 + 2] = Math.sin(angle) * radius

    // White-gray colors for gas bubbles
    const intensity = 0.8 + Math.random() * 0.2
    colors[i3] = intensity
    colors[i3 + 1] = intensity
    colors[i3 + 2] = intensity
  }

  return { positions, colors, count }
}

function getBounds(model: BioreactorModel) {
  const radius = (model.geometry.dimensions?.diameter || 2) / 2
  const height = model.geometry.dimensions?.height || 2
  
  return {
    radius: radius,
    top: height / 2,
    bottom: -height / 2
  }
}