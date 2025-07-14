import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

interface CompatibilityRequest {
  anode: string
  cathode: string
  organism: string
  membrane?: string
  operatingConditions?: {
    temperature?: number
    pH?: number
    substrate?: string
  }
}

interface CompatibilityScore {
  score: number // 0-100
  confidence: number // 0-1
  factors: {
    biocompatibility: number
    conductivity: number
    stability: number
    cost: number
    sustainability: number
  }
  notes: string[]
  warnings?: string[]
  recommendations?: string[]
  references?: Array<{
    paperId: string
    title: string
    powerOutput?: number
    efficiency?: number
  }>
}

// Material properties database (in production, this would be in database)
const materialProperties = {
  anode: {
    'Carbon Felt': {
      conductivity: 95,
      biocompatibility: 90,
      stability: 85,
      cost: 70,
      sustainability: 80,
      surfaceArea: 'high',
      porosity: 'high'
    },
    'Carbon Cloth': {
      conductivity: 90,
      biocompatibility: 85,
      stability: 88,
      cost: 65,
      sustainability: 75,
      surfaceArea: 'medium',
      porosity: 'medium'
    },
    'Graphene Oxide': {
      conductivity: 98,
      biocompatibility: 75,
      stability: 80,
      cost: 30,
      sustainability: 70,
      surfaceArea: 'very high',
      porosity: 'low'
    },
    'Stainless Steel': {
      conductivity: 85,
      biocompatibility: 60,
      stability: 95,
      cost: 80,
      sustainability: 85,
      surfaceArea: 'low',
      porosity: 'none'
    },
    'MXene': {
      conductivity: 99,
      biocompatibility: 70,
      stability: 75,
      cost: 20,
      sustainability: 65,
      surfaceArea: 'very high',
      porosity: 'medium'
    }
  },
  cathode: {
    'Platinum': {
      catalyticActivity: 95,
      stability: 90,
      cost: 10,
      sustainability: 40,
      oxygenReduction: 95
    },
    'Carbon Cloth': {
      catalyticActivity: 70,
      stability: 85,
      cost: 70,
      sustainability: 75,
      oxygenReduction: 65
    },
    'Activated Carbon': {
      catalyticActivity: 75,
      stability: 80,
      cost: 80,
      sustainability: 80,
      oxygenReduction: 70
    },
    'MXene': {
      catalyticActivity: 85,
      stability: 75,
      cost: 25,
      sustainability: 65,
      oxygenReduction: 80
    }
  },
  organism: {
    'Geobacter sulfurreducens': {
      electronTransfer: 95,
      growthRate: 70,
      robustness: 85,
      substrateRange: 60,
      powerDensity: 90
    },
    'Shewanella oneidensis': {
      electronTransfer: 85,
      growthRate: 80,
      robustness: 90,
      substrateRange: 80,
      powerDensity: 80
    },
    'Mixed Culture': {
      electronTransfer: 75,
      growthRate: 85,
      robustness: 95,
      substrateRange: 95,
      powerDensity: 70
    },
    'Pseudomonas aeruginosa': {
      electronTransfer: 70,
      growthRate: 90,
      robustness: 85,
      substrateRange: 85,
      powerDensity: 65
    }
  }
}

// Calculate compatibility score
function calculateCompatibility(request: CompatibilityRequest): CompatibilityScore {
  const anodeProps = materialProperties.anode[request.anode as keyof typeof materialProperties.anode]
  const cathodeProps = materialProperties.cathode[request.cathode as keyof typeof materialProperties.cathode]
  const organismProps = materialProperties.organism[request.organism as keyof typeof materialProperties.organism]
  
  if (!anodeProps || !cathodeProps || !organismProps) {
    return {
      score: 0,
      confidence: 0,
      factors: {
        biocompatibility: 0,
        conductivity: 0,
        stability: 0,
        cost: 0,
        sustainability: 0
      },
      notes: ['Unknown material or organism combination'],
      warnings: ['One or more components not found in database']
    }
  }
  
  // Calculate individual factors
  const factors = {
    biocompatibility: (anodeProps.biocompatibility * organismProps.electronTransfer) / 100,
    conductivity: (anodeProps.conductivity + cathodeProps.catalyticActivity) / 2,
    stability: (anodeProps.stability + cathodeProps.stability) / 2,
    cost: (anodeProps.cost + cathodeProps.cost) / 2,
    sustainability: (anodeProps.sustainability + cathodeProps.sustainability) / 2
  }
  
  // Calculate weighted overall score
  const weights = {
    biocompatibility: 0.3,
    conductivity: 0.25,
    stability: 0.2,
    cost: 0.15,
    sustainability: 0.1
  }
  
  const score = Math.round(
    Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof typeof weights]
    }, 0)
  )
  
  // Calculate confidence based on data availability
  const confidence = 0.85 // High confidence for known materials
  
  // Generate notes and recommendations
  const notes: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Biocompatibility analysis
  if (factors.biocompatibility > 80) {
    notes.push('Excellent biocompatibility between materials and organism')
  } else if (factors.biocompatibility < 60) {
    warnings.push('Low biocompatibility may limit performance')
    recommendations.push('Consider surface modification or alternative materials')
  }
  
  // Conductivity analysis
  if (anodeProps.conductivity > 90 && cathodeProps.catalyticActivity > 80) {
    notes.push('High conductivity and catalytic activity')
  }
  
  // Cost analysis
  if (factors.cost < 50) {
    warnings.push('High material costs may limit commercial viability')
    recommendations.push('Consider cost-effective alternatives or hybrid approaches')
  }
  
  // Stability analysis
  if (factors.stability > 85) {
    notes.push('Long-term stability expected')
  }
  
  // Surface area considerations
  if (anodeProps.surfaceArea === 'high' || anodeProps.surfaceArea === 'very high') {
    notes.push('High surface area promotes biofilm formation')
  }
  
  // Operating conditions impact
  if (request.operatingConditions) {
    const { temperature, pH } = request.operatingConditions
    
    if (temperature && (temperature < 20 || temperature > 40)) {
      warnings.push('Operating temperature outside optimal range (20-40°C)')
    }
    
    if (pH && (pH < 6.5 || pH > 8.5)) {
      warnings.push('pH outside optimal range (6.5-8.5) for most organisms')
    }
  }
  
  return {
    score,
    confidence,
    factors,
    notes,
    warnings: warnings.length > 0 ? warnings : undefined,
    recommendations: recommendations.length > 0 ? recommendations : undefined
  }
}

// POST /api/parameters/compatibility
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body: CompatibilityRequest = await request.json()
    
    // Validate required fields
    if (!body.anode || !body.cathode || !body.organism) {
      return NextResponse.json(
        { error: 'Anode, cathode, and organism are required' },
        { status: 400 }
      )
    }
    
    // Calculate compatibility
    const compatibility = calculateCompatibility(body)
    
    // Find related research papers (if authenticated)
    if (session?.user) {
      try {
        // Search for papers with matching materials
        const papers = await prisma.researchPaper.findMany({
          where: {
            AND: [
              {
                OR: [
                  { anodeMaterials: { contains: body.anode, mode: 'insensitive' } },
                  { anodeMaterials: { contains: body.anode.toLowerCase() } }
                ]
              },
              {
                OR: [
                  { cathodeMaterials: { contains: body.cathode, mode: 'insensitive' } },
                  { cathodeMaterials: { contains: body.cathode.toLowerCase() } }
                ]
              },
              {
                OR: [
                  { organismTypes: { contains: body.organism, mode: 'insensitive' } },
                  { organismTypes: { contains: body.organism.toLowerCase() } }
                ]
              }
            ]
          },
          select: {
            id: true,
            title: true,
            powerOutput: true,
            efficiency: true
          },
          take: 5,
          orderBy: {
            powerOutput: 'desc'
          }
        })
        
        if (papers.length > 0) {
          compatibility.references = papers.map(paper => ({
            paperId: paper.id,
            title: paper.title || 'Untitled',
            powerOutput: paper.powerOutput || undefined,
            efficiency: paper.efficiency || undefined
          }))
          
          // Update confidence based on research validation
          compatibility.confidence = Math.min(0.95, compatibility.confidence + 0.1)
          compatibility.notes.push(`${papers.length} research papers validate this combination`)
        }
      } catch (dbError) {
        console.error('Database error fetching papers:', dbError)
        // Continue without references
      }
    }
    
    // Log the analysis (for future ML training)
    if (session?.user?.id) {
      // In production, log this to analytics or training data
      console.log('Compatibility analysis:', {
        userId: session.user.id,
        combination: body,
        result: compatibility
      })
    }
    
    return NextResponse.json({
      compatibility,
      combination: {
        anode: body.anode,
        cathode: body.cathode,
        organism: body.organism,
        membrane: body.membrane
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Compatibility calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate compatibility' },
      { status: 500 }
    )
  }
}

// GET /api/parameters/compatibility/suggestions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'anode', 'cathode', 'organism'
    const currentSelection = {
      anode: searchParams.get('anode'),
      cathode: searchParams.get('cathode'),
      organism: searchParams.get('organism')
    }
    
    // Return available options based on type
    const options = {
      anode: Object.keys(materialProperties.anode),
      cathode: Object.keys(materialProperties.cathode),
      organism: Object.keys(materialProperties.organism),
      membrane: ['Nafion', 'CMI-7000', 'AMI-7001', 'None (Membrane-less)', 'Salt Bridge']
    }
    
    if (type && options[type as keyof typeof options]) {
      return NextResponse.json({
        type,
        options: options[type as keyof typeof options],
        currentSelection
      })
    }
    
    return NextResponse.json(options)
    
  } catch (error) {
    console.error('Error fetching compatibility options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    )
  }
}