'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

export type MaterialType = 
  | 'carbonCloth'
  | 'carbonFelt'
  | 'grapheneOxide'
  | 'mxene'
  | 'platinum'
  | 'stainlessSteel'
  | 'copper'
  | 'biofilm'
  | 'electrolyte'
  | 'membrane'
  | 'plastic'

interface MaterialsLibrary {
  [key: string]: THREE.Material
}

export function useMaterials(): MaterialsLibrary {
  // In production, these would be actual texture files
  // For now, we'll use procedural materials
  
  const materials = useMemo(() => {
    const lib: MaterialsLibrary = {
      // Electrode Materials
      carbonCloth: new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.1,
        clearcoat: 0.1,
        clearcoatRoughness: 0.8,
      }),
      
      carbonFelt: new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        roughness: 0.9,
        metalness: 0.05,
        clearcoat: 0.05,
      }),
      
      grapheneOxide: new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        transmission: 0.3,
        thickness: 0.5,
        roughness: 0.2,
        metalness: 0.5,
        ior: 2.4,
      }),
      
      mxene: new THREE.MeshPhysicalMaterial({
        color: 0x3a4a5a,
        roughness: 0.3,
        metalness: 0.8,
        clearcoat: 0.5,
        iridescence: 0.8,
        iridescenceIOR: 1.5,
      }),
      
      platinum: new THREE.MeshPhysicalMaterial({
        color: 0xe5e4e2,
        roughness: 0.1,
        metalness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      }),
      
      stainlessSteel: new THREE.MeshPhysicalMaterial({
        color: 0xaaaaaa,
        roughness: 0.3,
        metalness: 0.9,
        clearcoat: 0.3,
      }),
      
      copper: new THREE.MeshPhysicalMaterial({
        color: 0xb87333,
        roughness: 0.4,
        metalness: 0.9,
        clearcoat: 0.2,
      }),
      
      // Biological Materials
      biofilm: new THREE.MeshPhysicalMaterial({
        color: 0x4a7c59,
        transmission: 0.6,
        thickness: 1.0,
        roughness: 0.9,
        clearcoat: 0.8,
        clearcoatRoughness: 0.5,
        sheen: 0.5,
        sheenColor: 0x2a4a3a,
      }),
      
      // Fluids
      electrolyte: new THREE.MeshPhysicalMaterial({
        color: 0x87ceeb,
        transmission: 0.9,
        thickness: 1.0,
        roughness: 0.0,
        ior: 1.33,
        reflectivity: 0.5,
      }),
      
      // Membranes
      membrane: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.5,
        thickness: 0.1,
        roughness: 0.8,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      
      // Chamber Materials
      plastic: new THREE.MeshPhysicalMaterial({
        color: 0xeeeeee,
        roughness: 0.3,
        metalness: 0.0,
        clearcoat: 0.3,
        transmission: 0.3,
        thickness: 2.0,
        ior: 1.5,
      }),
    }
    
    return lib
  }, [])
  
  return materials
}

// Material presets for quick access
export const MATERIAL_PRESETS = {
  anode: {
    basic: 'carbonCloth',
    advanced: 'grapheneOxide',
    highPerformance: 'mxene',
  },
  cathode: {
    costEffective: 'copper',
    standard: 'stainlessSteel',
    highPerformance: 'platinum',
  },
  chamber: {
    standard: 'plastic',
  },
  separator: {
    standard: 'membrane',
  },
}

// Helper function to get material by name
export function getMaterialByName(
  materials: MaterialsLibrary,
  materialName: MaterialType
): THREE.Material {
  return materials[materialName] || materials.plastic
}