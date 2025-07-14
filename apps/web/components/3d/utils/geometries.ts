import * as THREE from 'three'

// Create rounded box geometry
export function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.1,
  smoothness: number = 4
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const eps = 0.00001
  const radius0 = radius - eps
  
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true)
  shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true)
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true)
  
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - radius * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
    curveSegments: smoothness,
  })
  
  geometry.center()
  
  return geometry
}

// Create electrode mesh pattern
export function createElectrodeMesh(
  width: number,
  height: number,
  spacing: number = 0.05
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const indices: number[] = []
  
  const cols = Math.floor(width / spacing)
  const rows = Math.floor(height / spacing)
  
  // Create vertices
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = (col / cols - 0.5) * width
      const y = (row / rows - 0.5) * height
      const z = Math.sin(col * 0.5) * Math.sin(row * 0.5) * 0.01 // Slight wave pattern
      
      vertices.push(x, y, z)
    }
  }
  
  // Create indices for mesh
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col
      const b = a + 1
      const c = a + cols + 1
      const d = c + 1
      
      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  
  return geometry
}

// Create flow tube geometry
export function createFlowTube(
  path: THREE.Vector3[],
  radius: number = 0.05,
  segments: number = 8
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(path)
  const geometry = new THREE.TubeGeometry(curve, path.length * 10, radius, segments, false)
  
  return geometry
}

// Create bubble geometry for gas visualization
export function createBubbleGeometry(
  radius: number = 0.02,
  detail: number = 2
): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(radius, detail)
  
  // Add some randomness to make it look more organic
  const positions = geometry.attributes.position
  const vertex = new THREE.Vector3()
  
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)
    vertex.normalize()
    vertex.multiplyScalar(radius * (1 + Math.random() * 0.1))
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  
  geometry.computeVertexNormals()
  
  return geometry
}

// Create inlet/outlet port geometry
export function createPortGeometry(
  innerRadius: number = 0.04,
  outerRadius: number = 0.06,
  height: number = 0.1
): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)
  
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.005,
    bevelThickness: 0.005,
  })
  
  geometry.center()
  geometry.rotateX(Math.PI / 2)
  
  return geometry
}

// Create connector geometry for wires
export function createConnectorGeometry(
  length: number,
  radius: number = 0.01,
  bendRadius: number = 0.05
): THREE.BufferGeometry {
  const path: THREE.Vector3[] = []
  
  // Create L-shaped connector path
  path.push(new THREE.Vector3(0, 0, 0))
  path.push(new THREE.Vector3(0, length / 2, 0))
  path.push(new THREE.Vector3(bendRadius, length / 2 + bendRadius, 0))
  path.push(new THREE.Vector3(length, length / 2 + bendRadius, 0))
  
  return createFlowTube(path, radius, 8)
}