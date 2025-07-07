import prisma from '../lib/db'

async function checkSchema() {
  try {
    // Try to query with AI fields
    const papers = await prisma.researchPaper.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        aiSummary: true,
        aiKeyFindings: true,
        aiInsights: true
      }
    })
    
    console.log('✅ AI fields are available in the schema')
    console.log('Sample paper:', papers[0])
  } catch (error: any) {
    if (error.message.includes('Unknown field')) {
      console.log('❌ AI fields are NOT in the schema')
      console.log('Error:', error.message)
    } else {
      console.log('Error:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkSchema()