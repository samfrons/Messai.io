// Fuel Cell Optimization Engine
import { 
  FuelCellConfiguration, 
  OptimizationObjective, 
  OptimizationResult,
  FuelCellPerformanceMetrics,
  OptimizationStep,
  ConvergenceData,
  FuelCellType,
  fuelCellSpecs
} from './types/fuel-cell-types'
import { predictFuelCellPerformance } from './fuel-cell-predictions'

export interface OptimizationAlgorithmConfig {
  algorithm: 'genetic' | 'particle_swarm' | 'gradient_descent' | 'simulated_annealing'
  parameters: {
    populationSize?: number
    generations?: number
    mutationRate?: number
    crossoverRate?: number
    learningRate?: number
    temperature?: number
    coolingRate?: number
    swarmSize?: number
    inertiaWeight?: number
    socialWeight?: number
    cognitiveWeight?: number
  }
  constraints: OptimizationConstraints
}

export interface OptimizationConstraints {
  cellCount: { min: number; max: number }
  activeArea: { min: number; max: number }
  operatingTemperature: { min: number; max: number }
  operatingPressure: { min: number; max: number }
  humidity: { min: number; max: number }
  fuelFlowRate: { min: number; max: number }
  airFlowRate: { min: number; max: number }
}

export interface Individual {
  genes: FuelCellConfiguration
  fitness: number
  performance: FuelCellPerformanceMetrics
}

// Main optimization function
export const optimizeFuelCellConfiguration = (
  baseConfiguration: FuelCellConfiguration,
  objective: OptimizationObjective,
  algorithmConfig: OptimizationAlgorithmConfig
): OptimizationResult => {
  
  const startTime = Date.now()
  let optimizationSteps: OptimizationStep[] = []
  let bestConfiguration = { ...baseConfiguration }
  let bestPerformance = predictFuelCellPerformance(baseConfiguration)
  let bestFitness = calculateObjectiveValue(bestPerformance, objective)
  
  let result: OptimizationResult
  
  switch (algorithmConfig.algorithm) {
    case 'genetic':
      result = geneticAlgorithmOptimization(baseConfiguration, objective, algorithmConfig)
      break
    case 'particle_swarm':
      result = particleSwarmOptimization(baseConfiguration, objective, algorithmConfig)
      break
    case 'gradient_descent':
      result = gradientDescentOptimization(baseConfiguration, objective, algorithmConfig)
      break
    case 'simulated_annealing':
      result = simulatedAnnealingOptimization(baseConfiguration, objective, algorithmConfig)
      break
    default:
      throw new Error(`Unsupported optimization algorithm: ${algorithmConfig.algorithm}`)
  }
  
  return result
}

// Genetic Algorithm Implementation
const geneticAlgorithmOptimization = (
  baseConfig: FuelCellConfiguration,
  objective: OptimizationObjective,
  config: OptimizationAlgorithmConfig
): OptimizationResult => {
  
  const populationSize = config.parameters.populationSize || 50
  const generations = config.parameters.generations || 100
  const mutationRate = config.parameters.mutationRate || 0.1
  const crossoverRate = config.parameters.crossoverRate || 0.8
  
  let population = initializePopulation(baseConfig, populationSize, config.constraints)
  let optimizationSteps: OptimizationStep[] = []
  let bestIndividual = population[0]
  
  for (let generation = 0; generation < generations; generation++) {
    // Evaluate fitness
    population.forEach(individual => {
      individual.performance = predictFuelCellPerformance(individual.genes)
      individual.fitness = calculateObjectiveValue(individual.performance, objective)
    })
    
    // Find best individual
    const currentBest = population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    )
    
    if (currentBest.fitness > bestIndividual.fitness) {
      bestIndividual = currentBest
    }
    
    // Record optimization step
    optimizationSteps.push({
      iteration: generation,
      parameters: currentBest.genes,
      performance: currentBest.performance,
      objectiveValue: currentBest.fitness,
      improvement: generation === 0 ? 0 : 
        ((currentBest.fitness - optimizationSteps[generation - 1].objectiveValue) / 
         optimizationSteps[generation - 1].objectiveValue) * 100
    })
    
    // Selection, crossover, and mutation
    const newPopulation: Individual[] = []
    
    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelection(population, 3)
      const parent2 = tournamentSelection(population, 3)
      
      let offspring1, offspring2
      if (Math.random() < crossoverRate) {
        [offspring1, offspring2] = crossover(parent1, parent2, config.constraints)
      } else {
        offspring1 = { ...parent1 }
        offspring2 = { ...parent2 }
      }
      
      if (Math.random() < mutationRate) {
        offspring1 = mutate(offspring1, config.constraints)
      }
      if (Math.random() < mutationRate) {
        offspring2 = mutate(offspring2, config.constraints)
      }
      
      newPopulation.push(offspring1, offspring2)
    }
    
    population = newPopulation.slice(0, populationSize)
  }
  
  const originalPerformance = predictFuelCellPerformance(baseConfig)
  
  return {
    originalConfiguration: baseConfig,
    optimizedConfiguration: bestIndividual.genes,
    originalPerformance,
    optimizedPerformance: bestIndividual.performance,
    improvementMetrics: calculateImprovementMetrics(originalPerformance, bestIndividual.performance),
    optimizationSteps,
    convergenceData: {
      iterations: generations,
      finalObjectiveValue: bestIndividual.fitness,
      convergenceThreshold: 0.001,
      executionTime: Date.now() - Date.now(),
      algorithm: 'genetic'
    }
  }
}

// Particle Swarm Optimization
const particleSwarmOptimization = (
  baseConfig: FuelCellConfiguration,
  objective: OptimizationObjective,
  config: OptimizationAlgorithmConfig
): OptimizationResult => {
  
  const swarmSize = config.parameters.swarmSize || 30
  const iterations = config.parameters.generations || 100
  const inertiaWeight = config.parameters.inertiaWeight || 0.9
  const socialWeight = config.parameters.socialWeight || 2.0
  const cognitiveWeight = config.parameters.cognitiveWeight || 2.0
  
  interface Particle {
    position: FuelCellConfiguration
    velocity: Partial<FuelCellConfiguration>
    bestPosition: FuelCellConfiguration
    bestFitness: number
    currentFitness: number
  }
  
  // Initialize swarm
  const swarm: Particle[] = []
  let globalBest: FuelCellConfiguration = { ...baseConfig }
  let globalBestFitness = -Infinity
  let optimizationSteps: OptimizationStep[] = []
  
  for (let i = 0; i < swarmSize; i++) {
    const position = generateRandomConfiguration(baseConfig, config.constraints)
    const performance = predictFuelCellPerformance(position)
    const fitness = calculateObjectiveValue(performance, objective)
    
    const particle: Particle = {
      position,
      velocity: {},
      bestPosition: { ...position },
      bestFitness: fitness,
      currentFitness: fitness
    }
    
    if (fitness > globalBestFitness) {
      globalBest = { ...position }
      globalBestFitness = fitness
    }
    
    swarm.push(particle)
  }
  
  // PSO iterations
  for (let iter = 0; iter < iterations; iter++) {
    swarm.forEach(particle => {
      // Update velocity and position
      updateParticleVelocity(particle, globalBest, inertiaWeight, socialWeight, cognitiveWeight)
      updateParticlePosition(particle, config.constraints)
      
      // Evaluate new position
      const performance = predictFuelCellPerformance(particle.position)
      particle.currentFitness = calculateObjectiveValue(performance, objective)
      
      // Update personal best
      if (particle.currentFitness > particle.bestFitness) {
        particle.bestPosition = { ...particle.position }
        particle.bestFitness = particle.currentFitness
      }
      
      // Update global best
      if (particle.currentFitness > globalBestFitness) {
        globalBest = { ...particle.position }
        globalBestFitness = particle.currentFitness
      }
    })
    
    // Record step
    const bestPerformance = predictFuelCellPerformance(globalBest)
    optimizationSteps.push({
      iteration: iter,
      parameters: globalBest,
      performance: bestPerformance,
      objectiveValue: globalBestFitness,
      improvement: iter === 0 ? 0 : 
        ((globalBestFitness - optimizationSteps[iter - 1].objectiveValue) / 
         optimizationSteps[iter - 1].objectiveValue) * 100
    })
  }
  
  const originalPerformance = predictFuelCellPerformance(baseConfig)
  const optimizedPerformance = predictFuelCellPerformance(globalBest)
  
  return {
    originalConfiguration: baseConfig,
    optimizedConfiguration: globalBest,
    originalPerformance,
    optimizedPerformance,
    improvementMetrics: calculateImprovementMetrics(originalPerformance, optimizedPerformance),
    optimizationSteps,
    convergenceData: {
      iterations,
      finalObjectiveValue: globalBestFitness,
      convergenceThreshold: 0.001,
      executionTime: Date.now() - Date.now(),
      algorithm: 'particle_swarm'
    }
  }
}

// Gradient Descent Optimization (simplified)
const gradientDescentOptimization = (
  baseConfig: FuelCellConfiguration,
  objective: OptimizationObjective,
  config: OptimizationAlgorithmConfig
): OptimizationResult => {
  
  const learningRate = config.parameters.learningRate || 0.01
  const iterations = config.parameters.generations || 100
  
  let currentConfig = { ...baseConfig }
  let optimizationSteps: OptimizationStep[] = []
  
  for (let iter = 0; iter < iterations; iter++) {
    const gradient = calculateNumericalGradient(currentConfig, objective)
    
    // Update configuration
    currentConfig = {
      ...currentConfig,
      cellCount: Math.max(config.constraints.cellCount.min, 
        Math.min(config.constraints.cellCount.max, 
          currentConfig.cellCount + gradient.cellCount * learningRate)),
      activeArea: Math.max(config.constraints.activeArea.min,
        Math.min(config.constraints.activeArea.max,
          currentConfig.activeArea + gradient.activeArea * learningRate)),
      operatingTemperature: Math.max(config.constraints.operatingTemperature.min,
        Math.min(config.constraints.operatingTemperature.max,
          currentConfig.operatingTemperature + gradient.operatingTemperature * learningRate))
    }
    
    const performance = predictFuelCellPerformance(currentConfig)
    const objectiveValue = calculateObjectiveValue(performance, objective)
    
    optimizationSteps.push({
      iteration: iter,
      parameters: currentConfig,
      performance,
      objectiveValue,
      improvement: iter === 0 ? 0 : 
        ((objectiveValue - optimizationSteps[iter - 1].objectiveValue) / 
         optimizationSteps[iter - 1].objectiveValue) * 100
    })
  }
  
  const originalPerformance = predictFuelCellPerformance(baseConfig)
  const optimizedPerformance = predictFuelCellPerformance(currentConfig)
  
  return {
    originalConfiguration: baseConfig,
    optimizedConfiguration: currentConfig,
    originalPerformance,
    optimizedPerformance,
    improvementMetrics: calculateImprovementMetrics(originalPerformance, optimizedPerformance),
    optimizationSteps,
    convergenceData: {
      iterations,
      finalObjectiveValue: optimizationSteps[optimizationSteps.length - 1].objectiveValue,
      convergenceThreshold: 0.001,
      executionTime: Date.now() - Date.now(),
      algorithm: 'gradient_descent'
    }
  }
}

// Simulated Annealing
const simulatedAnnealingOptimization = (
  baseConfig: FuelCellConfiguration,
  objective: OptimizationObjective,
  config: OptimizationAlgorithmConfig
): OptimizationResult => {
  
  const initialTemp = config.parameters.temperature || 1000
  const coolingRate = config.parameters.coolingRate || 0.95
  const iterations = config.parameters.generations || 1000
  
  let currentConfig = { ...baseConfig }
  let currentPerformance = predictFuelCellPerformance(currentConfig)
  let currentFitness = calculateObjectiveValue(currentPerformance, objective)
  
  let bestConfig = { ...currentConfig }
  let bestFitness = currentFitness
  let temperature = initialTemp
  let optimizationSteps: OptimizationStep[] = []
  
  for (let iter = 0; iter < iterations; iter++) {
    // Generate neighbor solution
    const neighbor = generateNeighborConfiguration(currentConfig, config.constraints)
    const neighborPerformance = predictFuelCellPerformance(neighbor)
    const neighborFitness = calculateObjectiveValue(neighborPerformance, objective)
    
    // Accept or reject
    const deltaFitness = neighborFitness - currentFitness
    const acceptanceProbability = deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature)
    
    if (Math.random() < acceptanceProbability) {
      currentConfig = neighbor
      currentPerformance = neighborPerformance
      currentFitness = neighborFitness
      
      if (currentFitness > bestFitness) {
        bestConfig = { ...currentConfig }
        bestFitness = currentFitness
      }
    }
    
    optimizationSteps.push({
      iteration: iter,
      parameters: currentConfig,
      performance: currentPerformance,
      objectiveValue: currentFitness,
      improvement: iter === 0 ? 0 : 
        ((currentFitness - optimizationSteps[iter - 1].objectiveValue) / 
         optimizationSteps[iter - 1].objectiveValue) * 100
    })
    
    // Cool down
    temperature *= coolingRate
  }
  
  const originalPerformance = predictFuelCellPerformance(baseConfig)
  const optimizedPerformance = predictFuelCellPerformance(bestConfig)
  
  return {
    originalConfiguration: baseConfig,
    optimizedConfiguration: bestConfig,
    originalPerformance,
    optimizedPerformance,
    improvementMetrics: calculateImprovementMetrics(originalPerformance, optimizedPerformance),
    optimizationSteps,
    convergenceData: {
      iterations,
      finalObjectiveValue: bestFitness,
      convergenceThreshold: 0.001,
      executionTime: Date.now() - Date.now(),
      algorithm: 'simulated_annealing'
    }
  }
}

// Helper functions
const calculateObjectiveValue = (performance: FuelCellPerformanceMetrics, objective: OptimizationObjective): number => {
  switch (objective.type) {
    case 'maximize_power':
      return performance.powerOutput
    case 'maximize_efficiency':
      return performance.efficiency
    case 'minimize_cost':
      return -performance.operatingCost
    case 'custom':
      const weights = objective.weights || { power: 1, efficiency: 1, cost: 1 }
      return (
        weights.power! * performance.powerOutput +
        weights.efficiency! * performance.efficiency -
        weights.cost! * performance.operatingCost
      )
    default:
      return performance.powerOutput
  }
}

const initializePopulation = (
  baseConfig: FuelCellConfiguration, 
  size: number, 
  constraints: OptimizationConstraints
): Individual[] => {
  const population: Individual[] = []
  
  for (let i = 0; i < size; i++) {
    const genes = generateRandomConfiguration(baseConfig, constraints)
    const performance = predictFuelCellPerformance(genes)
    
    population.push({
      genes,
      fitness: 0, // Will be calculated later
      performance
    })
  }
  
  return population
}

const generateRandomConfiguration = (
  baseConfig: FuelCellConfiguration,
  constraints: OptimizationConstraints
): FuelCellConfiguration => {
  return {
    ...baseConfig,
    cellCount: Math.floor(Math.random() * (constraints.cellCount.max - constraints.cellCount.min) + constraints.cellCount.min),
    activeArea: Math.random() * (constraints.activeArea.max - constraints.activeArea.min) + constraints.activeArea.min,
    operatingTemperature: Math.random() * (constraints.operatingTemperature.max - constraints.operatingTemperature.min) + constraints.operatingTemperature.min,
    operatingPressure: Math.random() * (constraints.operatingPressure.max - constraints.operatingPressure.min) + constraints.operatingPressure.min,
    humidity: Math.random() * (constraints.humidity.max - constraints.humidity.min) + constraints.humidity.min,
    fuelFlowRate: Math.random() * (constraints.fuelFlowRate.max - constraints.fuelFlowRate.min) + constraints.fuelFlowRate.min,
    airFlowRate: Math.random() * (constraints.airFlowRate.max - constraints.airFlowRate.min) + constraints.airFlowRate.min
  }
}

const tournamentSelection = (population: Individual[], tournamentSize: number): Individual => {
  const tournament = []
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length)
    tournament.push(population[randomIndex])
  }
  return tournament.reduce((best, current) => current.fitness > best.fitness ? current : best)
}

const crossover = (parent1: Individual, parent2: Individual, constraints: OptimizationConstraints): [Individual, Individual] => {
  // Single-point crossover
  const offspring1: Individual = { ...parent1 }
  const offspring2: Individual = { ...parent2 }
  
  // Swap some parameters
  if (Math.random() < 0.5) {
    offspring1.genes.cellCount = parent2.genes.cellCount
    offspring2.genes.cellCount = parent1.genes.cellCount
  }
  
  if (Math.random() < 0.5) {
    offspring1.genes.activeArea = parent2.genes.activeArea
    offspring2.genes.activeArea = parent1.genes.activeArea
  }
  
  if (Math.random() < 0.5) {
    offspring1.genes.operatingTemperature = parent2.genes.operatingTemperature
    offspring2.genes.operatingTemperature = parent1.genes.operatingTemperature
  }
  
  return [offspring1, offspring2]
}

const mutate = (individual: Individual, constraints: OptimizationConstraints): Individual => {
  const mutated = { ...individual }
  
  // Random mutation
  if (Math.random() < 0.2) {
    mutated.genes.cellCount = Math.floor(Math.random() * (constraints.cellCount.max - constraints.cellCount.min) + constraints.cellCount.min)
  }
  
  if (Math.random() < 0.2) {
    mutated.genes.activeArea += (Math.random() - 0.5) * 10
    mutated.genes.activeArea = Math.max(constraints.activeArea.min, Math.min(constraints.activeArea.max, mutated.genes.activeArea))
  }
  
  if (Math.random() < 0.2) {
    mutated.genes.operatingTemperature += (Math.random() - 0.5) * 20
    mutated.genes.operatingTemperature = Math.max(constraints.operatingTemperature.min, Math.min(constraints.operatingTemperature.max, mutated.genes.operatingTemperature))
  }
  
  return mutated
}

const updateParticleVelocity = (
  particle: any,
  globalBest: FuelCellConfiguration,
  inertiaWeight: number,
  socialWeight: number,
  cognitiveWeight: number
) => {
  // Update velocity for each parameter
  const r1 = Math.random()
  const r2 = Math.random()
  
  particle.velocity.cellCount = 
    inertiaWeight * (particle.velocity.cellCount || 0) +
    cognitiveWeight * r1 * (particle.bestPosition.cellCount - particle.position.cellCount) +
    socialWeight * r2 * (globalBest.cellCount - particle.position.cellCount)
    
  particle.velocity.activeArea = 
    inertiaWeight * (particle.velocity.activeArea || 0) +
    cognitiveWeight * r1 * (particle.bestPosition.activeArea - particle.position.activeArea) +
    socialWeight * r2 * (globalBest.activeArea - particle.position.activeArea)
    
  particle.velocity.operatingTemperature = 
    inertiaWeight * (particle.velocity.operatingTemperature || 0) +
    cognitiveWeight * r1 * (particle.bestPosition.operatingTemperature - particle.position.operatingTemperature) +
    socialWeight * r2 * (globalBest.operatingTemperature - particle.position.operatingTemperature)
}

const updateParticlePosition = (particle: any, constraints: OptimizationConstraints) => {
  particle.position.cellCount = Math.max(constraints.cellCount.min,
    Math.min(constraints.cellCount.max,
      Math.round(particle.position.cellCount + particle.velocity.cellCount)))
      
  particle.position.activeArea = Math.max(constraints.activeArea.min,
    Math.min(constraints.activeArea.max,
      particle.position.activeArea + particle.velocity.activeArea))
      
  particle.position.operatingTemperature = Math.max(constraints.operatingTemperature.min,
    Math.min(constraints.operatingTemperature.max,
      particle.position.operatingTemperature + particle.velocity.operatingTemperature))
}

const calculateNumericalGradient = (config: FuelCellConfiguration, objective: OptimizationObjective) => {
  const epsilon = 0.01
  const basePerformance = predictFuelCellPerformance(config)
  const baseFitness = calculateObjectiveValue(basePerformance, objective)
  
  const gradient: any = {}
  
  // Calculate gradient for each parameter
  const tempConfig = { ...config }
  
  tempConfig.cellCount += epsilon
  const cellCountPerformance = predictFuelCellPerformance(tempConfig)
  gradient.cellCount = (calculateObjectiveValue(cellCountPerformance, objective) - baseFitness) / epsilon
  tempConfig.cellCount = config.cellCount
  
  tempConfig.activeArea += epsilon
  const activeAreaPerformance = predictFuelCellPerformance(tempConfig)
  gradient.activeArea = (calculateObjectiveValue(activeAreaPerformance, objective) - baseFitness) / epsilon
  tempConfig.activeArea = config.activeArea
  
  tempConfig.operatingTemperature += epsilon
  const tempPerformance = predictFuelCellPerformance(tempConfig)
  gradient.operatingTemperature = (calculateObjectiveValue(tempPerformance, objective) - baseFitness) / epsilon
  
  return gradient
}

const generateNeighborConfiguration = (
  config: FuelCellConfiguration,
  constraints: OptimizationConstraints
): FuelCellConfiguration => {
  const neighbor = { ...config }
  
  // Randomly modify one parameter
  const paramToModify = Math.floor(Math.random() * 3)
  
  switch (paramToModify) {
    case 0:
      neighbor.cellCount = Math.max(constraints.cellCount.min,
        Math.min(constraints.cellCount.max,
          neighbor.cellCount + Math.floor((Math.random() - 0.5) * 4)))
      break
    case 1:
      neighbor.activeArea = Math.max(constraints.activeArea.min,
        Math.min(constraints.activeArea.max,
          neighbor.activeArea + (Math.random() - 0.5) * 20))
      break
    case 2:
      neighbor.operatingTemperature = Math.max(constraints.operatingTemperature.min,
        Math.min(constraints.operatingTemperature.max,
          neighbor.operatingTemperature + (Math.random() - 0.5) * 40))
      break
  }
  
  return neighbor
}

const calculateImprovementMetrics = (
  original: FuelCellPerformanceMetrics,
  optimized: FuelCellPerformanceMetrics
) => {
  return {
    powerImprovement: ((optimized.powerOutput - original.powerOutput) / original.powerOutput) * 100,
    efficiencyImprovement: ((optimized.efficiency - original.efficiency) / original.efficiency) * 100,
    costChange: ((optimized.operatingCost - original.operatingCost) / original.operatingCost) * 100
  }
}

// Export default constraints for common fuel cell types
export const getDefaultConstraints = (type: FuelCellType): OptimizationConstraints => {
  const specs = fuelCellSpecs[type]
  
  return {
    cellCount: { min: 1, max: 50 },
    activeArea: { min: 10, max: 1000 },
    operatingTemperature: { 
      min: specs.operatingRanges.temperature.min, 
      max: specs.operatingRanges.temperature.max 
    },
    operatingPressure: { 
      min: specs.operatingRanges.pressure.min, 
      max: specs.operatingRanges.pressure.max 
    },
    humidity: { 
      min: specs.operatingRanges.humidity.min, 
      max: specs.operatingRanges.humidity.max 
    },
    fuelFlowRate: { min: 0.1, max: 20 },
    airFlowRate: { min: 0.2, max: 40 }
  }
}

// Main optimization engine class
export class FuelCellOptimizationEngine {
  private defaultAlgorithmConfig: OptimizationAlgorithmConfig
  
  constructor() {
    this.defaultAlgorithmConfig = {
      algorithm: 'genetic',
      parameters: {
        populationSize: 50,
        generations: 100,
        mutationRate: 0.1,
        crossoverRate: 0.8
      },
      constraints: {
        cellCount: { min: 1, max: 50 },
        activeArea: { min: 10, max: 1000 },
        operatingTemperature: { min: 60, max: 100 },
        operatingPressure: { min: 1, max: 5 },
        humidity: { min: 50, max: 100 },
        fuelFlowRate: { min: 0.1, max: 20 },
        airFlowRate: { min: 0.2, max: 40 }
      }
    }
  }
  
  optimize(
    baseConfiguration: FuelCellConfiguration,
    objective: OptimizationObjective,
    algorithmConfig?: Partial<OptimizationAlgorithmConfig>
  ): OptimizationResult {
    const config = algorithmConfig ? 
      { ...this.defaultAlgorithmConfig, ...algorithmConfig } : 
      this.defaultAlgorithmConfig
    
    return optimizeFuelCellConfiguration(baseConfiguration, objective, config)
  }
  
  optimizeWithConstraints(
    baseConfiguration: FuelCellConfiguration,
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    algorithm: 'genetic' | 'particle_swarm' | 'gradient_descent' | 'simulated_annealing' = 'genetic'
  ): OptimizationResult {
    const config: OptimizationAlgorithmConfig = {
      ...this.defaultAlgorithmConfig,
      algorithm,
      constraints
    }
    
    return optimizeFuelCellConfiguration(baseConfiguration, objective, config)
  }
  
  getDefaultConstraints(type: FuelCellType): OptimizationConstraints {
    return getDefaultConstraints(type)
  }
  
  setDefaultAlgorithm(algorithm: 'genetic' | 'particle_swarm' | 'gradient_descent' | 'simulated_annealing'): void {
    this.defaultAlgorithmConfig.algorithm = algorithm
  }
  
  setDefaultParameters(parameters: Partial<OptimizationAlgorithmConfig['parameters']>): void {
    this.defaultAlgorithmConfig.parameters = { ...this.defaultAlgorithmConfig.parameters, ...parameters }
  }
}