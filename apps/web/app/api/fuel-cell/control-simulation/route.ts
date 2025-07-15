import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ControlSystemSimulationEngine, SIMULATION_PRESETS } from '@/lib/control-system-simulation'
import { FuelCellTypeEnum } from '@/lib/types/fuel-cell-types'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const FuelCellTypeSchema = z.enum([FuelCellTypeEnum.PEM, FuelCellTypeEnum.SOFC, FuelCellTypeEnum.PAFC, FuelCellTypeEnum.MCFC, FuelCellTypeEnum.AFC])

const ControllerConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['PID', 'FUZZY', 'ADAPTIVE', 'NEURAL']),
  setpoint: z.number(),
  pidParams: z.object({
    kp: z.number().min(0).max(10),
    ki: z.number().min(0).max(5),
    kd: z.number().min(0).max(2)
  }),
  constraints: z.object({
    min: z.number(),
    max: z.number(),
    rateLimit: z.number().min(0)
  }),
  deadband: z.number().optional(),
  windup_limit: z.number().optional()
})

const PurgingControllerSchema = ControllerConfigSchema.extend({
  strategy: z.enum(['TIME_BASED', 'COMPOSITION_BASED', 'PERFORMANCE_BASED']),
  threshold: z.number().min(0).max(1),
  interval: z.number().min(1).max(3600), // 1 second to 1 hour
  duration: z.number().min(1).max(300) // 1 second to 5 minutes
})

const ControlSystemConfigSchema = z.object({
  thermal: ControllerConfigSchema,
  humidity: ControllerConfigSchema,
  pressure: ControllerConfigSchema,
  purging: PurgingControllerSchema,
  airIntake: ControllerConfigSchema,
  stackVoltage: ControllerConfigSchema
})

const SystemDisturbanceSchema = z.object({
  type: z.enum(['LOAD_CHANGE', 'TEMPERATURE_SPIKE', 'PRESSURE_DROP', 'HUMIDITY_VARIATION', 'FUEL_INTERRUPTION']),
  magnitude: z.number().min(0).max(1),
  duration: z.number().min(1).max(300),
  startTime: z.number().min(0)
})

const SimulationParametersSchema = z.object({
  duration: z.number().min(10).max(3600), // 10 seconds to 1 hour
  timeStep: z.number().min(0.01).max(1), // 10ms to 1 second
  disturbances: z.array(SystemDisturbanceSchema).default([]),
  nominalConditions: z.object({
    temperature: z.number().min(-50).max(1200),
    humidity: z.number().min(0).max(100),
    pressure: z.number().min(0.1).max(100),
    fuelFlow: z.number().min(0.01).max(1000),
    airFlow: z.number().min(0.01).max(10000)
  })
})

const ControlSimulationRequestSchema = z.object({
  fuelCellType: FuelCellTypeSchema,
  controlConfig: ControlSystemConfigSchema,
  simulationParams: SimulationParametersSchema.optional(),
  preset: z.enum(['BASIC_TEST', 'LOAD_STEP', 'THERMAL_DISTURBANCE', 'COMPREHENSIVE']).optional()
})

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = ControlSimulationRequestSchema.parse(body)
    
    // Use preset or custom simulation parameters
    let simulationParams = validatedInput.simulationParams
    if (validatedInput.preset && !simulationParams) {
      simulationParams = SIMULATION_PRESETS[validatedInput.preset] as any
    }
    
    if (!simulationParams) {
      return NextResponse.json({
        success: false,
        error: 'Missing simulation parameters',
        message: 'Either provide simulationParams or specify a preset'
      }, { status: 400 })
    }
    
    // Validate fuel cell type specific constraints
    validateControlSystemConstraints(validatedInput.fuelCellType, validatedInput.controlConfig)
    
    // Run simulation
    const result = await ControlSystemSimulationEngine.simulate(
      validatedInput.controlConfig,
      validatedInput.fuelCellType,
      simulationParams
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
        simulationDuration: simulationParams.duration,
        timeStep: simulationParams.timeStep,
        fuelCellType: validatedInput.fuelCellType,
        enabledControllers: Object.entries(validatedInput.controlConfig)
          .filter(([_, config]) => (config as any).enabled)
          .map(([name, _]) => name)
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Control system simulation API error:', error)
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
        error: 'Control system constraint violation',
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : 'Simulation failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fuelCellType = searchParams.get('type') as any
    const preset = searchParams.get('preset') as any
    
    // Return available presets and default configurations
    const response = {
      success: true,
      data: {
        availablePresets: Object.keys(SIMULATION_PRESETS),
        presetDetails: preset ? SIMULATION_PRESETS[preset as keyof typeof SIMULATION_PRESETS] : SIMULATION_PRESETS,
        supportedFuelCellTypes: ['PEM', 'SOFC', 'PAFC', 'MCFC', 'AFC'],
        controllerTypes: ['PID', 'FUZZY', 'ADAPTIVE', 'NEURAL'],
        disturbanceTypes: ['LOAD_CHANGE', 'TEMPERATURE_SPIKE', 'PRESSURE_DROP', 'HUMIDITY_VARIATION', 'FUEL_INTERRUPTION'],
        defaultConfigurations: fuelCellType ? getDefaultConfiguration(fuelCellType) : getAllDefaultConfigurations(),
        simulationConstraints: {
          duration: { min: 10, max: 3600, unit: 'seconds' },
          timeStep: { min: 0.01, max: 1, unit: 'seconds' },
          pidParams: {
            kp: { min: 0, max: 10 },
            ki: { min: 0, max: 5 },
            kd: { min: 0, max: 2 }
          }
        }
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
      console.error('Control system capabilities API error:', error)
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

function validateControlSystemConstraints(fuelCellType: FuelCellType, config: any) {
  // Fuel cell type specific validations
  if ((fuelCellType === 'SOFC' || fuelCellType === 'MCFC') && config.humidity.enabled) {
    throw new Error(`Humidity control not applicable for ${fuelCellType} fuel cells (high temperature operation)`)
  }
  
  // Temperature range validations
  const tempConstraints = {
    PEM: { min: 40, max: 90 },
    SOFC: { min: 600, max: 1000 },
    PAFC: { min: 150, max: 220 },
    MCFC: { min: 600, max: 700 },
    AFC: { min: 50, max: 90 }
  }
  
  const constraints = tempConstraints[fuelCellType]
  if (config.thermal.enabled && (
    config.thermal.setpoint < constraints.min || 
    config.thermal.setpoint > constraints.max
  )) {
    throw new Error(
      `Thermal setpoint ${config.thermal.setpoint}°C out of range for ${fuelCellType}. ` +
      `Valid range: ${constraints.min}-${constraints.max}°C`
    )
  }
  
  // PID parameter validation
  Object.entries(config).forEach(([controllerName, controller]: [string, any]) => {
    if (controller.enabled && controller.type === 'PID') {
      if (controller.pidParams.kp < 0 || controller.pidParams.kp > 10) {
        throw new Error(`${controllerName} controller Kp out of range (0-10)`)
      }
      if (controller.pidParams.ki < 0 || controller.pidParams.ki > 5) {
        throw new Error(`${controllerName} controller Ki out of range (0-5)`)
      }
      if (controller.pidParams.kd < 0 || controller.pidParams.kd > 2) {
        throw new Error(`${controllerName} controller Kd out of range (0-2)`)
      }
    }
  })
}

function getDefaultConfiguration(fuelCellType: string) {
  const defaults = {
    PEM: {
      thermal: {
        enabled: true,
        type: 'PID',
        setpoint: 80,
        pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 },
        constraints: { min: 40, max: 90, rateLimit: 2 }
      },
      humidity: {
        enabled: true,
        type: 'PID',
        setpoint: 100,
        pidParams: { kp: 0.5, ki: 0.2, kd: 0.02 },
        constraints: { min: 50, max: 100, rateLimit: 5 }
      },
      pressure: {
        enabled: true,
        type: 'PID',
        setpoint: 2.5,
        pidParams: { kp: 1.2, ki: 0.3, kd: 0.1 },
        constraints: { min: 1, max: 10, rateLimit: 0.5 }
      }
    },
    SOFC: {
      thermal: {
        enabled: true,
        type: 'PID',
        setpoint: 750,
        pidParams: { kp: 0.5, ki: 0.05, kd: 0.1 },
        constraints: { min: 600, max: 1000, rateLimit: 10 }
      },
      humidity: {
        enabled: false,
        type: 'PID',
        setpoint: 0,
        pidParams: { kp: 0, ki: 0, kd: 0 },
        constraints: { min: 0, max: 100, rateLimit: 1 }
      },
      pressure: {
        enabled: true,
        type: 'ADAPTIVE',
        setpoint: 1.5,
        pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 },
        constraints: { min: 1, max: 20, rateLimit: 0.3 }
      }
    }
  }
  
  return defaults[fuelCellType as keyof typeof defaults] || defaults.PEM
}

function getAllDefaultConfigurations() {
  return {
    PEM: getDefaultConfiguration('PEM'),
    SOFC: getDefaultConfiguration('SOFC'),
    PAFC: getDefaultConfiguration('PAFC'),
    MCFC: getDefaultConfiguration('MCFC'),
    AFC: getDefaultConfiguration('AFC')
  }
}

function generateRequestId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}