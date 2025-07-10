import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Keywords that indicate the paper is NOT about microbial electrochemical systems
const EXCLUSION_PATTERNS = [
  // General renewable energy (without microbial context)
  /solar\s+(energy|power|panel|cell)/i,
  /wind\s+(power|energy|turbine|farm)/i,
  /photovoltaic/i,
  /nuclear\s+(power|energy|reactor)/i,
  /coal[\s-]+(power|fired|gasification)/i,
  /natural\s+gas/i,
  /hydroelectric/i,
  
  // Traditional fuel cells (non-microbial)
  /solid\s+oxide\s+fuel\s+cell/i,
  /SOFC(?!\s*[/-]\s*MFC)/i,
  /proton\s+exchange\s+membrane\s+fuel\s+cell/i,
  /PEMFC/i,
  /direct\s+methanol\s+fuel\s+cell/i,
  /DMFC/i,
  /alkaline\s+fuel\s+cell/i,
  /phosphoric\s+acid\s+fuel\s+cell/i,
  
  // Other unrelated topics
  /lithium[\s-]+ion\s+batter/i,
  /lead[\s-]+acid\s+batter/i,
  /supercapacitor/i,
  /grid\s+stability/i,
  /power\s+grid/i,
  /transmission\s+line/i,
  /smart\s+grid/i,
  /energy\s+storage\s+system/i,
  
  // Chemical processes (non-biological)
  /chemical\s+vapor\s+deposition/i,
  /electroplating/i,
  /corrosion\s+protection/i,
  /metal\s+refining/i,
  /petroleum\s+refining/i
]

// Keywords that MUST be present for MES papers
const INCLUSION_KEYWORDS = [
  'microbial',
  'bioelectrochemical',
  'bio-electrochemical',
  'MFC',
  'MEC',
  'MDC',
  'MES',
  'BES',
  'microbial fuel cell',
  'microbial electrolysis cell',
  'microbial desalination cell',
  'microbial electrosynthesis',
  'bioelectrochemical system',
  'exoelectrogen',
  'electroactive bacteria',
  'biofilm',
  'bioanode',
  'biocathode',
  'bioelectricity',
  'biohydrogen',
  'electromicrobiology',
  'electromethanogenesis',
  'bioelectrocatalysis'
]

async function cleanupNonMESPapers() {
  try {
    console.log('🧹 Starting cleanup of non-MES papers...')
    
    // Fetch all papers
    const allPapers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        abstract: true,
        keywords: true,
        systemType: true
      }
    })
    
    console.log(`📊 Total papers in database: ${allPapers.length}`)
    
    const papersToDelete: string[] = []
    const suspiciousPapers: Array<{id: string, title: string, reason: string}> = []
    
    for (const paper of allPapers) {
      const searchText = `${paper.title} ${paper.abstract || ''} ${paper.keywords || ''} ${paper.systemType || ''}`
      
      // Check if paper matches exclusion patterns
      let matchesExclusion = false
      let exclusionReason = ''
      
      for (const pattern of EXCLUSION_PATTERNS) {
        if (pattern.test(searchText)) {
          matchesExclusion = true
          exclusionReason = pattern.source
          break
        }
      }
      
      // Check if paper contains any inclusion keywords
      const hasInclusionKeyword = INCLUSION_KEYWORDS.some(keyword => 
        searchText.toLowerCase().includes(keyword.toLowerCase())
      )
      
      // Decision logic
      if (matchesExclusion && !hasInclusionKeyword) {
        // Definitely not MES - mark for deletion
        papersToDelete.push(paper.id)
        console.log(`❌ Marking for deletion: "${paper.title}"`)
        console.log(`   Reason: Matches exclusion pattern "${exclusionReason}" and has no MES keywords`)
      } else if (matchesExclusion && hasInclusionKeyword) {
        // Suspicious - matches exclusion but also has MES keywords
        suspiciousPapers.push({
          id: paper.id,
          title: paper.title,
          reason: `Matches exclusion pattern "${exclusionReason}" but contains MES keywords`
        })
      } else if (!hasInclusionKeyword) {
        // No MES keywords at all - also suspicious
        suspiciousPapers.push({
          id: paper.id,
          title: paper.title,
          reason: 'No MES-related keywords found'
        })
      }
    }
    
    console.log(`\n📊 Analysis complete:`)
    console.log(`   - Papers to delete: ${papersToDelete.length}`)
    console.log(`   - Suspicious papers: ${suspiciousPapers.length}`)
    console.log(`   - Papers to keep: ${allPapers.length - papersToDelete.length - suspiciousPapers.length}`)
    
    // Show some suspicious papers for manual review
    if (suspiciousPapers.length > 0) {
      console.log(`\n⚠️  Suspicious papers (manual review recommended):`)
      suspiciousPapers.slice(0, 10).forEach(paper => {
        console.log(`   - "${paper.title}"`)
        console.log(`     Reason: ${paper.reason}`)
      })
      if (suspiciousPapers.length > 10) {
        console.log(`   ... and ${suspiciousPapers.length - 10} more`)
      }
    }
    
    // Ask for confirmation before deleting
    if (papersToDelete.length > 0) {
      console.log(`\n⚠️  About to delete ${papersToDelete.length} papers.`)
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...')
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      console.log('\n🗑️  Deleting papers...')
      const deleteResult = await prisma.researchPaper.deleteMany({
        where: {
          id: {
            in: papersToDelete
          }
        }
      })
      
      console.log(`✅ Deleted ${deleteResult.count} non-MES papers`)
      
      // Also delete suspicious papers with no keywords
      const noKeywordPapers = suspiciousPapers
        .filter(p => p.reason === 'No MES-related keywords found')
        .map(p => p.id)
      
      if (noKeywordPapers.length > 0) {
        console.log(`\n🗑️  Also deleting ${noKeywordPapers.length} papers with no MES keywords...`)
        const deleteNoKeywordResult = await prisma.researchPaper.deleteMany({
          where: {
            id: {
              in: noKeywordPapers
            }
          }
        })
        console.log(`✅ Deleted ${deleteNoKeywordResult.count} papers with no MES keywords`)
      }
    } else {
      console.log('\n✅ No papers to delete - database is clean!')
    }
    
    // Final count
    const finalCount = await prisma.researchPaper.count()
    console.log(`\n📊 Final paper count: ${finalCount}`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupNonMESPapers()