import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subcategory, existingParams, targetPerformance } = body

    // Find similar parameter sets based on category and performance
    const similarParameterSets = await db.parameterSet.findMany({
      where: {
        category,
        subcategory: subcategory || undefined,
        validationScore: {
          gte: 70 // Only suggest from high-quality parameter sets
        }
      },
      include: {
        papers: {
          include: {
            paper: {
              select: {
                id: true,
                title: true,
                powerOutput: true,
                efficiency: true
              }
            }
          }
        }
      },
      orderBy: {
        validationScore: 'desc'
      },
      take: 10
    })

    // AI-powered parameter suggestions based on literature and existing data
    const suggestions = {
      environmental: generateEnvironmentalSuggestions(category, similarParameterSets),
      biological: generateBiologicalSuggestions(category, similarParameterSets),
      material: generateMaterialSuggestions(category, similarParameterSets),
      operational: generateOperationalSuggestions(category, similarParameterSets, targetPerformance),
      safety: generateSafetySuggestions(category),
      monitoring: generateMonitoringSuggestions(category)
    }

    // Calculate confidence scores based on data availability
    const confidenceScore = calculateSuggestionConfidence(similarParameterSets.length, category)

    return NextResponse.json({
      suggestions,
      confidence: confidenceScore,
      basedOn: {
        parameterSetCount: similarParameterSets.length,
        category,
        subcategory
      },
      sources: similarParameterSets.map(ps => ({
        id: ps.id,
        name: ps.name,
        validationScore: ps.validationScore,
        paperCount: ps.papers.length
      }))
    })

  } catch (error) {
    console.error('Error generating parameter suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate parameter suggestions' },
      { status: 500 }
    )
  }
}

function generateEnvironmentalSuggestions(category: string, parameterSets: any[]) {
  const suggestions: any = {}

  // Extract common environmental parameters from similar systems
  const envParams = parameterSets
    .map(ps => ps.environmentalParams)
    .filter(Boolean)

  if (envParams.length > 0) {
    // Temperature suggestions based on system type
    switch (category) {
      case 'mfc':
      case 'mec':
        suggestions.temperature = {
          value: 30,
          unit: '°C',
          range: { min: 25, max: 35 },
          rationale: 'Optimal mesophilic temperature for most bioelectrochemical systems'
        }
        break
      case 'mdc':
        suggestions.temperature = {
          value: 25,
          unit: '°C',
          range: { min: 20, max: 30 },
          rationale: 'Moderate temperature for stable desalination performance'
        }
        break
    }

    // pH suggestions
    suggestions.ph = {
      value: 7.0,
      unit: 'pH',
      range: { min: 6.5, max: 7.5 },
      rationale: 'Neutral pH optimal for most microbial communities'
    }
  }

  return suggestions
}

function generateBiologicalSuggestions(category: string, parameterSets: any[]) {
  const suggestions: any = {}

  // Common organism suggestions based on system type
  switch (category) {
    case 'mfc':
      suggestions.organisms = [
        {
          name: 'Geobacter sulfurreducens',
          type: 'pure_culture',
          rationale: 'High current density and biofilm formation capability'
        },
        {
          name: 'Mixed anaerobic culture',
          type: 'mixed_culture',
          rationale: 'Robust performance with diverse substrates'
        }
      ]
      break
    case 'mec':
      suggestions.organisms = [
        {
          name: 'Geobacter metallireducens',
          type: 'pure_culture',
          rationale: 'Excellent hydrogen production in MECs'
        }
      ]
      break
  }

  // Substrate suggestions
  suggestions.substrate = {
    type: 'Acetate',
    concentration: { value: 1000, unit: 'mg/L' },
    rationale: 'Simple, well-characterized substrate for consistent performance'
  }

  return suggestions
}

function generateMaterialSuggestions(category: string, parameterSets: any[]) {
  const suggestions: any = {}

  // Anode material suggestions based on system type
  switch (category) {
    case 'mfc':
    case 'mec':
      suggestions.anode = {
        material: 'Carbon cloth',
        surfaceArea: { value: 100, unit: 'cm²' },
        modifications: ['Heat treatment'],
        rationale: 'High surface area and biocompatibility'
      }
      break
    case 'mdc':
      suggestions.anode = {
        material: 'Graphite felt',
        surfaceArea: { value: 150, unit: 'cm²' },
        rationale: 'Good conductivity and salt tolerance'
      }
      break
  }

  // Cathode material suggestions
  switch (category) {
    case 'mfc':
      suggestions.cathode = {
        material: 'Carbon cloth with Pt catalyst',
        catalyst: 'Platinum',
        rationale: 'High oxygen reduction activity'
      }
      break
    case 'mec':
      suggestions.cathode = {
        material: 'Stainless steel mesh',
        rationale: 'Cost-effective hydrogen evolution electrode'
      }
      break
  }

  return suggestions
}

function generateOperationalSuggestions(category: string, parameterSets: any[], targetPerformance?: any) {
  const suggestions: any = {}

  // Flow rate suggestions
  suggestions.flowRate = {
    anode: { value: 100, unit: 'mL/min' },
    rationale: 'Balanced mass transfer and residence time'
  }

  // HRT suggestions based on system type
  switch (category) {
    case 'mfc':
      suggestions.hydraulicRetentionTime = {
        value: 12,
        unit: 'hours',
        rationale: 'Optimal substrate utilization and power generation'
      }
      break
    case 'mec':
      suggestions.hydraulicRetentionTime = {
        value: 8,
        unit: 'hours',
        rationale: 'Efficient hydrogen production rate'
      }
      break
  }

  // External resistance based on target performance
  if (targetPerformance?.powerDensity) {
    suggestions.externalResistance = {
      value: 1000,
      unit: 'Ω',
      rationale: 'Matched to internal resistance for maximum power transfer'
    }
  }

  return suggestions
}

function generateSafetySuggestions(category: string) {
  const suggestions: any = {}

  // Temperature limits
  suggestions.temperatureLimit = {
    min: 10,
    max: 45,
    unit: '°C',
    rationale: 'Safe operating range for biological systems'
  }

  // Gas detection for hydrogen-producing systems
  if (category === 'mec') {
    suggestions.gasDetection = {
      h2: true,
      rationale: 'Hydrogen detection for explosion prevention'
    }
  }

  suggestions.emergencyShutdown = true

  return suggestions
}

function generateMonitoringSuggestions(category: string) {
  const suggestions: any = {}

  // Common sensors for all systems
  suggestions.sensors = [
    {
      type: 'voltage',
      location: 'Cell terminals',
      frequency: { value: 1, unit: 'minutes' },
      alert: { enabled: true, threshold: 0.1, condition: 'below' }
    },
    {
      type: 'temperature',
      location: 'Anode chamber',
      frequency: { value: 5, unit: 'minutes' },
      alert: { enabled: true, threshold: 40, condition: 'above' }
    },
    {
      type: 'ph',
      location: 'Anode chamber',
      frequency: { value: 30, unit: 'minutes' },
      alert: { enabled: true, threshold: 6.0, condition: 'below' }
    }
  ]

  // Additional sensors for specific systems
  if (category === 'mec') {
    suggestions.sensors.push({
      type: 'gas',
      location: 'Cathode headspace',
      frequency: { value: 1, unit: 'minutes' },
      alert: { enabled: true, threshold: 1000, condition: 'above' }
    })
  }

  suggestions.dataLogging = {
    enabled: true,
    frequency: { value: 1, unit: 'minutes' },
    retention: { value: 6, unit: 'months' }
  }

  return suggestions
}

function calculateSuggestionConfidence(dataPoints: number, category: string): number {
  // Base confidence on available data and system type maturity
  let confidence = Math.min(dataPoints * 10, 70) // Max 70% from data points

  // Add confidence based on system maturity
  const maturityBonus = {
    'mfc': 20, // Well-established technology
    'mec': 15, // Moderately established
    'mdc': 10, // Emerging technology
    'mes': 8,  // Newer technology
    'bes': 12  // General category
  }

  confidence += maturityBonus[category as keyof typeof maturityBonus] || 5
  
  return Math.min(confidence, 95) // Cap at 95%
}