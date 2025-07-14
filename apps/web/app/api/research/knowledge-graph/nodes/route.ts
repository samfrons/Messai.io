import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { KnowledgeGraphService } from '@messai/database'

// GET /api/research/knowledge-graph/nodes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const minImportance = parseFloat(searchParams.get('minImportance') || '0')
    
    const where: any = {}
    
    if (type) where.type = type
    if (minImportance > 0) where.importance = { gte: minImportance }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { properties: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const [nodes, total] = await Promise.all([
      prisma.knowledgeNode.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { importance: 'desc' },
          { name: 'asc' }
        ],
        include: {
          _count: {
            select: {
              outgoingEdges: true,
              incomingEdges: true
            }
          }
        }
      }),
      prisma.knowledgeNode.count({ where })
    ])
    
    return NextResponse.json({
      nodes: nodes.map(node => ({
        ...node,
        properties: node.properties ? JSON.parse(node.properties) : null,
        connectionCount: node._count.outgoingEdges + node._count.incomingEdges
      })),
      total,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('Knowledge graph nodes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph nodes' },
      { status: 500 }
    )
  }
}

// POST /api/research/knowledge-graph/nodes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { type, entityId, name, properties, embedding } = body
    
    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      )
    }
    
    const graphService = new KnowledgeGraphService(prisma)
    
    const node = await graphService.createNode({
      type,
      entityId,
      name,
      properties,
      embedding
    })
    
    return NextResponse.json(node)
    
  } catch (error) {
    console.error('Create node error:', error)
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    )
  }
}