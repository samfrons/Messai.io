#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { DataValidator, UnitConverter, DataQualityScorer, SUCCESSFUL_EXTRACTION_EXAMPLES, type ExtractedData } from '../../lib/research/data-validation'

const prisma = new PrismaClient()

class TestOllamaProcessor {
  private readonly ollamaUrl = 'http://localhost:11434'
  
  async testSinglePaper() {
    console.log('🧪 Testing enhanced Ollama processor with single paper...')
    
    // Get one unprocessed paper
    const paper = await prisma.researchPaper.findFirst({
      where: {
        aiModelVersion: { not: 'ollama-enhanced-v2' },
        abstract: { not: null },
        title: { contains: 'microbial fuel' }
      },
      select: { id: true, title: true, abstract: true }
    })

    if (!paper) {
      console.log('❌ No suitable test paper found')
      return
    }

    console.log(`📄 Testing with: ${paper.title.substring(0, 60)}...`)
    
    const prompt = this.createEnhancedPrompt(paper.title, paper.abstract || '')
    
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: 'deepseek-r1',
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
          top_p: 0.9,
          num_predict: 1000
        }
      }, { 
        timeout: 60000
      })

      console.log('🤖 Raw Ollama response:')
      console.log(response.data.response.substring(0, 500) + '...')
      
      // Parse and validate
      const rawData = JSON.parse(response.data.response)
      const validation = DataValidator.validateExtractedData(rawData)
      
      if (validation.isValid) {
        const standardized = DataValidator.standardizeExtractedData(validation.data!)
        const qualityScore = DataQualityScorer.scoreExtractedData(standardized)
        
        console.log('✅ Validation successful!')
        console.log(`📊 Quality score: ${qualityScore}%`)
        console.log('📋 Extracted data:')
        console.log(JSON.stringify(standardized, null, 2))
        
        return { success: true, data: standardized }
      } else {
        console.log('❌ Validation failed:')
        console.log(validation.errors.join('\n'))
        return { success: false, errors: validation.errors }
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message)
      return { success: false, error: error.message }
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
}

async function main() {
  const processor = new TestOllamaProcessor()
  
  try {
    const result = await processor.testSinglePaper()
    console.log('\n🎯 Test result:', result)
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()