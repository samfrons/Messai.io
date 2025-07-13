import { NextRequest, NextResponse } from 'next/server'
import { predictPerformance, validateConfiguration } from '@/reference/validation/validation-functions'
import { getDemoConfig } from '@/lib/demo-mode'

// Performance prediction endpoint
export async function POST(request: NextRequest) {
  try {
    const demoConfig = getDemoConfig()
    
    const body = await request.json()
    const { configuration } = body

    if (!configuration) {
      return NextResponse.json(
        { error: 'Configuration object is required' },
        { status: 400 }
      )
    }

    // Validate configuration first
    const validationResult = validateConfiguration(configuration)

    // Generate performance prediction
    const prediction = predictPerformance(configuration)

    // Add system-specific enhancements based on research
    const enhancedPrediction = enhancePerformancePrediction(configuration, prediction)

    // In demo mode, add educational annotations
    const response = {
      prediction: enhancedPrediction,
      validation: validationResult,
      configuration,
      metadata: {
        timestamp: new Date().toISOString(),
        modelVersion: '1.0.0',
        confidence: prediction.confidence,
        ...(demoConfig.isDemo && {
          demoMode: true,
          educationalNote: 'Predictions based on literature data and validated models'
        })
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Performance prediction error:', error)
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    )
  }
}

// Enhanced performance prediction with system-specific factors
function enhancePerformancePrediction(configuration: any, basePrediction: any) {
  let enhancedPrediction = { ...basePrediction }

  // System-specific adjustments
  switch (configuration.systemType) {
    case 'MFC':
      enhancedPrediction = applyMFCEnhancements(configuration, enhancedPrediction)
      break
    case 'MEC':
      enhancedPrediction = applyMECEnhancements(configuration, enhancedPrediction)
      break
    case 'MDC':
      enhancedPrediction = applyMDCEnhancements(configuration, enhancedPrediction)
      break
    case 'MES':
      enhancedPrediction = applyMESEnhancements(configuration, enhancedPrediction)
      break
  }

  // Add operational metrics
  enhancedPrediction.operationalMetrics = calculateOperationalMetrics(configuration, enhancedPrediction)

  // Add economic indicators
  enhancedPrediction.economics = calculateEconomicIndicators(configuration, enhancedPrediction)

  return enhancedPrediction
}

function applyMFCEnhancements(config: any, prediction: any) {
  const enhanced = { ...prediction }

  // Air cathode vs. aqueous cathode adjustment
  if (config.cathodeMaterial === 'air_cathode') {
    enhanced.powerDensity *= 0.8  // Air cathodes typically have lower performance
    enhanced.efficiency *= 0.9
    enhanced.operationalAdvantages = ['No catholyte required', 'Simplified design', 'Lower operating costs']
  }

  // High-performance anode materials
  if (config.anodeMaterial === 'mxene_ti3c2tx') {
    enhanced.powerDensity *= 1.5  // MXene enhancement factor
    enhanced.confidence *= 0.8    // Lower confidence due to limited long-term data
    enhanced.materialNotes = ['Cutting-edge performance', 'Limited commercial availability', 'Higher cost']
  }

  return enhanced
}

function applyMECEnhancements(config: any, prediction: any) {
  const enhanced = { ...prediction }

  // Hydrogen production specifics
  enhanced.hydrogenProduction = {
    rate: enhanced.powerDensity * 0.1, // L/m²·day approximation
    purity: config.cathodeMaterial === 'platinum' ? 95 : 85, // % purity
    energy_efficiency: enhanced.efficiency * 0.8 // MEC energy efficiency
  }

  // Applied voltage effects
  if (config.voltage) {
    const voltageEffect = Math.min(config.voltage / 0.8, 1.5) // Optimal around 0.8V
    enhanced.hydrogenProduction.rate *= voltageEffect
    enhanced.powerDensity *= voltageEffect
  }

  return enhanced
}

function applyMDCEnhancements(config: any, prediction: any) {
  const enhanced = { ...prediction }

  // Desalination specifics
  enhanced.desalination = {
    salt_removal_efficiency: enhanced.efficiency * 0.7, // % salt removal
    water_recovery: 85, // % water recovery
    energy_consumption: 2.0 / enhanced.efficiency, // kWh/m³
    membrane_requirements: ['AEM', 'CEM', 'Regular replacement needed']
  }

  return enhanced
}

function applyMESEnhancements(config: any, prediction: any) {
  const enhanced = { ...prediction }

  // Electrosynthesis specifics
  enhanced.electrosynthesis = {
    product_formation_rate: enhanced.powerDensity * 0.05, // g/L·day approximation
    faradaic_efficiency: enhanced.efficiency * 0.6, // Product selectivity
    energy_efficiency: enhanced.efficiency * 0.5, // Lower than MFC due to applied potential
    potential_products: ['Acetate', 'Butyrate', 'Ethanol', 'Methane']
  }

  return enhanced
}

function calculateOperationalMetrics(config: any, prediction: any) {
  return {
    startup_time: {
      biofilm_development: '7-21 days',
      stable_performance: '21-30 days',
      factors: ['Temperature', 'Inoculum quality', 'Substrate type']
    },
    maintenance: {
      electrode_cleaning: 'Monthly',
      membrane_replacement: config.systemType === 'MDC' ? '6-12 months' : 'Not applicable',
      performance_monitoring: 'Daily',
      expected_lifetime: '2-5 years'
    },
    stability: {
      performance_variation: '<±10%',
      recommended_monitoring: ['Power output', 'pH', 'Temperature', 'Flow rate'],
      common_issues: ['Biofilm overgrowth', 'Membrane fouling', 'pH drift']
    }
  }
}

function calculateEconomicIndicators(config: any, prediction: any) {
  // Simplified economic analysis
  const materialCosts = {
    carbon_cloth: 50,      // $/m²
    mxene_ti3c2tx: 500,    // $/m²
    platinum: 2000,        // $/m²
    air_cathode: 100,      // $/m²
    stainless_steel: 20    // $/m²
  }

  const anodeCost = materialCosts[config.anodeMaterial] || 100
  const cathodeCost = materialCosts[config.cathodeMaterial] || 100

  return {
    material_costs: {
      anode: `$${anodeCost}/m²`,
      cathode: `$${cathodeCost}/m²`,
      total_electrode_cost: `$${anodeCost + cathodeCost}/m²`
    },
    operational_costs: {
      energy_consumption: config.systemType === 'MEC' ? 'Medium' : 'Low',
      maintenance_frequency: 'Monthly',
      replacement_cycle: '2-5 years'
    },
    revenue_potential: {
      electricity: config.systemType === 'MFC' ? `$${(prediction.powerDensity * 0.1).toFixed(2)}/m²·year` : 'N/A',
      hydrogen: config.systemType === 'MEC' ? 'Medium potential' : 'N/A',
      water_treatment: 'Variable by application',
      chemical_products: config.systemType === 'MES' ? 'High potential' : 'N/A'
    },
    payback_estimates: {
      simple_payback: '3-7 years',
      factors: ['Application type', 'Scale', 'Local energy/product prices'],
      note: 'Estimates based on current technology and market conditions'
    }
  }
}

// Get available prediction models and parameters
export async function GET(request: NextRequest) {
  try {
    const demoConfig = getDemoConfig()

    return NextResponse.json({
      models: {
        primary: {
          name: 'MESS Performance Predictor',
          version: '1.0.0',
          description: 'Literature-based performance prediction for microbial electrochemical systems',
          supported_systems: ['MFC', 'MEC', 'MDC', 'MES']
        }
      },
      required_parameters: {
        basic: ['systemType', 'anodeMaterial', 'cathodeMaterial'],
        optional: ['temperature', 'ph', 'substrateConcentration', 'microorganism', 'voltage']
      },
      output_metrics: {
        electrical: ['powerDensity', 'efficiency', 'confidence'],
        system_specific: {
          MFC: ['operationalAdvantages'],
          MEC: ['hydrogenProduction'],
          MDC: ['desalination'],
          MES: ['electrosynthesis']
        },
        operational: ['startup_time', 'maintenance', 'stability'],
        economic: ['material_costs', 'operational_costs', 'revenue_potential']
      },
      ...(demoConfig.isDemo && {
        demo_mode: true,
        note: 'Educational predictions based on peer-reviewed research'
      }),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Prediction info error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve prediction information' },
      { status: 500 }
    )
  }
}