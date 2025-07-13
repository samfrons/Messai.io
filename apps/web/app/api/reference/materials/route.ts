import { NextRequest, NextResponse } from 'next/server'
import { checkMaterialCompatibility, getValidationRules } from '@/reference/validation/validation-functions'

// Get material information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'anode' or 'cathode'
    const material = searchParams.get('material')
    const application = searchParams.get('application')

    // Load validation rules
    const validationRules = getValidationRules()
    const compatibilityRules = validationRules.compatibility_rules

    // Get specific material info
    if (material && type) {
      const materialKey = type === 'anode' ? 'anode_materials' : 'cathode_materials'
      const materialData = compatibilityRules[materialKey][material]

      if (!materialData) {
        return NextResponse.json(
          { error: `Material '${material}' not found in ${type} category` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        material,
        type,
        properties: materialData,
        timestamp: new Date().toISOString()
      })
    }

    // Get all materials by type
    if (type) {
      const materialKey = type === 'anode' ? 'anode_materials' : 'cathode_materials'
      const materials = compatibilityRules[materialKey]

      if (!materials) {
        return NextResponse.json(
          { error: `Invalid material type: ${type}` },
          { status: 400 }
        )
      }

      return NextResponse.json({
        type,
        materials: Object.keys(materials).map(materialName => ({
          name: materialName,
          ...materials[materialName]
        })),
        count: Object.keys(materials).length,
        timestamp: new Date().toISOString()
      })
    }

    // Return all materials
    return NextResponse.json({
      anodes: {
        materials: Object.keys(compatibilityRules.anode_materials).map(name => ({
          name,
          ...compatibilityRules.anode_materials[name]
        })),
        count: Object.keys(compatibilityRules.anode_materials).length
      },
      cathodes: {
        materials: Object.keys(compatibilityRules.cathode_materials).map(name => ({
          name,
          ...compatibilityRules.cathode_materials[name]
        })),
        count: Object.keys(compatibilityRules.cathode_materials).length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Materials API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check material compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anodeMaterial, cathodeMaterial, microorganism } = body

    if (!anodeMaterial || !cathodeMaterial) {
      return NextResponse.json(
        { error: 'Both anodeMaterial and cathodeMaterial are required' },
        { status: 400 }
      )
    }

    const compatibilityResult = checkMaterialCompatibility(
      anodeMaterial,
      cathodeMaterial,
      microorganism
    )

    // Get additional material information
    const validationRules = getValidationRules()
    const anodeInfo = validationRules.compatibility_rules.anode_materials[anodeMaterial]
    const cathodeInfo = validationRules.compatibility_rules.cathode_materials[cathodeMaterial]

    return NextResponse.json({
      compatibility: compatibilityResult,
      materials: {
        anode: {
          name: anodeMaterial,
          info: anodeInfo || null
        },
        cathode: {
          name: cathodeMaterial,
          info: cathodeInfo || null
        }
      },
      microorganism: microorganism || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Material compatibility error:', error)
    return NextResponse.json(
      { error: 'Compatibility check failed' },
      { status: 500 }
    )
  }
}