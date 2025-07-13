import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAllElectrodes } from '@messai/core'

// GET /api/materials - List all material parameters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const type = searchParams.get('type') // carbon, nanomaterial, metal, composite
    const application = searchParams.get('application') // anode, cathode, separator
    const maxCost = searchParams.get('maxCost')
    const minEfficiency = searchParams.get('minEfficiency')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (application) {
      where.application = application
    }
    
    if (maxCost) {
      where.cost = {
        lte: parseFloat(maxCost)
      }
    }
    
    if (minEfficiency) {
      where.efficiency = {
        gte: parseFloat(minEfficiency)
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get materials from database
    const [materials, total] = await Promise.all([
      prisma.materialParameter.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ]
      }),
      prisma.materialParameter.count({ where })
    ])
    
    // If no materials in database, return from @messai/core package
    if (materials.length === 0 && !search && !type && !application) {
      const coreElectrodes = getAllElectrodes()
      
      const filteredElectrodes = coreElectrodes.filter(material => {
        if (maxCost && material.cost > parseFloat(maxCost)) return false
        if (minEfficiency && material.sustainability < parseFloat(minEfficiency)) return false
        return true
      })
      
      const paginatedElectrodes = filteredElectrodes.slice(skip, skip + limit)
      
      return NextResponse.json({
        materials: paginatedElectrodes.map(material => ({
          materialId: material.name.toLowerCase().replace(/ /g, '-'),
          name: material.name,
          type: material.type,
          application: 'electrode', // Default for @messai/core materials
          conductivity: material.conductivity,
          surfaceArea: material.surfaceArea,
          cost: material.cost,
          sustainability: material.sustainability,
          description: material.description,
          advantages: JSON.stringify(material.advantages),
          limitations: JSON.stringify(material.limitations),
          verified: true,
          source: '@messai/core'
        })),
        pagination: {
          page,
          limit,
          total: filteredElectrodes.length,
          totalPages: Math.ceil(filteredElectrodes.length / limit)
        },
        source: 'core_package'
      })
    }
    
    return NextResponse.json({
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

// POST /api/materials - Create a new material parameter
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.materialId || !data.name || !data.type) {
      return NextResponse.json(
        { error: 'materialId, name, and type are required' },
        { status: 400 }
      )
    }
    
    // Ensure JSON fields are properly formatted
    const processJsonField = (field: any) => {
      if (!field) return null
      return typeof field === 'string' ? field : JSON.stringify(field)
    }
    
    const material = await prisma.materialParameter.create({
      data: {
        materialId: data.materialId,
        name: data.name,
        scientificName: data.scientificName || null,
        type: data.type,
        category: data.category || 'electrode',
        application: data.application || 'anode',
        conductivity: data.conductivity || null,
        surfaceArea: data.surfaceArea || null,
        porosity: data.porosity || null,
        density: data.density || null,
        thickness: data.thickness || null,
        composition: processJsonField(data.composition),
        stability: data.stability || null,
        corrosionRes: data.corrosionRes || null,
        efficiency: data.efficiency || null,
        durability: data.durability || null,
        powerDensity: data.powerDensity || null,
        currentDensity: data.currentDensity || null,
        cost: data.cost || null,
        sustainability: data.sustainability || null,
        availability: data.availability || null,
        description: data.description || null,
        advantages: processJsonField(data.advantages),
        limitations: processJsonField(data.limitations),
        manufacturer: data.manufacturer || null,
        sourcesPapers: processJsonField(data.sourcesPapers),
        validatedBy: data.validatedBy || null,
        compatibleWith: processJsonField(data.compatibleWith),
        incompatibleWith: processJsonField(data.incompatibleWith),
        addedBy: data.addedBy || null,
        verified: data.verified || false
      }
    })
    
    return NextResponse.json(material, { status: 201 })
  } catch (error: any) {
    console.error('Error creating material:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Material with this ID already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    )
  }
}