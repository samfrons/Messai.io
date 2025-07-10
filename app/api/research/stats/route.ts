import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    console.log('Fetching research stats...')
    
    // Get basic counts in parallel
    const [
      totalPapers,
      withPowerOutput,
      withEfficiency,
      papers2024,
      aiEnhanced
    ] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({
        where: { powerOutput: { not: null } }
      }),
      prisma.researchPaper.count({
        where: { efficiency: { not: null } }
      }),
      prisma.researchPaper.count({
        where: {
          publicationDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        }
      }),
      prisma.researchPaper.count({
        where: {
          source: 'ai_smart_literature'
        }
      })
    ])
    
    console.log('Basic counts completed')
    
    // Get a smaller sample for materials/organisms analysis (performance optimization)
    const sampleSize = Math.min(1000, totalPapers)
    const samplePapers = await prisma.researchPaper.findMany({
      select: { anodeMaterials: true, cathodeMaterials: true, organismTypes: true, keywords: true },
      take: sampleSize,
      where: {
        OR: [
          { anodeMaterials: { not: null } },
          { cathodeMaterials: { not: null } },
          { organismTypes: { not: null } }
        ]
      }
    })
    
    console.log(`Analyzing ${samplePapers.length} sample papers for materials/organisms`)
    
    const uniqueMaterials = new Set<string>()
    const uniqueOrganisms = new Set<string>()
    const uniqueConcepts = new Set<string>()
    
    samplePapers.forEach(paper => {
      // Process materials
      if (paper.anodeMaterials) {
        try {
          const materials = JSON.parse(paper.anodeMaterials)
          if (Array.isArray(materials)) {
            materials.forEach(m => uniqueMaterials.add(m))
          } else {
            uniqueMaterials.add(paper.anodeMaterials)
          }
        } catch (e) {
          uniqueMaterials.add(paper.anodeMaterials)
        }
      }
      if (paper.cathodeMaterials) {
        try {
          const materials = JSON.parse(paper.cathodeMaterials)
          if (Array.isArray(materials)) {
            materials.forEach(m => uniqueMaterials.add(m))
          } else {
            uniqueMaterials.add(paper.cathodeMaterials)
          }
        } catch (e) {
          uniqueMaterials.add(paper.cathodeMaterials)
        }
      }
      
      // Process organisms
      if (paper.organismTypes) {
        try {
          const organisms = JSON.parse(paper.organismTypes)
          if (Array.isArray(organisms)) {
            organisms.forEach(o => uniqueOrganisms.add(o))
          } else {
            uniqueOrganisms.add(paper.organismTypes)
          }
        } catch (e) {
          uniqueOrganisms.add(paper.organismTypes)
        }
      }
      
      // Process concepts from keywords
      if (paper.keywords) {
        try {
          const keywords = JSON.parse(paper.keywords)
          if (Array.isArray(keywords)) {
            keywords.forEach(keyword => {
              if (typeof keyword === 'string' && keyword.length > 3) {
                uniqueConcepts.add(keyword)
              }
            })
          }
        } catch (e) {
          // Handle non-JSON keywords
        }
      }
    })
    
    // Extrapolate counts based on sample
    const extrapolationFactor = totalPapers / sampleSize
    const estimatedMaterials = Math.round(uniqueMaterials.size * extrapolationFactor)
    const estimatedOrganisms = Math.round(uniqueOrganisms.size * extrapolationFactor)
    const estimatedConcepts = Math.round(uniqueConcepts.size * extrapolationFactor)
    
    console.log('Materials/organisms analysis completed')
    
    // Get basic system types and sources
    const [systemTypes, sources] = await Promise.all([
      prisma.researchPaper.groupBy({
        by: ['systemType'],
        _count: { systemType: true },
        where: { systemType: { not: null } },
        orderBy: { _count: { systemType: 'desc' } },
        take: 10
      }),
      prisma.researchPaper.groupBy({
        by: ['source'],
        _count: { source: true },
        orderBy: { _count: { source: 'desc' } }
      })
    ])
    
    console.log('System types and sources analysis completed')
    
    // Calculate estimates
    const knowledgeNodes = estimatedMaterials + estimatedOrganisms + Math.round(estimatedConcepts * 0.3) // Major concepts only
    const smartConnections = Math.floor(totalPapers * 0.8) // Assuming 80% of papers have connections
    
    const stats = {
      totalPapers,
      aiEnhanced,
      uniqueMaterials: estimatedMaterials,
      uniqueOrganisms: estimatedOrganisms,
      withPowerOutput,
      withEfficiency,
      papers2024,
      knowledgeNodes,
      smartConnections,
      systemTypes: systemTypes.map(type => ({
        type: type.systemType,
        count: type._count.systemType
      })),
      sources: sources.map(source => ({
        source: source.source,
        count: source._count.source
      }))
    }
    
    console.log('Stats compilation completed:', {
      totalPapers,
      aiEnhanced,
      uniqueMaterials: estimatedMaterials,
      uniqueOrganisms: estimatedOrganisms,
      withPowerOutput,
      withEfficiency,
      papers2024
    })
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching research stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch research statistics' },
      { status: 500 }
    )
  }
}