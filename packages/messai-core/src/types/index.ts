/**
 * Core types for MESSAi prediction engine
 */

export type DesignType = 
  | 'earthen-pot'
  | 'cardboard'
  | 'mason-jar'
  | '3d-printed'
  | 'wetland'
  | 'micro-chip'
  | 'isolinear-chip'
  | 'benchtop-bioreactor'
  | 'wastewater-treatment'
  | 'brewery-processing'
  | 'architectural-facade'
  | 'benthic-fuel-cell'
  | 'kitchen-sink';

export interface PredictionInput {
  /** Temperature in Celsius (20-40°C) */
  temperature: number;
  
  /** pH level (6-8) */
  ph: number;
  
  /** Substrate concentration in g/L (0.5-2) */
  substrateConcentration: number;
  
  /** Optional MFC design type */
  designType?: DesignType;
}

export interface PredictionResult {
  /** Predicted power output in milliwatts */
  predictedPower: number;
  
  /** Confidence interval for the prediction */
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  
  /** Individual factor contributions */
  factors: {
    temperature: number;
    ph: number;
    substrate: number;
    designBonus: number;
  };
  
  /** System efficiency percentage */
  efficiency: number;
}

export interface ElectrodeMaterial {
  name: string;
  type: 'carbon' | 'metal' | 'composite' | 'nanomaterial';
  conductivity: number; // S/cm
  surfaceArea: number; // m²/g
  cost: number; // $/m²
  sustainability: number; // 0-10 scale
  description: string;
  advantages: string[];
  limitations: string[];
}

export interface MicrobeSpecies {
  id: string;
  name: string;
  scientificName: string;
  type: 'algae' | 'bacteria' | 'archaea' | 'consortium';
  electronTransferRate: number; // electrons/s
  optimalPH: number;
  optimalTemp: number; // Celsius
  growthRate: number; // doublings/day
  efficiency: number; // 0-1 scale
  color?: number; // Hex color for visualization
}

export interface MFCDesign {
  id: string;
  name: string;
  type: DesignType;
  category: 'laboratory' | 'pilot' | 'industrial';
  volume: number; // liters
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  powerOutput: {
    typical: number; // mW
    max: number; // mW
  };
  efficiency: number; // percentage
  scalability: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  materials: {
    anode: string;
    cathode: string;
    membrane?: string;
    chamber: string;
  };
  applications: string[];
  advantages: string[];
  limitations: string[];
}