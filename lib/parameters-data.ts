// MESS Parameter Library Data Structure
// Auto-generated from MESS_PARAMETER_LIBRARY.md

export interface Parameter {
  id: string
  name: string
  description: string
  unit?: string
  range?: {
    min?: number
    max?: number
    typical?: number
  }
  category: string
  subcategory: string
  tags: string[]
  relatedParameters?: string[]
  notes?: string
}

export interface ParameterCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories: ParameterSubcategory[]
}

export interface ParameterSubcategory {
  id: string
  name: string
  description: string
  parameters: Parameter[]
}

// Main parameter categories with icons and colors
export const parameterCategories: ParameterCategory[] = [
  {
    id: 'environmental',
    name: 'Environmental Parameters',
    icon: '🌍',
    color: 'blue',
    description: 'Atmospheric, ambient, and external conditions affecting MESS operation',
    subcategories: []
  },
  {
    id: 'cell-level',
    name: 'Cell-Level Parameters',
    icon: '🔋',
    color: 'green',
    description: 'Individual electrochemical cell specifications and configurations',
    subcategories: []
  },
  {
    id: 'reactor-level',
    name: 'Reactor-Level Parameters',
    icon: '🏭',
    color: 'purple',
    description: 'Complete system and reactor-scale parameters',
    subcategories: []
  },
  {
    id: 'biological',
    name: 'Biological Parameters',
    icon: '🦠',
    color: 'orange',
    description: 'Microorganisms, biofilms, and biological processes',
    subcategories: []
  },
  {
    id: 'material',
    name: 'Material Parameters',
    icon: '🧱',
    color: 'red',
    description: 'Electrode, membrane, and structural material properties',
    subcategories: []
  },
  {
    id: 'operational',
    name: 'Operational Parameters',
    icon: '⚙️',
    color: 'indigo',
    description: 'Process control, maintenance, and operational settings',
    subcategories: []
  },
  {
    id: 'performance',
    name: 'Performance Parameters',
    icon: '📊',
    color: 'yellow',
    description: 'System output, efficiency, and performance metrics',
    subcategories: []
  },
  {
    id: 'economic',
    name: 'Economic Parameters',
    icon: '💰',
    color: 'emerald',
    description: 'Cost, economics, and financial metrics',
    subcategories: []
  },
  {
    id: 'safety',
    name: 'Safety Parameters',
    icon: '🛡️',
    color: 'rose',
    description: 'Safety limits, hazards, and protective measures',
    subcategories: []
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Control',
    icon: '📡',
    color: 'cyan',
    description: 'Sensors, instrumentation, and control systems',
    subcategories: []
  },
  {
    id: 'application-specific',
    name: 'Application-Specific',
    icon: '🎯',
    color: 'teal',
    description: 'Parameters for specific MESS applications',
    subcategories: []
  },
  {
    id: 'emerging-tech',
    name: 'Emerging Technologies',
    icon: '🚀',
    color: 'violet',
    description: 'Novel materials and cutting-edge technologies',
    subcategories: []
  },
  {
    id: 'integration',
    name: 'Integration & Scaling',
    icon: '🔗',
    color: 'amber',
    description: 'System integration and scale-up parameters',
    subcategories: []
  },
  {
    id: 'modeling',
    name: 'Modeling & Simulation',
    icon: '🖥️',
    color: 'slate',
    description: 'Computational modeling and simulation parameters',
    subcategories: []
  },
  {
    id: 'experimental',
    name: 'Experimental Parameters',
    icon: '🧪',
    color: 'pink',
    description: 'Research, testing, and experimental design parameters',
    subcategories: []
  }
]

// Sample parameters for environmental category (will be expanded)
const environmentalParameters: Parameter[] = [
  {
    id: 'env-temp-operating',
    name: 'Operating Temperature',
    description: 'Temperature at which the MESS operates',
    unit: '°C',
    range: { min: 4, max: 80, typical: 30 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'operating conditions', 'critical'],
    relatedParameters: ['env-temp-ambient', 'perf-temp-coefficient']
  },
  {
    id: 'env-temp-ambient',
    name: 'Ambient Temperature',
    description: 'Environmental temperature surrounding the system',
    unit: '°C',
    range: { min: -50, max: 60, typical: 20 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'ambient', 'environment']
  },
  {
    id: 'env-humidity-relative',
    name: 'Relative Humidity',
    description: 'Moisture content in the air as percentage of saturation',
    unit: '%',
    range: { min: 0, max: 100, typical: 50 },
    category: 'environmental',
    subcategory: 'humidity',
    tags: ['humidity', 'moisture', 'air quality']
  },
  {
    id: 'env-pressure-atmospheric',
    name: 'Atmospheric Pressure',
    description: 'Ambient air pressure at the operating location',
    unit: 'kPa',
    range: { min: 50, max: 110, typical: 101.325 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'atmospheric', 'ambient']
  },
  {
    id: 'env-co2-concentration',
    name: 'CO2 Concentration',
    description: 'Carbon dioxide concentration in the environment',
    unit: 'ppm',
    range: { min: 300, max: 5000, typical: 415 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['CO2', 'gas', 'atmospheric']
  },
  {
    id: 'env-light-intensity',
    name: 'Light Intensity',
    description: 'Illumination level for photosynthetic or light-sensitive systems',
    unit: 'lux',
    range: { min: 0, max: 100000, typical: 10000 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['light', 'illumination', 'photosynthesis']
  }
]

// Function to get all parameters
export function getAllParameters(): Parameter[] {
  // This will be expanded to include all 1500+ parameters
  return [...environmentalParameters]
}

// Function to search parameters
export function searchParameters(query: string): Parameter[] {
  const lowerQuery = query.toLowerCase()
  return getAllParameters().filter(param => 
    param.name.toLowerCase().includes(lowerQuery) ||
    param.description.toLowerCase().includes(lowerQuery) ||
    param.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    (param.unit && param.unit.toLowerCase().includes(lowerQuery))
  )
}

// Function to get parameters by category
export function getParametersByCategory(categoryId: string): Parameter[] {
  return getAllParameters().filter(param => param.category === categoryId)
}

// Function to get parameters by subcategory
export function getParametersBySubcategory(categoryId: string, subcategoryId: string): Parameter[] {
  return getAllParameters().filter(param => 
    param.category === categoryId && param.subcategory === subcategoryId
  )
}

// Function to get related parameters
export function getRelatedParameters(parameterId: string): Parameter[] {
  const param = getAllParameters().find(p => p.id === parameterId)
  if (!param || !param.relatedParameters) return []
  
  return param.relatedParameters
    .map(id => getAllParameters().find(p => p.id === id))
    .filter(Boolean) as Parameter[]
}

// Unit conversion utilities
export const unitConversions = {
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5/9,
    celsiusToKelvin: (c: number) => c + 273.15,
    kelvinToCelsius: (k: number) => k - 273.15
  },
  power: {
    mWToW: (mw: number) => mw / 1000,
    WTomW: (w: number) => w * 1000,
    mWm2ToWm2: (mw: number) => mw / 1000,
    Wm2TomWm2: (w: number) => w * 1000
  },
  pressure: {
    kPaToPsi: (kpa: number) => kpa * 0.145038,
    psiToKPa: (psi: number) => psi / 0.145038,
    kPaToBar: (kpa: number) => kpa / 100,
    barToKPa: (bar: number) => bar * 100
  }
}

// Export functions for CSV/JSON
export function exportParametersAsJSON(parameters: Parameter[]): string {
  return JSON.stringify(parameters, null, 2)
}

export function exportParametersAsCSV(parameters: Parameter[]): string {
  const headers = ['ID', 'Name', 'Description', 'Unit', 'Min', 'Max', 'Typical', 'Category', 'Subcategory', 'Tags']
  const rows = parameters.map(p => [
    p.id,
    p.name,
    p.description,
    p.unit || '',
    p.range?.min || '',
    p.range?.max || '',
    p.range?.typical || '',
    p.category,
    p.subcategory,
    p.tags.join('; ')
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

// Statistics
export function getParameterStatistics() {
  const allParams = getAllParameters()
  const byCategory = parameterCategories.map(cat => ({
    category: cat.name,
    count: allParams.filter(p => p.category === cat.id).length
  }))
  
  return {
    total: allParams.length,
    byCategory,
    withUnits: allParams.filter(p => p.unit).length,
    withRanges: allParams.filter(p => p.range).length,
    withRelated: allParams.filter(p => p.relatedParameters && p.relatedParameters.length > 0).length
  }
}