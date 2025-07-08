import { PrismaClient } from '@prisma/client'
import { resolve } from 'path'

// Point to the main Messai database
const databasePath = resolve('/Users/samfrons/Desktop/Messai/prisma/research.db')
process.env.DATABASE_URL = `file:${databasePath}`

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${databasePath}`
    }
  }
})

async function checkPaperData() {
  try {
    console.log(`\n🔍 Checking database at: ${databasePath}\n`)

    // Get total count of papers
    const totalPapers = await prisma.paper.count()
    console.log(`📊 Total papers in database: ${totalPapers}`)

    if (totalPapers === 0) {
      console.log('\n❌ No papers found in the database!')
      return
    }

    // Count papers with abstracts
    const papersWithAbstracts = await prisma.paper.count({
      where: {
        abstract: {
          not: null
        }
      }
    })
    console.log(`\n📝 Papers with abstracts: ${papersWithAbstracts} (${((papersWithAbstracts/totalPapers)*100).toFixed(1)}%)`)

    // Check for extracted parameters
    const totalParameters = await prisma.parameter.count()
    const papersWithParameters = await prisma.paper.count({
      where: {
        parameters: {
          some: {}
        }
      }
    })
    console.log(`\n🔧 Total extracted parameters: ${totalParameters}`)
    console.log(`📊 Papers with extracted parameters: ${papersWithParameters} (${((papersWithParameters/totalPapers)*100).toFixed(1)}%)`)

    // Check for experiments
    const totalExperiments = await prisma.experiment.count()
    const papersWithExperiments = await prisma.paper.count({
      where: {
        experiments: {
          some: {}
        }
      }
    })
    console.log(`\n🧪 Total experiments: ${totalExperiments}`)
    console.log(`📊 Papers with experiments: ${papersWithExperiments} (${((papersWithExperiments/totalPapers)*100).toFixed(1)}%)`)

    // Check performance data from experiments
    const experimentsWithPowerDensity = await prisma.experiment.count({
      where: {
        powerDensity: {
          not: null
        }
      }
    })
    const experimentsWithCurrentDensity = await prisma.experiment.count({
      where: {
        currentDensity: {
          not: null
        }
      }
    })
    const experimentsWithEfficiency = await prisma.experiment.count({
      where: {
        efficiency: {
          not: null
        }
      }
    })
    console.log(`\n⚡ Experiments with power density data: ${experimentsWithPowerDensity}`)
    console.log(`⚡ Experiments with current density data: ${experimentsWithCurrentDensity}`)
    console.log(`📈 Experiments with efficiency data: ${experimentsWithEfficiency}`)

    // Check verification status
    const verifiedPapers = await prisma.paper.count({
      where: {
        verified: true
      }
    })
    console.log(`\n✅ Verified papers: ${verifiedPapers} (${((verifiedPapers/totalPapers)*100).toFixed(1)}%)`)

    // Check quality scores
    const highQualityPapers = await prisma.paper.count({
      where: {
        quality: {
          gte: 4
        }
      }
    })
    console.log(`⭐ High quality papers (4-5 rating): ${highQualityPapers} (${((highQualityPapers/totalPapers)*100).toFixed(1)}%)`)

    // Sample a few papers to see what data is populated
    console.log(`\n\n🔎 Sampling 5 papers to inspect data fields:\n`)
    const samplePapers = await prisma.paper.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        parameters: {
          take: 3
        },
        experiments: {
          take: 1
        }
      }
    })

    samplePapers.forEach((paper, index) => {
      console.log(`\n--- Paper ${index + 1} ---`)
      console.log(`Title: ${paper.title}`)
      console.log(`DOI: ${paper.doi || 'None'}`)
      console.log(`Year: ${paper.year}`)
      console.log(`Abstract: ${paper.abstract ? `${paper.abstract.substring(0, 100)}...` : 'None'}`)
      console.log(`Verified: ${paper.verified}`)
      console.log(`Quality: ${paper.quality}/5`)
      
      if (paper.parameters && paper.parameters.length > 0) {
        console.log(`\nExtracted Parameters:`)
        paper.parameters.forEach(param => {
          console.log(`  - ${param.name}: ${param.value} ${param.unit || ''} (confidence: ${param.confidence})`)
        })
      } else {
        console.log(`\nExtracted Parameters: None`)
      }

      if (paper.experiments && paper.experiments.length > 0) {
        const exp = paper.experiments[0]
        console.log(`\nExperiment Data:`)
        console.log(`  - System Type: ${exp.systemType}`)
        console.log(`  - Power Density: ${exp.powerDensity || 'N/A'} mW/m²`)
        console.log(`  - Efficiency: ${exp.efficiency || 'N/A'}%`)
      } else {
        console.log(`\nExperiment Data: None`)
      }
    })

    // Check for quality metrics
    const qualityMetrics = await prisma.qualityMetric.count()
    console.log(`\n\n📊 Quality metrics recorded: ${qualityMetrics}`)

    // Check system type distribution
    console.log(`\n\n🔬 Papers by system type:`)
    const systemTypes = await prisma.experiment.groupBy({
      by: ['systemType'],
      _count: true
    })
    systemTypes.forEach(group => {
      console.log(`  ${group.systemType}: ${group._count} experiments`)
    })

  } catch (error) {
    console.error('Error checking paper data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPaperData()