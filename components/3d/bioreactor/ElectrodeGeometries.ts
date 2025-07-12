import * as THREE from 'three'

// Create chamber geometry with transparent walls
export function createChamberGeometry(dimensions: {
  width: number
  height: number
  depth: number
  thickness: number
}) {
  const { width, height, depth, thickness } = dimensions
  
  // Create hollow box by subtracting inner box from outer box
  const outerBox = new THREE.BoxGeometry(width, height, depth)
  const innerBox = new THREE.BoxGeometry(
    width - thickness * 2,
    height - thickness * 2,
    depth - thickness * 2
  )
  
  // For now, return a simple box with transparency
  // In production, use CSG operations for proper hollow chamber
  return outerBox
}

// Create electrode geometry with material-specific details
export function createElectrodeGeometry(
  height: number,
  depth: number,
  thickness: number,
  material: string
): THREE.BufferGeometry {
  let geometry: THREE.BufferGeometry
  
  switch (material) {
    case 'carbonCloth':
    case 'graphiteFelt':
      // Create a slightly wavy surface to simulate fabric/felt texture
      geometry = new THREE.PlaneGeometry(height, depth, 32, 32)
      const positions = geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const wave = Math.sin(x * 5) * Math.sin(y * 5) * 0.02
        positions.setZ(i, wave)
      }
      
      geometry.computeVertexNormals()
      break
      
    case 'carbonNanotube':
    case 'mxeneTi3C2Tx':
      // Create a more complex surface for advanced materials
      geometry = new THREE.PlaneGeometry(height, depth, 64, 64)
      const cnPositions = geometry.attributes.position
      
      for (let i = 0; i < cnPositions.count; i++) {
        const x = cnPositions.getX(i)
        const y = cnPositions.getY(i)
        // More intricate surface pattern
        const pattern = 
          Math.sin(x * 10) * Math.cos(y * 10) * 0.01 +
          Math.sin(x * 30) * Math.sin(y * 30) * 0.005
        cnPositions.setZ(i, pattern)
      }
      
      geometry.computeVertexNormals()
      break
      
    case 'stainlessSteel':
    case 'copper':
    case 'platinum':
      // Smooth metallic surface
      geometry = new THREE.BoxGeometry(height, depth, thickness)
      break
      
    default:
      // Default flat electrode
      geometry = new THREE.BoxGeometry(height, depth, thickness)
  }
  
  return geometry
}

// Create perforated electrode for better flow
export function createPerforatedElectrode(
  width: number,
  height: number,
  thickness: number,
  holeRadius: number = 0.02,
  holeSpacing: number = 0.1
): THREE.BufferGeometry {
  // Create base geometry
  const geometry = new THREE.BoxGeometry(width, height, thickness)
  
  // In a real implementation, we would subtract holes using CSG
  // For now, return the base geometry
  return geometry
}

// Create mesh electrode structure
export function createMeshElectrode(
  width: number,
  height: number,
  wireThickness: number = 0.002,
  spacing: number = 0.01
): THREE.Group {
  const group = new THREE.Group()
  
  // Create horizontal wires
  const horizontalWires = Math.floor(height / spacing)
  for (let i = 0; i < horizontalWires; i++) {
    const wire = new THREE.CylinderGeometry(
      wireThickness, 
      wireThickness, 
      width
    )
    const mesh = new THREE.Mesh(wire)
    mesh.rotation.z = Math.PI / 2
    mesh.position.y = -height / 2 + i * spacing
    group.add(mesh)
  }
  
  // Create vertical wires
  const verticalWires = Math.floor(width / spacing)
  for (let i = 0; i < verticalWires; i++) {
    const wire = new THREE.CylinderGeometry(
      wireThickness, 
      wireThickness, 
      height
    )
    const mesh = new THREE.Mesh(wire)
    mesh.position.x = -width / 2 + i * spacing
    group.add(mesh)
  }
  
  return group
}

// Create brush electrode (for rotating designs)
export function createBrushElectrode(
  radius: number,
  length: number,
  bristleCount: number = 100
): THREE.Group {
  const group = new THREE.Group()
  
  // Central rod
  const rod = new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, length)
  const rodMesh = new THREE.Mesh(rod)
  group.add(rodMesh)
  
  // Bristles
  for (let i = 0; i < bristleCount; i++) {
    const angle = (i / bristleCount) * Math.PI * 2
    const y = (i / bristleCount - 0.5) * length
    
    const bristle = new THREE.CylinderGeometry(0.001, 0.001, radius * 0.9)
    const bristleMesh = new THREE.Mesh(bristle)
    
    bristleMesh.position.set(
      Math.cos(angle) * radius * 0.1,
      y,
      Math.sin(angle) * radius * 0.1
    )
    bristleMesh.rotation.z = Math.PI / 2
    bristleMesh.lookAt(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    )
    
    group.add(bristleMesh)
  }
  
  return group
}

// Create spiral electrode (for tubular designs)
export function createSpiralElectrode(
  radius: number,
  height: number,
  turns: number = 10,
  wireRadius: number = 0.005
): THREE.Mesh {
  const curve = new THREE.Curve<THREE.Vector3>()
  
  curve.getPoint = function(t: number) {
    const angle = t * Math.PI * 2 * turns
    const y = (t - 0.5) * height
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    return new THREE.Vector3(x, y, z)
  }
  
  const geometry = new THREE.TubeGeometry(curve, 200, wireRadius, 8, false)
  return new THREE.Mesh(geometry)
}

// Create foam electrode structure
export function createFoamElectrode(
  width: number,
  height: number,
  depth: number,
  poreSize: number = 0.02
): THREE.Group {
  const group = new THREE.Group()
  
  // Create a porous structure using spheres
  const gridX = Math.floor(width / poreSize)
  const gridY = Math.floor(height / poreSize)
  const gridZ = Math.floor(depth / poreSize)
  
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      for (let z = 0; z < gridZ; z++) {
        // Random chance to place a sphere (creates porous structure)
        if (Math.random() > 0.3) {
          const sphere = new THREE.SphereGeometry(poreSize * 0.4, 8, 8)
          const mesh = new THREE.Mesh(sphere)
          
          mesh.position.set(
            (x - gridX / 2) * poreSize,
            (y - gridY / 2) * poreSize,
            (z - gridZ / 2) * poreSize
          )
          
          group.add(mesh)
        }
      }
    }
  }
  
  return group
}