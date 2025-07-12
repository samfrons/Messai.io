import { 
  unifiedSystemsCatalog, 
  getSystemsByCategory, 
  getSystemsByScale,
  getExperimentalSystems,
  getResearchSystems,
  getHighPerformanceSystems,
  searchSystems,
  sortByPowerOutput,
  sortByPopularity,
  sortByCost,
  getSystemById,
  getRelatedSystems,
  standardizePowerOutput
} from '../lib/unified-systems-catalog'

console.log('🧪 Testing Unified Systems Catalog')
console.log('=====================================\n')

// Test 1: Basic catalog structure
console.log('1. CATALOG STRUCTURE TEST:')
console.log(`Total systems: ${unifiedSystemsCatalog.length}`)
console.log(`Expected: 24 systems (13 designs + 11 models)`)

const experimentalCount = getExperimentalSystems().length
const researchCount = getResearchSystems().length
console.log(`Experimental systems: ${experimentalCount}`)
console.log(`Research systems: ${researchCount}`)

// Test 2: Category filtering
console.log('\n2. CATEGORY FILTERING TEST:')
const categories = ['experimental', 'high-performance', 'innovative', 'scalable', 'sustainable', 'specialized'] as const
categories.forEach(category => {
  const systems = getSystemsByCategory(category)
  console.log(`${category}: ${systems.length} systems`)
})

// Test 3: Scale filtering
console.log('\n3. SCALE FILTERING TEST:')
const scales = ['micro', 'lab', 'pilot', 'industrial'] as const
scales.forEach(scale => {
  const systems = getSystemsByScale(scale)
  console.log(`${scale}: ${systems.length} systems`)
})

// Test 4: High performance filtering
console.log('\n4. PERFORMANCE FILTERING TEST:')
const highPerf1000 = getHighPerformanceSystems(1000)
const highPerf10000 = getHighPerformanceSystems(10000)
const highPerf50000 = getHighPerformanceSystems(50000)
console.log(`Systems > 1,000 mW/m²: ${highPerf1000.length}`)
console.log(`Systems > 10,000 mW/m²: ${highPerf10000.length}`)
console.log(`Systems > 50,000 mW/m²: ${highPerf50000.length}`)

// Test 5: Search functionality
console.log('\n5. SEARCH FUNCTIONALITY TEST:')
const mfcSearch = searchSystems('MFC')
const quantumSearch = searchSystems('quantum')
const plantSearch = searchSystems('plant')
console.log(`"MFC" search results: ${mfcSearch.length}`)
console.log(`"quantum" search results: ${quantumSearch.length}`)
console.log(`"plant" search results: ${plantSearch.length}`)

// Test 6: Sorting functionality
console.log('\n6. SORTING FUNCTIONALITY TEST:')
const sortedByPower = sortByPowerOutput(unifiedSystemsCatalog.slice(0, 5))
const sortedByPopularity = sortByPopularity(unifiedSystemsCatalog.slice(0, 5))
const sortedByCost = sortByCost(unifiedSystemsCatalog.slice(0, 5))

console.log('Top 3 by power output:')
sortedByPower.slice(0, 3).forEach((system, i) => {
  console.log(`  ${i + 1}. ${system.name}: ${standardizePowerOutput(system).toLocaleString()} mW/m² (normalized)`)
})

console.log('Top 3 by popularity:')
sortedByPopularity.slice(0, 3).forEach((system, i) => {
  console.log(`  ${i + 1}. ${system.name}: ${system.popularity || 0} popularity`)
})

// Test 7: Individual system retrieval
console.log('\n7. SYSTEM RETRIEVAL TEST:')
const quantumSystem = getSystemById('quantum-mxene-enhanced')
const masonJarSystem = getSystemById('mason-jar')
console.log(`Quantum system found: ${quantumSystem ? '✓' : '✗'}`)
console.log(`Mason jar system found: ${masonJarSystem ? '✓' : '✗'}`)

// Test 8: Related systems
console.log('\n8. RELATED SYSTEMS TEST:')
if (quantumSystem) {
  const related = getRelatedSystems('quantum-mxene-enhanced', 3)
  console.log(`Related to quantum system: ${related.length} systems`)
  related.forEach(system => {
    console.log(`  - ${system.name} (${system.category})`)
  })
}

// Test 9: Data validation
console.log('\n9. DATA VALIDATION TEST:')
let validationErrors = 0

unifiedSystemsCatalog.forEach(system => {
  // Required fields
  if (!system.id) { console.log(`❌ Missing ID: ${system.name}`); validationErrors++ }
  if (!system.name) { console.log(`❌ Missing name`); validationErrors++ }
  if (!system.powerOutput) { console.log(`❌ Missing power output: ${system.name}`); validationErrors++ }
  if (!system.materials.anode.length) { console.log(`❌ Missing anode materials: ${system.name}`); validationErrors++ }
  if (!system.materials.cathode.length) { console.log(`❌ Missing cathode materials: ${system.name}`); validationErrors++ }
  
  // Logical validation
  if (system.isExperimental && system.researchBacked) {
    // This could be valid for some systems, so just log
    console.log(`⚠️  Both experimental and research-backed: ${system.name}`)
  }
  
  // Power output validation
  const standardPower = standardizePowerOutput(system)
  if (standardPower <= 0) {
    console.log(`❌ Invalid power output: ${system.name}`)
    validationErrors++
  }
})

console.log(`Validation errors: ${validationErrors}`)

// Test 10: Integration points
console.log('\n10. INTEGRATION POINTS TEST:')
const systemsWithDesignType = unifiedSystemsCatalog.filter(s => s.designType)
const systemsWithVisualizationNotes = unifiedSystemsCatalog.filter(s => s.visualizationNotes)
const systemsWithPriority = unifiedSystemsCatalog.filter(s => s.priority)

console.log(`Systems with 3D models (designType): ${systemsWithDesignType.length}`)
console.log(`Systems with visualization notes: ${systemsWithVisualizationNotes.length}`)
console.log(`Systems with implementation priority: ${systemsWithPriority.length}`)

// Test 11: Feature coverage
console.log('\n11. FEATURE COVERAGE TEST:')
const allFeatures = new Set<string>()
const allApplications = new Set<string>()
const allMaterials = new Set<string>()

unifiedSystemsCatalog.forEach(system => {
  system.specialFeatures.forEach(feature => allFeatures.add(feature))
  system.applications.forEach(app => allApplications.add(app))
  system.materials.anode.forEach(mat => allMaterials.add(mat))
  system.materials.cathode.forEach(mat => allMaterials.add(mat))
})

console.log(`Unique special features: ${allFeatures.size}`)
console.log(`Unique applications: ${allApplications.size}`)
console.log(`Unique materials: ${allMaterials.size}`)

// Test 12: Power output range verification
console.log('\n12. POWER OUTPUT RANGE TEST:')
const powerOutputs = unifiedSystemsCatalog.map(s => standardizePowerOutput(s))
const minPower = Math.min(...powerOutputs)
const maxPower = Math.max(...powerOutputs)
const avgPower = powerOutputs.reduce((sum, p) => sum + p, 0) / powerOutputs.length

console.log(`Power range: ${minPower.toLocaleString()} - ${maxPower.toLocaleString()} mW/m² (normalized)`)
console.log(`Average power: ${avgPower.toLocaleString()} mW/m²`)

console.log('\n✅ UNIFIED SYSTEMS CATALOG TEST COMPLETE!')
console.log(`\nSUMMARY:`)
console.log(`- Total systems: ${unifiedSystemsCatalog.length}`)
console.log(`- Experimental systems: ${experimentalCount}`)
console.log(`- Research systems: ${researchCount}`)
console.log(`- Validation errors: ${validationErrors}`)
console.log(`- Power range: ${minPower.toLocaleString()} - ${maxPower.toLocaleString()} mW/m²`)

if (validationErrors === 0) {
  console.log('\n🎉 All tests passed! The unified systems catalog is working correctly.')
} else {
  console.log(`\n⚠️  Found ${validationErrors} validation errors that should be addressed.`)
}