import fs from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ExtractedPaper {
  filename: string
  filePath: string
  title?: string
  authors?: string[]
  abstract?: string
  doi?: string
  systemType?: string
  powerOutput?: number
  powerDensity?: number
  currentDensity?: number
  efficiency?: number
  voltage?: number
  temperature?: number
  ph?: number
  organisms?: string[]
  anodeMaterial?: string[]
  cathodeMaterial?: string[]
  extractedText?: string
}

// Map common system type variations
const normalizeSystemType = (type?: string): string | null => {
  if (!type) return null
  
  const upperType = type.toUpperCase()
  if (upperType.includes('MFC') || upperType.includes('FUEL CELL')) return 'MFC'
  if (upperType.includes('MEC') || upperType.includes('ELECTROLYSIS')) return 'MEC'
  if (upperType.includes('MDC') || upperType.includes('DESALINATION')) return 'MDC'
  if (upperType.includes('MES') || upperType.includes('ELECTROCHEMICAL SYSTEM')) return 'MES'
  
  return type
}

// Clean material lists
const cleanMaterialList = (materials?: string[]): string[] => {
  if (!materials) return []
  
  return materials
    .filter(m => m && m.length > 3 && m.length < 100) // Filter out too short or too long entries
    .map(m => m.trim())
    .filter(m => !m.includes('and') && !m.includes('or') && !m.includes('as'))
}

// Generate a reasonable title from filename if not extracted
const generateTitle = (filename: string, extractedTitle?: string): string => {
  if (extractedTitle && extractedTitle.length > 10 && extractedTitle.length < 300) {
    return extractedTitle
  }
  
  // Clean up filename to create a title
  let title = filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  
  // Handle common patterns in scientific paper filenames
  if (title.includes('s2.0')) {
    title = 'Microbial Fuel Cell Research Paper'
  }
  
  return title
}

// Create authors array from common patterns
const parseAuthors = (paperData: ExtractedPaper): string => {
  if (paperData.authors && paperData.authors.length > 0) {
    return JSON.stringify(paperData.authors)
  }
  
  // Try to extract from the beginning of extracted text
  if (paperData.extractedText) {
    const authorPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:,\s*([A-Z][a-z]+\s+[A-Z][a-z]+))*/
    const match = paperData.extractedText.match(authorPattern)
    if (match) {
      return JSON.stringify([match[0]])
    }
  }
  
  return JSON.stringify(['Unknown Authors'])
}

async function importPapersToDatabase(jsonFilePath: string, userId: string) {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf-8')
    const papers: ExtractedPaper[] = JSON.parse(data)
    
    console.log(`Found ${papers.length} papers to import`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const paper of papers) {
      try {
        // Check if paper with same filename already exists
        const existingPaper = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { externalUrl: paper.filename },
              { doi: paper.doi || undefined }
            ]
          }
        })
        
        if (existingPaper) {
          console.log(`Skipping duplicate: ${paper.filename}`)
          skipped++
          continue
        }
        
        // Prepare data for import
        const title = generateTitle(paper.filename, paper.title)
        const authors = parseAuthors(paper)
        const systemType = normalizeSystemType(paper.systemType)
        const anodeMaterials = cleanMaterialList(paper.anodeMaterial)
        const cathodeMaterials = cleanMaterialList(paper.cathodeMaterial)
        
        // Create abstract from extracted text if not available
        const abstract = paper.abstract || 
          (paper.extractedText ? paper.extractedText.substring(0, 500) + '...' : null)
        
        // Keywords from various sources
        const keywords: string[] = []
        if (systemType) keywords.push(systemType)
        if (paper.organisms) keywords.push(...paper.organisms.slice(0, 3))
        keywords.push('Microbial Fuel Cell', 'Bioelectrochemical')
        
        const newPaper = await prisma.researchPaper.create({
          data: {
            title,
            authors,
            abstract,
            doi: paper.doi || null,
            externalUrl: paper.filename, // Store filename as external URL
            keywords: JSON.stringify([...new Set(keywords)]),
            systemType,
            powerOutput: paper.powerOutput || paper.powerDensity || null,
            efficiency: paper.efficiency || null,
            organismTypes: paper.organisms ? JSON.stringify(paper.organisms) : null,
            anodeMaterials: anodeMaterials.length > 0 ? JSON.stringify(anodeMaterials) : null,
            cathodeMaterials: cathodeMaterials.length > 0 ? JSON.stringify(cathodeMaterials) : null,
            source: 'local_pdf',
            uploadedBy: userId,
            isPublic: true,
            publicationDate: null, // Could be extracted with better parsing
            journal: null, // Could be extracted from DOI
          }
        })
        
        console.log(`✓ Imported: ${title}`)
        
        // Log performance data if found
        if (paper.powerOutput || paper.efficiency || paper.voltage) {
          console.log(`  Performance data:`)
          if (paper.powerOutput) console.log(`    Power: ${paper.powerOutput} mW/m²`)
          if (paper.efficiency) console.log(`    Efficiency: ${paper.efficiency}%`)
          if (paper.voltage) console.log(`    Voltage: ${paper.voltage} mV`)
          if (paper.temperature) console.log(`    Temperature: ${paper.temperature}°C`)
          if (paper.ph) console.log(`    pH: ${paper.ph}`)
        }
        
        imported++
      } catch (error) {
        console.error(`✗ Error importing ${paper.filename}:`, error.message)
        errors++
      }
    }
    
    console.log(`\nImport Summary:`)
    console.log(`  Imported: ${imported}`)
    console.log(`  Skipped (duplicates): ${skipped}`)
    console.log(`  Errors: ${errors}`)
    console.log(`  Total: ${papers.length}`)
    
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const jsonFilePath = args[0] || '/Users/samfrons/Desktop/Messai/literature/extracted-paper-data.json'
  const userId = args[1]
  
  if (!userId) {
    console.error('Please provide a user ID as the second argument')
    console.error('Usage: npx tsx import-papers-to-db.ts <json-file-path> <user-id>')
    
    // List available users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })
    
    if (users.length > 0) {
      console.log('\nAvailable users:')
      users.forEach(user => {
        console.log(`  ${user.id} - ${user.name || user.email}`)
      })
    }
    
    process.exit(1)
  }
  
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    console.error(`User with ID ${userId} not found`)
    process.exit(1)
  }
  
  console.log(`Importing papers for user: ${user.name || user.email}`)
  await importPapersToDatabase(jsonFilePath, userId)
  
  await prisma.$disconnect()
}

// Run if called directly
if (require.main === module) {
  main()
}

export { importPapersToDatabase }