import * as THREE from 'three'
import { SpringConfig } from '@react-spring/three'

// Animation configurations
export const ANIMATION_CONFIGS = {
  smooth: { mass: 1, tension: 280, friction: 60 } as SpringConfig,
  wobbly: { mass: 1, tension: 180, friction: 12 } as SpringConfig,
  stiff: { mass: 1, tension: 400, friction: 40 } as SpringConfig,
  slow: { mass: 1, tension: 100, friction: 40 } as SpringConfig,
}

// Easing functions
export const easings = {
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },
  easeOut: (t: number): number => {
    return t * (2 - t)
  },
  easeIn: (t: number): number => {
    return t * t
  },
  bounce: (t: number): number => {
    const n1 = 7.5625
    const d1 = 2.75
    
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
}

// Particle system animation helpers
export interface ParticleSystem {
  particles: THREE.Vector3[]
  velocities: THREE.Vector3[]
  lifetimes: number[]
  maxLifetime: number
}

export function createParticleSystem(
  count: number,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  maxLifetime: number = 5
): ParticleSystem {
  const particles: THREE.Vector3[] = []
  const velocities: THREE.Vector3[] = []
  const lifetimes: number[] = []
  
  for (let i = 0; i < count; i++) {
    particles.push(
      new THREE.Vector3(
        THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x),
        THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y),
        THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z)
      )
    )
    
    velocities.push(
      new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.01, 0.01),
        THREE.MathUtils.randFloat(0, 0.02),
        THREE.MathUtils.randFloat(-0.01, 0.01)
      )
    )
    
    lifetimes.push(Math.random() * maxLifetime)
  }
  
  return { particles, velocities, lifetimes, maxLifetime }
}

export function updateParticleSystem(
  system: ParticleSystem,
  delta: number,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  forces?: THREE.Vector3
): void {
  // Optimize by avoiding clone() calls in loop
  const deltaForces = forces ? forces.clone().multiplyScalar(delta) : null
  
  for (let i = 0; i < system.particles.length; i++) {
    const particle = system.particles[i]
    const velocity = system.velocities[i]
    
    // Update lifetime
    system.lifetimes[i] += delta
    
    // Reset if lifetime exceeded
    if (system.lifetimes[i] > system.maxLifetime) {
      particle.x = THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x)
      particle.y = bounds.min.y
      particle.z = THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z)
      system.lifetimes[i] = 0
    }
    
    // Apply forces (optimized)
    if (deltaForces) {
      velocity.add(deltaForces)
    }
    
    // Update position (optimized)
    particle.x += velocity.x * delta
    particle.y += velocity.y * delta
    particle.z += velocity.z * delta
    
    // Boundary checks
    if (particle.y > bounds.max.y) {
      particle.y = bounds.min.y
      system.lifetimes[i] = 0
    }
  }
}

// Biofilm growth animation
export function animateBiofilmGrowth(
  time: number,
  baseScale: number = 1,
  growthRate: number = 0.1
): number {
  const growth = Math.min(1, time * growthRate)
  const pulse = Math.sin(time * 2) * 0.05
  return baseScale * growth * (1 + pulse)
}

// Flow path animation
export function createFlowPath(
  start: THREE.Vector3,
  end: THREE.Vector3,
  turbulence: number = 0.1
): THREE.Vector3[] {
  const path: THREE.Vector3[] = []
  const steps = 20
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const point = new THREE.Vector3().lerpVectors(start, end, t)
    
    // Add turbulence
    if (i > 0 && i < steps) {
      point.x += (Math.random() - 0.5) * turbulence
      point.y += (Math.random() - 0.5) * turbulence
      point.z += (Math.random() - 0.5) * turbulence
    }
    
    path.push(point)
  }
  
  return path
}

// Bubble animation for gas production
export interface Bubble {
  position: THREE.Vector3
  velocity: THREE.Vector3
  size: number
  age: number
}

export function createBubbles(
  count: number,
  origin: THREE.Vector3,
  spread: number = 0.1
): Bubble[] {
  const bubbles: Bubble[] = []
  
  for (let i = 0; i < count; i++) {
    bubbles.push({
      position: new THREE.Vector3(
        origin.x + (Math.random() - 0.5) * spread,
        origin.y,
        origin.z + (Math.random() - 0.5) * spread
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        0.02 + Math.random() * 0.01,
        (Math.random() - 0.5) * 0.01
      ),
      size: 0.01 + Math.random() * 0.01,
      age: Math.random() * 2,
    })
  }
  
  return bubbles
}

export function updateBubbles(
  bubbles: Bubble[],
  delta: number,
  maxHeight: number,
  origin: THREE.Vector3,
  spread: number = 0.1
): void {
  for (let i = 0; i < bubbles.length; i++) {
    const bubble = bubbles[i]
    
    // Update position (optimized)
    bubble.position.x += bubble.velocity.x * delta
    bubble.position.y += bubble.velocity.y * delta  
    bubble.position.z += bubble.velocity.z * delta
    
    // Add wobble
    const wobbleAmount = 0.001
    bubble.position.x += Math.sin(bubble.age * 3) * wobbleAmount
    bubble.position.z += Math.cos(bubble.age * 3) * wobbleAmount
    
    // Update age
    bubble.age += delta
    
    // Reset if reached top
    if (bubble.position.y > maxHeight) {
      bubble.position.set(
        origin.x + (Math.random() - 0.5) * spread,
        origin.y,
        origin.z + (Math.random() - 0.5) * spread
      )
      bubble.age = 0
      bubble.size = 0.01 + Math.random() * 0.01
    }
  }
}