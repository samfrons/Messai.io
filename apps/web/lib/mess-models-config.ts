import type { 
  MESSModelConfig, 
  ModelParameterSchema,
  ModelPreset
} from '@/types/mess-models'

// Parameter schemas for each model type
export const modelParameterSchemas: Record<string, ModelParameterSchema> = {
  'lab-on-chip': {
    'channelWidth': {
      label: 'Channel Width',
      type: 'number',
      validation: { min: 50, max: 500, step: 10, units: 'μm', tooltip: 'Width of microfluidic channels' },
      category: 'geometry'
    },
    'channelHeight': {
      label: 'Channel Height',
      type: 'number',
      validation: { min: 20, max: 200, step: 5, units: 'μm', tooltip: 'Height of microfluidic channels' },
      category: 'geometry'
    },
    'flowRate': {
      label: 'Flow Rate',
      type: 'number',
      validation: { min: 0.1, max: 10, step: 0.1, units: 'μL/min', tooltip: 'Substrate flow rate through channels' },
      category: 'operation'
    },
    'electrodeSpacing': {
      label: 'Electrode Spacing',
      type: 'number',
      validation: { min: 100, max: 1000, step: 50, units: 'μm', tooltip: 'Distance between anode and cathode' },
      category: 'geometry'
    },
    'injectionMode': {
      label: 'Injection Mode',
      type: 'select',
      validation: { options: ['continuous', 'batch', 'pulsed'], tooltip: 'Substrate injection pattern' },
      category: 'operation'
    },
    'microfluidicDesign': {
      label: 'Channel Design',
      type: 'select',
      validation: { options: ['y-junction', 'serpentine', 'straight', 'custom'], tooltip: 'Microfluidic channel pattern' },
      category: 'geometry',
      advanced: true
    }
  },
  'benchtop-bioreactor': {
    'reactorVolume': {
      label: 'Reactor Volume',
      type: 'number',
      validation: { min: 1, max: 10, step: 0.5, units: 'L', tooltip: 'Working volume of bioreactor' },
      category: 'geometry'
    },
    'stirringSpeed': {
      label: 'Stirring Speed',
      type: 'number',
      validation: { min: 50, max: 500, step: 10, units: 'RPM', tooltip: 'Impeller rotation speed' },
      category: 'operation'
    },
    'temperature': {
      label: 'Temperature',
      type: 'number',
      validation: { min: 20, max: 40, step: 0.5, units: '°C', tooltip: 'Operating temperature' },
      category: 'environment'
    },
    'gasFlowRate': {
      label: 'Gas Flow Rate',
      type: 'number',
      validation: { min: 0.1, max: 2, step: 0.1, units: 'L/min', tooltip: 'Aeration or gas sparging rate' },
      category: 'operation'
    },
    'hrt': {
      label: 'HRT',
      type: 'number',
      validation: { min: 2, max: 48, step: 1, units: 'hours', tooltip: 'Hydraulic Retention Time' },
      category: 'operation'
    },
    'numberOfStacks': {
      label: 'Fuel Cell Stacks',
      type: 'number',
      validation: { min: 1, max: 10, step: 1, units: 'stacks', tooltip: 'Number of fuel cell stacks connected' },
      category: 'electrical'
    },
    'stackConfiguration': {
      label: 'Stack Configuration',
      type: 'select',
      validation: { options: ['series', 'parallel', 'hybrid'], tooltip: 'Electrical connection of stacks' },
      category: 'electrical',
      advanced: true
    }
  },
  'algal-facade': {
    'panelWidth': {
      label: 'Panel Width',
      type: 'number',
      validation: { min: 1, max: 3, step: 0.1, units: 'm', tooltip: 'Width of facade panel' },
      category: 'geometry'
    },
    'panelHeight': {
      label: 'Panel Height',
      type: 'number',
      validation: { min: 1, max: 3, step: 0.1, units: 'm', tooltip: 'Height of facade panel' },
      category: 'geometry'
    },
    'lightIntensity': {
      label: 'Light Intensity',
      type: 'number',
      validation: { min: 0, max: 2000, step: 50, units: 'μmol/m²/s', tooltip: 'Photosynthetic photon flux density' },
      category: 'environment'
    },
    'co2InjectionRate': {
      label: 'CO₂ Injection',
      type: 'number',
      validation: { min: 0, max: 5, step: 0.1, units: '%', tooltip: 'CO₂ concentration in air supply' },
      category: 'operation'
    },
    'algaeSpecies': {
      label: 'Algae Species',
      type: 'select',
      validation: { 
        options: ['chlorella', 'spirulina', 'scenedesmus', 'dunaliella'], 
        tooltip: 'Species of microalgae'
      },
      category: 'biological'
    },
    'harvestingFrequency': {
      label: 'Harvest Frequency',
      type: 'number',
      validation: { min: 1, max: 30, step: 1, units: 'days', tooltip: 'Days between harvesting' },
      category: 'operation',
      advanced: true
    },
    'orientation': {
      label: 'Panel Orientation',
      type: 'select',
      validation: { options: ['north', 'south', 'east', 'west'], tooltip: 'Cardinal direction panel faces' },
      category: 'geometry',
      advanced: true
    }
  },
  'wastewater-treatment': {
    'systemCapacity': {
      label: 'System Capacity',
      type: 'number',
      validation: { min: 100, max: 10000, step: 100, units: 'L/day', tooltip: 'Daily treatment capacity' },
      category: 'operation'
    },
    'influentCOD': {
      label: 'Influent COD',
      type: 'number',
      validation: { min: 200, max: 2000, step: 50, units: 'mg/L', tooltip: 'Chemical Oxygen Demand of influent' },
      category: 'water-quality'
    },
    'hrt': {
      label: 'HRT',
      type: 'number',
      validation: { min: 4, max: 24, step: 1, units: 'hours', tooltip: 'Hydraulic Retention Time' },
      category: 'operation'
    },
    'srt': {
      label: 'SRT',
      type: 'number',
      validation: { min: 5, max: 30, step: 1, units: 'days', tooltip: 'Solids Retention Time' },
      category: 'operation',
      advanced: true
    },
    'numberOfModules': {
      label: 'MFC Modules',
      type: 'number',
      validation: { min: 10, max: 100, step: 5, units: 'modules', tooltip: 'Number of MFC modules in system' },
      category: 'geometry'
    },
    'aerationRate': {
      label: 'Aeration Rate',
      type: 'number',
      validation: { min: 0, max: 10, step: 0.5, units: 'L/min', tooltip: 'Air supply rate for cathode' },
      category: 'operation'
    },
    'pretreatment': {
      label: 'Pretreatment',
      type: 'select',
      validation: { options: ['screening', 'settling', 'none'], tooltip: 'Primary treatment method' },
      category: 'process',
      advanced: true
    }
  },
  'benthic-fuel-cell': {
    'deploymentDepth': {
      label: 'Deployment Depth',
      type: 'number',
      validation: { min: 0.5, max: 100, step: 0.5, units: 'm', tooltip: 'Water depth at deployment site' },
      category: 'environment'
    },
    'sedimentType': {
      label: 'Sediment Type',
      type: 'select',
      validation: { options: ['sand', 'silt', 'clay', 'mixed'], tooltip: 'Dominant sediment composition' },
      category: 'environment'
    },
    'salinity': {
      label: 'Salinity',
      type: 'number',
      validation: { min: 0, max: 35, step: 1, units: 'ppt', tooltip: 'Water salinity' },
      category: 'environment'
    },
    'anodeBurialDepth': {
      label: 'Anode Burial Depth',
      type: 'number',
      validation: { min: 5, max: 50, step: 5, units: 'cm', tooltip: 'Depth of anode burial in sediment' },
      category: 'geometry'
    },
    'tidalAmplitude': {
      label: 'Tidal Amplitude',
      type: 'number',
      validation: { min: 0, max: 5, step: 0.1, units: 'm', tooltip: 'Average tidal height variation' },
      category: 'environment'
    },
    'temperature': {
      label: 'Temperature',
      type: 'number',
      validation: { min: 5, max: 30, step: 1, units: '°C', tooltip: 'Average water temperature' },
      category: 'environment'
    },
    'anchoringSystem': {
      label: 'Anchoring System',
      type: 'select',
      validation: { options: ['weighted', 'piled', 'tethered'], tooltip: 'Method of securing deployment' },
      category: 'mechanical',
      advanced: true
    }
  }
}

// Model presets for quick start
export const modelPresets: Record<string, ModelPreset[]> = {
  'lab-on-chip': [
    {
      id: 'loc-basic',
      name: 'Basic Research',
      description: 'Standard configuration for initial experiments',
      modelType: 'lab-on-chip',
      parameters: {
        channelWidth: 200,
        channelHeight: 100,
        flowRate: 1,
        electrodeSpacing: 500,
        injectionMode: 'continuous',
        microfluidicDesign: 'y-junction'
      },
      expectedPerformance: {
        powerDensity: 0.05,
        coulombicEfficiency: 15
      }
    },
    {
      id: 'loc-optimized',
      name: 'Optimized Performance',
      description: 'High-performance configuration',
      modelType: 'lab-on-chip',
      parameters: {
        channelWidth: 100,
        channelHeight: 50,
        flowRate: 0.5,
        electrodeSpacing: 200,
        injectionMode: 'pulsed',
        microfluidicDesign: 'serpentine'
      },
      expectedPerformance: {
        powerDensity: 0.1,
        coulombicEfficiency: 25
      }
    }
  ],
  'benchtop-bioreactor': [
    {
      id: 'bb-standard',
      name: 'Standard Setup',
      description: '5L reactor for laboratory experiments',
      modelType: 'benchtop-bioreactor',
      parameters: {
        reactorVolume: 5,
        stirringSpeed: 200,
        temperature: 30,
        gasFlowRate: 0.5,
        hrt: 12,
        numberOfStacks: 1,
        stackConfiguration: 'series'
      },
      expectedPerformance: {
        powerDensity: 5,
        coulombicEfficiency: 40,
        energyRecovery: 20
      }
    },
    {
      id: 'bb-high-power',
      name: 'High Power Output',
      description: 'Optimized for maximum power generation',
      modelType: 'benchtop-bioreactor',
      parameters: {
        reactorVolume: 8,
        stirringSpeed: 350,
        temperature: 35,
        gasFlowRate: 1.5,
        hrt: 8,
        numberOfStacks: 5,
        stackConfiguration: 'parallel'
      },
      expectedPerformance: {
        powerDensity: 15,
        coulombicEfficiency: 60,
        energyRecovery: 35
      }
    }
  ],
  'algal-facade': [
    {
      id: 'af-residential',
      name: 'Residential Building',
      description: 'Small-scale facade for homes',
      modelType: 'algal-facade',
      parameters: {
        panelWidth: 2,
        panelHeight: 1,
        lightIntensity: 800,
        co2InjectionRate: 2,
        algaeSpecies: 'chlorella',
        harvestingFrequency: 7,
        orientation: 'south'
      },
      expectedPerformance: {
        powerDensity: 10,
        coulombicEfficiency: 30,
        co2Fixation: 50
      }
    },
    {
      id: 'af-commercial',
      name: 'Commercial Building',
      description: 'Large-scale facade for offices',
      modelType: 'algal-facade',
      parameters: {
        panelWidth: 3,
        panelHeight: 2,
        lightIntensity: 1200,
        co2InjectionRate: 3,
        algaeSpecies: 'spirulina',
        harvestingFrequency: 5,
        orientation: 'south'
      },
      expectedPerformance: {
        powerDensity: 25,
        coulombicEfficiency: 45,
        co2Fixation: 150
      }
    }
  ],
  'wastewater-treatment': [
    {
      id: 'wt-municipal',
      name: 'Municipal Plant',
      description: 'City wastewater treatment',
      modelType: 'wastewater-treatment',
      parameters: {
        systemCapacity: 5000,
        influentCOD: 500,
        hrt: 12,
        srt: 15,
        numberOfModules: 50,
        aerationRate: 5,
        pretreatment: 'screening'
      },
      expectedPerformance: {
        powerDensity: 8,
        coulombicEfficiency: 35,
        removalEfficiency: 85
      }
    },
    {
      id: 'wt-industrial',
      name: 'Industrial Effluent',
      description: 'High-strength wastewater',
      modelType: 'wastewater-treatment',
      parameters: {
        systemCapacity: 2000,
        influentCOD: 1500,
        hrt: 20,
        srt: 25,
        numberOfModules: 80,
        aerationRate: 8,
        pretreatment: 'settling'
      },
      expectedPerformance: {
        powerDensity: 20,
        coulombicEfficiency: 50,
        removalEfficiency: 90
      }
    }
  ],
  'benthic-fuel-cell': [
    {
      id: 'bmfc-coastal',
      name: 'Coastal Deployment',
      description: 'Shallow water marine environment',
      modelType: 'benthic-fuel-cell',
      parameters: {
        deploymentDepth: 5,
        sedimentType: 'sand',
        salinity: 30,
        anodeBurialDepth: 15,
        tidalAmplitude: 2,
        temperature: 20,
        anchoringSystem: 'weighted'
      },
      expectedPerformance: {
        powerDensity: 5,
        coulombicEfficiency: 20
      }
    },
    {
      id: 'bmfc-deepwater',
      name: 'Deep Water',
      description: 'Offshore deployment',
      modelType: 'benthic-fuel-cell',
      parameters: {
        deploymentDepth: 50,
        sedimentType: 'silt',
        salinity: 35,
        anodeBurialDepth: 30,
        tidalAmplitude: 0.5,
        temperature: 10,
        anchoringSystem: 'tethered'
      },
      expectedPerformance: {
        powerDensity: 15,
        coulombicEfficiency: 35
      }
    }
  ]
}

// Animation configurations for each model
export const modelAnimationConfigs = {
  'lab-on-chip': {
    hasFlowVisualization: true,
    hasBiofilmGrowth: true,
    hasGasProduction: false,
    hasPerformanceOverlay: true,
    customAnimations: ['microfluidic-flow', 'substrate-mixing']
  },
  'benchtop-bioreactor': {
    hasFlowVisualization: true,
    hasBiofilmGrowth: true,
    hasGasProduction: true,
    hasPerformanceOverlay: true,
    customAnimations: ['stirrer-rotation', 'bubble-rise', 'circulation-pattern']
  },
  'algal-facade': {
    hasFlowVisualization: false,
    hasBiofilmGrowth: true,
    hasGasProduction: true,
    hasPerformanceOverlay: true,
    customAnimations: ['photosynthesis-glow', 'diurnal-cycle', 'algae-growth']
  },
  'wastewater-treatment': {
    hasFlowVisualization: true,
    hasBiofilmGrowth: true,
    hasGasProduction: true,
    hasPerformanceOverlay: true,
    customAnimations: ['flow-distribution', 'sludge-settling', 'aeration-bubbles']
  },
  'benthic-fuel-cell': {
    hasFlowVisualization: true,
    hasBiofilmGrowth: true,
    hasGasProduction: false,
    hasPerformanceOverlay: true,
    customAnimations: ['tidal-flow', 'sediment-particles', 'bioturbation']
  }
}