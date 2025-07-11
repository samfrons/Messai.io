#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { DataValidator, UnitConverter, DataQualityScorer, SUCCESSFUL_EXTRACTION_EXAMPLES, type ExtractedData } from '../../lib/research/data-validation'

const prisma = new PrismaClient()

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

class EnhancedOllamaProcessor {
  private readonly ollamaUrl = 'http://localhost:11434'
  private readonly models = ['deepseek-r1', 'qwen2.5-coder']
  private readonly maxRetries = 2
  
  async checkOllama(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`)
      const availableModels = response.data.models?.map((m: any) => m.name) || []
      console.log('✅ Available models:', availableModels.join(', '))
      
      // Check if our preferred models are available
      const usableModels = this.models.filter(model => availableModels.includes(model))
      if (usableModels.length === 0) {
        console.warn('⚠️ None of preferred models available, using first available model')
        if (availableModels.length > 0) {
          this.models.splice(0, this.models.length, ...availableModels.slice(0, 2))
        }
      }
      
      return true
    } catch (error) {
      console.error('❌ Ollama not accessible')
      return false
    }
  }

  private createEnhancedPrompt(title: string, abstract: string): string {
    const examples = SUCCESSFUL_EXTRACTION_EXAMPLES.map(ex => 
      `Example ${SUCCESSFUL_EXTRACTION_EXAMPLES.indexOf(ex) + 1}:
Title: ${ex.title}
Abstract: ${ex.abstract}
Output: ${JSON.stringify(ex.expected_output, null, 2)}`
    ).join('\n\n')

    return `You are an expert researcher specializing in bioelectrochemical systems (BES), microbial fuel cells (MFC), microbial electrolysis cells (MEC), and related electrochemical technologies.

TASK: Extract quantitative performance data from the research paper below and return it as valid JSON.

EXAMPLES OF SUCCESSFUL EXTRACTIONS:
${examples}

CURRENT PAPER TO ANALYZE:
Title: ${title}

Abstract: ${abstract}

EXTRACTION REQUIREMENTS:
1. Extract ONLY explicitly stated numerical values with their units
2. If a value is not mentioned, use null (not 0 or empty string)
3. Convert units to standard formats where possible:
   - Power density: mW/m²
   - Current density: mA/cm²
   - Temperature: °C
   - Efficiency: percentage (0-100)
4. Materials should be specific (e.g., "graphene oxide" not just "graphene")
5. Microorganisms should include genus and species when available

REQUIRED JSON STRUCTURE:
{
  "power_density": {"value": number, "unit": "mW/m²"} or null,
  "current_density": {"value": number, "unit": "mA/cm²"} or null,
  "voltage": {"value": number, "unit": "V"} or null,
  "coulombic_efficiency": number (0-100) or null,
  "cod_removal_efficiency": number (0-100) or null,
  "bod_removal_efficiency": number (0-100) or null,
  "hydrogen_production": {"value": number, "unit": "mL/L/d"} or null,
  "conductivity": {"value": number, "unit": "S/cm"} or null,
  "surface_area": {"value": number, "unit": "m²/g"} or null,
  "anode_materials": [{"name": "material", "type": "anode"}] or null,
  "cathode_materials": [{"name": "material", "type": "cathode"}] or null,
  "microorganisms": [{"name": "organism", "type": "bacteria|archaea|mixed_culture|yeast|algae"}] or null,
  "system_type": "MFC|MEC|MDC|MES|BES" or null,
  "substrate": "substrate_type" or null,
  "ph": number (0-14) or null,
  "temperature": {"value": number, "unit": "°C"} or null,
  "key_findings": ["finding1", "finding2"] or null,
  "has_performance_data": true/false
}

CRITICAL: Return only valid JSON. No additional text or explanations.`
  }

  async processWithOllama(title: string, abstract: string, modelIndex: number = 0): Promise<ExtractedData | null> {
    if (modelIndex >= this.models.length) {
      console.log('  ❌ All models failed')
      return null
    }
    
    const model = this.models[modelIndex]
    
    try {
      const prompt = this.createEnhancedPrompt(title, abstract)
      
      console.log(`  🤖 Trying ${model}...`)
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1, // Lower temperature for more consistent results
          top_p: 0.9,
          num_predict: 1000
        }
      }, { 
        timeout: 60000 // Increased timeout
      })

      // Parse and validate the response
      let rawData: any
      try {
        rawData = JSON.parse(response.data.response)
      } catch (parseError) {
        console.log(`  ⚠️ JSON parse error with ${model}, trying next model...`)
        return this.processWithOllama(title, abstract, modelIndex + 1)
      }

      // Validate with our schema
      const validation = DataValidator.validateExtractedData(rawData)
      
      if (!validation.isValid) {
        console.log(`  ⚠️ Validation failed with ${model}: ${validation.errors.join(', ')}`)
        return this.processWithOllama(title, abstract, modelIndex + 1)
      }

      // Standardize units
      const standardizedData = DataValidator.standardizeExtractedData(validation.data!)
      
      // Calculate quality score
      const qualityScore = DataQualityScorer.scoreExtractedData(standardizedData)
      
      console.log(`  ✅ Success with ${model} (quality: ${qualityScore}%)`)
      
      return {
        ...standardizedData,
        extraction_confidence: qualityScore / 100
      }

    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        console.log(`  ⏱️ Timeout with ${model}, trying next model...`)
      } else {
        console.log(`  ❌ Error with ${model}: ${error.message}`)
      }
      
      return this.processWithOllama(title, abstract, modelIndex + 1)
    }
  }

  async processAllPapers(batchSize: number = 10) {
    console.log('🚀 Starting enhanced batch processing with Ollama...')
    
    // Get unprocessed papers
    const unprocessedPapers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { aiProcessingDate: null },
          { aiModelVersion: { not: 'ollama-enhanced-v2' } }
        ],
        abstract: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, abstract: true, aiProcessingDate: true }
    })

    console.log(`📄 Found ${unprocessedPapers.length} papers to process`)

    let processed = 0
    let withData = 0
    let errors = 0
    let validationFailures = 0

    // Process in batches to avoid overwhelming Ollama
    for (let i = 0; i < unprocessedPapers.length; i += batchSize) {
      const batch = unprocessedPapers.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(unprocessedPapers.length/batchSize)}`)
      
      for (const paper of batch) {
        const progress = `[${i + batch.indexOf(paper) + 1}/${unprocessedPapers.length}]`
        console.log(`\n${progress} Processing: ${paper.title.substring(0, 60)}...`)
        
        try {
          const result = await this.processWithOllama(paper.title, paper.abstract || '')
          
          if (result) {
            // Prepare update data
            const updateData: any = {
              aiProcessingDate: new Date(),
              aiModelVersion: 'ollama-enhanced-v2',
              aiDataExtraction: JSON.stringify(result),
              aiConfidence: result.extraction_confidence
            }

            // Map standardized values to database fields
            if (result.power_density?.value) {
              updateData.powerOutput = result.power_density.value
            }
            if (result.coulombic_efficiency) {
              updateData.efficiency = result.coulombic_efficiency
            }
            if (result.anode_materials?.length) {
              updateData.anodeMaterials = JSON.stringify(result.anode_materials.map(m => m.name))
            }
            if (result.cathode_materials?.length) {
              updateData.cathodeMaterials = JSON.stringify(result.cathode_materials.map(m => m.name))
            }
            if (result.microorganisms?.length) {
              updateData.organismTypes = JSON.stringify(result.microorganisms.map(o => o.name))
            }
            if (result.system_type) {
              updateData.systemType = result.system_type
            }

            // Add performance data tags
            const tags = []
            if (result.has_performance_data) tags.push('HAS_PERFORMANCE_DATA')
            if (result.power_density) tags.push('HAS_POWER_DENSITY')
            if (result.current_density) tags.push('HAS_CURRENT_DENSITY')
            if (result.cod_removal_efficiency || result.bod_removal_efficiency) tags.push('HAS_TREATMENT_DATA')
            
            if (tags.length > 0) {
              updateData.keywords = JSON.stringify(tags)
            }

            await prisma.researchPaper.update({
              where: { id: paper.id },
              data: updateData
            })

            processed++
            if (result.has_performance_data) {
              withData++
              const extractedMetrics = Object.keys(result)
                .filter(k => result[k as keyof ExtractedData] !== null && k !== 'has_performance_data')
              console.log(`  ✅ Extracted: ${extractedMetrics.join(', ')}`)
            } else {
              console.log(`  ✅ Processed (no performance data)`)
            }
          } else {
            errors++
            console.log(`  ❌ All models failed`)
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          errors++
          console.error(`  ❌ Processing error:`, error)
        }
      }
      
      // Progress summary after each batch
      console.log(`\n📊 Batch ${Math.floor(i/batchSize) + 1} Summary:`)
      console.log(`   Processed: ${processed}, With data: ${withData}, Errors: ${errors}`)
      
      // Brief pause between batches
      if (i + batchSize < unprocessedPapers.length) {
        console.log('   ⏸️ Pausing 5s between batches...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    return this.generateFinalReport(processed, withData, errors, validationFailures)
  }

  private async generateFinalReport(processed: number, withData: number, errors: number, validationFailures: number) {
    console.log('\n✅ Enhanced processing complete!')
    console.log(`\n📊 Final Summary:`)
    console.log(`  Papers processed: ${processed}`)
    console.log(`  With performance data: ${withData}`)
    console.log(`  Processing errors: ${errors}`)
    console.log(`  Validation failures: ${validationFailures}`)
    console.log(`  Success rate: ${processed + errors > 0 ? ((processed/(processed + errors))*100).toFixed(1) : 0}%`)
    console.log(`  Data extraction rate: ${processed > 0 ? ((withData/processed)*100).toFixed(1) : 0}%`)
    
    // Updated database statistics
    const totalPapers = await prisma.researchPaper.count()
    const enhancedProcessed = await prisma.researchPaper.count({
      where: { aiModelVersion: 'ollama-enhanced-v2' }
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

    console.log(`\n📚 Updated Database Status:`)
    console.log(`  Total papers: ${totalPapers}`)
    console.log(`  Enhanced processed: ${enhancedProcessed} (${((enhancedProcessed/totalPapers)*100).toFixed(1)}%)`)
    console.log(`  With performance data: ${withPerformanceData} (${((withPerformanceData/totalPapers)*100).toFixed(1)}%)`)
    
    const qualityScore = Math.round((enhancedProcessed/totalPapers*40) + (withPerformanceData/totalPapers*60))
    console.log(`  Database quality score: ${qualityScore}/100`)
    
    return {
      processed,
      withData,
      errors,
      qualityScore,
      totalPapers,
      enhancedProcessed,
      withPerformanceData
    }
  }
}

async function main() {
  const processor = new EnhancedOllamaProcessor()
  
  console.log('🔍 Checking Ollama status...')
  const isRunning = await processor.checkOllama()
  
  if (!isRunning) {
    console.error('❌ Ollama is not running. Please start it with: ollama serve')
    process.exit(1)
  }
  
  try {
    await processor.processAllPapers(10) // Process 10 papers per batch
  } catch (error) {
    console.error('Error during enhanced processing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()