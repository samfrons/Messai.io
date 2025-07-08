import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPaperData() {
  try {
    // Get total count of papers
    const totalPapers = await prisma.researchPaper.count()
    console.log(`\n📊 Total papers in database: ${totalPapers}`)

    // Count papers with abstracts
    const papersWithAbstracts = await prisma.researchPaper.count({
      where: {
        abstract: {
          not: null
        }
      }
    })
    console.log(`\n📝 Papers with abstracts: ${papersWithAbstracts} (${((papersWithAbstracts/totalPapers)*100).toFixed(1)}%)`)

    // Count papers with performance data
    const papersWithPowerOutput = await prisma.researchPaper.count({
      where: {
        powerOutput: {
          not: null
        }
      }
    })
    const papersWithEfficiency = await prisma.researchPaper.count({
      where: {
        efficiency: {
          not: null
        }
      }
    })
    console.log(`\n⚡ Papers with power output data: ${papersWithPowerOutput} (${((papersWithPowerOutput/totalPapers)*100).toFixed(1)}%)`)
    console.log(`📈 Papers with efficiency data: ${papersWithEfficiency} (${((papersWithEfficiency/totalPapers)*100).toFixed(1)}%)`)

    // Count papers with materials data
    const papersWithAnodeMaterials = await prisma.researchPaper.count({
      where: {
        anodeMaterials: {
          not: null
        }
      }
    })
    const papersWithCathodeMaterials = await prisma.researchPaper.count({
      where: {
        cathodeMaterials: {
          not: null
        }
      }
    })
    console.log(`\n🔩 Papers with anode materials: ${papersWithAnodeMaterials} (${((papersWithAnodeMaterials/totalPapers)*100).toFixed(1)}%)`)
    console.log(`🔩 Papers with cathode materials: ${papersWithCathodeMaterials} (${((papersWithCathodeMaterials/totalPapers)*100).toFixed(1)}%)`)

    // Count papers with AI-generated fields
    const papersWithAISummary = await prisma.researchPaper.count({
      where: {
        aiSummary: {
          not: null
        }
      }
    })
    const papersWithAIKeyFindings = await prisma.researchPaper.count({
      where: {
        aiKeyFindings: {
          not: null
        }
      }
    })
    const papersWithAIDataExtraction = await prisma.researchPaper.count({
      where: {
        aiDataExtraction: {
          not: null
        }
      }
    })
    console.log(`\n🤖 Papers with AI summary: ${papersWithAISummary} (${((papersWithAISummary/totalPapers)*100).toFixed(1)}%)`)
    console.log(`🔍 Papers with AI key findings: ${papersWithAIKeyFindings} (${((papersWithAIKeyFindings/totalPapers)*100).toFixed(1)}%)`)
    console.log(`📊 Papers with AI data extraction: ${papersWithAIDataExtraction} (${((papersWithAIDataExtraction/totalPapers)*100).toFixed(1)}%)`)

    // Sample a few papers to see what data is populated
    console.log(`\n\n🔎 Sampling 5 papers to inspect data fields:\n`)
    const samplePapers = await prisma.researchPaper.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    samplePapers.forEach((paper, index) => {
      console.log(`\n--- Paper ${index + 1} ---`)
      console.log(`Title: ${paper.title}`)
      console.log(`DOI: ${paper.doi || 'None'}`)
      console.log(`Abstract: ${paper.abstract ? `${paper.abstract.substring(0, 100)}...` : 'None'}`)
      console.log(`System Type: ${paper.systemType || 'None'}`)
      console.log(`Power Output: ${paper.powerOutput || 'None'}`)
      console.log(`Efficiency: ${paper.efficiency || 'None'}`)
      console.log(`Anode Materials: ${paper.anodeMaterials || 'None'}`)
      console.log(`Cathode Materials: ${paper.cathodeMaterials || 'None'}`)
      console.log(`AI Summary: ${paper.aiSummary ? 'Present' : 'None'}`)
      console.log(`AI Key Findings: ${paper.aiKeyFindings ? 'Present' : 'None'}`)
      console.log(`AI Data Extraction: ${paper.aiDataExtraction ? 'Present' : 'None'}`)
      console.log(`Source: ${paper.source}`)
    })

    // Check distribution by source
    console.log(`\n\n📚 Papers by source:\n`)
    const sourceGroups = await prisma.researchPaper.groupBy({
      by: ['source'],
      _count: true
    })
    sourceGroups.forEach(group => {
      console.log(`${group.source}: ${group._count} papers`)
    })

    // Check distribution by system type
    console.log(`\n\n🔬 Papers by system type:\n`)
    const systemTypeGroups = await prisma.researchPaper.groupBy({
      by: ['systemType'],
      _count: true
    })
    systemTypeGroups.forEach(group => {
      console.log(`${group.systemType || 'Not specified'}: ${group._count} papers`)
    })

  } catch (error) {
    console.error('Error checking paper data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPaperData()