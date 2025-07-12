/**
 * Earthen Pot MFC model
 * Traditional clay pot design for rural applications
 */

export function createEarthenPot(THREE: any) {
  const group = new THREE.Group();

  // Main pot body (using lathe geometry for realistic pot shape)
  const points = [];
  const segments = 10;
  
  // Create pot profile
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * 2 - 0.5;
    
    // Shape function for pot profile
    let radius;
    if (t < 0.3) {
      // Bottom section
      radius = 0.3 + t * 0.5;
    } else if (t < 0.8) {
      // Wide middle section
      radius = 0.8 + Math.sin((t - 0.3) * Math.PI) * 0.2;
    } else {
      // Neck
      radius = 1 - (t - 0.8) * 2;
    }
    
    points.push(new THREE.Vector2(radius, y));
  }

  // Create pot geometry
  const potGeometry = new THREE.LatheGeometry(points, 32);
  
  // Create pot material (terracotta)
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc6633,
    roughness: 0.9,
    metalness: 0,
  });
  
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  // Inner chamber (anode)
  const innerChamberGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32);
  const innerChamberMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
    metalness: 0.1,
  });
  
  const innerChamber = new THREE.Mesh(innerChamberGeometry, innerChamberMaterial);
  innerChamber.position.y = -0.2;
  group.add(innerChamber);

  // Carbon cloth electrodes
  const electrodeGeometry = new THREE.PlaneGeometry(0.8, 0.8);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Anode (inner electrode)
  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(0, 0, 0);
  anode.rotation.y = Math.PI / 4;
  group.add(anode);

  // Cathode (outer electrode - curved to follow pot shape)
  const cathodeGeometry = new THREE.RingGeometry(0.7, 0.9, 32);
  const cathode = new THREE.Mesh(cathodeGeometry, electrodeMaterial);
  cathode.position.y = 0.3;
  cathode.rotation.x = -Math.PI / 2;
  group.add(cathode);

  // Wire connections
  const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5);
  const wireMaterial = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.8,
    roughness: 0.3,
  });

  // Anode wire
  const anodeWire = new THREE.Mesh(wireGeometry, wireMaterial);
  anodeWire.position.set(0, 0.8, 0);
  group.add(anodeWire);

  // Cathode wire
  const cathodeWire = new THREE.Mesh(wireGeometry, wireMaterial);
  cathodeWire.position.set(0.7, 0.8, 0);
  cathodeWire.rotation.z = Math.PI / 6;
  group.add(cathodeWire);

  // Water/substrate level indicator
  const waterGeometry = new THREE.CylinderGeometry(0.58, 0.58, 0.8, 32);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4682b4,
    transparent: true,
    opacity: 0.3,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });
  
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = -0.3;
  group.add(water);

  // Add some decorative elements (traditional patterns)
  const patternGeometry = new THREE.TorusGeometry(0.9, 0.02, 8, 32);
  const patternMaterial = new THREE.MeshStandardMaterial({
    color: 0xa0522d,
    roughness: 0.8,
    metalness: 0,
  });

  const pattern1 = new THREE.Mesh(patternGeometry, patternMaterial);
  pattern1.position.y = 0.5;
  pattern1.rotation.x = Math.PI / 2;
  group.add(pattern1);

  const pattern2 = new THREE.Mesh(patternGeometry, patternMaterial);
  pattern2.position.y = 0;
  pattern2.rotation.x = Math.PI / 2;
  pattern2.scale.setScalar(1.1);
  group.add(pattern2);

  return group;
}