import { ModelFidelity, FuelCellType } from './types/fuel-cell-types'

// ============================================================================
// FUEL CELL PREDICTION INTERFACES
// ============================================================================

export interface FuelCellPredictionInput {
  // System configuration
  fuelCellType: FuelCellType
  cellCount: number
  activeArea: number // cm²
  
  // Operating conditions
  operatingTemperature: number // °C
  operatingPressure: number // bar
  humidity: number // %
  
  // Gas flows
  fuelFlowRate: number // L/min
  airFlowRate: number // L/min
  
  // Materials
  anodeCatalyst?: string
  cathodeCatalyst?: string
  membraneType?: string
  
  // Model configuration
  modelFidelity: ModelFidelity
  
  // Optional advanced parameters
  stackVoltage?: number // V
  currentDensity?: number // A/cm²
}

export interface FuelCellPredictionResult {
  // Primary outputs
  predictedPower: number // W
  efficiency: number // %
  voltage: number // V
  current: number // A
  
  // Performance metrics
  powerDensity: number // W/cm²
  currentDensity: number // A/cm²
  fuelUtilization: number // %
  
  // Operating characteristics
  operatingPoint: {
    temperature: number
    pressure: number
    humidity: number
  }
  
  // Confidence metrics
  confidenceInterval: {
    lower: number
    upper: number
  }
  
  // Factor breakdown
  factors: {
    temperatureFactor: number
    pressureFactor: number
    humidityFactor: number
    fuelFlowFactor: number
    materialFactor: number
    designFactor: number
  }
  
  // Advanced results (for higher fidelity models)
  advanced?: {
    thermalProfile?: TemperatureDistribution
    gasComposition?: GasDistribution
    controllerRecommendations?: ControllerSettings
    optimizationSuggestions?: OptimizationSuggestion[]
  }
  
  // Model metadata
  modelInfo: {
    fidelity: ModelFidelity
    executionTime: number // ms
    lastUpdated: string
  }
}

export interface TemperatureDistribution {
  stackAverage: number // °C
  cellTemperatures: number[] // °C per cell
  hotSpots: Array<{
    location: string
    temperature: number
  }>
  coolingRequirement: number // W
}

export interface GasDistribution {
  hydrogen: {
    inlet: number // %
    outlet: number // %
    utilization: number // %
  }
  oxygen: {
    inlet: number // %
    outlet: number // %
    utilization: number // %
  }
  nitrogen: {
    fraction: number // %
    purgeRequired: boolean
  }
  water: {
    production: number // mol/s
    vaporContent: number // %
  }
}

export interface ControllerSettings {
  thermal: {
    setpoint: number // °C
    pidParams: { kp: number; ki: number; kd: number }
  }
  pressure: {
    inletPressure: number // bar
    pressureRatio: number
  }
  humidity: {
    targetHumidity: number // %
    humidificationRate: number // g/min
  }
  purging: {
    threshold: number // nitrogen fraction
    interval: number // seconds
    duration: number // seconds
  }
}

export interface OptimizationSuggestion {
  parameter: string
  currentValue: number
  suggestedValue: number
  expectedImprovement: number // %
  confidence: number // 0-1
  rationale: string
}

// ============================================================================
// FUEL CELL MODELING ENGINE
// ============================================================================

export class FuelCellModelingEngine {
  // Fuel cell type specific parameters
  private static readonly FUEL_CELL_PARAMS = {
    PEM: {
      baseVoltage: 0.7, // V per cell
      optimalTemp: 80, // °C
      maxTemp: 90, // °C
      pressureBonus: 0.02, // V per bar above 1
      humidityOptimal: 100, // %
      efficiency: 0.50 // baseline efficiency
    },
    SOFC: {
      baseVoltage: 0.8,
      optimalTemp: 750,
      maxTemp: 1000,
      pressureBonus: 0.01,
      humidityOptimal: 0,
      efficiency: 0.60
    },
    PAFC: {
      baseVoltage: 0.75,
      optimalTemp: 200,
      maxTemp: 220,
      pressureBonus: 0.015,
      humidityOptimal: 85,
      efficiency: 0.45
    },
    MCFC: {
      baseVoltage: 0.85,
      optimalTemp: 650,
      maxTemp: 700,
      pressureBonus: 0.01,
      humidityOptimal: 0,
      efficiency: 0.55
    },
    AFC: {
      baseVoltage: 0.9,
      optimalTemp: 70,
      maxTemp: 90,
      pressureBonus: 0.025,
      humidityOptimal: 95,
      efficiency: 0.65
    }
  }

  // Material property database
  private static readonly MATERIAL_PROPERTIES = {
    catalysts: {
      'Pt/C': { activityFactor: 1.0, cost: 100 },
      'Pt-alloy': { activityFactor: 1.15, cost: 80 },
      'Non-PGM': { activityFactor: 0.7, cost: 20 },
      'Ni-based': { activityFactor: 0.6, cost: 10 }
    },
    membranes: {
      'Nafion': { conductivity: 1.0, cost: 50 },
      'PFSA': { conductivity: 0.9, cost: 40 },
      'Hydrocarbon': { conductivity: 0.8, cost: 30 },
      'Ceramic': { conductivity: 1.2, cost: 60 }
    }
  }

  public static async getPrediction(input: FuelCellPredictionInput): Promise<FuelCellPredictionResult> {
    const startTime = Date.now()

    try {
      // Route to appropriate fidelity model
      switch (input.modelFidelity) {
        case 'BASIC':
          return this.calculateBasicModel(input, startTime)
        case 'INTERMEDIATE':
          return this.calculateIntermediateModel(input, startTime)
        case 'ADVANCED':
          return this.calculateAdvancedModel(input, startTime)
        default:
          throw new Error(`Unsupported model fidelity: ${input.modelFidelity}`)
      }
    } catch (error) {
      console.error('Fuel cell prediction error:', error)
      // Fallback to basic model
      return this.calculateBasicModel(input, startTime)
    }
  }

  private static calculateBasicModel(
    input: FuelCellPredictionInput, 
    startTime: number
  ): FuelCellPredictionResult {
    const params = this.FUEL_CELL_PARAMS[input.fuelCellType]
    
    // Basic voltage calculation
    const temperatureFactor = this.calculateTemperatureFactor(input.operatingTemperature, params.optimalTemp, params.maxTemp)
    const pressureFactor = Math.max(0, (input.operatingPressure - 1) * params.pressureBonus)
    const humidityFactor = this.calculateHumidityFactor(input.humidity, params.humidityOptimal)
    const materialFactor = this.calculateMaterialFactor(input.anodeCatalyst, input.cathodeCatalyst, input.membraneType)
    
    const cellVoltage = params.baseVoltage + temperatureFactor + pressureFactor + humidityFactor + materialFactor
    const stackVoltage = Math.max(0, cellVoltage * input.cellCount)
    
    // Current calculation based on flow rates
    const currentDensity = this.calculateCurrentDensity(input.fuelFlowRate, input.airFlowRate, input.activeArea)
    const totalCurrent = currentDensity * input.activeArea
    
    // Power and efficiency
    const power = stackVoltage * totalCurrent
    const efficiency = params.efficiency * (temperatureFactor + 1) * (materialFactor + 1)
    
    const executionTime = Date.now() - startTime

    return {
      predictedPower: Math.round(power * 100) / 100,
      efficiency: Math.round(efficiency * 100 * 100) / 100,
      voltage: Math.round(stackVoltage * 100) / 100,
      current: Math.round(totalCurrent * 100) / 100,
      powerDensity: Math.round((power / input.activeArea) * 100) / 100,
      currentDensity: Math.round(currentDensity * 100) / 100,
      fuelUtilization: Math.min(95, Math.round((totalCurrent * 0.1) * 100) / 100),
      operatingPoint: {
        temperature: input.operatingTemperature,
        pressure: input.operatingPressure,
        humidity: input.humidity
      },
      confidenceInterval: {
        lower: Math.round(power * 0.85 * 100) / 100,
        upper: Math.round(power * 1.15 * 100) / 100
      },
      factors: {
        temperatureFactor: Math.round(temperatureFactor * 1000) / 1000,
        pressureFactor: Math.round(pressureFactor * 1000) / 1000,
        humidityFactor: Math.round(humidityFactor * 1000) / 1000,
        fuelFlowFactor: Math.round((input.fuelFlowRate / 10) * 1000) / 1000,
        materialFactor: Math.round(materialFactor * 1000) / 1000,
        designFactor: Math.round((input.cellCount / 50) * 1000) / 1000
      },
      modelInfo: {
        fidelity: 'BASIC',
        executionTime,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  private static calculateIntermediateModel(
    input: FuelCellPredictionInput, 
    startTime: number
  ): FuelCellPredictionResult {
    // Start with basic model
    const basicResult = this.calculateBasicModel(input, startTime)
    
    // Add intermediate complexity features
    const thermalProfile: TemperatureDistribution = {
      stackAverage: input.operatingTemperature,
      cellTemperatures: Array.from({ length: input.cellCount }, (_, i) => 
        input.operatingTemperature + (Math.random() - 0.5) * 5
      ),
      hotSpots: [
        { location: 'center', temperature: input.operatingTemperature + 3 },
        { location: 'inlet', temperature: input.operatingTemperature - 2 }
      ],
      coolingRequirement: basicResult.predictedPower * 0.4 // 40% waste heat
    }

    const gasComposition: GasDistribution = {
      hydrogen: {
        inlet: 99.9,
        outlet: 99.9 - basicResult.fuelUtilization,
        utilization: basicResult.fuelUtilization
      },
      oxygen: {
        inlet: 21,
        outlet: 21 - (basicResult.fuelUtilization * 0.5),
        utilization: basicResult.fuelUtilization * 0.5
      },
      nitrogen: {
        fraction: Math.min(50, input.operatingTemperature / 10), // Simplified nitrogen crossover
        purgeRequired: input.operatingTemperature > 60
      },
      water: {
        production: basicResult.current * 9.34e-6, // mol/s
        vaporContent: Math.min(100, input.humidity + 10)
      }
    }

    return {
      ...basicResult,
      advanced: {
        thermalProfile,
        gasComposition
      },
      modelInfo: {
        fidelity: 'INTERMEDIATE',
        executionTime: Date.now() - startTime,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  private static calculateAdvancedModel(
    input: FuelCellPredictionInput, 
    startTime: number
  ): FuelCellPredictionResult {
    // Start with intermediate model
    const intermediateResult = this.calculateIntermediateModel(input, startTime)
    
    // Add advanced control system recommendations
    const controllerRecommendations: ControllerSettings = {
      thermal: {
        setpoint: this.FUEL_CELL_PARAMS[input.fuelCellType].optimalTemp,
        pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 }
      },
      pressure: {
        inletPressure: input.operatingPressure,
        pressureRatio: 2.0
      },
      humidity: {
        targetHumidity: this.FUEL_CELL_PARAMS[input.fuelCellType].humidityOptimal,
        humidificationRate: intermediateResult.advanced!.gasComposition!.water.production * 18 // g/min
      },
      purging: {
        threshold: 0.5, // 50% nitrogen fraction
        interval: 300, // 5 minutes
        duration: 30 // 30 seconds
      }
    }

    // Generate optimization suggestions
    const optimizationSuggestions: OptimizationSuggestion[] = []
    
    const optimalTemp = this.FUEL_CELL_PARAMS[input.fuelCellType].optimalTemp
    if (Math.abs(input.operatingTemperature - optimalTemp) > 5) {
      optimizationSuggestions.push({
        parameter: 'operatingTemperature',
        currentValue: input.operatingTemperature,
        suggestedValue: optimalTemp,
        expectedImprovement: Math.abs(input.operatingTemperature - optimalTemp) * 0.5,
        confidence: 0.9,
        rationale: `Operating temperature should be closer to optimal ${optimalTemp}°C for this fuel cell type`
      })
    }

    if (input.operatingPressure < 2) {
      optimizationSuggestions.push({
        parameter: 'operatingPressure',
        currentValue: input.operatingPressure,
        suggestedValue: 2.5,
        expectedImprovement: 8,
        confidence: 0.8,
        rationale: 'Higher pressure improves performance and efficiency'
      })
    }

    return {
      ...intermediateResult,
      advanced: {
        ...intermediateResult.advanced!,
        controllerRecommendations,
        optimizationSuggestions
      },
      modelInfo: {
        fidelity: 'ADVANCED',
        executionTime: Date.now() - startTime,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Helper calculation methods
  private static calculateTemperatureFactor(temp: number, optimal: number, max: number): number {
    if (temp > max) return -0.5 // Severe penalty for overheating
    const deviation = Math.abs(temp - optimal)
    return Math.max(-0.2, -deviation / optimal * 0.3)
  }

  private static calculateHumidityFactor(humidity: number, optimal: number): number {
    if (optimal === 0) return 0 // High-temp fuel cells don't need humidity
    const deviation = Math.abs(humidity - optimal)
    return Math.max(-0.1, -deviation / 100 * 0.2)
  }

  private static calculateMaterialFactor(anode?: string, cathode?: string, membrane?: string): number {
    let factor = 0
    
    if (anode && this.MATERIAL_PROPERTIES.catalysts[anode as keyof typeof this.MATERIAL_PROPERTIES.catalysts]) {
      factor += (this.MATERIAL_PROPERTIES.catalysts[anode as keyof typeof this.MATERIAL_PROPERTIES.catalysts].activityFactor - 1) * 0.1
    }
    
    if (cathode && this.MATERIAL_PROPERTIES.catalysts[cathode as keyof typeof this.MATERIAL_PROPERTIES.catalysts]) {
      factor += (this.MATERIAL_PROPERTIES.catalysts[cathode as keyof typeof this.MATERIAL_PROPERTIES.catalysts].activityFactor - 1) * 0.1
    }
    
    if (membrane && this.MATERIAL_PROPERTIES.membranes[membrane as keyof typeof this.MATERIAL_PROPERTIES.membranes]) {
      factor += (this.MATERIAL_PROPERTIES.membranes[membrane as keyof typeof this.MATERIAL_PROPERTIES.membranes].conductivity - 1) * 0.05
    }
    
    return factor
  }

  private static calculateCurrentDensity(fuelFlow: number, airFlow: number, activeArea: number): number {
    // Simplified current density calculation based on flow rates
    // In practice, this would involve more complex electrochemical modeling
    const fuelFactor = Math.min(fuelFlow / 5, 1) // Normalize to reasonable range
    const airFactor = Math.min(airFlow / 20, 1) // Normalize to reasonable range
    return Math.min(fuelFactor, airFactor) * 1.0 // A/cm² max
  }
}

// ============================================================================
// UNIFIED PREDICTION API
// ============================================================================

export interface UnifiedPredictionInput {
  systemType: 'MICROBIAL' | 'FUEL_CELL'
  parameters: any // Will be cast to appropriate type
  modelFidelity?: ModelFidelity
}

export interface UnifiedPredictionResult {
  systemType: 'MICROBIAL' | 'FUEL_CELL'
  result: any // Will be cast to appropriate result type
  metadata: {
    modelFidelity: ModelFidelity
    executionTime: number
    timestamp: string
  }
}

export async function getUnifiedPrediction(input: UnifiedPredictionInput): Promise<UnifiedPredictionResult> {
  const startTime = Date.now()
  
  try {
    let result: any
    
    if (input.systemType === 'FUEL_CELL') {
      const fuelCellInput = input.parameters as FuelCellPredictionInput
      fuelCellInput.modelFidelity = input.modelFidelity || 'BASIC'
      result = await FuelCellModelingEngine.getPrediction(fuelCellInput)
    } else {
      // Import existing microbial predictions
      const { getPowerPrediction } = await import('./ai-predictions')
      result = await getPowerPrediction(input.parameters)
    }
    
    return {
      systemType: input.systemType,
      result,
      metadata: {
        modelFidelity: input.modelFidelity || 'BASIC',
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Unified prediction error:', error)
    throw new Error(`Failed to calculate ${input.systemType} prediction: ${error}`)
  }
}