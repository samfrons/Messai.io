// Unified catalog of all MESS systems - combining designs and research models
// This merges the design library (13 experimental designs) with the models library (11 research models)

export interface UnifiedMESSSystem {
  id: string
  name: string
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES' | 'PMFC' | 'BFC' | 'Hybrid'
  category: 'experimental' | 'high-performance' | 'innovative' | 'scalable' | 'sustainable' | 'specialized'
  scale: 'micro' | 'lab' | 'pilot' | 'industrial'
  description: string
  
  // Performance metrics
  powerOutput: {
    value: number
    unit: 'mW/m²' | 'W/m³' | 'mW/m³' | 'W/m²'
    range?: string // For designs with ranges like "100-500 mW/m²"
    conditions?: string
  }
  efficiency?: number // Percentage
  
  // Cost information
  cost: {
    value: string // "$10" or "$100-$500"
    category: 'ultra-low' | 'low' | 'medium' | 'high' | 'very-high'
  }
  
  // Materials and components
  materials: {
    anode: string[]
    cathode: string[]
    membrane?: string
    container?: string
    additives?: string[]
    separator?: string
  }
  
  // Biological components
  organisms?: string[]
  substrate?: string
  
  // Physical specifications
  dimensions?: {
    volume?: string
    area?: string
    custom?: string
  }
  
  // Features and applications
  specialFeatures: string[]
  applications: string[]
  
  // Experimental vs Research
  isExperimental: boolean // Can create experiments with this
  researchBacked: boolean // From literature analysis
  
  // Visualization and UI
  designType?: string // For 3D model selection (legacy from designs)
  visualizationNotes?: string
  priority?: 1 | 2 | 3 // Implementation priority from models
  
  // Research information
  researchHighlights?: string[]
  references?: string[]
  
  // Additional metadata
  tags: string[]
  dateAdded?: string
  popularity?: number // For sorting
}

// Helper function to convert cost string to category
function getCostCategory(costStr: string): UnifiedMESSSystem['cost']['category'] {
  const match = costStr.match(/\$(\d+)/);
  if (!match) return 'medium';
  
  const value = parseInt(match[1]);
  if (value < 10) return 'ultra-low';
  if (value < 100) return 'low';
  if (value < 1000) return 'medium';
  if (value < 5000) return 'high';
  return 'very-high';
}

// Convert power output to standard unit for comparison
export function standardizePowerOutput(system: UnifiedMESSSystem): number {
  const { value, unit } = system.powerOutput;
  
  // Convert everything to mW/m² for comparison
  switch (unit) {
    case 'mW/m²':
      return value;
    case 'W/m²':
      return value * 1000;
    case 'W/m³':
      // Rough conversion assuming 10cm depth
      return value * 100;
    case 'mW/m³':
      // Rough conversion assuming 10cm depth
      return value / 10;
    default:
      return value;
  }
}

// Original designs from the designs page (experimental systems)
const experimentalDesigns: UnifiedMESSSystem[] = [
  {
    id: 'earthen-pot',
    name: 'Earthen Pot MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'lab',
    description: 'Ultra-low cost microbial fuel cell using traditional clay pottery',
    powerOutput: {
      value: 300,
      unit: 'mW/m²',
      range: '100-500 mW/m²'
    },
    cost: {
      value: '$1',
      category: 'ultra-low'
    },
    materials: {
      anode: ['Carbon cloth'],
      cathode: ['Carbon cloth'],
      container: 'Clay pot',
      separator: 'Natural clay membrane'
    },
    specialFeatures: [
      'Ultra-low cost',
      'Locally sourceable materials',
      'Natural ion-selective membrane',
      'Educational friendly'
    ],
    applications: ['Education', 'Rural electrification', 'DIY projects'],
    isExperimental: true,
    researchBacked: false,
    designType: 'earthen-pot',
    tags: ['diy', 'low-cost', 'educational', 'sustainable'],
    popularity: 95
  },
  {
    id: 'cardboard',
    name: 'Cardboard MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'lab',
    description: 'Biodegradable MFC made from corrugated cardboard',
    powerOutput: {
      value: 125,
      unit: 'mW/m²',
      range: '50-200 mW/m²'
    },
    cost: {
      value: '$0.50',
      category: 'ultra-low'
    },
    materials: {
      anode: ['Activated carbon'],
      cathode: ['Activated carbon'],
      container: 'Corrugated cardboard',
      additives: ['Thermal treatment']
    },
    specialFeatures: [
      'Fully biodegradable',
      'Ultra-lightweight',
      'Disposable design',
      'Zero waste'
    ],
    applications: ['Temporary power', 'Environmental monitoring', 'Education'],
    isExperimental: true,
    researchBacked: false,
    designType: 'cardboard',
    tags: ['biodegradable', 'disposable', 'eco-friendly'],
    popularity: 78
  },
  {
    id: 'mason-jar',
    name: 'Mason Jar MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'lab',
    description: 'Classic laboratory MFC design using mason jars',
    powerOutput: {
      value: 300,
      unit: 'mW/m²',
      range: '200-400 mW/m²'
    },
    cost: {
      value: '$10',
      category: 'low'
    },
    materials: {
      anode: ['Graphite rods'],
      cathode: ['Graphite rods'],
      container: 'Glass mason jar',
      separator: 'Salt bridge'
    },
    specialFeatures: [
      'Transparent design',
      'Easy observation',
      'Reusable components',
      'Standard lab equipment'
    ],
    applications: ['Research', 'Education', 'Prototyping'],
    isExperimental: true,
    researchBacked: false,
    designType: 'mason-jar',
    tags: ['classic', 'laboratory', 'transparent', 'reusable'],
    popularity: 92
  },
  {
    id: '3d-printed',
    name: '3D Printed MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'lab',
    description: 'Customizable MFC with 3D printed components',
    powerOutput: {
      value: 525,
      unit: 'mW/m²',
      range: '300-750 mW/m²'
    },
    cost: {
      value: '$30',
      category: 'low'
    },
    materials: {
      anode: ['Carbon fiber'],
      cathode: ['Carbon fiber'],
      container: 'PLA plastic chambers',
      additives: ['Hexagonal geometry']
    },
    specialFeatures: [
      'Fully customizable',
      'Optimized flow patterns',
      'Rapid prototyping',
      'Complex geometries'
    ],
    applications: ['Research', 'Custom solutions', 'Prototyping'],
    isExperimental: true,
    researchBacked: false,
    designType: '3d-printed',
    tags: ['customizable', 'modern', '3d-printing', 'research'],
    popularity: 87
  },
  {
    id: 'wetland',
    name: 'Wetland MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'pilot',
    description: 'Constructed wetland with integrated MFC for wastewater treatment',
    powerOutput: {
      value: 1750,
      unit: 'mW/m²',
      range: '500-3000 mW/m²'
    },
    cost: {
      value: '$100',
      category: 'medium'
    },
    materials: {
      anode: ['Buried carbon electrodes'],
      cathode: ['Surface carbon electrodes'],
      container: 'Plant bed system',
      additives: ['Aquatic vegetation']
    },
    organisms: ['Wetland microbiome', 'Plant rhizosphere bacteria'],
    specialFeatures: [
      'Natural water treatment',
      'Ecosystem integration',
      'Self-sustaining',
      'Aesthetic design'
    ],
    applications: ['Wastewater treatment', 'Landscaping', 'Environmental restoration'],
    isExperimental: true,
    researchBacked: false,
    designType: 'wetland',
    tags: ['nature-based', 'wastewater', 'sustainable', 'ecosystem'],
    popularity: 81
  },
  {
    id: 'micro-chip',
    name: 'Micro MFC Chip',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'micro',
    description: 'Miniaturized MFC on silicon substrate for biosensing',
    powerOutput: {
      value: 30,
      unit: 'mW/m²',
      range: '10-50 mW/m²'
    },
    cost: {
      value: '$5',
      category: 'ultra-low'
    },
    materials: {
      anode: ['Gold microelectrodes'],
      cathode: ['Gold microelectrodes'],
      container: '1cm³ silicon microchamber',
      membrane: 'Nafion membrane'
    },
    specialFeatures: [
      'Lab-on-chip design',
      'Microscale',
      'Rapid response',
      'Integration ready'
    ],
    applications: ['Biosensing', 'Medical diagnostics', 'Research'],
    isExperimental: true,
    researchBacked: false,
    designType: 'micro-chip',
    tags: ['miniature', 'biosensor', 'microfluidics', 'diagnostic'],
    popularity: 73
  },
  {
    id: 'isolinear-chip',
    name: 'Isolinear Bio-Chip',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'micro',
    description: 'Star Trek inspired bio-chip with transparent electrodes',
    powerOutput: {
      value: 140,
      unit: 'mW/m²',
      range: '80-200 mW/m²'
    },
    cost: {
      value: '$25',
      category: 'low'
    },
    materials: {
      anode: ['Transparent ITO electrodes'],
      cathode: ['Transparent ITO electrodes'],
      container: 'Microscope slide form factor',
      additives: ['Optical monitoring ports']
    },
    specialFeatures: [
      'Star Trek inspired',
      'Transparent design',
      'Optical monitoring',
      'Sci-fi aesthetic'
    ],
    applications: ['Research', 'Education', 'Display pieces'],
    isExperimental: true,
    researchBacked: false,
    designType: 'isolinear-chip',
    tags: ['sci-fi', 'transparent', 'futuristic', 'unique'],
    popularity: 69
  },
  {
    id: 'benchtop-bioreactor',
    name: 'Benchtop Bioreactor MFC',
    systemType: 'MFC',
    category: 'experimental',
    scale: 'lab',
    description: 'Professional stirred-tank reactor with integrated MFC',
    powerOutput: {
      value: 3000,
      unit: 'mW/m²',
      range: '1-5 W/m²'
    },
    cost: {
      value: '$350',
      category: 'medium'
    },
    materials: {
      anode: ['High-surface graphite felt'],
      cathode: ['High-surface graphite felt'],
      container: 'Stirred tank reactor (5L)',
      additives: ['pH, DO, temperature sensors']
    },
    specialFeatures: [
      'Continuous monitoring',
      'Automated control',
      'Data logging',
      'Professional grade'
    ],
    applications: ['Research', 'Process optimization', 'Scale-up studies'],
    isExperimental: true,
    researchBacked: false,
    designType: 'benchtop-bioreactor',
    tags: ['professional', 'automated', 'research-grade', 'bioreactor'],
    popularity: 85
  },
  {
    id: 'wastewater-treatment',
    name: 'Wastewater Treatment MFC',
    systemType: 'MFC',
    category: 'scalable',
    scale: 'pilot',
    description: 'Industrial-scale MFC for wastewater treatment facilities',
    powerOutput: {
      value: 6000,
      unit: 'mW/m²',
      range: '2-10 W/m²'
    },
    cost: {
      value: '$2,500',
      category: 'high'
    },
    materials: {
      anode: ['Stainless steel mesh arrays'],
      cathode: ['Stainless steel mesh arrays'],
      container: 'Modular tank system (500L)',
      membrane: 'Ceramic membrane'
    },
    substrate: 'Municipal wastewater',
    specialFeatures: [
      'BOD removal',
      'Energy recovery',
      'Modular design',
      'Industrial scale'
    ],
    applications: ['Wastewater treatment', 'Energy recovery', 'Industrial processes'],
    isExperimental: true,
    researchBacked: false,
    designType: 'wastewater-treatment',
    tags: ['industrial', 'wastewater', 'scalable', 'energy-recovery'],
    popularity: 88
  },
  {
    id: 'brewery-processing',
    name: 'Brewery Processing MFC',
    systemType: 'MFC',
    category: 'specialized',
    scale: 'pilot',
    description: 'Specialized MFC for brewery waste processing',
    powerOutput: {
      value: 5500,
      unit: 'mW/m²',
      range: '3-8 W/m²'
    },
    cost: {
      value: '$1,800',
      category: 'high'
    },
    materials: {
      anode: ['Carbon brush anodes'],
      cathode: ['Air cathodes'],
      container: 'Food-grade stainless steel',
      additives: ['CIP-compatible design']
    },
    substrate: 'Brewery wastewater',
    specialFeatures: [
      'Food-grade materials',
      'CIP compatible',
      'High organic loading',
      'Industry specific'
    ],
    applications: ['Brewery waste', 'Food processing', 'Industrial bioprocessing'],
    isExperimental: true,
    researchBacked: false,
    designType: 'brewery-processing',
    tags: ['brewery', 'food-grade', 'specialized', 'industrial'],
    popularity: 76
  },
  {
    id: 'architectural-facade',
    name: 'BioFacade Power Cell',
    systemType: 'MFC',
    category: 'innovative',
    scale: 'industrial',
    description: 'Building-integrated MFC panels for green architecture',
    powerOutput: {
      value: 30,
      unit: 'W/m²',
      range: '10-50 W/m²'
    },
    cost: {
      value: '$5,000',
      category: 'very-high'
    },
    materials: {
      anode: ['Flexible carbon composites'],
      cathode: ['Air-exposed catalysts'],
      container: 'Building-integrated panels',
      additives: ['Weather-resistant coating']
    },
    substrate: 'Urban wastewater',
    specialFeatures: [
      'Architectural integration',
      'Weather resistant',
      'Modular installation',
      'Aesthetic design'
    ],
    applications: ['Green buildings', 'Urban infrastructure', 'Sustainable architecture'],
    isExperimental: true,
    researchBacked: false,
    designType: 'architectural-facade',
    tags: ['architecture', 'building-integrated', 'urban', 'innovative'],
    popularity: 71
  },
  {
    id: 'benthic-fuel-cell',
    name: 'Benthic Sediment MFC',
    systemType: 'BFC',
    category: 'specialized',
    scale: 'pilot',
    description: 'Marine/freshwater sediment MFC for remote power',
    powerOutput: {
      value: 15,
      unit: 'W/m²',
      range: '5-25 W/m²'
    },
    cost: {
      value: '$150',
      category: 'medium'
    },
    materials: {
      anode: ['Corrosion-resistant titanium'],
      cathode: ['Marine-grade stainless steel'],
      container: 'Marine-grade housing',
      additives: ['Anti-biofouling coating']
    },
    substrate: 'Ocean/lake sediments',
    organisms: ['Sediment bacteria', 'Sulfate-reducing bacteria'],
    specialFeatures: [
      'Long-term deployment',
      'Maintenance-free',
      'Corrosion resistant',
      'Remote power'
    ],
    applications: ['Ocean monitoring', 'Remote sensors', 'Environmental monitoring'],
    isExperimental: true,
    researchBacked: false,
    designType: 'benthic-fuel-cell',
    tags: ['marine', 'remote-power', 'environmental', 'long-term'],
    popularity: 74
  },
  {
    id: 'kitchen-sink',
    name: 'Kitchen Sink Bio-Cell',
    systemType: 'MFC',
    category: 'sustainable',
    scale: 'lab',
    description: 'Under-sink MFC for kitchen waste processing',
    powerOutput: {
      value: 300,
      unit: 'mW/m²',
      range: '100-500 mW/m²'
    },
    cost: {
      value: '$85',
      category: 'low'
    },
    materials: {
      anode: ['Food-safe carbon mesh'],
      cathode: ['Food-safe carbon mesh'],
      container: 'Under-sink installation unit',
      additives: ['Garbage disposal integration']
    },
    substrate: 'Organic kitchen waste',
    specialFeatures: [
      'Kitchen integration',
      'Food waste processing',
      'Household scale',
      'Easy maintenance'
    ],
    applications: ['Home use', 'Waste reduction', 'Sustainable living'],
    isExperimental: true,
    researchBacked: false,
    designType: 'kitchen-sink',
    tags: ['household', 'kitchen', 'waste-processing', 'sustainable'],
    popularity: 79
  }
];

// Research models from the models library
const researchModels: UnifiedMESSSystem[] = [
  {
    id: 'capacitive-hydrogel-stack',
    name: 'Capacitive Hydrogel Bioanode MFC Stack',
    systemType: 'MFC',
    category: 'high-performance',
    scale: 'lab',
    description: 'Series-stacked MFCs with PPy/EABs@Mag-CLF/SA capacitive bioanode for exceptional power density',
    powerOutput: {
      value: 71.88,
      unit: 'W/m³',
      conditions: 'Optimized stack configuration'
    },
    efficiency: 85,
    cost: {
      value: '$200-$500 per stack',
      category: 'medium'
    },
    materials: {
      anode: ['Polypyrrole (PPy)', 'Biomagnetic carbonized loofah', 'Sodium alginate hydrogel'],
      cathode: ['Air cathode with PTFE', 'Carbon black catalyst layer'],
      additives: ['Magnetic nanoparticles', '3D biochar particles']
    },
    organisms: ['Mixed anaerobic consortium', 'Electroactive biofilm bacteria'],
    dimensions: {
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
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show capacitive charging/discharging animation, biofilm growth on 3D particles',
    researchHighlights: [
      'Highest power density for stacked systems',
      'Novel capacitive bioanode design',
      'Prevents stack failure from voltage reversal'
    ],
    priority: 1,
    tags: ['capacitive', 'high-performance', 'stack', 'innovative'],
    popularity: 96
  },
  {
    id: 'pilot-benthic-mes',
    name: 'Pilot-Scale Benthic MES',
    systemType: 'MES',
    category: 'scalable',
    scale: 'pilot',
    description: '195L pilot-scale system with honeycomb 3D anode for river sediment restoration',
    powerOutput: {
      value: 125,
      unit: 'mW/m²',
      conditions: 'Natural river conditions'
    },
    cost: {
      value: '$1,000-$3,000',
      category: 'high'
    },
    materials: {
      anode: ['Three-dimensional honeycomb structure (Tri-DSA)', 'Carbon cloth'],
      cathode: ['Stainless steel mesh', 'Exposed to water surface']
    },
    organisms: ['Indigenous sediment microorganisms', 'Sulfate-reducing bacteria'],
    dimensions: {
      volume: '195L',
      custom: '120cm × 25cm × 65cm'
    },
    specialFeatures: [
      'First honeycomb 3D anode structure',
      'In-situ sediment restoration',
      'Large-scale deployment ready',
      'Natural ecosystem integration'
    ],
    applications: ['River restoration', 'Sediment remediation', 'Organic removal'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show underwater deployment, sediment layers, honeycomb structure detail',
    researchHighlights: [
      'Successful pilot-scale demonstration',
      'Novel 3D honeycomb anode',
      'Environmental restoration capability'
    ],
    priority: 1,
    tags: ['pilot-scale', 'environmental', 'restoration', 'honeycomb'],
    popularity: 89
  },
  {
    id: 'plant-mfc-integrated',
    name: 'Plant Microbial Fuel Cell System',
    systemType: 'PMFC',
    category: 'sustainable',
    scale: 'lab',
    description: 'Living plant integrated with MFC for sustainable energy and phytoremediation',
    powerOutput: {
      value: 50,
      unit: 'mW/m²',
      conditions: 'Optimal plant growth conditions'
    },
    cost: {
      value: '$50-$200',
      category: 'low'
    },
    materials: {
      anode: ['Graphite felt', 'Carbon fiber'],
      cathode: ['Activated carbon air cathode'],
      membrane: 'Proton exchange membrane (optional)'
    },
    organisms: ['Rhizosphere bacteria', 'Plant root exudate consumers', 'Geobacter species'],
    dimensions: {
      volume: '1-10L soil volume'
    },
    specialFeatures: [
      'Photosynthetic oxygen production',
      'Self-sustaining ecosystem',
      'Aesthetic integration',
      'Multiple configuration options'
    ],
    applications: ['Green buildings', 'Biosensing', 'Phytoremediation', 'Urban agriculture'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show plant roots, rhizosphere bacteria, electron flow from roots',
    researchHighlights: [
      'Living energy system',
      'Multiple environmental benefits',
      'Architectural integration potential'
    ],
    priority: 1,
    tags: ['plant-integrated', 'sustainable', 'living-system', 'green'],
    popularity: 93
  },
  {
    id: '3d-printed-custom-mes',
    name: '3D-Printed Customizable MES',
    systemType: 'MES',
    category: 'innovative',
    scale: 'lab',
    description: 'Rapid prototyped reactor with optimized geometries and custom electrodes',
    powerOutput: {
      value: 2500,
      unit: 'mW/m²',
      conditions: 'Optimized flow dynamics'
    },
    efficiency: 78,
    cost: {
      value: '$100-$1,000',
      category: 'medium'
    },
    materials: {
      anode: ['Conductive carbon ink', 'Graphene-PLA composite'],
      cathode: ['Silver-based conductive ink', '3D printed carbon'],
      additives: ['Biocompatible binders', 'Conductive fillers']
    },
    dimensions: {
      area: 'Customizable 10-1000cm²'
    },
    specialFeatures: [
      'Rapid prototyping capability',
      'Optimized fluid dynamics',
      'Custom electrode architectures',
      'Bioprinted scaffolds'
    ],
    applications: ['Research optimization', 'Custom solutions', 'Rapid testing'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show 3D printing process, customizable geometries, flow simulation',
    researchHighlights: [
      'Revolutionary manufacturing approach',
      'Unlimited design possibilities',
      'Rapid iteration capability'
    ],
    priority: 2,
    tags: ['3d-printed', 'customizable', 'rapid-prototyping', 'innovative'],
    popularity: 84
  },
  {
    id: 'quantum-mxene-enhanced',
    name: 'Quantum-Enhanced MXene MFC',
    systemType: 'MFC',
    category: 'high-performance',
    scale: 'lab',
    description: 'Quantum dots integrated with MXene electrodes for breakthrough performance',
    powerOutput: {
      value: 125000,
      unit: 'mW/m²',
      conditions: 'Quantum coherence maintained'
    },
    efficiency: 95,
    cost: {
      value: '$5,000-$10,000',
      category: 'very-high'
    },
    materials: {
      anode: ['Ti₃C₂Tₓ MXene', 'Quantum dots (CdS)', 'Graphene quantum dots'],
      cathode: ['Mo₂TiC₂Tₓ MXene', 'Platinum nanoparticles'],
      additives: ['Quantum coupling agents', 'Coherence stabilizers']
    },
    organisms: ['Engineered Shewanella oneidensis', 'CRISPR-modified electrogens'],
    dimensions: {
      area: '25cm²'
    },
    specialFeatures: [
      'Quantum-enhanced electron transfer',
      'Coherent coupling effects',
      'Ultra-high conductivity',
      'Self-organizing nanostructures'
    ],
    applications: ['High-performance systems', 'Space applications', 'Advanced research'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show quantum effects, electron clouds, MXene layers, coherent transfer',
    researchHighlights: [
      'Highest reported power density',
      'Quantum biology integration',
      'Next-generation materials'
    ],
    priority: 1,
    tags: ['quantum', 'mxene', 'cutting-edge', 'record-breaking'],
    popularity: 98
  },
  {
    id: 'spent-battery-cathode-mfc',
    name: 'Upcycled Battery Cathode MFC',
    systemType: 'MFC',
    category: 'sustainable',
    scale: 'pilot',
    description: 'MFC using recycled battery materials outperforming platinum cathodes',
    powerOutput: {
      value: 757,
      unit: 'mW/m³',
      conditions: '3g/cm² catalyst loading'
    },
    efficiency: 72,
    cost: {
      value: '$50-$150',
      category: 'low'
    },
    materials: {
      anode: ['Carbon cloth', 'Graphite brush'],
      cathode: ['Recycled LiMn₂O₄ battery powder', 'Spent battery catalyst'],
      additives: ['Carbon black binder', 'PTFE']
    },
    organisms: ['Mixed wastewater consortium'],
    dimensions: {
      volume: '10L reactor'
    },
    specialFeatures: [
      '3x more powerful than Pt cathode',
      'Circular economy approach',
      'Cost-effective scaling',
      'Waste material utilization'
    ],
    applications: ['Wastewater treatment', 'E-waste recycling', 'Sustainable energy'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show battery recycling process, catalyst preparation, performance comparison',
    researchHighlights: [
      'Superior to platinum catalysts',
      'Sustainable material reuse',
      'Economic viability'
    ],
    priority: 2,
    tags: ['recycled', 'sustainable', 'cost-effective', 'circular-economy'],
    popularity: 86
  },
  {
    id: 'architectural-facade-mfc-research',
    name: 'Building-Integrated MFC Facade',
    systemType: 'MFC',
    category: 'scalable',
    scale: 'industrial',
    description: 'Modular MFC panels for building exteriors with aesthetic design',
    powerOutput: {
      value: 250,
      unit: 'mW/m²',
      conditions: 'Building greywater feed'
    },
    cost: {
      value: '$150-$500 per m²',
      category: 'medium'
    },
    materials: {
      anode: ['Architectural carbon cloth', 'Decorative conductive mesh'],
      cathode: ['Transparent conductive coating', 'Air-exposed catalyst'],
      membrane: 'Architectural separator'
    },
    organisms: ['Greywater microorganisms', 'Building-adapted consortia'],
    dimensions: {
      area: '1m² modular panels'
    },
    specialFeatures: [
      'Aesthetic design integration',
      'Modular installation',
      'Building energy supplementation',
      'Greywater treatment'
    ],
    applications: ['Green buildings', 'Urban infrastructure', 'Sustainable architecture'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show building integration, modular assembly, water flow, aesthetic options',
    researchHighlights: [
      'Architectural innovation',
      'Dual function: energy + treatment',
      'Urban sustainability solution'
    ],
    priority: 2,
    tags: ['architectural', 'building-integrated', 'modular', 'urban'],
    popularity: 82
  },
  {
    id: 'algae-photo-mfc',
    name: 'Photosynthetic Algae-MFC Hybrid',
    systemType: 'Hybrid',
    category: 'innovative',
    scale: 'lab',
    description: 'Integrated algae bioreactor with MFC for dual energy and biomass production',
    powerOutput: {
      value: 380,
      unit: 'mW/m²',
      conditions: 'Optimal light conditions'
    },
    efficiency: 65,
    cost: {
      value: '$300-$800',
      category: 'medium'
    },
    materials: {
      anode: ['Carbon fiber mat', 'Biocompatible conductor'],
      cathode: ['Algae biofilm electrode', 'Transparent ITO glass']
    },
    organisms: ['Chlorella vulgaris', 'Spirulina platensis', 'Anaerobic bacteria'],
    dimensions: {
      volume: '5L photobioreactor'
    },
    specialFeatures: [
      'Dual product generation',
      'CO₂ sequestration',
      'Nutrient recovery',
      'Light-driven process'
    ],
    applications: ['Wastewater treatment', 'Biofuel production', 'Carbon capture'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show light penetration, algae growth, gas bubbles, dual chambers',
    researchHighlights: [
      'Synergistic energy system',
      'Multiple revenue streams',
      'Carbon negative operation'
    ],
    priority: 3,
    tags: ['algae', 'photosynthetic', 'hybrid', 'carbon-capture'],
    popularity: 77
  },
  {
    id: 'constructed-wetland-mfc',
    name: 'Constructed Wetland MFC',
    systemType: 'MFC',
    category: 'sustainable',
    scale: 'pilot',
    description: 'Subsurface flow wetland with embedded electrodes for natural treatment',
    powerOutput: {
      value: 85,
      unit: 'mW/m²',
      conditions: 'Continuous flow operation'
    },
    cost: {
      value: '$100-$300 per m²',
      category: 'medium'
    },
    materials: {
      anode: ['Graphite granules', 'Conductive biochar'],
      cathode: ['Stainless steel mesh', 'Manganese oxide coated'],
      additives: ['Gravel substrate', 'Plant root zone']
    },
    organisms: ['Wetland microbiome', 'Root-associated bacteria', 'Electroactive biofilms'],
    dimensions: {
      area: '10-100m²'
    },
    specialFeatures: [
      'Natural water treatment',
      'Landscape integration',
      'Low maintenance',
      'Ecosystem services'
    ],
    applications: ['Decentralized treatment', 'Rural sanitation', 'Stormwater management'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show water flow paths, plant roots, electrode placement, treatment zones',
    researchHighlights: [
      'Nature-based solution',
      'Multiple ecosystem benefits',
      'Low operational costs'
    ],
    priority: 3,
    tags: ['wetland', 'nature-based', 'water-treatment', 'ecosystem'],
    popularity: 75
  },
  {
    id: 'microchip-mfc-sensor',
    name: 'Lab-on-Chip MFC Biosensor',
    systemType: 'MFC',
    category: 'specialized',
    scale: 'micro',
    description: 'Microscale MFC for rapid biosensing and diagnostics',
    powerOutput: {
      value: 5000,
      unit: 'mW/m²',
      conditions: 'Microfluidic flow'
    },
    efficiency: 45,
    cost: {
      value: '$10-$100',
      category: 'low'
    },
    materials: {
      anode: ['Screen-printed carbon', 'Gold microelectrodes'],
      cathode: ['Platinum thin film', 'Silver/silver chloride'],
      membrane: 'Nafion micromembrane'
    },
    organisms: ['Specific biosensor bacteria', 'Engineered reporter strains'],
    dimensions: {
      area: '1-10mm²'
    },
    specialFeatures: [
      'Rapid detection capability',
      'Minimal sample volume',
      'Integrated microfluidics',
      'Real-time monitoring'
    ],
    applications: ['Medical diagnostics', 'Environmental monitoring', 'Food safety'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show microchannels, electrode patterns, sample flow, signal output',
    researchHighlights: [
      'Miniaturization breakthrough',
      'Point-of-care applications',
      'Mass production potential'
    ],
    priority: 3,
    tags: ['microfluidic', 'biosensor', 'diagnostic', 'miniature'],
    popularity: 72
  },
  {
    id: 'hybrid-mec-mfc-storage',
    name: 'Hybrid MEC-MFC Energy Storage',
    systemType: 'Hybrid',
    category: 'innovative',
    scale: 'pilot',
    description: 'Switchable system between fuel cell mode and electrolysis for energy storage',
    powerOutput: {
      value: 1200,
      unit: 'mW/m²',
      conditions: 'MFC mode operation'
    },
    efficiency: 82,
    cost: {
      value: '$2,000-$5,000',
      category: 'high'
    },
    materials: {
      anode: ['Nickel foam', 'Carbon-coated stainless steel'],
      cathode: ['Pt/C catalyst', 'MoS₂ nanosheets'],
      membrane: 'Bipolar membrane'
    },
    organisms: ['Hydrogen-producing bacteria', 'Electroactive consortia'],
    dimensions: {
      volume: '50L system'
    },
    specialFeatures: [
      'Reversible operation',
      'Hydrogen production/consumption',
      'Energy storage capability',
      'Grid integration potential'
    ],
    applications: ['Renewable energy storage', 'Grid balancing', 'Hydrogen economy'],
    isExperimental: false,
    researchBacked: true,
    visualizationNotes: 'Show mode switching, gas production, energy flow directions',
    researchHighlights: [
      'Dual functionality',
      'Energy storage solution',
      'Hydrogen economy integration'
    ],
    priority: 2,
    tags: ['hybrid', 'energy-storage', 'hydrogen', 'reversible'],
    popularity: 83
  }
];

// Combine all systems into unified catalog
export const unifiedSystemsCatalog: UnifiedMESSSystem[] = [
  ...experimentalDesigns,
  ...researchModels
];

// Helper functions for filtering and searching

export function getSystemsByCategory(category: UnifiedMESSSystem['category']): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => system.category === category);
}

export function getSystemsByScale(scale: UnifiedMESSSystem['scale']): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => system.scale === scale);
}

export function getExperimentalSystems(): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => system.isExperimental);
}

export function getResearchSystems(): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => system.researchBacked);
}

export function getSystemsByCostCategory(category: UnifiedMESSSystem['cost']['category']): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => system.cost.category === category);
}

export function getHighPerformanceSystems(threshold: number = 1000): UnifiedMESSSystem[] {
  return unifiedSystemsCatalog.filter(system => {
    const standardPower = standardizePowerOutput(system);
    return standardPower >= threshold;
  });
}

export function searchSystems(query: string): UnifiedMESSSystem[] {
  const lowerQuery = query.toLowerCase();
  return unifiedSystemsCatalog.filter(system => 
    system.name.toLowerCase().includes(lowerQuery) ||
    system.description.toLowerCase().includes(lowerQuery) ||
    system.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    system.applications.some(app => app.toLowerCase().includes(lowerQuery))
  );
}

// Sort functions
export function sortByPowerOutput(systems: UnifiedMESSSystem[], ascending = false): UnifiedMESSSystem[] {
  return [...systems].sort((a, b) => {
    const powerA = standardizePowerOutput(a);
    const powerB = standardizePowerOutput(b);
    return ascending ? powerA - powerB : powerB - powerA;
  });
}

export function sortByPopularity(systems: UnifiedMESSSystem[], ascending = false): UnifiedMESSSystem[] {
  return [...systems].sort((a, b) => {
    const popA = a.popularity || 0;
    const popB = b.popularity || 0;
    return ascending ? popA - popB : popB - popA;
  });
}

export function sortByCost(systems: UnifiedMESSSystem[], ascending = true): UnifiedMESSSystem[] {
  const costOrder = ['ultra-low', 'low', 'medium', 'high', 'very-high'];
  return [...systems].sort((a, b) => {
    const indexA = costOrder.indexOf(a.cost.category);
    const indexB = costOrder.indexOf(b.cost.category);
    return ascending ? indexA - indexB : indexB - indexA;
  });
}

// Get system by ID
export function getSystemById(id: string): UnifiedMESSSystem | undefined {
  return unifiedSystemsCatalog.find(system => system.id === id);
}

// Get related systems (by tags or category)
export function getRelatedSystems(systemId: string, limit = 5): UnifiedMESSSystem[] {
  const system = getSystemById(systemId);
  if (!system) return [];
  
  // Score other systems by similarity
  const scored = unifiedSystemsCatalog
    .filter(s => s.id !== systemId)
    .map(s => {
      let score = 0;
      
      // Same category = 3 points
      if (s.category === system.category) score += 3;
      
      // Same scale = 2 points
      if (s.scale === system.scale) score += 2;
      
      // Shared tags = 1 point each
      const sharedTags = s.tags.filter(tag => system.tags.includes(tag));
      score += sharedTags.length;
      
      // Similar power output = 1 point
      const powerDiff = Math.abs(standardizePowerOutput(s) - standardizePowerOutput(system));
      const powerRatio = powerDiff / standardizePowerOutput(system);
      if (powerRatio < 0.5) score += 1;
      
      return { system: s, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit).map(item => item.system);
}

// Helper function to get design type for 3D rendering
export function getDesignTypeFor3D(system: UnifiedMESSSystem): string {
  if (system.designType) return system.designType;
  
  // Map research systems to appropriate design types for 3D visualization
  // Only use design types supported by MESSModel3DLite: earthen-pot, mason-jar, micro-chip, 3d-printed, wetland
  const mappings: Record<string, string> = {
    'capacitive-hydrogel-stack': 'mason-jar',
    'pilot-benthic-mes': 'wetland',
    'plant-mfc-integrated': 'wetland',
    '3d-printed-custom-mes': '3d-printed',
    'quantum-mxene-enhanced': 'micro-chip',
    'spent-battery-cathode-mfc': 'mason-jar',
    'architectural-facade-mfc-research': '3d-printed',
    'algae-photo-mfc': 'mason-jar',
    'constructed-wetland-mfc': 'wetland',
    'microchip-mfc-sensor': 'micro-chip',
    'hybrid-mec-mfc-storage': 'mason-jar'
  };
  
  return mappings[system.id] || 'mason-jar'; // Default fallback
}

// Export type
export type { UnifiedMESSSystem };