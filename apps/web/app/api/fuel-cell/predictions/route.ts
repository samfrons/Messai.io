import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FuelCellModelingEngine, type FuelCellPredictionInput } from '@/lib/fuel-cell-predictions'
import { FuelCellType, ModelFidelity } from '@/lib/types/fuel-cell-types'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const FuelCellTypeSchema = z.enum([FuelCellType.PEM, FuelCellType.SOFC, FuelCellType.PAFC, FuelCellType.MCFC, FuelCellType.AFC])
const ModelFidelitySchema = z.enum([ModelFidelity.BASIC, ModelFidelity.INTERMEDIATE, ModelFidelity.ADVANCED])

const FuelCellPredictionSchema = z.object({
  // System configuration
  fuelCellType: FuelCellTypeSchema,
  cellCount: z.number().min(1).max(1000),
  activeArea: z.number().min(0.1).max(10000), // cm²
  
  // Operating conditions
  operatingTemperature: z.number().min(-50).max(1200), // °C
  operatingPressure: z.number().min(0.1).max(100), // bar
  humidity: z.number().min(0).max(100), // %
  
  // Gas flows
  fuelFlowRate: z.number().min(0.01).max(1000), // L/min
  airFlowRate: z.number().min(0.01).max(10000), // L/min
  
  // Materials (optional)
  anodeCatalyst: z.string().optional(),
  cathodeCatalyst: z.string().optional(),
  membraneType: z.string().optional(),
  
  // Model configuration
  modelFidelity: ModelFidelitySchema.default('BASIC'),
  
  // Optional advanced parameters
  stackVoltage: z.number().min(0).max(2000).optional(), // V
  currentDensity: z.number().min(0).max(10).optional() // A/cm²
})

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = FuelCellPredictionSchema.parse(body)

    // Convert to prediction input format
    const predictionInput: FuelCellPredictionInput = {
      ...validatedInput,
      modelFidelity: validatedInput.modelFidelity || 'BASIC'
    }

    // Validate fuel cell type specific constraints
    validateFuelCellConstraints(predictionInput)

    // Calculate prediction
    const result = await FuelCellModelingEngine.getPrediction(predictionInput)

    // Add API metadata
    const response = {
      success: true,
      data: result,
      metadata: {
        apiVersion: '1.0',
        processingTime: Date.now() - startTime,
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        modelVersion: getModelVersion(predictionInput.fuelCellType, predictionInput.modelFidelity)
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Fuel cell prediction API error:', error)

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
        error: 'Fuel cell constraint violation',
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : 'Prediction calculation failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fuelCellType = searchParams.get('type') as any
    const fidelity = searchParams.get('fidelity') as any

    // Return API capabilities and supported parameters
    const capabilities = {
      supportedFuelCellTypes: ['PEM', 'SOFC', 'PAFC', 'MCFC', 'AFC'],
      supportedFidelityLevels: ['BASIC', 'INTERMEDIATE', 'ADVANCED'],
      parameterRanges: {
        cellCount: { min: 1, max: 1000 },
        activeArea: { min: 0.1, max: 10000, unit: 'cm²' },
        operatingTemperature: { min: -50, max: 1200, unit: '°C' },
        operatingPressure: { min: 0.1, max: 100, unit: 'bar' },
        humidity: { min: 0, max: 100, unit: '%' },
        fuelFlowRate: { min: 0.01, max: 1000, unit: 'L/min' },
        airFlowRate: { min: 0.01, max: 10000, unit: 'L/min' }
      },
      fuelCellTypeConstraints: getFuelCellTypeConstraints(),
      availableMaterials: getAvailableMaterials(),
      modelFeatures: getModelFeatures()
    }

    // If specific type requested, return optimized parameters
    if (fuelCellType && capabilities.supportedFuelCellTypes.includes(fuelCellType)) {
      capabilities['optimizedParameters'] = getOptimizedParameters(fuelCellType)
    }

    return NextResponse.json({
      success: true,
      data: capabilities,
      metadata: {
        apiVersion: '1.0',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Fuel cell capabilities API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve capabilities'
    }, { status: 500 })
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateFuelCellConstraints(input: FuelCellPredictionInput) {
  const constraints = getFuelCellTypeConstraints()[input.fuelCellType]
  
  if (!constraints) {
    throw new Error(`Unsupported fuel cell type: ${input.fuelCellType}`)
  }

  // Temperature constraints
  if (input.operatingTemperature < constraints.temperature.min || 
      input.operatingTemperature > constraints.temperature.max) {
    throw new Error(
      `Temperature ${input.operatingTemperature}°C out of range for ${input.fuelCellType}. ` +
      `Valid range: ${constraints.temperature.min}-${constraints.temperature.max}°C`
    )
  }

  // Pressure constraints
  if (input.operatingPressure < constraints.pressure.min || 
      input.operatingPressure > constraints.pressure.max) {
    throw new Error(
      `Pressure ${input.operatingPressure} bar out of range for ${input.fuelCellType}. ` +
      `Valid range: ${constraints.pressure.min}-${constraints.pressure.max} bar`
    )
  }

  // Humidity constraints for low-temperature fuel cells
  if (constraints.humidity && (input.humidity < constraints.humidity.min || 
      input.humidity > constraints.humidity.max)) {
    throw new Error(
      `Humidity ${input.humidity}% out of range for ${input.fuelCellType}. ` +
      `Valid range: ${constraints.humidity.min}-${constraints.humidity.max}%`
    )
  }
}

function getFuelCellTypeConstraints() {
  return {
    PEM: {
      temperature: { min: 40, max: 90 },
      pressure: { min: 1, max: 10 },
      humidity: { min: 50, max: 100 }
    },
    SOFC: {
      temperature: { min: 600, max: 1000 },
      pressure: { min: 1, max: 20 },
      humidity: { min: 0, max: 5 } // Minimal humidity for high-temp
    },
    PAFC: {
      temperature: { min: 150, max: 220 },
      pressure: { min: 1, max: 8 },
      humidity: { min: 60, max: 95 }
    },
    MCFC: {
      temperature: { min: 600, max: 700 },
      pressure: { min: 1, max: 15 },
      humidity: { min: 0, max: 5 }
    },
    AFC: {
      temperature: { min: 50, max: 90 },
      pressure: { min: 1, max: 6 },
      humidity: { min: 80, max: 100 }
    }
  }
}

function getAvailableMaterials() {
  return {
    anodeCatalysts: ['Pt/C', 'Pt-alloy', 'Non-PGM', 'Ni-based'],
    cathodeCatalysts: ['Pt/C', 'Pt-alloy', 'Non-PGM', 'Ni-based'],
    membranes: ['Nafion', 'PFSA', 'Hydrocarbon', 'Ceramic']
  }
}

function getModelFeatures() {
  return {
    BASIC: [
      'Power and efficiency calculations',
      'Basic voltage-current characteristics',
      'Material factor analysis',
      'Operating condition optimization'
    ],
    INTERMEDIATE: [
      'All BASIC features',
      'Thermal profile analysis',
      'Gas composition tracking',
      'Flow rate optimization',
      'Performance factor breakdown'
    ],
    ADVANCED: [
      'All INTERMEDIATE features',
      'Control system recommendations',
      'Multi-objective optimization',
      'Real-time performance monitoring',
      'Hardware-in-the-loop support',
      'Detailed gas dynamics',
      'Advanced thermal modeling'
    ]
  }
}

function getOptimizedParameters(fuelCellType: string) {
  const optimized = {
    PEM: {
      operatingTemperature: 80,
      operatingPressure: 2.5,
      humidity: 100,
      anodeCatalyst: 'Pt/C',
      cathodeCatalyst: 'Pt/C',
      membraneType: 'Nafion'
    },
    SOFC: {
      operatingTemperature: 750,
      operatingPressure: 1.5,
      humidity: 0,
      anodeCatalyst: 'Ni-based',
      cathodeCatalyst: 'Ni-based',
      membraneType: 'Ceramic'
    },
    PAFC: {
      operatingTemperature: 200,
      operatingPressure: 3.0,
      humidity: 85,
      anodeCatalyst: 'Pt/C',
      cathodeCatalyst: 'Pt/C',
      membraneType: 'PFSA'
    },
    MCFC: {
      operatingTemperature: 650,
      operatingPressure: 2.0,
      humidity: 0,
      anodeCatalyst: 'Ni-based',
      cathodeCatalyst: 'Ni-based',
      membraneType: 'Ceramic'
    },
    AFC: {
      operatingTemperature: 70,
      operatingPressure: 2.0,
      humidity: 95,
      anodeCatalyst: 'Non-PGM',
      cathodeCatalyst: 'Non-PGM',
      membraneType: 'Hydrocarbon'
    }
  }

  return optimized[fuelCellType as keyof typeof optimized] || null
}

function getModelVersion(fuelCellType: string, fidelity: string): string {
  return `${fuelCellType}-${fidelity}-v1.0`
}

function generateRequestId(): string {
  return `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}