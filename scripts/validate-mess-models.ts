import { messModelsCatalog, getModelsByCategory, getHighPriorityModels, getHighPowerModels } from '../lib/mess-models-catalog'

console.log('🔬 MESSAi Models Catalog Validation Report')
console.log('==========================================\n')

// Overall statistics
console.log('📊 OVERALL STATISTICS:')
console.log(`Total Models: ${messModelsCatalog.length}`)
console.log(`High Priority Models (P1): ${getHighPriorityModels().length}`)
console.log(`High Power Models (>1000 mW/m²): ${getHighPowerModels(1000).length}`)
console.log(`Ultra-High Power Models (>50,000 mW/m²): ${getHighPowerModels(50000).length}`)

// Category breakdown
console.log('\n📂 MODELS BY CATEGORY:')
const categories = ['high-performance', 'innovative', 'scalable', 'sustainable', 'specialized'] as const
categories.forEach(category => {
  const models = getModelsByCategory(category)
  console.log(`${category}: ${models.length} models`)
})

// Power output analysis
console.log('\n⚡ POWER OUTPUT ANALYSIS:')
const powerOutputs = messModelsCatalog.map(m => {
  let powerInMWm2 = m.powerOutput.value
  if (m.powerOutput.unit === 'W/m³') {
    powerInMWm2 = m.powerOutput.value * 1000 // Rough conversion
  } else if (m.powerOutput.unit === 'mW/m³') {
    powerInMWm2 = m.powerOutput.value / 10 // Rough conversion
  }
  return { name: m.name, power: powerInMWm2, unit: m.powerOutput.unit }
}).sort((a, b) => b.power - a.power)

console.log('Top 5 by Power Output:')
powerOutputs.slice(0, 5).forEach((m, i) => {
  console.log(`${i + 1}. ${m.name}: ${m.power.toLocaleString()} mW/m² (from ${m.unit})`)
})

// Efficiency analysis
console.log('\n🎯 EFFICIENCY ANALYSIS:')
const withEfficiency = messModelsCatalog.filter(m => m.efficiency)
const avgEfficiency = withEfficiency.reduce((sum, m) => sum + (m.efficiency || 0), 0) / withEfficiency.length
console.log(`Models with efficiency data: ${withEfficiency.length}/${messModelsCatalog.length}`)
console.log(`Average efficiency: ${avgEfficiency.toFixed(1)}%`)
console.log(`Highest efficiency: ${Math.max(...withEfficiency.map(m => m.efficiency || 0))}%`)

// Scale distribution
console.log('\n📏 SCALE DISTRIBUTION:')
const scales = messModelsCatalog.reduce((acc, m) => {
  const scale = m.dimensions?.scale || 'unknown'
  acc[scale] = (acc[scale] || 0) + 1
  return acc
}, {} as Record<string, number>)
Object.entries(scales).forEach(([scale, count]) => {
  console.log(`${scale}: ${count} models`)
})

// Material analysis
console.log('\n🧪 MATERIAL ANALYSIS:')
const uniqueMaterials = new Set<string>()
messModelsCatalog.forEach(m => {
  m.materials.anode.forEach(mat => uniqueMaterials.add(mat))
  m.materials.cathode.forEach(mat => uniqueMaterials.add(mat))
})
console.log(`Total unique materials: ${uniqueMaterials.size}`)
console.log('Advanced materials found:')
const advancedMaterials = Array.from(uniqueMaterials).filter(mat => 
  mat.toLowerCase().includes('mxene') || 
  mat.toLowerCase().includes('quantum') || 
  mat.toLowerCase().includes('graphene') ||
  mat.toLowerCase().includes('nano')
)
advancedMaterials.forEach(mat => console.log(`  - ${mat}`))

// Application areas
console.log('\n🎯 APPLICATION AREAS:')
const applications = new Map<string, number>()
messModelsCatalog.forEach(m => {
  m.applications.forEach(app => {
    applications.set(app, (applications.get(app) || 0) + 1)
  })
})
const sortedApps = Array.from(applications.entries()).sort((a, b) => b[1] - a[1])
console.log('Top applications:')
sortedApps.slice(0, 10).forEach(([app, count]) => {
  console.log(`  - ${app}: ${count} models`)
})

// Cost analysis
console.log('\n💰 COST ANALYSIS:')
const withCost = messModelsCatalog.filter(m => m.costRange)
console.log(`Models with cost data: ${withCost.length}/${messModelsCatalog.length}`)
console.log('Cost ranges:')
const costGroups = {
  'Under $100': withCost.filter(m => m.costRange?.includes('$10') || m.costRange?.includes('$50')),
  '$100-$1000': withCost.filter(m => m.costRange?.includes('$100') || m.costRange?.includes('$200') || m.costRange?.includes('$300') || m.costRange?.includes('$500')),
  'Over $1000': withCost.filter(m => m.costRange?.includes('$1,000') || m.costRange?.includes('$2,000') || m.costRange?.includes('$5,000') || m.costRange?.includes('$10,000'))
}
Object.entries(costGroups).forEach(([range, models]) => {
  console.log(`  ${range}: ${models.length} models`)
})

// Research highlights
console.log('\n🔬 RESEARCH HIGHLIGHTS:')
const totalHighlights = messModelsCatalog.reduce((sum, m) => sum + m.researchHighlights.length, 0)
console.log(`Total research highlights: ${totalHighlights}`)
console.log(`Average highlights per model: ${(totalHighlights / messModelsCatalog.length).toFixed(1)}`)

// Special features
console.log('\n✨ SPECIAL FEATURES:')
const features = new Map<string, number>()
messModelsCatalog.forEach(m => {
  m.specialFeatures.forEach(feature => {
    // Extract key concepts from features
    if (feature.toLowerCase().includes('quantum')) features.set('Quantum', (features.get('Quantum') || 0) + 1)
    if (feature.toLowerCase().includes('3d')) features.set('3D Design', (features.get('3D Design') || 0) + 1)
    if (feature.toLowerCase().includes('capacitive')) features.set('Capacitive', (features.get('Capacitive') || 0) + 1)
    if (feature.toLowerCase().includes('modular')) features.set('Modular', (features.get('Modular') || 0) + 1)
    if (feature.toLowerCase().includes('sustainable')) features.set('Sustainable', (features.get('Sustainable') || 0) + 1)
  })
})
console.log('Key feature concepts:')
Array.from(features.entries()).sort((a, b) => b[1] - a[1]).forEach(([feature, count]) => {
  console.log(`  - ${feature}: ${count} models`)
})

// Data quality check
console.log('\n✅ DATA QUALITY CHECK:')
let issues = 0
messModelsCatalog.forEach(m => {
  if (!m.id) { console.log(`❌ Missing ID for model: ${m.name}`); issues++ }
  if (!m.name) { console.log(`❌ Missing name for model`); issues++ }
  if (!m.powerOutput) { console.log(`❌ Missing power output for: ${m.name}`); issues++ }
  if (!m.materials.anode.length) { console.log(`❌ No anode materials for: ${m.name}`); issues++ }
  if (!m.materials.cathode.length) { console.log(`❌ No cathode materials for: ${m.name}`); issues++ }
  if (!m.applications.length) { console.log(`❌ No applications for: ${m.name}`); issues++ }
  if (!m.specialFeatures.length) { console.log(`❌ No special features for: ${m.name}`); issues++ }
})
if (issues === 0) {
  console.log('✅ All models have complete required data!')
} else {
  console.log(`❌ Found ${issues} data quality issues`)
}

// Implementation readiness
console.log('\n🚀 IMPLEMENTATION READINESS:')
const byPriority = messModelsCatalog.reduce((acc, m) => {
  const p = `Priority ${m.implementationPriority}`
  acc[p] = (acc[p] || 0) + 1
  return acc
}, {} as Record<string, number>)
Object.entries(byPriority).forEach(([priority, count]) => {
  console.log(`${priority}: ${count} models`)
})

console.log('\n📝 SUMMARY:')
console.log(`The MESS Models Catalog contains ${messModelsCatalog.length} cutting-edge bioelectrochemical system designs.`)
console.log(`These models span power outputs from ${Math.min(...messModelsCatalog.map(m => m.powerOutput.value))} to ${Math.max(...messModelsCatalog.map(m => m.powerOutput.value)).toLocaleString()} ${messModelsCatalog[0].powerOutput.unit}.`)
console.log(`${getHighPriorityModels().length} models are ready for immediate implementation.`)
console.log('\n✨ The catalog successfully bridges the gap between research literature and practical implementation!')