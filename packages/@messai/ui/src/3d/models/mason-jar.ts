/**
 * Mason Jar MFC model
 * Laboratory-scale glass container system
 */

export function createMasonJar(THREE: any) {
  const group = new THREE.Group();

  // Glass jar
  const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
  const jarMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });
  
  const jar = new THREE.Mesh(jarGeometry, jarMaterial);
  jar.castShadow = true;
  jar.receiveShadow = true;
  group.add(jar);

  // Metal lid
  const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 32);
  const lidMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.8,
    roughness: 0.3,
  });
  
  const lid = new THREE.Mesh(lidGeometry, lidMaterial);
  lid.position.y = 1.05;
  group.add(lid);

  // Electrodes
  const electrodeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
    metalness: 0.2,
  });

  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(-0.3, 0, 0);
  group.add(anode);

  const cathode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  cathode.position.set(0.3, 0, 0);
  group.add(cathode);

  // Substrate/water
  const substrateGeometry = new THREE.CylinderGeometry(0.75, 0.75, 1.5, 32);
  const substrateMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8b4513,
    transparent: true,
    opacity: 0.6,
    roughness: 0.8,
    metalness: 0,
  });
  
  const substrate = new THREE.Mesh(substrateGeometry, substrateMaterial);
  substrate.position.y = -0.25;
  group.add(substrate);

  return group;
}