// Algal Fuel Cell Database and Configuration

export const algaeDatabase = {
  chlorella: {
    name: 'Chlorella vulgaris',
    color: 0x00ff00,
    efficiency: 0.12,
    electronTransferRate: 2.3e8,
    co2FixationRate: 45,
    optimalPH: 7.0,
    optimalTemp: 25,
    growthRate: 0.8
  },
  spirulina: {
    name: 'Spirulina platensis',
    color: 0x00ffff,
    efficiency: 0.10,
    electronTransferRate: 1.8e8,
    co2FixationRate: 38,
    optimalPH: 8.5,
    optimalTemp: 30,
    growthRate: 0.6
  },
  scenedesmus: {
    name: 'Scenedesmus obliquus',
    color: 0x88ff00,
    efficiency: 0.11,
    electronTransferRate: 2.0e8,
    co2FixationRate: 42,
    optimalPH: 7.5,
    optimalTemp: 27,
    growthRate: 0.7
  },
  dunaliella: {
    name: 'Dunaliella salina',
    color: 0xff8800,
    efficiency: 0.09,
    electronTransferRate: 1.5e8,
    co2FixationRate: 35,
    optimalPH: 7.8,
    optimalTemp: 28,
    growthRate: 0.5
  },
  chlamydomonas: {
    name: 'Chlamydomonas reinhardtii',
    color: 0x00ff88,
    efficiency: 0.13,
    electronTransferRate: 2.5e8,
    co2FixationRate: 48,
    optimalPH: 7.2,
    optimalTemp: 24,
    growthRate: 0.9
  },
  synechocystis: {
    name: 'Synechocystis sp.',
    color: 0x0088ff,
    efficiency: 0.14,
    electronTransferRate: 2.7e8,
    co2FixationRate: 52,
    optimalPH: 7.5,
    optimalTemp: 30,
    growthRate: 0.85
  },
  anabaena: {
    name: 'Anabaena variabilis',
    color: 0x8800ff,
    efficiency: 0.11,
    electronTransferRate: 2.1e8,
    co2FixationRate: 40,
    optimalPH: 7.8,
    optimalTemp: 28,
    growthRate: 0.65
  },
  mixed: {
    name: 'Mixed Culture',
    color: 0x44ff44,
    efficiency: 0.115,
    electronTransferRate: 2.15e8,
    co2FixationRate: 43,
    optimalPH: 7.5,
    optimalTemp: 27,
    growthRate: 0.75
  }
}

export const electrodesDatabase = {
  anode: {
    graphene: { conductivity: 0.96, cost: 100, surfaceArea: 2600, stability: 0.95 },
    'carbon-cloth': { conductivity: 0.75, cost: 20, surfaceArea: 1500, stability: 0.85 },
    'carbon-felt': { conductivity: 0.70, cost: 15, surfaceArea: 2000, stability: 0.80 },
    graphite: { conductivity: 0.60, cost: 5, surfaceArea: 500, stability: 0.90 },
    cnt: { conductivity: 0.95, cost: 150, surfaceArea: 3000, stability: 0.88 },
    biochar: { conductivity: 0.50, cost: 3, surfaceArea: 1000, stability: 0.75 },
    rgo: { conductivity: 0.85, cost: 80, surfaceArea: 2200, stability: 0.82 },
    'carbon-paper': { conductivity: 0.72, cost: 25, surfaceArea: 1200, stability: 0.83 },
    'carbon-brush': { conductivity: 0.68, cost: 30, surfaceArea: 2500, stability: 0.78 }
  },
  cathode: {
    mxene: { conductivity: 0.98, cost: 200, oxygenReduction: 0.95, stability: 0.92 },
    platinum: { conductivity: 0.99, cost: 1000, oxygenReduction: 0.99, stability: 0.98 },
    'graphene-oxide': { conductivity: 0.80, cost: 80, oxygenReduction: 0.70, stability: 0.75 },
    'carbon-cloth-pt': { conductivity: 0.85, cost: 300, oxygenReduction: 0.90, stability: 0.88 },
    mno2: { conductivity: 0.65, cost: 30, oxygenReduction: 0.75, stability: 0.80 },
    pani: { conductivity: 0.70, cost: 50, oxygenReduction: 0.72, stability: 0.70 },
    mos2: { conductivity: 0.82, cost: 120, oxygenReduction: 0.85, stability: 0.85 },
    co3o4: { conductivity: 0.75, cost: 90, oxygenReduction: 0.82, stability: 0.83 },
    'nitrogen-carbon': { conductivity: 0.78, cost: 60, oxygenReduction: 0.80, stability: 0.86 }
  }
}

export const mediatorsDatabase = {
  none: { redoxPotential: 0, electronTransferRate: 1.0, toxicity: 0 },
  'methylene-blue': { redoxPotential: 0.011, electronTransferRate: 1.8, toxicity: 0.2 },
  'neutral-red': { redoxPotential: -0.325, electronTransferRate: 1.6, toxicity: 0.3 },
  ferricyanide: { redoxPotential: 0.361, electronTransferRate: 2.2, toxicity: 0.5 },
  quinone: { redoxPotential: 0.280, electronTransferRate: 1.9, toxicity: 0.4 },
  riboflavin: { redoxPotential: -0.208, electronTransferRate: 1.5, toxicity: 0.1 }
}

export const separatorsDatabase = {
  none: { protonConductivity: 1.0, cost: 0, resistance: 0.1 },
  pem: { protonConductivity: 0.9, cost: 100, resistance: 0.5 },
  'salt-bridge': { protonConductivity: 0.6, cost: 10, resistance: 2.0 },
  ceramic: { protonConductivity: 0.7, cost: 50, resistance: 1.5 },
  cellulose: { protonConductivity: 0.5, cost: 20, resistance: 2.5 },
  agar: { protonConductivity: 0.4, cost: 5, resistance: 3.0 },
  'glass-frit': { protonConductivity: 0.55, cost: 30, resistance: 2.2 }
}

export const presets = {
  optimal: {
    name: 'High Performance',
    algae: { type: 'synechocystis', density: 10.0, volume: 500, growthPhase: 'exponential', biofilm: 40 },
    electrodes: { anodeMaterial: 'cnt', cathodeMaterial: 'mxene', area: 100, separation: 1.5, surfaceModification: 'plasma' },
    separator: { type: 'pem', thickness: 0.12 },
    environment: { lightIntensity: 400, lightSpectrum: 'red-blue', temperature: 30, ph: 7.5, co2: 8 },
    mediators: { types: ['methylene-blue'], concentration: 0.5 },
    medium: { type: 'bg11', nitrogen: 'mixed', phosphate: 2.0 },
    electrical: { externalResistance: 500, connectionType: 'single', cellCount: 1 },
    flow: { operationMode: 'continuous', flowRate: 5, mixingSpeed: 200, aerationRate: 1.0 },
    process: { lightCycle: '18:6', retentionTime: 48 }
  },
  lowcost: {
    name: 'Budget Friendly',
    algae: { type: 'chlorella', density: 5.0, volume: 100, growthPhase: 'exponential', biofilm: 20 },
    electrodes: { anodeMaterial: 'biochar', cathodeMaterial: 'mno2', area: 25, separation: 2.0, surfaceModification: 'none' },
    separator: { type: 'salt-bridge', thickness: 0.5 },
    environment: { lightIntensity: 150, lightSpectrum: 'white', temperature: 25, ph: 7.0, co2: 3 },
    mediators: { types: ['none'], concentration: 0 },
    medium: { type: 'bold', nitrogen: 'nitrate', phosphate: 0.5 },
    electrical: { externalResistance: 1000, connectionType: 'single', cellCount: 1 },
    flow: { operationMode: 'batch', flowRate: 0, mixingSpeed: 50, aerationRate: 0.2 },
    process: { lightCycle: '12:12', retentionTime: 24 }
  },
  highpower: {
    name: 'Maximum Power',
    algae: { type: 'mixed', density: 20.0, volume: 1000, growthPhase: 'exponential', biofilm: 60 },
    electrodes: { anodeMaterial: 'graphene', cathodeMaterial: 'platinum', area: 200, separation: 1.0, surfaceModification: 'metal-nanoparticles' },
    separator: { type: 'pem', thickness: 0.1 },
    environment: { lightIntensity: 600, lightSpectrum: 'full-spectrum', temperature: 32, ph: 7.8, co2: 10 },
    mediators: { types: ['ferricyanide', 'methylene-blue'], concentration: 1.0 },
    medium: { type: 'f2', nitrogen: 'mixed', phosphate: 3.0 },
    electrical: { externalResistance: 100, connectionType: 'parallel', cellCount: 4 },
    flow: { operationMode: 'continuous', flowRate: 20, mixingSpeed: 300, aerationRate: 2.0 },
    process: { lightCycle: '20:4', retentionTime: 72 }
  },
  research: {
    name: 'Laboratory Scale',
    algae: { type: 'chlamydomonas', density: 8.0, volume: 250, growthPhase: 'exponential', biofilm: 30 },
    electrodes: { anodeMaterial: 'carbon-cloth', cathodeMaterial: 'carbon-cloth-pt', area: 50, separation: 1.5, surfaceModification: 'chemical' },
    separator: { type: 'ceramic', thickness: 0.2 },
    environment: { lightIntensity: 300, lightSpectrum: 'red-blue', temperature: 28, ph: 7.2, co2: 5 },
    mediators: { types: ['neutral-red'], concentration: 0.3 },
    medium: { type: 'tap', nitrogen: 'urea', phosphate: 1.5 },
    electrical: { externalResistance: 800, connectionType: 'single', cellCount: 1 },
    flow: { operationMode: 'fed-batch', flowRate: 2, mixingSpeed: 150, aerationRate: 0.8 },
    process: { lightCycle: '16:8', retentionTime: 36 }
  }
}

export const defaultParameters = {
  algae: {
    type: 'mixed',
    density: 5.0, // × 10⁶ cells/mL
    volume: 100, // mL
    growthPhase: 'exponential',
    biofilm: 20 // %
  },
  electrodes: {
    anodeMaterial: 'graphene',
    cathodeMaterial: 'mxene',
    area: 25, // cm²
    separation: 2.0, // cm
    surfaceModification: 'none'
  },
  separator: {
    type: 'pem',
    thickness: 0.18 // mm
  },
  environment: {
    lightIntensity: 200, // μmol/m²/s
    lightSpectrum: 'white',
    temperature: 25, // °C
    ph: 7.0,
    co2: 5.0 // %
  },
  mediators: {
    types: ['none'],
    concentration: 0.1 // mM
  },
  medium: {
    type: 'bg11',
    nitrogen: 'nitrate',
    phosphate: 1.0 // mM
  },
  electrical: {
    externalResistance: 1000, // Ω
    connectionType: 'single',
    cellCount: 1
  },
  flow: {
    operationMode: 'batch',
    flowRate: 0, // mL/min
    mixingSpeed: 100, // RPM
    aerationRate: 0.5 // vvm
  },
  process: {
    lightCycle: '16:8',
    retentionTime: 24 // h
  },
  performance: {
    power: 0,
    powerDensity: 0,
    efficiency: 0,
    voltage: 0,
    current: 0,
    resistance: 0,
    co2Fixation: 0,
    coulombicEfficiency: 0,
    energyRecovery: 0,
    volumetricPower: 0
  }
}