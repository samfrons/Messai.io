import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple semantic search implementation
function calculateSemanticSimilarity(query: string, paper: any): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const paperText = [
    paper.title || '',
    paper.abstract || '',
    paper.keywords || '',
    paper.anodeMaterials || '',
    paper.cathodeMaterials || '',
    paper.organismTypes || ''
  ].join(' ').toLowerCase()

  let similarity = 0
  let matches = 0

  queryWords.forEach(word => {
    if (paperText.includes(word)) {
      matches++
      // Boost score for exact matches in title
      if (paper.title?.toLowerCase().includes(word)) similarity += 2
      else similarity += 1
    }
    
    // Semantic relationships
    const semanticBoosts = {
      'performance': ['power', 'efficiency', 'output'],
      'material': ['electrode', 'anode', 'cathode', 'graphene', 'mxene'],
      'organism': ['bacteria', 'biofilm', 'microbial'],
      'high': ['superior', 'enhanced', 'improved', 'advanced'],
      'energy': ['power', 'electricity', 'voltage'],
      'efficiency': ['performance', 'effectiveness', 'optimization']
    }
    
    Object.entries(semanticBoosts).forEach(([key, synonyms]) => {
      if (word.includes(key) && synonyms.some(syn => paperText.includes(syn))) {
        similarity += 0.5
      }
    })
  })

  return matches / queryWords.length + similarity * 0.05
}

function detectQueryIntent(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('performance') || lowerQuery.includes('power') || lowerQuery.includes('efficiency')) {
    return 'performance_search'
  }
  if (lowerQuery.includes('material') || lowerQuery.includes('electrode') || lowerQuery.includes('graphene') || lowerQuery.includes('mxene')) {
    return 'material_discovery'
  }
  if (lowerQuery.includes('bacteria') || lowerQuery.includes('organism') || lowerQuery.includes('biofilm')) {
    return 'organism_analysis'
  }
  if (lowerQuery.includes('trend') || lowerQuery.includes('future') || lowerQuery.includes('development')) {
    return 'trend_analysis'
  }
  
  return 'general_search'
}

function extractEntities(query: string, papers: any[]): string[] {
  const entities: string[] = []
  const lowerQuery = query.toLowerCase()
  
  // Extract material entities
  const materials = ['graphene', 'mxene', 'carbon', 'platinum', 'gold', 'silver', 'titanium']
  materials.forEach(material => {
    if (lowerQuery.includes(material)) entities.push(material)
  })
  
  // Extract organism entities
  const organisms = ['geobacter', 'shewanella', 'bacteria', 'biofilm', 'microbe']
  organisms.forEach(organism => {
    if (lowerQuery.includes(organism)) entities.push(organism)
  })
  
  return entities
}

function generateExplanation(query: string, paper: any, entities: string[]): string {
  const reasons = []
  
  if (paper.title?.toLowerCase().includes(query.toLowerCase())) {
    reasons.push('direct title match')
  }
  
  if (entities.some(entity => paper.title?.toLowerCase().includes(entity.toLowerCase()))) {
    reasons.push('entity match')
  }
  
  if (paper.keywords && entities.some(entity => paper.keywords.includes(entity))) {
    reasons.push('keyword relevance')
  }
  
  if (paper.powerOutput && query.toLowerCase().includes('performance')) {
    reasons.push('performance metrics')
  }
  
  return `Matched through: ${reasons.join(', ') || 'semantic similarity'}`
}

function generateRelatedConcepts(paper: any): string[] {
  const concepts: string[] = []
  
  if (paper.anodeMaterials) {
    try {
      const materials = JSON.parse(paper.anodeMaterials)
      concepts.push(...materials.slice(0, 3))
    } catch (e) {
      concepts.push(paper.anodeMaterials)
    }
  }
  
  if (paper.organismTypes) {
    try {
      const organisms = JSON.parse(paper.organismTypes)
      concepts.push(...organisms.slice(0, 2))
    } catch (e) {
      concepts.push(paper.organismTypes)
    }
  }
  
  if (paper.systemType) concepts.push(paper.systemType)
  
  return concepts.filter(Boolean).slice(0, 5)
}

function generateSuggestedQueries(query: string, entities: string[]): string[] {
  const suggestions = []
  
  if (entities.length > 0) {
    suggestions.push(`${entities[0]} performance optimization`)
    suggestions.push(`materials similar to ${entities[0]}`)
  }
  
  suggestions.push('high efficiency bioelectrochemical systems')
  suggestions.push('recent advances in electrode materials')
  
  return suggestions.slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10 } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get papers from database
    const papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true
      }
    })

    // Perform semantic search
    const queryIntent = detectQueryIntent(query)
    const entities = extractEntities(query, papers)
    
    const results = papers
      .map(paper => {
        const relevanceScore = calculateSemanticSimilarity(query, paper)
        
        if (relevanceScore > 0.1) { // Minimum relevance threshold
          return {
            relevanceScore,
            paper: {
              id: paper.id,
              title: paper.title,
              authors: paper.authors,
              abstract: paper.abstract,
              systemType: paper.systemType,
              powerOutput: paper.powerOutput,
              efficiency: paper.efficiency
            },
            explanation: generateExplanation(query, paper, entities),
            relatedConcepts: generateRelatedConcepts(paper),
            suggestedQueries: generateSuggestedQueries(query, entities)
          }
        }
        
        return null
      })
      .filter(Boolean)
      .sort((a, b) => b!.relevanceScore - a!.relevanceScore)
      .slice(0, limit)

    return NextResponse.json({
      results,
      queryIntent,
      entities,
      totalResults: results.length
    })

  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}