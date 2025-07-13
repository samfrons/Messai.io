/**
 * MESSAi 3D Components
 * Consolidated 3D visualization system
 */

// Main components
export { MESSModel3D } from './MESSModel3D';
export { MESSModel3DLite } from './MESSModel3DLite';
export type { MESSModel3DProps } from './types';

// Types
export type { 
  DesignType, 
  ModelDefinition, 
  Material, 
  ThreeContext 
} from './types';

// Utilities
export { checkWebGLSupport, getWebGLCapabilities, getQualitySettings } from './utils/webgl';
export { PerformanceMonitor, AdaptiveQuality, disposeObject, disposeScene } from './utils/performance';
export { loadThree, loadOrbitControls } from './utils/loader';

// Materials
export { createMaterial, getMaterial, materialLibrary, createGradientMaterial } from './models/shared/materials';

// Model definitions
export { modelDefinitions } from './models';

// Individual model creators (if needed for custom implementations)
export { createEarthenPot } from './models/earthen-pot';
export { createCardboard } from './models/cardboard';
export { createMasonJar } from './models/mason-jar';
export { create3DPrinted } from './models/3d-printed';
export { createWetland } from './models/wetland';
export { createMicroChip } from './models/micro-chip';
export { createIsolinearChip } from './models/isolinear-chip';
export { createBenchtopBioreactor } from './models/benchtop-bioreactor';
export { createWastewaterTreatment } from './models/wastewater-treatment';
export { createBreweryProcessing } from './models/brewery-processing';
export { createArchitecturalFacade } from './models/architectural-facade';
export { createBenthicFuelCell } from './models/benthic-fuel-cell';
export { createKitchenSink } from './models/kitchen-sink';

// Re-export as default for dynamic imports
export { default } from './MESSModel3D';