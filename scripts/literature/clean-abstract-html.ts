#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Function to clean HTML/XML tags from text
function cleanHtmlTags(text: string | null): string | null {
  if (!text) return null
  
  // Remove common scientific journal XML/HTML tags
  let cleaned = text
    .replace(/<jats:[^>]+>/g, '') // Remove JATS tags like <jats:p>
    .replace(/<\/jats:[^>]+>/g, '') // Remove closing JATS tags
    .replace(/<[^>]+>/g, '') // Remove any other HTML/XML tags
    .replace(/&lt;/g, '<') // Decode HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  return cleaned
}

async function main() {
  console.log('🧹 Cleaning HTML/XML tags from abstracts')
  console.log('=======================================')
  
  // Get papers with abstracts that might contain HTML
  const papersWithHtml = await prisma.researchPaper.findMany({
    where: {
      abstract: {
        contains: '<'
      }
    },
    select: {
      id: true,
      title: true,
      abstract: true
    }
  })
  
  console.log(`\n📊 Found ${papersWithHtml.length} papers with HTML/XML in abstracts`)
  
  let cleaned = 0
  let errors = 0
  
  // Show a sample before cleaning
  if (papersWithHtml.length > 0) {
    console.log('\n📄 Sample abstract BEFORE cleaning:')
    console.log(`Title: ${papersWithHtml[0].title.substring(0, 60)}...`)
    console.log(`Abstract: ${papersWithHtml[0].abstract?.substring(0, 200)}...`)
  }
  
  // Clean each paper's abstract
  for (const paper of papersWithHtml) {
    try {
      const cleanedAbstract = cleanHtmlTags(paper.abstract)
      
      if (cleanedAbstract && cleanedAbstract !== paper.abstract) {
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: { abstract: cleanedAbstract }
        })
        cleaned++
        
        if (cleaned % 50 === 0) {
          console.log(`   Progress: ${cleaned}/${papersWithHtml.length} abstracts cleaned`)
        }
      }
    } catch (error: any) {
      console.error(`   Error cleaning paper ${paper.id}: ${error.message}`)
      errors++
    }
  }
  
  // Also check for papers with encoded HTML entities
  console.log('\n🔍 Checking for encoded HTML entities...')
  
  const papersWithEntities = await prisma.researchPaper.findMany({
    where: {
      OR: [
        { abstract: { contains: '&lt;' } },
        { abstract: { contains: '&gt;' } },
        { abstract: { contains: '&amp;' } },
        { abstract: { contains: '&quot;' } },
        { abstract: { contains: '&#' } }
      ]
    },
    select: {
      id: true,
      abstract: true
    }
  })
  
  console.log(`Found ${papersWithEntities.length} papers with HTML entities`)
  
  for (const paper of papersWithEntities) {
    try {
      const cleanedAbstract = cleanHtmlTags(paper.abstract)
      
      if (cleanedAbstract && cleanedAbstract !== paper.abstract) {
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: { abstract: cleanedAbstract }
        })
        cleaned++
      }
    } catch (error: any) {
      errors++
    }
  }
  
  // Show a sample after cleaning
  if (papersWithHtml.length > 0) {
    const cleanedPaper = await prisma.researchPaper.findUnique({
      where: { id: papersWithHtml[0].id },
      select: { title: true, abstract: true }
    })
    
    console.log('\n📄 Sample abstract AFTER cleaning:')
    console.log(`Title: ${cleanedPaper?.title.substring(0, 60)}...`)
    console.log(`Abstract: ${cleanedPaper?.abstract?.substring(0, 200)}...`)
  }
  
  // Final statistics
  const finalStats = await prisma.researchPaper.aggregate({
    where: {
      abstract: { contains: '<' }
    },
    _count: true
  })
  
  console.log('\n=======================================')
  console.log('✅ Cleaning Complete:')
  console.log(`   Abstracts cleaned: ${cleaned}`)
  console.log(`   Errors: ${errors}`)
  console.log(`   Remaining with HTML: ${finalStats._count}`)
  
  await prisma.$disconnect()
  console.log('\n✅ Abstract cleaning complete!')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }