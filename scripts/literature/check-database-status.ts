import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkDatabaseStatus() {
  try {
    // Get total paper count
    const totalPapers = await prisma.researchPaper.count()
    console.log(`\n📊 Database Status:`)
    console.log(`Total papers: ${totalPapers}`)
    
    // Get papers by publication year
    const papers = await prisma.researchPaper.findMany({
      select: {
        publicationDate: true,
        title: true
      },
      orderBy: {
        publicationDate: 'asc'
      }
    })
    
    // Group by year
    const yearCounts = new Map<string, number>()
    papers.forEach(paper => {
      if (paper.publicationDate) {
        const year = new Date(paper.publicationDate).getFullYear().toString()
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
      }
    })
    
    // Show distribution by year
    console.log('\n📅 Papers by Year:')
    const sortedYears = Array.from(yearCounts.keys()).sort()
    sortedYears.forEach(year => {
      console.log(`${year}: ${yearCounts.get(year)} papers`)
    })
    
    // Check oldest and newest papers
    if (papers.length > 0) {
      const oldestPaper = papers[0]
      const newestPaper = papers[papers.length - 1]
      
      console.log('\n🕰️ Date Range:')
      console.log(`Oldest paper: ${oldestPaper.publicationDate ? new Date(oldestPaper.publicationDate).toISOString().split('T')[0] : 'N/A'}`)
      console.log(`Title: ${oldestPaper.title}`)
      console.log(`\nNewest paper: ${newestPaper.publicationDate ? new Date(newestPaper.publicationDate).toISOString().split('T')[0] : 'N/A'}`)
      console.log(`Title: ${newestPaper.title}`)
    }
    
    // Check for papers before 2015
    const oldPapersCount = await prisma.researchPaper.count({
      where: {
        publicationDate: {
          lt: new Date('2015-01-01')
        }
      }
    })
    
    console.log(`\n⚠️ Papers before 2015: ${oldPapersCount}`)
    
    if (oldPapersCount > 0) {
      const oldPapers = await prisma.researchPaper.findMany({
        where: {
          publicationDate: {
            lt: new Date('2015-01-01')
          }
        },
        select: {
          title: true,
          publicationDate: true
        },
        orderBy: {
          publicationDate: 'asc'
        },
        take: 5
      })
      
      console.log('\nOldest papers (pre-2015):')
      oldPapers.forEach(paper => {
        const date = paper.publicationDate ? new Date(paper.publicationDate).toISOString().split('T')[0] : 'N/A'
        console.log(`- ${date}: ${paper.title}`)
      })
    }
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseStatus()