/**
 * Model definitions for all MESSAi 3D designs
 */

import { ModelDefinition, DesignType } from '../types';

// Import individual model builders
import { createEarthenPot } from './earthen-pot';
import { createCardboard } from './cardboard';
import { createMasonJar } from './mason-jar';
import { create3DPrinted } from './3d-printed';
import { createWetland } from './wetland';
import { createMicroChip } from './micro-chip';
import { createIsolinearChip } from './isolinear-chip';
import { createBenchtopBioreactor } from './benchtop-bioreactor';
import { createWastewaterTreatment } from './wastewater-treatment';
import { createBreweryProcessing } from './brewery-processing';
import { createArchitecturalFacade } from './architectural-facade';
import { createBenthicFuelCell } from './benthic-fuel-cell';
import { createKitchenSink } from './kitchen-sink';

/**
 * Complete model library for MESSAi
 */
export const modelDefinitions: Record<DesignType, ModelDefinition> = {
  'earthen-pot': {
    id: 'earthen-pot',
    name: 'Earthen Pot MFC',
    description: 'Traditional clay pot design for rural applications',
    color: 0xcc6633,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createEarthenPot,
    materialProps: {
      metalness: 0,
      roughness: 0.9,
    },
  },

  'cardboard': {
    id: 'cardboard',
    name: 'Cardboard MFC',
    description: 'Low-cost educational prototype',
    color: 0xd4a574,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createCardboard,
    materialProps: {
      metalness: 0,
      roughness: 0.8,
    },
  },

  'mason-jar': {
    id: 'mason-jar',
    name: 'Mason Jar MFC',
    description: 'Laboratory-scale glass container system',
    color: 0xf0f0f0,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createMasonJar,
    materialProps: {
      metalness: 0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
    },
  },

  '3d-printed': {
    id: '3d-printed',
    name: '3D Printed MFC',
    description: 'Customizable rapid prototype design',
    color: 0x4169e1,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: create3DPrinted,
    materialProps: {
      metalness: 0.2,
      roughness: 0.4,
    },
  },

  'wetland': {
    id: 'wetland',
    name: 'Constructed Wetland MFC',
    description: 'Nature-based wastewater treatment system',
    color: 0x228b22,
    scale: 1.5,
    rotation: [0, 0, 0],
    position: [0, -0.5, 0],
    createGeometry: createWetland,
    materialProps: {
      metalness: 0,
      roughness: 0.7,
    },
  },

  'micro-chip': {
    id: 'micro-chip',
    name: 'Micro-Chip MFC',
    description: 'Miniaturized bioelectronic device',
    color: 0x696969,
    emissiveColor: 0x00ff00,
    scale: 0.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createMicroChip,
    materialProps: {
      metalness: 0.6,
      roughness: 0.2,
    },
    animation: {
      type: 'pulse',
      speed: 2,
      amplitude: 0.05,
    },
  },

  'isolinear-chip': {
    id: 'isolinear-chip',
    name: 'Isolinear Chip MFC',
    description: 'Advanced optical biocomputing system',
    color: 0x9370db,
    emissiveColor: 0x9370db,
    scale: 0.6,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createIsolinearChip,
    materialProps: {
      metalness: 0.4,
      roughness: 0.1,
      emissiveIntensity: 0.3,
    },
    animation: {
      type: 'rotate',
      speed: 0.5,
    },
  },

  'benchtop-bioreactor': {
    id: 'benchtop-bioreactor',
    name: 'Benchtop Bioreactor',
    description: 'Laboratory-scale controlled reactor',
    color: 0xc0c0c0,
    scale: 1.2,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createBenchtopBioreactor,
    materialProps: {
      metalness: 0.7,
      roughness: 0.3,
    },
  },

  'wastewater-treatment': {
    id: 'wastewater-treatment',
    name: 'Wastewater Treatment Plant',
    description: 'Industrial-scale treatment facility',
    color: 0x4682b4,
    scale: 2,
    rotation: [0, 0, 0],
    position: [0, -1, 0],
    createGeometry: createWastewaterTreatment,
    materialProps: {
      metalness: 0.3,
      roughness: 0.6,
    },
  },

  'brewery-processing': {
    id: 'brewery-processing',
    name: 'Brewery Processing System',
    description: 'Waste-to-energy brewery integration',
    color: 0xdaa520,
    scale: 1.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createBreweryProcessing,
    materialProps: {
      metalness: 0.5,
      roughness: 0.4,
    },
  },

  'architectural-facade': {
    id: 'architectural-facade',
    name: 'Architectural Facade',
    description: 'Building-integrated bioelectrochemical system',
    color: 0x708090,
    scale: 2.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createArchitecturalFacade,
    materialProps: {
      metalness: 0.8,
      roughness: 0.2,
    },
  },

  'benthic-fuel-cell': {
    id: 'benthic-fuel-cell',
    name: 'Benthic Fuel Cell',
    description: 'Sediment-based marine power system',
    color: 0x2f4f4f,
    scale: 1.8,
    rotation: [0, 0, 0],
    position: [0, -0.8, 0],
    createGeometry: createBenthicFuelCell,
    materialProps: {
      metalness: 0.1,
      roughness: 0.8,
    },
  },

  'kitchen-sink': {
    id: 'kitchen-sink',
    name: 'Kitchen Sink System',
    description: 'Domestic waste-to-energy converter',
    color: 0xf5f5dc,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createKitchenSink,
    materialProps: {
      metalness: 0.6,
      roughness: 0.3,
    },
  },
};