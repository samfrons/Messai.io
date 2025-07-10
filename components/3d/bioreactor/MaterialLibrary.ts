import * as THREE from 'three'

export interface MaterialSet {
  [key: string]: THREE.Material
}

export function getMaterialLibrary(): MaterialSet {
  const materials: MaterialSet = {
    // Carbon-based electrode materials
    carbonCloth: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5),
      aoMapIntensity: 1,
      envMapIntensity: 0.5,
      // Simulate fabric weave pattern
      map: generateFabricTexture(),
      normalMap: generateFabricNormalMap(),
    }),

    graphiteFelt: new THREE.MeshStandardMaterial({
      color: 0x2d2d2d,
      roughness: 0.95,
      metalness: 0.05,
      // Fuzzy, porous appearance
      map: generateFeltTexture(),
      normalMap: generateFeltNormalMap(),
    }),

    carbonNanotube: new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0a,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      reflectivity: 0.7,
      // Iridescent sheen
      iridescence: 0.3,
      iridescenceIOR: 2.0,
      sheen: 0.5,
      sheenRoughness: 0.2,
      sheenColor: new THREE.Color(0x4169e1),
    }),

    // MXene materials
    mxeneTi3C2Tx: new THREE.MeshPhysicalMaterial({
      color: 0x4a5568,
      roughness: 0.3,
      metalness: 0.9,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      // Layered 2D material appearance
      anisotropy: 0.8,
      anisotropyRotation: Math.PI / 4,
      sheen: 0.7,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0x6b46c1),
    }),

    // Metallic electrodes
    stainlessSteel: new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c0,
      roughness: 0.3,
      metalness: 1.0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.5,
      envMapIntensity: 1.0,
    }),

    copper: new THREE.MeshPhysicalMaterial({
      color: 0xb87333,
      roughness: 0.4,
      metalness: 1.0,
      clearcoat: 0.05,
      clearcoatRoughness: 0.7,
    }),

    platinum: new THREE.MeshPhysicalMaterial({
      color: 0xe5e5e5,
      roughness: 0.2,
      metalness: 1.0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      reflectivity: 1.0,
    }),

    // Chamber materials
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.5,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.0,
      side: THREE.DoubleSide,
    }),

    acrylic: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.5,
      transmission: 0.8,
      thickness: 1.0,
      ior: 1.49,
      side: THREE.DoubleSide,
    }),

    metalFrame: new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.7,
      metalness: 0.8,
      envMapIntensity: 0.7,
    }),

    // Membrane materials
    protonExchangeMembrane: new THREE.MeshPhysicalMaterial({
      color: 0x4fc3f7,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.4,
      transmission: 0.5,
      thickness: 0.1,
      side: THREE.DoubleSide,
    }),

    ceramicMembrane: new THREE.MeshPhysicalMaterial({
      color: 0xffd54f,
      roughness: 0.8,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    }),

    // Piping and connections
    pvcPipe: new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.5,
      metalness: 0.1,
    }),

    siliconeTubing: new THREE.MeshPhysicalMaterial({
      color: 0xf5f5f5,
      roughness: 0.4,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
      transmission: 0.3,
    }),

    // Special effect materials
    glowMaterial: new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.8,
    }),

    electronFlow: new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.6,
    }),
  }

  return materials
}

// Texture generation functions
function generateFabricTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Create woven pattern
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 512, 512)
  
  ctx.strokeStyle = '#2d2d2d'
  ctx.lineWidth = 2
  
  // Horizontal threads
  for (let i = 0; i < 512; i += 8) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(512, i)
    ctx.stroke()
  }
  
  // Vertical threads
  for (let i = 0; i < 512; i += 8) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  
  return texture
}

function generateFabricNormalMap(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Base normal color (pointing up)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add weave bumps
  for (let x = 0; x < 512; x += 8) {
    for (let y = 0; y < 512; y += 8) {
      const gradient = ctx.createRadialGradient(x + 4, y + 4, 0, x + 4, y + 4, 4)
      gradient.addColorStop(0, '#a0a0ff')
      gradient.addColorStop(1, '#7070ff')
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, 8, 8)
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  
  return texture
}

function generateFeltTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Create fuzzy, random fiber pattern
  ctx.fillStyle = '#2d2d2d'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add random fibers
  for (let i = 0; i < 1000; i++) {
    ctx.strokeStyle = `rgba(50, 50, 50, ${Math.random() * 0.5})`
    ctx.lineWidth = Math.random() * 2
    ctx.beginPath()
    
    const startX = Math.random() * 512
    const startY = Math.random() * 512
    const length = Math.random() * 50 + 10
    const angle = Math.random() * Math.PI * 2
    
    ctx.moveTo(startX, startY)
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    )
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  
  return texture
}

function generateFeltNormalMap(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Base normal
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add random bumps for fiber texture
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = Math.random() * 5 + 2
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, '#9090ff')
    gradient.addColorStop(1, '#8080ff')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  
  return texture
}

// Helper function to create custom shaders for advanced materials
export function createAdvancedMaterial(type: string): THREE.ShaderMaterial | null {
  switch (type) {
    case 'iridescent':
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2() }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.0);
            
            vec3 color1 = vec3(0.1, 0.3, 0.8);
            vec3 color2 = vec3(0.8, 0.3, 0.1);
            vec3 color = mix(color1, color2, fresnel);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `
      })
    
    default:
      return null
  }
}