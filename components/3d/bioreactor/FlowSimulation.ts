import * as THREE from 'three'

export class FlowSimulation {
  private scene: THREE.Scene
  private systemType: string
  private particles: THREE.Points[] = []
  private flowPaths: THREE.CatmullRomCurve3[] = []
  private particleGeometry: THREE.BufferGeometry
  private particleMaterial: THREE.PointsMaterial
  private electronPaths: { particle: THREE.Mesh, path: THREE.CatmullRomCurve3, progress: number }[] = []
  private time: number = 0

  constructor(scene: THREE.Scene, systemType: string) {
    this.scene = scene
    this.systemType = systemType
    
    // Create particle system for fluid flow
    this.particleGeometry = new THREE.BufferGeometry()
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x4fc3f7,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      map: this.createParticleTexture()
    })
    
    this.initializeFlowPaths()
    this.createFluidParticles()
    
    if (systemType === 'MFC' || systemType === 'MEC') {
      this.createElectronFlow()
    }
  }

  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    
    // Create glowing particle
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.4, 'rgba(79, 195, 247, 0.8)')
    gradient.addColorStop(1, 'rgba(79, 195, 247, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    return texture
  }

  private initializeFlowPaths() {
    // Create flow paths based on system type
    if (this.systemType === 'MFC' || this.systemType === 'MEC') {
      // Inlet to anode chamber
      const inletPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, -0.5, 0),
        new THREE.Vector3(-2, -0.5, 0),
        new THREE.Vector3(-1, -0.3, 0),
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(-0.5, 0.5, 0)
      ])
      this.flowPaths.push(inletPath)
      
      // Anode to cathode (for ions)
      const ionPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0, 0)
      ])
      this.flowPaths.push(ionPath)
      
      // Cathode chamber to outlet
      const outletPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(1, -0.3, 0),
        new THREE.Vector3(2, -0.5, 0),
        new THREE.Vector3(3, -0.5, 0)
      ])
      this.flowPaths.push(outletPath)
    } else if (this.systemType === 'MDC') {
      // More complex flow for desalination
      // Salt water inlet
      const saltInlet = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(-2, 0, 0.5),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, -0.5)
      ])
      this.flowPaths.push(saltInlet)
      
      // Fresh water outlet
      const freshOutlet = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(2, 0, -0.5),
        new THREE.Vector3(3, 0, 0)
      ])
      this.flowPaths.push(freshOutlet)
    }
  }

  private createFluidParticles() {
    const particleCount = 500
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Random position along flow paths
      const pathIndex = Math.floor(Math.random() * this.flowPaths.length)
      const t = Math.random()
      const point = this.flowPaths[pathIndex].getPoint(t)
      
      positions[i * 3] = point.x + (Math.random() - 0.5) * 0.1
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.1
      positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.1
      
      // Color based on position (inlet blue, outlet lighter)
      const colorIntensity = (positions[i * 3] + 3) / 6
      colors[i * 3] = 0.3 + colorIntensity * 0.3
      colors[i * 3 + 1] = 0.7 + colorIntensity * 0.2
      colors[i * 3 + 2] = 1.0
      
      sizes[i] = 0.01 + Math.random() * 0.02
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial)
    this.particles.push(particleSystem)
    this.scene.add(particleSystem)
  }

  private createElectronFlow() {
    // Create glowing electrons moving from anode to cathode
    const electronCount = 20
    
    for (let i = 0; i < electronCount; i++) {
      // Create electron path (external circuit)
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.6, 0, 0),     // Anode
        new THREE.Vector3(-0.6, 1.5, 0),   // Up from anode
        new THREE.Vector3(0, 2, 0),        // Top of circuit
        new THREE.Vector3(0.6, 1.5, 0),    // Down to cathode
        new THREE.Vector3(0.6, 0, 0)       // Cathode
      ])
      
      // Create glowing electron sphere
      const electronGeometry = new THREE.SphereGeometry(0.03, 16, 16)
      const electronMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8
      })
      
      const electron = new THREE.Mesh(electronGeometry, electronMaterial)
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.05, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      electron.add(glow)
      
      this.scene.add(electron)
      
      this.electronPaths.push({
        particle: electron,
        path: path,
        progress: i / electronCount // Stagger start positions
      })
    }
  }

  public update(deltaTime: number) {
    this.time += deltaTime
    
    // Update fluid particles
    const positions = this.particleGeometry.attributes.position as THREE.BufferAttribute
    const posArray = positions.array as Float32Array
    
    for (let i = 0; i < posArray.length / 3; i++) {
      // Move particles along flow paths
      const x = posArray[i * 3]
      const y = posArray[i * 3 + 1]
      const z = posArray[i * 3 + 2]
      
      // Simple flow simulation
      posArray[i * 3] += deltaTime * 0.2 // Move right
      
      // Add turbulence
      posArray[i * 3 + 1] += Math.sin(this.time * 2 + i) * 0.001
      posArray[i * 3 + 2] += Math.cos(this.time * 2 + i) * 0.001
      
      // Reset particle if it goes too far
      if (posArray[i * 3] > 3) {
        posArray[i * 3] = -3
        posArray[i * 3 + 1] = -0.5 + Math.random() * 1
        posArray[i * 3 + 2] = -0.5 + Math.random() * 1
      }
    }
    
    positions.needsUpdate = true
    
    // Update electron flow
    this.electronPaths.forEach((electronData) => {
      electronData.progress += deltaTime * 0.2
      if (electronData.progress > 1) {
        electronData.progress = 0
      }
      
      const position = electronData.path.getPoint(electronData.progress)
      electronData.particle.position.copy(position)
      
      // Pulse glow effect
      const scale = 1 + Math.sin(this.time * 5 + electronData.progress * Math.PI * 2) * 0.2
      electronData.particle.scale.setScalar(scale)
    })
  }

  public setFlowRate(rate: number) {
    // Adjust particle speed based on flow rate
    this.particleMaterial.size = 0.02 * (0.5 + rate * 0.5)
  }

  public setSystemType(type: string) {
    this.systemType = type
    // Recreate flow paths and particles for new system type
    this.cleanup()
    this.initializeFlowPaths()
    this.createFluidParticles()
    if (type === 'MFC' || type === 'MEC') {
      this.createElectronFlow()
    }
  }

  public cleanup() {
    // Remove all particles and electrons from scene
    this.particles.forEach(p => this.scene.remove(p))
    this.electronPaths.forEach(e => this.scene.remove(e.particle))
    this.particles = []
    this.electronPaths = []
  }
}