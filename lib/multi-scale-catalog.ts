// Multi-Scale MESS Models Catalog
// Based on mess-model.txt specifications

export type ModelStage = 'micro-scale' | 'voltaic-pile' | 'bench-scale' | 'industrial'

export interface ModelParameters {
  temperature: number
  pH: number
  substrateConcentration: number
  flowRate: number
  biofilmThickness: number
  currentDensity: number
}

export interface MultiScaleModel {
  id: string
  name: string
  stage: ModelStage
  description: string
  purpose: string
  geometry: string
  volume: string
  dimensions: {
    width: number
    height: number
    depth: number
  }
  components: string[]
  keyFeatures: string[]
  applications: string[]
  parameterRanges: {
    temperature: { min: number; max: number; unit: string }
    pH: { min: number; max: number; unit: string }
    substrateConcentration: { min: number; max: number; unit: string }
    flowRate: { min: number; max: number; unit: string }
    biofilmThickness: { min: number; max: number; unit: string }
  }
  basePerformance: {
    powerDensity: { value: number; unit: string }
    efficiency: number
    voltage: { value: number; unit: string }
  }
}

export const multiScaleModels: Record<ModelStage, MultiScaleModel> = {
  'micro-scale': {
    id: 'micro-scale-test-slide',
    name: 'Micro-Scale Test Slide',
    stage: 'micro-scale',
    description: 'Standard microscope slide form factor with layered chambers for rapid material testing and biofilm visualization',
    purpose: 'Rapid material testing and biofilm visualization',
    geometry: 'Standard microscope slide form factor with layered chambers',
    volume: '200µL - 1mL working volume',
    dimensions: {
      width: 75,    // mm
      height: 25,   // mm  
      depth: 3      // mm
    },
    components: [
      'Transparent acrylic housing (3mm thick)',
      'Interchangeable electrode strips (anode/cathode pairs)',
      'Microfluidic channels for substrate flow',
      'Integrated reference electrode access'
    ],
    keyFeatures: [
      'Real-time biofilm monitoring',
      'Material characterization',
      'Educational demonstrations',
      'Microscopy compatibility'
    ],
    applications: [
      'Material screening',
      'Biofilm studies',
      'Educational tools',
      'Rapid prototyping'
    ],
    parameterRanges: {
      temperature: { min: 15, max: 40, unit: '°C' },
      pH: { min: 6.0, max: 8.5, unit: 'pH units' },
      substrateConcentration: { min: 0.1, max: 5.0, unit: 'g/L' },
      flowRate: { min: 0.1, max: 10, unit: 'µL/min' },
      biofilmThickness: { min: 10, max: 500, unit: 'µm' }
    },
    basePerformance: {
      powerDensity: { value: 50, unit: 'mW/m²' },
      efficiency: 25,
      voltage: { value: 0.3, unit: 'V' }
    }
  },

  'voltaic-pile': {
    id: 'voltaic-pile-stack',
    name: 'Voltaic Pile/Multi-Cell Stack',
    stage: 'voltaic-pile',
    description: 'Stackable cylindrical or rectangular cells with standardized connections for voltage/current scaling',
    purpose: 'Voltage/current scaling through series/parallel configurations',
    geometry: 'Stackable cylindrical or rectangular cells with standardized connections',
    volume: '50-200mL per cell',
    dimensions: {
      width: 150,   // mm
      height: 200,  // mm
      depth: 100    // mm
    },
    components: [
      '7-10 individual cells per stack',
      'Shared substrate reservoir system',
      'Modular electrical connections',
      'Integrated monitoring ports'
    ],
    keyFeatures: [
      'Voltage multiplication',
      'Current addition',
      'Stackable design',
      'Modular configuration'
    ],
    applications: [
      'Power scaling studies',
      'Series/parallel optimization',
      'Medium-scale demonstrations',
      'Educational research'
    ],
    parameterRanges: {
      temperature: { min: 20, max: 45, unit: '°C' },
      pH: { min: 6.5, max: 8.0, unit: 'pH units' },
      substrateConcentration: { min: 0.5, max: 10, unit: 'g/L' },
      flowRate: { min: 1, max: 50, unit: 'mL/min' },
      biofilmThickness: { min: 50, max: 1000, unit: 'µm' }
    },
    basePerformance: {
      powerDensity: { value: 200, unit: 'mW/m²' },
      efficiency: 45,
      voltage: { value: 2.1, unit: 'V' }
    }
  },

  'bench-scale': {
    id: 'bench-scale-reactor',
    name: 'Bench-Scale Reactor',
    stage: 'bench-scale',
    description: 'Dual-chamber or single-chamber with air cathode for validating scaling physics and continuous operation',
    purpose: 'Validate scaling physics and continuous operation',
    geometry: 'Dual-chamber or single-chamber with air cathode',
    volume: '1-5L working volume',
    dimensions: {
      width: 250,   // mm
      height: 200,  // mm
      depth: 200    // mm
    },
    components: [
      '1-5L working volume chamber',
      'Continuous flow capability',
      'Temperature, pH, ORP monitoring',
      'Sampling ports at multiple locations',
      'Data acquisition system'
    ],
    keyFeatures: [
      'Process optimization',
      'Long-term stability testing',
      'Simulation validation',
      'Comprehensive monitoring'
    ],
    applications: [
      'Process development',
      'Scale-up validation',
      'Performance optimization',
      'Research benchmarking'
    ],
    parameterRanges: {
      temperature: { min: 25, max: 40, unit: '°C' },
      pH: { min: 6.0, max: 8.5, unit: 'pH units' },
      substrateConcentration: { min: 1.0, max: 20, unit: 'g/L' },
      flowRate: { min: 10, max: 500, unit: 'mL/min' },
      biofilmThickness: { min: 100, max: 2000, unit: 'µm' }
    },
    basePerformance: {
      powerDensity: { value: 800, unit: 'mW/m²' },
      efficiency: 65,
      voltage: { value: 0.7, unit: 'V' }
    }
  },

  'industrial': {
    id: 'industrial-scale-system',
    name: 'Industrial-Scale System',
    stage: 'industrial',
    description: 'Array of optimized modules based on validated designs for commercial deployment with waste-to-energy conversion',
    purpose: 'Commercial deployment with waste-to-energy conversion',
    geometry: 'Array of optimized modules based on validated designs',
    volume: 'Modular (100L - 10,000L+)',
    dimensions: {
      width: 2000,  // mm
      height: 3000, // mm
      depth: 1500   // mm
    },
    components: [
      'Waste preprocessing system',
      'MFC module arrays (scalable configuration)',
      'Power management and conditioning',
      'SCADA control system',
      'Remote monitoring capabilities'
    ],
    keyFeatures: [
      'Commercial viability',
      'Waste processing',
      'Grid integration',
      'Remote monitoring'
    ],
    applications: [
      'Wastewater treatment',
      'Industrial waste processing',
      'Distributed energy generation',
      'Environmental remediation'
    ],
    parameterRanges: {
      temperature: { min: 20, max: 50, unit: '°C' },
      pH: { min: 6.5, max: 8.0, unit: 'pH units' },
      substrateConcentration: { min: 5, max: 100, unit: 'g/L' },
      flowRate: { min: 1, max: 1000, unit: 'L/min' },
      biofilmThickness: { min: 500, max: 5000, unit: 'µm' }
    },
    basePerformance: {
      powerDensity: { value: 1500, unit: 'mW/m²' },
      efficiency: 75,
      voltage: { value: 24, unit: 'V' }
    }
  }
}

// MESim Pro Integration - Advanced Materials Database
export interface MaterialProperties {
  id: string
  name: string
  type: 'anode' | 'cathode' | 'membrane' | 'catalyst'
  conductivity: { value: number; unit: string }
  biocompatibility: number // 0-100
  cost: { value: number; unit: string }
  availability: 'high' | 'medium' | 'low'
  surfaceArea: { value: number; unit: string }
  porosity: number // 0-100
  durability: number // 0-100
  visualProperties: {
    color: string
    opacity: number
    texture?: string
  }
}

export const advancedMaterials: MaterialProperties[] = [
  {
    id: 'graphene-oxide',
    name: 'Graphene Oxide',
    type: 'anode',
    conductivity: { value: 10000, unit: 'S/m' },
    biocompatibility: 85,
    cost: { value: 500, unit: '$/kg' },
    availability: 'medium',
    surfaceArea: { value: 2630, unit: 'm²/g' },
    porosity: 75,
    durability: 90,
    visualProperties: {
      color: '#2C3E50',
      opacity: 0.8,
      texture: 'carbon-fiber'
    }
  },
  {
    id: 'mxene-ti3c2',
    name: 'Ti₃C₂Tₓ MXene',
    type: 'anode',
    conductivity: { value: 15000, unit: 'S/m' },
    biocompatibility: 75,
    cost: { value: 2000, unit: '$/kg' },
    availability: 'low',
    surfaceArea: { value: 1200, unit: 'm²/g' },
    porosity: 60,
    durability: 85,
    visualProperties: {
      color: '#9B59B6',
      opacity: 0.9,
      texture: 'mxene-layers'
    }
  },
  {
    id: 'copper-foam',
    name: 'Copper Foam',
    type: 'cathode',
    conductivity: { value: 50000000, unit: 'S/m' },
    biocompatibility: 60,
    cost: { value: 50, unit: '$/kg' },
    availability: 'high',
    surfaceArea: { value: 500, unit: 'm²/g' },
    porosity: 95,
    durability: 70,
    visualProperties: {
      color: '#B87333',
      opacity: 0.7,
      texture: 'foam'
    }
  }
]

// Bacterial Species Database
export interface BacterialSpecies {
  id: string
  name: string
  genus: string
  species: string
  electrogenicity: number // 0-100
  optimalPH: { min: number; max: number }
  optimalTemperature: { min: number; max: number; unit: string }
  substratePreference: string[]
  biofilmFormation: number // 0-100
  growthRate: { value: number; unit: string }
  visualProperties: {
    color: string
    density: number
  }
}

export const bacterialSpecies: BacterialSpecies[] = [
  {
    id: 'geobacter-sulfurreducens',
    name: 'Geobacter sulfurreducens',
    genus: 'Geobacter',
    species: 'sulfurreducens',
    electrogenicity: 95,
    optimalPH: { min: 6.5, max: 7.5 },
    optimalTemperature: { min: 25, max: 35, unit: '°C' },
    substratePreference: ['acetate', 'lactate', 'ethanol'],
    biofilmFormation: 90,
    growthRate: { value: 0.12, unit: 'day⁻¹' },
    visualProperties: {
      color: '#E74C3C',
      density: 0.8
    }
  },
  {
    id: 'shewanella-oneidensis',
    name: 'Shewanella oneidensis',
    genus: 'Shewanella',
    species: 'oneidensis',
    electrogenicity: 85,
    optimalPH: { min: 7.0, max: 8.0 },
    optimalTemperature: { min: 20, max: 30, unit: '°C' },
    substratePreference: ['lactate', 'pyruvate', 'formate'],
    biofilmFormation: 75,
    growthRate: { value: 0.15, unit: 'day⁻¹' },
    visualProperties: {
      color: '#3498DB',
      density: 0.7
    }
  },
  {
    id: 'mixed-consortium',
    name: 'Mixed Anaerobic Consortium',
    genus: 'Mixed',
    species: 'consortium',
    electrogenicity: 70,
    optimalPH: { min: 6.8, max: 7.8 },
    optimalTemperature: { min: 25, max: 40, unit: '°C' },
    substratePreference: ['wastewater', 'organic waste', 'complex substrates'],
    biofilmFormation: 85,
    growthRate: { value: 0.08, unit: 'day⁻¹' },
    visualProperties: {
      color: '#27AE60',
      density: 0.9
    }
  }
]

// Progressive Validation System
export interface ValidationCriteria {
  stage: ModelStage
  requirements: {
    powerDensity: { min: number; unit: string }
    efficiency: { min: number; unit: string }
    stability: { min: number; unit: string }
    costEffectiveness: { max: number; unit: string }
  }
  riskFactors: string[]
  mitigationStrategies: string[]
}

export const progressiveValidation: Record<ModelStage, ValidationCriteria> = {
  'micro-scale': {
    stage: 'micro-scale',
    requirements: {
      powerDensity: { min: 20, unit: 'mW/m²' },
      efficiency: { min: 15, unit: '%' },
      stability: { min: 24, unit: 'hours' },
      costEffectiveness: { max: 100, unit: '$/W' }
    },
    riskFactors: [
      'Electrode fouling',
      'pH drift',
      'Oxygen contamination'
    ],
    mitigationStrategies: [
      'Regular cleaning protocols',
      'pH buffering',
      'Sealed system design'
    ]
  },
  'voltaic-pile': {
    stage: 'voltaic-pile',
    requirements: {
      powerDensity: { min: 100, unit: 'mW/m²' },
      efficiency: { min: 30, unit: '%' },
      stability: { min: 168, unit: 'hours' },
      costEffectiveness: { max: 50, unit: '$/W' }
    },
    riskFactors: [
      'Voltage reversal',
      'Cell imbalance',
      'Connection corrosion'
    ],
    mitigationStrategies: [
      'Capacitive buffering',
      'Individual cell monitoring',
      'Corrosion-resistant materials'
    ]
  },
  'bench-scale': {
    stage: 'bench-scale',
    requirements: {
      powerDensity: { min: 500, unit: 'mW/m²' },
      efficiency: { min: 50, unit: '%' },
      stability: { min: 720, unit: 'hours' },
      costEffectiveness: { max: 20, unit: '$/W' }
    },
    riskFactors: [
      'Scale-up inefficiencies',
      'Mixing limitations',
      'Temperature control'
    ],
    mitigationStrategies: [
      'Optimized geometries',
      'Advanced mixing systems',
      'Thermal management'
    ]
  },
  'industrial': {
    stage: 'industrial',
    requirements: {
      powerDensity: { min: 1000, unit: 'mW/m²' },
      efficiency: { min: 65, unit: '%' },
      stability: { min: 8760, unit: 'hours' },
      costEffectiveness: { max: 5, unit: '$/W' }
    },
    riskFactors: [
      'Maintenance complexity',
      'Process variability',
      'Economic viability'
    ],
    mitigationStrategies: [
      'Modular design',
      'Advanced control systems',
      'Life cycle optimization'
    ]
  }
}

// Butler-Volmer-Monod Kinetics Implementation
export function calculatePerformance(
  stage: ModelStage,
  parameters: ModelParameters,
  materials: MaterialProperties[],
  bacteria: BacterialSpecies
): { powerDensity: number; efficiency: number; voltage: number } {
  const model = multiScaleModels[stage]
  
  // Temperature factor (Arrhenius)
  const tempFactor = Math.exp(-5000 * (1 / (273.15 + parameters.temperature) - 1 / 298.15))
  
  // pH factor (bell curve)
  const optimalPH = (bacteria.optimalPH.min + bacteria.optimalPH.max) / 2
  const pHFactor = Math.exp(-Math.pow(parameters.pH - optimalPH, 2) / 0.5)
  
  // Substrate factor (Monod kinetics)
  const Ks = 0.5 // Half-saturation constant
  const substrateFactor = parameters.substrateConcentration / (Ks + parameters.substrateConcentration)
  
  // Biofilm factor
  const biofilmFactor = Math.min(parameters.biofilmThickness / 1000, 1.0)
  
  // Material conductivity factor
  const avgConductivity = materials.reduce((sum, mat) => sum + mat.conductivity.value, 0) / materials.length
  const conductivityFactor = Math.log10(avgConductivity / 1000) / 10
  
  // Scale-specific multipliers
  const scaleMultipliers = {
    'micro-scale': 0.3,
    'voltaic-pile': 1.2,
    'bench-scale': 2.5,
    'industrial': 1.8
  }
  
  const basePower = model.basePerformance.powerDensity.value
  const calculatedPower = basePower * tempFactor * pHFactor * substrateFactor * 
                         biofilmFactor * conductivityFactor * scaleMultipliers[stage]
  
  const baseEfficiency = model.basePerformance.efficiency
  const calculatedEfficiency = baseEfficiency * tempFactor * pHFactor * biofilmFactor
  
  const baseVoltage = model.basePerformance.voltage.value
  const calculatedVoltage = baseVoltage * pHFactor * conductivityFactor
  
  return {
    powerDensity: Math.max(0, calculatedPower),
    efficiency: Math.min(100, Math.max(0, calculatedEfficiency)),
    voltage: Math.max(0, calculatedVoltage)
  }
}

// Export helper functions
export function getModelByStage(stage: ModelStage): MultiScaleModel {
  return multiScaleModels[stage]
}

export function getAllStages(): ModelStage[] {
  return ['micro-scale', 'voltaic-pile', 'bench-scale', 'industrial']
}

export function getValidationCriteria(stage: ModelStage): ValidationCriteria {
  return progressiveValidation[stage]
}

export function getMaterialsByType(type: MaterialProperties['type']): MaterialProperties[] {
  return advancedMaterials.filter(material => material.type === type)
}

export function getBacterialSpeciesList(): BacterialSpecies[] {
  return bacterialSpecies
}