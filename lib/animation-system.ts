import * as THREE from 'three'

export interface AnimationConfig {
  flowRate: number
  particleCount: number
  biofilmGrowthRate: number
  gasProductionRate: number
  bubbleSize: number
  flowDirection: THREE.Vector3
}

export interface FlowParticle {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  life: number
  maxLife: number
}

export interface GasBubble {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  size: number
  targetSize: number
}

export class MESSAnimationSystem {
  private scene: THREE.Scene
  private flowParticles: FlowParticle[] = []
  private gasBubbles: GasBubble[] = []
  private biofilmMeshes: Map<string, THREE.Mesh> = new Map()
  private particleGeometry: THREE.SphereGeometry
  private bubbleGeometry: THREE.SphereGeometry
  private clock: THREE.Clock = new THREE.Clock()
  
  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.particleGeometry = new THREE.SphereGeometry(0.02, 8, 8)
    this.bubbleGeometry = new THREE.SphereGeometry(1, 16, 16)
  }

  // Flow visualization system
  createFlowField(
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    config: AnimationConfig
  ): void {
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    })

    for (let i = 0; i < config.particleCount; i++) {
      const particle = new THREE.Mesh(this.particleGeometry, particleMaterial.clone())
      
      // Random initial position within bounds
      particle.position.set(
        THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x),
        THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y),
        THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z)
      )

      const flowParticle: FlowParticle = {
        mesh: particle,
        velocity: config.flowDirection.clone().multiplyScalar(config.flowRate * 0.01),
        life: Math.random() * 100,
        maxLife: 100
      }

      this.flowParticles.push(flowParticle)
      this.scene.add(particle)
    }
  }

  updateFlow(deltaTime: number, bounds: { min: THREE.Vector3; max: THREE.Vector3 }): void {
    this.flowParticles.forEach(particle => {
      // Update position
      particle.mesh.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      )

      // Add turbulence
      particle.mesh.position.x += (Math.random() - 0.5) * 0.001
      particle.mesh.position.y += (Math.random() - 0.5) * 0.001
      particle.mesh.position.z += (Math.random() - 0.5) * 0.001

      // Update life
      particle.life -= deltaTime * 10
      const lifeRatio = particle.life / particle.maxLife
      
      // Update opacity based on life
      if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
        particle.mesh.material.opacity = lifeRatio * 0.6
      }

      // Reset particle if out of bounds or dead
      if (
        particle.life <= 0 ||
        particle.mesh.position.x < bounds.min.x ||
        particle.mesh.position.x > bounds.max.x ||
        particle.mesh.position.y < bounds.min.y ||
        particle.mesh.position.y > bounds.max.y ||
        particle.mesh.position.z < bounds.min.z ||
        particle.mesh.position.z > bounds.max.z
      ) {
        // Reset to start position
        particle.mesh.position.set(
          bounds.min.x,
          THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y),
          THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z)
        )
        particle.life = particle.maxLife
      }
    })
  }

  // Biofilm growth animation
  createBiofilm(
    electrode: THREE.Mesh,
    thickness: number,
    color: number = 0x4a7c4e
  ): THREE.Mesh {
    const biofilmGeometry = electrode.geometry.clone()
    
    // Scale geometry to create biofilm layer
    if (biofilmGeometry instanceof THREE.BoxGeometry) {
      biofilmGeometry.scale(
        1 + thickness * 0.1,
        1 + thickness * 0.05,
        1 + thickness * 0.1
      )
    }

    const biofilmMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: 0.3 + thickness * 0.01,
      roughness: 0.8,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.7
    })

    const biofilm = new THREE.Mesh(biofilmGeometry, biofilmMaterial)
    biofilm.position.copy(electrode.position)
    biofilm.rotation.copy(electrode.rotation)
    
    return biofilm
  }

  updateBiofilm(biofilmId: string, growthRate: number, deltaTime: number): void {
    const biofilm = this.biofilmMeshes.get(biofilmId)
    if (!biofilm) return

    const growth = growthRate * deltaTime * 0.001
    biofilm.scale.x += growth
    biofilm.scale.y += growth * 0.5
    biofilm.scale.z += growth

    // Update opacity based on thickness
    if (biofilm.material instanceof THREE.MeshPhysicalMaterial) {
      const thickness = biofilm.scale.x - 1
      biofilm.material.opacity = Math.min(0.7, 0.3 + thickness * 0.4)
    }
  }

  // Gas bubble animation
  createGasBubbles(
    source: THREE.Vector3,
    productionRate: number,
    bubbleSize: number = 0.05
  ): void {
    const bubblesPerSecond = productionRate / 10
    const bubbleProbability = bubblesPerSecond * this.clock.getDelta()

    if (Math.random() < bubbleProbability) {
      const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 0.1,
        ior: 1.33
      })

      const bubble = new THREE.Mesh(this.bubbleGeometry, bubbleMaterial)
      bubble.scale.setScalar(bubbleSize)
      bubble.position.copy(source)
      bubble.position.x += (Math.random() - 0.5) * 0.1
      bubble.position.z += (Math.random() - 0.5) * 0.1

      const gasBubble: GasBubble = {
        mesh: bubble,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,
          0.01 + Math.random() * 0.005,
          (Math.random() - 0.5) * 0.001
        ),
        size: bubbleSize,
        targetSize: bubbleSize * (1.5 + Math.random() * 0.5)
      }

      this.gasBubbles.push(gasBubble)
      this.scene.add(bubble)
    }
  }

  updateGasBubbles(deltaTime: number, liquidHeight: number): void {
    const bubblesToRemove: GasBubble[] = []

    this.gasBubbles.forEach(bubble => {
      // Update position
      bubble.mesh.position.add(
        bubble.velocity.clone().multiplyScalar(deltaTime)
      )

      // Add wobble
      bubble.mesh.position.x += Math.sin(bubble.mesh.position.y * 10) * 0.0005
      bubble.mesh.position.z += Math.cos(bubble.mesh.position.y * 10) * 0.0005

      // Expand bubble as it rises (pressure decrease)
      if (bubble.size < bubble.targetSize) {
        bubble.size += deltaTime * 0.01
        bubble.mesh.scale.setScalar(bubble.size)
      }

      // Accelerate upward (buoyancy)
      bubble.velocity.y += deltaTime * 0.001

      // Remove if above liquid surface
      if (bubble.mesh.position.y > liquidHeight) {
        bubblesToRemove.push(bubble)
        this.scene.remove(bubble.mesh)
        if (bubble.mesh.material instanceof THREE.Material) {
          bubble.mesh.material.dispose()
        }
      }
    })

    // Remove bubbles that reached surface
    this.gasBubbles = this.gasBubbles.filter(b => !bubblesToRemove.includes(b))
  }

  // Performance overlay visualization
  createPerformanceOverlay(
    mesh: THREE.Mesh,
    performanceData: number[],
    maxValue: number
  ): THREE.Mesh {
    const geometry = mesh.geometry.clone()
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    })

    // Create color array based on performance data
    const colors = new Float32Array(geometry.attributes.position.count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const dataIndex = Math.floor(i / geometry.attributes.position.count * performanceData.length)
      const value = performanceData[dataIndex] / maxValue
      
      // Color gradient from blue (low) to red (high)
      color.setHSL(0.66 - value * 0.66, 1, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const overlay = new THREE.Mesh(geometry, material)
    overlay.position.copy(mesh.position)
    overlay.rotation.copy(mesh.rotation)
    overlay.scale.copy(mesh.scale)
    overlay.scale.multiplyScalar(1.01) // Slightly larger to avoid z-fighting

    return overlay
  }

  // Cleanup
  dispose(): void {
    // Dispose flow particles
    this.flowParticles.forEach(particle => {
      this.scene.remove(particle.mesh)
      if (particle.mesh.material instanceof THREE.Material) {
        particle.mesh.material.dispose()
      }
    })
    this.flowParticles = []

    // Dispose gas bubbles
    this.gasBubbles.forEach(bubble => {
      this.scene.remove(bubble.mesh)
      if (bubble.mesh.material instanceof THREE.Material) {
        bubble.mesh.material.dispose()
      }
    })
    this.gasBubbles = []

    // Dispose biofilm meshes
    this.biofilmMeshes.forEach(biofilm => {
      this.scene.remove(biofilm)
      if (biofilm.material instanceof THREE.Material) {
        biofilm.material.dispose()
      }
      biofilm.geometry.dispose()
    })
    this.biofilmMeshes.clear()

    // Dispose geometries
    this.particleGeometry.dispose()
    this.bubbleGeometry.dispose()
  }
}

// Utility functions for specific MESS model animations
export const MESSAnimationUtils = {
  // Create spiral flow for benchtop bioreactor
  createSpiralFlow(
    center: THREE.Vector3,
    radius: number,
    height: number,
    particleCount: number
  ): THREE.Vector3[] {
    const positions: THREE.Vector3[] = []
    const turns = 5
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const angle = t * Math.PI * 2 * turns
      const y = t * height - height / 2
      
      positions.push(new THREE.Vector3(
        center.x + Math.cos(angle) * radius * (1 - t * 0.3),
        center.y + y,
        center.z + Math.sin(angle) * radius * (1 - t * 0.3)
      ))
    }
    
    return positions
  },

  // Create laminar flow for microfluidics
  createLaminarFlow(
    start: THREE.Vector3,
    end: THREE.Vector3,
    width: number,
    layers: number
  ): THREE.CatmullRomCurve3[] {
    const curves: THREE.CatmullRomCurve3[] = []
    
    for (let i = 0; i < layers; i++) {
      const offset = (i / layers - 0.5) * width
      const points = [
        new THREE.Vector3(start.x, start.y + offset, start.z),
        new THREE.Vector3((start.x + end.x) / 2, start.y + offset, start.z),
        new THREE.Vector3(end.x, end.y + offset, end.z)
      ]
      curves.push(new THREE.CatmullRomCurve3(points))
    }
    
    return curves
  },

  // Create tidal flow for benthic systems
  createTidalFlow(
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    time: number,
    amplitude: number
  ): THREE.Vector3 {
    const tidalPhase = Math.sin(time * 0.5)
    const flowDirection = new THREE.Vector3(
      tidalPhase * amplitude,
      Math.abs(tidalPhase) * amplitude * 0.1,
      0
    )
    
    return flowDirection
  },

  // Create gradient field for performance visualization
  createGradientField(
    width: number,
    height: number,
    data: number[][]
  ): THREE.DataTexture {
    const size = width * height
    const dataArray = new Uint8Array(size * 4)
    
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 4
        const value = data[i][j]
        
        // Map value to color gradient
        const color = new THREE.Color()
        color.setHSL(0.66 - value * 0.66, 1, 0.5)
        
        dataArray[index] = color.r * 255
        dataArray[index + 1] = color.g * 255
        dataArray[index + 2] = color.b * 255
        dataArray[index + 3] = 255
      }
    }
    
    const texture = new THREE.DataTexture(dataArray, width, height)
    texture.needsUpdate = true
    
    return texture
  }
}