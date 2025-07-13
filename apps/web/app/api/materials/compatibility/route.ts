import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAllElectrodes, calculateCostEffectiveness } from '@messai/core'

// GET /api/materials/compatibility - Check material compatibility and performance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const anodeMaterial = searchParams.get('anode')
    const cathodeMaterial = searchParams.get('cathode')
    const systemType = searchParams.get('systemType') // MFC, MEC, MDC, MES
    const operatingTemp = searchParams.get('operatingTemp')
    const operatingPH = searchParams.get('operatingPH')
    const maxCost = searchParams.get('maxCost')
    const prioritize = searchParams.get('prioritize') || 'performance' // performance, sustainability, cost
    
    if (!anodeMaterial && !cathodeMaterial) {
      return NextResponse.json(
        { error: 'At least one material (anode or cathode) must be specified' },
        { status: 400 }
      )
    }
    
    const results: any = {
      compatibility: {
        score: 0,
        issues: [],
        recommendations: []
      },
      performance: {
        predictedPowerDensity: 0,
        predictedEfficiency: 0,
        costEffectiveness: 0
      },
      materials: {
        anode: null,
        cathode: null
      },
      alternativeOptions: []
    }
    
    // Get materials from database or core package
    let anodeData: any = null
    let cathodeData: any = null
    
    if (anodeMaterial) {
      // Try database first
      anodeData = await prisma.materialParameter.findUnique({
        where: { materialId: anodeMaterial }
      })
      
      // Fallback to core package
      if (!anodeData) {
        const coreElectrodes = getAllElectrodes()
        const coreMaterial = coreElectrodes.find(m => 
          m.name.toLowerCase().replace(/ /g, '-') === anodeMaterial
        )
        if (coreMaterial) {
          anodeData = {
            materialId: anodeMaterial,
            name: coreMaterial.name,
            type: coreMaterial.type,
            conductivity: coreMaterial.conductivity,
            surfaceArea: coreMaterial.surfaceArea,
            cost: coreMaterial.cost,
            sustainability: coreMaterial.sustainability,
            description: coreMaterial.description,
            advantages: JSON.stringify(coreMaterial.advantages),
            limitations: JSON.stringify(coreMaterial.limitations),
            compatibleWith: null,
            incompatibleWith: null
          }
        }
      }
      results.materials.anode = anodeData
    }
    
    if (cathodeMaterial) {
      // Try database first
      cathodeData = await prisma.materialParameter.findUnique({
        where: { materialId: cathodeMaterial }
      })
      
      // Fallback to core package
      if (!cathodeData) {
        const coreElectrodes = getAllElectrodes()
        const coreMaterial = coreElectrodes.find(m => 
          m.name.toLowerCase().replace(/ /g, '-') === cathodeMaterial
        )
        if (coreMaterial) {
          cathodeData = {
            materialId: cathodeMaterial,
            name: coreMaterial.name,
            type: coreMaterial.type,
            conductivity: coreMaterial.conductivity,
            surfaceArea: coreMaterial.surfaceArea,
            cost: coreMaterial.cost,
            sustainability: coreMaterial.sustainability,
            description: coreMaterial.description,
            advantages: JSON.stringify(coreMaterial.advantages),
            limitations: JSON.stringify(coreMaterial.limitations),
            compatibleWith: null,
            incompatibleWith: null
          }
        }
      }
      results.materials.cathode = cathodeData
    }
    
    // Check compatibility
    let compatibilityScore = 100
    const issues: string[] = []
    const recommendations: string[] = []
    
    if (anodeData && cathodeData) {
      // Check for known incompatibilities
      if (anodeData.incompatibleWith) {
        const incompatible = JSON.parse(anodeData.incompatibleWith)
        if (incompatible.includes(cathodeMaterial)) {
          compatibilityScore -= 50
          issues.push(`${anodeData.name} is known to be incompatible with ${cathodeData.name}`)
        }
      }
      
      // Check conductivity match
      const conductivityRatio = Math.max(anodeData.conductivity, cathodeData.conductivity) / 
                               Math.min(anodeData.conductivity, cathodeData.conductivity)
      if (conductivityRatio > 10) {
        compatibilityScore -= 20
        issues.push('Large conductivity mismatch may cause uneven current distribution')
        recommendations.push('Consider materials with more similar conductivities')
      }
      
      // Check cost compatibility
      const totalCost = (anodeData.cost || 0) + (cathodeData.cost || 0)
      if (maxCost && totalCost > parseFloat(maxCost)) {
        compatibilityScore -= 15
        issues.push(`Total material cost (${totalCost}) exceeds budget (${maxCost})`)
        recommendations.push('Consider lower-cost alternative materials')
      }
      
      // System-specific compatibility
      if (systemType === 'MEC' && cathodeData.type === 'metal' && !cathodeData.name.includes('platinum')) {
        compatibilityScore -= 10
        recommendations.push('MECs typically benefit from platinum or platinum-group cathodes for hydrogen evolution')
      }
      
      if (systemType === 'MDC' && !anodeData.name.toLowerCase().includes('salt')) {
        recommendations.push('Consider salt-tolerant anode materials for desalination applications')
      }
    }
    
    // Environmental compatibility
    if (operatingTemp) {
      const temp = parseFloat(operatingTemp)
      if (temp > 60) {
        compatibilityScore -= 15
        issues.push('High temperature operation may degrade polymer-based materials')
        recommendations.push('Consider ceramic or metal-based materials for high-temperature operation')
      }
    }
    
    if (operatingPH) {
      const ph = parseFloat(operatingPH)
      if (ph < 6 || ph > 8.5) {
        compatibilityScore -= 10
        issues.push('Extreme pH conditions may cause material degradation')
        recommendations.push('Verify material chemical stability at operating pH')
      }
    }
    
    results.compatibility.score = Math.max(0, compatibilityScore)
    results.compatibility.issues = issues
    results.compatibility.recommendations = recommendations
    
    // Performance prediction
    if (anodeData && cathodeData) {
      const anodeFactor = (anodeData.conductivity / 100) * (anodeData.surfaceArea / 1000)
      const cathodeFactor = (cathodeData.conductivity / 100) * (cathodeData.surfaceArea / 1000)
      
      // Base power density calculation
      let basePowerDensity = 25 // mW/m² baseline
      
      // System type multipliers
      const systemMultipliers = {
        'MFC': 1.0,
        'MEC': 0.8, // requires external voltage
        'MDC': 0.6, // desalination reduces efficiency
        'MES': 0.4  // synthesis is energy intensive
      }
      
      const systemMultiplier = systemMultipliers[systemType as keyof typeof systemMultipliers] || 1.0
      
      results.performance.predictedPowerDensity = 
        basePowerDensity * anodeFactor * cathodeFactor * systemMultiplier * (compatibilityScore / 100)
      
      results.performance.predictedEfficiency = 
        Math.min(95, 60 + (anodeFactor * 10) + (cathodeFactor * 5) + (compatibilityScore / 5))
      
      results.performance.costEffectiveness = 
        (results.performance.predictedPowerDensity * results.performance.predictedEfficiency) / 
        ((anodeData.cost || 50) + (cathodeData.cost || 50))
    }
    
    // Get alternative options
    const allMaterials = await prisma.materialParameter.findMany({
      where: {
        cost: maxCost ? { lte: parseFloat(maxCost) } : undefined
      },
      take: 5,
      orderBy: prioritize === 'sustainability' ? { sustainability: 'desc' } :
               prioritize === 'cost' ? { cost: 'asc' } :
               { conductivity: 'desc' }
    })
    
    // If no database materials, use core package
    if (allMaterials.length === 0) {
      const coreElectrodes = getAllElectrodes()
      const filteredCore = maxCost ? 
        coreElectrodes.filter(m => m.cost <= parseFloat(maxCost)) : 
        coreElectrodes
      
      results.alternativeOptions = filteredCore
        .sort((a, b) => {
          if (prioritize === 'sustainability') return b.sustainability - a.sustainability
          if (prioritize === 'cost') return a.cost - b.cost
          return (b.conductivity * b.surfaceArea) - (a.conductivity * a.surfaceArea)
        })
        .slice(0, 5)
        .map(material => ({
          materialId: material.name.toLowerCase().replace(/ /g, '-'),
          name: material.name,
          type: material.type,
          cost: material.cost,
          sustainability: material.sustainability,
          costEffectiveness: calculateCostEffectiveness(material),
          source: 'core'
        }))
    } else {
      results.alternativeOptions = allMaterials.slice(0, 5).map(material => ({
        materialId: material.materialId,
        name: material.name,
        type: material.type,
        cost: material.cost,
        sustainability: material.sustainability,
        costEffectiveness: material.cost ? 
          (material.conductivity || 100) * (material.surfaceArea || 100) / material.cost : 0,
        source: 'database'
      }))
    }
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error checking material compatibility:', error)
    return NextResponse.json(
      { error: 'Failed to check material compatibility' },
      { status: 500 }
    )
  }
}