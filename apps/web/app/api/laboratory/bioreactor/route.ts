import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const systemType = searchParams.get('systemType') || 'MFC'
    const scale = searchParams.get('scale') || 'laboratory'
    const anodeMaterial = searchParams.get('anodeMaterial') || 'carbonCloth'
    const cathodeMaterial = searchParams.get('cathodeMaterial') || 'stainlessSteel'

    // Get bioreactor configuration
    const configuration = await getBioreactorConfiguration({
      systemType,
      scale,
      anodeMaterial,
      cathodeMaterial
    })

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error fetching bioreactor configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bioreactor configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { systemType, scale, anodeMaterial, cathodeMaterial, operatingConditions } = body

    // Validate required fields
    if (!systemType || !scale || !anodeMaterial || !cathodeMaterial) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Calculate performance based on configuration
    const performance = await calculateBioreactorPerformance({
      systemType,
      scale,
      anodeMaterial,
      cathodeMaterial,
      operatingConditions
    })

    return NextResponse.json({
      configuration: body,
      performance,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error calculating bioreactor performance:', error)
    return NextResponse.json(
      { error: 'Failed to calculate performance' },
      { status: 500 }
    )
  }
}

// Helper functions for bioreactor calculations
async function getBioreactorConfiguration(params: {
  systemType: string
  scale: string
  anodeMaterial: string
  cathodeMaterial: string
}) {
  const { systemType, scale, anodeMaterial, cathodeMaterial } = params

  // Define scale-specific parameters
  const scaleParameters = {
    laboratory: {
      volume: { min: 0.001, max: 1, unit: 'L' }, // 1mL to 1L
      power: { min: 0.1, max: 50, unit: 'mW/m²' },
      cost: { base: 500, unit: 'USD' }
    },
    pilot: {
      volume: { min: 10, max: 1000, unit: 'L' },
      power: { min: 1, max: 100, unit: 'mW/m²' },
      cost: { base: 5000, unit: 'USD' }
    },
    industrial: {
      volume: { min: 1000, max: 100000, unit: 'L' },
      power: { min: 5, max: 200, unit: 'mW/m²' },
      cost: { base: 50000, unit: 'USD' }
    }
  }

  // Define material properties
  const materialProperties = {
    carbonCloth: {
      conductivity: 'High',
      surface_area: 'High',
      cost_factor: 1.0,
      performance_factor: 1.0
    },
    graphiteFelt: {
      conductivity: 'Medium',
      surface_area: 'Very High',
      cost_factor: 1.2,
      performance_factor: 1.1
    },
    carbonNanotube: {
      conductivity: 'Very High',
      surface_area: 'Very High',
      cost_factor: 3.0,
      performance_factor: 1.5
    },
    mxeneTi3C2Tx: {
      conductivity: 'Ultra High',
      surface_area: 'Ultra High',
      cost_factor: 5.0,
      performance_factor: 1.8
    },
    stainlessSteel: {
      conductivity: 'High',
      surface_area: 'Low',
      cost_factor: 0.8,
      performance_factor: 0.9
    },
    copper: {
      conductivity: 'Very High',
      surface_area: 'Low',
      cost_factor: 0.6,
      performance_factor: 0.8
    },
    platinum: {
      conductivity: 'Ultra High',
      surface_area: 'Medium',
      cost_factor: 10.0,
      performance_factor: 1.5
    }
  }

  const scaleParams = scaleParameters[scale as keyof typeof scaleParameters]
  const anodeProps = materialProperties[anodeMaterial as keyof typeof materialProperties]
  const cathodeProps = materialProperties[cathodeMaterial as keyof typeof materialProperties]

  return {
    systemType,
    scale,
    anodeMaterial,
    cathodeMaterial,
    scaleParameters: scaleParams,
    anodeProperties: anodeProps,
    cathodeProperties: cathodeProps,
    designOptions: {
      chamberConfiguration: systemType === 'MDC' ? 'Three-chamber' : 'Two-chamber',
      membraneRequired: systemType === 'MEC' || systemType === 'MDC',
      flowPattern: scale === 'laboratory' ? 'Batch' : 'Continuous',
      monitoring: {
        voltage: true,
        current: true,
        pH: true,
        temperature: true,
        COD: systemType === 'MFC',
        productGas: systemType === 'MEC'
      }
    }
  }
}

async function calculateBioreactorPerformance(params: {
  systemType: string
  scale: string
  anodeMaterial: string
  cathodeMaterial: string
  operatingConditions?: any
}) {
  const { systemType, scale, anodeMaterial, cathodeMaterial, operatingConditions } = params

  // Base performance values by system type
  const basePerformance = {
    MFC: { powerOutput: 25, efficiency: 65, energyRecovery: 15 },
    MEC: { hydrogenProduction: 0.8, efficiency: 85, energyInput: 0.6 },
    MDC: { desalinationRate: 75, efficiency: 70, energyConsumption: 0.4 },
    MES: { productionRate: 0.5, efficiency: 60, energyConsumption: 0.8 }
  }

  // Scale factors
  const scaleFactors = {
    laboratory: 1.0,
    pilot: 1.2,
    industrial: 1.5
  }

  // Material performance factors
  const materialFactors = {
    carbonCloth: 1.0,
    graphiteFelt: 1.1,
    carbonNanotube: 1.5,
    mxeneTi3C2Tx: 1.8,
    stainlessSteel: 0.9,
    copper: 0.8,
    platinum: 1.5
  }

  // Cost calculation factors
  const costFactors = {
    carbonCloth: 1.0,
    graphiteFelt: 1.2,
    carbonNanotube: 3.0,
    mxeneTi3C2Tx: 5.0,
    stainlessSteel: 0.8,
    copper: 0.6,
    platinum: 10.0
  }

  const base = basePerformance[systemType as keyof typeof basePerformance]
  const scaleFactor = scaleFactors[scale as keyof typeof scaleFactors]
  const anodeFactor = materialFactors[anodeMaterial as keyof typeof materialFactors]
  const cathodeFactor = materialFactors[cathodeMaterial as keyof typeof materialFactors]

  // Calculate performance metrics
  const performance = {
    powerOutput: systemType === 'MFC' ? 
      Math.round(base.powerOutput * scaleFactor * anodeFactor * cathodeFactor * 10) / 10 : null,
    hydrogenProduction: systemType === 'MEC' ? 
      Math.round(base.hydrogenProduction * scaleFactor * anodeFactor * cathodeFactor * 100) / 100 : null,
    desalinationRate: systemType === 'MDC' ? 
      Math.round(base.desalinationRate * scaleFactor * anodeFactor * cathodeFactor) : null,
    productionRate: systemType === 'MES' ? 
      Math.round(base.productionRate * scaleFactor * anodeFactor * cathodeFactor * 100) / 100 : null,
    efficiency: Math.round(base.efficiency * anodeFactor * cathodeFactor),
    costEstimate: {
      materials: calculateMaterialCost(scale, anodeMaterial, cathodeMaterial, costFactors),
      fabrication: calculateFabricationCost(scale),
      installation: calculateInstallationCost(scale),
      total: 0
    },
    operatingConditions: {
      temperature: operatingConditions?.temperature || 25,
      pH: operatingConditions?.pH || 7.0,
      flowRate: operatingConditions?.flowRate || calculateOptimalFlowRate(scale),
      residence_time: operatingConditions?.residence_time || calculateResidenceTime(scale)
    }
  }

  // Calculate total cost
  const costs = performance.costEstimate
  costs.total = costs.materials + costs.fabrication + costs.installation

  return performance
}

function calculateMaterialCost(scale: string, anodeMaterial: string, cathodeMaterial: string, costFactors: any): number {
  const baseCosts = {
    laboratory: 200,
    pilot: 2000,
    industrial: 20000
  }
  
  const baseCost = baseCosts[scale as keyof typeof baseCosts]
  const anodeCostFactor = costFactors[anodeMaterial]
  const cathodeCostFactor = costFactors[cathodeMaterial]
  
  return Math.round(baseCost * (anodeCostFactor + cathodeCostFactor) / 2)
}

function calculateFabricationCost(scale: string): number {
  const costs = {
    laboratory: 300,
    pilot: 3000,
    industrial: 30000
  }
  return costs[scale as keyof typeof costs]
}

function calculateInstallationCost(scale: string): number {
  const costs = {
    laboratory: 0,
    pilot: 2000,
    industrial: 20000
  }
  return costs[scale as keyof typeof costs]
}

function calculateOptimalFlowRate(scale: string): number {
  const flowRates = {
    laboratory: 0.1, // mL/min
    pilot: 10, // L/min
    industrial: 1000 // L/min
  }
  return flowRates[scale as keyof typeof flowRates]
}

function calculateResidenceTime(scale: string): number {
  const times = {
    laboratory: 24, // hours
    pilot: 12, // hours
    industrial: 8 // hours
  }
  return times[scale as keyof typeof times]
}