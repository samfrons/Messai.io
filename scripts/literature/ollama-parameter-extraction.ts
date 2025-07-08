#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:latest' // Using qwen2.5-coder for technical extraction

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

class OllamaParameterExtractor {
  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent extraction
          top_p: 0.9,
          seed: 42 // For reproducibility
        }
      })
      
      return response.data.response
    } catch (error: any) {
      console.error('Ollama API error:', error.message)
      throw error
    }
  }

  private createExtractionPrompt(paper: any): string {
    return `You are a scientific data extraction assistant specializing in microbial electrochemical systems. Extract structured data from the following research paper abstract.

Title: ${paper.title}
Abstract: ${paper.abstract || 'No abstract available'}

Extract the following parameters in JSON format. Only include values explicitly mentioned in the text. Use null for missing values.

{
  "experimentalConditions": {
    "temperature": { "value": number or null, "unit": "°C" },
    "pH": number or null,
    "duration": { "value": number or null, "unit": "days|hours|weeks" },
    "substrate": { "type": string or null, "concentration": { "value": number or null, "unit": string } }
  },
  "reactorConfiguration": {
    "volume": { "value": number or null, "unit": "mL|L" },
    "design": string or null,
    "chamberType": "single|dual|stacked" or null,
    "mode": "batch|continuous|fed-batch" or null,
    "dimensions": string or null
  },
  "electrodeSpecifications": {
    "anodeMaterial": string or null,
    "cathodeMaterial": string or null,
    "anodeArea": { "value": number or null, "unit": "cm²|m²" },
    "cathodeArea": { "value": number or null, "unit": "cm²|m²" },
    "electrodeSpacing": { "value": number or null, "unit": "cm|mm" },
    "surfaceModifications": [array of strings] or null
  },
  "biologicalParameters": {
    "inoculumSource": string or null,
    "microorganisms": [array of species names] or null,
    "biofilmFormation": string or null,
    "cellDensity": { "value": number or null, "unit": string }
  },
  "performanceMetrics": {
    "powerDensity": { "value": number or null, "unit": "mW/m²|W/m²" },
    "currentDensity": { "value": number or null, "unit": "mA/m²|A/m²" },
    "voltage": { "value": number or null, "unit": "mV|V", "type": "OCV|operating" },
    "coulombicEfficiency": number or null,
    "energyEfficiency": number or null,
    "hydrogenProductionRate": { "value": number or null, "unit": "L/m²·day" },
    "codRemoval": number or null
  },
  "operationalParameters": {
    "externalResistance": { "value": number or null, "unit": "Ω|kΩ" },
    "hydraulicRetentionTime": { "value": number or null, "unit": "hours|days" },
    "organicLoadingRate": { "value": number or null, "unit": "g/L·d|kg/m³·d" },
    "flowRate": { "value": number or null, "unit": "mL/min|L/h" }
  },
  "electrochemicalCharacterization": {
    "internalResistance": { "value": number or null, "unit": "Ω" },
    "chargeTransferResistance": { "value": number or null, "unit": "Ω" },
    "techniques": [array of "CV"|"LSV"|"EIS"|"DPV"] or null,
    "scanRate": { "value": number or null, "unit": "mV/s" },
    "tafelSlope": { "value": number or null, "unit": "mV/dec" }
  }
}

IMPORTANT EXTRACTION RULES:
1. Only extract values explicitly stated in the text
2. Convert all temperatures to Celsius
3. Convert power density to mW/m²
4. Convert current density to mA/m²
5. Use null for any value not found
6. For arrays, return null if no items found
7. Be precise with units
8. Extract numeric values only, not ranges

Return ONLY valid JSON, no explanation text.`
  }

  private parseOllamaResponse(response: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // If no JSON found, try parsing the whole response
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse Ollama response:', error);
      return null;
    }
  }

  private validateAndCleanExtraction(data: any): any {
    if (!data) return null;
    
    // Clean and validate each section
    const cleaned: any = {};
    
    // Experimental Conditions
    if (data.experimentalConditions) {
      const exp = data.experimentalConditions;
      const cleanExp: any = {};
      
      if (exp.temperature?.value && typeof exp.temperature.value === 'number') {
        cleanExp.temperature = exp.temperature;
      }
      if (exp.pH && typeof exp.pH === 'number' && exp.pH >= 0 && exp.pH <= 14) {
        cleanExp.pH = exp.pH;
      }
      if (exp.duration?.value && typeof exp.duration.value === 'number') {
        cleanExp.duration = exp.duration;
      }
      if (exp.substrate?.type && typeof exp.substrate.type === 'string') {
        cleanExp.substrate = exp.substrate;
      }
      
      if (Object.keys(cleanExp).length > 0) {
        cleaned.experimentalConditions = cleanExp;
      }
    }
    
    // Reactor Configuration
    if (data.reactorConfiguration) {
      const reactor = data.reactorConfiguration;
      const cleanReactor: any = {};
      
      if (reactor.volume?.value && typeof reactor.volume.value === 'number') {
        cleanReactor.volume = reactor.volume;
      }
      if (reactor.design && typeof reactor.design === 'string') {
        cleanReactor.design = reactor.design;
      }
      if (reactor.chamberType) {
        cleanReactor.chamberType = reactor.chamberType;
      }
      if (reactor.mode) {
        cleanReactor.mode = reactor.mode;
      }
      
      if (Object.keys(cleanReactor).length > 0) {
        cleaned.reactorConfiguration = cleanReactor;
      }
    }
    
    // Performance Metrics
    if (data.performanceMetrics) {
      const perf = data.performanceMetrics;
      const cleanPerf: any = {};
      
      if (perf.powerDensity?.value && typeof perf.powerDensity.value === 'number') {
        // Convert to standard mW/m²
        let value = perf.powerDensity.value;
        if (perf.powerDensity.unit?.includes('W/m')) {
          value *= 1000;
        }
        cleanPerf.powerDensity = { value, unit: 'mW/m²' };
      }
      
      if (perf.currentDensity?.value && typeof perf.currentDensity.value === 'number') {
        // Convert to standard mA/m²
        let value = perf.currentDensity.value;
        if (perf.currentDensity.unit?.includes('A/m')) {
          value *= 1000;
        }
        cleanPerf.currentDensity = { value, unit: 'mA/m²' };
      }
      
      if (perf.coulombicEfficiency && typeof perf.coulombicEfficiency === 'number') {
        cleanPerf.coulombicEfficiency = perf.coulombicEfficiency;
      }
      
      if (Object.keys(cleanPerf).length > 0) {
        cleaned.performanceMetrics = cleanPerf;
      }
    }
    
    // Add other sections similarly...
    
    return cleaned;
  }

  async processPaper(paper: any): Promise<boolean> {
    try {
      console.log(`\n🤖 Processing with Ollama: ${paper.title.substring(0, 80)}...`)
      
      // Create extraction prompt
      const prompt = this.createExtractionPrompt(paper);
      
      // Call Ollama
      console.log('   📡 Calling Ollama API...');
      const response = await this.callOllama(prompt);
      
      // Parse response
      const extractedData = this.parseOllamaResponse(response);
      if (!extractedData) {
        console.log('   ⚠️  Failed to parse Ollama response');
        return false;
      }
      
      // Validate and clean data
      const cleanedData = this.validateAndCleanExtraction(extractedData);
      if (!cleanedData || Object.keys(cleanedData).length === 0) {
        console.log('   ⚠️  No valid data extracted');
        return false;
      }
      
      // Prepare update data
      const updateData: any = {};
      
      if (cleanedData.experimentalConditions) {
        updateData.experimentalConditions = JSON.stringify(cleanedData.experimentalConditions);
      }
      
      if (cleanedData.reactorConfiguration) {
        updateData.reactorConfiguration = JSON.stringify(cleanedData.reactorConfiguration);
      }
      
      if (cleanedData.electrodeSpecifications) {
        updateData.electrodeSpecifications = JSON.stringify(cleanedData.electrodeSpecifications);
      }
      
      if (cleanedData.biologicalParameters) {
        updateData.biologicalParameters = JSON.stringify(cleanedData.biologicalParameters);
      }
      
      if (cleanedData.performanceMetrics) {
        updateData.performanceMetrics = JSON.stringify(cleanedData.performanceMetrics);
        
        // Update basic fields for backward compatibility
        if (cleanedData.performanceMetrics.powerDensity?.value) {
          updateData.powerOutput = cleanedData.performanceMetrics.powerDensity.value;
        }
        if (cleanedData.performanceMetrics.coulombicEfficiency) {
          updateData.efficiency = cleanedData.performanceMetrics.coulombicEfficiency;
        }
      }
      
      if (cleanedData.operationalParameters) {
        updateData.operationalParameters = JSON.stringify(cleanedData.operationalParameters);
      }
      
      if (cleanedData.electrochemicalCharacterization) {
        updateData.electrochemicalData = JSON.stringify(cleanedData.electrochemicalCharacterization);
      }
      
      // Update paper in database
      if (Object.keys(updateData).length > 0) {
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: updateData
        });
        
        console.log(`   ✅ Extracted ${Object.keys(updateData).length} parameter categories`);
        
        // Log summary of what was extracted
        const summary: string[] = [];
        if (cleanedData.experimentalConditions?.temperature) {
          summary.push(`T=${cleanedData.experimentalConditions.temperature.value}°C`);
        }
        if (cleanedData.experimentalConditions?.pH) {
          summary.push(`pH=${cleanedData.experimentalConditions.pH}`);
        }
        if (cleanedData.performanceMetrics?.powerDensity) {
          summary.push(`P=${cleanedData.performanceMetrics.powerDensity.value} mW/m²`);
        }
        if (summary.length > 0) {
          console.log(`      ${summary.join(', ')}`);
        }
        
        return true;
      }
      
      return false;
      
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      return false;
    }
  }

  async processBatch(limit: number = 10) {
    console.log('🚀 Starting Ollama-based parameter extraction...');
    console.log(`   Model: ${OLLAMA_MODEL}`);
    console.log(`   Endpoint: ${OLLAMA_URL}`);
    
    // Test Ollama connection
    try {
      await axios.get(`${OLLAMA_URL}/api/tags`);
      console.log('   ✅ Ollama connection successful\n');
    } catch (error) {
      console.error('   ❌ Failed to connect to Ollama. Is it running?');
      console.log('   Run: ollama serve');
      return;
    }
    
    // Find papers that need processing
    const papers = await prisma.researchPaper.findMany({
      where: {
        AND: [
          { abstract: { not: null } },
          {
            OR: [
              { doi: { not: null } },
              { pubmedId: { not: null } },
              { arxivId: { not: null } }
            ]
          },
          // Papers without comprehensive extraction
          {
            OR: [
              { experimentalConditions: null },
              { reactorConfiguration: null },
              { performanceMetrics: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        abstract: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${papers.length} papers to process\n`);
    
    let processed = 0;
    let successful = 0;
    
    for (const paper of papers) {
      const success = await this.processPaper(paper);
      processed++;
      if (success) successful++;
      
      // Rate limiting - Ollama can handle requests quickly but let's be nice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (processed % 5 === 0) {
        console.log(`\n📊 Progress: ${processed}/${papers.length} papers (${successful} successful)`);
      }
    }
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Successfully extracted: ${successful}`);
    console.log(`   Success rate: ${((successful / processed) * 100).toFixed(1)}%`);
  }

  async testSinglePaper(paperId: string) {
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        abstract: true
      }
    });
    
    if (!paper) {
      console.error('Paper not found');
      return;
    }
    
    console.log('\n📄 Testing single paper extraction:');
    console.log(`   Title: ${paper.title}`);
    
    const success = await this.processPaper(paper);
    
    if (success) {
      // Fetch and display the extracted data
      const updated = await prisma.researchPaper.findUnique({
        where: { id: paperId },
        select: {
          experimentalConditions: true,
          reactorConfiguration: true,
          performanceMetrics: true,
          electrodeSpecifications: true,
          biologicalParameters: true,
          operationalParameters: true,
          electrochemicalData: true
        }
      });
      
      console.log('\n📊 Extracted Data:');
      if (updated?.experimentalConditions) {
        console.log('\nExperimental Conditions:');
        console.log(JSON.stringify(JSON.parse(updated.experimentalConditions), null, 2));
      }
      if (updated?.performanceMetrics) {
        console.log('\nPerformance Metrics:');
        console.log(JSON.stringify(JSON.parse(updated.performanceMetrics), null, 2));
      }
      if (updated?.reactorConfiguration) {
        console.log('\nReactor Configuration:');
        console.log(JSON.stringify(JSON.parse(updated.reactorConfiguration), null, 2));
      }
    }
  }
}

async function main() {
  const extractor = new OllamaParameterExtractor();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Ollama Parameter Extraction - AI-powered parameter extraction using local LLM

Prerequisites:
  1. Install Ollama: https://ollama.ai
  2. Pull a model: ollama pull llama2 (or mistral, mixtral, etc.)
  3. Start Ollama: ollama serve

Usage:
  npm run literature:ollama-extract           Process 10 papers
  npm run literature:ollama-extract [limit]   Process specified number
  npm run literature:ollama-extract --test [id]  Test single paper

Environment Variables:
  OLLAMA_URL    Ollama API URL (default: http://localhost:11434)
  OLLAMA_MODEL  Model to use (default: llama2)

Recommended Models:
  - llama2     : Good balance of speed and quality
  - mistral    : Fast and efficient
  - mixtral    : High quality but slower
  - codellama  : Good for technical content
    `);
    return;
  }
  
  try {
    if (args[0] === '--test' && args[1]) {
      await extractor.testSinglePaper(args[1]);
    } else {
      const limit = args[0] ? parseInt(args[0]) : 10;
      await extractor.processBatch(limit);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { OllamaParameterExtractor }