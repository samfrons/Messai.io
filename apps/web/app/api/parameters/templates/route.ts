import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateParameterTemplate } from '@/lib/parameters/validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isOfficial = searchParams.get('official') === 'true'
    const isPublic = searchParams.get('public') !== 'false' // Default to true

    const where: any = { isPublic }
    
    if (category) where.category = category
    if (isOfficial !== undefined) where.isOfficial = isOfficial

    const templates = await db.parameterTemplate.findMany({
      where,
      orderBy: [
        { isOfficial: 'desc' }, // Official templates first
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ data: templates })

  } catch (error) {
    console.error('Error fetching parameter templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parameter templates' },
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
      schemaVersion = '1.0',
      templateSchema,
      defaultValues,
      description,
      isPublic = true
    } = body

    // Validate the template schema
    const validation = validateParameterTemplate(templateSchema)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid template schema',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const template = await db.parameterTemplate.create({
      data: {
        name,
        category,
        schemaVersion,
        templateSchema,
        defaultValues,
        description,
        isPublic,
        isOfficial: false // Only admins can create official templates
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    console.error('Error creating parameter template:', error)
    return NextResponse.json(
      { error: 'Failed to create parameter template' },
      { status: 500 }
    )
  }
}