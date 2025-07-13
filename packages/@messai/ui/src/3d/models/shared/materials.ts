/**
 * Shared materials for MESSAi 3D models
 */

import { Material } from '../../types';

/**
 * Create material based on configuration
 */
export function createMaterial(THREE: any, config: Material): any {
  const baseProps = {
    color: config.color,
    transparent: config.transparent || false,
    opacity: config.opacity || 1,
  };

  switch (config.type) {
    case 'physical':
      return new THREE.MeshPhysicalMaterial({
        ...baseProps,
        metalness: config.metalness || 0,
        roughness: config.roughness || 0.5,
        emissive: config.emissive || 0x000000,
        emissiveIntensity: config.emissiveIntensity || 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      });

    case 'standard':
      return new THREE.MeshStandardMaterial({
        ...baseProps,
        metalness: config.metalness || 0,
        roughness: config.roughness || 0.5,
        emissive: config.emissive || 0x000000,
        emissiveIntensity: config.emissiveIntensity || 0,
      });

    case 'basic':
    default:
      return new THREE.MeshBasicMaterial(baseProps);
  }
}

/**
 * Predefined materials for common MFC components
 */
export const materialLibrary = {
  // Electrode materials
  carbonCloth: {
    name: 'Carbon Cloth',
    type: 'standard' as const,
    color: 0x1a1a1a,
    metalness: 0.1,
    roughness: 0.8,
    emissive: 0x111111,
    emissiveIntensity: 0.1,
  },

  graphite: {
    name: 'Graphite',
    type: 'standard' as const,
    color: 0x2a2a2a,
    metalness: 0.3,
    roughness: 0.4,
    emissive: 0x222222,
    emissiveIntensity: 0.05,
  },

  stainlessSteel: {
    name: 'Stainless Steel',
    type: 'physical' as const,
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.2,
  },

  // Container materials
  earthenware: {
    name: 'Earthenware',
    type: 'standard' as const,
    color: 0xcc6633,
    metalness: 0,
    roughness: 0.9,
  },

  glass: {
    name: 'Glass',
    type: 'physical' as const,
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  },

  plastic: {
    name: 'Plastic',
    type: 'standard' as const,
    color: 0xf0f0f0,
    metalness: 0,
    roughness: 0.5,
  },

  acrylic: {
    name: 'Acrylic',
    type: 'physical' as const,
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.9,
  },

  // Special materials
  membrane: {
    name: 'Proton Exchange Membrane',
    type: 'physical' as const,
    color: 0xffe4b5,
    metalness: 0,
    roughness: 0.6,
    transparent: true,
    opacity: 0.7,
  },

  biofilm: {
    name: 'Biofilm',
    type: 'physical' as const,
    color: 0x90ee90,
    metalness: 0,
    roughness: 0.8,
    transparent: true,
    opacity: 0.6,
    emissive: 0x90ee90,
    emissiveIntensity: 0.1,
  },

  water: {
    name: 'Water/Electrolyte',
    type: 'physical' as const,
    color: 0x4682b4,
    metalness: 0,
    roughness: 0,
    transparent: true,
    opacity: 0.5,
  },

  // Circuit materials
  copper: {
    name: 'Copper Wire',
    type: 'physical' as const,
    color: 0xb87333,
    metalness: 0.8,
    roughness: 0.3,
  },

  circuitBoard: {
    name: 'Circuit Board',
    type: 'standard' as const,
    color: 0x1e4d2b,
    metalness: 0.1,
    roughness: 0.6,
  },

  silicon: {
    name: 'Silicon Chip',
    type: 'physical' as const,
    color: 0x696969,
    metalness: 0.4,
    roughness: 0.2,
  },
};

/**
 * Get material by name
 */
export function getMaterial(THREE: any, name: keyof typeof materialLibrary): any {
  const config = materialLibrary[name];
  if (!config) {
    console.warn(`Material '${name}' not found, using default`);
    return new THREE.MeshStandardMaterial({ color: 0x808080 });
  }
  return createMaterial(THREE, config);
}

/**
 * Create gradient material
 */
export function createGradientMaterial(
  THREE: any, 
  color1: number, 
  color2: number, 
  direction: 'vertical' | 'horizontal' = 'vertical'
): any {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;

  const gradient = direction === 'vertical' 
    ? context.createLinearGradient(0, 0, 0, 128)
    : context.createLinearGradient(0, 0, 128, 0);

  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);

  gradient.addColorStop(0, `#${c1.getHexString()}`);
  gradient.addColorStop(1, `#${c2.getHexString()}`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.1,
    roughness: 0.5,
  });
}