import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FuelCellOptimizationEngine } from '@/lib/fuel-cell-optimization'
import { FuelCellType } from '@/lib/types/fuel-cell-types'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const FuelCellTypeSchema = z.enum([FuelCellType.PEM, FuelCellType.SOFC, FuelCellType.PAFC, FuelCellType.MCFC, FuelCellType.AFC])

const OptimizationObjectiveSchema = z.object({
  type: z.enum(['MAXIMIZE_POWER', 'MAXIMIZE_EFFICIENCY', 'MINIMIZE_COST', 'MAXIMIZE_DURABILITY', 'MULTI_OBJECTIVE']),
  weights: z.object({
    power: z.number().min(0).max(1).optional(),
    efficiency: z.number().min(0).max(1).optional(),
    cost: z.number().min(0).max(1).optional(),
    durability: z.number().min(0).max(1).optional()
  }).optional(),
  targets: z.object({
    minPower: z.number().min(0).optional(),
    minEfficiency: z.number().min(0).max(100).optional(),
    maxCost: z.number().min(0).optional(),
    minDurability: z.number().min(0).optional()
  }).optional()
})

const OptimizationConstraintsSchema = z.object({
  cellCount: z.object({
    min: z.number().min(1),
    max: z.number().min(1)
  }),
  activeArea: z.object({
    min: z.number().min(0.1),
    max: z.number().min(0.1)
  }),
  temperature: z.object({
    min: z.number(),
    max: z.number()
  }),
  pressure: z.object({
    min: z.number().min(0.1),
    max: z.number().min(0.1)
  }),
  humidity: z.object({
    min: z.number().min(0).max(100),
    max: z.number().min(0).max(100)
  }).optional(),
  fuelFlowRate: z.object({
    min: z.number().min(0.01),
    max: z.number().min(0.01)
  }),
  airFlowRate: z.object({
    min: z.number().min(0.01),
    max: z.number().min(0.01)
  }),
  availableMaterials: z.object({
    anodeCatalysts: z.array(z.string()).optional(),
    cathodeCatalysts: z.array(z.string()).optional(),
    membraneTypes: z.array(z.string()).optional()
  }).optional(),
  maxSystemCost: z.number().min(0).optional(),
  maxOperatingCost: z.number().min(0).optional()
})

const OptimizationParametersSchema = z.object({
  algorithm: z.enum(['GRADIENT_DESCENT', 'GENETIC_ALGORITHM', 'PARTICLE_SWARM', 'SIMULATED_ANNEALING', 'BAYESIAN']),
  maxIterations: z.number().min(10).max(1000),
  convergenceTolerance: z.number().min(0.00001).max(0.1),
  populationSize: z.number().min(10).max(200).optional(),
  temperatureSchedule: z.enum(['LINEAR', 'EXPONENTIAL', 'ADAPTIVE']).optional(),
  acquisitionFunction: z.enum(['EI', 'PI', 'UCB']).optional()
})

const OptimizationRequestSchema = z.object({
  fuelCellType: FuelCellTypeSchema,
  objective: OptimizationObjectiveSchema,
  constraints: OptimizationConstraintsSchema,
  parameters: OptimizationParametersSchema,
  initialGuess: z.object({
    cellCount: z.number().optional(),
    activeArea: z.number().optional(),
    operatingTemperature: z.number().optional(),
    operatingPressure: z.number().optional(),
    humidity: z.number().optional(),
    fuelFlowRate: z.number().optional(),
    airFlowRate: z.number().optional()
  }).optional()
})

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = OptimizationRequestSchema.parse(body)
    
    // Validate constraints consistency
    validateConstraints(validatedInput.constraints)
    
    // Validate objective weights for multi-objective
    if (validatedInput.objective.type === 'MULTI_OBJECTIVE') {
      const weights = validatedInput.objective.weights || {}
      const totalWeight = (weights.power || 0) + (weights.efficiency || 0) + 
                         (weights.cost || 0) + (weights.durability || 0)
      if (totalWeight === 0) {
        throw new Error('Multi-objective optimization requires at least one non-zero weight')
      }
    }
    
    // Run optimization
    const result = await FuelCellOptimizationEngine.optimize(
      validatedInput.fuelCellType,
      validatedInput.objective,
      validatedInput.constraints,
      validatedInput.parameters,
      validatedInput.initialGuess
    )
    
    // Add API metadata
    const response = {
      success: true,
      data: result,
      metadata: {
        apiVersion: '1.0',
        processingTime: Date.now() - startTime,
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        fuelCellType: validatedInput.fuelCellType,
        algorithm: validatedInput.parameters.algorithm,
        objective: validatedInput.objective.type
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Fuel cell optimization API error:', error)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('constraint')) {
      return NextResponse.json({
        success: false,
        error: 'Constraint validation error',
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : 'Optimization failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fuelCellType = searchParams.get('type') as any
    
    // Return optimization capabilities and presets
    const response = {
      success: true,
      data: {
        supportedObjectives: [
          {
            type: 'MAXIMIZE_POWER',
            description: 'Maximize total power output',
            requiredParams: []
          },
          {
            type: 'MAXIMIZE_EFFICIENCY',
            description: 'Maximize system efficiency',
            requiredParams: []
          },
          {
            type: 'MINIMIZE_COST',
            description: 'Minimize total system cost',
            requiredParams: []
          },
          {
            type: 'MAXIMIZE_DURABILITY',
            description: 'Maximize expected lifetime',
            requiredParams: []
          },
          {
            type: 'MULTI_OBJECTIVE',
            description: 'Balance multiple objectives',
            requiredParams: ['weights']
          }
        ],
        supportedAlgorithms: [
          {
            name: 'GENETIC_ALGORITHM',
            description: 'Population-based evolutionary algorithm',
            strengths: ['Global optimization', 'Handles discrete variables', 'No gradient required'],
            parameters: ['populationSize', 'mutationRate', 'crossoverRate']
          },
          {
            name: 'GRADIENT_DESCENT',
            description: 'Local optimization using gradients',
            strengths: ['Fast convergence', 'Efficient for smooth objectives'],
            parameters: ['learningRate', 'momentum']
          },
          {
            name: 'BAYESIAN',
            description: 'Gaussian process-based optimization',
            strengths: ['Sample efficient', 'Handles expensive evaluations', 'Uncertainty quantification'],
            parameters: ['acquisitionFunction', 'kernelType']
          }
        ],
        defaultConstraints: fuelCellType ? getDefaultConstraints(fuelCellType) : getAllDefaultConstraints(),
        optimizationTips: [
          'Start with broader constraints and narrow them based on results',
          'Use GENETIC_ALGORITHM for initial exploration',
          'Switch to GRADIENT_DESCENT for fine-tuning',
          'Multi-objective optimization may require more iterations',
          'Consider computational cost vs accuracy trade-offs'
        ]
      },
      metadata: {
        apiVersion: '1.0',
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Optimization capabilities API error:', error)
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve capabilities'
    }, { status: 500 })
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateConstraints(constraints: any) {
  // Check that min <= max for all ranges
  const ranges = ['cellCount', 'activeArea', 'temperature', 'pressure', 'fuelFlowRate', 'airFlowRate']
  
  for (const range of ranges) {
    if (constraints[range] && constraints[range].min > constraints[range].max) {
      throw new Error(`Invalid ${range} range: min (${constraints[range].min}) > max (${constraints[range].max})`)
    }
  }
  
  if (constraints.humidity && constraints.humidity.min > constraints.humidity.max) {
    throw new Error(`Invalid humidity range: min (${constraints.humidity.min}) > max (${constraints.humidity.max})`)
  }
  
  // Validate material lists
  if (constraints.availableMaterials) {
    const materials = constraints.availableMaterials
    if (materials.anodeCatalysts && materials.anodeCatalysts.length === 0) {
      throw new Error('At least one anode catalyst must be available')
    }
    if (materials.cathodeCatalysts && materials.cathodeCatalysts.length === 0) {
      throw new Error('At least one cathode catalyst must be available')
    }
    if (materials.membraneTypes && materials.membraneTypes.length === 0) {
      throw new Error('At least one membrane type must be available')
    }
  }
}

function getDefaultConstraints(fuelCellType: string) {
  const constraints = {
    PEM: {
      cellCount: { min: 10, max: 200 },
      activeArea: { min: 10, max: 500 },
      temperature: { min: 40, max: 90 },
      pressure: { min: 1, max: 10 },
      humidity: { min: 50, max: 100 },
      fuelFlowRate: { min: 0.1, max: 50 },
      airFlowRate: { min: 1, max: 500 }
    },
    SOFC: {
      cellCount: { min: 5, max: 100 },
      activeArea: { min: 50, max: 1000 },
      temperature: { min: 600, max: 1000 },
      pressure: { min: 1, max: 20 },
      fuelFlowRate: { min: 0.5, max: 100 },
      airFlowRate: { min: 5, max: 1000 }
    },
    PAFC: {
      cellCount: { min: 20, max: 150 },
      activeArea: { min: 50, max: 600 },
      temperature: { min: 150, max: 220 },
      pressure: { min: 1, max: 8 },
      humidity: { min: 60, max: 95 },
      fuelFlowRate: { min: 0.5, max: 60 },
      airFlowRate: { min: 2, max: 600 }
    },
    MCFC: {
      cellCount: { min: 10, max: 80 },
      activeArea: { min: 100, max: 1200 },
      temperature: { min: 600, max: 700 },
      pressure: { min: 1, max: 15 },
      fuelFlowRate: { min: 1, max: 150 },
      airFlowRate: { min: 10, max: 1500 }
    },
    AFC: {
      cellCount: { min: 15, max: 120 },
      activeArea: { min: 20, max: 400 },
      temperature: { min: 50, max: 90 },
      pressure: { min: 1, max: 6 },
      humidity: { min: 80, max: 100 },
      fuelFlowRate: { min: 0.2, max: 40 },
      airFlowRate: { min: 1, max: 400 }
    }
  }
  
  return constraints[fuelCellType as keyof typeof constraints] || constraints.PEM
}

function getAllDefaultConstraints() {
  return {
    PEM: getDefaultConstraints('PEM'),
    SOFC: getDefaultConstraints('SOFC'),
    PAFC: getDefaultConstraints('PAFC'),
    MCFC: getDefaultConstraints('MCFC'),
    AFC: getDefaultConstraints('AFC')
  }
}

function generateRequestId(): string {
  return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}