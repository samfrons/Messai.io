/**
 * 3D Printed MFC model
 * Customizable rapid prototype design
 */

export function create3DPrinted(THREE: any) {
  const group = new THREE.Group();

  // Main chamber with complex geometry
  const shape = new THREE.Shape();
  shape.moveTo(0, -1);
  shape.lineTo(1, -1);
  shape.lineTo(1, 1);
  shape.lineTo(-1, 1);
  shape.lineTo(-1, -1);
  shape.lineTo(0, -1);

  const extrudeSettings = {
    depth: 2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 10,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4169e1,
    roughness: 0.4,
    metalness: 0.2,
  });

  const chamber = new THREE.Mesh(geometry, material);
  chamber.rotation.x = Math.PI / 2;
  chamber.castShadow = true;
  chamber.receiveShadow = true;
  group.add(chamber);

  return group;
}