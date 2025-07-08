// TypeScript interfaces for MESS models

export interface MESSModelBase {
  id: string
  name: string
  type: string
  description: string
  category: 'microscale' | 'lab-scale' | 'pilot-scale' | 'industrial' | 'environmental'
  cost: string
  powerOutput: string
  materials: {
    [key: string]: string
  }
}

// Lab-on-chip specific parameters
export interface LabOnChipParameters {
  channelDimensions: {
    width: number // μm
    height: number // μm
    length: number // mm
  }
  flowRate: number // μL/min
  electrodeSpacing: number // μm
  substrateInjectionMode: 'continuous' | 'batch' | 'pulsed'
  microscopyIntegration: boolean
  temperatureControl: boolean
  microfluidicDesign: 'y-junction' | 'serpentine' | 'straight' | 'custom'
}

// Benchtop bioreactor specific parameters
export interface BenchtopBioreactorParameters {
  reactorVolume: number // L
  stirringSpeed: number // RPM
  temperature: number // °C
  gasFlowRate: number // L/min
  hrt: number // hours (Hydraulic Retention Time)
  numberOfStacks: number
  stackConfiguration: 'series' | 'parallel' | 'hybrid'
  monitoringSensors: {
    ph: boolean
    dissolvedOxygen: boolean
    temperature: boolean
    pressure: boolean
    turbidity: boolean
  }
}

// Algal facade specific parameters
export interface AlgalFacadeParameters {
  panelDimensions: {
    width: number // m
    height: number // m
    thickness: number // cm
  }
  algaeSpecies: string
  lightIntensity: number // μmol/m²/s
  co2InjectionRate: number // %
  nutrientConcentration: number // g/L
  harvestingFrequency: number // days
  orientation: 'north' | 'south' | 'east' | 'west'
  tiltAngle: number // degrees
  weatherResistance: boolean
}

// Wastewater treatment specific parameters
export interface WastewaterTreatmentParameters {
  systemCapacity: number // L/day
  influentCOD: number // mg/L
  hrt: number // hours
  srt: number // days (Solids Retention Time)
  numberOfModules: number
  aerationRate: number // L/min
  temperatureRange: {
    min: number
    max: number
  }
  pretreatment: 'screening' | 'settling' | 'none'
  posttreatment: 'clarification' | 'filtration' | 'disinfection' | 'none'
}

// Benthic MFC specific parameters
export interface BenthicMFCParameters {
  deploymentDepth: number // m
  sedimentType: 'sand' | 'silt' | 'clay' | 'mixed'
  salinity: number // ppt
  temperature: number // °C
  anodeBurialDepth: number // cm
  tidalAmplitude: number // m
  deploymentDuration: number // days
  biofoulingResistance: boolean
  anchoringSystem: 'weighted' | 'piled' | 'tethered'
}

// Animation configuration for each model type
export interface ModelAnimationConfig {
  hasFlowVisualization: boolean
  hasBiofilmGrowth: boolean
  hasGasProduction: boolean
  hasPerformanceOverlay: boolean
  customAnimations?: string[]
}

// Performance metrics specific to each model
export interface ModelPerformanceMetrics {
  powerDensity: number // mW/cm² or mW/m²
  coulombicEfficiency: number // %
  energyRecovery?: number // %
  removalEfficiency?: number // % (for wastewater)
  co2Fixation?: number // g/day (for algal systems)
  hydrogenProduction?: number // L/day (for MECs)
}

// Complete model configuration
export interface MESSModelConfig extends MESSModelBase {
  parameters: LabOnChipParameters | BenchtopBioreactorParameters | AlgalFacadeParameters | WastewaterTreatmentParameters | BenthicMFCParameters
  animationConfig: ModelAnimationConfig
  performanceMetrics: ModelPerformanceMetrics
  setupGuide?: string[]
  maintenanceSchedule?: {
    task: string
    frequency: string
  }[]
}

// Model presets for quick configuration
export interface ModelPreset {
  id: string
  name: string
  description: string
  modelType: string
  parameters: any
  expectedPerformance: ModelPerformanceMetrics
}

// Validation rules for parameters
export interface ParameterValidation {
  min?: number
  max?: number
  step?: number
  options?: string[]
  required?: boolean
  units?: string
  tooltip?: string
}

export interface ModelParameterSchema {
  [parameterKey: string]: {
    label: string
    type: 'number' | 'string' | 'boolean' | 'select' | 'range'
    validation: ParameterValidation
    category?: string
    advanced?: boolean
  }
}

// 3D model configuration
export interface Model3DConfig {
  modelType: string
  geometries: {
    [componentName: string]: {
      type: 'box' | 'cylinder' | 'sphere' | 'tube' | 'custom'
      dimensions: any
      material: {
        color: number
        metalness?: number
        roughness?: number
        transparent?: boolean
        opacity?: number
        emissive?: number
        emissiveIntensity?: number
      }
      position?: { x: number; y: number; z: number }
      rotation?: { x: number; y: number; z: number }
      animation?: {
        type: 'rotate' | 'oscillate' | 'flow' | 'grow'
        speed: number
        axis?: 'x' | 'y' | 'z'
      }
    }
  }
}

// Export type guards
export function isLabOnChipParameters(params: any): params is LabOnChipParameters {
  return params && typeof params.channelDimensions === 'object' && typeof params.flowRate === 'number'
}

export function isBenchtopBioreactorParameters(params: any): params is BenchtopBioreactorParameters {
  return params && typeof params.reactorVolume === 'number' && typeof params.stirringSpeed === 'number'
}

export function isAlgalFacadeParameters(params: any): params is AlgalFacadeParameters {
  return params && typeof params.panelDimensions === 'object' && typeof params.lightIntensity === 'number'
}

export function isWastewaterTreatmentParameters(params: any): params is WastewaterTreatmentParameters {
  return params && typeof params.systemCapacity === 'number' && typeof params.influentCOD === 'number'
}

export function isBenthicMFCParameters(params: any): params is BenthicMFCParameters {
  return params && typeof params.deploymentDepth === 'number' && typeof params.sedimentType === 'string'
}