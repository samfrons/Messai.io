import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mfcDesigns = [
  {
    name: "Earthen Pot MFC",
    type: "earthen-pot",
    cost: "$1",
    powerOutput: "100-500 mW/m²",
    materials: {
      container: "Clay pot",
      electrodes: "Carbon cloth",
      separator: "Natural clay membrane",
      cost_breakdown: { pot: "$0.50", electrodes: "$0.50" }
    }
  },
  {
    name: "Cardboard MFC",
    type: "cardboard",
    cost: "$0.50",
    powerOutput: "50-200 mW/m²",
    materials: {
      container: "Corrugated cardboard",
      electrodes: "Activated carbon",
      treatment: "Thermal treatment",
      cost_breakdown: { cardboard: "$0.25", carbon: "$0.25" }
    }
  },
  {
    name: "Mason Jar MFC",
    type: "mason-jar",
    cost: "$10",
    powerOutput: "200-400 mW/m²",
    materials: {
      container: "Glass mason jar",
      electrodes: "Graphite rods",
      separator: "Salt bridge",
      cost_breakdown: { jar: "$5", electrodes: "$3", bridge: "$2" }
    }
  },
  {
    name: "3D Printed MFC",
    type: "3d-printed",
    cost: "$30",
    powerOutput: "300-750 mW/m²",
    materials: {
      container: "PLA plastic chambers",
      design: "Hexagonal geometry",
      electrodes: "Carbon fiber",
      cost_breakdown: { printing: "$20", electrodes: "$10" }
    }
  },
  {
    name: "Wetland MFC",
    type: "wetland",
    cost: "$100",
    powerOutput: "500-3000 mW/m²",
    materials: {
      container: "Plant bed system",
      electrodes: "Buried carbon electrodes",
      plants: "Aquatic vegetation",
      cost_breakdown: { setup: "$60", plants: "$20", electrodes: "$20" }
    }
  }
]

async function main() {
  console.log('Seeding database...')
  
  // Create a test user
  const user = await prisma.user.create({
    data: {
      id: 'user1',
      email: 'researcher@messai.com',
      name: 'MFC Researcher'
    }
  })

  // Create MFC designs
  for (const design of mfcDesigns) {
    await prisma.mFCDesign.create({
      data: {
        ...design,
        materials: JSON.stringify(design.materials)
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })