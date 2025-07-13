import { NextRequest, NextResponse } from 'next/server'
import { 
  multiScaleModels, 
  advancedMaterials, 
  bacterialSpecies,
  progressiveValidation,
  calculatePerformance,
  type ModelStage,
  type ModelParameters
} from '@/lib/multi-scale-catalog'

interface RouteParams {
  params: {
    stage: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { stage } = params
  const { searchParams } = new URL(request.url)
  const detail = searchParams.get('detail')
  
  try {
    // Validate stage
    if (!stage || !multiScaleModels[stage as ModelStage]) {
      return NextResponse.json({
        success: false,
        error: `Invalid or unsupported stage: ${stage}`
      }, { status: 404 })
    }
    
    const modelStage = stage as ModelStage
    const model = multiScaleModels[modelStage]
    
    switch (detail) {
      case 'full':
        // Return complete model data with all related information
        return NextResponse.json({
          success: true,
          data: {
            model,
            materials: advancedMaterials,
            bacteria: bacterialSpecies,
            validation: progressiveValidation[modelStage],
            stage: modelStage
          },
          message: `Complete data for ${stage} model retrieved successfully`
        })
      
      case 'materials':
        // Return materials suitable for this stage
        const suitableMaterials = advancedMaterials.filter(material => {
          // Filter materials based on stage requirements
          switch (modelStage) {
            case 'micro-scale':
              return material.cost.value <= 1000 && material.availability !== 'low'
            case 'voltaic-pile':
              return material.durability >= 80
            case 'bench-scale':
              return material.biocompatibility >= 70
            case 'industrial':
              return material.cost.value <= 500 && material.availability === 'high'
            default:
              return true
          }
        })
        
        return NextResponse.json({
          success: true,
          data: suitableMaterials,
          message: `Suitable materials for ${stage} retrieved successfully`
        })
      
      case 'bacteria':
        // Return bacteria suitable for this stage
        const suitableBacteria = bacterialSpecies.filter(bacteria => {
          const tempRange = model.parameterRanges.temperature
          const pHRange = model.parameterRanges.pH
          
          return bacteria.optimalTemperature.min <= tempRange.max &&
                 bacteria.optimalTemperature.max >= tempRange.min &&
                 bacteria.optimalPH.min <= pHRange.max &&
                 bacteria.optimalPH.max >= pHRange.min
        })
        
        return NextResponse.json({
          success: true,
          data: suitableBacteria,
          message: `Suitable bacteria for ${stage} retrieved successfully`
        })
      
      case 'validation':
        return NextResponse.json({
          success: true,
          data: progressiveValidation[modelStage],
          message: `Validation criteria for ${stage} retrieved successfully`
        })
      
      case 'parameters':
        return NextResponse.json({
          success: true,
          data: {
            ranges: model.parameterRanges,
            defaults: {
              temperature: (model.parameterRanges.temperature.min + model.parameterRanges.temperature.max) / 2,
              pH: (model.parameterRanges.pH.min + model.parameterRanges.pH.max) / 2,
              substrateConcentration: (model.parameterRanges.substrateConcentration.min + model.parameterRanges.substrateConcentration.max) / 2,
              flowRate: (model.parameterRanges.flowRate.min + model.parameterRanges.flowRate.max) / 2,
              biofilmThickness: (model.parameterRanges.biofilmThickness.min + model.parameterRanges.biofilmThickness.max) / 2,
              currentDensity: 0
            }
          },
          message: `Parameter ranges for ${stage} retrieved successfully`
        })
      
      default:
        // Return basic model information
        return NextResponse.json({
          success: true,
          data: model,
          message: `Model data for ${stage} retrieved successfully`
        })
    }
  } catch (error) {
    console.error(`Error in messai-models/${stage} GET:`, error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { stage } = params
  
  try {
    // Validate stage
    if (!stage || !multiScaleModels[stage as ModelStage]) {
      return NextResponse.json({
        success: false,
        error: `Invalid or unsupported stage: ${stage}`
      }, { status: 404 })
    }
    
    const body = await request.json()
    const { parameters, materials, bacteria, action } = body
    
    const modelStage = stage as ModelStage
    const model = multiScaleModels[modelStage]
    
    switch (action) {
      case 'simulate':
        if (!parameters) {
          return NextResponse.json({
            success: false,
            error: 'Parameters are required for simulation'
          }, { status: 400 })
        }
        
        // Validate parameters against model ranges
        const parameterRanges = model.parameterRanges
        const validationErrors: string[] = []
        
        // Check each parameter against its range
        Object.entries(parameters).forEach(([key, value]) => {
          if (key in parameterRanges) {
            const range = parameterRanges[key as keyof typeof parameterRanges]
            if (typeof value === 'number') {
              if (value < range.min || value > range.max) {
                validationErrors.push(
                  `${key} (${value}) must be between ${range.min} and ${range.max} ${range.unit || ''}`
                )
              }
            }
          }
        })
        
        if (validationErrors.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Parameter validation failed',
            details: validationErrors
          }, { status: 400 })
        }
        
        // Use provided materials and bacteria or defaults
        const selectedMaterials = materials || advancedMaterials.slice(0, 2)
        const selectedBacteria = bacteria || bacterialSpecies[0]
        
        // Calculate performance
        const performance = calculatePerformance(
          modelStage,
          parameters as ModelParameters,
          selectedMaterials,
          selectedBacteria
        )
        
        // Generate simulation results
        const simulationResults = {
          stage: modelStage,
          parameters,
          materials: selectedMaterials,
          bacteria: selectedBacteria,
          performance,
          timestamp: new Date().toISOString(),
          simulationId: `sim_${Date.now()}`,
          recommendations: generateRecommendations(performance, model)
        }
        
        return NextResponse.json({
          success: true,
          data: simulationResults,
          message: `Simulation for ${stage} completed successfully`
        })
      
      case 'optimize':
        if (!parameters) {
          return NextResponse.json({
            success: false,
            error: 'Base parameters are required for optimization'
          }, { status: 400 })
        }
        
        // Perform parameter optimization
        const optimizedParams = optimizeParameters(modelStage, parameters as ModelParameters)
        
        return NextResponse.json({
          success: true,
          data: {
            stage: modelStage,
            originalParameters: parameters,
            optimizedParameters: optimizedParams,
            improvement: calculateImprovement(
              calculatePerformance(modelStage, parameters as ModelParameters, advancedMaterials.slice(0, 2), bacterialSpecies[0]),
              calculatePerformance(modelStage, optimizedParams, advancedMaterials.slice(0, 2), bacterialSpecies[0])
            )
          },
          message: `Parameter optimization for ${stage} completed successfully`
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error in messai-models/${stage} POST:`, error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Helper functions
function generateRecommendations(performance: any, model: any): string[] {
  const recommendations: string[] = []
  
  if (performance.powerDensity < model.basePerformance.powerDensity.value * 0.8) {
    recommendations.push('Consider increasing substrate concentration or improving electrode materials')
  }
  
  if (performance.efficiency < model.basePerformance.efficiency * 0.8) {
    recommendations.push('Optimize pH and temperature for better bacterial performance')
  }
  
  if (performance.voltage < model.basePerformance.voltage.value * 0.8) {
    recommendations.push('Check electrode connectivity and consider higher conductivity materials')
  }
  
  return recommendations
}

function optimizeParameters(stage: ModelStage, baseParams: ModelParameters): ModelParameters {
  const model = multiScaleModels[stage]
  const ranges = model.parameterRanges
  
  // Simple optimization: adjust parameters toward optimal values
  return {
    temperature: Math.min(ranges.temperature.max, baseParams.temperature + 2),
    pH: Math.min(ranges.pH.max, Math.max(ranges.pH.min, 7.0)), // Optimize toward neutral
    substrateConcentration: Math.min(ranges.substrateConcentration.max, baseParams.substrateConcentration * 1.2),
    flowRate: Math.min(ranges.flowRate.max, baseParams.flowRate * 1.1),
    biofilmThickness: Math.min(ranges.biofilmThickness.max, baseParams.biofilmThickness * 1.5),
    currentDensity: baseParams.currentDensity
  }
}

function calculateImprovement(original: any, optimized: any): { powerDensity: number; efficiency: number; voltage: number } {
  return {
    powerDensity: ((optimized.powerDensity - original.powerDensity) / original.powerDensity) * 100,
    efficiency: ((optimized.efficiency - original.efficiency) / original.efficiency) * 100,
    voltage: ((optimized.voltage - original.voltage) / original.voltage) * 100
  }
}