export * from './algorithms'

import { 
  BioreactorParameters,
  OptimizationObjective,
  OptimizationConstraints,
  OptimizationParameters,
  OptimizationResult,
  OptimizationAlgorithm,
  GradientDescentOptimizer,
  GeneticAlgorithmOptimizer,
  BayesianOptimizer,
  ParticleSwarmOptimizer
} from './algorithms'

// ============================================================================
// OPTIMIZATION ENGINE
// ============================================================================

export class BioreactorOptimizationEngine {
  static async optimize(
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    parameters: OptimizationParameters,
    evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>,
    initialGuess?: Partial<BioreactorParameters>
  ): Promise<OptimizationResult> {
    // Create initial guess if not provided
    const defaultGuess: BioreactorParameters = {
      temperature: (constraints.temperature.min + constraints.temperature.max) / 2,
      ph: (constraints.ph.min + constraints.ph.max) / 2,
      flowRate: (constraints.flowRate.min + constraints.flowRate.max) / 2,
      mixingSpeed: (constraints.mixingSpeed.min + constraints.mixingSpeed.max) / 2,
      electrodeVoltage: (constraints.electrodeVoltage.min + constraints.electrodeVoltage.max) / 2,
      substrateConcentration: (constraints.substrateConcentration.min + constraints.substrateConcentration.max) / 2,
      ...initialGuess
    }
    
    // Add optional parameters if constraints exist
    if (constraints.pressure) {
      defaultGuess.pressure = (constraints.pressure.min + constraints.pressure.max) / 2
    }
    if (constraints.oxygenLevel) {
      defaultGuess.oxygenLevel = (constraints.oxygenLevel.min + constraints.oxygenLevel.max) / 2
    }
    if (constraints.salinity) {
      defaultGuess.salinity = (constraints.salinity.min + constraints.salinity.max) / 2
    }
    
    // Select optimizer based on algorithm
    let optimizer: OptimizationAlgorithm
    
    switch (parameters.algorithm) {
      case 'GRADIENT_DESCENT':
        optimizer = new GradientDescentOptimizer(objective, constraints, parameters, evaluationFunction)
        break
        
      case 'GENETIC_ALGORITHM':
        optimizer = new GeneticAlgorithmOptimizer(objective, constraints, parameters, evaluationFunction)
        break
        
      case 'BAYESIAN':
        optimizer = new BayesianOptimizer(objective, constraints, parameters, evaluationFunction)
        break
        
      case 'PARTICLE_SWARM':
        optimizer = new ParticleSwarmOptimizer(objective, constraints, parameters, evaluationFunction)
        break
        
      case 'SIMULATED_ANNEALING':
      default:
        // Default to genetic algorithm
        optimizer = new GeneticAlgorithmOptimizer(objective, constraints, parameters, evaluationFunction)
    }
    
    // Run optimization
    const result = await optimizer.optimize(defaultGuess)
    
    // Add sensitivity analysis for successful optimizations
    if (result.success && parameters.algorithm !== 'GENETIC_ALGORITHM') {
      result.sensitivity = await this.performSensitivityAnalysis(
        result.optimizedParameters,
        objective,
        constraints,
        evaluationFunction
      )
    }
    
    return result
  }
  
  static async performSensitivityAnalysis(
    optimalParams: BioreactorParameters,
    objective: OptimizationObjective,
    constraints: OptimizationConstraints,
    evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>
  ): Promise<OptimizationResult['sensitivity']> {
    const sensitivity: OptimizationResult['sensitivity'] = []
    const epsilon = 1e-4
    
    const baseObjective = await this.evaluateObjectiveValue(optimalParams, objective, evaluationFunction)
    
    // Analyze continuous parameters
    const continuousParams = [
      { name: 'temperature', min: constraints.temperature.min, max: constraints.temperature.max },
      { name: 'ph', min: constraints.ph.min, max: constraints.ph.max },
      { name: 'flowRate', min: constraints.flowRate.min, max: constraints.flowRate.max },
      { name: 'mixingSpeed', min: constraints.mixingSpeed.min, max: constraints.mixingSpeed.max },
      { name: 'electrodeVoltage', min: constraints.electrodeVoltage.min, max: constraints.electrodeVoltage.max },
      { name: 'substrateConcentration', min: constraints.substrateConcentration.min, max: constraints.substrateConcentration.max }
    ]
    
    for (const param of continuousParams) {
      const currentValue = optimalParams[param.name as keyof BioreactorParameters] as number
      
      // Calculate sensitivity
      const perturbedPos = { ...optimalParams, [param.name]: currentValue * (1 + epsilon) }
      const perturbedNeg = { ...optimalParams, [param.name]: currentValue * (1 - epsilon) }
      
      const objPos = await this.evaluateObjectiveValue(perturbedPos, objective, evaluationFunction)
      const objNeg = await this.evaluateObjectiveValue(perturbedNeg, objective, evaluationFunction)
      
      const sensitivityValue = (objPos - objNeg) / (2 * epsilon * currentValue)
      
      // Find optimal range by sampling
      const samples = 20
      const values: number[] = []
      const objectives: number[] = []
      
      for (let i = 0; i < samples; i++) {
        const value = param.min + (i / (samples - 1)) * (param.max - param.min)
        const testParams = { ...optimalParams, [param.name]: value }
        const obj = await this.evaluateObjectiveValue(testParams, objective, evaluationFunction)
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
    params: BioreactorParameters,
    objective: OptimizationObjective,
    evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>
  ): Promise<number> {
    const evaluation = await evaluationFunction(params)
    
    switch (objective.type) {
      case 'MAXIMIZE_POWER':
        return evaluation.power
      case 'MAXIMIZE_EFFICIENCY':
        return evaluation.efficiency
      case 'MINIMIZE_COST':
        return -(evaluation.cost || this.estimateCost(params))
      case 'MULTI_OBJECTIVE':
        const weights = objective.weights || {}
        return (weights.power || 0) * evaluation.power +
               (weights.efficiency || 0) * evaluation.efficiency -
               (weights.cost || 0) * (evaluation.cost || this.estimateCost(params))
      default:
        return 0
    }
  }
  
  private static estimateCost(params: BioreactorParameters): number {
    // Simplified cost calculation
    return 500 + 
           Math.abs(params.temperature - 30) * 2 +
           params.mixingSpeed * 0.1 +
           params.electrodeVoltage * 0.05 +
           params.substrateConcentration * params.flowRate * 0.01
  }
}

// ============================================================================
// MULTI-OBJECTIVE OPTIMIZATION
// ============================================================================

export class MultiObjectiveOptimizer {
  static async optimizePareto(
    objectives: OptimizationObjective[],
    constraints: OptimizationConstraints,
    parameters: OptimizationParameters & { paretoSize?: number },
    evaluationFunction: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost?: number }>,
    initialGuess?: Partial<BioreactorParameters>
  ): Promise<OptimizationResult & { paretoFront: NonNullable<OptimizationResult['paretoFront']> }> {
    const paretoSize = parameters.paretoSize || 20
    const paretoFront: NonNullable<OptimizationResult['paretoFront']> = []
    
    // Generate diverse weight combinations
    const weightCombinations: Array<{ power: number; efficiency: number; cost: number }> = []
    for (let i = 0; i < paretoSize; i++) {
      const power = Math.random()
      const efficiency = Math.random() * (1 - power)
      const cost = 1 - power - efficiency
      weightCombinations.push({ power, efficiency, cost })
    }
    
    // Optimize for each weight combination
    for (const weights of weightCombinations) {
      const multiObjective: OptimizationObjective = {
        type: 'MULTI_OBJECTIVE',
        weights
      }
      
      const result = await BioreactorOptimizationEngine.optimize(
        multiObjective,
        constraints,
        parameters,
        evaluationFunction,
        initialGuess
      )
      
      if (result.success) {
        const evaluation = await evaluationFunction(result.optimizedParameters)
        paretoFront.push({
          power: evaluation.power,
          efficiency: evaluation.efficiency,
          cost: evaluation.cost || 0,
          parameters: result.optimizedParameters
        })
      }
    }
    
    // Remove dominated solutions
    const nonDominated = this.filterNonDominated(paretoFront)
    
    // Return the result with the best overall score
    const bestIndex = this.findBestCompromise(nonDominated)
    const bestSolution = nonDominated[bestIndex]
    
    return {
      success: true,
      optimizedParameters: bestSolution.parameters,
      objectiveValue: bestSolution.power * bestSolution.efficiency,
      constraintViolations: [],
      iterations: paretoSize,
      convergenceHistory: [],
      paretoFront: nonDominated
    }
  }
  
  private static filterNonDominated(
    solutions: NonNullable<OptimizationResult['paretoFront']>
  ): NonNullable<OptimizationResult['paretoFront']> {
    const nonDominated: NonNullable<OptimizationResult['paretoFront']> = []
    
    for (const solution of solutions) {
      let isDominated = false
      
      for (const other of solutions) {
        if (solution === other) continue
        
        // Check if 'other' dominates 'solution'
        if (other.power >= solution.power &&
            other.efficiency >= solution.efficiency &&
            other.cost <= solution.cost &&
            (other.power > solution.power ||
             other.efficiency > solution.efficiency ||
             other.cost < solution.cost)) {
          isDominated = true
          break
        }
      }
      
      if (!isDominated) {
        nonDominated.push(solution)
      }
    }
    
    return nonDominated
  }
  
  private static findBestCompromise(
    paretoFront: NonNullable<OptimizationResult['paretoFront']>
  ): number {
    // Find solution closest to ideal point (max power, max efficiency, min cost)
    const maxPower = Math.max(...paretoFront.map(s => s.power))
    const maxEfficiency = Math.max(...paretoFront.map(s => s.efficiency))
    const minCost = Math.min(...paretoFront.map(s => s.cost))
    
    let bestIndex = 0
    let bestDistance = Infinity
    
    paretoFront.forEach((solution, index) => {
      const distance = Math.sqrt(
        Math.pow((maxPower - solution.power) / maxPower, 2) +
        Math.pow((maxEfficiency - solution.efficiency) / maxEfficiency, 2) +
        Math.pow((solution.cost - minCost) / (minCost || 1), 2)
      )
      
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    })
    
    return bestIndex
  }
}