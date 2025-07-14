import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

// GET /api/research/knowledge-graph/subgraph
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    const nodeId = searchParams.get('nodeId')
    const depth = parseInt(searchParams.get('depth') || '1')
    const maxNodes = parseInt(searchParams.get('maxNodes') || '100')
    
    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId is required' },
        { status: 400 }
      )
    }
    
    // Get the center node
    const centerNode = await prisma.knowledgeNode.findUnique({
      where: { id: nodeId }
    })
    
    if (!centerNode) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      )
    }
    
    // BFS to get nodes within depth
    const visitedNodes = new Set<string>([nodeId])
    const nodesToProcess = [{ id: nodeId, level: 0 }]
    const nodes = [centerNode]
    const edges: any[] = []
    
    while (nodesToProcess.length > 0 && nodes.length < maxNodes) {
      const current = nodesToProcess.shift()!
      
      if (current.level >= depth) continue
      
      // Get edges connected to current node
      const connectedEdges = await prisma.knowledgeEdge.findMany({
        where: {
          OR: [
            { sourceId: current.id },
            { targetId: current.id }
          ]
        },
        include: {
          source: true,
          target: true
        }
      })
      
      for (const edge of connectedEdges) {
        edges.push(edge)
        
        // Add connected nodes to process
        const connectedNodeId = edge.sourceId === current.id 
          ? edge.targetId 
          : edge.sourceId
        
        if (!visitedNodes.has(connectedNodeId)) {
          visitedNodes.add(connectedNodeId)
          nodesToProcess.push({ 
            id: connectedNodeId, 
            level: current.level + 1 
          })
          
          const connectedNode = edge.sourceId === current.id 
            ? edge.target 
            : edge.source
          nodes.push(connectedNode)
          
          if (nodes.length >= maxNodes) break
        }
      }
    }
    
    // Format response
    const formattedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.name,
      properties: node.properties ? JSON.parse(node.properties) : null,
      importance: node.importance,
      isCenter: node.id === nodeId
    }))
    
    const formattedEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.edgeType,
      weight: edge.weight,
      properties: edge.properties ? JSON.parse(edge.properties) : null
    }))
    
    // Remove duplicate edges
    const uniqueEdges = Array.from(
      new Map(formattedEdges.map(e => [`${e.source}-${e.target}-${e.type}`, e])).values()
    )
    
    return NextResponse.json({
      centerNode: nodeId,
      depth,
      nodes: formattedNodes,
      edges: uniqueEdges,
      statistics: {
        nodeCount: formattedNodes.length,
        edgeCount: uniqueEdges.length,
        nodeTypes: formattedNodes.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    })
    
  } catch (error) {
    console.error('Knowledge graph subgraph error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subgraph' },
      { status: 500 }
    )
  }
}