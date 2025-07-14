// MESS Parameters Data Library
export interface ParameterCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  subcategories?: string[]
}

export interface Parameter {
  id: string
  name: string
  description: string
  unit: string
  type: 'number' | 'string' | 'boolean' | 'select'
  category: string
  subcategory: string
  range?: {
    min?: number
    max?: number
    typical?: number
  }
  default?: any
  options?: string[]
  tags?: string[]
}

// Environmental Parameters
const environmentalParameters: Parameter[] = [
  {
    id: 'ambient_temperature',
    name: 'Ambient Temperature',
    description: 'Ambient air temperature around the system',
    unit: '°C',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: -50, max: 60, typical: 25 },
    default: 25
  },
  {
    id: 'operating_temperature',
    name: 'Operating Temperature',
    description: 'Cell/reactor operating temperature',
    unit: '°C',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 4, max: 80, typical: 30 },
    default: 30
  },
  {
    id: 'relative_humidity',
    name: 'Relative Humidity',
    description: 'Relative humidity of the environment',
    unit: '%',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 10, max: 100, typical: 65 },
    default: 65
  },
  {
    id: 'atmospheric_pressure',
    name: 'Atmospheric Pressure',
    description: 'Atmospheric pressure at operating location',
    unit: 'kPa',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 80, max: 110, typical: 101.3 },
    default: 101.3
  }
]

// Biological Parameters
const biologicalParameters: Parameter[] = [
  {
    id: 'biofilm_thickness',
    name: 'Biofilm Thickness',
    description: 'Thickness of the microbial biofilm on the electrode surface',
    unit: 'μm',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 1, max: 500, typical: 50 },
    default: 50
  },
  {
    id: 'biofilm_density',
    name: 'Biofilm Density',
    description: 'Cell density within the biofilm matrix',
    unit: 'cells/cm³',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 1e8, max: 1e12, typical: 1e10 },
    default: 1e10
  },
  {
    id: 'microbial_species',
    name: 'Microbial Species',
    description: 'Primary microbial species in the fuel cell',
    unit: '',
    type: 'select',
    category: 'biological',
    subcategory: 'microbial-selection',
    options: [
      'Geobacter sulfurreducens',
      'Shewanella oneidensis',
      'Pseudomonas aeruginosa',
      'Escherichia coli',
      'Mixed consortium',
      'Anaerobic sludge'
    ],
    default: 'Geobacter sulfurreducens'
  },
  {
    id: 'substrate_concentration',
    name: 'Substrate Concentration',
    description: 'Concentration of organic substrate in the feed',
    unit: 'mg/L',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 100, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'cod_concentration',
    name: 'COD Concentration',
    description: 'Chemical oxygen demand of the substrate',
    unit: 'mg/L',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 200, max: 50000, typical: 2000 },
    default: 2000
  },
  {
    id: 'growth_rate',
    name: 'Microbial Growth Rate',
    description: 'Specific growth rate of microorganisms',
    unit: 'h⁻¹',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 0.001, max: 0.5, typical: 0.1 },
    default: 0.1
  }
]

// Electrical Parameters
const electricalParameters: Parameter[] = [
  {
    id: 'cell_voltage',
    name: 'Cell Voltage',
    description: 'Operating voltage of the fuel cell',
    unit: 'V',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 1.2, typical: 0.6 },
    default: 0.6
  },
  {
    id: 'open_circuit_voltage',
    name: 'Open Circuit Voltage',
    description: 'Voltage when no current is flowing',
    unit: 'V',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.2, max: 1.1, typical: 0.8 },
    default: 0.8
  },
  {
    id: 'current_density',
    name: 'Current Density',
    description: 'Current per unit electrode area',
    unit: 'mA/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'power_density',
    name: 'Power Density',
    description: 'Power output per unit volume or area',
    unit: 'mW/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.01, max: 30, typical: 3 },
    default: 3
  },
  {
    id: 'internal_resistance',
    name: 'Internal Resistance',
    description: 'Internal resistance of the fuel cell',
    unit: 'Ω',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 1, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'charge_transfer_resistance',
    name: 'Charge Transfer Resistance',
    description: 'Resistance to electron transfer at electrode interface',
    unit: 'Ω·cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'coulombic_efficiency',
    name: 'Coulombic Efficiency',
    description: 'Efficiency of electron capture from substrate',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 5, max: 95, typical: 60 },
    default: 60
  }
]

// Material Parameters
const materialParameters: Parameter[] = [
  {
    id: 'anode_material',
    name: 'Anode Material',
    description: 'Material composition of the anode electrode',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'electrode-materials',
    options: [
      'Carbon cloth',
      'Carbon felt',
      'Carbon paper',
      'Graphite rod',
      'Graphite plate',
      'Carbon brush',
      'Stainless steel mesh',
      'Titanium',
      'Nickel foam'
    ],
    default: 'Carbon cloth'
  },
  {
    id: 'cathode_material',
    name: 'Cathode Material',
    description: 'Material composition of the cathode electrode',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'electrode-materials',
    options: [
      'Carbon cloth with Pt',
      'Carbon cloth with Pt/C',
      'Air cathode',
      'Graphite plate',
      'Carbon felt',
      'Stainless steel',
      'Activated carbon'
    ],
    default: 'Carbon cloth with Pt'
  },
  {
    id: 'electrode_surface_area',
    name: 'Electrode Surface Area',
    description: 'Total surface area of the electrode',
    unit: 'cm²',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 1, max: 1000, typical: 25 },
    default: 25
  },
  {
    id: 'electrode_spacing',
    name: 'Electrode Spacing',
    description: 'Distance between anode and cathode',
    unit: 'cm',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 0.5, max: 50, typical: 2 },
    default: 2
  },
  {
    id: 'membrane_type',
    name: 'Membrane Type',
    description: 'Type of proton exchange membrane',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'membrane-separator',
    options: [
      'Nafion 117',
      'Nafion 115',
      'PEM',
      'Ceramic membrane',
      'Ultrafiltration membrane',
      'Salt bridge',
      'None (single chamber)'
    ],
    default: 'Nafion 117'
  },
  {
    id: 'membrane_thickness',
    name: 'Membrane Thickness',
    description: 'Thickness of the separator membrane',
    unit: 'μm',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 50, max: 500, typical: 183 },
    default: 183
  }
]

// Chemical Parameters
const chemicalParameters: Parameter[] = [
  {
    id: 'ph_level',
    name: 'pH Level',
    description: 'pH of the electrolyte solution',
    unit: '',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 4, max: 10, typical: 7 },
    default: 7
  },
  {
    id: 'conductivity',
    name: 'Electrolyte Conductivity',
    description: 'Electrical conductivity of the electrolyte',
    unit: 'mS/cm',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'buffer_concentration',
    name: 'Buffer Concentration',
    description: 'Concentration of pH buffer in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 1, max: 200, typical: 50 },
    default: 50
  },
  {
    id: 'salt_concentration',
    name: 'Salt Concentration',
    description: 'Ionic strength of the electrolyte',
    unit: 'g/L',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  }
]

// Operational Parameters
const operationalParameters: Parameter[] = [
  {
    id: 'flow_rate',
    name: 'Flow Rate',
    description: 'Flow rate of the electrolyte',
    unit: 'mL/min',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0.1, max: 100, typical: 5 },
    default: 5
  },
  {
    id: 'hydraulic_retention_time',
    name: 'Hydraulic Retention Time',
    description: 'Average time fluid spends in the reactor',
    unit: 'hours',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0.5, max: 168, typical: 24 },
    default: 24
  },
  {
    id: 'external_load',
    name: 'External Load',
    description: 'External resistance connected to the circuit',
    unit: 'Ω',
    type: 'number',
    category: 'operational',
    subcategory: 'circuit-conditions',
    range: { min: 10, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'operation_mode',
    name: 'Operation Mode',
    description: 'Mode of fuel cell operation',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'control-parameters',
    options: [
      'Batch',
      'Continuous',
      'Fed-batch',
      'Recirculation'
    ],
    default: 'Continuous'
  }
]

// Physical Parameters
const physicalParameters: Parameter[] = [
  {
    id: 'reactor_volume',
    name: 'Reactor Volume',
    description: 'Total internal volume of the reactor',
    unit: 'mL',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 10000, typical: 100 },
    default: 100
  },
  {
    id: 'chamber_configuration',
    name: 'Chamber Configuration',
    description: 'Number and arrangement of reactor chambers',
    unit: '',
    type: 'select',
    category: 'physical',
    subcategory: 'reactor-geometry',
    options: [
      'Single chamber',
      'Dual chamber',
      'Multi-chamber',
      'Stacked'
    ],
    default: 'Dual chamber'
  },
  {
    id: 'aspect_ratio',
    name: 'Aspect Ratio',
    description: 'Length to diameter ratio of the reactor',
    unit: '',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 0.5, max: 10, typical: 2 },
    default: 2
  }
]

// Parameter Categories
export const parameterCategories: ParameterCategory[] = [
  {
    id: 'environmental',
    name: 'Environmental',
    description: 'Environmental conditions and atmospheric parameters',
    icon: '🌍',
    color: 'green',
    subcategories: ['atmospheric-conditions']
  },
  {
    id: 'biological',
    name: 'Biological',
    description: 'Microbial activity, biofilm formation, and biological processes',
    icon: '🦠',
    color: 'blue',
    subcategories: ['biofilm-properties', 'microbial-selection', 'substrate-parameters', 'kinetics']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical performance, output, and impedance characteristics',
    icon: '⚡',
    color: 'yellow',
    subcategories: ['output-performance', 'impedance', 'efficiency']
  },
  {
    id: 'materials',
    name: 'Materials',
    description: 'Electrode materials, membranes, and physical components',
    icon: '🔬',
    color: 'purple',
    subcategories: ['electrode-materials', 'electrode-geometry', 'membrane-separator']
  },
  {
    id: 'chemical',
    name: 'Chemical',
    description: 'Electrolyte composition, pH, and chemical properties',
    icon: '⚗️',
    color: 'red',
    subcategories: ['electrolyte-composition']
  },
  {
    id: 'operational',
    name: 'Operational',
    description: 'Operating conditions, flow parameters, and control settings',
    icon: '⚙️',
    color: 'gray',
    subcategories: ['flow-conditions', 'circuit-conditions', 'control-parameters']
  },
  {
    id: 'physical',
    name: 'Physical',
    description: 'Reactor geometry, dimensions, and structural parameters',
    icon: '📐',
    color: 'indigo',
    subcategories: ['reactor-geometry']
  }
]

// All parameters combined
const allParameters: Parameter[] = [
  ...environmentalParameters,
  ...biologicalParameters,
  ...electricalParameters,
  ...materialParameters,
  ...chemicalParameters,
  ...operationalParameters,
  ...physicalParameters
]

// Utility functions
export const getAllParameters = (): Parameter[] => {
  return allParameters
}

export const getParameterById = (id: string): Parameter | undefined => {
  return getAllParameters().find(param => param.id === id)
}

export const getParametersByCategory = (categoryId: string): Parameter[] => {
  return allParameters.filter(param => param.category === categoryId)
}

export const validateParameterValue = (parameter: Parameter, value: any): boolean => {
  switch (parameter.type) {
    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) return false
      if (parameter.range?.min !== undefined && numValue < parameter.range.min) return false
      if (parameter.range?.max !== undefined && numValue > parameter.range.max) return false
      return true
    case 'select':
      return parameter.options ? parameter.options.includes(value) : false
    case 'boolean':
      return typeof value === 'boolean'
    case 'string':
      return typeof value === 'string' && value.length > 0
    default:
      return false
  }
}

// Additional utility functions for the UI
export const getParameterStatistics = () => {
  const allParams = getAllParameters()
  return {
    total: allParams.length,
    withUnits: allParams.filter(p => p.unit && p.unit !== '').length,
    withRanges: allParams.filter(p => p.range).length,
    byCategory: parameterCategories.map(cat => ({
      category: cat.name,
      count: allParams.filter(p => p.category === cat.id).length
    })),
    byType: {
      number: allParams.filter(p => p.type === 'number').length,
      select: allParams.filter(p => p.type === 'select').length,
      boolean: allParams.filter(p => p.type === 'boolean').length,
      string: allParams.filter(p => p.type === 'string').length
    }
  }
}

export const searchParameters = (query: string): Parameter[] => {
  const lowercaseQuery = query.toLowerCase()
  return getAllParameters().filter(param => 
    param.name.toLowerCase().includes(lowercaseQuery) ||
    param.description.toLowerCase().includes(lowercaseQuery) ||
    param.unit.toLowerCase().includes(lowercaseQuery) ||
    param.category.toLowerCase().includes(lowercaseQuery) ||
    param.subcategory.toLowerCase().includes(lowercaseQuery) ||
    (param.tags && param.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  )
}

export const exportParametersAsJSON = (parameters?: Parameter[]): string => {
  return JSON.stringify(parameters || getAllParameters(), null, 2)
}

export const exportParametersAsCSV = (parameters?: Parameter[]): string => {
  const params = parameters || getAllParameters()
  const headers = ['Category', 'Subcategory', 'Name', 'Description', 'Unit', 'Type', 'Min', 'Max', 'Typical', 'Default']
  const rows = params.map(param => [
    param.category,
    param.subcategory,
    param.name,
    param.description,
    param.unit,
    param.type,
    param.range?.min?.toString() || '',
    param.range?.max?.toString() || '',
    param.range?.typical?.toString() || '',
    param.default?.toString() || ''
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}