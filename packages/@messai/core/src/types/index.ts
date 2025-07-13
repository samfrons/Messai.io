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

// Database model types for material and microbial parameters

export interface MaterialParameterDB {
  id: string;
  materialId: string;
  name: string;
  scientificName?: string;
  type: string;
  category: string;
  application: string;
  conductivity?: number;
  surfaceArea?: number;
  porosity?: number;
  density?: number;
  thickness?: number;
  composition?: string; // JSON string
  stability?: number;
  corrosionRes?: number;
  efficiency?: number;
  durability?: number;
  powerDensity?: number;
  currentDensity?: number;
  cost?: number;
  sustainability?: number;
  availability?: string;
  description?: string;
  advantages?: string; // JSON string
  limitations?: string; // JSON string
  manufacturer?: string;
  sourcesPapers?: string; // JSON string
  validatedBy?: string;
  compatibleWith?: string; // JSON string
  incompatibleWith?: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
  addedBy?: string;
  verified: boolean;
}

export interface MicrobialParameterDB {
  id: string;
  speciesId: string;
  commonName: string;
  scientificName: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus: string;
  species: string;
  strain?: string;
  type: string;
  metabolism: string;
  energySource: string;
  optimalTemp?: number;
  tempRange_min?: number;
  tempRange_max?: number;
  optimalPH: number;
  phRange_min?: number;
  phRange_max?: number;
  salinity?: number;
  electronTransferRate?: number;
  extracellularElectron: boolean;
  biofilmFormation: boolean;
  conductivity?: number;
  powerOutput?: number;
  currentDensity?: number;
  efficiency?: number;
  growthRate?: number;
  substrate_efficiency?: number;
  preferredSubstrates?: string; // JSON string
  substrate_range?: string; // JSON string
  inhibitors?: string; // JSON string
  applications?: string; // JSON string
  systemScale?: string;
  treatmentTypes?: string; // JSON string
  biosafety_level?: number;
  pathogenicity: boolean;
  environmental_risk?: string;
  growth_medium?: string; // JSON string
  cultivation_time?: number;
  storage_conditions?: string;
  consortiumMember: boolean;
  synergisticWith?: string; // JSON string
  antagonisticWith?: string; // JSON string
  synergyFactor?: number;
  sourcesPapers?: string; // JSON string
  isolationSource?: string;
  firstIsolated?: Date;
  genomeSize?: number;
  gcContent?: number;
  plasmids?: string; // JSON string
  description?: string;
  advantages?: string; // JSON string
  limitations?: string; // JSON string
  culturability?: string;
  createdAt: Date;
  updatedAt: Date;
  addedBy?: string;
  verified: boolean;
}

// API response types
export interface MaterialsAPIResponse {
  materials: MaterialParameterDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  source: 'database' | 'core_package';
}

export interface MicrobesAPIResponse {
  microbes: MicrobialParameterDB[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  source: 'database' | 'core_package';
}

export interface CompatibilityResult {
  compatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  performance: {
    predictedPowerDensity: number;
    predictedEfficiency: number;
    costEffectiveness: number;
  };
  materials: {
    anode: MaterialParameterDB | null;
    cathode: MaterialParameterDB | null;
  };
  alternativeOptions: Array<{
    materialId: string;
    name: string;
    type: string;
    cost?: number;
    sustainability?: number;
    costEffectiveness: number;
    source: 'database' | 'core';
  }>;
}