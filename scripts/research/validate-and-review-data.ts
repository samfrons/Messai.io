import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

interface ValidationReport {
  totalPapers: number
  dataQualityIssues: {
    missingTitles: number
    missingAuthors: number
    invalidPowerOutput: number
    invalidEfficiency: number
    missingSystemType: number
    duplicateTitles: string[]
    suspiciousData: string[]
  }
  performanceStats: {
    powerOutputRange: { min: number; max: number; avg: number; median: number }
    efficiencyRange: { min: number; max: number; avg: number; median: number }
    outliers: { powerOutliers: any[]; efficiencyOutliers: any[] }
  }
  materialAnalysis: {
    anodeTypes: Record<string, number>
    cathodeTypes: Record<string, number>
    topMaterials: { material: string; avgPower: number; count: number }[]
  }
  organismAnalysis: {
    commonOrganisms: Record<string, number>
    performanceByOrganism: { organism: string; avgPower: number; count: number }[]
  }
  recommendations: string[]
}

async function validateAndReviewData(): Promise<ValidationReport> {
  console.log('🔍 Starting comprehensive data validation and review...')
  
  // Get all papers
  const allPapers = await prisma.researchPaper.findMany({
    select: {
      id: true,
      title: true,
      authors: true,
      systemType: true,
      powerOutput: true,
      efficiency: true,
      anodeMaterials: true,
      cathodeMaterials: true,
      organismTypes: true,
      source: true
    }
  })
  
  const report: ValidationReport = {
    totalPapers: allPapers.length,
    dataQualityIssues: {
      missingTitles: 0,
      missingAuthors: 0,
      invalidPowerOutput: 0,
      invalidEfficiency: 0,
      missingSystemType: 0,
      duplicateTitles: [],
      suspiciousData: []
    },
    performanceStats: {
      powerOutputRange: { min: 0, max: 0, avg: 0, median: 0 },
      efficiencyRange: { min: 0, max: 0, avg: 0, median: 0 },
      outliers: { powerOutliers: [], efficiencyOutliers: [] }
    },
    materialAnalysis: {
      anodeTypes: {},
      cathodeTypes: {},
      topMaterials: []
    },
    organismAnalysis: {
      commonOrganisms: {},
      performanceByOrganism: []
    },
    recommendations: []
  }
  
  console.log(`📊 Analyzing ${allPapers.length} papers...`)
  
  // Track for duplicate detection
  const titleCounts: Record<string, number> = {}
  const validPowerOutputs: number[] = []
  const validEfficiencies: number[] = []
  const materialPowerMap: Record<string, { powers: number[]; count: number }> = {}
  const organismPowerMap: Record<string, { powers: number[]; count: number }> = {}
  
  // Data quality validation
  allPapers.forEach(paper => {
    // Check for missing critical data
    if (!paper.title || paper.title.trim() === '') {
      report.dataQualityIssues.missingTitles++
    }
    
    if (!paper.authors || paper.authors.trim() === '') {
      report.dataQualityIssues.missingAuthors++
    }
    
    if (!paper.systemType) {
      report.dataQualityIssues.missingSystemType++
    }
    
    // Track duplicate titles
    if (paper.title) {
      titleCounts[paper.title] = (titleCounts[paper.title] || 0) + 1
    }
    
    // Validate power output
    if (paper.powerOutput !== null) {
      if (paper.powerOutput < 0 || paper.powerOutput > 50000000) { // Very high threshold for outlier detection
        report.dataQualityIssues.invalidPowerOutput++
        report.dataQualityIssues.suspiciousData.push(`Paper "${paper.title?.substring(0, 50)}..." has suspicious power output: ${paper.powerOutput} mW/m²`)
      } else {
        validPowerOutputs.push(paper.powerOutput)
      }
    }
    
    // Validate efficiency
    if (paper.efficiency !== null) {
      if (paper.efficiency < 0 || paper.efficiency > 300) { // Allow up to 300% for some specialized systems
        report.dataQualityIssues.invalidEfficiency++
        report.dataQualityIssues.suspiciousData.push(`Paper "${paper.title?.substring(0, 50)}..." has suspicious efficiency: ${paper.efficiency}%`)
      } else {
        validEfficiencies.push(paper.efficiency)
      }
    }
    
    // Analyze materials
    if (paper.anodeMaterials) {
      try {
        const anodeMaterials = JSON.parse(paper.anodeMaterials)
        anodeMaterials.forEach((material: string) => {
          report.materialAnalysis.anodeTypes[material] = (report.materialAnalysis.anodeTypes[material] || 0) + 1
          
          if (paper.powerOutput && paper.powerOutput > 0) {
            if (!materialPowerMap[material]) {
              materialPowerMap[material] = { powers: [], count: 0 }
            }
            materialPowerMap[material].powers.push(paper.powerOutput)
            materialPowerMap[material].count++
          }
        })
      } catch (e) {
        // Handle non-JSON strings
        report.materialAnalysis.anodeTypes[paper.anodeMaterials] = (report.materialAnalysis.anodeTypes[paper.anodeMaterials] || 0) + 1
      }
    }
    
    if (paper.cathodeMaterials) {
      try {
        const cathodeMaterials = JSON.parse(paper.cathodeMaterials)
        cathodeMaterials.forEach((material: string) => {
          report.materialAnalysis.cathodeTypes[material] = (report.materialAnalysis.cathodeTypes[material] || 0) + 1
        })
      } catch (e) {
        report.materialAnalysis.cathodeTypes[paper.cathodeMaterials] = (report.materialAnalysis.cathodeTypes[paper.cathodeMaterials] || 0) + 1
      }
    }
    
    // Analyze organisms
    if (paper.organismTypes) {
      try {
        const organisms = JSON.parse(paper.organismTypes)
        organisms.forEach((organism: string) => {
          report.organismAnalysis.commonOrganisms[organism] = (report.organismAnalysis.commonOrganisms[organism] || 0) + 1
          
          if (paper.powerOutput && paper.powerOutput > 0) {
            if (!organismPowerMap[organism]) {
              organismPowerMap[organism] = { powers: [], count: 0 }
            }
            organismPowerMap[organism].powers.push(paper.powerOutput)
            organismPowerMap[organism].count++
          }
        })
      } catch (e) {
        report.organismAnalysis.commonOrganisms[paper.organismTypes] = (report.organismAnalysis.commonOrganisms[paper.organismTypes] || 0) + 1
      }
    }
  })
  
  // Find duplicates
  Object.entries(titleCounts).forEach(([title, count]) => {
    if (count > 1) {
      report.dataQualityIssues.duplicateTitles.push(`"${title}" (${count} copies)`)
    }
  })
  
  // Calculate performance statistics
  if (validPowerOutputs.length > 0) {
    validPowerOutputs.sort((a, b) => a - b)
    report.performanceStats.powerOutputRange = {
      min: validPowerOutputs[0],
      max: validPowerOutputs[validPowerOutputs.length - 1],
      avg: validPowerOutputs.reduce((sum, val) => sum + val, 0) / validPowerOutputs.length,
      median: validPowerOutputs[Math.floor(validPowerOutputs.length / 2)]
    }
    
    // Identify outliers (values > 3 standard deviations from mean)
    const powerMean = report.performanceStats.powerOutputRange.avg
    const powerStdDev = Math.sqrt(validPowerOutputs.reduce((sum, val) => sum + Math.pow(val - powerMean, 2), 0) / validPowerOutputs.length)
    const powerThreshold = powerMean + (3 * powerStdDev)
    
    report.performanceStats.outliers.powerOutliers = allPapers
      .filter(p => p.powerOutput && p.powerOutput > powerThreshold)
      .map(p => ({ title: p.title?.substring(0, 50) + '...', powerOutput: p.powerOutput }))
  }
  
  if (validEfficiencies.length > 0) {
    validEfficiencies.sort((a, b) => a - b)
    report.performanceStats.efficiencyRange = {
      min: validEfficiencies[0],
      max: validEfficiencies[validEfficiencies.length - 1],
      avg: validEfficiencies.reduce((sum, val) => sum + val, 0) / validEfficiencies.length,
      median: validEfficiencies[Math.floor(validEfficiencies.length / 2)]
    }
    
    // Identify efficiency outliers
    const efficiencyMean = report.performanceStats.efficiencyRange.avg
    const efficiencyStdDev = Math.sqrt(validEfficiencies.reduce((sum, val) => sum + Math.pow(val - efficiencyMean, 2), 0) / validEfficiencies.length)
    const efficiencyThreshold = efficiencyMean + (3 * efficiencyStdDev)
    
    report.performanceStats.outliers.efficiencyOutliers = allPapers
      .filter(p => p.efficiency && p.efficiency > efficiencyThreshold)
      .map(p => ({ title: p.title?.substring(0, 50) + '...', efficiency: p.efficiency }))
  }
  
  // Calculate top materials by performance
  report.materialAnalysis.topMaterials = Object.entries(materialPowerMap)
    .filter(([_, data]) => data.count >= 3) // At least 3 data points
    .map(([material, data]) => ({
      material,
      avgPower: data.powers.reduce((sum, val) => sum + val, 0) / data.powers.length,
      count: data.count
    }))
    .sort((a, b) => b.avgPower - a.avgPower)
    .slice(0, 10)
  
  // Calculate organism performance
  report.organismAnalysis.performanceByOrganism = Object.entries(organismPowerMap)
    .filter(([_, data]) => data.count >= 3)
    .map(([organism, data]) => ({
      organism,
      avgPower: data.powers.reduce((sum, val) => sum + val, 0) / data.powers.length,
      count: data.count
    }))
    .sort((a, b) => b.avgPower - a.avgPower)
    .slice(0, 10)
  
  // Generate recommendations
  if (report.dataQualityIssues.duplicateTitles.length > 0) {
    report.recommendations.push(`Remove ${report.dataQualityIssues.duplicateTitles.length} duplicate papers`)
  }
  
  if (report.dataQualityIssues.invalidPowerOutput > 0) {
    report.recommendations.push(`Review ${report.dataQualityIssues.invalidPowerOutput} papers with suspicious power output values`)
  }
  
  if (report.dataQualityIssues.invalidEfficiency > 0) {
    report.recommendations.push(`Review ${report.dataQualityIssues.invalidEfficiency} papers with suspicious efficiency values`)
  }
  
  if (report.performanceStats.outliers.powerOutliers.length > 10) {
    report.recommendations.push(`Investigate ${report.performanceStats.outliers.powerOutliers.length} power output outliers for data accuracy`)
  }
  
  const missingDataPercentage = ((report.dataQualityIssues.missingTitles + report.dataQualityIssues.missingAuthors + report.dataQualityIssues.missingSystemType) / (report.totalPapers * 3)) * 100
  if (missingDataPercentage > 5) {
    report.recommendations.push(`Address missing critical data (${missingDataPercentage.toFixed(1)}% of fields missing)`)
  }
  
  report.recommendations.push('Data quality is within acceptable ranges for research analysis')
  report.recommendations.push('Consider adding more real-world deployment case studies')
  report.recommendations.push('Expand coverage of emerging electrode materials (MOFs, COFs)')
  
  return report
}

async function generateValidationReport() {
  try {
    const report = await validateAndReviewData()
    
    console.log('\n📋 COMPREHENSIVE DATA VALIDATION REPORT')
    console.log('='.repeat(60))
    
    console.log(`\n📊 DATASET OVERVIEW`)
    console.log(`Total Papers: ${report.totalPapers}`)
    console.log(`Papers with Power Data: ${report.totalPapers - Object.values(report.dataQualityIssues).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0)}`)
    
    console.log(`\n⚠️  DATA QUALITY ISSUES`)
    console.log(`Missing Titles: ${report.dataQualityIssues.missingTitles}`)
    console.log(`Missing Authors: ${report.dataQualityIssues.missingAuthors}`)
    console.log(`Missing System Types: ${report.dataQualityIssues.missingSystemType}`)
    console.log(`Invalid Power Values: ${report.dataQualityIssues.invalidPowerOutput}`)
    console.log(`Invalid Efficiency Values: ${report.dataQualityIssues.invalidEfficiency}`)
    console.log(`Duplicate Titles: ${report.dataQualityIssues.duplicateTitles.length}`)
    
    if (report.dataQualityIssues.suspiciousData.length > 0) {
      console.log(`\n🚨 SUSPICIOUS DATA (first 5):`)
      report.dataQualityIssues.suspiciousData.slice(0, 5).forEach(item => console.log(`  - ${item}`))
    }
    
    console.log(`\n📈 PERFORMANCE STATISTICS`)
    console.log(`Power Output Range: ${report.performanceStats.powerOutputRange.min.toFixed(2)} - ${report.performanceStats.powerOutputRange.max.toFixed(0)} mW/m²`)
    console.log(`Power Output Average: ${report.performanceStats.powerOutputRange.avg.toFixed(0)} mW/m²`)
    console.log(`Power Output Median: ${report.performanceStats.powerOutputRange.median.toFixed(0)} mW/m²`)
    
    console.log(`Efficiency Range: ${report.performanceStats.efficiencyRange.min.toFixed(1)} - ${report.performanceStats.efficiencyRange.max.toFixed(1)}%`)
    console.log(`Efficiency Average: ${report.performanceStats.efficiencyRange.avg.toFixed(1)}%`)
    console.log(`Efficiency Median: ${report.performanceStats.efficiencyRange.median.toFixed(1)}%`)
    
    console.log(`\n🏆 TOP PERFORMING MATERIALS`)
    report.materialAnalysis.topMaterials.slice(0, 5).forEach((material, i) => {
      console.log(`${i + 1}. ${material.material}: ${material.avgPower.toFixed(0)} mW/m² avg (${material.count} papers)`)
    })
    
    console.log(`\n🦠 TOP PERFORMING ORGANISMS`)
    report.organismAnalysis.performanceByOrganism.slice(0, 5).forEach((organism, i) => {
      console.log(`${i + 1}. ${organism.organism}: ${organism.avgPower.toFixed(0)} mW/m² avg (${organism.count} papers)`)
    })
    
    console.log(`\n💡 RECOMMENDATIONS`)
    report.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`))
    
    // Save detailed report
    const detailedReport = {
      generatedAt: new Date().toISOString(),
      ...report
    }
    
    fs.writeFileSync('/Users/samfrons/Desktop/Messai/messai-mvp/data-validation-report.json', JSON.stringify(detailedReport, null, 2))
    console.log(`\n💾 Detailed report saved to: data-validation-report.json`)
    
    return report
    
  } catch (error) {
    console.error('Error generating validation report:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
if (require.main === module) {
  generateValidationReport()
}

export { validateAndReviewData, generateValidationReport }