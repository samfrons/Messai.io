import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import OpenAI from 'openai'

// Initialize OpenRouter-compatible client for embeddings
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": "https://messai.app",
    "X-Title": "MESSAi Platform",
  }
})

interface SemanticSearchResult {
  paper: any
  relevanceScore: number
  explanation: string
  relatedConcepts: string[]
  highlights: {
    title?: string[]
    abstract?: string[]
    keywords?: string[]
  }
}

interface QueryAnalysis {
  intent: 'performance' | 'materials' | 'organisms' | 'methodology' | 'applications' | 'general'
  entities: {
    materials: string[]
    organisms: string[]
    metrics: string[]
    methods: string[]
  }
  concepts: string[]
  expandedTerms: string[]
}

// Analyze query to understand search intent and extract entities
function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase()
  
  // Intent detection
  let intent: QueryAnalysis['intent'] = 'general'
  if (lowerQuery.match(/performance|power|efficiency|output|voltage|current/)) {
    intent = 'performance'
  } else if (lowerQuery.match(/material|electrode|anode|cathode|graphene|carbon|mxene/)) {
    intent = 'materials'
  } else if (lowerQuery.match(/bacteria|organism|microbe|biofilm|culture|species/)) {
    intent = 'organisms'
  } else if (lowerQuery.match(/method|protocol|technique|procedure|design/)) {
    intent = 'methodology'
  } else if (lowerQuery.match(/application|use|treatment|wastewater|energy|fuel/)) {
    intent = 'applications'
  }
  
  // Entity extraction
  const materialTerms = [
    'graphene', 'carbon', 'mxene', 'titanium', 'platinum', 'gold', 'silver',
    'stainless steel', 'carbon cloth', 'carbon felt', 'carbon paper', 'graphite',
    'biochar', 'carbon nanotube', 'cnt', 'reduced graphene oxide', 'rgo',
    'polyaniline', 'pani', 'polypyrrole', 'ppy', 'nafion'
  ]
  
  const organismTerms = [
    'geobacter', 'shewanella', 'pseudomonas', 'e. coli', 'escherichia coli',
    'desulfovibrio', 'rhodopseudomonas', 'chlorella', 'spirulina', 'yeast',
    'saccharomyces', 'mixed culture', 'consortium', 'biofilm'
  ]
  
  const metricTerms = [
    'power density', 'current density', 'voltage', 'coulombic efficiency',
    'energy efficiency', 'open circuit voltage', 'ocv', 'internal resistance',
    'polarization', 'overpotential'
  ]
  
  const methodTerms = [
    'single chamber', 'dual chamber', 'air cathode', 'biocathode',
    'batch mode', 'continuous flow', 'fed batch', 'stacked', 'scaled up'
  ]
  
  const entities = {
    materials: materialTerms.filter(term => lowerQuery.includes(term)),
    organisms: organismTerms.filter(term => lowerQuery.includes(term)),
    metrics: metricTerms.filter(term => lowerQuery.includes(term)),
    methods: methodTerms.filter(term => lowerQuery.includes(term))
  }
  
  // Concept extraction
  const concepts = []
  if (lowerQuery.includes('high') || lowerQuery.includes('enhanced')) {
    concepts.push('optimization', 'improvement')
  }
  if (lowerQuery.includes('novel') || lowerQuery.includes('new')) {
    concepts.push('innovation', 'development')
  }
  if (lowerQuery.includes('sustainable') || lowerQuery.includes('green')) {
    concepts.push('environmental', 'eco-friendly')
  }
  
  // Query expansion
  const expandedTerms = []
  if (intent === 'performance') {
    expandedTerms.push('power output', 'efficiency', 'performance metrics')
  }
  if (entities.materials.includes('graphene')) {
    expandedTerms.push('graphene oxide', 'reduced graphene oxide', 'graphene composite')
  }
  if (entities.organisms.includes('geobacter')) {
    expandedTerms.push('geobacter sulfurreducens', 'electrogenic bacteria')
  }
  
  return { intent, entities, concepts, expandedTerms }
}

// Calculate semantic similarity using keyword matching and conceptual relationships
function calculateSemanticScore(query: string, paper: any, analysis: QueryAnalysis): number {
  let score = 0
  const queryLower = query.toLowerCase()
  
  // Title matching (highest weight)
  if (paper.title) {
    const titleLower = paper.title.toLowerCase()
    if (titleLower.includes(queryLower)) {
      score += 10
    } else {
      // Check for individual words
      const queryWords = queryLower.split(/\s+/)
      const titleWords = titleLower.split(/\s+/)
      const matchedWords = queryWords.filter(word => 
        word.length > 3 && titleWords.some(titleWord => titleWord.includes(word))
      )
      score += matchedWords.length * 2
    }
  }
  
  // Abstract matching
  if (paper.abstract) {
    const abstractLower = paper.abstract.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3)
    const abstractMatches = queryWords.filter(word => abstractLower.includes(word))
    score += abstractMatches.length * 0.5
  }
  
  // Entity matching
  const paperMaterials = extractArrayField(paper.anodeMaterials).concat(extractArrayField(paper.cathodeMaterials))
  const paperOrganisms = extractArrayField(paper.organismTypes)
  
  analysis.entities.materials.forEach(material => {
    if (paperMaterials.some(pm => pm.toLowerCase().includes(material))) {
      score += 3
    }
  })
  
  analysis.entities.organisms.forEach(organism => {
    if (paperOrganisms.some(po => po.toLowerCase().includes(organism))) {
      score += 3
    }
  })
  
  // Performance data relevance
  if (analysis.intent === 'performance' && paper.powerOutput) {
    score += 2
  }
  
  // Keyword matching
  if (paper.keywords) {
    const keywords = extractArrayField(paper.keywords)
    const keywordMatches = keywords.filter(kw => 
      queryLower.includes(kw.toLowerCase()) || kw.toLowerCase().includes(queryLower)
    )
    score += keywordMatches.length * 1.5
  }
  
  // AI processing bonus
  if (paper.aiSummary || paper.aiInsights) {
    score += 0.5
  }
  
  return score
}

// Extract array fields that might be JSON strings
function extractArrayField(field: any): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [field]
    }
  }
  return []
}

// Generate explanation for why a paper was selected
function generateExplanation(paper: any, analysis: QueryAnalysis, score: number): string {
  const reasons = []
  
  if (score >= 10) {
    reasons.push('Strong title match')
  } else if (score >= 5) {
    reasons.push('Good keyword relevance')
  }
  
  if (analysis.entities.materials.length > 0) {
    const matchedMaterials = analysis.entities.materials.filter(m => 
      paper.anodeMaterials?.toLowerCase().includes(m) || 
      paper.cathodeMaterials?.toLowerCase().includes(m)
    )
    if (matchedMaterials.length > 0) {
      reasons.push(`Materials: ${matchedMaterials.join(', ')}`)
    }
  }
  
  if (analysis.entities.organisms.length > 0) {
    const matchedOrganisms = analysis.entities.organisms.filter(o => 
      paper.organismTypes?.toLowerCase().includes(o)
    )
    if (matchedOrganisms.length > 0) {
      reasons.push(`Organisms: ${matchedOrganisms.join(', ')}`)
    }
  }
  
  if (analysis.intent === 'performance' && paper.powerOutput) {
    reasons.push(`Power output: ${paper.powerOutput} mW/m²`)
  }
  
  if (paper.aiInsights) {
    reasons.push('AI-enhanced insights available')
  }
  
  return reasons.length > 0 ? reasons.join(' | ') : 'Semantic similarity match'
}

// Extract related concepts from the paper
function extractRelatedConcepts(paper: any): string[] {
  const concepts = new Set<string>()
  
  // Add system type
  if (paper.systemType) {
    concepts.add(paper.systemType)
  }
  
  // Add top materials
  extractArrayField(paper.anodeMaterials).slice(0, 2).forEach(m => concepts.add(m))
  extractArrayField(paper.cathodeMaterials).slice(0, 2).forEach(m => concepts.add(m))
  
  // Add organisms
  extractArrayField(paper.organismTypes).slice(0, 2).forEach(o => concepts.add(o))
  
  // Add performance indicators
  if (paper.powerOutput > 1000) {
    concepts.add('High performance')
  }
  if (paper.efficiency > 80) {
    concepts.add('High efficiency')
  }
  
  return Array.from(concepts).filter(c => c && c.length > 0).slice(0, 6)
}

// Generate search highlights
function generateHighlights(query: string, paper: any): SemanticSearchResult['highlights'] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const highlights: SemanticSearchResult['highlights'] = {}
  
  // Highlight matching words in title
  if (paper.title) {
    const titleWords = paper.title.split(/\s+/)
    const highlightedWords = titleWords.filter(word => 
      queryWords.some(qw => word.toLowerCase().includes(qw))
    )
    if (highlightedWords.length > 0) {
      highlights.title = highlightedWords
    }
  }
  
  // Highlight in abstract (first 200 chars)
  if (paper.abstract) {
    const abstractSnippet = paper.abstract.substring(0, 200)
    const abstractWords = abstractSnippet.split(/\s+/)
    const highlightedWords = abstractWords.filter(word => 
      queryWords.some(qw => word.toLowerCase().includes(qw))
    )
    if (highlightedWords.length > 0) {
      highlights.abstract = highlightedWords
    }
  }
  
  return highlights
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { query, limit = 20, filters = {} } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Analyze the query
    const analysis = analyzeQuery(query)
    
    // Build where clause with filters
    const where: any = {
      OR: [
        { isPublic: true },
        ...(session?.user?.id ? [{ uploadedBy: session.user.id }] : [])
      ]
    }
    
    // Apply filters if provided
    if (filters.systemType) {
      where.systemType = filters.systemType
    }
    if (filters.hasPerformanceData) {
      where.powerOutput = { not: null }
    }
    if (filters.isAiProcessed) {
      where.aiSummary = { not: null }
    }
    if (filters.dateRange) {
      where.publicationDate = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end)
      }
    }
    
    // Fetch papers from database
    const papers = await prisma.researchPaper.findMany({
      where,
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        journal: true,
        publicationDate: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true,
        doi: true,
        externalUrl: true,
        aiSummary: true,
        aiInsights: true,
        aiConfidence: true,
        hasPerformanceData: true,
        isAiProcessed: true
      }
    })
    
    // Score and rank papers
    const scoredPapers = papers
      .map(paper => {
        const relevanceScore = calculateSemanticScore(query, paper, analysis)
        
        if (relevanceScore > 0) {
          return {
            paper,
            relevanceScore,
            explanation: generateExplanation(paper, analysis, relevanceScore),
            relatedConcepts: extractRelatedConcepts(paper),
            highlights: generateHighlights(query, paper)
          } as SemanticSearchResult
        }
        
        return null
      })
      .filter((result): result is SemanticSearchResult => result !== null)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
    
    // Generate search insights
    const searchInsights = {
      totalMatches: scoredPapers.length,
      queryAnalysis: analysis,
      topMaterials: Array.from(new Set(
        scoredPapers.flatMap(r => extractArrayField(r.paper.anodeMaterials).concat(extractArrayField(r.paper.cathodeMaterials)))
      )).slice(0, 5),
      topOrganisms: Array.from(new Set(
        scoredPapers.flatMap(r => extractArrayField(r.paper.organismTypes))
      )).slice(0, 5),
      performanceRange: scoredPapers.length > 0 ? {
        min: Math.min(...scoredPapers.map(r => r.paper.powerOutput || 0).filter(p => p > 0)),
        max: Math.max(...scoredPapers.map(r => r.paper.powerOutput || 0)),
        avg: scoredPapers.reduce((sum, r) => sum + (r.paper.powerOutput || 0), 0) / scoredPapers.filter(r => r.paper.powerOutput).length
      } : null,
      suggestedQueries: [
        ...analysis.expandedTerms,
        'High performance ' + analysis.intent,
        'Recent advances in ' + (analysis.entities.materials[0] || analysis.entities.organisms[0] || 'MFC')
      ].slice(0, 3)
    }
    
    return NextResponse.json({
      results: scoredPapers,
      searchInsights,
      totalResults: scoredPapers.length,
      query: {
        original: query,
        analysis
      }
    })
    
  } catch (error) {
    console.error('Enhanced semantic search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    )
  }
}

// GET endpoint for search suggestions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const prefix = searchParams.get('q') || ''
    
    if (prefix.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }
    
    // Get popular search terms from papers
    const [materials, organisms, keywords] = await Promise.all([
      // Get unique materials
      prisma.researchPaper.findMany({
        where: {
          OR: [
            { anodeMaterials: { contains: prefix, mode: 'insensitive' } },
            { cathodeMaterials: { contains: prefix, mode: 'insensitive' } }
          ]
        },
        select: { anodeMaterials: true, cathodeMaterials: true },
        take: 10
      }),
      // Get unique organisms
      prisma.researchPaper.findMany({
        where: { organismTypes: { contains: prefix, mode: 'insensitive' } },
        select: { organismTypes: true },
        take: 10
      }),
      // Get keywords
      prisma.researchPaper.findMany({
        where: { keywords: { contains: prefix, mode: 'insensitive' } },
        select: { keywords: true },
        take: 10
      })
    ])
    
    // Extract and deduplicate suggestions
    const suggestions = new Set<string>()
    
    materials.forEach(m => {
      extractArrayField(m.anodeMaterials).forEach(mat => {
        if (mat.toLowerCase().includes(prefix.toLowerCase())) {
          suggestions.add(mat)
        }
      })
      extractArrayField(m.cathodeMaterials).forEach(mat => {
        if (mat.toLowerCase().includes(prefix.toLowerCase())) {
          suggestions.add(mat)
        }
      })
    })
    
    organisms.forEach(o => {
      extractArrayField(o.organismTypes).forEach(org => {
        if (org.toLowerCase().includes(prefix.toLowerCase())) {
          suggestions.add(org)
        }
      })
    })
    
    keywords.forEach(k => {
      extractArrayField(k.keywords).forEach(kw => {
        if (kw.toLowerCase().includes(prefix.toLowerCase())) {
          suggestions.add(kw)
        }
      })
    })
    
    return NextResponse.json({
      suggestions: Array.from(suggestions).slice(0, 10)
    })
    
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}