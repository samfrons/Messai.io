import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock AI predictions API
  http.post('/api/predictions', async ({ request }) => {
    const body = await request.json() as {
      temperature: number
      ph: number
      substrateConcentration: number
      designType: string
    }

    // Simulate AI prediction logic
    const basePower = 200
    const tempFactor = (body.temperature - 25) * 8
    const phFactor = (body.ph - 6.5) * 15
    const substrateFactor = body.substrateConcentration * 30
    
    const designBonus = {
      'earthen-pot': -10,
      'cardboard': -25,
      'mason-jar': 0,
      '3d-printed': 15,
      'wetland': 50,
      'micro-chip': -30,
      'isolinear-chip': -5,
      'benchtop-bioreactor': 80,
      'wastewater-treatment': 120,
      'brewery-processing': 90,
      'architectural-facade': 200,
      'benthic-fuel-cell': 60,
      'kitchen-sink': 25
    }[body.designType] || 0

    const predictedPower = basePower + tempFactor + phFactor + substrateFactor + designBonus
    const confidence = 0.15 // 15% confidence interval

    return HttpResponse.json({
      predictedPower: Math.max(50, predictedPower),
      confidenceInterval: {
        lower: Math.max(25, predictedPower * (1 - confidence)),
        upper: predictedPower * (1 + confidence)
      },
      factors: {
        temperature: tempFactor,
        ph: phFactor,
        substrate: substrateFactor,
        designBonus: designBonus
      }
    })
  }),

  // Mock experiment creation
  http.post('/api/experiments', async ({ request }) => {
    const body = await request.json() as Record<string, any>
    
    return HttpResponse.json({
      id: `exp-${Date.now()}`,
      ...body,
      status: 'setup',
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  // Mock experiment data fetch
  http.get('/api/experiments/:id', ({ params }) => {
    const { id } = params
    
    return HttpResponse.json({
      id,
      name: 'Test Experiment',
      designName: 'Mason Jar MFC',
      status: 'running',
      createdAt: '2024-01-15T10:00:00Z',
      parameters: {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2
      },
      measurements: Array.from({ length: 50 }, (_, i) => ({
        id: `m-${i}`,
        timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
        voltage: 0.4 + Math.random() * 0.3,
        current: 0.3 + Math.random() * 0.4,
        power: 150 + Math.random() * 100,
        temperature: 28 + Math.random() * 2,
        ph: 7 + Math.random() * 0.5
      }))
    })
  })
]

export const server = setupServer(...handlers)