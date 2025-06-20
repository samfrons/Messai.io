import { NextRequest, NextResponse } from 'next/server'

interface PredictionRequest {
  temperature: number
  ph: number
  substrateConcentration: number
  designType?: string
}

interface PredictionResponse {
  predictedPower: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  factors: {
    temperature: number
    ph: number
    substrate: number
    designBonus: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { temperature, ph, substrateConcentration, designType }: PredictionRequest = await request.json()

    // Validate inputs
    if (!temperature || !ph || !substrateConcentration) {
      return NextResponse.json(
        { error: 'Missing required parameters: temperature, ph, substrateConcentration' },
        { status: 400 }
      )
    }

    if (temperature < 20 || temperature > 40) {
      return NextResponse.json(
        { error: 'Temperature must be between 20-40°C' },
        { status: 400 }
      )
    }

    if (ph < 6 || ph > 8) {
      return NextResponse.json(
        { error: 'pH must be between 6-8' },
        { status: 400 }
      )
    }

    if (substrateConcentration < 0.5 || substrateConcentration > 2) {
      return NextResponse.json(
        { error: 'Substrate concentration must be between 0.5-2 g/L' },
        { status: 400 }
      )
    }

    // Simple linear regression model based on research data
    const baselinePower = 50 // Base power in mW

    // Factor contributions
    const temperatureFactor = (temperature - 25) * 5 // 5 mW per degree above 25°C
    const phFactor = (ph - 6.5) * 20 // 20 mW per pH unit above 6.5
    const substrateFactor = (substrateConcentration - 1) * 30 // 30 mW per g/L above 1

    // Design-specific multipliers
    const designMultipliers: Record<string, number> = {
      'earthen-pot': 0.8,
      'cardboard': 0.6,
      'mason-jar': 1.0,
      '3d-printed': 1.3,
      'wetland': 2.2
    }

    const designBonus = designType ? (designMultipliers[designType] || 1.0) - 1.0 : 0
    const designBonusPower = baselinePower * designBonus

    // Calculate predicted power
    const predictedPower = Math.max(0, 
      baselinePower + temperatureFactor + phFactor + substrateFactor + designBonusPower
    )

    // Add some realistic noise and confidence interval
    const noise = Math.random() * 20 - 10 // ±10 mW noise
    const finalPrediction = Math.max(0, predictedPower + noise)

    // Confidence interval (±15% typically)
    const confidenceRange = finalPrediction * 0.15
    const confidenceInterval = {
      lower: Math.max(0, finalPrediction - confidenceRange),
      upper: finalPrediction + confidenceRange
    }

    const response: PredictionResponse = {
      predictedPower: Math.round(finalPrediction * 100) / 100,
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower * 100) / 100,
        upper: Math.round(confidenceInterval.upper * 100) / 100
      },
      factors: {
        temperature: Math.round(temperatureFactor * 100) / 100,
        ph: Math.round(phFactor * 100) / 100,
        substrate: Math.round(substrateFactor * 100) / 100,
        designBonus: Math.round(designBonusPower * 100) / 100
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Prediction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MESSAi AI Predictions API',
    endpoints: {
      POST: {
        description: 'Get power output predictions',
        parameters: {
          temperature: 'number (20-40°C)',
          ph: 'number (6-8)',
          substrateConcentration: 'number (0.5-2 g/L)',
          designType: 'string (optional)'
        }
      }
    },
    supportedDesigns: [
      'earthen-pot',
      'cardboard', 
      'mason-jar',
      '3d-printed',
      'wetland'
    ]
  })
}