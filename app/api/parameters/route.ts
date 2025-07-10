import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateParameterSet, calculateParameterCompleteness, getParameterValidationErrors } from '@/lib/parameters/validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const source = searchParams.get('source')
    const userId = searchParams.get('userId')
    const tags = searchParams.get('tags')?.split(',')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (category) where.category = category
    if (subcategory) where.subcategory = subcategory
    if (source) where.source = source
    if (userId) where.userId = userId
    if (tags?.length) {
      where.tags = {
        hasSome: tags
      }
    }

    const [parameterSets, total] = await Promise.all([
      db.parameterSet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          papers: {
            include: {
              paper: {
                select: {
                  id: true,
                  title: true,
                  doi: true
                }
              }
            }
          },
          _count: {
            select: {
              experiments: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      db.parameterSet.count({ where })
    ])

    // Add computed fields
    const enhancedParameterSets = parameterSets.map(paramSet => ({
      ...paramSet,
      completeness: calculateParameterCompleteness({
        environmentalParams: paramSet.environmentalParams,
        biologicalParams: paramSet.biologicalParams,
        materialParams: paramSet.materialParams,
        operationalParams: paramSet.operationalParams,
        performanceParams: paramSet.performanceParams,
        economicParams: paramSet.economicParams,
        safetyParams: paramSet.safetyParams,
        monitoringParams: paramSet.monitoringParams
      }),
      experimentCount: paramSet._count.experiments,
      paperCount: paramSet.papers.length
    }))

    return NextResponse.json({
      data: enhancedParameterSets,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Error fetching parameter sets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parameter sets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      subcategory,
      environmentalParams,
      biologicalParams,
      materialParams,
      operationalParams,
      performanceParams,
      economicParams,
      safetyParams,
      monitoringParams,
      source = 'user',
      tags = [],
      description,
      userId
    } = body

    // Validate the parameter structure
    const parameterData = {
      environmentalParams,
      biologicalParams,
      materialParams,
      operationalParams,
      performanceParams,
      economicParams,
      safetyParams,
      monitoringParams
    }

    const validation = validateParameterSet(parameterData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parameter validation failed',
          details: getParameterValidationErrors(parameterData)
        },
        { status: 400 }
      )
    }

    // Calculate validation scores
    const completeness = calculateParameterCompleteness(parameterData)
    const validationScore = Math.min(completeness, 100)

    const parameterSet = await db.parameterSet.create({
      data: {
        name,
        category,
        subcategory,
        environmentalParams,
        biologicalParams,
        materialParams,
        operationalParams,
        performanceParams,
        economicParams,
        safetyParams,
        monitoringParams,
        source,
        validationScore,
        tags,
        description,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      ...parameterSet,
      completeness: validationScore
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating parameter set:', error)
    return NextResponse.json(
      { error: 'Failed to create parameter set' },
      { status: 500 }
    )
  }
}