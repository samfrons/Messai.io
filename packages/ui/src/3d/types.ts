/**
 * Type definitions for MESSAi 3D models
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

export interface MESSModel3DProps {
  /** The design type to render */
  design: DesignType;
  
  /** Enable interactive controls (orbit, zoom, pan) */
  interactive?: boolean;
  
  /** Show grid helper */
  showGrid?: boolean;
  
  /** Auto-rotate the model */
  autoRotate?: boolean;
  
  /** Rotation speed (if autoRotate is true) */
  rotationSpeed?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Called when model is loaded */
  onLoad?: () => void;
  
  /** Called on error */
  onError?: (error: Error) => void;
  
  /** Click handler for model */
  onClick?: (component?: string) => void;
  
  /** Show component labels */
  showLabels?: boolean;
  
  /** Enable performance mode (reduced quality for better FPS) */
  performanceMode?: boolean;
}

export interface ModelDefinition {
  /** Unique identifier */
  id: DesignType;
  
  /** Display name */
  name: string;
  
  /** Model description */
  description: string;
  
  /** Base color (hex) */
  color: number;
  
  /** Emissive color (hex) */
  emissiveColor?: number;
  
  /** Scale factor */
  scale?: number;
  
  /** Initial rotation [x, y, z] in radians */
  rotation?: [number, number, number];
  
  /** Initial position [x, y, z] */
  position?: [number, number, number];
  
  /** Custom geometry builder */
  createGeometry?: (THREE: any) => any;
  
  /** Custom material properties */
  materialProps?: Record<string, any>;
  
  /** Animation configuration */
  animation?: {
    type: 'rotate' | 'float' | 'pulse';
    speed?: number;
    amplitude?: number;
  };
}

export interface Material {
  name: string;
  type: 'physical' | 'standard' | 'basic';
  color: number;
  metalness?: number;
  roughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

export interface ThreeContext {
  scene: any;
  camera: any;
  renderer: any;
  controls?: any;
}