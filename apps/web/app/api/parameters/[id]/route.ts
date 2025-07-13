import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateParameterSet, calculateParameterCompleteness, getParameterValidationErrors } from '@/lib/parameters/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parameterSet = await db.parameterSet.findUnique({
      where: { id: params.id },
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
                doi: true,
                authors: true,
                publicationDate: true
              }
            }
          }
        },
        experiments: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    if (!parameterSet) {
      return NextResponse.json(
        { error: 'Parameter set not found' },
        { status: 404 }
      )
    }

    // Add computed fields
    const completeness = calculateParameterCompleteness({
      environmentalParams: parameterSet.environmentalParams,
      biologicalParams: parameterSet.biologicalParams,
      materialParams: parameterSet.materialParams,
      operationalParams: parameterSet.operationalParams,
      performanceParams: parameterSet.performanceParams,
      economicParams: parameterSet.economicParams,
      safetyParams: parameterSet.safetyParams,
      monitoringParams: parameterSet.monitoringParams
    })

    return NextResponse.json({
      ...parameterSet,
      completeness,
      experimentCount: parameterSet.experiments.length,
      paperCount: parameterSet.papers.length
    })

  } catch (error) {
    console.error('Error fetching parameter set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parameter set' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      tags,
      description
    } = body

    // Check if parameter set exists
    const existing = await db.parameterSet.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Parameter set not found' },
        { status: 404 }
      )
    }

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

    const updatedParameterSet = await db.parameterSet.update({
      where: { id: params.id },
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
        validationScore,
        tags,
        description
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
      ...updatedParameterSet,
      completeness: validationScore
    })

  } catch (error) {
    console.error('Error updating parameter set:', error)
    return NextResponse.json(
      { error: 'Failed to update parameter set' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if parameter set exists
    const existing = await db.parameterSet.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            experiments: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Parameter set not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if parameter set is used by experiments
    if (existing._count.experiments > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete parameter set that is used by experiments',
          experimentCount: existing._count.experiments
        },
        { status: 400 }
      )
    }

    await db.parameterSet.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting parameter set:', error)
    return NextResponse.json(
      { error: 'Failed to delete parameter set' },
      { status: 500 }
    )
  }
}