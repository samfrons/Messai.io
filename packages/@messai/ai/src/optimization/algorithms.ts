import { BioreactorParameters, PredictionInput } from '@messai/core'

// ============================================================================
// OPTIMIZATION INTERFACES
// ============================================================================

export interface OptimizationObjective {
  type: 'MAXIMIZE_POWER' | 'MAXIMIZE_EFFICIENCY' | 'MINIMIZE_COST' | 'MAXIMIZE_DURABILITY' | 'MULTI_OBJECTIVE'
  weights?: {
    power?: number
    efficiency?: number
    cost?: number
    durability?: number
  }
  targets?: {
    minPower?: number
    minEfficiency?: number
    maxCost?: number
    minDurability?: number
  }
}

export interface OptimizationConstraints {
  // Operating constraints
  temperature: { min: number; max: number }
  ph: { min: number; max: number }
  flowRate: { min: number; max: number }
  mixingSpeed: { min: number; max: number }
  electrodeVoltage: { min: number; max: number }
  substrateConcentration: { min: number; max: number }
  
  // Additional constraints
  pressure?: { min: number; max: number }
  oxygenLevel?: { min: number; max: number }
  salinity?: { min: number; max: number }
  
  // Material constraints
  availableMaterials?: {
    anodeTypes?: string[]
    cathodeTypes?: string[]
    membraneTypes?: string[]
  }
  
  // Economic constraints
  maxSystemCost?: number
  maxOperatingCost?: number
}

export interface OptimizationParameters {
  algorithm: 'GRADIENT_DESCENT' | 'GENETIC_ALGORITHM' | 'PARTICLE_SWARM' | 'SIMULATED_ANNEALING' | 'BAYESIAN'
  maxIterations: number
  convergenceTolerance: number
  populationSize?: number // For GA and PSO
  temperatureSchedule?: 'LINEAR' | 'EXPONENTIAL' | 'ADAPTIVE' // For SA
  acquisitionFunction?: 'EI' | 'PI' | 'UCB' // For Bayesian
}

export interface OptimizationResult {
  success: boolean
  optimizedParameters: BioreactorParameters
  objectiveValue: number
  constraintViolations: string[]
  iterations: number
  convergenceHistory: {
    iteration: number
    objectiveValue: number
    parameters: Partial<BioreactorParameters>
  }[]
  paretoFront?: { // For multi-objective
    power: number
    efficiency: number
    cost: number
    parameters: BioreactorParameters
  }[]
  sensitivity?: {
    parameter: string
    sensitivity: number
    optimalRange: { min: number; max: number }
  }[]
}

// ============================================================================
// BASE OPTIMIZATION ALGORITHM
// ============================================================================

export abstract class OptimizationAlgorithm {
  protected objective: OptimizationObjective
  protected constraints: OptimizationConstraints
  protected parameters: OptimizationParameters
  protected evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>
  
  constructor(
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    parameters: OptimizationParameters,
    evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>
  ) {
    this.objective = objective
    this.constraints = constraints
    this.parameters = parameters
    this.evaluationFunction = evaluationFunction
  }
  
  abstract optimize(initialGuess: BioreactorParameters): Promise<OptimizationResult>
  
  protected async evaluateObjective(params: BioreactorParameters): Promise<number> {
    const evaluation = await this.evaluationFunction(params)
    
    switch (this.objective.type) {
      case 'MAXIMIZE_POWER':
        return -evaluation.power // Negative for minimization
        
      case 'MAXIMIZE_EFFICIENCY':
        return -evaluation.efficiency
        
      case 'MINIMIZE_COST':
        return evaluation.cost || this.estimateCost(params)
        
      case 'MAXIMIZE_DURABILITY':
        return -this.estimateDurability(params)
        
      case 'MULTI_OBJECTIVE':
        const weights = this.objective.weights || {}
        return -(
          (weights.power || 0) * evaluation.power +
          (weights.efficiency || 0) * evaluation.efficiency -
          (weights.cost || 0) * (evaluation.cost || this.estimateCost(params)) +
          (weights.durability || 0) * this.estimateDurability(params)
        )
        
      default:
        return 0
    }
  }
  
  protected checkConstraints(params: BioreactorParameters): string[] {
    const violations: string[] = []
    
    // Check operating constraints
    if (params.temperature < this.constraints.temperature.min || 
        params.temperature > this.constraints.temperature.max) {
      violations.push(`Temperature ${params.temperature} outside range [${this.constraints.temperature.min}, ${this.constraints.temperature.max}]`)
    }
    
    if (params.ph < this.constraints.ph.min || 
        params.ph > this.constraints.ph.max) {
      violations.push(`pH ${params.ph} outside range [${this.constraints.ph.min}, ${this.constraints.ph.max}]`)
    }
    
    if (params.flowRate < this.constraints.flowRate.min || 
        params.flowRate > this.constraints.flowRate.max) {
      violations.push(`Flow rate ${params.flowRate} outside range [${this.constraints.flowRate.min}, ${this.constraints.flowRate.max}]`)
    }
    
    if (params.mixingSpeed < this.constraints.mixingSpeed.min || 
        params.mixingSpeed > this.constraints.mixingSpeed.max) {
      violations.push(`Mixing speed ${params.mixingSpeed} outside range [${this.constraints.mixingSpeed.min}, ${this.constraints.mixingSpeed.max}]`)
    }
    
    if (params.electrodeVoltage < this.constraints.electrodeVoltage.min || 
        params.electrodeVoltage > this.constraints.electrodeVoltage.max) {
      violations.push(`Electrode voltage ${params.electrodeVoltage} outside range [${this.constraints.electrodeVoltage.min}, ${this.constraints.electrodeVoltage.max}]`)
    }
    
    if (params.substrateConcentration < this.constraints.substrateConcentration.min || 
        params.substrateConcentration > this.constraints.substrateConcentration.max) {
      violations.push(`Substrate concentration ${params.substrateConcentration} outside range [${this.constraints.substrateConcentration.min}, ${this.constraints.substrateConcentration.max}]`)
    }
    
    // Check optional constraints
    if (this.constraints.pressure && params.pressure !== undefined) {
      if (params.pressure < this.constraints.pressure.min || 
          params.pressure > this.constraints.pressure.max) {
        violations.push(`Pressure ${params.pressure} outside range [${this.constraints.pressure.min}, ${this.constraints.pressure.max}]`)
      }
    }
    
    // Check target constraints
    if (this.objective.targets) {
      const evaluation = this.evaluationFunction(params)
      evaluation.then(eval => {
        if (this.objective.targets!.minPower && eval.power < this.objective.targets!.minPower) {
          violations.push(`Power ${eval.power}W below minimum ${this.objective.targets!.minPower}W`)
        }
        if (this.objective.targets!.minEfficiency && eval.efficiency < this.objective.targets!.minEfficiency) {
          violations.push(`Efficiency ${eval.efficiency}% below minimum ${this.objective.targets!.minEfficiency}%`)
        }
      })
    }
    
    return violations
  }
  
  protected estimateCost(params: BioreactorParameters): number {
    // Simplified cost model for MESS systems
    const baseCost = 500 // Base system cost
    
    // Operating cost factors
    const temperatureCost = Math.abs(params.temperature - 30) * 2 // Deviation from ambient
    const mixingCost = params.mixingSpeed * 0.1 // Energy for mixing
    const voltageCost = params.electrodeVoltage * 0.05 // Power consumption
    
    // Material cost estimate based on performance
    const performanceFactor = params.substrateConcentration * params.flowRate * 0.01
    
    return baseCost + temperatureCost + mixingCost + voltageCost + performanceFactor
  }
  
  protected estimateDurability(params: BioreactorParameters): number {
    // Simplified durability model (hours)
    let baseDurability = 8760 // Base durability in hours (1 year)
    
    // Temperature effects
    const optimalTemp = 30
    const tempDeviation = Math.abs(params.temperature - optimalTemp)
    baseDurability *= Math.exp(-tempDeviation / 50)
    
    // pH effects
    const optimalPH = 7.0
    const phDeviation = Math.abs(params.ph - optimalPH)
    baseDurability *= Math.exp(-phDeviation / 2)
    
    // Voltage stress
    if (params.electrodeVoltage > 150) {
      baseDurability *= 0.8 // High voltage reduces durability
    }
    
    // Mixing stress
    if (params.mixingSpeed > 250) {
      baseDurability *= 0.9 // High mixing can damage biofilm
    }
    
    return baseDurability
  }
}

// ============================================================================
// GRADIENT DESCENT OPTIMIZER
// ============================================================================

export class GradientDescentOptimizer extends OptimizationAlgorithm {
  async optimize(initialGuess: BioreactorParameters): Promise<OptimizationResult> {
    const history: OptimizationResult['convergenceHistory'] = []
    let current = { ...initialGuess }
    let iteration = 0
    const learningRate = 0.01
    const epsilon = 1e-6 // For numerical gradient
    
    while (iteration < this.parameters.maxIterations) {
      const currentObjective = await this.evaluateObjective(current)
      history.push({
        iteration,
        objectiveValue: -currentObjective, // Convert back to maximization
        parameters: { ...current }
      })
      
      // Calculate gradients numerically
      const gradients: Partial<BioreactorParameters> = {}
      
      // Gradient for continuous parameters
      const continuousParams = ['temperature', 'ph', 'flowRate', 'mixingSpeed', 
                               'electrodeVoltage', 'substrateConcentration'] as const
      
      for (const param of continuousParams) {
        const perturbedPos = { ...current, [param]: current[param] + epsilon }
        const perturbedNeg = { ...current, [param]: current[param] - epsilon }
        
        const objPos = await this.evaluateObjective(perturbedPos)
        const objNeg = await this.evaluateObjective(perturbedNeg)
        
        gradients[param] = (objPos - objNeg) / (2 * epsilon)
      }
      
      // Update parameters
      let converged = true
      for (const [param, gradient] of Object.entries(gradients)) {
        const oldValue = current[param as keyof BioreactorParameters] as number
        const newValue = oldValue - learningRate * gradient
        
        // Apply constraints
        if (param === 'temperature') {
          current.temperature = Math.max(this.constraints.temperature.min, 
                                        Math.min(this.constraints.temperature.max, newValue))
        } else if (param === 'ph') {
          current.ph = Math.max(this.constraints.ph.min, 
                               Math.min(this.constraints.ph.max, newValue))
        } else if (param === 'flowRate') {
          current.flowRate = Math.max(this.constraints.flowRate.min, 
                                     Math.min(this.constraints.flowRate.max, newValue))
        } else if (param === 'mixingSpeed') {
          current.mixingSpeed = Math.max(this.constraints.mixingSpeed.min, 
                                        Math.min(this.constraints.mixingSpeed.max, newValue))
        } else if (param === 'electrodeVoltage') {
          current.electrodeVoltage = Math.max(this.constraints.electrodeVoltage.min, 
                                             Math.min(this.constraints.electrodeVoltage.max, newValue))
        } else if (param === 'substrateConcentration') {
          current.substrateConcentration = Math.max(this.constraints.substrateConcentration.min, 
                                                   Math.min(this.constraints.substrateConcentration.max, newValue))
        }
        
        if (Math.abs(gradient) > this.parameters.convergenceTolerance) {
          converged = false
        }
      }
      
      if (converged) break
      iteration++
    }
    
    const finalObjective = await this.evaluateObjective(current)
    const violations = this.checkConstraints(current)
    
    return {
      success: violations.length === 0,
      optimizedParameters: current,
      objectiveValue: -finalObjective,
      constraintViolations: violations,
      iterations: iteration,
      convergenceHistory: history
    }
  }
}

// ============================================================================
// GENETIC ALGORITHM OPTIMIZER
// ============================================================================

export class GeneticAlgorithmOptimizer extends OptimizationAlgorithm {
  async optimize(initialGuess: BioreactorParameters): Promise<OptimizationResult> {
    const populationSize = this.parameters.populationSize || 50
    const mutationRate = 0.1
    const crossoverRate = 0.8
    const eliteSize = Math.floor(populationSize * 0.1)
    
    // Initialize population
    let population = this.initializePopulation(initialGuess, populationSize)
    const history: OptimizationResult['convergenceHistory'] = []
    let iteration = 0
    
    while (iteration < this.parameters.maxIterations) {
      // Evaluate fitness
      const fitness = await Promise.all(
        population.map(async (individual) => ({
          individual,
          fitness: -(await this.evaluateObjective(individual)) // Convert to maximization
        }))
      )
      
      // Sort by fitness
      fitness.sort((a, b) => b.fitness - a.fitness)
      
      // Record best
      history.push({
        iteration,
        objectiveValue: fitness[0].fitness,
        parameters: { ...fitness[0].individual }
      })
      
      // Check convergence
      if (iteration > 10) {
        const recentBest = history.slice(-10).map(h => h.objectiveValue)
        const variance = this.calculateVariance(recentBest)
        if (variance < this.parameters.convergenceTolerance) break
      }
      
      // Selection and reproduction
      const newPopulation: BioreactorParameters[] = []
      
      // Elitism
      for (let i = 0; i < eliteSize; i++) {
        newPopulation.push({ ...fitness[i].individual })
      }
      
      // Crossover and mutation
      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(fitness)
        const parent2 = this.tournamentSelection(fitness)
        
        if (Math.random() < crossoverRate) {
          const [child1, child2] = this.crossover(parent1.individual, parent2.individual)
          newPopulation.push(this.mutate(child1, mutationRate))
          if (newPopulation.length < populationSize) {
            newPopulation.push(this.mutate(child2, mutationRate))
          }
        } else {
          newPopulation.push(this.mutate({ ...parent1.individual }, mutationRate))
        }
      }
      
      population = newPopulation
      iteration++
    }
    
    // Final evaluation
    const finalFitness = await Promise.all(
      population.map(async (individual) => ({
        individual,
        fitness: -(await this.evaluateObjective(individual))
      }))
    )
    finalFitness.sort((a, b) => b.fitness - a.fitness)
    
    const best = finalFitness[0]
    const violations = this.checkConstraints(best.individual)
    
    return {
      success: violations.length === 0,
      optimizedParameters: best.individual,
      objectiveValue: best.fitness,
      constraintViolations: violations,
      iterations: iteration,
      convergenceHistory: history
    }
  }
  
  private initializePopulation(
    initialGuess: BioreactorParameters, 
    size: number
  ): BioreactorParameters[] {
    const population: BioreactorParameters[] = [{ ...initialGuess }]
    
    while (population.length < size) {
      const individual: BioreactorParameters = {
        temperature:
          this.constraints.temperature.min + 
          Math.random() * (this.constraints.temperature.max - this.constraints.temperature.min),
        ph:
          this.constraints.ph.min + 
          Math.random() * (this.constraints.ph.max - this.constraints.ph.min),
        flowRate:
          this.constraints.flowRate.min + 
          Math.random() * (this.constraints.flowRate.max - this.constraints.flowRate.min),
        mixingSpeed:
          this.constraints.mixingSpeed.min + 
          Math.random() * (this.constraints.mixingSpeed.max - this.constraints.mixingSpeed.min),
        electrodeVoltage:
          this.constraints.electrodeVoltage.min + 
          Math.random() * (this.constraints.electrodeVoltage.max - this.constraints.electrodeVoltage.min),
        substrateConcentration:
          this.constraints.substrateConcentration.min + 
          Math.random() * (this.constraints.substrateConcentration.max - this.constraints.substrateConcentration.min)
      }
      
      // Add optional parameters if constraints exist
      if (this.constraints.pressure) {
        individual.pressure = this.constraints.pressure.min + 
          Math.random() * (this.constraints.pressure.max - this.constraints.pressure.min)
      }
      
      if (this.constraints.oxygenLevel) {
        individual.oxygenLevel = this.constraints.oxygenLevel.min + 
          Math.random() * (this.constraints.oxygenLevel.max - this.constraints.oxygenLevel.min)
      }
      
      if (this.constraints.salinity) {
        individual.salinity = this.constraints.salinity.min + 
          Math.random() * (this.constraints.salinity.max - this.constraints.salinity.min)
      }
      
      population.push(individual)
    }
    
    return population
  }
  
  private tournamentSelection(
    fitness: { individual: BioreactorParameters; fitness: number }[]
  ): { individual: BioreactorParameters; fitness: number } {
    const tournamentSize = 3
    let best = fitness[Math.floor(Math.random() * fitness.length)]
    
    for (let i = 1; i < tournamentSize; i++) {
      const competitor = fitness[Math.floor(Math.random() * fitness.length)]
      if (competitor.fitness > best.fitness) {
        best = competitor
      }
    }
    
    return best
  }
  
  private crossover(
    parent1: BioreactorParameters, 
    parent2: BioreactorParameters
  ): [BioreactorParameters, BioreactorParameters] {
    const child1 = { ...parent1 }
    const child2 = { ...parent2 }
    
    // Uniform crossover for continuous variables
    const continuousParams = ['temperature', 'ph', 'flowRate', 
                             'mixingSpeed', 'electrodeVoltage', 'substrateConcentration'] as const
    
    for (const param of continuousParams) {
      if (Math.random() < 0.5) {
        const temp = child1[param]
        child1[param] = child2[param]
        child2[param] = temp
      }
    }
    
    return [child1, child2]
  }
  
  private mutate(individual: BioreactorParameters, rate: number): BioreactorParameters {
    const mutated = { ...individual }
    
    // Mutate continuous parameters
    if (Math.random() < rate) {
      mutated.temperature += (Math.random() - 0.5) * 10
      mutated.temperature = Math.max(this.constraints.temperature.min, 
                                    Math.min(this.constraints.temperature.max, mutated.temperature))
    }
    
    if (Math.random() < rate) {
      mutated.ph += (Math.random() - 0.5) * 1
      mutated.ph = Math.max(this.constraints.ph.min, 
                           Math.min(this.constraints.ph.max, mutated.ph))
    }
    
    if (Math.random() < rate) {
      mutated.flowRate += (Math.random() - 0.5) * 20
      mutated.flowRate = Math.max(this.constraints.flowRate.min, 
                                 Math.min(this.constraints.flowRate.max, mutated.flowRate))
    }
    
    if (Math.random() < rate) {
      mutated.mixingSpeed += (Math.random() - 0.5) * 50
      mutated.mixingSpeed = Math.max(this.constraints.mixingSpeed.min, 
                                     Math.min(this.constraints.mixingSpeed.max, mutated.mixingSpeed))
    }
    
    if (Math.random() < rate) {
      mutated.electrodeVoltage += (Math.random() - 0.5) * 20
      mutated.electrodeVoltage = Math.max(this.constraints.electrodeVoltage.min, 
                                          Math.min(this.constraints.electrodeVoltage.max, mutated.electrodeVoltage))
    }
    
    if (Math.random() < rate) {
      mutated.substrateConcentration += (Math.random() - 0.5) * 1
      mutated.substrateConcentration = Math.max(this.constraints.substrateConcentration.min, 
                                                Math.min(this.constraints.substrateConcentration.max, mutated.substrateConcentration))
    }
    
    return mutated
  }
  
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }
}

// ============================================================================
// BAYESIAN OPTIMIZER
// ============================================================================

export class BayesianOptimizer extends OptimizationAlgorithm {
  private observations: { params: BioreactorParameters; value: number }[] = []
  
  async optimize(initialGuess: BioreactorParameters): Promise<OptimizationResult> {
    const history: OptimizationResult['convergenceHistory'] = []
    let iteration = 0
    
    // Initial samples
    const initialSamples = this.generateInitialSamples(initialGuess, 10)
    for (const sample of initialSamples) {
      const value = -(await this.evaluateObjective(sample))
      this.observations.push({ params: sample, value })
      history.push({
        iteration: iteration++,
        objectiveValue: value,
        parameters: { ...sample }
      })
    }
    
    // Bayesian optimization loop
    while (iteration < this.parameters.maxIterations) {
      // Find next point to evaluate using acquisition function
      const nextPoint = await this.selectNextPoint()
      const value = -(await this.evaluateObjective(nextPoint))
      
      this.observations.push({ params: nextPoint, value })
      history.push({
        iteration: iteration++,
        objectiveValue: value,
        parameters: { ...nextPoint }
      })
      
      // Check convergence
      if (iteration > 20) {
        const recentBest = history.slice(-10).map(h => h.objectiveValue)
        const improvement = Math.max(...recentBest) - Math.min(...recentBest)
        if (improvement < this.parameters.convergenceTolerance) break
      }
    }
    
    // Find best observation
    const best = this.observations.reduce((prev, curr) => 
      curr.value > prev.value ? curr : prev
    )
    
    const violations = this.checkConstraints(best.params)
    
    return {
      success: violations.length === 0,
      optimizedParameters: best.params,
      objectiveValue: best.value,
      constraintViolations: violations,
      iterations: iteration,
      convergenceHistory: history
    }
  }
  
  private generateInitialSamples(
    initialGuess: BioreactorParameters, 
    count: number
  ): BioreactorParameters[] {
    // Latin Hypercube Sampling for better coverage
    const samples: BioreactorParameters[] = []
    
    for (let i = 0; i < count; i++) {
      const sample: BioreactorParameters = {
        temperature:
          this.constraints.temperature.min + 
          (i + Math.random()) / count * (this.constraints.temperature.max - this.constraints.temperature.min),
        ph:
          this.constraints.ph.min + 
          (i + Math.random()) / count * (this.constraints.ph.max - this.constraints.ph.min),
        flowRate:
          this.constraints.flowRate.min + 
          (i + Math.random()) / count * (this.constraints.flowRate.max - this.constraints.flowRate.min),
        mixingSpeed:
          this.constraints.mixingSpeed.min + 
          (i + Math.random()) / count * (this.constraints.mixingSpeed.max - this.constraints.mixingSpeed.min),
        electrodeVoltage:
          this.constraints.electrodeVoltage.min + 
          (i + Math.random()) / count * (this.constraints.electrodeVoltage.max - this.constraints.electrodeVoltage.min),
        substrateConcentration:
          this.constraints.substrateConcentration.min + 
          (i + Math.random()) / count * (this.constraints.substrateConcentration.max - this.constraints.substrateConcentration.min)
      }
      samples.push(sample)
    }
    
    return samples
  }
  
  private async selectNextPoint(): Promise<BioreactorParameters> {
    // Simplified acquisition function (Expected Improvement)
    // In practice, this would use Gaussian Process regression
    
    const currentBest = Math.max(...this.observations.map(o => o.value))
    let bestAcquisition = -Infinity
    let bestPoint = this.observations[0].params
    
    // Sample random points and evaluate acquisition
    for (let i = 0; i < 100; i++) {
      const candidate = this.generateRandomPoint()
      const acquisition = await this.expectedImprovement(candidate, currentBest)
      
      if (acquisition > bestAcquisition) {
        bestAcquisition = acquisition
        bestPoint = candidate
      }
    }
    
    return bestPoint
  }
  
  private async expectedImprovement(
    point: BioreactorParameters, 
    currentBest: number
  ): Promise<number> {
    // Simplified EI calculation
    // In practice, this would use GP predictions
    
    // Find nearest neighbor
    let minDistance = Infinity
    let nearestValue = 0
    
    for (const obs of this.observations) {
      const distance = this.calculateDistance(point, obs.params)
      if (distance < minDistance) {
        minDistance = distance
        nearestValue = obs.value
      }
    }
    
    // Simple uncertainty estimate based on distance
    const uncertainty = minDistance * 10
    const improvement = Math.max(0, nearestValue - currentBest)
    
    return improvement + uncertainty
  }
  
  private calculateDistance(p1: BioreactorParameters, p2: BioreactorParameters): number {
    return Math.sqrt(
      Math.pow((p1.temperature - p2.temperature) / 10, 2) +
      Math.pow((p1.ph - p2.ph) / 1, 2) +
      Math.pow((p1.flowRate - p2.flowRate) / 10, 2) +
      Math.pow((p1.mixingSpeed - p2.mixingSpeed) / 50, 2) +
      Math.pow((p1.electrodeVoltage - p2.electrodeVoltage) / 20, 2) +
      Math.pow((p1.substrateConcentration - p2.substrateConcentration) / 1, 2)
    )
  }
  
  private generateRandomPoint(): BioreactorParameters {
    return {
      temperature:
        this.constraints.temperature.min + 
        Math.random() * (this.constraints.temperature.max - this.constraints.temperature.min),
      ph:
        this.constraints.ph.min + 
        Math.random() * (this.constraints.ph.max - this.constraints.ph.min),
      flowRate:
        this.constraints.flowRate.min + 
        Math.random() * (this.constraints.flowRate.max - this.constraints.flowRate.min),
      mixingSpeed:
        this.constraints.mixingSpeed.min + 
        Math.random() * (this.constraints.mixingSpeed.max - this.constraints.mixingSpeed.min),
      electrodeVoltage:
        this.constraints.electrodeVoltage.min + 
        Math.random() * (this.constraints.electrodeVoltage.max - this.constraints.electrodeVoltage.min),
      substrateConcentration:
        this.constraints.substrateConcentration.min + 
        Math.random() * (this.constraints.substrateConcentration.max - this.constraints.substrateConcentration.min)
    }
  }
}

// ============================================================================
// PARTICLE SWARM OPTIMIZER
// ============================================================================

export class ParticleSwarmOptimizer extends OptimizationAlgorithm {
  async optimize(initialGuess: BioreactorParameters): Promise<OptimizationResult> {
    const swarmSize = this.parameters.populationSize || 30
    const w = 0.729 // Inertia weight
    const c1 = 1.49445 // Cognitive coefficient
    const c2 = 1.49445 // Social coefficient
    
    // Initialize swarm
    const particles = this.initializeSwarm(initialGuess, swarmSize)
    const velocities = particles.map(() => this.initializeVelocity())
    const personalBest = particles.map(p => ({ params: { ...p }, fitness: -Infinity }))
    let globalBest = { params: { ...initialGuess }, fitness: -Infinity }
    
    const history: OptimizationResult['convergenceHistory'] = []
    let iteration = 0
    
    while (iteration < this.parameters.maxIterations) {
      // Evaluate fitness and update bests
      for (let i = 0; i < particles.length; i++) {
        const fitness = -(await this.evaluateObjective(particles[i]))
        
        if (fitness > personalBest[i].fitness) {
          personalBest[i] = { params: { ...particles[i] }, fitness }
        }
        
        if (fitness > globalBest.fitness) {
          globalBest = { params: { ...particles[i] }, fitness }
        }
      }
      
      // Record best
      history.push({
        iteration,
        objectiveValue: globalBest.fitness,
        parameters: { ...globalBest.params }
      })
      
      // Check convergence
      if (iteration > 10) {
        const recentBest = history.slice(-10).map(h => h.objectiveValue)
        const variance = this.calculateVariance(recentBest)
        if (variance < this.parameters.convergenceTolerance) break
      }
      
      // Update velocities and positions
      for (let i = 0; i < particles.length; i++) {
        velocities[i] = this.updateVelocity(
          particles[i], velocities[i], personalBest[i].params, globalBest.params, w, c1, c2
        )
        particles[i] = this.updatePosition(particles[i], velocities[i])
      }
      
      iteration++
    }
    
    const violations = this.checkConstraints(globalBest.params)
    
    return {
      success: violations.length === 0,
      optimizedParameters: globalBest.params,
      objectiveValue: globalBest.fitness,
      constraintViolations: violations,
      iterations: iteration,
      convergenceHistory: history
    }
  }
  
  private initializeSwarm(initialGuess: BioreactorParameters, size: number): BioreactorParameters[] {
    return new GeneticAlgorithmOptimizer(
      this.objective, this.constraints, this.parameters, this.evaluationFunction
    )['initializePopulation'](initialGuess, size)
  }
  
  private initializeVelocity(): Partial<BioreactorParameters> {
    return {
      temperature: (Math.random() - 0.5) * 2,
      ph: (Math.random() - 0.5) * 0.2,
      flowRate: (Math.random() - 0.5) * 5,
      mixingSpeed: (Math.random() - 0.5) * 10,
      electrodeVoltage: (Math.random() - 0.5) * 5,
      substrateConcentration: (Math.random() - 0.5) * 0.5
    }
  }
  
  private updateVelocity(
    current: BioreactorParameters,
    velocity: Partial<BioreactorParameters>,
    personalBest: BioreactorParameters,
    globalBest: BioreactorParameters,
    w: number, c1: number, c2: number
  ): Partial<BioreactorParameters> {
    const params = ['temperature', 'ph', 'flowRate', 'mixingSpeed', 
                   'electrodeVoltage', 'substrateConcentration'] as const
    const newVelocity: Partial<BioreactorParameters> = {}
    
    for (const param of params) {
      const r1 = Math.random()
      const r2 = Math.random()
      
      newVelocity[param] = 
        w * (velocity[param] || 0) +
        c1 * r1 * (personalBest[param] - current[param]) +
        c2 * r2 * (globalBest[param] - current[param])
    }
    
    return newVelocity
  }
  
  private updatePosition(
    current: BioreactorParameters,
    velocity: Partial<BioreactorParameters>
  ): BioreactorParameters {
    const updated = { ...current }
    
    // Update each parameter and apply constraints
    updated.temperature = Math.max(this.constraints.temperature.min,
      Math.min(this.constraints.temperature.max, current.temperature + (velocity.temperature || 0)))
    
    updated.ph = Math.max(this.constraints.ph.min,
      Math.min(this.constraints.ph.max, current.ph + (velocity.ph || 0)))
    
    updated.flowRate = Math.max(this.constraints.flowRate.min,
      Math.min(this.constraints.flowRate.max, current.flowRate + (velocity.flowRate || 0)))
    
    updated.mixingSpeed = Math.max(this.constraints.mixingSpeed.min,
      Math.min(this.constraints.mixingSpeed.max, current.mixingSpeed + (velocity.mixingSpeed || 0)))
    
    updated.electrodeVoltage = Math.max(this.constraints.electrodeVoltage.min,
      Math.min(this.constraints.electrodeVoltage.max, current.electrodeVoltage + (velocity.electrodeVoltage || 0)))
    
    updated.substrateConcentration = Math.max(this.constraints.substrateConcentration.min,
      Math.min(this.constraints.substrateConcentration.max, 
        current.substrateConcentration + (velocity.substrateConcentration || 0)))
    
    return updated
  }
  
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }
}