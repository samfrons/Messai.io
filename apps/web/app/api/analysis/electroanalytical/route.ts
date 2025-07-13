import { NextRequest, NextResponse } from 'next/server'
import { 
  electroanalyticalCatalog,
  getTechniqueById,
  getTechniquesByCategory,
  getTechniquesByApplication
} from '@messai/core'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const category = searchParams.get('category')
  const application = searchParams.get('application')

  try {
    if (id) {
      // Get specific technique
      const technique = getTechniqueById(id)
      if (!technique) {
        return NextResponse.json({
          error: 'Technique not found'
        }, { status: 404 })
      }
      return NextResponse.json(technique)
    } else if (category) {
      // Filter by category
      const techniques = getTechniquesByCategory(category)
      return NextResponse.json({
        category,
        count: techniques.length,
        techniques
      })
    } else if (application) {
      // Filter by application
      const techniques = getTechniquesByApplication(application)
      return NextResponse.json({
        application,
        count: techniques.length,
        techniques
      })
    } else {
      // Return all techniques
      return NextResponse.json({
        count: electroanalyticalCatalog.length,
        techniques: electroanalyticalCatalog,
        categories: ['voltammetry', 'impedance', 'chronometric', 'pulse'],
        applications: [
          'Biofilm characterization',
          'Electron transfer kinetics',
          'Redox potential determination',
          'Electrode surface analysis',
          'Mass transport analysis'
        ]
      })
    }
  } catch (error) {
    console.error('Electroanalytical API error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve electroanalytical techniques',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { techniqueId, parameters, simulateData = false } = body

    if (!techniqueId) {
      return NextResponse.json({
        error: 'techniqueId is required'
      }, { status: 400 })
    }

    const technique = getTechniqueById(techniqueId)
    if (!technique) {
      return NextResponse.json({
        error: 'Technique not found'
      }, { status: 404 })
    }

    // Validate parameters
    const validationErrors: string[] = []
    const validatedParams: Record<string, number> = {}

    for (const [paramName, paramConfig] of Object.entries(technique.parameters)) {
      const value = parameters?.[paramName]
      
      if (value === undefined) {
        // Use default value
        validatedParams[paramName] = paramConfig.default
      } else if (typeof value !== 'number') {
        validationErrors.push(`${paramName} must be a number`)
      } else if (value < paramConfig.min || value > paramConfig.max) {
        validationErrors.push(`${paramName} must be between ${paramConfig.min} and ${paramConfig.max}`)
      } else {
        validatedParams[paramName] = value
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Parameter validation failed',
        errors: validationErrors
      }, { status: 400 })
    }

    // Prepare response
    const response: any = {
      technique: {
        id: technique.id,
        name: technique.name,
        category: technique.category
      },
      parameters: validatedParams,
      expectedDuration: technique.timeRange.typical,
      dataTypes: technique.dataTypes
    }

    // Simulate data if requested
    if (simulateData) {
      response.simulatedData = simulateElectroanalyticalData(technique, validatedParams)
    }

    // Add analysis recommendations
    response.recommendations = generateRecommendations(technique, validatedParams)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Electroanalytical analysis error:', error)
    return NextResponse.json({
      error: 'Failed to perform electroanalytical analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function simulateElectroanalyticalData(technique: any, params: Record<string, number>) {
  const data: any = {
    technique: technique.id,
    timestamp: new Date().toISOString()
  }

  switch (technique.id) {
    case 'cv':
      // Simulate cyclic voltammetry data
      const points = 100
      const voltageRange = params.endPotential - params.startPotential
      data.potential = []
      data.current = []
      
      for (let i = 0; i < points; i++) {
        const v = params.startPotential + (i / points) * voltageRange
        data.potential.push(v)
        // Simple capacitive + faradaic current simulation
        const capacitiveCurrent = 0.1 * params.scanRate
        const faradaicCurrent = 0.5 * Math.exp(-Math.pow(v - 0.2, 2) / 0.1)
        data.current.push(capacitiveCurrent + faradaicCurrent + (Math.random() - 0.5) * 0.05)
      }
      break

    case 'eis':
      // Simulate impedance data
      const decades = Math.log10(params.startFrequency / params.endFrequency)
      const pointsPerDecade = params.pointsPerDecade
      const totalPoints = Math.ceil(decades * pointsPerDecade)
      
      data.frequency = []
      data.impedanceReal = []
      data.impedanceImaginary = []
      data.phase = []
      
      for (let i = 0; i < totalPoints; i++) {
        const logFreq = Math.log10(params.endFrequency) + (i / totalPoints) * decades
        const freq = Math.pow(10, logFreq)
        data.frequency.push(freq)
        
        // Simple Randles circuit simulation
        const Rs = 10 // Solution resistance
        const Rct = 100 // Charge transfer resistance
        const Cdl = 1e-6 // Double layer capacitance
        const omega = 2 * Math.PI * freq
        
        const Z_real = Rs + Rct / (1 + Math.pow(omega * Rct * Cdl, 2))
        const Z_imag = -omega * Rct * Rct * Cdl / (1 + Math.pow(omega * Rct * Cdl, 2))
        
        data.impedanceReal.push(Z_real + (Math.random() - 0.5) * 2)
        data.impedanceImaginary.push(Z_imag + (Math.random() - 0.5) * 2)
        data.phase.push(Math.atan2(Z_imag, Z_real) * 180 / Math.PI)
      }
      break

    case 'ca':
      // Simulate chronoamperometry data
      const timePoints = Math.ceil(params.stepDuration * params.samplingRate)
      data.time = []
      data.current = []
      
      for (let i = 0; i < timePoints; i++) {
        const t = i / params.samplingRate
        data.time.push(t)
        // Cottrell equation simulation
        const i0 = 0.5 // Initial current
        const current = i0 / Math.sqrt(t + 0.1) + (Math.random() - 0.5) * 0.02
        data.current.push(current)
      }
      break
  }

  return data
}

function generateRecommendations(technique: any, params: Record<string, number>) {
  const recommendations: string[] = []

  switch (technique.id) {
    case 'cv':
      if (params.scanRate > 1.0) {
        recommendations.push('High scan rate may lead to increased capacitive currents')
      }
      if (params.scanRate < 0.01) {
        recommendations.push('Low scan rate provides better resolution of redox peaks')
      }
      if (params.numberOfScans > 10) {
        recommendations.push('Multiple scans can help identify electrode stability')
      }
      break

    case 'eis':
      if (params.acAmplitude > 0.05) {
        recommendations.push('Large AC amplitude may cause non-linear responses')
      }
      if (params.pointsPerDecade < 10) {
        recommendations.push('Consider increasing points per decade for better resolution')
      }
      const frequencyRange = Math.log10(params.startFrequency / params.endFrequency)
      if (frequencyRange < 3) {
        recommendations.push('Wider frequency range recommended for complete characterization')
      }
      break

    case 'ca':
      if (params.stepDuration < 60) {
        recommendations.push('Longer duration may be needed to reach steady state')
      }
      if (params.samplingRate < 1) {
        recommendations.push('Higher sampling rate recommended for initial transient')
      }
      break

    case 'dpv':
    case 'swv':
      if (technique.id === 'dpv' && params.pulseAmplitude > 0.08) {
        recommendations.push('Large pulse amplitude may broaden peaks')
      }
      if (technique.id === 'swv' && params.frequency > 100) {
        recommendations.push('High frequency may affect sensitivity')
      }
      break
  }

  // General recommendations
  recommendations.push(`Expected measurement time: ${technique.timeRange.typical} seconds`)
  recommendations.push(`Technique sensitivity level: ${technique.sensitivity}/10`)
  recommendations.push(`Complexity level: ${technique.complexity}/10`)

  return recommendations
}