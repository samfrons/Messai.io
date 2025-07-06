/**
 * Brewery Processing System model
 * Waste-to-energy brewery integration
 */

export function createBreweryProcessing(THREE: any) {
  const group = new THREE.Group();

  // Fermentation tank
  const tankGeometry = new THREE.CylinderGeometry(1.2, 1.5, 3, 32);
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: 0xdaa520,
    metalness: 0.5,
    roughness: 0.4,
  });

  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);

  // Top dome
  const domeGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, tankMaterial);
  dome.position.y = 1.5;
  group.add(dome);

  return group;
}