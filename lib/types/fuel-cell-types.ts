// ============================================================================
// FUEL CELL SYSTEM TYPES
// ============================================================================
// These types replace Prisma enums which aren't supported in SQLite

export const SystemType = {
  MICROBIAL: 'MICROBIAL',
  FUEL_CELL: 'FUEL_CELL'
} as const

export type SystemType = typeof SystemType[keyof typeof SystemType]

export const FuelCellType = {
  PEM: 'PEM',     // Proton Exchange Membrane
  SOFC: 'SOFC',   // Solid Oxide Fuel Cell
  PAFC: 'PAFC',   // Phosphoric Acid Fuel Cell
  MCFC: 'MCFC',   // Molten Carbonate Fuel Cell
  AFC: 'AFC'      // Alkaline Fuel Cell
} as const

export type FuelCellType = typeof FuelCellType[keyof typeof FuelCellType]

export const ModelFidelity = {
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
} as const

export type ModelFidelity = typeof ModelFidelity[keyof typeof ModelFidelity]

export const MaterialCategory = {
  TRADITIONAL: 'TRADITIONAL',           // Carbon cloth, graphite, stainless steel
  GRAPHENE_BASED: 'GRAPHENE_BASED',     // GO, rGO, aerogel
  CARBON_NANOTUBES: 'CARBON_NANOTUBES', // SWCNT, MWCNT
  MXENES: 'MXENES',                     // Ti₃C₂Tₓ, V₂CTₓ
  UPCYCLED: 'UPCYCLED',                 // Reclaimed electronics
  FUEL_CELL_SPECIFIC: 'FUEL_CELL_SPECIFIC' // Fuel cell membranes, catalysts
} as const

export type MaterialCategory = typeof MaterialCategory[keyof typeof MaterialCategory]

// Type guards for runtime validation
export function isSystemType(value: string): value is SystemType {
  return Object.values(SystemType).includes(value as SystemType)
}

export function isFuelCellType(value: string): value is FuelCellType {
  return Object.values(FuelCellType).includes(value as FuelCellType)
}

export function isModelFidelity(value: string): value is ModelFidelity {
  return Object.values(ModelFidelity).includes(value as ModelFidelity)
}

export function isMaterialCategory(value: string): value is MaterialCategory {
  return Object.values(MaterialCategory).includes(value as MaterialCategory)
}

// ============================================================================
// FUEL CELL SYSTEM INTERFACES
// ============================================================================

export interface ElectrochemicalSystemData {
  id: string
  name: string
  type: SystemType
  userId: string
  description?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FuelCellStackData {
  id: string
  systemId: string
  name: string
  type: FuelCellType
  cellCount: number
  activeArea: number
  maxPower: number
  nominalVoltage: number
  operatingTemp: number
  operatingPressure: number
  efficiency?: number
  membraneType?: string
  anodeCatalyst?: string
  cathodeCatalyst?: string
  createdAt: Date
  updatedAt: Date
}

export interface FuelCellExperimentData {
  id: string
  name: string
  stackId: string
  userId: string
  status: string
  modelFidelity: ModelFidelity
  parameters: string // JSON
  notes?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FuelCellMeasurementData {
  id: string
  experimentId: string
  timestamp: Date
  voltage: number
  current: number
  power: number
  efficiency?: number
  temperature: number
  pressure: number
  humidity?: number
  fuelFlowRate?: number
  airFlowRate?: number
  oxygenUtilization?: number
  fuelUtilization?: number
  hydrogenPurity?: number
  nitrogenFraction?: number
  waterVaporContent?: number
  powerDensity?: number
  currentDensity?: number
  notes?: string
}

export interface ControlSystemDataRecord {
  id: string
  experimentId: string
  timestamp: Date
  thermalController?: string // JSON
  humidityController?: string // JSON
  pressureController?: string // JSON
  purgingController?: string // JSON
  airIntakeController?: string // JSON
  stackController?: string // JSON
}

export interface ElectrodeMaterialData {
  id: string
  name: string
  category: MaterialCategory
  systemTypes: string // JSON array
  conductivity: number
  durability: number
  cost: number
  density?: number
  biocompatibility?: number
  surfaceArea?: number
  protonConductivity?: number
  oxygenPermeability?: number
  thermalStability?: number
  temperatureRange?: string
  pressureRange?: string
  phRange?: string
  electronTransfer?: number
  corrosionResistance?: number
  mechanicalStrength?: number
  description?: string
  manufacturer?: string
  datasheet?: string
  createdAt: Date
  updatedAt: Date
}

export interface OptimizationResultData {
  id: string
  experimentId: string
  systemType: SystemType
  algorithm: string
  objective: string
  constraints: string // JSON
  optimizedParams: string // JSON
  objectiveValue: number
  iterations: number
  convergence: boolean
  improvement?: number
  confidence?: number
  notes?: string
  createdAt: Date
}