import { NextRequest, NextResponse } from 'next/server'
import { validateParameterSet, calculateParameterCompleteness, getParameterValidationErrors } from '@/lib/parameters/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      environmentalParams,
      biologicalParams,
      materialParams,
      operationalParams,
      performanceParams,
      economicParams,
      safetyParams,
      monitoringParams
    } = body

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
    const completeness = calculateParameterCompleteness(parameterData)
    
    if (validation.success) {
      return NextResponse.json({
        valid: true,
        completeness,
        validationScore: Math.min(completeness, 100),
        data: validation.data
      })
    } else {
      return NextResponse.json({
        valid: false,
        completeness,
        validationScore: 0,
        errors: getParameterValidationErrors(parameterData)
      })
    }

  } catch (error) {
    console.error('Error validating parameters:', error)
    return NextResponse.json(
      { error: 'Failed to validate parameters' },
      { status: 500 }
    )
  }
}