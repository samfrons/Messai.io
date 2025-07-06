/**
 * Micro-Chip MFC model
 * Miniaturized bioelectronic device
 */

export function createMicroChip(THREE: any) {
  const group = new THREE.Group();

  // Circuit board base
  const boardGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e4d2b,
    roughness: 0.6,
    metalness: 0.1,
  });

  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  // Chip
  const chipGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.3);
  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0x696969,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x00ff00,
    emissiveIntensity: 0.1,
  });

  const chip = new THREE.Mesh(chipGeometry, chipMaterial);
  chip.position.y = 0.08;
  group.add(chip);

  return group;
}