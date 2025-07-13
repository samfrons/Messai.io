import { NextRequest, NextResponse } from 'next/server'
import { validateConfiguration, validateParameter, getValidationRules } from '@/reference/validation/validation-functions'

// Get parameter information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const name = searchParams.get('name')
    const type = searchParams.get('type')

    // Load validation rules
    const validationRules = getValidationRules()

    // If specific parameter requested
    if (name) {
      // Find parameter in validation rules
      let parameterData = null
      for (const [categoryName, categoryData] of Object.entries(validationRules.categories)) {
        if (categoryData[name]) {
          parameterData = {
            name,
            category: categoryName,
            ...categoryData[name]
          }
          break
        }
      }

      if (!parameterData) {
        return NextResponse.json(
          { error: `Parameter '${name}' not found` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        parameter: parameterData,
        timestamp: new Date().toISOString()
      })
    }

    // If category requested
    if (category) {
      const categoryData = validationRules.categories[category]
      if (!categoryData) {
        return NextResponse.json(
          { error: `Category '${category}' not found` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        category,
        parameters: Object.keys(categoryData).map(paramName => ({
          name: paramName,
          ...categoryData[paramName]
        })),
        timestamp: new Date().toISOString()
      })
    }

    // Return all categories
    const categories = Object.keys(validationRules.categories).map(categoryName => ({
      name: categoryName,
      parameterCount: Object.keys(validationRules.categories[categoryName]).length,
      parameters: Object.keys(validationRules.categories[categoryName])
    }))

    return NextResponse.json({
      categories,
      totalParameters: categories.reduce((sum, cat) => sum + cat.parameterCount, 0),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Parameters API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Validate parameter values
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parameterName, value, unit, configuration } = body

    // Validate single parameter
    if (parameterName && value !== undefined) {
      const result = validateParameter(parameterName, value, unit)
      return NextResponse.json({
        validation: result,
        parameter: parameterName,
        value,
        unit,
        timestamp: new Date().toISOString()
      })
    }

    // Validate complete configuration
    if (configuration) {
      const result = validateConfiguration(configuration)
      return NextResponse.json({
        validation: result,
        configuration,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Missing parameterName and value, or configuration' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Parameter validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}