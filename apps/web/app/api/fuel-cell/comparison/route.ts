import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FuelCellModelingEngine, FuelCellPredictionInput } from '@/lib/fuel-cell-predictions'
import { FuelCellType } from '@/lib/types/fuel-cell-types'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const FuelCellTypeSchema = z.enum([FuelCellType.PEM, FuelCellType.SOFC, FuelCellType.PAFC, FuelCellType.MCFC, FuelCellType.AFC])

const SystemConfigurationSchema = z.object({
  id: z.string(),
  name: z.string(),
  fuelCellType: FuelCellTypeSchema,
  cellCount: z.number().min(1).max(1000),
  activeArea: z.number().min(0.1).max(10000),
  operatingTemperature: z.number().min(-273).max(2000),
  operatingPressure: z.number().min(0.1).max(100),
  humidity: z.number().min(0).max(100),
  fuelFlowRate: z.number().min(0.01).max(1000),
  airFlowRate: z.number().min(0.01).max(10000),
  anodeCatalyst: z.string().optional(),
  cathodeCatalyst: z.string().optional(),
  membraneType: z.string().optional()
})

const ComparisonRequestSchema = z.object({
  systems: z.array(SystemConfigurationSchema).min(2).max(10),
  modelFidelity: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional().default('INTERMEDIATE'),
  includeOptimization: z.boolean().optional().default(false),
  includeSensitivity: z.boolean().optional().default(false)
})

// ============================================================================
// INTERFACES
// ============================================================================

interface ComparisonResult {
  systemId: string
  systemName: string
  prediction: any
  metrics: {
    power: number
    efficiency: number
    powerDensity: number
    voltage: number
    current: number
    fuelUtilization: number
    cost: number
    durability: number
    co2Emissions: number
    waterProduction: number
  }
  rank: {
    power: number
    efficiency: number
    cost: number
    durability: number
    overall: number
  }
  optimization?: {
    potentialImprovement: number
    optimizedPower: number
    optimizedEfficiency: number
  }
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = ComparisonRequestSchema.parse(body)
    
    // Process each system
    const results: ComparisonResult[] = []
    
    for (const system of validatedInput.systems) {
      // Create prediction input
      const predictionInput: FuelCellPredictionInput = {
        fuelCellType: system.fuelCellType,
        cellCount: system.cellCount,
        activeArea: system.activeArea,
        operatingTemperature: system.operatingTemperature,
        operatingPressure: system.operatingPressure,
        humidity: system.humidity,
        fuelFlowRate: system.fuelFlowRate,
        airFlowRate: system.airFlowRate,
        anodeCatalyst: system.anodeCatalyst,
        cathodeCatalyst: system.cathodeCatalyst,
        membraneType: system.membraneType,
        modelFidelity: validatedInput.modelFidelity
      }
      
      // Get prediction
      const prediction = await FuelCellModelingEngine.getPrediction(predictionInput)
      
      // Calculate additional metrics
      const cost = calculateSystemCost(system)
      const durability = estimateDurability(system)
      const co2Emissions = calculateCO2Emissions(system, prediction.predictedPower)
      const waterProduction = calculateWaterProduction(system, prediction.current)
      
      // Prepare result
      const result: ComparisonResult = {
        systemId: system.id,
        systemName: system.name,
        prediction,
        metrics: {
          power: prediction.predictedPower,
          efficiency: prediction.efficiency,
          powerDensity: prediction.powerDensity,
          voltage: prediction.voltage,
          current: prediction.current,
          fuelUtilization: prediction.fuelUtilization,
          cost,
          durability,
          co2Emissions,
          waterProduction
        },
        rank: { power: 0, efficiency: 0, cost: 0, durability: 0, overall: 0 }
      }
      
      // Add optimization potential if requested
      if (validatedInput.includeOptimization) {
        result.optimization = await calculateOptimizationPotential(system)
      }
      
      results.push(result)
    }
    
    // Calculate rankings
    const rankedResults = calculateRankings(results)
    
    // Add metadata
    const response = {
      success: true,
      data: {
        results: rankedResults,
        summary: {
          bestPower: rankedResults.find(r => r.rank.power === 1),
          bestEfficiency: rankedResults.find(r => r.rank.efficiency === 1),
          bestCost: rankedResults.find(r => r.rank.cost === 1),
          bestOverall: rankedResults.find(r => r.rank.overall === 1)
        },
        metadata: {
          comparisonId: generateComparisonId(),
          timestamp: new Date().toISOString(),
          systemCount: validatedInput.systems.length,
          modelFidelity: validatedInput.modelFidelity,
          processingTime: Date.now() - startTime
        }
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Fuel cell comparison API error:', error)

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

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : 'Comparison failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return comparison capabilities
    const response = {
      success: true,
      data: {
        supportedFuelCellTypes: Object.values(FuelCellType),
        supportedMetrics: [
          { id: 'power', label: 'Power Output', unit: 'W', description: 'Total electrical power generated' },
          { id: 'efficiency', label: 'Efficiency', unit: '%', description: 'Overall system efficiency' },
          { id: 'powerDensity', label: 'Power Density', unit: 'W/cm²', description: 'Power per unit area' },
          { id: 'cost', label: 'System Cost', unit: '$', description: 'Estimated total system cost' },
          { id: 'durability', label: 'Expected Lifetime', unit: 'hours', description: 'Projected operational lifetime' },
          { id: 'co2Emissions', label: 'CO₂ Emissions', unit: 'g/kWh', description: 'Carbon dioxide emissions per kWh' },
          { id: 'waterProduction', label: 'Water Production', unit: 'L/h', description: 'Water produced per hour' }
        ],
        modelFidelityOptions: [
          { id: 'BASIC', label: 'Basic', description: 'Fast calculations with simplified models' },
          { id: 'INTERMEDIATE', label: 'Intermediate', description: 'Balanced accuracy and speed' },
          { id: 'ADVANCED', label: 'Advanced', description: 'High accuracy with detailed physics' }
        ],
        limits: {
          minSystems: 2,
          maxSystems: 10,
          maxCellCount: 1000,
          maxActiveArea: 10000
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Comparison capabilities API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve capabilities'
    }, { status: 500 })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateRankings(results: ComparisonResult[]): ComparisonResult[] {
  // Sort by each metric and assign ranks
  const metrics = ['power', 'efficiency', 'cost', 'durability'] as const
  const rankings: Record<string, number[]> = {}
  
  for (const metric of metrics) {
    const sorted = [...results].sort((a, b) => {
      const aValue = a.metrics[metric]
      const bValue = b.metrics[metric]
      // Lower cost is better, higher for others
      return metric === 'cost' ? aValue - bValue : bValue - aValue
    })
    
    rankings[metric] = results.map(result => 
      sorted.findIndex(r => r.systemId === result.systemId) + 1
    )
  }
  
  // Calculate overall rank (average of individual ranks)
  return results.map((result, index) => ({
    ...result,
    rank: {
      power: rankings.power[index],
      efficiency: rankings.efficiency[index],
      cost: rankings.cost[index],
      durability: rankings.durability[index],
      overall: Math.round(
        (rankings.power[index] + rankings.efficiency[index] + 
         rankings.cost[index] + rankings.durability[index]) / 4
      )
    }
  }))
}

function calculateSystemCost(system: any): number {
  const baseCost = 1000
  const cellCost = 50 * system.cellCount
  const areaCost = 10 * system.activeArea
  
  // Material costs
  const catalystCosts: Record<string, number> = {
    'pt-c': 100,
    'pt-alloy': 80,
    'non-pgm': 20,
    'ni-based': 10
  }
  
  const membraneCosts: Record<string, number> = {
    'nafion': 50,
    'pfsa': 40,
    'hydrocarbon': 30,
    'ceramic': 60
  }
  
  const anodeCost = (system.anodeCatalyst ? catalystCosts[system.anodeCatalyst] || 50 : 50) * system.activeArea
  const cathodeCost = (system.cathodeCatalyst ? catalystCosts[system.cathodeCatalyst] || 50 : 50) * system.activeArea
  const membraneCost = (system.membraneType ? membraneCosts[system.membraneType] || 40 : 40) * system.activeArea
  
  // Operating condition adjustments
  let costMultiplier = 1
  if (system.operatingPressure > 5) costMultiplier *= 1.2 // High pressure systems cost more
  if (system.operatingTemperature > 500) costMultiplier *= 1.3 // High temperature systems cost more
  
  return (baseCost + cellCost + areaCost + anodeCost + cathodeCost + membraneCost) * costMultiplier
}

function estimateDurability(system: any): number {
  let baseDurability = 40000 // hours
  
  // Fuel cell type factors
  const durabilityFactors: Record<string, number> = {
    PEM: 1.0,
    SOFC: 1.5,
    PAFC: 0.8,
    MCFC: 0.9,
    AFC: 0.7
  }
  
  baseDurability *= durabilityFactors[system.fuelCellType]
  
  // Temperature effects
  if (system.fuelCellType === 'PEM') {
    if (system.operatingTemperature > 80) baseDurability *= 0.9
    if (system.operatingTemperature < 60) baseDurability *= 0.95
  }
  
  // Pressure effects
  if (system.operatingPressure > 5) baseDurability *= 0.95
  
  // Material effects
  if (system.membraneType === 'hydrocarbon') baseDurability *= 0.8
  if (system.anodeCatalyst === 'non-pgm') baseDurability *= 0.85
  
  return baseDurability
}

function calculateCO2Emissions(system: any, power: number): number {
  // CO2 emissions in g/kWh
  // Assuming hydrogen production method
  let baseEmissions = 0 // For green hydrogen
  
  if (system.fuelCellType === 'MCFC' || system.fuelCellType === 'SOFC') {
    // These can use natural gas directly
    baseEmissions = 50 // g/kWh for natural gas reforming
  }
  
  // Efficiency adjustment
  const efficiencyFactor = 0.5 / (system.efficiency || 0.5)
  
  return baseEmissions * efficiencyFactor
}

function calculateWaterProduction(system: any, current: number): number {
  // Water production rate in L/h
  // Based on electrochemical reaction: 2H2 + O2 -> 2H2O
  
  const faradayConstant = 96485 // C/mol
  const waterMolarMass = 18.015 // g/mol
  const waterDensity = 1000 // g/L
  
  // Moles of water produced per second
  const molesPerSecond = current / (2 * faradayConstant)
  
  // Mass of water per hour
  const massPerHour = molesPerSecond * waterMolarMass * 3600
  
  // Volume of water per hour
  return massPerHour / waterDensity
}

async function calculateOptimizationPotential(system: any): Promise<any> {
  // Simplified optimization potential calculation
  // In practice, this would run actual optimization
  
  const currentPower = system.power || 0
  const currentEfficiency = system.efficiency || 0
  
  // Estimate potential improvements based on system type and current performance
  let powerImprovement = 0.1 // 10% default
  let efficiencyImprovement = 0.05 // 5% default
  
  // Adjust based on how far from optimal conditions
  if (system.fuelCellType === 'PEM') {
    if (system.operatingTemperature < 70 || system.operatingTemperature > 85) {
      powerImprovement += 0.05
      efficiencyImprovement += 0.03
    }
    if (system.operatingPressure < 2 || system.operatingPressure > 4) {
      powerImprovement += 0.03
      efficiencyImprovement += 0.02
    }
  }
  
  return {
    potentialImprovement: Math.round((powerImprovement + efficiencyImprovement) / 2 * 100),
    optimizedPower: currentPower * (1 + powerImprovement),
    optimizedEfficiency: currentEfficiency * (1 + efficiencyImprovement)
  }
}

function generateComparisonId(): string {
  return `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}