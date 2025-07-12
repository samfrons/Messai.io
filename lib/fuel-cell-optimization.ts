import { FuelCellType, ModelFidelity } from './types/fuel-cell-types'
import { FuelCellPredictionInput, FuelCellModelingEngine } from './fuel-cell-predictions'

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
  // System constraints
  cellCount: { min: number; max: number }
  activeArea: { min: number; max: number }
  
  // Operating constraints
  temperature: { min: number; max: number }
  pressure: { min: number; max: number }
  humidity?: { min: number; max: number }
  
  // Flow constraints
  fuelFlowRate: { min: number; max: number }
  airFlowRate: { min: number; max: number }
  
  // Material constraints
  availableMaterials?: {
    anodeCatalysts?: string[]
    cathodeCatalysts?: string[]
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
  optimizedParameters: FuelCellPredictionInput
  objectiveValue: number
  constraintViolations: string[]
  iterations: number
  convergenceHistory: {
    iteration: number
    objectiveValue: number
    parameters: Partial<FuelCellPredictionInput>
  }[]
  paretoFront?: { // For multi-objective
    power: number
    efficiency: number
    cost: number
    parameters: FuelCellPredictionInput
  }[]
  sensitivity?: {
    parameter: string
    sensitivity: number
    optimalRange: { min: number; max: number }
  }[]
}

// ============================================================================
// OPTIMIZATION ALGORITHMS
// ============================================================================

abstract class OptimizationAlgorithm {
  protected objective: OptimizationObjective
  protected constraints: OptimizationConstraints
  protected parameters: OptimizationParameters
  protected fuelCellType: FuelCellType
  
  constructor(
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    parameters: OptimizationParameters,
    fuelCellType: FuelCellType
  ) {
    this.objective = objective
    this.constraints = constraints
    this.parameters = parameters
    this.fuelCellType = fuelCellType
  }
  
  abstract optimize(initialGuess: FuelCellPredictionInput): Promise<OptimizationResult>
  
  protected async evaluateObjective(params: FuelCellPredictionInput): Promise<number> {
    const prediction = await FuelCellModelingEngine.getPrediction(params)
    
    switch (this.objective.type) {
      case 'MAXIMIZE_POWER':
        return -prediction.predictedPower // Negative for minimization
        
      case 'MAXIMIZE_EFFICIENCY':
        return -prediction.efficiency
        
      case 'MINIMIZE_COST':
        return this.calculateSystemCost(params)
        
      case 'MAXIMIZE_DURABILITY':
        return -this.estimateDurability(params)
        
      case 'MULTI_OBJECTIVE':
        const weights = this.objective.weights || {}
        return -(
          (weights.power || 0) * prediction.predictedPower +
          (weights.efficiency || 0) * prediction.efficiency -
          (weights.cost || 0) * this.calculateSystemCost(params) +
          (weights.durability || 0) * this.estimateDurability(params)
        )
        
      default:
        return 0
    }
  }
  
  protected checkConstraints(params: FuelCellPredictionInput): string[] {
    const violations: string[] = []
    
    // Check system constraints
    if (params.cellCount < this.constraints.cellCount.min || 
        params.cellCount > this.constraints.cellCount.max) {
      violations.push(`Cell count ${params.cellCount} outside range [${this.constraints.cellCount.min}, ${this.constraints.cellCount.max}]`)
    }
    
    if (params.activeArea < this.constraints.activeArea.min || 
        params.activeArea > this.constraints.activeArea.max) {
      violations.push(`Active area ${params.activeArea} outside range [${this.constraints.activeArea.min}, ${this.constraints.activeArea.max}]`)
    }
    
    // Check operating constraints
    if (params.operatingTemperature < this.constraints.temperature.min || 
        params.operatingTemperature > this.constraints.temperature.max) {
      violations.push(`Temperature ${params.operatingTemperature} outside range [${this.constraints.temperature.min}, ${this.constraints.temperature.max}]`)
    }
    
    // Check material constraints
    if (this.constraints.availableMaterials) {
      if (params.anodeCatalyst && !this.constraints.availableMaterials.anodeCatalysts?.includes(params.anodeCatalyst)) {
        violations.push(`Anode catalyst ${params.anodeCatalyst} not available`)
      }
    }
    
    // Check target constraints
    if (this.objective.targets) {
      const prediction = FuelCellModelingEngine.getPrediction(params)
      prediction.then(pred => {
        if (this.objective.targets!.minPower && pred.predictedPower < this.objective.targets!.minPower) {
          violations.push(`Power ${pred.predictedPower}W below minimum ${this.objective.targets!.minPower}W`)
        }
        if (this.objective.targets!.minEfficiency && pred.efficiency < this.objective.targets!.minEfficiency) {
          violations.push(`Efficiency ${pred.efficiency}% below minimum ${this.objective.targets!.minEfficiency}%`)
        }
      })
    }
    
    return violations
  }
  
  protected calculateSystemCost(params: FuelCellPredictionInput): number {
    // Simplified cost model
    const baseCost = 1000 // Base system cost
    const cellCost = 50 * params.cellCount
    const areaCost = 10 * params.activeArea
    
    // Material costs
    const catalystCosts: Record<string, number> = {
      'pt-c': 100,
      'pt-alloy': 80,
      'non-pgm': 20,
      'ni-based': 10
    }
    
    const membraneCosts: Record<string, number> = {
      'nafion': 50,
      'pfsa': 40,
      'hydrocarbon': 30,
      'ceramic': 60
    }
    
    const anodeCost = (params.anodeCatalyst ? catalystCosts[params.anodeCatalyst] || 50 : 50) * params.activeArea
    const cathodeCost = (params.cathodeCatalyst ? catalystCosts[params.cathodeCatalyst] || 50 : 50) * params.activeArea
    const membraneCost = (params.membraneType ? membraneCosts[params.membraneType] || 40 : 40) * params.activeArea
    
    return baseCost + cellCost + areaCost + anodeCost + cathodeCost + membraneCost
  }
  
  protected estimateDurability(params: FuelCellPredictionInput): number {
    // Simplified durability model (hours)
    let baseDurability = 40000 // Base durability in hours
    
    // Temperature effects
    const optimalTemp = this.getOptimalTemperature(this.fuelCellType)
    const tempDeviation = Math.abs(params.operatingTemperature - optimalTemp)
    baseDurability *= Math.exp(-tempDeviation / 100)
    
    // Pressure effects
    if (params.operatingPressure > 5) {
      baseDurability *= 0.9 // High pressure reduces durability
    }
    
    // Material effects
    if (params.membraneType === 'hydrocarbon') {
      baseDurability *= 0.8 // Hydrocarbon membranes have lower durability
    }
    
    return baseDurability
  }
  
  private getOptimalTemperature(fuelCellType: FuelCellType): number {
    const temps: Record<FuelCellType, number> = {
      PEM: 80,
      SOFC: 750,
      PAFC: 200,
      MCFC: 650,
      AFC: 70
    }
    return temps[fuelCellType]
  }
}

// ============================================================================
// GRADIENT DESCENT OPTIMIZER
// ============================================================================

class GradientDescentOptimizer extends OptimizationAlgorithm {
  async optimize(initialGuess: FuelCellPredictionInput): Promise<OptimizationResult> {
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
      const gradients: Partial<FuelCellPredictionInput> = {}
      
      // Gradient for continuous parameters
      const continuousParams = ['cellCount', 'activeArea', 'operatingTemperature', 
                               'operatingPressure', 'humidity', 'fuelFlowRate', 'airFlowRate'] as const
      
      for (const param of continuousParams) {
        if (param in current) {
          const perturbedPos = { ...current, [param]: (current[param] as number) + epsilon }
          const perturbedNeg = { ...current, [param]: (current[param] as number) - epsilon }
          
          const objPos = await this.evaluateObjective(perturbedPos)
          const objNeg = await this.evaluateObjective(perturbedNeg)
          
          gradients[param] = (objPos - objNeg) / (2 * epsilon)
        }
      }
      
      // Update parameters
      let converged = true
      for (const [param, gradient] of Object.entries(gradients)) {
        const oldValue = current[param as keyof FuelCellPredictionInput] as number
        const newValue = oldValue - learningRate * gradient
        
        // Apply constraints
        if (param === 'cellCount') {
          current.cellCount = Math.round(Math.max(this.constraints.cellCount.min, 
                                        Math.min(this.constraints.cellCount.max, newValue)))
        } else if (param === 'activeArea') {
          current.activeArea = Math.max(this.constraints.activeArea.min, 
                                       Math.min(this.constraints.activeArea.max, newValue))
        } else if (param === 'operatingTemperature') {
          current.operatingTemperature = Math.max(this.constraints.temperature.min, 
                                                 Math.min(this.constraints.temperature.max, newValue))
        }
        // ... similar for other parameters
        
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

class GeneticAlgorithmOptimizer extends OptimizationAlgorithm {
  async optimize(initialGuess: FuelCellPredictionInput): Promise<OptimizationResult> {
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
      const newPopulation: FuelCellPredictionInput[] = []
      
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
    initialGuess: FuelCellPredictionInput, 
    size: number
  ): FuelCellPredictionInput[] {
    const population: FuelCellPredictionInput[] = [{ ...initialGuess }]
    
    while (population.length < size) {
      const individual: FuelCellPredictionInput = {
        fuelCellType: this.fuelCellType,
        cellCount: Math.round(
          this.constraints.cellCount.min + 
          Math.random() * (this.constraints.cellCount.max - this.constraints.cellCount.min)
        ),
        activeArea: 
          this.constraints.activeArea.min + 
          Math.random() * (this.constraints.activeArea.max - this.constraints.activeArea.min),
        operatingTemperature:
          this.constraints.temperature.min + 
          Math.random() * (this.constraints.temperature.max - this.constraints.temperature.min),
        operatingPressure:
          this.constraints.pressure.min + 
          Math.random() * (this.constraints.pressure.max - this.constraints.pressure.min),
        humidity: this.constraints.humidity ? 
          this.constraints.humidity.min + 
          Math.random() * (this.constraints.humidity.max - this.constraints.humidity.min) : 100,
        fuelFlowRate:
          this.constraints.fuelFlowRate.min + 
          Math.random() * (this.constraints.fuelFlowRate.max - this.constraints.fuelFlowRate.min),
        airFlowRate:
          this.constraints.airFlowRate.min + 
          Math.random() * (this.constraints.airFlowRate.max - this.constraints.airFlowRate.min),
        modelFidelity: initialGuess.modelFidelity
      }
      
      // Random material selection
      if (this.constraints.availableMaterials) {
        const materials = this.constraints.availableMaterials
        if (materials.anodeCatalysts && materials.anodeCatalysts.length > 0) {
          individual.anodeCatalyst = materials.anodeCatalysts[
            Math.floor(Math.random() * materials.anodeCatalysts.length)
          ]
        }
        if (materials.cathodeCatalysts && materials.cathodeCatalysts.length > 0) {
          individual.cathodeCatalyst = materials.cathodeCatalysts[
            Math.floor(Math.random() * materials.cathodeCatalysts.length)
          ]
        }
        if (materials.membraneTypes && materials.membraneTypes.length > 0) {
          individual.membraneType = materials.membraneTypes[
            Math.floor(Math.random() * materials.membraneTypes.length)
          ]
        }
      }
      
      population.push(individual)
    }
    
    return population
  }
  
  private tournamentSelection(
    fitness: { individual: FuelCellPredictionInput; fitness: number }[]
  ): { individual: FuelCellPredictionInput; fitness: number } {
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
    parent1: FuelCellPredictionInput, 
    parent2: FuelCellPredictionInput
  ): [FuelCellPredictionInput, FuelCellPredictionInput] {
    const child1 = { ...parent1 }
    const child2 = { ...parent2 }
    
    // Uniform crossover for continuous variables
    const continuousParams = ['cellCount', 'activeArea', 'operatingTemperature', 
                             'operatingPressure', 'humidity', 'fuelFlowRate', 'airFlowRate'] as const
    
    for (const param of continuousParams) {
      if (Math.random() < 0.5) {
        const temp = child1[param]
        child1[param] = child2[param] as any
        child2[param] = temp as any
      }
    }
    
    // Crossover for discrete variables
    if (Math.random() < 0.5) {
      const temp = child1.anodeCatalyst
      child1.anodeCatalyst = child2.anodeCatalyst
      child2.anodeCatalyst = temp
    }
    
    return [child1, child2]
  }
  
  private mutate(individual: FuelCellPredictionInput, rate: number): FuelCellPredictionInput {
    const mutated = { ...individual }
    
    // Mutate continuous parameters
    if (Math.random() < rate) {
      mutated.cellCount = Math.round(
        mutated.cellCount + (Math.random() - 0.5) * 10
      )
      mutated.cellCount = Math.max(this.constraints.cellCount.min, 
                                   Math.min(this.constraints.cellCount.max, mutated.cellCount))
    }
    
    if (Math.random() < rate) {
      mutated.activeArea += (Math.random() - 0.5) * 20
      mutated.activeArea = Math.max(this.constraints.activeArea.min, 
                                    Math.min(this.constraints.activeArea.max, mutated.activeArea))
    }
    
    if (Math.random() < rate) {
      mutated.operatingTemperature += (Math.random() - 0.5) * 10
      mutated.operatingTemperature = Math.max(this.constraints.temperature.min, 
                                              Math.min(this.constraints.temperature.max, mutated.operatingTemperature))
    }
    
    // Mutate discrete parameters
    if (Math.random() < rate && this.constraints.availableMaterials?.anodeCatalysts) {
      const catalysts = this.constraints.availableMaterials.anodeCatalysts
      mutated.anodeCatalyst = catalysts[Math.floor(Math.random() * catalysts.length)]
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

class BayesianOptimizer extends OptimizationAlgorithm {
  private observations: { params: FuelCellPredictionInput; value: number }[] = []
  
  async optimize(initialGuess: FuelCellPredictionInput): Promise<OptimizationResult> {
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
    initialGuess: FuelCellPredictionInput, 
    count: number
  ): FuelCellPredictionInput[] {
    // Latin Hypercube Sampling for better coverage
    const samples: FuelCellPredictionInput[] = []
    
    for (let i = 0; i < count; i++) {
      const sample: FuelCellPredictionInput = {
        ...initialGuess,
        cellCount: Math.round(
          this.constraints.cellCount.min + 
          (i + Math.random()) / count * (this.constraints.cellCount.max - this.constraints.cellCount.min)
        ),
        activeArea:
          this.constraints.activeArea.min + 
          (i + Math.random()) / count * (this.constraints.activeArea.max - this.constraints.activeArea.min),
        operatingTemperature:
          this.constraints.temperature.min + 
          (i + Math.random()) / count * (this.constraints.temperature.max - this.constraints.temperature.min),
        operatingPressure:
          this.constraints.pressure.min + 
          (i + Math.random()) / count * (this.constraints.pressure.max - this.constraints.pressure.min)
      }
      samples.push(sample)
    }
    
    return samples
  }
  
  private async selectNextPoint(): Promise<FuelCellPredictionInput> {
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
    point: FuelCellPredictionInput, 
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
  
  private calculateDistance(p1: FuelCellPredictionInput, p2: FuelCellPredictionInput): number {
    return Math.sqrt(
      Math.pow((p1.cellCount - p2.cellCount) / 100, 2) +
      Math.pow((p1.activeArea - p2.activeArea) / 1000, 2) +
      Math.pow((p1.operatingTemperature - p2.operatingTemperature) / 100, 2) +
      Math.pow((p1.operatingPressure - p2.operatingPressure) / 10, 2)
    )
  }
  
  private generateRandomPoint(): FuelCellPredictionInput {
    return {
      fuelCellType: this.fuelCellType,
      cellCount: Math.round(
        this.constraints.cellCount.min + 
        Math.random() * (this.constraints.cellCount.max - this.constraints.cellCount.min)
      ),
      activeArea:
        this.constraints.activeArea.min + 
        Math.random() * (this.constraints.activeArea.max - this.constraints.activeArea.min),
      operatingTemperature:
        this.constraints.temperature.min + 
        Math.random() * (this.constraints.temperature.max - this.constraints.temperature.min),
      operatingPressure:
        this.constraints.pressure.min + 
        Math.random() * (this.constraints.pressure.max - this.constraints.pressure.min),
      humidity: 100,
      fuelFlowRate: 5,
      airFlowRate: 25,
      modelFidelity: 'INTERMEDIATE' as ModelFidelity
    }
  }
}

// ============================================================================
// OPTIMIZATION ENGINE
// ============================================================================

export class FuelCellOptimizationEngine {
  static async optimize(
    fuelCellType: FuelCellType,
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    parameters: OptimizationParameters,
    initialGuess?: Partial<FuelCellPredictionInput>
  ): Promise<OptimizationResult> {
    // Create initial guess if not provided
    const defaultGuess: FuelCellPredictionInput = {
      fuelCellType,
      cellCount: Math.round((constraints.cellCount.min + constraints.cellCount.max) / 2),
      activeArea: (constraints.activeArea.min + constraints.activeArea.max) / 2,
      operatingTemperature: (constraints.temperature.min + constraints.temperature.max) / 2,
      operatingPressure: (constraints.pressure.min + constraints.pressure.max) / 2,
      humidity: constraints.humidity ? (constraints.humidity.min + constraints.humidity.max) / 2 : 100,
      fuelFlowRate: (constraints.fuelFlowRate.min + constraints.fuelFlowRate.max) / 2,
      airFlowRate: (constraints.airFlowRate.min + constraints.airFlowRate.max) / 2,
      modelFidelity: 'INTERMEDIATE',
      ...initialGuess
    }
    
    // Select optimizer based on algorithm
    let optimizer: OptimizationAlgorithm
    
    switch (parameters.algorithm) {
      case 'GRADIENT_DESCENT':
        optimizer = new GradientDescentOptimizer(objective, constraints, parameters, fuelCellType)
        break
        
      case 'GENETIC_ALGORITHM':
        optimizer = new GeneticAlgorithmOptimizer(objective, constraints, parameters, fuelCellType)
        break
        
      case 'BAYESIAN':
        optimizer = new BayesianOptimizer(objective, constraints, parameters, fuelCellType)
        break
        
      case 'PARTICLE_SWARM':
      case 'SIMULATED_ANNEALING':
      default:
        // Default to genetic algorithm
        optimizer = new GeneticAlgorithmOptimizer(objective, constraints, parameters, fuelCellType)
    }
    
    // Run optimization
    const result = await optimizer.optimize(defaultGuess)
    
    // Add sensitivity analysis for successful optimizations
    if (result.success && parameters.algorithm !== 'GENETIC_ALGORITHM') {
      result.sensitivity = await this.performSensitivityAnalysis(
        result.optimizedParameters,
        objective,
        constraints
      )
    }
    
    return result
  }
  
  static async performSensitivityAnalysis(
    optimalParams: FuelCellPredictionInput,
    objective: OptimizationObjective,
    constraints: OptimizationConstraints
  ): Promise<OptimizationResult['sensitivity']> {
    const sensitivity: OptimizationResult['sensitivity'] = []
    const epsilon = 1e-4
    
    const baseObjective = await this.evaluateObjectiveValue(optimalParams, objective)
    
    // Analyze continuous parameters
    const continuousParams = [
      { name: 'cellCount', min: constraints.cellCount.min, max: constraints.cellCount.max },
      { name: 'activeArea', min: constraints.activeArea.min, max: constraints.activeArea.max },
      { name: 'operatingTemperature', min: constraints.temperature.min, max: constraints.temperature.max },
      { name: 'operatingPressure', min: constraints.pressure.min, max: constraints.pressure.max }
    ]
    
    for (const param of continuousParams) {
      const currentValue = optimalParams[param.name as keyof FuelCellPredictionInput] as number
      
      // Calculate sensitivity
      const perturbedPos = { ...optimalParams, [param.name]: currentValue * (1 + epsilon) }
      const perturbedNeg = { ...optimalParams, [param.name]: currentValue * (1 - epsilon) }
      
      const objPos = await this.evaluateObjectiveValue(perturbedPos, objective)
      const objNeg = await this.evaluateObjectiveValue(perturbedNeg, objective)
      
      const sensitivityValue = (objPos - objNeg) / (2 * epsilon * currentValue)
      
      // Find optimal range by sampling
      const samples = 20
      const values: number[] = []
      const objectives: number[] = []
      
      for (let i = 0; i < samples; i++) {
        const value = param.min + (i / (samples - 1)) * (param.max - param.min)
        const testParams = { ...optimalParams, [param.name]: value }
        const obj = await this.evaluateObjectiveValue(testParams, objective)
        values.push(value)
        objectives.push(obj)
      }
      
      // Find range where objective is within 95% of optimal
      const threshold = baseObjective * 0.95
      const validIndices = objectives.map((obj, i) => obj >= threshold ? i : -1).filter(i => i >= 0)
      
      sensitivity.push({
        parameter: param.name,
        sensitivity: Math.abs(sensitivityValue),
        optimalRange: {
          min: validIndices.length > 0 ? values[Math.min(...validIndices)] : currentValue * 0.9,
          max: validIndices.length > 0 ? values[Math.max(...validIndices)] : currentValue * 1.1
        }
      })
    }
    
    return sensitivity
  }
  
  private static async evaluateObjectiveValue(
    params: FuelCellPredictionInput,
    objective: OptimizationObjective
  ): Promise<number> {
    const prediction = await FuelCellModelingEngine.getPrediction(params)
    
    switch (objective.type) {
      case 'MAXIMIZE_POWER':
        return prediction.predictedPower
      case 'MAXIMIZE_EFFICIENCY':
        return prediction.efficiency
      case 'MINIMIZE_COST':
        return -this.calculateCost(params)
      case 'MULTI_OBJECTIVE':
        const weights = objective.weights || {}
        return (weights.power || 0) * prediction.predictedPower +
               (weights.efficiency || 0) * prediction.efficiency
      default:
        return 0
    }
  }
  
  private static calculateCost(params: FuelCellPredictionInput): number {
    // Simplified cost calculation
    return 1000 + 50 * params.cellCount + 10 * params.activeArea
  }
}