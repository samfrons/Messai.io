import * as THREE from 'three'

export interface PhysicsParameters {
  temperature: number
  ph: number
  flowRate: number
  mixingSpeed: number
  electrodeVoltage: number
  substrateConcentration: number
  [key: string]: number
}

export interface ParticleSystemConfig {
  maxParticles: number
  particleSize: number
  lifetimeRange: [number, number]
  colorRange: [THREE.Color, THREE.Color]
  velocityScale: number
  gravityEffect: number
}

export interface FluidProperties {
  viscosity: number
  density: number
  temperature: number
  ph: number
  ionicStrength: number
  oxygenSaturation: number
}

export class AdvancedPhysicsEngine {
  private device: GPUDevice | null = null
  private particleBuffers: Map<string, GPUBuffer> = new Map()
  private computePipelines: Map<string, GPUComputePipeline> = new Map()
  private bindGroups: Map<string, GPUBindGroup> = new Map()
  
  // Particle systems
  private fluidParticles: ParticleSystem | null = null
  private ionParticles: ParticleSystem | null = null
  private bacteriaParticles: ParticleSystem | null = null
  private gasParticles: ParticleSystem | null = null
  
  // Physics state
  private timeStep: number = 1/60
  private simulationTime: number = 0
  private isInitialized: boolean = false

  constructor(device?: GPUDevice) {
    if (device) {
      this.device = device
      this.initialize()
    } else {
      // Fallback to CPU-based physics
      this.initializeCPUFallback()
    }
  }

  private async initialize() {
    if (!this.device) return

    try {
      await this.initializeComputeShaders()
      await this.initializeParticleSystems()
      this.isInitialized = true
      console.log('Advanced Physics Engine initialized with WebGPU')
    } catch (error) {
      console.error('Failed to initialize WebGPU physics engine:', error)
      this.initializeCPUFallback()
    }
  }

  private async initializeComputeShaders() {
    if (!this.device) return

    // Fluid dynamics compute shader
    const fluidComputeShader = `
      @group(0) @binding(0) var<storage, read_write> positions: array<vec3<f32>>;
      @group(0) @binding(1) var<storage, read_write> velocities: array<vec3<f32>>;
      @group(0) @binding(2) var<storage, read> parameters: array<f32>;
      @group(0) @binding(3) var<storage, read> fluidProperties: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let index = global_id.x;
        if (index >= arrayLength(&positions)) {
          return;
        }

        let dt = parameters[0];
        let flowRate = parameters[1];
        let mixingSpeed = parameters[2];
        let temperature = parameters[3];
        
        let viscosity = fluidProperties[0];
        let density = fluidProperties[1];
        
        var position = positions[index];
        var velocity = velocities[index];
        
        // Navier-Stokes approximation for fluid flow
        let pressure_gradient = calculatePressureGradient(position);
        let viscous_force = calculateViscousForce(position, velocity, viscosity);
        let mixing_force = calculateMixingForce(position, mixingSpeed);
        
        // Update velocity based on forces
        velocity += (pressure_gradient + viscous_force + mixing_force) * dt / density;
        
        // Apply boundary conditions
        velocity = applyBoundaryConditions(position, velocity);
        
        // Update position
        position += velocity * dt;
        
        positions[index] = position;
        velocities[index] = velocity;
      }

      fn calculatePressureGradient(pos: vec3<f32>) -> vec3<f32> {
        // Simplified pressure gradient calculation
        return vec3<f32>(-pos.x * 0.1, -9.81, -pos.z * 0.1);
      }

      fn calculateViscousForce(pos: vec3<f32>, vel: vec3<f32>, visc: f32) -> vec3<f32> {
        // Simplified viscous force
        return -vel * visc * 0.1;
      }

      fn calculateMixingForce(pos: vec3<f32>, mixing: f32) -> vec3<f32> {
        // Rotational mixing force
        let radius = length(pos.xz);
        let angle = atan2(pos.z, pos.x);
        let tangential = vec3<f32>(-sin(angle), 0.0, cos(angle));
        return tangential * mixing * 0.01;
      }

      fn applyBoundaryConditions(pos: vec3<f32>, vel: vec3<f32>) -> vec3<f32> {
        var new_vel = vel;
        
        // Reactor boundaries (simplified cylindrical reactor)
        let radius = length(pos.xz);
        if (radius > 2.0) {
          let normal = normalize(pos.xz);
          new_vel = reflect(vel, vec3<f32>(normal.x, 0.0, normal.y));
        }
        
        // Top and bottom boundaries
        if (pos.y > 3.0 || pos.y < -1.0) {
          new_vel.y = -new_vel.y * 0.8; // Energy loss on collision
        }
        
        return new_vel;
      }
    `

    // Ion transport compute shader
    const ionComputeShader = `
      @group(0) @binding(0) var<storage, read_write> ionPositions: array<vec3<f32>>;
      @group(0) @binding(1) var<storage, read_write> ionVelocities: array<vec3<f32>>;
      @group(0) @binding(2) var<storage, read> ionCharges: array<f32>;
      @group(0) @binding(3) var<storage, read> electricField: array<vec3<f32>>;
      @group(0) @binding(4) var<storage, read> parameters: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let index = global_id.x;
        if (index >= arrayLength(&ionPositions)) {
          return;
        }

        let dt = parameters[0];
        let electrodeVoltage = parameters[1];
        let ph = parameters[2];
        let ionicStrength = parameters[3];
        
        var position = ionPositions[index];
        var velocity = ionVelocities[index];
        let charge = ionCharges[index];
        
        // Electric force calculation
        let electricForce = getElectricFieldAtPosition(position) * charge;
        
        // Brownian motion
        let brownianForce = generateBrownianForce(index);
        
        // pH-dependent behavior
        let phFactor = calculatePHFactor(ph, charge);
        
        // Update velocity
        velocity += (electricForce + brownianForce) * phFactor * dt;
        
        // Apply drag
        velocity *= exp(-dt * ionicStrength * 0.1);
        
        // Update position
        position += velocity * dt;
        
        ionPositions[index] = position;
        ionVelocities[index] = velocity;
      }

      fn getElectricFieldAtPosition(pos: vec3<f32>) -> vec3<f32> {
        // Simplified electric field calculation between electrodes
        let anodePos = vec3<f32>(-1.0, 0.0, 0.0);
        let cathodePos = vec3<f32>(1.0, 0.0, 0.0);
        
        let anodeDistance = distance(pos, anodePos);
        let cathodeDistance = distance(pos, cathodePos);
        
        let anodeField = normalize(pos - anodePos) / (anodeDistance * anodeDistance + 0.1);
        let cathodeField = normalize(cathodePos - pos) / (cathodeDistance * cathodeDistance + 0.1);
        
        return (anodeField + cathodeField) * 0.1;
      }

      fn generateBrownianForce(seed: u32) -> vec3<f32> {
        // Pseudo-random Brownian motion
        let x = sin(f32(seed) * 12.9898) * 43758.5453;
        let y = sin(f32(seed) * 78.233) * 43758.5453;
        let z = sin(f32(seed) * 37.719) * 43758.5453;
        
        return vec3<f32>(
          fract(x) - 0.5,
          fract(y) - 0.5,
          fract(z) - 0.5
        ) * 0.01;
      }

      fn calculatePHFactor(ph: f32, charge: f32) -> f32 {
        // pH affects ion mobility
        let optimalPH = 7.0;
        let phDeviation = abs(ph - optimalPH);
        return exp(-phDeviation * 0.1) * (1.0 + abs(charge) * 0.1);
      }
    `

    // Bacterial growth compute shader
    const bacteriaComputeShader = `
      @group(0) @binding(0) var<storage, read_write> bacteriaPositions: array<vec3<f32>>;
      @group(0) @binding(1) var<storage, read_write> bacteriaStates: array<vec4<f32>>; // x: biomass, y: activity, z: age, w: health
      @group(0) @binding(2) var<storage, read> substrateConc: array<f32>;
      @group(0) @binding(3) var<storage, read> parameters: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let index = global_id.x;
        if (index >= arrayLength(&bacteriaPositions)) {
          return;
        }

        let dt = parameters[0];
        let temperature = parameters[1];
        let ph = parameters[2];
        let oxygenLevel = parameters[3];
        
        var position = bacteriaPositions[index];
        var state = bacteriaStates[index];
        
        // Growth kinetics (Monod model)
        let substrateAtPosition = getSubstrateConcentration(position);
        let growthRate = calculateGrowthRate(substrateAtPosition, temperature, ph, oxygenLevel);
        
        // Update biomass
        state.x += growthRate * state.x * dt;
        
        // Update activity based on conditions
        state.y = calculateActivityLevel(temperature, ph, substrateAtPosition);
        
        // Age the bacteria
        state.z += dt;
        
        // Calculate health
        state.w = calculateHealth(state.z, temperature, ph, substrateAtPosition);
        
        // Biofilm formation - bacteria move toward surfaces
        let surfaceAttraction = calculateSurfaceAttraction(position);
        position += surfaceAttraction * dt;
        
        bacteriaPositions[index] = position;
        bacteriaStates[index] = state;
      }

      fn getSubstrateConcentration(pos: vec3<f32>) -> f32 {
        // Simplified substrate distribution
        let centerDistance = length(pos);
        return exp(-centerDistance * 0.1) * 2.0; // Higher concentration near center
      }

      fn calculateGrowthRate(substrate: f32, temp: f32, ph: f32, oxygen: f32) -> f32 {
        // Monod kinetics with environmental factors
        let maxGrowthRate = 0.5; // h⁻¹
        let halfSaturation = 0.5; // g/L
        
        let monodFactor = substrate / (halfSaturation + substrate);
        let tempFactor = calculateTemperatureFactor(temp);
        let phFactor = calculatePHGrowthFactor(ph);
        let oxygenFactor = min(oxygen * 2.0, 1.0); // Oxygen limitation
        
        return maxGrowthRate * monodFactor * tempFactor * phFactor * oxygenFactor;
      }

      fn calculateTemperatureFactor(temp: f32) -> f32 {
        // Arrhenius-like temperature dependence
        let optimalTemp = 30.0; // °C
        let tempDeviation = abs(temp - optimalTemp);
        return exp(-tempDeviation * tempDeviation / 200.0);
      }

      fn calculatePHGrowthFactor(ph: f32) -> f32 {
        // Bell curve around optimal pH
        let optimalPH = 7.0;
        let phDeviation = abs(ph - optimalPH);
        return exp(-phDeviation * phDeviation / 2.0);
      }

      fn calculateActivityLevel(temp: f32, ph: f32, substrate: f32) -> f32 {
        let tempFactor = calculateTemperatureFactor(temp);
        let phFactor = calculatePHGrowthFactor(ph);
        let substrateFactor = substrate / (substrate + 1.0);
        
        return tempFactor * phFactor * substrateFactor;
      }

      fn calculateHealth(age: f32, temp: f32, ph: f32, substrate: f32) -> f32 {
        let ageFactor = exp(-age / 86400.0); // Decay over 24 hours
        let envFactor = calculateActivityLevel(temp, ph, substrate);
        
        return ageFactor * envFactor;
      }

      fn calculateSurfaceAttraction(pos: vec3<f32>) -> vec3<f32> {
        // Attract bacteria to electrode surfaces
        let anodePos = vec3<f32>(-1.0, 0.0, 0.0);
        let cathodePos = vec3<f32>(1.0, 0.0, 0.0);
        
        let toAnode = normalize(anodePos - pos);
        let toCathode = normalize(cathodePos - pos);
        
        let anodeDistance = distance(pos, anodePos);
        let cathodeDistance = distance(pos, cathodePos);
        
        // Stronger attraction to anode for electroactive bacteria
        let anodeAttraction = toAnode / (anodeDistance * anodeDistance + 1.0) * 0.1;
        let cathodeAttraction = toCathode / (cathodeDistance * cathodeDistance + 1.0) * 0.05;
        
        return anodeAttraction + cathodeAttraction;
      }
    `

    // Create compute pipelines
    const fluidModule = this.device.createShaderModule({ code: fluidComputeShader })
    const ionModule = this.device.createShaderModule({ code: ionComputeShader })
    const bacteriaModule = this.device.createShaderModule({ code: bacteriaComputeShader })

    this.computePipelines.set('fluid', this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: fluidModule,
        entryPoint: 'main'
      }
    }))

    this.computePipelines.set('ion', this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: ionModule,
        entryPoint: 'main'
      }
    }))

    this.computePipelines.set('bacteria', this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: bacteriaModule,
        entryPoint: 'main'
      }
    }))
  }

  private async initializeParticleSystems() {
    // Initialize particle systems with different configurations
    this.fluidParticles = new ParticleSystem(5000, {
      maxParticles: 5000,
      particleSize: 0.02,
      lifetimeRange: [10, 30],
      colorRange: [new THREE.Color(0x00ffff), new THREE.Color(0x0088ff)],
      velocityScale: 1.0,
      gravityEffect: 0.1
    })

    this.ionParticles = new ParticleSystem(2000, {
      maxParticles: 2000,
      particleSize: 0.01,
      lifetimeRange: [5, 15],
      colorRange: [new THREE.Color(0xff4444), new THREE.Color(0x4444ff)],
      velocityScale: 2.0,
      gravityEffect: 0.0
    })

    this.bacteriaParticles = new ParticleSystem(1000, {
      maxParticles: 1000,
      particleSize: 0.03,
      lifetimeRange: [60, 300],
      colorRange: [new THREE.Color(0x44ff44), new THREE.Color(0x88ff88)],
      velocityScale: 0.1,
      gravityEffect: 0.05
    })

    this.gasParticles = new ParticleSystem(3000, {
      maxParticles: 3000,
      particleSize: 0.015,
      lifetimeRange: [2, 8],
      colorRange: [new THREE.Color(0xffffff), new THREE.Color(0xcccccc)],
      velocityScale: 3.0,
      gravityEffect: -0.2
    })
  }

  private initializeCPUFallback() {
    console.log('Initializing CPU-based physics fallback')
    
    // Initialize simpler CPU-based particle systems
    this.fluidParticles = new ParticleSystem(1000, {
      maxParticles: 1000,
      particleSize: 0.02,
      lifetimeRange: [10, 30],
      colorRange: [new THREE.Color(0x00ffff), new THREE.Color(0x0088ff)],
      velocityScale: 1.0,
      gravityEffect: 0.1
    })

    this.gasParticles = new ParticleSystem(500, {
      maxParticles: 500,
      particleSize: 0.015,
      lifetimeRange: [2, 8],
      colorRange: [new THREE.Color(0xffffff), new THREE.Color(0xcccccc)],
      velocityScale: 3.0,
      gravityEffect: -0.2
    })

    this.isInitialized = true
  }

  public update(deltaTime: number, parameters: PhysicsParameters) {
    if (!this.isInitialized) return

    this.simulationTime += deltaTime

    if (this.device && this.computePipelines.size > 0) {
      this.updateWebGPU(deltaTime, parameters)
    } else {
      this.updateCPU(deltaTime, parameters)
    }
  }

  private async updateWebGPU(deltaTime: number, parameters: PhysicsParameters) {
    if (!this.device) return

    const commandEncoder = this.device.createCommandEncoder()
    
    // Update fluid dynamics
    if (this.fluidParticles) {
      await this.runFluidCompute(commandEncoder, deltaTime, parameters)
    }

    // Update ion transport
    if (this.ionParticles) {
      await this.runIonCompute(commandEncoder, deltaTime, parameters)
    }

    // Update bacterial growth
    if (this.bacteriaParticles) {
      await this.runBacteriaCompute(commandEncoder, deltaTime, parameters)
    }

    this.device.queue.submit([commandEncoder.finish()])
  }

  private async runFluidCompute(encoder: GPUCommandEncoder, deltaTime: number, parameters: PhysicsParameters) {
    const pipeline = this.computePipelines.get('fluid')
    if (!pipeline || !this.fluidParticles) return

    const computePass = encoder.beginComputePass()
    computePass.setPipeline(pipeline)
    
    // Set bind groups with updated parameters
    const bindGroup = this.createFluidBindGroup(deltaTime, parameters)
    computePass.setBindGroup(0, bindGroup)
    
    const workgroupCount = Math.ceil(this.fluidParticles.count / 64)
    computePass.dispatchWorkgroups(workgroupCount)
    computePass.end()
  }

  private async runIonCompute(encoder: GPUCommandEncoder, deltaTime: number, parameters: PhysicsParameters) {
    const pipeline = this.computePipelines.get('ion')
    if (!pipeline || !this.ionParticles) return

    const computePass = encoder.beginComputePass()
    computePass.setPipeline(pipeline)
    
    const bindGroup = this.createIonBindGroup(deltaTime, parameters)
    computePass.setBindGroup(0, bindGroup)
    
    const workgroupCount = Math.ceil(this.ionParticles.count / 64)
    computePass.dispatchWorkgroups(workgroupCount)
    computePass.end()
  }

  private async runBacteriaCompute(encoder: GPUCommandEncoder, deltaTime: number, parameters: PhysicsParameters) {
    const pipeline = this.computePipelines.get('bacteria')
    if (!pipeline || !this.bacteriaParticles) return

    const computePass = encoder.beginComputePass()
    computePass.setPipeline(pipeline)
    
    const bindGroup = this.createBacteriaBindGroup(deltaTime, parameters)
    computePass.setBindGroup(0, bindGroup)
    
    const workgroupCount = Math.ceil(this.bacteriaParticles.count / 64)
    computePass.dispatchWorkgroups(workgroupCount)
    computePass.end()
  }

  private createFluidBindGroup(deltaTime: number, parameters: PhysicsParameters): GPUBindGroup {
    if (!this.device || !this.fluidParticles) throw new Error('Device or particles not initialized')

    // Create parameter buffer
    const parameterData = new Float32Array([
      deltaTime,
      parameters.flowRate,
      parameters.mixingSpeed,
      parameters.temperature
    ])

    const parameterBuffer = this.device.createBuffer({
      size: parameterData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })

    this.device.queue.writeBuffer(parameterBuffer, 0, parameterData)

    // Create fluid properties buffer
    const fluidData = new Float32Array([
      0.001, // viscosity
      1000,  // density
      parameters.temperature,
      parameters.ph
    ])

    const fluidBuffer = this.device.createBuffer({
      size: fluidData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })

    this.device.queue.writeBuffer(fluidBuffer, 0, fluidData)

    const pipeline = this.computePipelines.get('fluid')!
    return this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.fluidParticles.positionBuffer } },
        { binding: 1, resource: { buffer: this.fluidParticles.velocityBuffer } },
        { binding: 2, resource: { buffer: parameterBuffer } },
        { binding: 3, resource: { buffer: fluidBuffer } }
      ]
    })
  }

  private createIonBindGroup(deltaTime: number, parameters: PhysicsParameters): GPUBindGroup {
    // Similar implementation for ion transport
    // ... implementation details
    throw new Error('Ion bind group creation not implemented')
  }

  private createBacteriaBindGroup(deltaTime: number, parameters: PhysicsParameters): GPUBindGroup {
    // Similar implementation for bacterial growth
    // ... implementation details
    throw new Error('Bacteria bind group creation not implemented')
  }

  private updateCPU(deltaTime: number, parameters: PhysicsParameters) {
    // CPU-based physics updates
    if (this.fluidParticles) {
      this.fluidParticles.updateCPU(deltaTime, parameters)
    }

    if (this.gasParticles) {
      this.gasParticles.updateCPU(deltaTime, parameters)
    }
  }

  public getFluidParticles(): ParticleSystem | null {
    return this.fluidParticles
  }

  public getIonParticles(): ParticleSystem | null {
    return this.ionParticles
  }

  public getBacteriaParticles(): ParticleSystem | null {
    return this.bacteriaParticles
  }

  public getGasParticles(): ParticleSystem | null {
    return this.gasParticles
  }

  public dispose() {
    // Clean up WebGPU resources
    this.particleBuffers.forEach(buffer => buffer.destroy())
    this.particleBuffers.clear()
    this.computePipelines.clear()
    this.bindGroups.clear()

    // Clean up particle systems
    this.fluidParticles?.dispose()
    this.ionParticles?.dispose()
    this.bacteriaParticles?.dispose()
    this.gasParticles?.dispose()

    this.isInitialized = false
  }
}

// Particle system class
class ParticleSystem {
  public count: number
  public positionBuffer!: GPUBuffer
  public velocityBuffer!: GPUBuffer
  public config: ParticleSystemConfig
  
  // CPU fallback arrays
  public positions: Float32Array
  public velocities: Float32Array
  public lifetimes: Float32Array
  public colors: Float32Array

  constructor(count: number, config: ParticleSystemConfig) {
    this.count = count
    this.config = config
    
    // Initialize CPU arrays
    this.positions = new Float32Array(count * 3)
    this.velocities = new Float32Array(count * 3)
    this.lifetimes = new Float32Array(count)
    this.colors = new Float32Array(count * 3)
    
    this.initializeParticles()
  }

  private initializeParticles() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      
      // Random initial positions
      this.positions[i3] = (Math.random() - 0.5) * 4
      this.positions[i3 + 1] = Math.random() * 2
      this.positions[i3 + 2] = (Math.random() - 0.5) * 4
      
      // Random initial velocities
      this.velocities[i3] = (Math.random() - 0.5) * this.config.velocityScale
      this.velocities[i3 + 1] = (Math.random() - 0.5) * this.config.velocityScale
      this.velocities[i3 + 2] = (Math.random() - 0.5) * this.config.velocityScale
      
      // Random lifetimes
      this.lifetimes[i] = Math.random() * (this.config.lifetimeRange[1] - this.config.lifetimeRange[0]) + this.config.lifetimeRange[0]
      
      // Interpolated colors
      const t = Math.random()
      const color = this.config.colorRange[0].clone().lerp(this.config.colorRange[1], t)
      this.colors[i3] = color.r
      this.colors[i3 + 1] = color.g
      this.colors[i3 + 2] = color.b
    }
  }

  public updateCPU(deltaTime: number, parameters: PhysicsParameters) {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      
      // Update lifetime
      this.lifetimes[i] -= deltaTime
      
      // Reset particle if dead
      if (this.lifetimes[i] <= 0) {
        this.resetParticle(i)
        continue
      }
      
      // Apply forces
      this.velocities[i3 + 1] += this.config.gravityEffect * deltaTime
      
      // Update position
      this.positions[i3] += this.velocities[i3] * deltaTime
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime
      
      // Apply mixing forces
      const radius = Math.sqrt(this.positions[i3] * this.positions[i3] + this.positions[i3 + 2] * this.positions[i3 + 2])
      if (radius > 0.1) {
        const angle = Math.atan2(this.positions[i3 + 2], this.positions[i3])
        this.velocities[i3] += -Math.sin(angle) * parameters.mixingSpeed * 0.01 * deltaTime
        this.velocities[i3 + 2] += Math.cos(angle) * parameters.mixingSpeed * 0.01 * deltaTime
      }
      
      // Boundary conditions
      if (radius > 2) {
        const normal = [this.positions[i3] / radius, 0, this.positions[i3 + 2] / radius]
        this.velocities[i3] -= normal[0] * 2
        this.velocities[i3 + 2] -= normal[2] * 2
      }
      
      if (this.positions[i3 + 1] < 0) {
        this.positions[i3 + 1] = 0
        this.velocities[i3 + 1] = Math.abs(this.velocities[i3 + 1]) * 0.8
      }
      
      if (this.positions[i3 + 1] > 3) {
        this.positions[i3 + 1] = 3
        this.velocities[i3 + 1] = -Math.abs(this.velocities[i3 + 1]) * 0.8
      }
    }
  }

  private resetParticle(index: number) {
    const i3 = index * 3
    
    // Reset position
    this.positions[i3] = (Math.random() - 0.5) * 4
    this.positions[i3 + 1] = Math.random() * 2
    this.positions[i3 + 2] = (Math.random() - 0.5) * 4
    
    // Reset velocity
    this.velocities[i3] = (Math.random() - 0.5) * this.config.velocityScale
    this.velocities[i3 + 1] = (Math.random() - 0.5) * this.config.velocityScale
    this.velocities[i3 + 2] = (Math.random() - 0.5) * this.config.velocityScale
    
    // Reset lifetime
    this.lifetimes[index] = Math.random() * (this.config.lifetimeRange[1] - this.config.lifetimeRange[0]) + this.config.lifetimeRange[0]
  }

  public dispose() {
    if (this.positionBuffer) this.positionBuffer.destroy()
    if (this.velocityBuffer) this.velocityBuffer.destroy()
  }
}