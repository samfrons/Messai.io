import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAllMicrobes, getMicrobesByType } from '@messai/core'

// GET /api/microbes - List all microbial parameters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const type = searchParams.get('type') // bacteria, algae, archaea, fungi, consortium
    const application = searchParams.get('application') // MFC, MEC, MDC, MES
    const systemScale = searchParams.get('systemScale') // lab, pilot, industrial
    const minEfficiency = searchParams.get('minEfficiency')
    const maxTemp = searchParams.get('maxTemp')
    const minTemp = searchParams.get('minTemp')
    const phRange = searchParams.get('phRange') // e.g., "6.5-7.5"
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (systemScale) {
      where.systemScale = {
        contains: systemScale
      }
    }
    
    if (minEfficiency) {
      where.efficiency = {
        gte: parseFloat(minEfficiency)
      }
    }
    
    // Temperature filtering
    if (maxTemp) {
      where.optimalTemp = {
        ...where.optimalTemp,
        lte: parseFloat(maxTemp)
      }
    }
    
    if (minTemp) {
      where.optimalTemp = {
        ...where.optimalTemp,
        gte: parseFloat(minTemp)
      }
    }
    
    // pH range filtering
    if (phRange) {
      const [minPH, maxPH] = phRange.split('-').map(parseFloat)
      if (minPH && maxPH) {
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              {
                AND: [
                  { phRange_min: { lte: maxPH } },
                  { phRange_max: { gte: minPH } }
                ]
              },
              {
                AND: [
                  { optimalPH: { gte: minPH } },
                  { optimalPH: { lte: maxPH } }
                ]
              }
            ]
          }
        ]
      }
    }
    
    // Application filtering
    if (application) {
      where.applications = {
        contains: application
      }
    }
    
    if (search) {
      where.OR = [
        { commonName: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { genus: { contains: search, mode: 'insensitive' } },
        { species: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get microbes from database
    const [microbes, total] = await Promise.all([
      prisma.microbialParameter.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { verified: 'desc' },
          { efficiency: 'desc' },
          { commonName: 'asc' }
        ]
      }),
      prisma.microbialParameter.count({ where })
    ])
    
    // If no microbes in database, return from @messai/core package
    if (microbes.length === 0 && !search && !type && !application) {
      const coreMicrobes = type ? getMicrobesByType(type as any) : getAllMicrobes()
      
      const filteredMicrobes = coreMicrobes.filter(microbe => {
        if (minEfficiency && microbe.efficiency < parseFloat(minEfficiency)) return false
        if (maxTemp && microbe.optimalTemp > parseFloat(maxTemp)) return false
        if (minTemp && microbe.optimalTemp < parseFloat(minTemp)) return false
        if (phRange) {
          const [minPH, maxPH] = phRange.split('-').map(parseFloat)
          if (microbe.optimalPH < minPH || microbe.optimalPH > maxPH) return false
        }
        return true
      })
      
      const paginatedMicrobes = filteredMicrobes.slice(skip, skip + limit)
      
      return NextResponse.json({
        microbes: paginatedMicrobes.map(microbe => ({
          speciesId: microbe.id,
          commonName: microbe.name,
          scientificName: microbe.scientificName,
          type: microbe.type,
          genus: microbe.scientificName.split(' ')[0],
          species: microbe.scientificName.split(' ')[1] || '',
          optimalTemp: microbe.optimalTemp,
          optimalPH: microbe.optimalPH,
          electronTransferRate: microbe.electronTransferRate,
          efficiency: microbe.efficiency,
          growthRate: microbe.growthRate,
          applications: JSON.stringify(['MFC', 'MEC']), // Default applications
          verified: true,
          source: '@messai/core'
        })),
        pagination: {
          page,
          limit,
          total: filteredMicrobes.length,
          totalPages: Math.ceil(filteredMicrobes.length / limit)
        },
        source: 'core_package'
      })
    }
    
    return NextResponse.json({
      microbes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching microbes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch microbes' },
      { status: 500 }
    )
  }
}

// POST /api/microbes - Create a new microbial parameter
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.speciesId || !data.commonName || !data.scientificName || !data.type || !data.genus || !data.species || data.optimalPH === undefined) {
      return NextResponse.json(
        { error: 'speciesId, commonName, scientificName, type, genus, species, and optimalPH are required' },
        { status: 400 }
      )
    }
    
    // Ensure JSON fields are properly formatted
    const processJsonField = (field: any) => {
      if (!field) return null
      return typeof field === 'string' ? field : JSON.stringify(field)
    }
    
    const microbe = await prisma.microbialParameter.create({
      data: {
        speciesId: data.speciesId,
        commonName: data.commonName,
        scientificName: data.scientificName,
        kingdom: data.kingdom || null,
        phylum: data.phylum || null,
        class: data.class || null,
        order: data.order || null,
        family: data.family || null,
        genus: data.genus,
        species: data.species,
        strain: data.strain || null,
        type: data.type,
        metabolism: data.metabolism || 'unknown',
        energySource: data.energySource || 'unknown',
        optimalTemp: data.optimalTemp || null,
        tempRange_min: data.tempRange_min || null,
        tempRange_max: data.tempRange_max || null,
        optimalPH: data.optimalPH,
        phRange_min: data.phRange_min || null,
        phRange_max: data.phRange_max || null,
        salinity: data.salinity || null,
        electronTransferRate: data.electronTransferRate || null,
        extracellularElectron: data.extracellularElectron || false,
        biofilmFormation: data.biofilmFormation || false,
        conductivity: data.conductivity || null,
        powerOutput: data.powerOutput || null,
        currentDensity: data.currentDensity || null,
        efficiency: data.efficiency || null,
        growthRate: data.growthRate || null,
        substrate_efficiency: data.substrate_efficiency || null,
        preferredSubstrates: processJsonField(data.preferredSubstrates),
        substrate_range: processJsonField(data.substrate_range),
        inhibitors: processJsonField(data.inhibitors),
        applications: processJsonField(data.applications),
        systemScale: data.systemScale || null,
        treatmentTypes: processJsonField(data.treatmentTypes),
        biosafety_level: data.biosafety_level || null,
        pathogenicity: data.pathogenicity || false,
        environmental_risk: data.environmental_risk || null,
        growth_medium: processJsonField(data.growth_medium),
        cultivation_time: data.cultivation_time || null,
        storage_conditions: data.storage_conditions || null,
        consortiumMember: data.consortiumMember || false,
        synergisticWith: processJsonField(data.synergisticWith),
        antagonisticWith: processJsonField(data.antagonisticWith),
        synergyFactor: data.synergyFactor || null,
        sourcesPapers: processJsonField(data.sourcesPapers),
        isolationSource: data.isolationSource || null,
        firstIsolated: data.firstIsolated ? new Date(data.firstIsolated) : null,
        genomeSize: data.genomeSize || null,
        gcContent: data.gcContent || null,
        plasmids: processJsonField(data.plasmids),
        description: data.description || null,
        advantages: processJsonField(data.advantages),
        limitations: processJsonField(data.limitations),
        culturability: data.culturability || null,
        addedBy: data.addedBy || null,
        verified: data.verified || false
      }
    })
    
    return NextResponse.json(microbe, { status: 201 })
  } catch (error: any) {
    console.error('Error creating microbe:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Microbe with this species ID already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create microbe' },
      { status: 500 }
    )
  }
}