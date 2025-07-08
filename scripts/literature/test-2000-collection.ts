import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Test search for papers from 2000-2014
async function testEarlyPaperCollection() {
  console.log('🔬 Testing collection of papers from 2000-2014')
  
  const searchQuery = '"microbial fuel cell" AND "electricity generation"'
  const baseUrl = 'https://api.crossref.org/works'
  
  // Search for papers from 2000-2014
  const params = new URLSearchParams({
    query: searchQuery,
    filter: 'from-pub-date:2000,until-pub-date:2014',
    rows: '20',
    select: 'DOI,title,author,published-print,publisher,subject,abstract,URL,container-title'
  })
  
  try {
    console.log('\n📚 Searching CrossRef for early MFC papers (2000-2014)...')
    console.log(`Query: ${searchQuery}`)
    console.log(`URL: ${baseUrl}?${params}`)
    
    const response = await axios.get(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'MESSAi Literature System Test'
      }
    })
    
    const items = response.data.message.items || []
    console.log(`\n✅ Found ${items.length} papers from CrossRef`)
    
    // Process each paper
    let newPapers = 0
    let duplicates = 0
    
    for (const item of items) {
      const year = item.published?.['date-parts']?.[0]?.[0]
      const yearPrint = item['published-print']?.['date-parts']?.[0]?.[0]
      const actualYear = year || yearPrint
      const title = item.title?.[0] || 'Unknown Title'
      const doi = item.DOI
      
      console.log(`\n📄 Paper: ${title.substring(0, 60)}...`)
      console.log(`   Year: ${actualYear || 'Unknown'} (online: ${year}, print: ${yearPrint})`)
      console.log(`   DOI: ${doi || 'None'}`)
      
      // Skip if year is outside our target range
      if (actualYear && (actualYear < 2000 || actualYear > 2014)) {
        console.log(`   Status: Skipped - Year ${actualYear} outside target range`)
        continue
      }
      
      // Check if already in database
      if (doi) {
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: doi },
              { title: title }
            ]
          }
        })
        
        if (existing) {
          console.log(`   Status: Already in database`)
          duplicates++
        } else {
          console.log(`   Status: NEW PAPER - Could be added!`)
          newPapers++
        }
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`Total found: ${items.length}`)
    console.log(`Already in database: ${duplicates}`)
    console.log(`Could be added: ${newPapers}`)
    
    // Check current database stats for 2000-2014
    const oldPapers = await prisma.researchPaper.count({
      where: {
        publicationDate: {
          gte: new Date('2000-01-01'),
          lt: new Date('2015-01-01')
        }
      }
    })
    
    console.log(`\n📈 Current database has ${oldPapers} papers from 2000-2014`)
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEarlyPaperCollection()