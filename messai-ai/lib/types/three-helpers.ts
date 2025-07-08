import * as THREE from 'three'

// Type guards for Three.js objects
export function isMeshStandardMaterial(material: THREE.Material | THREE.Material[]): material is THREE.MeshStandardMaterial {
  return material instanceof THREE.MeshStandardMaterial
}

export function isMeshBasicMaterial(material: THREE.Material | THREE.Material[]): material is THREE.MeshBasicMaterial {
  return material instanceof THREE.MeshBasicMaterial
}

export function isMeshPhysicalMaterial(material: THREE.Material | THREE.Material[]): material is THREE.MeshPhysicalMaterial {
  return material instanceof THREE.MeshPhysicalMaterial
}

// Helper types for particle systems
export interface ParticleSystem {
  positions: Float32Array
  colors: Float32Array
  count: number
}

export interface ParticleSystemWithVelocity extends ParticleSystem {
  velocities: Float32Array
}

// Helper to safely update buffer attributes
export function updateBufferAttribute(
  points: THREE.Points | null,
  attributeName: 'position' | 'color',
  data: Float32Array
): void {
  if (!points || !points.geometry) return
  
  const attribute = points.geometry.attributes[attributeName]
  if (attribute && attribute.array.length === data.length) {
    attribute.array.set(data)
    attribute.needsUpdate = true
  }
}

// Helper to create buffer geometry with attributes
export function createParticleGeometry(particleSystem: ParticleSystem): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  
  geometry.setAttribute('position', new THREE.BufferAttribute(particleSystem.positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(particleSystem.colors, 3))
  
  return geometry
}