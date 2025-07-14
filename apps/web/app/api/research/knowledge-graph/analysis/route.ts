import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { KnowledgeGraphService } from '@messai/database'

// GET /api/research/knowledge-graph/analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const analysisType = searchParams.get('type') || 'all'
    
    const graphService = new KnowledgeGraphService(prisma)
    const results: any = {}
    
    switch (analysisType) {
      case 'metrics':
        results.metrics = await graphService.getGraphMetrics()
        break
      
      case 'communities':
        results.communities = await prisma.researchCluster.findMany({
          orderBy: { avgImportance: 'desc' },
          take: 20
        })
        break
      
      case 'trends':
        results.trends = await prisma.researchTrend.findMany({
          orderBy: { trendScore: 'desc' },
          take: 20
        })
        break
      
      case 'importance':
        const nodeId = searchParams.get('nodeId')
        if (!nodeId) {
          return NextResponse.json(
            { error: 'nodeId required for importance analysis' },
            { status: 400 }
          )
        }
        results.importance = await graphService.calculateNodeImportance(nodeId)
        break
      
      case 'all':
      default:
        const [metrics, communities, trends] = await Promise.all([
          graphService.getGraphMetrics(),
          prisma.researchCluster.findMany({
            orderBy: { avgImportance: 'desc' },
            take: 10
          }),
          prisma.researchTrend.findMany({
            orderBy: { trendScore: 'desc' },
            take: 10
          })
        ])
        
        results.metrics = metrics
        results.communities = communities.map(c => ({
          ...c,
          memberNodes: JSON.parse(c.memberNodes),
          keywords: JSON.parse(c.keywords)
        }))
        results.trends = trends.map(t => ({
          ...t,
          keyAuthors: JSON.parse(t.keyAuthors),
          keyPapers: JSON.parse(t.keyPapers),
          predictions: t.predictions ? JSON.parse(t.predictions) : null
        }))
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Knowledge graph analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze knowledge graph' },
      { status: 500 }
    )
  }
}