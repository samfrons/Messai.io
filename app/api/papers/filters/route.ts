import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

// GET /api/papers/filters - Get available filter options
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Build base where clause respecting authentication
    const where: any = {}
    
    if (session?.user?.id) {
      // Authenticated users see public papers + their own papers
      where.OR = [
        { isPublic: true },
        { uploadedBy: session.user.id }
      ]
    } else {
      // Unauthenticated users see only public papers
      where.isPublic = true
    }
    
    // Also filter for verified papers only
    if (!where.AND) {
      where.AND = []
    } else if (!Array.isArray(where.AND)) {
      where.AND = [where.AND]
    }
    
    where.AND.push({
      OR: [
        { doi: { not: null } },
        { pubmedId: { not: null } },
        { arxivId: { not: null } }
      ]
    })

    // Get all unique values for filters
    const papers = await prisma.researchPaper.findMany({
      where,
      select: {
        systemType: true,
        microbialCommunity: true,
        microbialClassification: true,
        systemConfiguration: true,
        organismTypes: true,
        powerOutput: true,
        efficiency: true
      }
    })

    // Process filter options
    const filterOptions = {
      microbes: new Set<string>(),
      systemTypes: new Set<string>(),
      configurations: {
        subtypes: new Set<string>(),
        scales: new Set<string>(),
        architectures: new Set<string>()
      },
      performanceRanges: {
        powerOutput: { min: Infinity, max: -Infinity },
        efficiency: { min: Infinity, max: -Infinity }
      },
      stats: {
        totalPapers: papers.length,
        withMicrobeData: 0,
        withSystemConfig: 0,
        withPerformanceData: 0
      }
    }

    // Extract microbes from multiple sources
    for (const paper of papers) {
      // From microbialCommunity
      if (paper.microbialCommunity) {
        try {
          const community = JSON.parse(paper.microbialCommunity)
          if (community.dominant) {
            community.dominant.forEach((m: string) => filterOptions.microbes.add(m))
          }
          if (community.consortium) {
            community.consortium.forEach((m: string) => filterOptions.microbes.add(m))
          }
          filterOptions.stats.withMicrobeData++
        } catch {}
      }

      // From microbialClassification
      if (paper.microbialClassification) {
        try {
          const classification = JSON.parse(paper.microbialClassification)
          if (classification.genus) {
            classification.genus.forEach((g: string) => filterOptions.microbes.add(g))
          }
          if (classification.species) {
            classification.species.forEach((s: string) => {
              if (s.includes(' ')) filterOptions.microbes.add(s) // Full species names
            })
          }
        } catch {}
      }

      // From organismTypes (legacy field)
      if (paper.organismTypes) {
        try {
          const organisms = JSON.parse(paper.organismTypes)
          if (Array.isArray(organisms)) {
            organisms.forEach((o: string) => filterOptions.microbes.add(o))
          }
        } catch {}
      }

      // System types
      if (paper.systemType) {
        filterOptions.systemTypes.add(paper.systemType)
      }

      // System configuration
      if (paper.systemConfiguration) {
        try {
          const config = JSON.parse(paper.systemConfiguration)
          if (config.type) filterOptions.systemTypes.add(config.type)
          if (config.subtype) filterOptions.configurations.subtypes.add(config.subtype)
          if (config.scale) filterOptions.configurations.scales.add(config.scale)
          if (config.architecture) filterOptions.configurations.architectures.add(config.architecture)
          filterOptions.stats.withSystemConfig++
        } catch {}
      }

      // Performance ranges
      if (paper.powerOutput !== null) {
        filterOptions.performanceRanges.powerOutput.min = Math.min(filterOptions.performanceRanges.powerOutput.min, paper.powerOutput)
        filterOptions.performanceRanges.powerOutput.max = Math.max(filterOptions.performanceRanges.powerOutput.max, paper.powerOutput)
        filterOptions.stats.withPerformanceData++
      }

      if (paper.efficiency !== null) {
        filterOptions.performanceRanges.efficiency.min = Math.min(filterOptions.performanceRanges.efficiency.min, paper.efficiency)
        filterOptions.performanceRanges.efficiency.max = Math.max(filterOptions.performanceRanges.efficiency.max, paper.efficiency)
      }
    }

    // Convert sets to sorted arrays and clean up
    const response = {
      microbes: Array.from(filterOptions.microbes)
        .filter(m => m && m.length > 2)
        .sort()
        .slice(0, 50), // Top 50 microbes

      systemTypes: Array.from(filterOptions.systemTypes).sort(),

      configurations: {
        subtypes: Array.from(filterOptions.configurations.subtypes).sort(),
        scales: Array.from(filterOptions.configurations.scales).sort(),
        architectures: Array.from(filterOptions.configurations.architectures).sort()
      },

      performanceRanges: {
        powerOutput: {
          min: filterOptions.performanceRanges.powerOutput.min === Infinity ? 0 : filterOptions.performanceRanges.powerOutput.min,
          max: filterOptions.performanceRanges.powerOutput.max === -Infinity ? 10000 : filterOptions.performanceRanges.powerOutput.max,
          unit: 'mW/m²'
        },
        efficiency: {
          min: filterOptions.performanceRanges.efficiency.min === Infinity ? 0 : filterOptions.performanceRanges.efficiency.min,
          max: filterOptions.performanceRanges.efficiency.max === -Infinity ? 100 : filterOptions.performanceRanges.efficiency.max,
          unit: '%'
        }
      },

      stats: filterOptions.stats,

      // Predefined filter suggestions
      suggestions: {
        commonMicrobes: ['Geobacter', 'Shewanella', 'Pseudomonas', 'E. coli', 'Mixed culture'],
        performanceTiers: [
          { label: 'High Power (>1000 mW/m²)', minPower: 1000 },
          { label: 'Medium Power (100-1000 mW/m²)', minPower: 100, maxPower: 1000 },
          { label: 'Low Power (<100 mW/m²)', maxPower: 100 }
        ],
        efficiencyTiers: [
          { label: 'High Efficiency (>80%)', minEfficiency: 80 },
          { label: 'Medium Efficiency (50-80%)', minEfficiency: 50, maxEfficiency: 80 },
          { label: 'Low Efficiency (<50%)', maxEfficiency: 50 }
        ]
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}