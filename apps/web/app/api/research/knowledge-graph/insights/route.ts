import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { KnowledgeGraphAlgorithms } from '@/lib/knowledge-graph-algorithms'

// GET /api/research/knowledge-graph/insights
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const insightType = searchParams.get('type') || 'all'
    
    // Fetch graph data
    const [nodes, edges, papers] = await Promise.all([
      prisma.knowledgeNode.findMany({
        take: 1000, // Limit for performance
        orderBy: { importance: 'desc' }
      }),
      prisma.knowledgeEdge.findMany({
        take: 5000, // Limit for performance
        orderBy: { weight: 'desc' }
      }),
      prisma.researchPaper.findMany({
        select: {
          id: true,
          title: true,
          powerOutput: true,
          efficiency: true,
          publicationDate: true
        },
        take: 500
      })
    ])
    
    // Parse properties for nodes
    const parsedNodes = nodes.map(node => ({
      ...node,
      properties: node.properties ? JSON.parse(node.properties) : null
    }))
    
    const results: any = {}
    
    switch (insightType) {
      case 'citations':
        results.citationPatterns = Array.from(
          KnowledgeGraphAlgorithms.analyzeCitationPatterns(papers, edges).values()
        ).map(pattern => ({
          ...pattern,
          cocitationStrength: Array.from(pattern.cocitationStrength.entries())
            .map(([key, value]) => ({ pair: key, strength: value }))
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 10)
        }))
        break
      
      case 'communities':
        const communities = KnowledgeGraphAlgorithms.findResearchCommunities(parsedNodes, edges)
        results.communities = Array.from(communities.entries())
          .map(([label, members]) => ({
            id: label,
            size: members.length,
            members: members.slice(0, 20), // Limit members shown
            topics: parsedNodes
              .filter(n => members.includes(n.id) && n.type === 'topic')
              .map(n => n.name)
              .slice(0, 10)
          }))
          .filter(c => c.size > 2) // Only show communities with 3+ members
          .sort((a, b) => b.size - a.size)
          .slice(0, 20)
        break
      
      case 'impact':
        const impactScores = KnowledgeGraphAlgorithms.calculateImpactScores(
          parsedNodes,
          edges,
          papers
        )
        results.impactScores = Array.from(impactScores.entries())
          .map(([nodeId, score]) => {
            const node = parsedNodes.find(n => n.id === nodeId)
            return {
              id: nodeId,
              name: node?.name || 'Unknown',
              type: node?.type || 'unknown',
              score
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 50)
        break
      
      case 'gaps':
        results.researchGaps = KnowledgeGraphAlgorithms.identifyResearchGaps(
          parsedNodes,
          edges
        )
        break
      
      case 'collaborations':
        results.predictedCollaborations = KnowledgeGraphAlgorithms.predictCollaborations(
          parsedNodes,
          edges
        )
        break
      
      case 'all':
      default:
        // Run all analyses
        const [citations, comms, impact, gaps, collabs] = await Promise.all([
          Promise.resolve(KnowledgeGraphAlgorithms.analyzeCitationPatterns(papers, edges)),
          Promise.resolve(KnowledgeGraphAlgorithms.findResearchCommunities(parsedNodes, edges)),
          Promise.resolve(KnowledgeGraphAlgorithms.calculateImpactScores(parsedNodes, edges, papers)),
          Promise.resolve(KnowledgeGraphAlgorithms.identifyResearchGaps(parsedNodes, edges)),
          Promise.resolve(KnowledgeGraphAlgorithms.predictCollaborations(parsedNodes, edges))
        ])
        
        results.summary = {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          totalPapers: papers.length,
          communitiesFound: comms.size,
          topImpactMaterials: Array.from(impact.entries())
            .filter(([nodeId]) => parsedNodes.find(n => n.id === nodeId)?.type === 'material')
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([nodeId, score]) => ({
              name: parsedNodes.find(n => n.id === nodeId)?.name || 'Unknown',
              score
            })),
          researchGapsSummary: {
            underexploredCombinations: gaps.underexploredCombinations.length,
            emergingTopics: gaps.emergingTopics.slice(0, 5),
            isolatedNodes: gaps.isolatedNodes.length
          },
          predictedCollaborations: collabs.slice(0, 5)
        }
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Knowledge graph insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}