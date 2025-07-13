// Demo mode utilities for MESSAI application
export interface DemoModeConfig {
  enabled: boolean
  features: {
    experiments: boolean
    research: boolean
    predictions: boolean
    visualization: boolean
  }
  data: {
    useSampleData: boolean
    limitResults: boolean
  }
}

// Default demo configuration
export const defaultDemoConfig: DemoModeConfig = {
  enabled: process.env.NODE_ENV === 'development',
  features: {
    experiments: true,
    research: true,
    predictions: true,
    visualization: true
  },
  data: {
    useSampleData: true,
    limitResults: true
  }
}

// Demo mode state management
let demoConfig: DemoModeConfig = { ...defaultDemoConfig }

export const getDemoConfig = (): DemoModeConfig => demoConfig

export const setDemoMode = (enabled: boolean): void => {
  demoConfig = {
    ...demoConfig,
    enabled
  }
}

export const updateDemoConfig = (updates: Partial<DemoModeConfig>): void => {
  demoConfig = {
    ...demoConfig,
    ...updates
  }
}

export const isDemoMode = (): boolean => demoConfig.enabled

export const isFeatureEnabled = (feature: keyof DemoModeConfig['features']): boolean => {
  return demoConfig.enabled && demoConfig.features[feature]
}

// Sample data for demo mode
export const sampleExperiments = [
  {
    id: 'demo-1',
    name: 'MFC Performance Test',
    type: 'MFC',
    status: 'completed',
    powerOutput: 125.5,
    efficiency: 78.2,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'demo-2', 
    name: 'Algal Fuel Cell Optimization',
    type: 'AFC',
    status: 'running',
    powerOutput: 89.3,
    efficiency: 65.1,
    createdAt: new Date('2024-01-20')
  }
]

export const sampleResearchPapers = [
  {
    id: 'paper-1',
    title: 'Advanced Electrode Materials for Microbial Fuel Cells',
    authors: ['Dr. Smith', 'Dr. Johnson'],
    year: 2024,
    journal: 'Energy Research',
    powerDensity: 1250,
    efficiency: 82.5
  },
  {
    id: 'paper-2',
    title: 'Optimization of Biofilm Formation in MFC Systems', 
    authors: ['Dr. Chen', 'Dr. Williams'],
    year: 2023,
    journal: 'Bioelectrochemistry',
    powerDensity: 980,
    efficiency: 75.3
  }
]