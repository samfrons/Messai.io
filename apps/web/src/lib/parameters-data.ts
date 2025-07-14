// MESS Parameters Data Library
export interface ParameterCategory {
  id: string
  name: string
  description: string
  parameters: Parameter[]
}

export interface Parameter {
  id: string
  name: string
  description: string
  unit: string
  type: 'number' | 'string' | 'boolean' | 'select'
  min?: number
  max?: number
  default?: any
  options?: string[]
  category: string
}

// Biological Parameters
const biologicalParameters: Parameter[] = [
  {
    id: 'biofilm_thickness',
    name: 'Biofilm Thickness',
    description: 'Thickness of the microbial biofilm on the electrode surface',
    unit: 'μm',
    type: 'number',
    min: 1,
    max: 500,
    default: 50,
    category: 'biological'
  },
  {
    id: 'microbial_species',
    name: 'Microbial Species',
    description: 'Primary microbial species in the fuel cell',
    unit: '',
    type: 'select',
    options: ['Geobacter sulfurreducens', 'Shewanella oneidensis', 'Mixed consortium'],
    default: 'Geobacter sulfurreducens',
    category: 'biological'
  },
  {
    id: 'substrate_concentration',
    name: 'Substrate Concentration',
    description: 'Concentration of organic substrate in the feed',
    unit: 'mg/L',
    type: 'number',
    min: 100,
    max: 10000,
    default: 1000,
    category: 'biological'
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
    min: 0.1,
    max: 1.2,
    default: 0.6,
    category: 'electrical'
  },
  {
    id: 'current_density',
    name: 'Current Density',
    description: 'Current per unit electrode area',
    unit: 'mA/cm²',
    type: 'number',
    min: 0.1,
    max: 50,
    default: 5,
    category: 'electrical'
  },
  {
    id: 'internal_resistance',
    name: 'Internal Resistance',
    description: 'Internal resistance of the fuel cell',
    unit: 'Ω',
    type: 'number',
    min: 1,
    max: 1000,
    default: 100,
    category: 'electrical'
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
    options: ['Carbon cloth', 'Carbon felt', 'Graphite', 'Stainless steel'],
    default: 'Carbon cloth',
    category: 'materials'
  },
  {
    id: 'cathode_material',
    name: 'Cathode Material',
    description: 'Material composition of the cathode electrode',
    unit: '',
    type: 'select',
    options: ['Carbon cloth with Pt', 'Air cathode', 'Graphite', 'Carbon felt'],
    default: 'Carbon cloth with Pt',
    category: 'materials'
  },
  {
    id: 'membrane_type',
    name: 'Membrane Type',
    description: 'Type of proton exchange membrane',
    unit: '',
    type: 'select',
    options: ['Nafion', 'PEM', 'Ceramic', 'None (single chamber)'],
    default: 'Nafion',
    category: 'materials'
  }
]

// Operational Parameters
const operationalParameters: Parameter[] = [
  {
    id: 'temperature',
    name: 'Operating Temperature',
    description: 'Temperature of the fuel cell operation',
    unit: '°C',
    type: 'number',
    min: 15,
    max: 80,
    default: 25,
    category: 'operational'
  },
  {
    id: 'ph',
    name: 'pH Level',
    description: 'pH of the electrolyte solution',
    unit: '',
    type: 'number',
    min: 4,
    max: 10,
    default: 7,
    category: 'operational'
  },
  {
    id: 'flow_rate',
    name: 'Flow Rate',
    description: 'Flow rate of the electrolyte',
    unit: 'mL/min',
    type: 'number',
    min: 0.1,
    max: 100,
    default: 5,
    category: 'operational'
  }
]

// Parameter Categories
export const parameterCategories: ParameterCategory[] = [
  {
    id: 'biological',
    name: 'Biological Parameters',
    description: 'Parameters related to microbial activity and biofilm formation',
    parameters: biologicalParameters
  },
  {
    id: 'electrical',
    name: 'Electrical Parameters',
    description: 'Parameters related to electrical performance and output',
    parameters: electricalParameters
  },
  {
    id: 'materials',
    name: 'Material Parameters',
    description: 'Parameters related to electrode and membrane materials',
    parameters: materialParameters
  },
  {
    id: 'operational',
    name: 'Operational Parameters',
    description: 'Parameters related to operating conditions',
    parameters: operationalParameters
  }
]

// Utility functions
export const getAllParameters = (): Parameter[] => {
  return parameterCategories.flatMap(category => category.parameters)
}

export const getParameterById = (id: string): Parameter | undefined => {
  return getAllParameters().find(param => param.id === id)
}

export const getParametersByCategory = (categoryId: string): Parameter[] => {
  const category = parameterCategories.find(cat => cat.id === categoryId)
  return category ? category.parameters : []
}

export const validateParameterValue = (parameter: Parameter, value: any): boolean => {
  switch (parameter.type) {
    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) return false
      if (parameter.min !== undefined && numValue < parameter.min) return false
      if (parameter.max !== undefined && numValue > parameter.max) return false
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
    byCategory: parameterCategories.map(cat => ({
      category: cat.name,
      count: cat.parameters.length
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
    param.description.toLowerCase().includes(lowercaseQuery)
  )
}

export const exportParametersAsJSON = (): string => {
  return JSON.stringify(parameterCategories, null, 2)
}

export const exportParametersAsCSV = (): string => {
  const headers = ['Category', 'Name', 'Description', 'Unit', 'Type', 'Min', 'Max', 'Default']
  const rows = getAllParameters().map(param => [
    param.category,
    param.name,
    param.description,
    param.unit,
    param.type,
    param.min?.toString() || '',
    param.max?.toString() || '',
    param.default?.toString() || ''
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}