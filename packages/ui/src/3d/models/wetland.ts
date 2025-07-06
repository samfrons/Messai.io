/**
 * Constructed Wetland MFC model
 * Nature-based wastewater treatment system
 */

export function createWetland(THREE: any) {
  const group = new THREE.Group();

  // Simple terrain-like base
  const geometry = new THREE.BoxGeometry(3, 0.5, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    roughness: 0.7,
    metalness: 0,
  });

  const wetland = new THREE.Mesh(geometry, material);
  wetland.castShadow = true;
  wetland.receiveShadow = true;
  group.add(wetland);

  return group;
}