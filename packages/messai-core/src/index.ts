/**
 * @messai/core - Open source prediction engine for microbial electrochemical systems
 * 
 * @packageDocumentation
 */

// Export types
export * from './types';

// Export prediction functions
export { calculatePower } from './predictions/power-calculator';

// Export microbe database and utilities
export {
  algaeDatabase,
  bacteriaDatabase,
  consortiaDatabase,
  getAllMicrobes,
  getMicrobeById,
  getMicrobesByType,
  calculateConsortiumPower
} from './microbes/database';

// Export materials database and utilities
export {
  carbonMaterials,
  nanomaterials,
  metalElectrodes,
  compositeElectrodes,
  getAllElectrodes,
  getElectrodesByType,
  calculateCostEffectiveness,
  getRecommendedMaterials
} from './materials/electrode-database';

// Version info
export const version = '0.1.0';

// Re-export commonly used functions with simpler names
export { calculatePower as predictPower } from './predictions/power-calculator';