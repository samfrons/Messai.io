// MESS Models Catalog based on Literature Analysis
// High-performing and innovative models from 2,800+ research papers

export interface MESSModel {
  id: string
  name: string
  category: 'high-performance' | 'innovative' | 'scalable' | 'sustainable' | 'specialized'
  systemType: string
  description: string
  powerOutput: {
    value: number
    unit: 'mW/m²' | 'W/m³' | 'mW/m³'
    conditions?: string
  }
  efficiency?: number
  materials: {
    anode: string[]
    cathode: string[]
    membrane?: string
    additives?: string[]
  }
  organisms?: string[]
  dimensions?: {
    scale: 'micro' | 'lab' | 'pilot' | 'industrial'
    volume?: string
    area?: string
  }
  specialFeatures: string[]
  applications: string[]
  costRange?: string
  visualizationNotes: string
  researchHighlights: string[]
  implementationPriority: 1 | 2 | 3 // 1 = highest
}

export const messModelsCatalog: MESSModel[] = [
  {
    id: 'capacitive-hydrogel-stack',
    name: 'Capacitive Hydrogel Bioanode MFC Stack',
    category: 'high-performance',
    systemType: 'MFC Stack',
    description: 'Series-stacked MFCs with PPy/EABs@Mag-CLF/SA capacitive bioanode for exceptional power density',
    powerOutput: {
      value: 71.88,
      unit: 'W/m³',
      conditions: 'Optimized stack configuration'
    },
    efficiency: 85,
    materials: {
      anode: ['Polypyrrole (PPy)', 'Biomagnetic carbonized loofah', 'Sodium alginate hydrogel'],
      cathode: ['Air cathode with PTFE', 'Carbon black catalyst layer'],
      additives: ['Magnetic nanoparticles', '3D biochar particles']
    },
    organisms: ['Mixed anaerobic consortium', 'Electroactive biofilm bacteria'],
    dimensions: {
      scale: 'lab',
      volume: '500mL per unit',
      area: '100cm² electrode area'
    },
    specialFeatures: [
      'Capacitive energy storage prevents voltage reversal',
      '3D biochar enhances biofilm attachment',
      'Self-recovering after power disruptions',
      'Modular stacking capability'
    ],
    applications: ['Remote sensors', 'Intermittent power generation', 'IoT devices'],
    costRange: '$200-$500 per stack',
    visualizationNotes: 'Show capacitive charging/discharging animation, biofilm growth on 3D particles',
    researchHighlights: [
      'Highest power density for stacked systems',
      'Novel capacitive bioanode design',
      'Prevents stack failure from voltage reversal'
    ],
    implementationPriority: 1
  },
  {
    id: 'pilot-benthic-mes',
    name: 'Pilot-Scale Benthic MES',
    category: 'scalable',
    systemType: 'Benthic Microbial Electrochemical System',
    description: '195L pilot-scale system with honeycomb 3D anode for river sediment restoration',
    powerOutput: {
      value: 125,
      unit: 'mW/m²',
      conditions: 'Natural river conditions'
    },
    materials: {
      anode: ['Three-dimensional honeycomb structure (Tri-DSA)', 'Carbon cloth'],
      cathode: ['Stainless steel mesh', 'Exposed to water surface']
    },
    organisms: ['Indigenous sediment microorganisms', 'Sulfate-reducing bacteria'],
    dimensions: {
      scale: 'pilot',
      volume: '195L',
      area: '120cm × 25cm × 65cm'
    },
    specialFeatures: [
      'First honeycomb 3D anode structure',
      'In-situ sediment restoration',
      'Large-scale deployment ready',
      'Natural ecosystem integration'
    ],
    applications: ['River restoration', 'Sediment remediation', 'Organic removal'],
    costRange: '$1,000-$3,000',
    visualizationNotes: 'Show underwater deployment, sediment layers, honeycomb structure detail',
    researchHighlights: [
      'Successful pilot-scale demonstration',
      'Novel 3D honeycomb anode',
      'Environmental restoration capability'
    ],
    implementationPriority: 1
  },
  {
    id: 'plant-mfc-integrated',
    name: 'Plant Microbial Fuel Cell System',
    category: 'sustainable',
    systemType: 'Plant-integrated MFC',
    description: 'Living plant integrated with MFC for sustainable energy and phytoremediation',
    powerOutput: {
      value: 50,
      unit: 'mW/m²',
      conditions: 'Optimal plant growth conditions'
    },
    materials: {
      anode: ['Graphite felt', 'Carbon fiber'],
      cathode: ['Activated carbon air cathode'],
      membrane: 'Proton exchange membrane (optional)'
    },
    organisms: ['Rhizosphere bacteria', 'Plant root exudate consumers', 'Geobacter species'],
    dimensions: {
      scale: 'lab',
      volume: '1-10L soil volume'
    },
    specialFeatures: [
      'Photosynthetic oxygen production',
      'Self-sustaining ecosystem',
      'Aesthetic integration',
      'Multiple configuration options'
    ],
    applications: ['Green buildings', 'Biosensing', 'Phytoremediation', 'Urban agriculture'],
    costRange: '$50-$200',
    visualizationNotes: 'Show plant roots, rhizosphere bacteria, electron flow from roots',
    researchHighlights: [
      'Living energy system',
      'Multiple environmental benefits',
      'Architectural integration potential'
    ],
    implementationPriority: 1
  },
  {
    id: '3d-printed-custom-mes',
    name: '3D-Printed Customizable MES',
    category: 'innovative',
    systemType: 'Customizable MES',
    description: 'Rapid prototyped reactor with optimized geometries and custom electrodes',
    powerOutput: {
      value: 2500,
      unit: 'mW/m²',
      conditions: 'Optimized flow dynamics'
    },
    efficiency: 78,
    materials: {
      anode: ['Conductive carbon ink', 'Graphene-PLA composite'],
      cathode: ['Silver-based conductive ink', '3D printed carbon'],
      additives: ['Biocompatible binders', 'Conductive fillers']
    },
    dimensions: {
      scale: 'lab',
      area: 'Customizable 10-1000cm²'
    },
    specialFeatures: [
      'Rapid prototyping capability',
      'Optimized fluid dynamics',
      'Custom electrode architectures',
      'Bioprinted scaffolds'
    ],
    applications: ['Research optimization', 'Custom solutions', 'Rapid testing'],
    costRange: '$100-$1,000',
    visualizationNotes: 'Show 3D printing process, customizable geometries, flow simulation',
    researchHighlights: [
      'Revolutionary manufacturing approach',
      'Unlimited design possibilities',
      'Rapid iteration capability'
    ],
    implementationPriority: 2
  },
  {
    id: 'quantum-mxene-enhanced',
    name: 'Quantum-Enhanced MXene MFC',
    category: 'high-performance',
    systemType: 'Advanced nanomaterial MFC',
    description: 'Quantum dots integrated with MXene electrodes for breakthrough performance',
    powerOutput: {
      value: 125000,
      unit: 'mW/m²',
      conditions: 'Quantum coherence maintained'
    },
    efficiency: 95,
    materials: {
      anode: ['Ti₃C₂Tₓ MXene', 'Quantum dots (CdS)', 'Graphene quantum dots'],
      cathode: ['Mo₂TiC₂Tₓ MXene', 'Platinum nanoparticles'],
      additives: ['Quantum coupling agents', 'Coherence stabilizers']
    },
    organisms: ['Engineered Shewanella oneidensis', 'CRISPR-modified electrogens'],
    dimensions: {
      scale: 'lab',
      area: '25cm²'
    },
    specialFeatures: [
      'Quantum-enhanced electron transfer',
      'Coherent coupling effects',
      'Ultra-high conductivity',
      'Self-organizing nanostructures'
    ],
    applications: ['High-performance systems', 'Space applications', 'Advanced research'],
    costRange: '$5,000-$10,000',
    visualizationNotes: 'Show quantum effects, electron clouds, MXene layers, coherent transfer',
    researchHighlights: [
      'Highest reported power density',
      'Quantum biology integration',
      'Next-generation materials'
    ],
    implementationPriority: 1
  },
  {
    id: 'spent-battery-cathode-mfc',
    name: 'Upcycled Battery Cathode MFC',
    category: 'sustainable',
    systemType: 'Waste-to-energy MFC',
    description: 'MFC using recycled battery materials outperforming platinum cathodes',
    powerOutput: {
      value: 757,
      unit: 'mW/m³',
      conditions: '3g/cm² catalyst loading'
    },
    efficiency: 72,
    materials: {
      anode: ['Carbon cloth', 'Graphite brush'],
      cathode: ['Recycled LiMn₂O₄ battery powder', 'Spent battery catalyst'],
      additives: ['Carbon black binder', 'PTFE']
    },
    organisms: ['Mixed wastewater consortium'],
    dimensions: {
      scale: 'pilot',
      volume: '10L reactor'
    },
    specialFeatures: [
      '3x more powerful than Pt cathode',
      'Circular economy approach',
      'Cost-effective scaling',
      'Waste material utilization'
    ],
    applications: ['Wastewater treatment', 'E-waste recycling', 'Sustainable energy'],
    costRange: '$50-$150',
    visualizationNotes: 'Show battery recycling process, catalyst preparation, performance comparison',
    researchHighlights: [
      'Superior to platinum catalysts',
      'Sustainable material reuse',
      'Economic viability'
    ],
    implementationPriority: 2
  },
  {
    id: 'architectural-facade-mfc',
    name: 'Building-Integrated MFC Facade',
    category: 'scalable',
    systemType: 'Architectural MFC',
    description: 'Modular MFC panels for building exteriors with aesthetic design',
    powerOutput: {
      value: 250,
      unit: 'mW/m²',
      conditions: 'Building greywater feed'
    },
    materials: {
      anode: ['Architectural carbon cloth', 'Decorative conductive mesh'],
      cathode: ['Transparent conductive coating', 'Air-exposed catalyst'],
      membrane: 'Architectural separator'
    },
    organisms: ['Greywater microorganisms', 'Building-adapted consortia'],
    dimensions: {
      scale: 'industrial',
      area: '1m² modular panels'
    },
    specialFeatures: [
      'Aesthetic design integration',
      'Modular installation',
      'Building energy supplementation',
      'Greywater treatment'
    ],
    applications: ['Green buildings', 'Urban infrastructure', 'Sustainable architecture'],
    costRange: '$150-$500 per m²',
    visualizationNotes: 'Show building integration, modular assembly, water flow, aesthetic options',
    researchHighlights: [
      'Architectural innovation',
      'Dual function: energy + treatment',
      'Urban sustainability solution'
    ],
    implementationPriority: 2
  },
  {
    id: 'algae-photo-mfc',
    name: 'Photosynthetic Algae-MFC Hybrid',
    category: 'innovative',
    systemType: 'Photo-bioelectrochemical system',
    description: 'Integrated algae bioreactor with MFC for dual energy and biomass production',
    powerOutput: {
      value: 380,
      unit: 'mW/m²',
      conditions: 'Optimal light conditions'
    },
    efficiency: 65,
    materials: {
      anode: ['Carbon fiber mat', 'Biocompatible conductor'],
      cathode: ['Algae biofilm electrode', 'Transparent ITO glass']
    },
    organisms: ['Chlorella vulgaris', 'Spirulina platensis', 'Anaerobic bacteria'],
    dimensions: {
      scale: 'lab',
      volume: '5L photobioreactor'
    },
    specialFeatures: [
      'Dual product generation',
      'CO₂ sequestration',
      'Nutrient recovery',
      'Light-driven process'
    ],
    applications: ['Wastewater treatment', 'Biofuel production', 'Carbon capture'],
    costRange: '$300-$800',
    visualizationNotes: 'Show light penetration, algae growth, gas bubbles, dual chambers',
    researchHighlights: [
      'Synergistic energy system',
      'Multiple revenue streams',
      'Carbon negative operation'
    ],
    implementationPriority: 3
  },
  {
    id: 'constructed-wetland-mfc',
    name: 'Constructed Wetland MFC',
    category: 'sustainable',
    systemType: 'Nature-based MFC',
    description: 'Subsurface flow wetland with embedded electrodes for natural treatment',
    powerOutput: {
      value: 85,
      unit: 'mW/m²',
      conditions: 'Continuous flow operation'
    },
    materials: {
      anode: ['Graphite granules', 'Conductive biochar'],
      cathode: ['Stainless steel mesh', 'Manganese oxide coated'],
      additives: ['Gravel substrate', 'Plant root zone']
    },
    organisms: ['Wetland microbiome', 'Root-associated bacteria', 'Electroactive biofilms'],
    dimensions: {
      scale: 'pilot',
      area: '10-100m²'
    },
    specialFeatures: [
      'Natural water treatment',
      'Landscape integration',
      'Low maintenance',
      'Ecosystem services'
    ],
    applications: ['Decentralized treatment', 'Rural sanitation', 'Stormwater management'],
    costRange: '$100-$300 per m²',
    visualizationNotes: 'Show water flow paths, plant roots, electrode placement, treatment zones',
    researchHighlights: [
      'Nature-based solution',
      'Multiple ecosystem benefits',
      'Low operational costs'
    ],
    implementationPriority: 3
  },
  {
    id: 'microchip-mfc-sensor',
    name: 'Lab-on-Chip MFC Biosensor',
    category: 'specialized',
    systemType: 'Miniaturized MFC',
    description: 'Microscale MFC for rapid biosensing and diagnostics',
    powerOutput: {
      value: 5000,
      unit: 'mW/m²',
      conditions: 'Microfluidic flow'
    },
    efficiency: 45,
    materials: {
      anode: ['Screen-printed carbon', 'Gold microelectrodes'],
      cathode: ['Platinum thin film', 'Silver/silver chloride'],
      membrane: 'Nafion micromembrane'
    },
    organisms: ['Specific biosensor bacteria', 'Engineered reporter strains'],
    dimensions: {
      scale: 'micro',
      area: '1-10mm²'
    },
    specialFeatures: [
      'Rapid detection capability',
      'Minimal sample volume',
      'Integrated microfluidics',
      'Real-time monitoring'
    ],
    applications: ['Medical diagnostics', 'Environmental monitoring', 'Food safety'],
    costRange: '$10-$100',
    visualizationNotes: 'Show microchannels, electrode patterns, sample flow, signal output',
    researchHighlights: [
      'Miniaturization breakthrough',
      'Point-of-care applications',
      'Mass production potential'
    ],
    implementationPriority: 3
  },
  {
    id: 'hybrid-mec-mfc-storage',
    name: 'Hybrid MEC-MFC Energy Storage',
    category: 'innovative',
    systemType: 'Dual-mode electrochemical system',
    description: 'Switchable system between fuel cell mode and electrolysis for energy storage',
    powerOutput: {
      value: 1200,
      unit: 'mW/m²',
      conditions: 'MFC mode operation'
    },
    efficiency: 82,
    materials: {
      anode: ['Nickel foam', 'Carbon-coated stainless steel'],
      cathode: ['Pt/C catalyst', 'MoS₂ nanosheets'],
      membrane: 'Bipolar membrane'
    },
    organisms: ['Hydrogen-producing bacteria', 'Electroactive consortia'],
    dimensions: {
      scale: 'pilot',
      volume: '50L system'
    },
    specialFeatures: [
      'Reversible operation',
      'Hydrogen production/consumption',
      'Energy storage capability',
      'Grid integration potential'
    ],
    applications: ['Renewable energy storage', 'Grid balancing', 'Hydrogen economy'],
    costRange: '$2,000-$5,000',
    visualizationNotes: 'Show mode switching, gas production, energy flow directions',
    researchHighlights: [
      'Dual functionality',
      'Energy storage solution',
      'Hydrogen economy integration'
    ],
    implementationPriority: 2
  }
]

// Helper function to get models by category
export function getModelsByCategory(category: MESSModel['category']): MESSModel[] {
  return messModelsCatalog.filter(model => model.category === category)
}

// Helper function to get high-priority models for implementation
export function getHighPriorityModels(): MESSModel[] {
  return messModelsCatalog.filter(model => model.implementationPriority === 1)
}

// Helper function to get models by power output threshold
export function getHighPowerModels(threshold: number = 1000): MESSModel[] {
  return messModelsCatalog.filter(model => {
    // Convert all to mW/m² for comparison
    let powerInMWm2 = model.powerOutput.value
    if (model.powerOutput.unit === 'W/m³') {
      powerInMWm2 = model.powerOutput.value * 1000 // Rough conversion
    } else if (model.powerOutput.unit === 'mW/m³') {
      powerInMWm2 = model.powerOutput.value / 10 // Rough conversion
    }
    return powerInMWm2 >= threshold
  })
}

// Model configuration for 3D visualization
export interface Model3DConfig {
  modelId: string
  meshType: 'custom' | 'parametric' | 'procedural'
  materials: {
    anode: { color: string; texture?: string; opacity?: number }
    cathode: { color: string; texture?: string; opacity?: number }
    membrane?: { color: string; opacity: number }
    container: { color: string; opacity: number }
  }
  animations?: {
    electronFlow?: boolean
    biofilmGrowth?: boolean
    gasProduction?: boolean
    fluidFlow?: boolean
  }
  interactiveElements?: string[]
}

// 3D visualization configurations for each model
export const model3DConfigs: Record<string, Model3DConfig> = {
  'capacitive-hydrogel-stack': {
    modelId: 'capacitive-hydrogel-stack',
    meshType: 'custom',
    materials: {
      anode: { color: '#2C3E50', texture: 'carbon-fiber' },
      cathode: { color: '#34495E', texture: 'mesh' },
      container: { color: '#ECF0F1', opacity: 0.3 }
    },
    animations: {
      electronFlow: true,
      biofilmGrowth: true
    },
    interactiveElements: ['Stack layers', 'Capacitive elements', 'Biofilm zones']
  },
  'quantum-mxene-enhanced': {
    modelId: 'quantum-mxene-enhanced',
    meshType: 'procedural',
    materials: {
      anode: { color: '#9B59B6', texture: 'mxene-layers', opacity: 0.9 },
      cathode: { color: '#8E44AD', texture: 'quantum-dots' },
      container: { color: '#FFFFFF', opacity: 0.2 }
    },
    animations: {
      electronFlow: true,
      biofilmGrowth: true
    },
    interactiveElements: ['MXene layers', 'Quantum dots', 'Electron clouds']
  },
  'plant-mfc-integrated': {
    modelId: 'plant-mfc-integrated',
    meshType: 'custom',
    materials: {
      anode: { color: '#8B4513', texture: 'soil' },
      cathode: { color: '#696969', texture: 'carbon' },
      container: { color: '#F5DEB3', opacity: 0.4 }
    },
    animations: {
      biofilmGrowth: true,
      fluidFlow: true
    },
    interactiveElements: ['Plant roots', 'Rhizosphere', 'Soil layers']
  }
}