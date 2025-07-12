// Common Types and Interfaces

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name?: string;
  role: UserRole;
  institution?: string;
  researchArea?: string;
}

export enum UserRole {
  USER = 'USER',
  RESEARCHER = 'RESEARCHER',
  ADMIN = 'ADMIN',
}

export interface Experiment extends BaseEntity {
  name: string;
  userId: string;
  status: ExperimentStatus;
  isPublic: boolean;
  parameters: ExperimentParameters;
}

export enum ExperimentStatus {
  SETUP = 'SETUP',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ExperimentParameters {
  temperature: number; // Celsius
  ph: number;
  substrate: string;
  concentration: number; // g/L
  hydraulicRetentionTime?: number; // hours
  organicLoadingRate?: number; // g COD/L/day
}

export interface Measurement {
  voltage: number; // V
  current: number; // A
  power: number; // W
  temperature: number; // C
  ph: number;
  timestamp: Date;
}

export interface ResearchPaper extends BaseEntity {
  title: string;
  authors: string[];
  abstract?: string;
  doi?: string;
  systemType?: string;
  powerOutput?: number; // mW/m²
  efficiency?: number; // percentage
}

export interface PredictionRequest {
  systemType: string;
  anodeMaterial: string;
  cathodeMaterial: string;
  temperature: number;
  ph: number;
  substrateType: string;
  substrateConcentration: number;
}

export interface PredictionResult {
  powerDensity: number; // mW/m²
  currentDensity: number; // mA/m²
  voltage: number; // V
  efficiency: number; // %
  confidence: number; // 0-1
}