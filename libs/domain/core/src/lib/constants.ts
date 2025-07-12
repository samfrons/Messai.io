// Scientific Constants
export const CONSTANTS = {
  // Physical Constants
  FARADAY: 96485.3329, // C/mol - Faraday constant
  GAS_CONSTANT: 8.314, // J/(mol·K) - Universal gas constant
  STANDARD_TEMPERATURE: 298.15, // K - Standard temperature (25°C)
  
  // Electrochemical Constants
  STANDARD_POTENTIAL: {
    H2_H_PLUS: 0.00, // V - Standard hydrogen electrode
    O2_H2O: 1.23, // V - Oxygen reduction potential
  },
  
  // Unit Conversions
  CONVERSIONS: {
    MW_TO_W: 0.001,
    W_TO_MW: 1000,
    CM2_TO_M2: 0.0001,
    M2_TO_CM2: 10000,
  },
  
  // MES System Types
  SYSTEM_TYPES: {
    MFC: 'Microbial Fuel Cell',
    MEC: 'Microbial Electrolysis Cell',
    MDC: 'Microbial Desalination Cell',
    MES: 'Microbial Electrosynthesis',
    BES: 'Bioelectrochemical System',
  },
} as const;

// Fuel Cell Types
export const FUEL_CELL_TYPES = {
  PEM: 'Proton Exchange Membrane',
  SOFC: 'Solid Oxide Fuel Cell',
  PAFC: 'Phosphoric Acid Fuel Cell',
  MCFC: 'Molten Carbonate Fuel Cell',
  AFC: 'Alkaline Fuel Cell',
} as const;