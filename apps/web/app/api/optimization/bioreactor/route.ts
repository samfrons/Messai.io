import { NextRequest, NextResponse } from 'next/server'
import { 
  GradientDescentOptimizer,
  GeneticAlgorithmOptimizer,
  ParticleSwarmOptimizer,
  BayesianOptimizer,
  OptimizationObjective,
  OptimizationConstraints,
  OptimizationParameters,
  BioreactorParameters,
  OptimizationResult
} from '@messai/ai'
import { predictionEngine, PredictionInput } from '@messai/core'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      systemType,
      objective,
      algorithm,
      initialParameters,
      constraints,
      weights
    } = body

    // Validate inputs
    if (!objective || !constraints || !initialParameters || !algorithm) {
      return NextResponse.json({
        error: 'Missing required parameters: objective, constraints, initialParameters, and algorithm'
      }, { status: 400 })
    }

    if (!systemType || !['MFC', 'MEC', 'MDC', 'MES'].includes(systemType)) {
      return NextResponse.json({
        error: 'systemType is required and must be one of: MFC, MEC, MDC, MES'
      }, { status: 400 })
    }

    // Create evaluation function
    const evaluationFunction = async (params: BioreactorParameters) => {
      // Simplified prediction model for optimization
      // In production, this would use the full prediction engine
      
      const basePower = getSystemBasePower(systemType)
      const baseEfficiency = getSystemBaseEfficiency(systemType)
      
      // Calculate performance based on parameters
      let power = basePower
      let efficiency = baseEfficiency
      
      // Temperature effects (optimal around 30°C)
      const tempFactor = 1 - Math.abs(params.temperature - 30) / 50
      power *= tempFactor
      efficiency *= tempFactor
      
      // pH effects (optimal around 7.0)
      const phFactor = 1 - Math.abs(params.ph - 7.0) / 5
      power *= phFactor
      efficiency *= phFactor
      
      // Flow rate effects
      const flowFactor = Math.min(1, params.flowRate / 50) * Math.max(0.5, 1 - (params.flowRate - 50) / 100)
      power *= flowFactor
      
      // Mixing speed effects
      const mixingFactor = Math.min(1, params.mixingSpeed / 150) * Math.max(0.6, 1 - (params.mixingSpeed - 150) / 200)
      efficiency *= mixingFactor
      
      // Voltage effects
      const voltageFactor = Math.min(1, params.electrodeVoltage / 100)
      power *= voltageFactor
      
      // Substrate concentration effects
      const substrateFactor = Math.min(1, params.substrateConcentration / 5) * Math.max(0.5, 1 - (params.substrateConcentration - 5) / 10)
      power *= substrateFactor
      efficiency *= substrateFactor
      
      // Calculate cost
      let cost = 500 // Base cost
      cost += Math.abs(params.temperature - 30) * 2 // Temperature control
      cost += params.mixingSpeed * 0.1 // Mixing energy
      cost += params.electrodeVoltage * 0.05 // Electrical cost
      cost += params.substrateConcentration * params.flowRate * 0.01 // Substrate cost
      
      return { 
        power: Math.max(0.1, power), 
        efficiency: Math.max(5, Math.min(95, efficiency)), 
        cost 
      }
    }

    // Create optimization objective
    const optimizationObjective: OptimizationObjective = {
      type: objective,
      weights: weights || undefined
    }
    
    // Create optimization parameters
    const optimizationParameters: OptimizationParameters = {
      algorithm,
      maxIterations: 100,
      convergenceTolerance: 0.001,
      populationSize: algorithm === 'GENETIC_ALGORITHM' || algorithm === 'PARTICLE_SWARM' ? 50 : undefined
    }
    
    // Select and run optimization algorithm
    let optimizer
    let result: OptimizationResult
    
    switch (algorithm) {
      case 'GRADIENT_DESCENT':
        optimizer = new GradientDescentOptimizer(
          optimizationObjective,
          constraints,
          optimizationParameters,
          evaluationFunction
        )
        break
        
      case 'GENETIC_ALGORITHM':
        optimizer = new GeneticAlgorithmOptimizer(
          optimizationObjective,
          constraints,
          optimizationParameters,
          evaluationFunction
        )
        break
        
      case 'PARTICLE_SWARM':
        optimizer = new ParticleSwarmOptimizer(
          optimizationObjective,
          constraints,
          optimizationParameters,
          evaluationFunction
        )
        break
        
      case 'BAYESIAN':
        optimizer = new BayesianOptimizer(
          optimizationObjective,
          constraints,
          optimizationParameters,
          evaluationFunction
        )
        break
        
      default:
        return NextResponse.json({
          error: 'Invalid algorithm. Must be one of: GRADIENT_DESCENT, GENETIC_ALGORITHM, PARTICLE_SWARM, BAYESIAN'
        }, { status: 400 })
    }
    
    // Run optimization
    result = await optimizer.optimize(initialParameters)

    // Get final performance evaluation
    const finalPerformance = await evaluationFunction(result.optimizedParameters)

    return NextResponse.json({
      success: result.success,
      systemType,
      algorithm,
      optimizedParameters: result.optimizedParameters,
      performance: {
        power: finalPerformance.power,
        efficiency: finalPerformance.efficiency,
        cost: finalPerformance.cost
      },
      optimization: {
        objectiveValue: result.objectiveValue,
        iterations: result.iterations,
        constraintViolations: result.constraintViolations,
        convergenceHistory: result.convergenceHistory.slice(-10), // Last 10 iterations
        sensitivity: result.sensitivity
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Optimization error:', error)
    return NextResponse.json({
      error: 'Failed to optimize bioreactor parameters',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Bioreactor Optimization API',
    description: 'Optimize bioreactor parameters for various objectives',
    endpoints: {
      POST: {
        description: 'Run optimization for bioreactor parameters',
        requiredParams: {
          bioreactorId: 'ID of the bioreactor model to optimize',
          objective: 'Optimization objective (see objectives)',
          constraints: 'Parameter constraints (see constraints)',
          parameters: 'Optimization algorithm parameters (see algorithms)'
        },
        optionalParams: {
          initialGuess: 'Initial parameter values',
          multiObjective: 'Enable multi-objective optimization (requires array of objectives)'
        },
        objectives: {
          types: ['MAXIMIZE_POWER', 'MAXIMIZE_EFFICIENCY', 'MINIMIZE_COST', 'MAXIMIZE_DURABILITY', 'MULTI_OBJECTIVE'],
          multiObjective: {
            weights: {
              power: 'Weight for power output (0-1)',
              efficiency: 'Weight for efficiency (0-1)',
              cost: 'Weight for cost (0-1)',
              durability: 'Weight for durability (0-1)'
            }
          }
        },
        constraints: {
          temperature: { min: 'Minimum temperature (°C)', max: 'Maximum temperature (°C)' },
          ph: { min: 'Minimum pH', max: 'Maximum pH' },
          flowRate: { min: 'Minimum flow rate (L/h)', max: 'Maximum flow rate (L/h)' },
          mixingSpeed: { min: 'Minimum mixing speed (RPM)', max: 'Maximum mixing speed (RPM)' },
          electrodeVoltage: { min: 'Minimum voltage (mV)', max: 'Maximum voltage (mV)' },
          substrateConcentration: { min: 'Minimum concentration (g/L)', max: 'Maximum concentration (g/L)' }
        },
        algorithms: {
          types: ['GRADIENT_DESCENT', 'GENETIC_ALGORITHM', 'PARTICLE_SWARM', 'BAYESIAN'],
          parameters: {
            algorithm: 'Algorithm type',
            maxIterations: 'Maximum iterations',
            convergenceTolerance: 'Convergence tolerance',
            populationSize: 'Population size (for GA/PSO)',
            acquisitionFunction: 'Acquisition function (for Bayesian): EI, PI, or UCB'
          }
        }
      }
    },
    examples: {
      singleObjective: {
        bioreactorId: 'embr-001',
        objective: {
          type: 'MAXIMIZE_POWER',
          targets: {
            minEfficiency: 70
          }
        },
        constraints: {
          temperature: { min: 25, max: 40 },
          ph: { min: 6.5, max: 8.0 },
          flowRate: { min: 15, max: 40 },
          mixingSpeed: { min: 100, max: 250 },
          electrodeVoltage: { min: 50, max: 200 },
          substrateConcentration: { min: 1.0, max: 4.0 }
        },
        parameters: {
          algorithm: 'GENETIC_ALGORITHM',
          maxIterations: 100,
          convergenceTolerance: 0.001,
          populationSize: 50
        }
      },
      multiObjective: {
        bioreactorId: 'embr-001',
        multiObjective: true,
        objective: [
          { type: 'MAXIMIZE_POWER' },
          { type: 'MAXIMIZE_EFFICIENCY' },
          { type: 'MINIMIZE_COST' }
        ],
        constraints: {
          temperature: { min: 25, max: 40 },
          ph: { min: 6.5, max: 8.0 },
          flowRate: { min: 15, max: 40 },
          mixingSpeed: { min: 100, max: 250 },
          electrodeVoltage: { min: 50, max: 200 },
          substrateConcentration: { min: 1.0, max: 4.0 }
        },
        parameters: {
          algorithm: 'GENETIC_ALGORITHM',
          maxIterations: 200,
          convergenceTolerance: 0.001,
          populationSize: 100,
          paretoSize: 20
        }
      }
    }
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSystemBasePower(systemType: string): number {
  const basePowers = {
    MFC: 25, // mW/m²
    MEC: 15, // mW/m² (energy input required)
    MDC: 20, // mW/m²
    MES: 18  // mW/m²
  }
  return basePowers[systemType as keyof typeof basePowers] || 20
}

function getSystemBaseEfficiency(systemType: string): number {
  const baseEfficiencies = {
    MFC: 65, // %
    MEC: 85, // %
    MDC: 70, // %
    MES: 60  // %
  }
  return baseEfficiencies[systemType as keyof typeof baseEfficiencies] || 65
}