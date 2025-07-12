/**
 * Cardboard MFC model
 * Low-cost educational prototype
 */

export function createCardboard(THREE: any) {
  const group = new THREE.Group();

  // Simple box structure
  const boxGeometry = new THREE.BoxGeometry(2, 1.5, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.8,
    metalness: 0,
  });
  
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);

  // Separator membrane
  const separatorGeometry = new THREE.PlaneGeometry(1.8, 1.3);
  const separatorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  
  const separator = new THREE.Mesh(separatorGeometry, separatorMaterial);
  separator.rotation.y = Math.PI / 2;
  group.add(separator);

  // Electrodes
  const electrodeGeometry = new THREE.PlaneGeometry(0.8, 1.2);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(-0.4, 0, 0);
  anode.rotation.y = Math.PI / 2;
  group.add(anode);

  const cathode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  cathode.position.set(0.4, 0, 0);
  cathode.rotation.y = Math.PI / 2;
  group.add(cathode);

  return group;
}