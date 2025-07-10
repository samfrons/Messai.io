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

class OllamaProcessor {
  private readonly ollamaUrl = 'http://localhost:11434'
  
  async checkOllama(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`)
      console.log('Available models:', response.data.models?.map((m: any) => m.name) || [])
      return true
    } catch (error) {
      console.error('Ollama not running or not accessible')
      return false
    }
  }

  async processWithOllama(paperText: string, model: string = 'deepseek-r1'): Promise<string | null> {
    try {
      const prompt = `You are an expert in bioelectrochemical systems. Extract key performance data from this research paper abstract. 

Abstract: ${paperText}

Extract the following if present:
1. Power density (in mW/m² or W/m²)
2. Current density (in mA/cm² or A/m²)
3. Voltage (in V or mV)
4. Coulombic efficiency (%)
5. COD/BOD removal efficiency (%)
6. Hydrogen production rate
7. Anode materials used
8. Cathode materials used
9. Key microorganisms mentioned

Format as JSON. If a value is not found, use null.`

      console.log('🤖 Processing with Ollama...')
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json'
      })

      return response.data.response
    } catch (error) {
      console.error('Ollama processing error:', error)
      return null
    }
  }

  async processPapers(limit: number = 10) {
    // Get unprocessed papers
    const papers = await prisma.researchPaper.findMany({
      where: {
        aiProcessingDate: null,
        abstract: { not: null }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${papers.length} papers to process`)

    let processed = 0
    let withData = 0

    for (const paper of papers) {
      console.log(`\n📄 Processing: ${paper.title.substring(0, 60)}...`)
      
      const result = await this.processWithOllama(paper.abstract || '')
      
      if (result) {
        try {
          const extractedData = JSON.parse(result)
          
          // Update paper with extracted data
          const updateData: any = {
            aiProcessingDate: new Date(),
            aiModelVersion: 'ollama-deepseek-r1',
            aiDataExtraction: result
          }

          // Map extracted values to database fields
          if (extractedData.power_density) {
            updateData.powerOutput = parseFloat(extractedData.power_density)
          }
          if (extractedData.coulombic_efficiency) {
            updateData.efficiency = parseFloat(extractedData.coulombic_efficiency)
          }
          if (extractedData.anode_materials) {
            updateData.anodeMaterials = JSON.stringify(extractedData.anode_materials)
          }
          if (extractedData.cathode_materials) {
            updateData.cathodeMaterials = JSON.stringify(extractedData.cathode_materials)
          }

          await prisma.researchPaper.update({
            where: { id: paper.id },
            data: updateData
          })

          processed++
          if (extractedData.power_density || extractedData.current_density) {
            withData++
          }
          
          console.log('✅ Processed successfully')
        } catch (error) {
          console.error('❌ Failed to parse result:', error)
        }
      }
      
      // Rate limiting to not overload Ollama
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`\n📊 Summary:`)
    console.log(`  Processed: ${processed}`)
    console.log(`  With performance data: ${withData}`)
  }
}

async function main() {
  const processor = new OllamaProcessor()
  
  console.log('🔍 Checking Ollama status...')
  const isRunning = await processor.checkOllama()
  
  if (!isRunning) {
    console.error('❌ Ollama is not running. Please start it with: ollama serve')
    process.exit(1)
  }

  console.log('✅ Ollama is running')
  
  // Process papers
  await processor.processPapers(5) // Start with 5 papers
  
  await prisma.$disconnect()
}

main().catch(console.error)