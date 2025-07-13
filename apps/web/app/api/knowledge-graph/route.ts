import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { SemanticKnowledgeGraph } from '@messai/ai'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const knowledgeGraph = new SemanticKnowledgeGraph(prisma)
    
    switch (action) {
      case 'summary':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const summary = knowledgeGraph.getKnowledgeGraphSummary()
        return NextResponse.json(summary)
        
      case 'nodes':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const graphData = knowledgeGraph.getGraphData()
        return NextResponse.json({
          nodes: graphData.nodes,
          totalNodes: graphData.nodes.length
        })
        
      case 'edges':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const edgeData = knowledgeGraph.getGraphData()
        return NextResponse.json({
          edges: edgeData.edges,
          totalEdges: edgeData.edges.length
        })
        
      case 'full':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const fullData = knowledgeGraph.getGraphData()
        return NextResponse.json(fullData)
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: summary, nodes, edges, or full' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Knowledge graph error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    
    const knowledgeGraph = new SemanticKnowledgeGraph(prisma)
    
    switch (action) {
      case 'build':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const summary = knowledgeGraph.getKnowledgeGraphSummary()
        return NextResponse.json({
          success: true,
          summary
        })
        
      case 'search':
        const { query, limit = 10 } = params
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required for search action' },
            { status: 400 }
          )
        }
        
        const results = await knowledgeGraph.semanticSearch(query, limit)
        return NextResponse.json({
          results,
          query,
          totalResults: results.length
        })
        
      case 'export':
        await knowledgeGraph.loadPapersAndBuildGraph()
        const exportData = await knowledgeGraph.exportKnowledgeGraph()
        return NextResponse.json({
          success: true,
          data: exportData
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: build, search, or export' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Knowledge graph error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}