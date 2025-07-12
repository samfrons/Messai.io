/**
 * Comprehensive electrode materials database for MFC applications
 * Based on current research and commercial availability
 */

import { ElectrodeMaterial } from '../types';

export const carbonMaterials: Record<string, ElectrodeMaterial> = {
  'carbon-cloth': {
    name: 'Carbon Cloth',
    type: 'carbon',
    conductivity: 100,
    surfaceArea: 2000,
    cost: 50,
    sustainability: 7,
    description: 'Woven carbon fiber fabric with high surface area',
    advantages: ['High conductivity', 'Flexible', 'Good biofilm adhesion'],
    limitations: ['Moderate cost', 'Can degrade over time']
  },
  'carbon-felt': {
    name: 'Carbon Felt',
    type: 'carbon',
    conductivity: 80,
    surfaceArea: 2500,
    cost: 40,
    sustainability: 7,
    description: 'Non-woven carbon fiber material with excellent porosity',
    advantages: ['High porosity', 'Good mass transfer', 'Lower cost than cloth'],
    limitations: ['Lower mechanical strength', 'Compression affects performance']
  },
  'graphite-rod': {
    name: 'Graphite Rod',
    type: 'carbon',
    conductivity: 200,
    surfaceArea: 10,
    cost: 20,
    sustainability: 8,
    description: 'Solid graphite electrode with excellent conductivity',
    advantages: ['Very low cost', 'Highly conductive', 'Chemically stable'],
    limitations: ['Very low surface area', 'Poor biofilm adhesion']
  },
  'activated-carbon': {
    name: 'Activated Carbon',
    type: 'carbon',
    conductivity: 50,
    surfaceArea: 3000,
    cost: 30,
    sustainability: 9,
    description: 'High surface area carbon with microporous structure',
    advantages: ['Extremely high surface area', 'Low cost', 'Can be made from waste'],
    limitations: ['Lower conductivity', 'Requires binder']
  }
};

export const nanomaterials: Record<string, ElectrodeMaterial> = {
  'graphene-oxide': {
    name: 'Graphene Oxide',
    type: 'nanomaterial',
    conductivity: 500,
    surfaceArea: 2600,
    cost: 200,
    sustainability: 5,
    description: 'Single-layer carbon sheets with oxygen functional groups',
    advantages: ['Ultra-high conductivity', 'Excellent biocompatibility', 'Tunable properties'],
    limitations: ['High cost', 'Complex synthesis', 'Requires reduction']
  },
  'reduced-graphene-oxide': {
    name: 'Reduced Graphene Oxide (rGO)',
    type: 'nanomaterial',
    conductivity: 800,
    surfaceArea: 2400,
    cost: 250,
    sustainability: 5,
    description: 'Chemically reduced graphene oxide with restored conductivity',
    advantages: ['Exceptional conductivity', 'High surface area', 'Good stability'],
    limitations: ['Very high cost', 'Scalability challenges']
  },
  'carbon-nanotubes': {
    name: 'Carbon Nanotubes (CNTs)',
    type: 'nanomaterial',
    conductivity: 1000,
    surfaceArea: 1300,
    cost: 300,
    sustainability: 4,
    description: 'Cylindrical carbon structures with exceptional properties',
    advantages: ['Highest conductivity', 'Excellent mechanical properties', 'High aspect ratio'],
    limitations: ['Extremely high cost', 'Health concerns', 'Difficult to disperse']
  },
  'mxene-ti3c2': {
    name: 'MXene (Ti₃C₂Tₓ)',
    type: 'nanomaterial',
    conductivity: 1500,
    surfaceArea: 980,
    cost: 500,
    sustainability: 3,
    description: '2D transition metal carbide with metallic conductivity',
    advantages: ['Metallic conductivity', 'Hydrophilic', 'Excellent biocompatibility'],
    limitations: ['Very high cost', 'Oxidation sensitivity', 'Limited availability']
  }
};

export const metalElectrodes: Record<string, ElectrodeMaterial> = {
  'stainless-steel': {
    name: 'Stainless Steel 316L',
    type: 'metal',
    conductivity: 1400,
    surfaceArea: 1,
    cost: 15,
    sustainability: 6,
    description: 'Corrosion-resistant steel alloy',
    advantages: ['Low cost', 'Excellent conductivity', 'Mechanically strong'],
    limitations: ['Very low surface area', 'Can corrode in extreme conditions']
  },
  'titanium': {
    name: 'Titanium',
    type: 'metal',
    conductivity: 2300,
    surfaceArea: 1,
    cost: 100,
    sustainability: 5,
    description: 'Highly corrosion-resistant metal',
    advantages: ['Excellent corrosion resistance', 'Biocompatible', 'Long-lasting'],
    limitations: ['High cost', 'Low surface area', 'Requires surface modification']
  },
  'nickel-foam': {
    name: 'Nickel Foam',
    type: 'metal',
    conductivity: 1400,
    surfaceArea: 500,
    cost: 80,
    sustainability: 4,
    description: 'Porous metallic foam structure',
    advantages: ['High surface area for metal', 'Good conductivity', '3D structure'],
    limitations: ['Can corrode', 'Moderate cost', 'Heavy']
  }
};

export const compositeElectrodes: Record<string, ElectrodeMaterial> = {
  'carbon-ptfe': {
    name: 'Carbon-PTFE Composite',
    type: 'composite',
    conductivity: 70,
    surfaceArea: 1500,
    cost: 60,
    sustainability: 6,
    description: 'Carbon powder bound with PTFE for gas diffusion',
    advantages: ['Good gas permeability', 'Stable', 'Moderate cost'],
    limitations: ['PTFE reduces conductivity', 'Complex fabrication']
  },
  'biochar': {
    name: 'Biochar',
    type: 'composite',
    conductivity: 30,
    surfaceArea: 800,
    cost: 10,
    sustainability: 10,
    description: 'Carbonized biomass from agricultural waste',
    advantages: ['Very low cost', 'Highly sustainable', 'Waste valorization'],
    limitations: ['Low conductivity', 'Variable properties', 'Requires activation']
  },
  'carbon-polymer': {
    name: 'Conductive Polymer Composite',
    type: 'composite',
    conductivity: 100,
    surfaceArea: 200,
    cost: 70,
    sustainability: 5,
    description: 'Polymer matrix with carbon filler',
    advantages: ['Moldable', 'Tunable properties', 'Good biocompatibility'],
    limitations: ['Moderate conductivity', 'Can degrade', 'Complex synthesis']
  }
};

/**
 * Get all electrode materials
 */
export function getAllElectrodes(): ElectrodeMaterial[] {
  return [
    ...Object.values(carbonMaterials),
    ...Object.values(nanomaterials),
    ...Object.values(metalElectrodes),
    ...Object.values(compositeElectrodes)
  ];
}

/**
 * Get electrodes by type
 */
export function getElectrodesByType(type: ElectrodeMaterial['type']): ElectrodeMaterial[] {
  return getAllElectrodes().filter(electrode => electrode.type === type);
}

/**
 * Calculate cost-effectiveness score
 */
export function calculateCostEffectiveness(material: ElectrodeMaterial): number {
  const performanceScore = (material.conductivity / 100) * (material.surfaceArea / 100);
  const costScore = 100 / material.cost;
  const sustainabilityBonus = material.sustainability / 10;
  
  return (performanceScore * costScore * sustainabilityBonus) * 10;
}

/**
 * Get recommended materials for a given budget
 */
export function getRecommendedMaterials(
  maxCost: number,
  prioritize: 'performance' | 'sustainability' | 'cost' = 'performance'
): ElectrodeMaterial[] {
  const affordable = getAllElectrodes().filter(m => m.cost <= maxCost);
  
  return affordable.sort((a, b) => {
    if (prioritize === 'performance') {
      return (b.conductivity * b.surfaceArea) - (a.conductivity * a.surfaceArea);
    } else if (prioritize === 'sustainability') {
      return b.sustainability - a.sustainability;
    } else {
      return a.cost - b.cost;
    }
  }).slice(0, 5);
}