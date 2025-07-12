/**
 * Benchtop Bioreactor model
 * Laboratory-scale controlled reactor
 */

export function createBenchtopBioreactor(THREE: any) {
  const group = new THREE.Group();

  // Main vessel
  const vesselGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
  const vesselMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc0c0c0,
    metalness: 0.7,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  const vessel = new THREE.Mesh(vesselGeometry, vesselMaterial);
  vessel.castShadow = true;
  vessel.receiveShadow = true;
  group.add(vessel);

  // Control panel
  const panelGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.1);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.5,
    roughness: 0.4,
  });

  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.set(1.2, 0, 0);
  group.add(panel);

  return group;
}