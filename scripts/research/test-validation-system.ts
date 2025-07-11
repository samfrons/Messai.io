#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { DataValidator, UnitConverter, DataQualityScorer, SUCCESSFUL_EXTRACTION_EXAMPLES, type ExtractedData } from '../../lib/research/data-validation'

const prisma = new PrismaClient()

async function testValidationSystem() {
  console.log('🧪 Testing data validation and extraction system...')
  
  // Test 1: Validate example successful extractions
  console.log('\n📝 Test 1: Validating example extractions...')
  
  for (let i = 0; i < SUCCESSFUL_EXTRACTION_EXAMPLES.length; i++) {
    const example = SUCCESSFUL_EXTRACTION_EXAMPLES[i]
    console.log(`\n  Example ${i + 1}: ${example.title.substring(0, 50)}...`)
    
    const validation = DataValidator.validateExtractedData(example.expected_output)
    
    if (validation.isValid) {
      const score = DataQualityScorer.scoreExtractedData(validation.data!)
      console.log(`    ✅ Valid (quality: ${score}%)`)
    } else {
      console.log(`    ❌ Invalid: ${validation.errors.join(', ')}`)
    }
  }
  
  // Test 2: Unit conversion system
  console.log('\n🔄 Test 2: Testing unit conversions...')
  
  const testConversions = [
    { value: 1250, unit: 'mW/m²', target: 'mW/m²', expected: 1250 },
    { value: 1.5, unit: 'W/m²', target: 'mW/m²', expected: 1500 },
    { value: 50, unit: 'mW/cm²', target: 'mW/m²', expected: 500000 },
    { value: 2.1, unit: 'mA/cm²', target: 'mA/cm²', expected: 2.1 },
    { value: 0.5, unit: 'A/m²', target: 'mA/cm²', expected: 0.05 },
    { value: 30, unit: '°C', target: '°C', expected: 30 },
    { value: 303.15, unit: 'K', target: '°C', expected: 30 }
  ]
  
  for (const test of testConversions) {
    const metric = { value: test.value, unit: test.unit }
    const converted = UnitConverter.convertMetric(metric, test.target)
    
    if (converted && Math.abs(converted.value - test.expected) < 0.001) {
      console.log(`    ✅ ${test.value} ${test.unit} → ${converted.value} ${test.target}`)
    } else {
      console.log(`    ❌ ${test.value} ${test.unit} → ${converted?.value || 'null'} ${test.target} (expected ${test.expected})`)
    }
  }
  
  // Test 3: Test with real database papers
  console.log('\n📚 Test 3: Testing with sample database papers...')
  
  const samplePapers = await prisma.researchPaper.findMany({
    where: {
      abstract: { not: null },
      aiProcessingDate: null
    },
    take: 3,
    select: { id: true, title: true, abstract: true }
  })
  
  console.log(`Found ${samplePapers.length} sample papers to test`)
  
  for (const paper of samplePapers) {
    console.log(`\n  📄 ${paper.title.substring(0, 60)}...`)
    
    // Test pattern matching extraction (simple regex)
    const patterns = [
      { name: 'power_density', regex: /(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²2]/gi },
      { name: 'current_density', regex: /(\d+(?:\.\d+)?)\s*(?:mA|A)\/cm[²2]/gi },
      { name: 'efficiency', regex: /(\d+(?:\.\d+)?)\s*%/g }
    ]
    
    let foundMetrics = 0
    const abstract = paper.abstract || ''
    
    for (const pattern of patterns) {
      const matches = [...abstract.matchAll(pattern.regex)]
      if (matches.length > 0) {
        foundMetrics++
        console.log(`    ✅ Found ${pattern.name}: ${matches[0][0]}`)
      }
    }
    
    if (foundMetrics === 0) {
      console.log(`    📭 No performance metrics found in abstract`)
    }
  }
  
  // Test 4: Database statistics
  console.log('\n📊 Test 4: Current database statistics...')
  
  const stats = {
    total: await prisma.researchPaper.count(),
    withAbstract: await prisma.researchPaper.count({ where: { abstract: { not: null } } }),
    processed: await prisma.researchPaper.count({ where: { aiProcessingDate: { not: null } } }),
    withPowerData: await prisma.researchPaper.count({ where: { powerOutput: { not: null } } }),
    withEfficiencyData: await prisma.researchPaper.count({ where: { efficiency: { not: null } } })
  }
  
  console.log(`  Total papers: ${stats.total}`)
  console.log(`  With abstracts: ${stats.withAbstract} (${((stats.withAbstract/stats.total)*100).toFixed(1)}%)`)
  console.log(`  AI processed: ${stats.processed} (${((stats.processed/stats.total)*100).toFixed(1)}%)`)
  console.log(`  With power data: ${stats.withPowerData} (${((stats.withPowerData/stats.total)*100).toFixed(1)}%)`)
  console.log(`  With efficiency data: ${stats.withEfficiencyData} (${((stats.withEfficiencyData/stats.total)*100).toFixed(1)}%)`)
  
  const qualityScore = Math.round((stats.processed/stats.total*40) + (stats.withPowerData/stats.total*60))
  console.log(`  Current quality score: ${qualityScore}/100`)
  
  console.log('\n✅ Validation system test complete!')
}

async function main() {
  try {
    await testValidationSystem()
  } catch (error) {
    console.error('Error during testing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()