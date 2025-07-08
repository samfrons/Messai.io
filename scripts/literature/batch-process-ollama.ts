#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

class BatchOllamaProcessor {
  private readonly ollamaUrl = 'http://localhost:11434'
  
  async checkOllama(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`)
      console.log('✅ Available models:', response.data.models?.map((m: any) => m.name).join(', ') || 'none')
      return true
    } catch (error) {
      console.error('❌ Ollama not accessible')
      return false
    }
  }

  async processWithOllama(title: string, abstract: string, model: string = 'deepseek-r1'): Promise<any> {
    try {
      const prompt = `You are an expert in bioelectrochemical systems (BES), microbial fuel cells (MFC), and related technologies. 

Extract ALL quantitative performance data from this research paper:

Title: ${title}

Abstract: ${abstract}

Extract and return as JSON:
{
  "power_density": {"value": number, "unit": "mW/m²"},
  "current_density": {"value": number, "unit": "mA/cm²"},
  "voltage": {"value": number, "unit": "V"},
  "coulombic_efficiency": number,
  "cod_removal_efficiency": number,
  "bod_removal_efficiency": number,
  "hydrogen_production": {"value": number, "unit": "mL/L/d"},
  "conductivity": {"value": number, "unit": "S/cm"},
  "surface_area": {"value": number, "unit": "m²/g"},
  "anode_materials": ["material1", "material2"],
  "cathode_materials": ["material1", "material2"],
  "microorganisms": ["organism1", "organism2"],
  "system_type": "MFC|MEC|MDC|MES|BES",
  "substrate": "substrate_type",
  "ph": number,
  "temperature": {"value": number, "unit": "°C"},
  "key_findings": ["finding1", "finding2"],
  "has_performance_data": true/false
}

If a metric is not mentioned, use null. Be precise and only extract values explicitly stated.`

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json'
      }, { timeout: 30000 })

      return JSON.parse(response.data.response)
    } catch (error) {
      console.error('Ollama processing error:', error)
      return null
    }
  }

  async processAllPapers() {
    console.log('🚀 Starting batch processing with Ollama...')
    
    // Get all unprocessed papers
    const unprocessedPapers = await prisma.researchPaper.findMany({
      where: {
        aiProcessingDate: null,
        abstract: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, abstract: true }
    })

    console.log(`📄 Found ${unprocessedPapers.length} papers to process`)

    let processed = 0
    let withData = 0
    let errors = 0

    for (let i = 0; i < unprocessedPapers.length; i++) {
      const paper = unprocessedPapers[i]
      const progress = `[${i + 1}/${unprocessedPapers.length}]`
      
      console.log(`\n${progress} Processing: ${paper.title.substring(0, 60)}...`)
      
      try {
        const result = await this.processWithOllama(paper.title, paper.abstract || '')
        
        if (result) {
          // Prepare update data
          const updateData: any = {
            aiProcessingDate: new Date(),
            aiModelVersion: 'ollama-deepseek-r1',
            aiDataExtraction: JSON.stringify(result),
            aiConfidence: result.has_performance_data ? 0.8 : 0.6
          }

          // Map extracted values to database fields
          if (result.power_density?.value) {
            updateData.powerOutput = result.power_density.value
          }
          if (result.coulombic_efficiency) {
            updateData.efficiency = result.coulombic_efficiency
          }
          if (result.anode_materials?.length > 0) {
            updateData.anodeMaterials = JSON.stringify(result.anode_materials)
          }
          if (result.cathode_materials?.length > 0) {
            updateData.cathodeMaterials = JSON.stringify(result.cathode_materials)
          }
          if (result.microorganisms?.length > 0) {
            updateData.organismTypes = JSON.stringify(result.microorganisms)
          }
          if (result.system_type) {
            updateData.systemType = result.system_type
          }

          // Add performance data tag if found
          if (result.has_performance_data) {
            const existingKeywords = JSON.parse(paper.title ? '[]' : '[]') // Get existing or empty
            const newKeywords = [...existingKeywords, 'HAS_PERFORMANCE_DATA']
            updateData.keywords = JSON.stringify([...new Set(newKeywords)])
          }

          await prisma.researchPaper.update({
            where: { id: paper.id },
            data: updateData
          })

          processed++
          if (result.has_performance_data) {
            withData++
            console.log(`  ✅ Extracted: ${Object.keys(result).filter(k => result[k] !== null && k !== 'has_performance_data').join(', ')}`)
          } else {
            console.log(`  ✅ Processed (no performance data)`)
          }
        } else {
          errors++
          console.log(`  ❌ Failed to process`)
        }
        
        // Rate limiting to not overload Ollama
        if (i < unprocessedPapers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
        // Progress update every 10 papers
        if ((i + 1) % 10 === 0) {
          console.log(`\n📊 Progress: ${i + 1}/${unprocessedPapers.length} (${((i + 1)/unprocessedPapers.length*100).toFixed(1)}%)`)
          console.log(`   Processed: ${processed}, With data: ${withData}, Errors: ${errors}`)
        }
        
      } catch (error) {
        errors++
        console.error(`  ❌ Error:`, error)
      }
    }

    // Final summary
    console.log('\n✅ Batch processing complete!')
    console.log(`\n📊 Final Summary:`)
    console.log(`  Total papers processed: ${processed}`)
    console.log(`  Papers with performance data: ${withData}`)
    console.log(`  Success rate: ${processed > 0 ? ((processed/(processed + errors))*100).toFixed(1) : 0}%`)
    console.log(`  Data extraction rate: ${processed > 0 ? ((withData/processed)*100).toFixed(1) : 0}%`)
    
    // Database statistics
    const totalPapers = await prisma.researchPaper.count()
    const processedTotal = await prisma.researchPaper.count({
      where: { aiProcessingDate: { not: null } }
    })
    const withPerformanceData = await prisma.researchPaper.count({
      where: { 
        OR: [
          { powerOutput: { not: null } },
          { efficiency: { not: null } },
          { keywords: { contains: 'HAS_PERFORMANCE_DATA' } }
        ]
      }
    })

    console.log(`\n📚 Database Status:`)
    console.log(`  Total papers: ${totalPapers}`)
    console.log(`  AI processed: ${processedTotal} (${((processedTotal/totalPapers)*100).toFixed(1)}%)`)
    console.log(`  With performance data: ${withPerformanceData} (${((withPerformanceData/totalPapers)*100).toFixed(1)}%)`)
  }
}

async function main() {
  const processor = new BatchOllamaProcessor()
  
  console.log('🔍 Checking Ollama status...')
  const isRunning = await processor.checkOllama()
  
  if (!isRunning) {
    console.error('❌ Ollama is not running. Please start it with: ollama serve')
    process.exit(1)
  }
  
  try {
    await processor.processAllPapers()
  } catch (error) {
    console.error('Error during batch processing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()