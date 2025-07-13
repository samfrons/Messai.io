// Unified Systems Catalog for MESSAI Platform
export interface SystemType {
  id: string
  name: string
  category: 'MFC' | 'MEC' | 'MDC' | 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
  description: string
  applications: string[]
  advantages: string[]
  limitations: string[]
  specifications: SystemSpecifications
  modelData?: ModelData
}

export interface SystemSpecifications {
  powerDensity: {
    typical: number
    max: number
    unit: string
  }
  efficiency: {
    typical: number
    max: number
    unit: string
  }
  operatingConditions: {
    temperature: { min: number; max: number; unit: string }
    pressure: { min: number; max: number; unit: string }
    pH?: { min: number; max: number }
  }
  materials: {
    anode: string[]
    cathode: string[]
    electrolyte: string[]
    membrane?: string[]
  }
}

export interface ModelData {
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  chambers: number
  electrodeArea: {
    value: number
    unit: string
  }
  volume: {
    value: number
    unit: string
  }
}

// Microbial Electrochemical Systems
const microbialSystems: SystemType[] = [
  {
    id: 'single-chamber-mfc',
    name: 'Single Chamber MFC',
    category: 'MFC',
    description: 'Single chamber microbial fuel cell with air cathode',
    applications: ['Wastewater treatment', 'Biosensors', 'Remote monitoring'],
    advantages: ['Simple design', 'Low cost', 'Easy maintenance'],
    limitations: ['Lower power output', 'Oxygen diffusion challenges'],
    specifications: {
      powerDensity: { typical: 500, max: 1200, unit: 'mW/m²' },
      efficiency: { typical: 15, max: 25, unit: '%' },
      operatingConditions: {
        temperature: { min: 15, max: 40, unit: '°C' },
        pressure: { min: 1, max: 1.2, unit: 'atm' },
        pH: { min: 6, max: 8 }
      },
      materials: {
        anode: ['Carbon cloth', 'Carbon felt', 'Graphite'],
        cathode: ['Carbon cloth with Pt catalyst', 'Air cathode'],
        electrolyte: ['Phosphate buffer', 'Acetate medium']
      }
    },
    modelData: {
      dimensions: { length: 10, width: 5, height: 5, unit: 'cm' },
      chambers: 1,
      electrodeArea: { value: 25, unit: 'cm²' },
      volume: { value: 250, unit: 'mL' }
    }
  },
  {
    id: 'dual-chamber-mfc',
    name: 'Dual Chamber MFC',
    category: 'MFC',
    description: 'Two chamber microbial fuel cell with proton exchange membrane',
    applications: ['High efficiency power generation', 'Research applications'],
    advantages: ['Higher power output', 'Better control', 'Reduced oxygen interference'],
    limitations: ['Higher cost', 'Complex design', 'Membrane fouling'],
    specifications: {
      powerDensity: { typical: 800, max: 2000, unit: 'mW/m²' },
      efficiency: { typical: 25, max: 40, unit: '%' },
      operatingConditions: {
        temperature: { min: 20, max: 35, unit: '°C' },
        pressure: { min: 1, max: 1.1, unit: 'atm' },
        pH: { min: 6.5, max: 7.5 }
      },
      materials: {
        anode: ['Carbon cloth', 'Graphite felt'],
        cathode: ['Carbon cloth with Pt', 'Graphite with Pt'],
        electrolyte: ['Phosphate buffer', 'Potassium ferricyanide'],
        membrane: ['Nafion', 'PEM']
      }
    },
    modelData: {
      dimensions: { length: 15, width: 10, height: 8, unit: 'cm' },
      chambers: 2,
      electrodeArea: { value: 50, unit: 'cm²' },
      volume: { value: 600, unit: 'mL' }
    }
  },
  {
    id: 'stacked-mfc',
    name: 'Stacked MFC System',
    category: 'MFC',
    description: 'Multiple MFC units connected in series or parallel',
    applications: ['Scaled power generation', 'Industrial wastewater treatment'],
    advantages: ['Higher voltage/current', 'Scalable design', 'Practical power levels'],
    limitations: ['Complex management', 'Uneven performance', 'Higher maintenance'],
    specifications: {
      powerDensity: { typical: 1200, max: 3000, unit: 'mW/m²' },
      efficiency: { typical: 20, max: 35, unit: '%' },
      operatingConditions: {
        temperature: { min: 20, max: 40, unit: '°C' },
        pressure: { min: 1, max: 1.2, unit: 'atm' },
        pH: { min: 6, max: 8 }
      },
      materials: {
        anode: ['Carbon cloth array', 'Graphite plates'],
        cathode: ['Air cathode array', 'Carbon cloth with Pt'],
        electrolyte: ['Wastewater', 'Synthetic medium']
      }
    },
    modelData: {
      dimensions: { length: 30, width: 20, height: 15, unit: 'cm' },
      chambers: 8,
      electrodeArea: { value: 400, unit: 'cm²' },
      volume: { value: 4800, unit: 'mL' }
    }
  }
]

// Fuel Cell Systems
const fuelCellSystems: SystemType[] = [
  {
    id: 'pem-fuel-cell',
    name: 'PEM Fuel Cell',
    category: 'PEM',
    description: 'Proton Exchange Membrane fuel cell for hydrogen-oxygen reaction',
    applications: ['Vehicle propulsion', 'Portable power', 'Backup power'],
    advantages: ['High efficiency', 'Quick start', 'Low temperature operation'],
    limitations: ['Expensive catalyst', 'Hydrogen storage', 'Membrane durability'],
    specifications: {
      powerDensity: { typical: 500, max: 1000, unit: 'mW/cm²' },
      efficiency: { typical: 50, max: 60, unit: '%' },
      operatingConditions: {
        temperature: { min: 60, max: 80, unit: '°C' },
        pressure: { min: 1, max: 3, unit: 'atm' }
      },
      materials: {
        anode: ['Pt/C catalyst', 'Carbon support'],
        cathode: ['Pt/C catalyst', 'Carbon support'],
        electrolyte: ['Nafion membrane'],
        membrane: ['Proton exchange membrane']
      }
    },
    modelData: {
      dimensions: { length: 20, width: 20, height: 2, unit: 'cm' },
      chambers: 1,
      electrodeArea: { value: 400, unit: 'cm²' },
      volume: { value: 800, unit: 'mL' }
    }
  },
  {
    id: 'sofc-fuel-cell',
    name: 'SOFC System',
    category: 'SOFC',
    description: 'Solid Oxide Fuel Cell for high temperature operation',
    applications: ['Stationary power', 'Combined heat and power', 'Industrial applications'],
    advantages: ['High efficiency', 'Fuel flexibility', 'Combined heat/power'],
    limitations: ['High temperature', 'Slow start', 'Thermal cycling issues'],
    specifications: {
      powerDensity: { typical: 300, max: 800, unit: 'mW/cm²' },
      efficiency: { typical: 60, max: 85, unit: '%' },
      operatingConditions: {
        temperature: { min: 800, max: 1000, unit: '°C' },
        pressure: { min: 1, max: 1.5, unit: 'atm' }
      },
      materials: {
        anode: ['Ni-YSZ cermet'],
        cathode: ['LSM-YSZ', 'LSCF'],
        electrolyte: ['YSZ', 'GDC']
      }
    },
    modelData: {
      dimensions: { length: 25, width: 25, height: 5, unit: 'cm' },
      chambers: 1,
      electrodeArea: { value: 625, unit: 'cm²' },
      volume: { value: 3125, unit: 'mL' }
    }
  }
]

// All systems catalog
export const unifiedSystemsCatalog: SystemType[] = [
  ...microbialSystems,
  ...fuelCellSystems
]

// Utility functions
export const getSystemById = (id: string): SystemType | undefined => {
  return unifiedSystemsCatalog.find(system => system.id === id)
}

export const getSystemsByCategory = (category: SystemType['category']): SystemType[] => {
  return unifiedSystemsCatalog.filter(system => system.category === category)
}

export const getMicrobialSystems = (): SystemType[] => {
  return unifiedSystemsCatalog.filter(system => 
    ['MFC', 'MEC', 'MDC'].includes(system.category)
  )
}

export const getFuelCellSystems = (): SystemType[] => {
  return unifiedSystemsCatalog.filter(system => 
    ['PEM', 'SOFC', 'PAFC', 'MCFC', 'AFC'].includes(system.category)
  )
}

export const getSystemCategories = (): string[] => {
  return [...new Set(unifiedSystemsCatalog.map(system => system.category))]
}

export const searchSystems = (query: string): SystemType[] => {
  const lowercaseQuery = query.toLowerCase()
  return unifiedSystemsCatalog.filter(system =>
    system.name.toLowerCase().includes(lowercaseQuery) ||
    system.description.toLowerCase().includes(lowercaseQuery) ||
    system.applications.some(app => app.toLowerCase().includes(lowercaseQuery))
  )
}