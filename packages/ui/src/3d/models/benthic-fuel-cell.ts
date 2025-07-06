/**
 * Benthic Fuel Cell model
 * Sediment-based marine power system
 */

export function createBenthicFuelCell(THREE: any) {
  const group = new THREE.Group();

  // Sediment layer
  const sedimentGeometry = new THREE.BoxGeometry(3, 0.8, 3);
  const sedimentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f4f4f,
    roughness: 0.8,
    metalness: 0.1,
  });

  const sediment = new THREE.Mesh(sedimentGeometry, sedimentMaterial);
  sediment.position.y = -0.4;
  sediment.castShadow = true;
  sediment.receiveShadow = true;
  group.add(sediment);

  // Water layer
  const waterGeometry = new THREE.BoxGeometry(3, 1.5, 3);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4682b4,
    transparent: true,
    opacity: 0.4,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = 0.75;
  group.add(water);

  // Electrode array
  const electrodeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.3,
    roughness: 0.6,
  });

  for (let x = -1; x <= 1; x += 0.5) {
    for (let z = -1; z <= 1; z += 0.5) {
      const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
      electrode.position.set(x, 0, z);
      group.add(electrode);
    }
  }

  return group;
}