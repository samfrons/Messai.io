import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface InsightData {
  id: string
  type: 'performance' | 'material' | 'organism' | 'trend' | 'correlation'
  title: string
  description: string
  value: number | string
  confidence: 'high' | 'medium' | 'low'
  papers: Array<{
    id: string
    title: string
    powerOutput?: number
    efficiency?: number
    systemType?: string
  }>
  tags: string[]
}

export async function GET() {
  try {
    // Fetch all papers with performance data
    const papers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { powerOutput: { not: null } },
          { efficiency: { not: null } },
          { systemType: { not: null } },
          { anodeMaterials: { not: null } },
          { cathodeMaterials: { not: null } },
          { organismTypes: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        powerOutput: true,
        efficiency: true,
        systemType: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        publicationDate: true,
        journal: true,
        source: true
      }
    })

    const insights: InsightData[] = []

    // 1. Top performing systems
    const topPerformers = papers
      .filter(p => p.powerOutput && p.powerOutput > 1000)
      .sort((a, b) => (b.powerOutput || 0) - (a.powerOutput || 0))
      .slice(0, 5)

    if (topPerformers.length > 0) {
      insights.push({
        id: 'top-performers',
        type: 'performance',
        title: 'Ultra-High Performance Systems',
        description: `${topPerformers.length} systems achieving >1000 mW/m². The highest performer reaches ${topPerformers[0].powerOutput?.toLocaleString()} mW/m².`,
        value: topPerformers[0].powerOutput || 0,
        confidence: 'high',
        papers: topPerformers.map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['high-performance', 'breakthrough', 'power-density']
      })
    }

    // 2. Material performance correlation
    const materialPapers = papers.filter(p => p.anodeMaterials && p.powerOutput)
    const materialPerformance: Record<string, { totalPower: number, count: number, papers: typeof papers }> = {}

    materialPapers.forEach(paper => {
      try {
        const materials = JSON.parse(paper.anodeMaterials || '[]')
        materials.forEach((material: string) => {
          if (!materialPerformance[material]) {
            materialPerformance[material] = { totalPower: 0, count: 0, papers: [] }
          }
          materialPerformance[material].totalPower += paper.powerOutput || 0
          materialPerformance[material].count += 1
          materialPerformance[material].papers.push(paper)
        })
      } catch {}
    })

    const topMaterials = Object.entries(materialPerformance)
      .filter(([_, data]) => data.count >= 2)
      .map(([material, data]) => ({
        material,
        avgPower: data.totalPower / data.count,
        count: data.count,
        papers: data.papers
      }))
      .sort((a, b) => b.avgPower - a.avgPower)
      .slice(0, 3)

    if (topMaterials.length > 0) {
      insights.push({
        id: 'material-performance',
        type: 'material',
        title: 'High-Performance Electrode Materials',
        description: `${topMaterials[0].material} shows exceptional performance with average ${Math.round(topMaterials[0].avgPower)} mW/m² across ${topMaterials[0].count} studies.`,
        value: Math.round(topMaterials[0].avgPower),
        confidence: 'high',
        papers: topMaterials[0].papers.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['materials', 'electrodes', 'performance-correlation']
      })
    }

    // 3. Organism efficiency analysis
    const organismPapers = papers.filter(p => p.organismTypes && (p.powerOutput || p.efficiency))
    const organismPerformance: Record<string, { powers: number[], efficiencies: number[], papers: typeof papers }> = {}

    organismPapers.forEach(paper => {
      try {
        const organisms = JSON.parse(paper.organismTypes || '[]')
        organisms.forEach((organism: string) => {
          if (!organismPerformance[organism]) {
            organismPerformance[organism] = { powers: [], efficiencies: [], papers: [] }
          }
          if (paper.powerOutput) organismPerformance[organism].powers.push(paper.powerOutput)
          if (paper.efficiency) organismPerformance[organism].efficiencies.push(paper.efficiency)
          organismPerformance[organism].papers.push(paper)
        })
      } catch {}
    })

    const topOrganisms = Object.entries(organismPerformance)
      .filter(([_, data]) => data.powers.length >= 2 || data.efficiencies.length >= 2)
      .map(([organism, data]) => ({
        organism,
        avgPower: data.powers.length > 0 ? data.powers.reduce((a, b) => a + b, 0) / data.powers.length : 0,
        avgEfficiency: data.efficiencies.length > 0 ? data.efficiencies.reduce((a, b) => a + b, 0) / data.efficiencies.length : 0,
        count: data.papers.length,
        papers: data.papers
      }))
      .sort((a, b) => b.avgPower - a.avgPower)
      .slice(0, 3)

    if (topOrganisms.length > 0) {
      insights.push({
        id: 'organism-performance',
        type: 'organism',
        title: 'Most Effective Microorganisms',
        description: `${topOrganisms[0].organism} demonstrates superior performance with average ${Math.round(topOrganisms[0].avgPower)} mW/m² across ${topOrganisms[0].count} studies.`,
        value: topOrganisms[0].organism,
        confidence: 'high',
        papers: topOrganisms[0].papers.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          efficiency: p.efficiency || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['microorganisms', 'biocatalysts', 'performance']
      })
    }

    // 4. Recent breakthrough trend
    const recentPapers = papers
      .filter(p => p.publicationDate && new Date(p.publicationDate).getFullYear() >= 2023)
      .filter(p => p.powerOutput && p.powerOutput > 10000)

    if (recentPapers.length > 0) {
      insights.push({
        id: 'recent-breakthroughs',
        type: 'trend',
        title: 'Recent High-Impact Breakthroughs',
        description: `${recentPapers.length} papers from 2023-2024 report power densities >10 W/m², indicating rapid field advancement.`,
        value: recentPapers.length,
        confidence: 'high',
        papers: recentPapers.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['recent', 'breakthrough', '2023-2024', 'advancement']
      })
    }

    // 5. System type comparison
    const systemStats = papers.reduce((acc, paper) => {
      if (paper.systemType && paper.powerOutput) {
        if (!acc[paper.systemType]) {
          acc[paper.systemType] = { powers: [], papers: [] }
        }
        acc[paper.systemType].powers.push(paper.powerOutput)
        acc[paper.systemType].papers.push(paper)
      }
      return acc
    }, {} as Record<string, { powers: number[], papers: typeof papers }>)

    const systemComparison = Object.entries(systemStats)
      .filter(([_, data]) => data.powers.length >= 2)
      .map(([type, data]) => ({
        type,
        avgPower: data.powers.reduce((a, b) => a + b, 0) / data.powers.length,
        maxPower: Math.max(...data.powers),
        count: data.powers.length,
        papers: data.papers
      }))
      .sort((a, b) => b.avgPower - a.avgPower)

    if (systemComparison.length > 1) {
      const topSystem = systemComparison[0]
      insights.push({
        id: 'system-comparison',
        type: 'correlation',
        title: 'System Type Performance Ranking',
        description: `${topSystem.type} systems show highest average performance at ${Math.round(topSystem.avgPower)} mW/m² across ${topSystem.count} studies.`,
        value: topSystem.type,
        confidence: 'medium',
        papers: topSystem.papers.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['system-comparison', 'performance-ranking']
      })
    }

    // 6. Hidden gem: Underreported high performers
    const hiddenGems = papers
      .filter(p => p.powerOutput && p.powerOutput > 5000 && p.source !== 'web_search')
      .filter(p => !p.title.toLowerCase().includes('record') && !p.title.toLowerCase().includes('high'))

    if (hiddenGems.length > 0) {
      insights.push({
        id: 'hidden-gems',
        type: 'performance',
        title: 'Hidden High Performers',
        description: `${hiddenGems.length} studies report exceptional performance (>5 W/m²) without explicit claims in titles, suggesting undervalued discoveries.`,
        value: hiddenGems.length,
        confidence: 'medium',
        papers: hiddenGems.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['hidden-gems', 'underreported', 'high-performance']
      })
    }

    // 7. Conference vs. journal performance
    const conferenceSource = papers.filter(p => p.source === 'ismet_conference' && p.powerOutput)
    const otherSources = papers.filter(p => p.source !== 'ismet_conference' && p.powerOutput)

    if (conferenceSource.length > 0 && otherSources.length > 0) {
      const confAvg = conferenceSource.reduce((sum, p) => sum + (p.powerOutput || 0), 0) / conferenceSource.length
      const otherAvg = otherSources.reduce((sum, p) => sum + (p.powerOutput || 0), 0) / otherSources.length

      insights.push({
        id: 'conference-analysis',
        type: 'correlation',
        title: 'ISMET Conference Research Quality',
        description: `ISMET conference papers show ${confAvg > otherAvg ? 'higher' : 'comparable'} average performance (${Math.round(confAvg)} vs ${Math.round(otherAvg)} mW/m²).`,
        value: Math.round(confAvg),
        confidence: 'medium',
        papers: conferenceSource.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          powerOutput: p.powerOutput || undefined,
          systemType: p.systemType || undefined
        })),
        tags: ['ismet', 'conference', 'quality-analysis']
      })
    }

    return NextResponse.json({
      insights,
      summary: {
        totalPapers: papers.length,
        insightsGenerated: insights.length,
        coverageTypes: [...new Set(insights.map(i => i.type))],
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}