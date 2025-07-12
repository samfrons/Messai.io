#!/usr/bin/env node

// Test script to verify frontend filtering is working correctly
// This simulates the frontend filtering logic with test data

function formatMaterials(materials, type) {
  if (!materials) return null
  
  let materialList = []
  if (Array.isArray(materials)) {
    materialList = materials
  } else if (typeof materials === 'string') {
    try {
      const parsed = JSON.parse(materials)
      materialList = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      materialList = [materials]
    }
  }
  
  // Filter out placeholder values and common pattern matching artifacts
  const cleanMaterials = materialList.filter(m => {
    if (!m || typeof m !== 'string') return false
    const lower = m.toLowerCase().trim()
    
    // Basic quality filters
    if (lower.length <= 2) return false
    if (['not specified', 'undefined', 'null', 'n/a', 'na'].includes(lower)) return false
    if (lower.includes('null') || lower.includes('undefined')) return false
    
    // Pattern matching artifacts
    const artifacts = ['the', 'and', 'with', 'using', 'while the', 'in the', 'of the', 'for the', 'to the', 'was', 'were', 'is', 'are', 'at', 'on', 'in', 'of', 'by', 'from', 'as']
    if (artifacts.includes(lower)) return false
    
    // Very short or common words
    if (lower.length < 4 && !['mxene', 'cnt', 'go', 'rgo'].includes(lower)) return false
    
    return true
  })
  
  if (cleanMaterials.length === 0) return null
  
  return cleanMaterials.slice(0, 3).join(', ') + (cleanMaterials.length > 3 ? '...' : '')
}

function formatOrganisms(organisms) {
  if (!organisms) return null
  
  let organismList = []
  if (Array.isArray(organisms)) {
    organismList = organisms
  } else if (typeof organisms === 'string') {
    try {
      const parsed = JSON.parse(organisms)
      organismList = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      organismList = [organisms]
    }
  }
  
  const cleanOrganisms = organismList.filter(o => {
    if (!o || typeof o !== 'string') return false
    const lower = o.toLowerCase().trim()
    
    // Basic quality filters
    if (lower.length <= 2) return false
    if (['not specified', 'undefined', 'null', 'n/a', 'na'].includes(lower)) return false
    if (lower.includes('null') || lower.includes('undefined')) return false
    
    // Pattern matching artifacts for organisms
    const artifacts = ['the', 'and', 'with', 'using', 'while the', 'in the', 'of the', 'for the', 'to the', 'was', 'were', 'is', 'are', 'at', 'on', 'in', 'of', 'by', 'from', 'as', 'solution', 'medium', 'buffer']
    if (artifacts.includes(lower)) return false
    
    // Very short words (but allow some scientific abbreviations)
    if (lower.length < 4 && !['e. coli', 'dh5α'].some(abbrev => lower.includes(abbrev.split(' ')[0]))) return false
    
    return true
  })
  
  if (cleanOrganisms.length === 0) return null
  
  return cleanOrganisms.slice(0, 2).join(', ') + (cleanOrganisms.length > 2 ? '...' : '')
}

console.log('🧪 Testing Frontend Filtering Logic...\n')

// Test cases with poor quality data from pattern matching
const testCases = [
  {
    name: 'Poor Quality Anode Materials',
    anodeMaterials: ['the', 'while the', 'graphite', 'carbon cloth'],
    expected: 'graphite, carbon cloth'
  },
  {
    name: 'Poor Quality Cathode Materials', 
    cathodeMaterials: ['and', 'with', 'platinum', 'air-cathode'],
    expected: 'platinum, air-cathode'
  },
  {
    name: 'Mixed Quality Organisms',
    organisms: ['Nafion membranes', 'Sphingomonas wittichii RW1', 'the', 'solution'],
    expected: 'Nafion membranes, Sphingomonas wittichii RW1'
  },
  {
    name: 'All Poor Quality Data',
    anodeMaterials: ['the', 'and', 'with', 'at'],
    expected: null
  },
  {
    name: 'Good Scientific Materials',
    anodeMaterials: ['CNT', 'MXene', 'graphene oxide', 'reduced graphene oxide'],
    expected: 'graphene oxide, reduced graphene oxide, MXene'
  },
  {
    name: 'Null/Undefined Handling',
    anodeMaterials: null,
    cathodeMaterials: undefined,
    organisms: ['not specified', 'undefined'],
    expected: null
  }
]

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`)
  
  if (test.anodeMaterials) {
    const result = formatMaterials(test.anodeMaterials, 'anode')
    const passed = result === test.expected
    console.log(`   Input: ${JSON.stringify(test.anodeMaterials)}`)
    console.log(`   Output: ${result}`)
    console.log(`   Expected: ${test.expected}`)
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}\n`)
  }
  
  if (test.cathodeMaterials) {
    const result = formatMaterials(test.cathodeMaterials, 'cathode')
    const passed = result === test.expected
    console.log(`   Input: ${JSON.stringify(test.cathodeMaterials)}`)
    console.log(`   Output: ${result}`)
    console.log(`   Expected: ${test.expected}`)
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}\n`)
  }
  
  if (test.organisms) {
    const result = formatOrganisms(test.organisms)
    const passed = result === test.expected
    console.log(`   Input: ${JSON.stringify(test.organisms)}`)
    console.log(`   Output: ${result}`)
    console.log(`   Expected: ${test.expected}`)
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}\n`)
  }
})

console.log('🎉 Frontend filtering test complete!')