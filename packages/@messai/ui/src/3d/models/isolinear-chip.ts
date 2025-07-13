/**
 * Isolinear Chip MFC model
 * Advanced optical biocomputing system
 */

export function createIsolinearChip(THREE: any) {
  const group = new THREE.Group();

  // Crystal-like chip
  const geometry = new THREE.OctahedronGeometry(0.5, 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x9370db,
    metalness: 0.4,
    roughness: 0.1,
    emissive: 0x9370db,
    emissiveIntensity: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });

  const chip = new THREE.Mesh(geometry, material);
  chip.castShadow = true;
  chip.receiveShadow = true;
  group.add(chip);

  return group;
}