import * as THREE from 'three'

// Material property definitions
export const MATERIAL_PROPERTIES = {
  carbonCloth: {
    conductivity: 95,
    biocompatibility: 90,
    porosity: 85,
    cost: 70,
    durability: 85,
  },
  carbonFelt: {
    conductivity: 90,
    biocompatibility: 85,
    porosity: 90,
    cost: 65,
    durability: 80,
  },
  grapheneOxide: {
    conductivity: 98,
    biocompatibility: 75,
    porosity: 60,
    cost: 30,
    durability: 75,
  },
  mxene: {
    conductivity: 99,
    biocompatibility: 70,
    porosity: 70,
    cost: 20,
    durability: 70,
  },
  platinum: {
    conductivity: 95,
    catalyticActivity: 95,
    cost: 10,
    durability: 95,
  },
  stainlessSteel: {
    conductivity: 85,
    catalyticActivity: 60,
    cost: 80,
    durability: 90,
  },
  copper: {
    conductivity: 92,
    catalyticActivity: 70,
    cost: 85,
    durability: 75,
  },
}

// Performance calculation based on materials
export function calculatePerformance(
  anodeMaterial: keyof typeof MATERIAL_PROPERTIES,
  cathodeMaterial: keyof typeof MATERIAL_PROPERTIES,
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
): { powerDensity: number; efficiency: number; cost: number } {
  const anodeProps = MATERIAL_PROPERTIES[anodeMaterial] || MATERIAL_PROPERTIES.carbonCloth
  const cathodeProps = MATERIAL_PROPERTIES[cathodeMaterial] || MATERIAL_PROPERTIES.stainlessSteel
  
  // Base power density by system type (mW/m²)
  const basePower = {
    MFC: 500,
    MEC: 0, // MEC consumes power
    MDC: 300,
    MES: 100,
  }
  
  // Calculate power density
  const conductivityFactor = ((anodeProps.conductivity || 50) + (cathodeProps.conductivity || 50)) / 200
  const biocompatibilityFactor = (anodeProps.biocompatibility || 50) / 100
  const catalyticFactor = (cathodeProps.catalyticActivity || 50) / 100
  
  const powerDensity = basePower[systemType] * conductivityFactor * biocompatibilityFactor * catalyticFactor
  
  // Calculate efficiency
  const efficiency = 30 + (conductivityFactor * 20) + (biocompatibilityFactor * 15) + (catalyticFactor * 15)
  
  // Calculate cost index (0-100, where 100 is most cost-effective)
  const anodeCost = anodeProps.cost || 50
  const cathodeCost = cathodeProps.cost || 50
  const costIndex = (anodeCost + cathodeCost) / 2
  
  return {
    powerDensity: Math.round(powerDensity),
    efficiency: Math.min(Math.round(efficiency), 85),
    cost: costIndex,
  }
}

// Create procedural textures for materials
export function createProceduralTexture(type: 'carbon' | 'metal' | 'biofilm'): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')!
  
  switch (type) {
    case 'carbon':
      // Create carbon fiber pattern
      context.fillStyle = '#1a1a1a'
      context.fillRect(0, 0, 512, 512)
      
      // Add fiber pattern
      for (let i = 0; i < 512; i += 4) {
        context.strokeStyle = `rgba(50, 50, 50, ${Math.random() * 0.5})`
        context.beginPath()
        context.moveTo(0, i)
        context.lineTo(512, i + Math.random() * 2)
        context.stroke()
      }
      break
      
    case 'metal':
      // Create brushed metal pattern
      const gradient = context.createLinearGradient(0, 0, 512, 0)
      gradient.addColorStop(0, '#aaaaaa')
      gradient.addColorStop(0.5, '#cccccc')
      gradient.addColorStop(1, '#aaaaaa')
      context.fillStyle = gradient
      context.fillRect(0, 0, 512, 512)
      
      // Add scratches
      for (let i = 0; i < 200; i++) {
        context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`
        context.beginPath()
        context.moveTo(0, Math.random() * 512)
        context.lineTo(512, Math.random() * 512)
        context.stroke()
      }
      break
      
    case 'biofilm':
      // Create organic biofilm pattern
      context.fillStyle = '#4a7c59'
      context.fillRect(0, 0, 512, 512)
      
      // Add organic spots
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const radius = Math.random() * 30 + 10
        
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, 'rgba(74, 124, 89, 0.8)')
        gradient.addColorStop(1, 'rgba(74, 124, 89, 0)')
        
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      }
      break
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  
  return texture
}