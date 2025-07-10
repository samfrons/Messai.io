import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface PerformanceStats {
  systemType: string
  count: number
  powerOutput: {
    min?: number
    max?: number
    avg?: number
    values: number[]
  }
  efficiency: {
    min?: number
    max?: number
    avg?: number
    values: number[]
  }
  materials: {
    anode: string[]
    cathode: string[]
  }
  organisms: string[]
}

async function analyzePerformanceBenchmarks() {
  try {
    // Fetch all papers with performance data
    const papers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { powerOutput: { not: null } },
          { efficiency: { not: null } },
          { systemType: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        organismTypes: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        publicationDate: true
      }
    })
    
    console.log(`Found ${papers.length} papers with performance data\n`)
    
    // Group by system type
    const performanceByType: Record<string, PerformanceStats> = {}
    
    papers.forEach(paper => {
      const type = paper.systemType || 'Unknown'
      
      if (!performanceByType[type]) {
        performanceByType[type] = {
          systemType: type,
          count: 0,
          powerOutput: { values: [] },
          efficiency: { values: [] },
          materials: { anode: [], cathode: [] },
          organisms: []
        }
      }
      
      const stats = performanceByType[type]
      stats.count++
      
      if (paper.powerOutput) {
        stats.powerOutput.values.push(paper.powerOutput)
      }
      
      if (paper.efficiency) {
        stats.efficiency.values.push(paper.efficiency)
      }
      
      // Collect materials
      if (paper.anodeMaterials) {
        try {
          const materials = JSON.parse(paper.anodeMaterials)
          if (Array.isArray(materials)) {
            stats.materials.anode.push(...materials)
          }
        } catch {}
      }
      
      if (paper.cathodeMaterials) {
        try {
          const materials = JSON.parse(paper.cathodeMaterials)
          if (Array.isArray(materials)) {
            stats.materials.cathode.push(...materials)
          }
        } catch {}
      }
      
      // Collect organisms
      if (paper.organismTypes) {
        try {
          const organisms = JSON.parse(paper.organismTypes)
          if (Array.isArray(organisms)) {
            stats.organisms.push(...organisms)
          }
        } catch {}
      }
    })
    
    // Calculate statistics and generate report
    let report = '# Microbial Electrochemical Systems Performance Benchmarks\n\n'
    report += `Generated from ${papers.length} research papers\n\n`
    
    // Overall statistics
    const allPowerOutputs = papers
      .filter(p => p.powerOutput)
      .map(p => p.powerOutput!)
      .sort((a, b) => a - b)
    
    const allEfficiencies = papers
      .filter(p => p.efficiency)
      .map(p => p.efficiency!)
      .sort((a, b) => a - b)
    
    if (allPowerOutputs.length > 0) {
      report += '## Overall Performance Ranges\n\n'
      report += `### Power Output (mW/m²)\n`
      report += `- Minimum: ${Math.min(...allPowerOutputs).toFixed(2)}\n`
      report += `- Maximum: ${Math.max(...allPowerOutputs).toFixed(2)}\n`
      report += `- Average: ${(allPowerOutputs.reduce((a, b) => a + b, 0) / allPowerOutputs.length).toFixed(2)}\n`
      report += `- Median: ${allPowerOutputs[Math.floor(allPowerOutputs.length / 2)].toFixed(2)}\n\n`
    }
    
    if (allEfficiencies.length > 0) {
      report += `### Efficiency (%)\n`
      report += `- Minimum: ${Math.min(...allEfficiencies).toFixed(1)}\n`
      report += `- Maximum: ${Math.max(...allEfficiencies).toFixed(1)}\n`
      report += `- Average: ${(allEfficiencies.reduce((a, b) => a + b, 0) / allEfficiencies.length).toFixed(1)}\n\n`
    }
    
    // Performance by system type
    report += '## Performance by System Type\n\n'
    
    Object.entries(performanceByType).forEach(([type, stats]) => {
      report += `### ${type} (${stats.count} papers)\n\n`
      
      // Power output stats
      if (stats.powerOutput.values.length > 0) {
        const sorted = stats.powerOutput.values.sort((a, b) => a - b)
        report += `**Power Output (mW/m²):**\n`
        report += `- Range: ${sorted[0].toFixed(2)} - ${sorted[sorted.length - 1].toFixed(2)}\n`
        report += `- Average: ${(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2)}\n`
        report += `- Papers with data: ${sorted.length}\n\n`
      }
      
      // Efficiency stats
      if (stats.efficiency.values.length > 0) {
        const sorted = stats.efficiency.values.sort((a, b) => a - b)
        report += `**Efficiency (%):**\n`
        report += `- Range: ${sorted[0].toFixed(1)} - ${sorted[sorted.length - 1].toFixed(1)}\n`
        report += `- Average: ${(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(1)}\n`
        report += `- Papers with data: ${sorted.length}\n\n`
      }
      
      // Top materials
      const topAnodeMaterials = getTopItems(stats.materials.anode, 5)
      const topCathodeMaterials = getTopItems(stats.materials.cathode, 5)
      const topOrganisms = getTopItems(stats.organisms, 5)
      
      if (topAnodeMaterials.length > 0) {
        report += `**Common Anode Materials:**\n`
        topAnodeMaterials.forEach(([material, count]) => {
          report += `- ${material} (${count} mentions)\n`
        })
        report += '\n'
      }
      
      if (topCathodeMaterials.length > 0) {
        report += `**Common Cathode Materials:**\n`
        topCathodeMaterials.forEach(([material, count]) => {
          report += `- ${material} (${count} mentions)\n`
        })
        report += '\n'
      }
      
      if (topOrganisms.length > 0) {
        report += `**Common Organisms:**\n`
        topOrganisms.forEach(([organism, count]) => {
          report += `- ${organism} (${count} mentions)\n`
        })
        report += '\n'
      }
      
      report += '---\n\n'
    })
    
    // High performers
    const highPerformers = papers
      .filter(p => p.powerOutput && p.powerOutput > 100)
      .sort((a, b) => b.powerOutput! - a.powerOutput!)
      .slice(0, 10)
    
    if (highPerformers.length > 0) {
      report += '## Top Performing Systems by Power Output\n\n'
      highPerformers.forEach((paper, index) => {
        report += `${index + 1}. **${paper.title}**\n`
        report += `   - Power Output: ${paper.powerOutput} mW/m²\n`
        if (paper.efficiency) report += `   - Efficiency: ${paper.efficiency}%\n`
        if (paper.systemType) report += `   - System Type: ${paper.systemType}\n`
        report += '\n'
      })
    }
    
    // Save report
    const reportPath = path.join(process.cwd(), 'performance-benchmarks-report.md')
    await fs.writeFile(reportPath, report)
    console.log(`Report saved to: ${reportPath}`)
    
    // Also create a JSON file with raw data
    const jsonData = {
      summary: {
        totalPapers: papers.length,
        papersWithPowerData: allPowerOutputs.length,
        papersWithEfficiencyData: allEfficiencies.length,
        powerOutputRange: allPowerOutputs.length > 0 ? {
          min: Math.min(...allPowerOutputs),
          max: Math.max(...allPowerOutputs),
          avg: allPowerOutputs.reduce((a, b) => a + b, 0) / allPowerOutputs.length
        } : null,
        efficiencyRange: allEfficiencies.length > 0 ? {
          min: Math.min(...allEfficiencies),
          max: Math.max(...allEfficiencies),
          avg: allEfficiencies.reduce((a, b) => a + b, 0) / allEfficiencies.length
        } : null
      },
      bySystemType: performanceByType,
      topPerformers: highPerformers.map(p => ({
        id: p.id,
        title: p.title,
        powerOutput: p.powerOutput,
        efficiency: p.efficiency,
        systemType: p.systemType
      }))
    }
    
    const jsonPath = path.join(process.cwd(), 'performance-benchmarks-data.json')
    await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2))
    console.log(`JSON data saved to: ${jsonPath}`)
    
  } catch (error) {
    console.error('Error analyzing performance benchmarks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getTopItems(items: string[], count: number): Array<[string, number]> {
  const frequency: Record<string, number> = {}
  
  items.forEach(item => {
    if (item && item.trim()) {
      frequency[item] = (frequency[item] || 0) + 1
    }
  })
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
}

// Run if called directly
if (require.main === module) {
  analyzePerformanceBenchmarks()
}

export { analyzePerformanceBenchmarks }