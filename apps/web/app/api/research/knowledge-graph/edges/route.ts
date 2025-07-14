import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { KnowledgeGraphService } from '@messai/database'

// GET /api/research/knowledge-graph/edges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    const nodeId = searchParams.get('nodeId')
    const edgeType = searchParams.get('edgeType')
    const minWeight = parseFloat(searchParams.get('minWeight') || '0')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {}
    
    if (nodeId) {
      where.OR = [
        { sourceId: nodeId },
        { targetId: nodeId }
      ]
    }
    if (edgeType) where.edgeType = edgeType
    if (minWeight > 0) where.weight = { gte: minWeight }
    
    const [edges, total] = await Promise.all([
      prisma.knowledgeEdge.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { weight: 'desc' },
        include: {
          source: true,
          target: true
        }
      }),
      prisma.knowledgeEdge.count({ where })
    ])
    
    return NextResponse.json({
      edges: edges.map(edge => ({
        ...edge,
        properties: edge.properties ? JSON.parse(edge.properties) : null,
        source: {
          ...edge.source,
          properties: edge.source.properties ? JSON.parse(edge.source.properties) : null
        },
        target: {
          ...edge.target,
          properties: edge.target.properties ? JSON.parse(edge.target.properties) : null
        }
      })),
      total,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('Knowledge graph edges error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph edges' },
      { status: 500 }
    )
  }
}

// POST /api/research/knowledge-graph/edges
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { sourceId, targetId, edgeType, weight, properties, confidence } = body
    
    if (!sourceId || !targetId || !edgeType) {
      return NextResponse.json(
        { error: 'sourceId, targetId, and edgeType are required' },
        { status: 400 }
      )
    }
    
    const graphService = new KnowledgeGraphService(prisma)
    
    const edge = await graphService.createEdge({
      sourceId,
      targetId,
      edgeType,
      weight,
      properties,
      confidence
    })
    
    return NextResponse.json(edge)
    
  } catch (error) {
    console.error('Create edge error:', error)
    return NextResponse.json(
      { error: 'Failed to create edge' },
      { status: 500 }
    )
  }
}