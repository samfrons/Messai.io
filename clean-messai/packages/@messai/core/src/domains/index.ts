// Scientific domain models and data

/**
 * Electrode material database
 */
export interface ElectrodeMaterial {
  id: string
  name: string
  category: 'carbon' | 'metal' | 'nanomaterial' | 'composite'
  properties: {
    conductivity: number      // S/cm
    surfaceArea: number       // m²/g
    porosity: number          // %
    cost: number             // $/m²
  }
  applications: string[]
}

export const ELECTRODE_MATERIALS: ElectrodeMaterial[] = [
  {
    id: 'carbon_cloth',
    name: 'Carbon Cloth',
    category: 'carbon',
    properties: {
      conductivity: 1000,
      surfaceArea: 0.5,
      porosity: 75,
      cost: 50
    },
    applications: ['MFC', 'MEC', 'MDC']
  },
  {
    id: 'graphite_felt',
    name: 'Graphite Felt',
    category: 'carbon',
    properties: {
      conductivity: 800,
      surfaceArea: 0.3,
      porosity: 85,
      cost: 30
    },
    applications: ['MFC', 'MEC']
  },
  {
    id: 'stainless_steel',
    name: 'Stainless Steel',
    category: 'metal',
    properties: {
      conductivity: 1500,
      surfaceArea: 0.1,
      porosity: 0,
      cost: 20
    },
    applications: ['MEC', 'MDC']
  }
]

/**
 * Microbial species database
 */
export interface MicrobialSpecies {
  id: string
  species: string
  genus: string
  characteristics: {
    electronTransfer: 'direct' | 'mediated' | 'both'
    optimalTemp: number       // °C
    optimalPH: number
    growthRate: number        // h⁻¹
    powerDensity: number      // mW/m²
  }
  cultivation: {
    medium: string
    atmosphere: 'aerobic' | 'anaerobic' | 'facultative'
  }
}

export const MICROBIAL_SPECIES: MicrobialSpecies[] = [
  {
    id: 'geobacter_sulfurreducens',
    species: 'sulfurreducens',
    genus: 'Geobacter',
    characteristics: {
      electronTransfer: 'direct',
      optimalTemp: 30,
      optimalPH: 7.0,
      growthRate: 0.15,
      powerDensity: 200
    },
    cultivation: {
      medium: 'acetate',
      atmosphere: 'anaerobic'
    }
  },
  {
    id: 'shewanella_oneidensis',
    species: 'oneidensis',
    genus: 'Shewanella',
    characteristics: {
      electronTransfer: 'both',
      optimalTemp: 25,
      optimalPH: 7.2,
      growthRate: 0.25,
      powerDensity: 150
    },
    cultivation: {
      medium: 'lactate',
      atmosphere: 'facultative'
    }
  }
]

/**
 * System design templates
 */
export interface SystemDesign {
  id: string
  name: string
  type: 'MFC' | 'MEC' | 'MDC' | 'MES'
  description: string
  typicalApplications: string[]
  performanceRange: {
    powerDensity: [number, number] // mW/m² [min, max]
    efficiency: [number, number]   // % [min, max]
  }
}

export const SYSTEM_DESIGNS: SystemDesign[] = [
  {
    id: 'single_chamber_mfc',
    name: 'Single Chamber MFC',
    type: 'MFC',
    description: 'Air cathode microbial fuel cell with single chamber design',
    typicalApplications: ['Wastewater treatment', 'Biosensors', 'Remote power'],
    performanceRange: {
      powerDensity: [10, 500],
      efficiency: [10, 60]
    }
  },
  {
    id: 'dual_chamber_mfc',
    name: 'Dual Chamber MFC',
    type: 'MFC',
    description: 'Two chamber design with proton exchange membrane',
    typicalApplications: ['Research', 'Water treatment', 'Desalination'],
    performanceRange: {
      powerDensity: [50, 1000],
      efficiency: [20, 80]
    }
  }
]