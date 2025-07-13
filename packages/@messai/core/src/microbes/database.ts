/**
 * Comprehensive microbe database for MFC applications
 * Includes algae, bacteria, and microbial consortia
 */

import { MicrobeSpecies } from '../types';

export const algaeDatabase: Record<string, MicrobeSpecies> = {
  chlorella: {
    id: 'chlorella-vulgaris',
    name: 'Chlorella',
    scientificName: 'Chlorella vulgaris',
    type: 'algae',
    electronTransferRate: 2.3e8,
    optimalPH: 7.0,
    optimalTemp: 25,
    growthRate: 0.8,
    efficiency: 0.12,
    color: 0x00ff00
  },
  spirulina: {
    id: 'spirulina-platensis',
    name: 'Spirulina',
    scientificName: 'Spirulina platensis',
    type: 'algae',
    electronTransferRate: 1.8e8,
    optimalPH: 8.5,
    optimalTemp: 30,
    growthRate: 0.6,
    efficiency: 0.10,
    color: 0x00ffff
  },
  scenedesmus: {
    id: 'scenedesmus-obliquus',
    name: 'Scenedesmus',
    scientificName: 'Scenedesmus obliquus',
    type: 'algae',
    electronTransferRate: 2.0e8,
    optimalPH: 7.5,
    optimalTemp: 28,
    growthRate: 0.7,
    efficiency: 0.11,
    color: 0x88ff00
  },
  dunaliella: {
    id: 'dunaliella-salina',
    name: 'Dunaliella',
    scientificName: 'Dunaliella salina',
    type: 'algae',
    electronTransferRate: 1.5e8,
    optimalPH: 7.5,
    optimalTemp: 27,
    growthRate: 0.5,
    efficiency: 0.09,
    color: 0xff8800
  }
};

export const bacteriaDatabase: Record<string, MicrobeSpecies> = {
  geobacter: {
    id: 'geobacter-sulfurreducens',
    name: 'Geobacter',
    scientificName: 'Geobacter sulfurreducens',
    type: 'bacteria',
    electronTransferRate: 5.2e8,
    optimalPH: 7.0,
    optimalTemp: 30,
    growthRate: 0.3,
    efficiency: 0.89,
    color: 0xff0066
  },
  shewanella: {
    id: 'shewanella-oneidensis',
    name: 'Shewanella',
    scientificName: 'Shewanella oneidensis',
    type: 'bacteria',
    electronTransferRate: 4.8e8,
    optimalPH: 7.2,
    optimalTemp: 25,
    growthRate: 0.5,
    efficiency: 0.75,
    color: 0x6600ff
  },
  pseudomonas: {
    id: 'pseudomonas-aeruginosa',
    name: 'Pseudomonas',
    scientificName: 'Pseudomonas aeruginosa',
    type: 'bacteria',
    electronTransferRate: 3.5e8,
    optimalPH: 7.0,
    optimalTemp: 37,
    growthRate: 0.7,
    efficiency: 0.65,
    color: 0x00ff99
  },
  rhodoferax: {
    id: 'rhodoferax-ferrireducens',
    name: 'Rhodoferax',
    scientificName: 'Rhodoferax ferrireducens',
    type: 'bacteria',
    electronTransferRate: 4.2e8,
    optimalPH: 6.8,
    optimalTemp: 30,
    growthRate: 0.4,
    efficiency: 0.83,
    color: 0xff3366
  },
  desulfovibrio: {
    id: 'desulfovibrio-desulfuricans',
    name: 'Desulfovibrio',
    scientificName: 'Desulfovibrio desulfuricans',
    type: 'bacteria',
    electronTransferRate: 3.8e8,
    optimalPH: 7.5,
    optimalTemp: 35,
    growthRate: 0.3,
    efficiency: 0.70,
    color: 0x9933ff
  },
  clostridium: {
    id: 'clostridium-butyricum',
    name: 'Clostridium',
    scientificName: 'Clostridium butyricum',
    type: 'bacteria',
    electronTransferRate: 2.9e8,
    optimalPH: 6.5,
    optimalTemp: 37,
    growthRate: 0.6,
    efficiency: 0.55,
    color: 0xffcc00
  }
};

export const consortiaDatabase: Record<string, {
  id: string;
  name: string;
  composition: string[];
  synergyFactor: number;
  description: string;
  applications: string[];
}> = {
  'algae-bacteria-1': {
    id: 'algae-bacteria-consortium-1',
    name: 'Chlorella-Geobacter Consortium',
    composition: ['chlorella-vulgaris', 'geobacter-sulfurreducens'],
    synergyFactor: 1.35,
    description: 'Photosynthetic-heterotrophic consortium with enhanced electron transfer',
    applications: ['wastewater treatment', 'CO2 sequestration']
  },
  'mixed-culture-1': {
    id: 'mixed-culture-consortium-1',
    name: 'Wastewater Mixed Culture',
    composition: ['geobacter-sulfurreducens', 'shewanella-oneidensis', 'pseudomonas-aeruginosa'],
    synergyFactor: 1.45,
    description: 'Robust consortium for complex substrate degradation',
    applications: ['industrial wastewater', 'brewery waste']
  },
  'marine-consortium': {
    id: 'marine-benthic-consortium',
    name: 'Marine Sediment Consortium',
    composition: ['desulfovibrio-desulfuricans', 'rhodoferax-ferrireducens'],
    synergyFactor: 1.25,
    description: 'Salt-tolerant consortium for marine applications',
    applications: ['benthic fuel cells', 'ocean monitoring']
  }
};

/**
 * Get all microbes in the database
 */
export function getAllMicrobes(): MicrobeSpecies[] {
  return [
    ...Object.values(algaeDatabase),
    ...Object.values(bacteriaDatabase)
  ];
}

/**
 * Get microbe by ID
 */
export function getMicrobeById(id: string): MicrobeSpecies | undefined {
  return getAllMicrobes().find(microbe => microbe.id === id);
}

/**
 * Get microbes by type
 */
export function getMicrobesByType(type: 'algae' | 'bacteria' | 'archaea'): MicrobeSpecies[] {
  return getAllMicrobes().filter(microbe => microbe.type === type);
}

/**
 * Calculate synergistic power output for consortia
 */
export function calculateConsortiumPower(
  microbeIds: string[],
  baselinePower: number
): number {
  // Check if this is a known consortium
  const consortium = Object.values(consortiaDatabase).find(
    c => JSON.stringify(c.composition.sort()) === JSON.stringify(microbeIds.sort())
  );

  if (consortium) {
    return baselinePower * consortium.synergyFactor;
  }

  // Calculate average efficiency for unknown combinations
  const microbes = microbeIds.map(id => getMicrobeById(id)).filter(Boolean) as MicrobeSpecies[];
  const avgEfficiency = microbes.reduce((sum, m) => sum + m.efficiency, 0) / microbes.length;
  
  // Apply a small synergy bonus for diversity
  const diversityBonus = microbes.length > 1 ? 1.1 : 1.0;
  
  return baselinePower * avgEfficiency * diversityBonus;
}