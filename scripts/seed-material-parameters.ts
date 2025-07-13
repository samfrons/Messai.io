/**
 * Seed script to populate MaterialParameter and MicrobialParameter tables
 * with data from @messai/core package
 */

import { PrismaClient } from '@prisma/client'

// Import data structures from core package files
const carbonMaterials = {
  'carbon-cloth': {
    name: 'Carbon Cloth',
    type: 'carbon',
    conductivity: 100,
    surfaceArea: 2000,
    cost: 50,
    sustainability: 7,
    description: 'Woven carbon fiber fabric with high surface area',
    advantages: ['High conductivity', 'Flexible', 'Good biofilm adhesion'],
    limitations: ['Moderate cost', 'Can degrade over time']
  },
  'carbon-felt': {
    name: 'Carbon Felt',
    type: 'carbon',
    conductivity: 80,
    surfaceArea: 2500,
    cost: 40,
    sustainability: 7,
    description: 'Non-woven carbon fiber material with excellent porosity',
    advantages: ['High porosity', 'Good mass transfer', 'Lower cost than cloth'],
    limitations: ['Lower mechanical strength', 'Compression affects performance']
  },
  'graphite-rod': {
    name: 'Graphite Rod',
    type: 'carbon',
    conductivity: 200,
    surfaceArea: 10,
    cost: 20,
    sustainability: 8,
    description: 'Solid graphite electrode with excellent conductivity',
    advantages: ['Very low cost', 'Highly conductive', 'Chemically stable'],
    limitations: ['Very low surface area', 'Poor biofilm adhesion']
  },
  'activated-carbon': {
    name: 'Activated Carbon',
    type: 'carbon',
    conductivity: 50,
    surfaceArea: 3000,
    cost: 30,
    sustainability: 9,
    description: 'High surface area carbon with microporous structure',
    advantages: ['Extremely high surface area', 'Low cost', 'Can be made from waste'],
    limitations: ['Lower conductivity', 'Requires binder']
  }
}

const nanomaterials = {
  'graphene-oxide': {
    name: 'Graphene Oxide',
    type: 'nanomaterial',
    conductivity: 500,
    surfaceArea: 2600,
    cost: 200,
    sustainability: 5,
    description: 'Single-layer carbon sheets with oxygen functional groups',
    advantages: ['Ultra-high conductivity', 'Excellent biocompatibility', 'Tunable properties'],
    limitations: ['High cost', 'Complex synthesis', 'Requires reduction']
  },
  'reduced-graphene-oxide': {
    name: 'Reduced Graphene Oxide (rGO)',
    type: 'nanomaterial',
    conductivity: 800,
    surfaceArea: 2400,
    cost: 250,
    sustainability: 5,
    description: 'Chemically reduced graphene oxide with restored conductivity',
    advantages: ['Exceptional conductivity', 'High surface area', 'Good stability'],
    limitations: ['Very high cost', 'Scalability challenges']
  },
  'carbon-nanotubes': {
    name: 'Carbon Nanotubes (CNTs)',
    type: 'nanomaterial',
    conductivity: 1000,
    surfaceArea: 1300,
    cost: 300,
    sustainability: 4,
    description: 'Cylindrical carbon structures with exceptional properties',
    advantages: ['Highest conductivity', 'Excellent mechanical properties', 'High aspect ratio'],
    limitations: ['Extremely high cost', 'Health concerns', 'Difficult to disperse']
  },
  'mxene-ti3c2': {
    name: 'MXene (Ti₃C₂Tₓ)',
    type: 'nanomaterial',
    conductivity: 1500,
    surfaceArea: 980,
    cost: 500,
    sustainability: 3,
    description: '2D transition metal carbide with metallic conductivity',
    advantages: ['Metallic conductivity', 'Hydrophilic', 'Excellent biocompatibility'],
    limitations: ['Very high cost', 'Oxidation sensitivity', 'Limited availability']
  }
}

const metalElectrodes = {
  'stainless-steel': {
    name: 'Stainless Steel 316L',
    type: 'metal',
    conductivity: 1400,
    surfaceArea: 1,
    cost: 15,
    sustainability: 6,
    description: 'Corrosion-resistant steel alloy',
    advantages: ['Low cost', 'Excellent conductivity', 'Mechanically strong'],
    limitations: ['Very low surface area', 'Can corrode in extreme conditions']
  },
  'titanium': {
    name: 'Titanium',
    type: 'metal',
    conductivity: 2300,
    surfaceArea: 1,
    cost: 100,
    sustainability: 5,
    description: 'Highly corrosion-resistant metal',
    advantages: ['Excellent corrosion resistance', 'Biocompatible', 'Long-lasting'],
    limitations: ['High cost', 'Low surface area', 'Requires surface modification']
  },
  'nickel-foam': {
    name: 'Nickel Foam',
    type: 'metal',
    conductivity: 1400,
    surfaceArea: 500,
    cost: 80,
    sustainability: 4,
    description: 'Porous metallic foam structure',
    advantages: ['High surface area for metal', 'Good conductivity', '3D structure'],
    limitations: ['Can corrode', 'Moderate cost', 'Heavy']
  }
}

const microbesData = {
  'geobacter-sulfurreducens': {
    name: 'Geobacter',
    scientificName: 'Geobacter sulfurreducens',
    type: 'bacteria',
    electronTransferRate: 5.2e8,
    optimalPH: 7.0,
    optimalTemp: 30,
    growthRate: 0.3,
    efficiency: 0.89
  },
  'shewanella-oneidensis': {
    name: 'Shewanella',
    scientificName: 'Shewanella oneidensis',
    type: 'bacteria',
    electronTransferRate: 4.8e8,
    optimalPH: 7.2,
    optimalTemp: 25,
    growthRate: 0.5,
    efficiency: 0.75
  },
  'chlorella-vulgaris': {
    name: 'Chlorella',
    scientificName: 'Chlorella vulgaris',
    type: 'algae',
    electronTransferRate: 2.3e8,
    optimalPH: 7.0,
    optimalTemp: 25,
    growthRate: 0.8,
    efficiency: 0.12
  }
}

const prisma = new PrismaClient()

async function seedMaterialParameters() {
  console.log('🌱 Seeding material parameters...')
  
  const allMaterials = { ...carbonMaterials, ...nanomaterials, ...metalElectrodes }
  
  for (const [materialId, material] of Object.entries(allMaterials)) {
    try {
      await prisma.materialParameter.upsert({
        where: { materialId },
        update: {},
        create: {
          materialId,
          name: material.name,
          type: material.type,
          category: 'electrode',
          application: 'anode', // Default application
          conductivity: material.conductivity,
          surfaceArea: material.surfaceArea,
          cost: material.cost,
          sustainability: material.sustainability,
          description: material.description,
          advantages: JSON.stringify(material.advantages),
          limitations: JSON.stringify(material.limitations),
          verified: true,
          addedBy: 'system'
        }
      })
      
      console.log(`✅ Added material: ${material.name}`)
    } catch (error) {
      console.error(`❌ Failed to add material ${material.name}:`, error)
    }
  }
}

async function seedMicrobialParameters() {
  console.log('🦠 Seeding microbial parameters...')
  
  for (const [speciesId, microbe] of Object.entries(microbesData)) {
    try {
      // Parse scientific name for genus and species
      const nameParts = microbe.scientificName.split(' ')
      const genus = nameParts[0]
      const species = nameParts[1] || ''
      
      await prisma.microbialParameter.upsert({
        where: { speciesId },
        update: {},
        create: {
          speciesId,
          commonName: microbe.name,
          scientificName: microbe.scientificName,
          genus,
          species,
          type: microbe.type,
          metabolism: 'anaerobic', // Default for MFC applications
          energySource: 'chemotroph',
          optimalTemp: microbe.optimalTemp,
          optimalPH: microbe.optimalPH,
          electronTransferRate: microbe.electronTransferRate,
          extracellularElectron: true, // These are all EET-capable
          biofilmFormation: true,
          efficiency: microbe.efficiency * 100, // Convert to percentage
          growthRate: microbe.growthRate,
          applications: JSON.stringify(['MFC', 'MEC']),
          systemScale: 'lab',
          verified: true,
          addedBy: 'system'
        }
      })
      
      console.log(`✅ Added microbe: ${microbe.name}`)
    } catch (error) {
      console.error(`❌ Failed to add microbe ${microbe.name}:`, error)
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...')
    
    await seedMaterialParameters()
    await seedMicrobialParameters()
    
    console.log('✅ Database seeding completed successfully!')
    
    // Print summary
    const materialCount = await prisma.materialParameter.count()
    const microbeCount = await prisma.microbialParameter.count()
    
    console.log(`\n📊 Summary:`)
    console.log(`• Materials: ${materialCount} entries`)
    console.log(`• Microbes: ${microbeCount} entries`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default main