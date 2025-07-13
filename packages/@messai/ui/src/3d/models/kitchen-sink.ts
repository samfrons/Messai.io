/**
 * Kitchen Sink System model
 * Domestic waste-to-energy converter
 */

export function createKitchenSink(THREE: any) {
  const group = new THREE.Group();

  // Sink basin
  const sinkShape = new THREE.Shape();
  sinkShape.moveTo(-1, -0.5);
  sinkShape.lineTo(1, -0.5);
  sinkShape.lineTo(1, 0.5);
  sinkShape.lineTo(-1, 0.5);
  sinkShape.lineTo(-1, -0.5);

  const sinkGeometry = new THREE.ExtrudeGeometry(sinkShape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 10,
  });

  const sinkMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc,
    metalness: 0.6,
    roughness: 0.3,
  });

  const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
  sink.rotation.x = Math.PI / 2;
  sink.castShadow = true;
  sink.receiveShadow = true;
  group.add(sink);

  // MFC module underneath
  const mfcGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.6);
  const mfcMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.4,
    roughness: 0.6,
  });

  const mfc = new THREE.Mesh(mfcGeometry, mfcMaterial);
  mfc.position.y = -0.65;
  group.add(mfc);

  return group;
}