import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

interface GraphNode {
  id: string
  name: string
  type: 'paper' | 'author' | 'material' | 'organism' | 'concept' | 'method' | 'journal'
  value: number
  metadata?: any
}

interface GraphLink {
  source: string
  target: string
  type: 'authored' | 'uses_material' | 'studies_organism' | 'related_to' | 'cites' | 'published_in'
  strength: number
  metadata?: any
}

interface KnowledgeGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  statistics: {
    totalNodes: number
    nodesByType: Record<string, number>
    totalLinks: number
    linksByType: Record<string, number>
  }
}

// Helper to extract array fields
function extractArrayField(field: any): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return field.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
  }
  return []
}

// Build the knowledge graph from papers
async function buildKnowledgeGraph(papers: any[]): Promise<KnowledgeGraphData> {
  const nodes = new Map<string, GraphNode>()
  const links: GraphLink[] = []
  const linkSet = new Set<string>() // To avoid duplicate links

  // Helper to add node
  const addNode = (id: string, name: string, type: GraphNode['type'], metadata?: any) => {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        name: name.substring(0, 100), // Limit name length
        type,
        value: 1,
        metadata
      })
    } else {
      // Increase value for existing nodes
      const node = nodes.get(id)!
      node.value += 1
    }
  }

  // Helper to add link
  const addLink = (source: string, target: string, type: GraphLink['type'], strength = 1) => {
    const linkId = `${source}-${target}-${type}`
    if (!linkSet.has(linkId) && source !== target) {
      linkSet.add(linkId)
      links.push({ source, target, type, strength })
    }
  }

  // Process each paper
  for (const paper of papers) {
    const paperId = `paper_${paper.id}`
    addNode(paperId, paper.title || 'Untitled', 'paper', {
      id: paper.id,
      powerOutput: paper.powerOutput,
      efficiency: paper.efficiency,
      systemType: paper.systemType,
      publicationDate: paper.publicationDate,
      doi: paper.doi
    })

    // Add authors
    const authors = extractArrayField(paper.authors)
    authors.forEach(author => {
      if (author && author !== 'not specified' && author.length > 2) {
        const authorId = `author_${author.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        addNode(authorId, author, 'author')
        addLink(authorId, paperId, 'authored')
      }
    })

    // Add journal
    if (paper.journal && paper.journal !== 'Unknown') {
      const journalId = `journal_${paper.journal.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      addNode(journalId, paper.journal, 'journal')
      addLink(paperId, journalId, 'published_in', 0.7)
    }

    // Add materials
    const anodeMaterials = extractArrayField(paper.anodeMaterials)
    const cathodeMaterials = extractArrayField(paper.cathodeMaterials)
    const allMaterials = [...new Set([...anodeMaterials, ...cathodeMaterials])]
    
    allMaterials.forEach(material => {
      if (material && material.length > 2) {
        const materialId = `material_${material.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        addNode(materialId, material, 'material', { 
          isAnode: anodeMaterials.includes(material),
          isCathode: cathodeMaterials.includes(material)
        })
        addLink(paperId, materialId, 'uses_material', 0.8)
      }
    })

    // Add organisms
    const organisms = extractArrayField(paper.organismTypes)
    organisms.forEach(organism => {
      if (organism && organism.length > 2) {
        const organismId = `organism_${organism.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        addNode(organismId, organism, 'organism')
        addLink(paperId, organismId, 'studies_organism', 0.8)
      }
    })

    // Add system type as method
    if (paper.systemType && paper.systemType !== 'Unknown') {
      const methodId = `method_${paper.systemType.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      addNode(methodId, paper.systemType, 'method')
      addLink(paperId, methodId, 'related_to', 0.7)
    }

    // Add keywords as concepts
    const keywords = extractArrayField(paper.keywords)
    keywords.slice(0, 5).forEach(keyword => {
      if (keyword && keyword.length > 3) {
        const conceptId = `concept_${keyword.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        addNode(conceptId, keyword, 'concept')
        addLink(paperId, conceptId, 'related_to', 0.5)
      }
    })
  }

  // Create connections between related materials (co-occurrence)
  const materialNodes = Array.from(nodes.values()).filter(n => n.type === 'material')
  const materialPapers = new Map<string, Set<string>>()
  
  // Build material-paper mapping
  links.forEach(link => {
    if (link.type === 'uses_material') {
      const materialId = link.target
      if (!materialPapers.has(materialId)) {
        materialPapers.set(materialId, new Set())
      }
      materialPapers.get(materialId)!.add(link.source)
    }
  })

  // Connect materials that appear in the same papers
  materialNodes.forEach((mat1, i) => {
    materialNodes.slice(i + 1).forEach(mat2 => {
      const papers1 = materialPapers.get(mat1.id) || new Set()
      const papers2 = materialPapers.get(mat2.id) || new Set()
      const sharedPapers = Array.from(papers1).filter(p => papers2.has(p))
      
      if (sharedPapers.length >= 2) {
        addLink(mat1.id, mat2.id, 'related_to', Math.min(sharedPapers.length * 0.2, 1))
      }
    })
  })

  // Similar for organisms
  const organismNodes = Array.from(nodes.values()).filter(n => n.type === 'organism')
  const organismPapers = new Map<string, Set<string>>()
  
  links.forEach(link => {
    if (link.type === 'studies_organism') {
      const organismId = link.target
      if (!organismPapers.has(organismId)) {
        organismPapers.set(organismId, new Set())
      }
      organismPapers.get(organismId)!.add(link.source)
    }
  })

  organismNodes.forEach((org1, i) => {
    organismNodes.slice(i + 1).forEach(org2 => {
      const papers1 = organismPapers.get(org1.id) || new Set()
      const papers2 = organismPapers.get(org2.id) || new Set()
      const sharedPapers = Array.from(papers1).filter(p => papers2.has(p))
      
      if (sharedPapers.length >= 2) {
        addLink(org1.id, org2.id, 'related_to', Math.min(sharedPapers.length * 0.2, 1))
      }
    })
  })

  // Calculate statistics
  const nodesByType = Array.from(nodes.values()).reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const linksByType = links.reduce((acc, link) => {
    acc[link.type] = (acc[link.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    nodes: Array.from(nodes.values()),
    links,
    statistics: {
      totalNodes: nodes.size,
      nodesByType,
      totalLinks: links.length,
      linksByType
    }
  }
}

// GET /api/research/knowledge-graph
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    // Extract parameters
    const limit = parseInt(searchParams.get('limit') || '200')
    const systemType = searchParams.get('systemType')
    const minConnections = parseInt(searchParams.get('minConnections') || '2')
    const includeOrphans = searchParams.get('includeOrphans') === 'true'
    
    // Build query
    const where: any = {
      OR: [
        { isPublic: true },
        ...(session?.user?.id ? [{ uploadedBy: session.user.id }] : [])
      ]
    }
    
    if (systemType) {
      where.systemType = systemType
    }
    
    // Fetch papers
    const papers = await prisma.researchPaper.findMany({
      where,
      take: limit,
      orderBy: [
        { publicationDate: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        authors: true,
        journal: true,
        publicationDate: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true,
        doi: true
      }
    })
    
    // Build knowledge graph
    let graphData = await buildKnowledgeGraph(papers)
    
    // Filter nodes by minimum connections if requested
    if (!includeOrphans && minConnections > 1) {
      const nodeConnectionCount = new Map<string, number>()
      
      // Count connections for each node
      graphData.links.forEach(link => {
        nodeConnectionCount.set(link.source, (nodeConnectionCount.get(link.source) || 0) + 1)
        nodeConnectionCount.set(link.target, (nodeConnectionCount.get(link.target) || 0) + 1)
      })
      
      // Filter nodes
      const filteredNodes = graphData.nodes.filter(node => 
        node.type === 'paper' || (nodeConnectionCount.get(node.id) || 0) >= minConnections
      )
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
      
      // Filter links
      const filteredLinks = graphData.links.filter(link => 
        filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
      )
      
      graphData = {
        nodes: filteredNodes,
        links: filteredLinks,
        statistics: {
          ...graphData.statistics,
          totalNodes: filteredNodes.length,
          totalLinks: filteredLinks.length
        }
      }
    }
    
    return NextResponse.json(graphData)
    
  } catch (error) {
    console.error('Knowledge graph error:', error)
    return NextResponse.json(
      { error: 'Failed to generate knowledge graph' },
      { status: 500 }
    )
  }
}

// POST /api/research/knowledge-graph/expand
// Expand the graph around a specific node
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { nodeId, nodeType, depth = 1 } = await request.json()
    
    if (!nodeId || !nodeType) {
      return NextResponse.json(
        { error: 'nodeId and nodeType are required' },
        { status: 400 }
      )
    }
    
    // Build query based on node type
    let papers: any[] = []
    
    if (nodeType === 'paper') {
      const paperId = nodeId.replace('paper_', '')
      papers = await prisma.researchPaper.findMany({
        where: { id: paperId },
        select: {
          id: true,
          title: true,
          authors: true,
          journal: true,
          publicationDate: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          keywords: true,
          doi: true
        }
      })
    } else if (nodeType === 'material') {
      const materialName = nodeId.replace('material_', '').replace(/_/g, ' ')
      papers = await prisma.researchPaper.findMany({
        where: {
          OR: [
            { anodeMaterials: { contains: materialName, mode: 'insensitive' } },
            { cathodeMaterials: { contains: materialName, mode: 'insensitive' } }
          ]
        },
        take: 20,
        select: {
          id: true,
          title: true,
          authors: true,
          journal: true,
          publicationDate: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          keywords: true,
          doi: true
        }
      })
    } else if (nodeType === 'organism') {
      const organismName = nodeId.replace('organism_', '').replace(/_/g, ' ')
      papers = await prisma.researchPaper.findMany({
        where: {
          organismTypes: { contains: organismName, mode: 'insensitive' }
        },
        take: 20,
        select: {
          id: true,
          title: true,
          authors: true,
          journal: true,
          publicationDate: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          keywords: true,
          doi: true
        }
      })
    } else if (nodeType === 'author') {
      const authorName = nodeId.replace('author_', '').replace(/_/g, ' ')
      papers = await prisma.researchPaper.findMany({
        where: {
          authors: { contains: authorName, mode: 'insensitive' }
        },
        take: 20,
        select: {
          id: true,
          title: true,
          authors: true,
          journal: true,
          publicationDate: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          keywords: true,
          doi: true
        }
      })
    }
    
    // Build subgraph
    const subgraph = await buildKnowledgeGraph(papers)
    
    return NextResponse.json({
      nodeId,
      nodeType,
      depth,
      subgraph
    })
    
  } catch (error) {
    console.error('Knowledge graph expansion error:', error)
    return NextResponse.json(
      { error: 'Failed to expand knowledge graph' },
      { status: 500 }
    )
  }
}