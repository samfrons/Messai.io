/**
 * Wastewater Treatment Plant model
 * Industrial-scale treatment facility
 */

export function createWastewaterTreatment(THREE: any) {
  const group = new THREE.Group();

  // Treatment tank
  const tankGeometry = new THREE.BoxGeometry(4, 1.5, 3);
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: 0x4682b4,
    metalness: 0.3,
    roughness: 0.6,
  });

  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);

  // Pipes
  const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.6,
    roughness: 0.4,
  });

  const pipe1 = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe1.position.set(-2.2, 0, 0);
  pipe1.rotation.z = Math.PI / 2;
  group.add(pipe1);

  const pipe2 = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe2.position.set(2.2, 0, 0);
  pipe2.rotation.z = Math.PI / 2;
  group.add(pipe2);

  return group;
}