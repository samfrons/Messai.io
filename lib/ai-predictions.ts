export interface PredictionInput {
  temperature: number
  ph: number
  substrateConcentration: number
  designType?: string
}

export interface PredictionResult {
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

export async function getPowerPrediction(input: PredictionInput): Promise<PredictionResult> {
  try {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`Prediction API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get prediction:', error)
    
    // Fallback to simple client-side calculation
    return getSimplePrediction(input)
  }
}

export function getSimplePrediction(input: PredictionInput): PredictionResult {
  const { temperature, ph, substrateConcentration, designType } = input
  
  // Simple linear model
  const baselinePower = 50
  const temperatureFactor = (temperature - 25) * 5
  const phFactor = (ph - 6.5) * 20
  const substrateFactor = (substrateConcentration - 1) * 30
  
  const designMultipliers: Record<string, number> = {
    'earthen-pot': 0.8,
    'cardboard': 0.6,
    'mason-jar': 1.0,
    '3d-printed': 1.3,
    'wetland': 2.2
  }
  
  const designBonus = designType ? (designMultipliers[designType] || 1.0) - 1.0 : 0
  const designBonusPower = baselinePower * designBonus
  
  const predictedPower = Math.max(0, 
    baselinePower + temperatureFactor + phFactor + substrateFactor + designBonusPower
  )
  
  const confidenceRange = predictedPower * 0.15
  
  return {
    predictedPower: Math.round(predictedPower * 100) / 100,
    confidenceInterval: {
      lower: Math.max(0, Math.round((predictedPower - confidenceRange) * 100) / 100),
      upper: Math.round((predictedPower + confidenceRange) * 100) / 100
    },
    factors: {
      temperature: Math.round(temperatureFactor * 100) / 100,
      ph: Math.round(phFactor * 100) / 100,
      substrate: Math.round(substrateFactor * 100) / 100,
      designBonus: Math.round(designBonusPower * 100) / 100
    }
  }
}