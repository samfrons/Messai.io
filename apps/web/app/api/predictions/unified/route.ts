import { NextRequest, NextResponse } from 'next/server'
import { 
  calculatePower, 
  predictionEngine,
  BioreactorParameters,
  PredictionInput,
  FidelityLevel
} from '@messai/core'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      mode = 'basic', // 'basic' | 'enhanced'
      fidelity = 'basic', // For enhanced mode: 'basic' | 'intermediate' | 'advanced'
      bioreactorId,
      parameters,
      // For basic mode
      electrodeArea,
      microbeType,
      electrodeType,
      substrateType,
      // Common parameters (mapped differently for each mode)
      temperature,
      ph,
      flowRate,
      mixingSpeed,
      electrodeVoltage,
      substrateConcentration,
      pressure,
      oxygenLevel,
      salinity
    } = body

    if (mode === 'basic') {
      // Use basic prediction model
      if (!electrodeArea || !microbeType || !electrodeType || !substrateType) {
        return NextResponse.json({
          error: 'Missing required parameters for basic prediction'
        }, { status: 400 })
      }

      const powerOutput = calculatePower({
        electrodeArea,
        microbeType,
        temperature: temperature || 30,
        ph: ph || 7,
        electrodeType,
        substrateType
      })

      return NextResponse.json({
        mode: 'basic',
        predictions: {
          powerOutput,
          powerDensity: powerOutput / electrodeArea,
          // Estimate other values based on simple correlations
          currentDensity: (powerOutput / electrodeArea) / 0.3, // Assume 0.3V
          efficiency: Math.min(powerOutput / (electrodeArea * 0.1) * 100, 80), // Simple efficiency estimate
          warnings: generateBasicWarnings({ temperature, ph, electrodeArea })
        }
      })
    } else if (mode === 'enhanced') {
      // Use enhanced prediction engine
      if (!bioreactorId || !parameters) {
        return NextResponse.json({
          error: 'Missing required parameters for enhanced prediction'
        }, { status: 400 })
      }

      // Map parameters to BioreactorParameters format
      const bioreactorParams: BioreactorParameters = {
        temperature: parameters.temperature || temperature || 30,
        ph: parameters.ph || ph || 7,
        flowRate: parameters.flowRate || flowRate || 100,
        mixingSpeed: parameters.mixingSpeed || mixingSpeed || 200,
        electrodeVoltage: parameters.electrodeVoltage || electrodeVoltage || 100,
        substrateConcentration: parameters.substrateConcentration || substrateConcentration || 2,
        pressure: parameters.pressure || pressure,
        oxygenLevel: parameters.oxygenLevel || oxygenLevel,
        salinity: parameters.salinity || salinity
      }

      const predictionInput: PredictionInput = {
        bioreactorId,
        parameters: bioreactorParams,
        fidelityLevel: fidelity as FidelityLevel
      }

      const prediction = await predictionEngine.predict(predictionInput)

      return NextResponse.json({
        mode: 'enhanced',
        fidelity,
        bioreactorId,
        predictions: prediction,
        metadata: {
          executionTime: prediction.executionTime,
          confidence: prediction.confidence,
          fidelityLevel: fidelity
        }
      })
    } else {
      return NextResponse.json({
        error: 'Invalid mode. Use "basic" or "enhanced"'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({
      error: 'Failed to generate predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return API documentation
  return NextResponse.json({
    name: 'Unified Prediction API',
    description: 'Unified API for both basic and enhanced MESS predictions',
    endpoints: {
      POST: {
        description: 'Generate predictions using basic or enhanced models',
        modes: {
          basic: {
            description: 'Simple power output calculation',
            requiredParams: ['electrodeArea', 'microbeType', 'electrodeType', 'substrateType'],
            optionalParams: ['temperature', 'ph'],
            returns: {
              powerOutput: 'Total power in mW',
              powerDensity: 'Power density in mW/m²',
              currentDensity: 'Estimated current density in mA/m²',
              efficiency: 'Estimated efficiency percentage',
              warnings: 'Array of warning messages'
            }
          },
          enhanced: {
            description: 'Advanced multi-fidelity predictions',
            requiredParams: ['bioreactorId', 'parameters'],
            fidelityLevels: {
              basic: 'Fast predictions with basic models',
              intermediate: 'Includes thermal and mass transfer effects',
              advanced: 'Full multi-physics simulation with optimization recommendations'
            },
            parameters: {
              temperature: 'Operating temperature in °C',
              ph: 'pH value',
              flowRate: 'Flow rate in L/h',
              mixingSpeed: 'Mixing speed in RPM',
              electrodeVoltage: 'Electrode voltage in mV',
              substrateConcentration: 'Substrate concentration in g/L',
              pressure: 'Optional pressure in bar',
              oxygenLevel: 'Optional oxygen level in %',
              salinity: 'Optional salinity in g/L'
            }
          }
        }
      }
    },
    examples: {
      basic: {
        mode: 'basic',
        electrodeArea: 0.05,
        microbeType: 'geobacter',
        electrodeType: 'carbon-cloth',
        substrateType: 'acetate',
        temperature: 35,
        ph: 7.2
      },
      enhanced: {
        mode: 'enhanced',
        fidelity: 'intermediate',
        bioreactorId: 'embr-001',
        parameters: {
          temperature: 35,
          ph: 7.2,
          flowRate: 25,
          mixingSpeed: 150,
          electrodeVoltage: 100,
          substrateConcentration: 2.0
        }
      }
    }
  })
}

function generateBasicWarnings(params: {
  temperature?: number
  ph?: number
  electrodeArea?: number
}): string[] {
  const warnings: string[] = []
  
  if (params.temperature && (params.temperature < 20 || params.temperature > 40)) {
    warnings.push(`Temperature ${params.temperature}°C is outside optimal range (20-40°C)`)
  }
  
  if (params.ph && (params.ph < 6 || params.ph > 8)) {
    warnings.push(`pH ${params.ph} is outside optimal range (6-8)`)
  }
  
  if (params.electrodeArea && params.electrodeArea < 0.01) {
    warnings.push('Very small electrode area may limit power output')
  }
  
  if (params.electrodeArea && params.electrodeArea > 1) {
    warnings.push('Large electrode area may face mass transfer limitations')
  }
  
  return warnings
}