import { NextRequest, NextResponse } from 'next/server'
import { 
  multiScaleModels, 
  advancedMaterials, 
  bacterialSpecies,
  progressiveValidation,
  calculatePerformance,
  getAllStages,
  type ModelStage,
  type ModelParameters
} from '@/lib/multi-scale-catalog'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage') as ModelStage
  const action = searchParams.get('action')
  
  try {
    switch (action) {
      case 'stages':
        return NextResponse.json({
          success: true,
          data: getAllStages(),
          message: 'Available model stages retrieved successfully'
        })
      
      case 'model':
        if (!stage) {
          return NextResponse.json({
            success: false,
            error: 'Stage parameter is required for model data'
          }, { status: 400 })
        }
        
        const model = multiScaleModels[stage]
        if (!model) {
          return NextResponse.json({
            success: false,
            error: `Model not found for stage: ${stage}`
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: true,
          data: model,
          message: `Model data for ${stage} retrieved successfully`
        })
      
      case 'materials':
        return NextResponse.json({
          success: true,
          data: advancedMaterials,
          message: 'Advanced materials database retrieved successfully'
        })
      
      case 'bacteria':
        return NextResponse.json({
          success: true,
          data: bacterialSpecies,
          message: 'Bacterial species database retrieved successfully'
        })
      
      case 'validation':
        if (!stage) {
          return NextResponse.json({
            success: false,
            error: 'Stage parameter is required for validation criteria'
          }, { status: 400 })
        }
        
        const validation = progressiveValidation[stage]
        if (!validation) {
          return NextResponse.json({
            success: false,
            error: `Validation criteria not found for stage: ${stage}`
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: true,
          data: validation,
          message: `Validation criteria for ${stage} retrieved successfully`
        })
      
      case 'catalog':
      default:
        return NextResponse.json({
          success: true,
          data: {
            models: multiScaleModels,
            materials: advancedMaterials,
            bacteria: bacterialSpecies,
            validation: progressiveValidation
          },
          message: 'Complete multi-scale catalog retrieved successfully'
        })
    }
  } catch (error) {
    console.error('Error in messai-models API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stage, parameters, materials, bacteria, action } = body
    
    if (!stage || !parameters) {
      return NextResponse.json({
        success: false,
        error: 'Stage and parameters are required'
      }, { status: 400 })
    }
    
    switch (action) {
      case 'calculate':
        // Validate parameters
        const model = multiScaleModels[stage as ModelStage]
        if (!model) {
          return NextResponse.json({
            success: false,
            error: `Invalid stage: ${stage}`
          }, { status: 400 })
        }
        
        // Validate parameter ranges
        const parameterRanges = model.parameterRanges
        const validationErrors: string[] = []
        
        if (parameters.temperature < parameterRanges.temperature.min || 
            parameters.temperature > parameterRanges.temperature.max) {
          validationErrors.push(`Temperature must be between ${parameterRanges.temperature.min} and ${parameterRanges.temperature.max}°C`)
        }
        
        if (parameters.pH < parameterRanges.pH.min || 
            parameters.pH > parameterRanges.pH.max) {
          validationErrors.push(`pH must be between ${parameterRanges.pH.min} and ${parameterRanges.pH.max}`)
        }
        
        if (parameters.substrateConcentration < parameterRanges.substrateConcentration.min || 
            parameters.substrateConcentration > parameterRanges.substrateConcentration.max) {
          validationErrors.push(`Substrate concentration must be between ${parameterRanges.substrateConcentration.min} and ${parameterRanges.substrateConcentration.max} g/L`)
        }
        
        if (parameters.flowRate < parameterRanges.flowRate.min || 
            parameters.flowRate > parameterRanges.flowRate.max) {
          validationErrors.push(`Flow rate must be between ${parameterRanges.flowRate.min} and ${parameterRanges.flowRate.max} ${parameterRanges.flowRate.unit}`)
        }
        
        if (parameters.biofilmThickness < parameterRanges.biofilmThickness.min || 
            parameters.biofilmThickness > parameterRanges.biofilmThickness.max) {
          validationErrors.push(`Biofilm thickness must be between ${parameterRanges.biofilmThickness.min} and ${parameterRanges.biofilmThickness.max} μm`)
        }
        
        if (validationErrors.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Parameter validation failed',
            details: validationErrors
          }, { status: 400 })
        }
        
        // Use provided materials or defaults
        const selectedMaterials = materials || advancedMaterials.slice(0, 2)
        const selectedBacteria = bacteria || bacterialSpecies[0]
        
        // Calculate performance
        const performance = calculatePerformance(
          stage as ModelStage,
          parameters as ModelParameters,
          selectedMaterials,
          selectedBacteria
        )
        
        // Check against validation criteria
        const validationCriteria = progressiveValidation[stage as ModelStage]
        const validationResults = {
          powerDensity: performance.powerDensity >= validationCriteria.requirements.powerDensity.min,
          efficiency: performance.efficiency >= validationCriteria.requirements.efficiency.min,
          meetsCriteria: performance.powerDensity >= validationCriteria.requirements.powerDensity.min &&
                         performance.efficiency >= validationCriteria.requirements.efficiency.min
        }
        
        return NextResponse.json({
          success: true,
          data: {
            performance,
            validation: validationResults,
            stage,
            parameters,
            materials: selectedMaterials,
            bacteria: selectedBacteria
          },
          message: 'Performance calculation completed successfully'
        })
      
      case 'validate':
        // Validate against progressive validation criteria
        const validationCriteria = progressiveValidation[stage as ModelStage]
        if (!validationCriteria) {
          return NextResponse.json({
            success: false,
            error: `Validation criteria not found for stage: ${stage}`
          }, { status: 404 })
        }
        
        const results = {
          stage,
          criteria: validationCriteria.requirements,
          riskFactors: validationCriteria.riskFactors,
          mitigation: validationCriteria.mitigationStrategies,
          recommendations: []
        }
        
        return NextResponse.json({
          success: true,
          data: results,
          message: 'Validation analysis completed successfully'
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in messai-models POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { stage, updates } = body
    
    if (!stage) {
      return NextResponse.json({
        success: false,
        error: 'Stage parameter is required'
      }, { status: 400 })
    }
    
    // In a real implementation, this would update the model configuration
    // For now, we'll just return the updated configuration
    return NextResponse.json({
      success: true,
      data: {
        stage,
        updates,
        message: 'Model configuration updated successfully'
      },
      message: 'Configuration update completed'
    })
  } catch (error) {
    console.error('Error in messai-models PUT:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}