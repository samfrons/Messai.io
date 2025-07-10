#!/usr/bin/env npx tsx

import prisma from '../../lib/db'

interface CleanupStats {
  totalPapers: number
  malformedAnodeMaterials: number
  malformedCathodeMaterials: number
  malformedOrganismTypes: number
  malformedKeywords: number
  fixedPapers: number
  errors: number
}

function cleanMaterialArray(jsonString: string | null): string | null {
  if (!jsonString) return null
  
  try {
    const parsed = JSON.parse(jsonString)
    if (!Array.isArray(parsed)) return jsonString
    
    // Filter out common extraction artifacts
    const cleaned = parsed.filter(item => {
      if (!item || typeof item !== 'string') return false
      
      const lower = item.toLowerCase().trim()
      
      // Remove basic artifacts
      if (lower.length <= 2) return false
      if (['null', 'undefined', 'not specified', 'n/a', 'na'].includes(lower)) return false
      if (lower.includes('null') || lower.includes('undefined')) return false
      if (lower.includes('&#')) return false // HTML entities
      
      // Remove common pattern matching artifacts
      const artifacts = [
        'the', 'and', 'with', 'using', 'while the', 'in the', 'of the', 'for the', 'to the',
        'was', 'were', 'is', 'are', 'at', 'on', 'in', 'of', 'by', 'from', 'as', 'this', 'that',
        'represented by ohmic loss', 'and cathode', 'culture', 'considering the', 'this study focused on'
      ]
      
      if (artifacts.some(artifact => lower.includes(artifact))) return false
      
      // Remove incomplete sentences (check for common sentence patterns)
      if (lower.includes(' were ') || lower.includes(' was ') || lower.includes(' focused on ')) return false
      if (lower.includes(' used as ') || lower.includes(' study ') || lower.includes(' optimizing ')) return false
      
      // Must be at least 3 characters for valid materials
      if (lower.length < 3) return false
      
      return true
    })
    
    return cleaned.length > 0 ? JSON.stringify(cleaned) : null
  } catch {
    return jsonString
  }
}

function cleanOrganismArray(jsonString: string | null): string | null {
  if (!jsonString) return null
  
  try {
    const parsed = JSON.parse(jsonString)
    if (!Array.isArray(parsed)) return jsonString
    
    const cleaned = parsed.filter(item => {
      if (!item || typeof item !== 'string') return false
      
      const lower = item.toLowerCase().trim()
      
      // Basic filters
      if (lower.length <= 2) return false
      if (['null', 'undefined', 'not specified', 'n/a', 'na'].includes(lower)) return false
      if (lower.includes('&#')) return false // HTML entities
      
      // Organism-specific filters
      const artifacts = [
        'the', 'and', 'with', 'using', 'solution', 'medium', 'buffer', 'culture',
        'represented by', 'this study', 'focused on', 'optimizing'
      ]
      
      if (artifacts.some(artifact => lower.includes(artifact))) return false
      
      // Must be at least 4 characters for organism names (except common abbreviations)
      if (lower.length < 4 && !['e.', 'sp.'].some(abbrev => lower.includes(abbrev))) return false
      
      return true
    })
    
    return cleaned.length > 0 ? JSON.stringify(cleaned) : null
  } catch {
    return jsonString
  }
}

async function cleanupMalformedData(): Promise<CleanupStats> {
  console.log('🧹 Starting database cleanup for malformed JSON data...\n')
  
  const stats: CleanupStats = {
    totalPapers: 0,
    malformedAnodeMaterials: 0,
    malformedCathodeMaterials: 0,
    malformedOrganismTypes: 0,
    malformedKeywords: 0,
    fixedPapers: 0,
    errors: 0
  }
  
  try {
    // Get all papers (we'll filter in code for simplicity)
    const papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true
      }
    })
    
    stats.totalPapers = papers.length
    console.log(`📊 Found ${papers.length} papers with material/organism data`)
    
    for (const paper of papers) {
      let needsUpdate = false
      const updates: any = {}
      
      // Check and clean anode materials
      if (paper.anodeMaterials) {
        const cleaned = cleanMaterialArray(paper.anodeMaterials)
        if (cleaned !== paper.anodeMaterials) {
          updates.anodeMaterials = cleaned
          stats.malformedAnodeMaterials++
          needsUpdate = true
        }
      }
      
      // Check and clean cathode materials
      if (paper.cathodeMaterials) {
        const cleaned = cleanMaterialArray(paper.cathodeMaterials)
        if (cleaned !== paper.cathodeMaterials) {
          updates.cathodeMaterials = cleaned
          stats.malformedCathodeMaterials++
          needsUpdate = true
        }
      }
      
      // Check and clean organism types
      if (paper.organismTypes) {
        const cleaned = cleanOrganismArray(paper.organismTypes)
        if (cleaned !== paper.organismTypes) {
          updates.organismTypes = cleaned
          stats.malformedOrganismTypes++
          needsUpdate = true
        }
      }
      
      // Check and clean keywords (keywords is required, so provide empty array if no valid keywords)
      if (paper.keywords) {
        const cleaned = cleanMaterialArray(paper.keywords) // Use same logic as materials
        if (cleaned !== paper.keywords) {
          updates.keywords = cleaned || '[]' // Provide empty array if all keywords were invalid
          stats.malformedKeywords++
          needsUpdate = true
        }
      }
      
      // Update paper if needed
      if (needsUpdate) {
        try {
          await prisma.researchPaper.update({
            where: { id: paper.id },
            data: updates
          })
          
          stats.fixedPapers++
          console.log(`✅ Fixed: "${paper.title.substring(0, 50)}..."`)
          
          // Show what was changed
          if (updates.anodeMaterials !== undefined) {
            console.log(`   Anode: ${paper.anodeMaterials} → ${updates.anodeMaterials}`)
          }
          if (updates.cathodeMaterials !== undefined) {
            console.log(`   Cathode: ${paper.cathodeMaterials} → ${updates.cathodeMaterials}`)
          }
          if (updates.organismTypes !== undefined) {
            console.log(`   Organisms: ${paper.organismTypes} → ${updates.organismTypes}`)
          }
          
        } catch (error) {
          console.error(`❌ Error updating paper ${paper.id}:`, error)
          stats.errors++
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    stats.errors++
  }
  
  return stats
}

async function main() {
  try {
    const stats = await cleanupMalformedData()
    
    console.log('\n📊 Cleanup Complete!')
    console.log('='.repeat(50))
    console.log(`Total papers processed: ${stats.totalPapers}`)
    console.log(`Papers fixed: ${stats.fixedPapers}`)
    console.log(`Malformed anode materials: ${stats.malformedAnodeMaterials}`)
    console.log(`Malformed cathode materials: ${stats.malformedCathodeMaterials}`)
    console.log(`Malformed organism types: ${stats.malformedOrganismTypes}`)
    console.log(`Malformed keywords: ${stats.malformedKeywords}`)
    console.log(`Errors: ${stats.errors}`)
    
    if (stats.fixedPapers > 0) {
      console.log('\n✅ Database cleanup successful!')
      console.log('🔄 Frontend should now show cleaner data with fewer nulls and artifacts.')
    } else {
      console.log('\n✨ Database is already clean!')
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}