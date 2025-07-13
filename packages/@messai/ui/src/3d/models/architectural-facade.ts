/**
 * Architectural Facade model
 * Building-integrated bioelectrochemical system
 */

export function createArchitecturalFacade(THREE: any) {
  const group = new THREE.Group();

  // Building facade panel
  const panelGeometry = new THREE.BoxGeometry(4, 6, 0.3);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x708090,
    metalness: 0.8,
    roughness: 0.2,
  });

  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.castShadow = true;
  panel.receiveShadow = true;
  group.add(panel);

  // Integrated MFC modules
  const moduleGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
  const moduleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2f4f4f,
    metalness: 0.6,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  for (let x = -1.5; x <= 1.5; x += 1) {
    for (let y = -2.5; y <= 2.5; y += 1) {
      const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
      module.position.set(x, y, 0.25);
      group.add(module);
    }
  }

  return group;
}