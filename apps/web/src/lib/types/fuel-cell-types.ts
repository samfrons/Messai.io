// Fuel Cell Type Definitions
export type FuelCellType = 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'

export type ModelFidelity = 'low' | 'medium' | 'high' | 'ultra'

// Enum-like objects for API route validation
export const FuelCellTypeEnum = {
  PEM: 'PEM' as const,
  SOFC: 'SOFC' as const,
  PAFC: 'PAFC' as const,
  MCFC: 'MCFC' as const,
  AFC: 'AFC' as const
} as const

export const ModelFidelityEnum = {
  BASIC: 'low' as const,
  INTERMEDIATE: 'medium' as const,
  ADVANCED: 'high' as const,
  ULTRA: 'ultra' as const
} as const

export interface FuelCellConfiguration {
  id?: string
  name?: string
  type: FuelCellType
  cellCount: number
  activeArea: number // cm²
  operatingTemperature: number // °C
  operatingPressure: number // atm
  humidity: number // %
  fuelFlowRate: number // L/min
  airFlowRate: number // L/min
  currentDensity?: number // mA/cm²
  voltage?: number // V
  timestamp?: Date
}

export interface FuelCellPerformanceMetrics {
  powerOutput: number // W
  efficiency: number // %
  voltage: number // V
  current: number // A
  powerDensity: number // mW/cm²
  fuelUtilization: number // %
  heatProduction: number // W
  operatingCost: number // $/kWh
}

export interface OptimizationObjective {
  type: 'maximize_power' | 'maximize_efficiency' | 'minimize_cost' | 'custom'
  weights?: {
    power?: number
    efficiency?: number
    cost?: number
    durability?: number
  }
  constraints?: {
    minPower?: number
    maxTemperature?: number
    maxPressure?: number
    maxCost?: number
  }
}

export interface OptimizationResult {
  originalConfiguration: FuelCellConfiguration
  optimizedConfiguration: FuelCellConfiguration
  originalPerformance: FuelCellPerformanceMetrics
  optimizedPerformance: FuelCellPerformanceMetrics
  improvementMetrics: {
    powerImprovement: number // %
    efficiencyImprovement: number // %
    costChange: number // %
  }
  optimizationSteps: OptimizationStep[]
  convergenceData: ConvergenceData
}

export interface OptimizationStep {
  iteration: number
  parameters: Partial<FuelCellConfiguration>
  performance: FuelCellPerformanceMetrics
  objectiveValue: number
  improvement: number
}

export interface ConvergenceData {
  iterations: number
  finalObjectiveValue: number
  convergenceThreshold: number
  executionTime: number // ms
  algorithm: string
}

export interface ControlSystemParameters {
  type: 'PID' | 'MPC' | 'fuzzy' | 'adaptive'
  setpoints: {
    voltage?: number
    power?: number
    temperature?: number
    pressure?: number
  }
  tuning: {
    kp?: number // Proportional gain
    ki?: number // Integral gain
    kd?: number // Derivative gain
    sampleTime?: number // ms
  }
  constraints: {
    maxVoltage: number
    maxCurrent: number
    maxTemperature: number
    maxPressure: number
  }
}

export interface SimulationParameters {
  duration: number // seconds
  timeStep: number // seconds
  disturbances?: {
    loadChanges?: Array<{ time: number; value: number }>
    temperatureVariations?: Array<{ time: number; value: number }>
    pressureVariations?: Array<{ time: number; value: number }>
  }
  initialConditions: {
    temperature: number
    pressure: number
    voltage: number
    current: number
  }
}

export interface SimulationResult {
  timeData: number[]
  voltageData: number[]
  currentData: number[]
  powerData: number[]
  temperatureData: number[]
  pressureData: number[]
  efficiencyData: number[]
  controlSignals: {
    time: number[]
    fuelFlow: number[]
    airFlow: number[]
    coolingRate: number[]
  }
  performance: {
    averagePower: number
    averageEfficiency: number
    stabilityIndex: number
    responseTime: number
  }
}

export interface ComparisonAnalysis {
  configurations: FuelCellConfiguration[]
  performances: FuelCellPerformanceMetrics[]
  rankings: {
    byPower: number[]
    byEfficiency: number[]
    byCost: number[]
    overall: number[]
  }
  tradeoffAnalysis: {
    powerVsEfficiency: { r2: number; trend: 'positive' | 'negative' | 'neutral' }
    costVsPerformance: { r2: number; trend: 'positive' | 'negative' | 'neutral' }
    temperatureEffects: { r2: number; trend: 'positive' | 'negative' | 'neutral' }
  }
  recommendations: {
    bestOverall: number
    bestForPower: number
    bestForEfficiency: number
    bestValueForMoney: number
    warnings: string[]
    suggestions: string[]
  }
}

export interface FuelCellValidationError {
  field: keyof FuelCellConfiguration
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestedValue?: number | string
}

export interface FuelCellSpecifications {
  type: FuelCellType
  operatingRanges: {
    temperature: { min: number; max: number; optimal: number }
    pressure: { min: number; max: number; optimal: number }
    humidity: { min: number; max: number; optimal: number }
    currentDensity: { min: number; max: number; optimal: number }
  }
  materials: {
    anode: string[]
    cathode: string[]
    electrolyte: string[]
    membrane?: string[]
  }
  performance: {
    maxPowerDensity: number // mW/cm²
    typicalEfficiency: number // %
    maxEfficiency: number // %
    durability: number // hours
    startupTime: number // seconds
  }
  costs: {
    capitalCost: number // $/kW
    operatingCost: number // $/kWh
    maintenanceCost: number // $/year
  }
}

// Predefined fuel cell specifications
export const fuelCellSpecs: Record<FuelCellType, FuelCellSpecifications> = {
  PEM: {
    type: 'PEM',
    operatingRanges: {
      temperature: { min: 60, max: 80, optimal: 70 },
      pressure: { min: 1, max: 3, optimal: 1.5 },
      humidity: { min: 70, max: 100, optimal: 90 },
      currentDensity: { min: 100, max: 2000, optimal: 800 }
    },
    materials: {
      anode: ['Pt/C catalyst', 'Carbon support'],
      cathode: ['Pt/C catalyst', 'Carbon support'],
      electrolyte: ['Nafion membrane'],
      membrane: ['Proton exchange membrane']
    },
    performance: {
      maxPowerDensity: 1000,
      typicalEfficiency: 50,
      maxEfficiency: 60,
      durability: 5000,
      startupTime: 30
    },
    costs: {
      capitalCost: 3000,
      operatingCost: 0.05,
      maintenanceCost: 500
    }
  },
  SOFC: {
    type: 'SOFC',
    operatingRanges: {
      temperature: { min: 800, max: 1000, optimal: 850 },
      pressure: { min: 1, max: 1.5, optimal: 1.1 },
      humidity: { min: 0, max: 20, optimal: 10 },
      currentDensity: { min: 200, max: 1000, optimal: 500 }
    },
    materials: {
      anode: ['Ni-YSZ cermet'],
      cathode: ['LSM-YSZ', 'LSCF'],
      electrolyte: ['YSZ', 'GDC']
    },
    performance: {
      maxPowerDensity: 800,
      typicalEfficiency: 65,
      maxEfficiency: 85,
      durability: 40000,
      startupTime: 3600
    },
    costs: {
      capitalCost: 4000,
      operatingCost: 0.03,
      maintenanceCost: 800
    }
  },
  PAFC: {
    type: 'PAFC',
    operatingRanges: {
      temperature: { min: 180, max: 220, optimal: 200 },
      pressure: { min: 1, max: 8, optimal: 3 },
      humidity: { min: 40, max: 80, optimal: 60 },
      currentDensity: { min: 150, max: 500, optimal: 300 }
    },
    materials: {
      anode: ['Pt catalyst', 'Carbon support'],
      cathode: ['Pt catalyst', 'Carbon support'],
      electrolyte: ['Phosphoric acid']
    },
    performance: {
      maxPowerDensity: 300,
      typicalEfficiency: 45,
      maxEfficiency: 55,
      durability: 60000,
      startupTime: 1800
    },
    costs: {
      capitalCost: 2500,
      operatingCost: 0.04,
      maintenanceCost: 600
    }
  },
  MCFC: {
    type: 'MCFC',
    operatingRanges: {
      temperature: { min: 600, max: 700, optimal: 650 },
      pressure: { min: 1, max: 3, optimal: 1.5 },
      humidity: { min: 10, max: 40, optimal: 25 },
      currentDensity: { min: 100, max: 300, optimal: 200 }
    },
    materials: {
      anode: ['Ni-based alloy'],
      cathode: ['NiO-based'],
      electrolyte: ['Molten carbonate']
    },
    performance: {
      maxPowerDensity: 200,
      typicalEfficiency: 55,
      maxEfficiency: 65,
      durability: 50000,
      startupTime: 7200
    },
    costs: {
      capitalCost: 3500,
      operatingCost: 0.035,
      maintenanceCost: 700
    }
  },
  AFC: {
    type: 'AFC',
    operatingRanges: {
      temperature: { min: 70, max: 100, optimal: 80 },
      pressure: { min: 1, max: 4, optimal: 2 },
      humidity: { min: 80, max: 100, optimal: 95 },
      currentDensity: { min: 200, max: 800, optimal: 400 }
    },
    materials: {
      anode: ['Ni or Ag catalyst'],
      cathode: ['Ag or Pt catalyst'],
      electrolyte: ['KOH solution']
    },
    performance: {
      maxPowerDensity: 400,
      typicalEfficiency: 60,
      maxEfficiency: 70,
      durability: 8000,
      startupTime: 60
    },
    costs: {
      capitalCost: 2000,
      operatingCost: 0.045,
      maintenanceCost: 400
    }
  }
}