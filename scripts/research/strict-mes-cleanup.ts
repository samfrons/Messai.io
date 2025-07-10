import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Papers must contain at least one of these terms to be considered MES-related
const REQUIRED_TERMS = [
  'microbial fuel cell',
  'microbial electrolysis cell',
  'microbial desalination cell',
  'microbial electrosynthesis',
  'bioelectrochemical system',
  'bio-electrochemical',
  'MFC',
  'MEC',
  'MDC',
  'MES',
  'BES',
  'microbial electrochemical',
  'exoelectrogen',
  'electroactive bacteria',
  'electroactive microorganism',
  'bioelectricity',
  'bioelectrochemical',
  'electromicrobiology',
  'bioelectrocatalysis',
  'bioanode',
  'biocathode',
  'electromethanogenesis',
  'microbial battery',
  'living battery',
  'bacterial fuel cell',
  'microbial power',
  'bioelectrogenic',
  'electrogenic bacteria',
  'microbial electricity',
  'biological fuel cell'
]

// Exclude papers that ONLY have these terms without MES context
const EXCLUDE_IF_ONLY = [
  /^.*solar energy.*$/i,
  /^.*wind power.*$/i,
  /^.*photovoltaic.*$/i,
  /^.*accounting.*$/i,
  /^.*biodiesel.*$/i,
  /^.*petroleum.*$/i,
  /^.*PEMFC.*$/i,
  /^.*SOFC.*$/i,
  /^.*DMFC.*$/i,
  /^.*direct methanol fuel cell.*$/i,
  /^.*proton exchange membrane fuel cell.*$/i,
  /^.*solid oxide fuel cell.*$/i,
  /^.*alkaline fuel cell.*$/i,
  /^.*phosphoric acid fuel cell.*$/i
]

async function strictMESCleanup() {
  try {
    console.log('🧹 Starting STRICT MES paper cleanup...')
    
    // Fetch all papers
    const allPapers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        abstract: true,
        keywords: true,
        systemType: true,
        source: true
      }
    })
    
    console.log(`📊 Total papers in database: ${allPapers.length}`)
    
    const papersToDelete: string[] = []
    const papersToKeep: string[] = []
    
    for (const paper of allPapers) {
      const searchText = `${paper.title} ${paper.abstract || ''} ${paper.keywords || ''}`.toLowerCase()
      
      // Check if paper contains any required MES terms
      const hasMESTerm = REQUIRED_TERMS.some(term => 
        searchText.includes(term.toLowerCase())
      )
      
      // Check if title matches exclusion patterns
      const titleExcluded = EXCLUDE_IF_ONLY.some(pattern => 
        pattern.test(paper.title)
      )
      
      if (!hasMESTerm) {
        // No MES terms found - delete
        papersToDelete.push(paper.id)
        console.log(`❌ No MES terms: "${paper.title}"`)
      } else if (titleExcluded && !paper.title.toLowerCase().includes('microbial')) {
        // Has exclusion pattern in title and no "microbial" - delete
        papersToDelete.push(paper.id)
        console.log(`❌ Non-microbial fuel cell: "${paper.title}"`)
      } else {
        // Keep the paper
        papersToKeep.push(paper.id)
      }
    }
    
    console.log(`\n📊 Analysis complete:`)
    console.log(`   - Papers to delete: ${papersToDelete.length}`)
    console.log(`   - Papers to keep: ${papersToKeep.length}`)
    
    // Delete papers
    if (papersToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${papersToDelete.length} non-MES papers...`)
      
      // Delete in batches to avoid overwhelming the database
      const batchSize = 100
      let deleted = 0
      
      for (let i = 0; i < papersToDelete.length; i += batchSize) {
        const batch = papersToDelete.slice(i, i + batchSize)
        const result = await prisma.researchPaper.deleteMany({
          where: {
            id: {
              in: batch
            }
          }
        })
        deleted += result.count
        console.log(`   Deleted batch ${Math.floor(i/batchSize) + 1}: ${result.count} papers`)
      }
      
      console.log(`✅ Total deleted: ${deleted} papers`)
    } else {
      console.log('\n✅ No papers to delete - database contains only MES papers!')
    }
    
    // Final count
    const finalCount = await prisma.researchPaper.count()
    console.log(`\n📊 Final paper count: ${finalCount}`)
    
    // Show some examples of kept papers
    const sampleKept = await prisma.researchPaper.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { title: true }
    })
    
    console.log('\n📚 Sample of papers kept:')
    sampleKept.forEach(p => console.log(`   ✓ ${p.title}`))
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
strictMESCleanup()