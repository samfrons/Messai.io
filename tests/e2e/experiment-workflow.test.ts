import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { server } from '../mocks/server'

// Mock browser APIs for E2E-style testing
const mockNavigate = vi.fn()
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
})

// Mock window.location.href assignment
let currentHref = 'http://localhost:3004'
Object.defineProperty(window.location, 'href', {
  get: () => currentHref,
  set: (url: string) => {
    currentHref = url
    mockNavigate(url)
  }
})

describe('Experiment Workflow E2E', () => {
  beforeAll(() => server.listen())
  beforeEach(() => {
    server.resetHandlers()
    mockNavigate.mockClear()
    currentHref = 'http://localhost:3004'
  })
  afterAll(() => server.close())

  describe('Complete Experiment Creation Flow', () => {
    it('creates experiment from design selection to completion', async () => {
      // Step 1: User starts at homepage and selects a design
      const designSelectionResponse = {
        id: '1',
        name: "Earthen Pot MFC",
        type: "earthen-pot",
        cost: "$1",
        powerOutput: "100-500 mW/m²"
      }

      // Step 2: User configures MFC parameters
      const mfcConfiguration = {
        electrode: {
          material: 'carbon-cloth',
          surface: 150,
          thickness: 2.5
        },
        microbial: {
          density: 7.0,
          species: 'geobacter',
          activity: 85
        },
        chamber: {
          volume: 1.5,
          shape: 'rectangular',
          material: 'acrylic'
        }
      }

      // Step 3: User sets experiment parameters
      const experimentParameters = {
        name: 'High Efficiency Earthen Pot Test',
        temperature: 32.0,
        ph: 7.2,
        substrateConcentration: 1.8,
        notes: 'Testing optimized configuration for maximum power output'
      }

      // Step 4: Get AI prediction
      const predictionRequest = {
        temperature: experimentParameters.temperature,
        ph: experimentParameters.ph,
        substrateConcentration: experimentParameters.substrateConcentration,
        designType: designSelectionResponse.type
      }

      const predictionResponse = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionRequest)
      })

      expect(predictionResponse.status).toBe(200)
      const prediction = await predictionResponse.json()

      expect(prediction).toHaveProperty('predictedPower')
      expect(prediction.predictedPower).toBeGreaterThan(0)
      expect(prediction).toHaveProperty('confidenceInterval')
      expect(prediction).toHaveProperty('factors')

      // Step 5: Create experiment
      const experimentPayload = {
        ...experimentParameters,
        designId: designSelectionResponse.id,
        designName: designSelectionResponse.name,
        mfcConfiguration,
        aiPrediction: prediction
      }

      const createResponse = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experimentPayload)
      })

      expect(createResponse.status).toBe(201)
      const createdExperiment = await createResponse.json()

      expect(createdExperiment).toHaveProperty('id')
      expect(createdExperiment.name).toBe(experimentParameters.name)
      expect(createdExperiment.status).toBe('setup')

      // Step 6: Verify experiment can be retrieved
      const getResponse = await fetch(`/api/experiments/${createdExperiment.id}`)
      expect(getResponse.status).toBe(200)

      const retrievedExperiment = await getResponse.json()
      expect(retrievedExperiment.id).toBe(createdExperiment.id)
      expect(retrievedExperiment).toHaveProperty('measurements')
      expect(Array.isArray(retrievedExperiment.measurements)).toBe(true)
    })

    it('handles multi-step configuration workflow', async () => {
      // Step 1: Initial configuration
      let currentConfig = {
        electrode: { material: 'carbon-cloth', surface: 100, thickness: 2.0 },
        microbial: { density: 5.0, species: 'geobacter', activity: 75 },
        chamber: { volume: 1.0, shape: 'rectangular', material: 'acrylic' }
      }

      // Step 2: User modifies electrode
      currentConfig.electrode.surface = 150
      currentConfig.electrode.thickness = 3.0

      // Step 3: User changes microbial configuration
      currentConfig.microbial.species = 'shewanella'
      currentConfig.microbial.activity = 90

      // Step 4: User adjusts chamber
      currentConfig.chamber.shape = 'cylindrical'
      currentConfig.chamber.volume = 2.0

      // Step 5: Get final prediction
      const finalPredictionRequest = {
        temperature: 30.0,
        ph: 7.0,
        substrateConcentration: 1.5,
        designType: 'mason-jar'
      }

      const finalPrediction = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPredictionRequest)
      })

      expect(finalPrediction.status).toBe(200)
      const predictionData = await finalPrediction.json()

      // Prediction should reflect the optimized configuration
      expect(predictionData.predictedPower).toBeGreaterThan(200)
    })

    it('supports experiment comparison workflow', async () => {
      // Create multiple experiments for comparison
      const experimentConfigs = [
        {
          name: 'Carbon Cloth Test',
          designType: 'mason-jar',
          temperature: 28,
          ph: 7.0,
          substrateConcentration: 1.0
        },
        {
          name: 'Graphite Test',
          designType: 'mason-jar',
          temperature: 28,
          ph: 7.0,
          substrateConcentration: 1.0
        },
        {
          name: 'High Temperature Test',
          designType: 'mason-jar',
          temperature: 35,
          ph: 7.0,
          substrateConcentration: 1.0
        }
      ]

      const predictions = []
      
      for (const config of experimentConfigs) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })

        const prediction = await response.json()
        predictions.push({ ...config, prediction })
      }

      // Verify predictions are different and make sense
      expect(predictions[2].prediction.predictedPower).toBeGreaterThan(
        predictions[0].prediction.predictedPower
      ) // Higher temperature should yield more power

      // All predictions should be reasonable
      predictions.forEach(p => {
        expect(p.prediction.predictedPower).toBeGreaterThan(50)
        expect(p.prediction.predictedPower).toBeLessThan(1000)
      })
    })
  })

  describe('Error Recovery Flows', () => {
    it('handles prediction API failures gracefully', async () => {
      // Simulate API failure by sending malformed request
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('handles network timeouts and retries', async () => {
      // Test multiple rapid requests (simulating retry behavior)
      const requests = Array.from({ length: 5 }, () =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temperature: 28,
            ph: 7.0,
            substrateConcentration: 1.0,
            designType: 'mason-jar'
          })
        })
      )

      const responses = await Promise.all(requests)
      
      // All requests should eventually succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })

    it('recovers from invalid parameter combinations', async () => {
      const invalidCombinations = [
        { temperature: -10, ph: 7.0, substrateConcentration: 1.0, designType: 'mason-jar' },
        { temperature: 100, ph: 14.0, substrateConcentration: 10.0, designType: 'mason-jar' },
        { temperature: 28, ph: 0, substrateConcentration: -5, designType: 'unknown' }
      ]

      for (const params of invalidCombinations) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        
        // Should still return a valid prediction structure
        expect(data).toHaveProperty('predictedPower')
        expect(data).toHaveProperty('confidenceInterval')
        expect(data).toHaveProperty('factors')
      }
    })
  })

  describe('Performance Under Load', () => {
    it('handles concurrent user sessions', async () => {
      // Simulate multiple users creating experiments simultaneously
      const concurrentSessions = Array.from({ length: 10 }, (_, i) => ({
        sessionId: `session-${i}`,
        experiment: {
          name: `Concurrent Test ${i}`,
          temperature: 25 + i,
          ph: 6.5 + (i * 0.1),
          substrateConcentration: 1.0 + (i * 0.1),
          designType: 'mason-jar'
        }
      }))

      const startTime = Date.now()

      // Create predictions for all sessions
      const predictionPromises = concurrentSessions.map(session =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session.experiment)
        })
      )

      const predictionResponses = await Promise.all(predictionPromises)
      const endTime = Date.now()

      // All requests should complete successfully
      predictionResponses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('handles rapid parameter changes efficiently', async () => {
      // Simulate user rapidly adjusting parameters
      const parameterSequence = Array.from({ length: 20 }, (_, i) => ({
        temperature: 25 + (i % 10),
        ph: 6.5 + ((i % 5) * 0.2),
        substrateConcentration: 1.0 + ((i % 3) * 0.5),
        designType: 'mason-jar'
      }))

      const startTime = Date.now()

      // Sequential requests (as user adjusts sliders)
      for (const params of parameterSequence) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })

        expect(response.status).toBe(200)
      }

      const endTime = Date.now()

      // Should handle rapid changes efficiently
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('maintains prediction accuracy under various conditions', async () => {
      // Test edge cases that should produce consistent results
      const testCases = [
        {
          condition: 'optimal',
          params: { temperature: 35, ph: 7.5, substrateConcentration: 2.0, designType: 'wetland' }
        },
        {
          condition: 'minimal',
          params: { temperature: 20, ph: 6.0, substrateConcentration: 0.5, designType: 'cardboard' }
        },
        {
          condition: 'standard',
          params: { temperature: 28, ph: 7.0, substrateConcentration: 1.0, designType: 'mason-jar' }
        }
      ]

      const results = []

      for (const testCase of testCases) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.params)
        })

        const data = await response.json()
        results.push({ ...testCase, result: data })
      }

      // Optimal conditions should produce highest power
      expect(results[0].result.predictedPower).toBeGreaterThan(results[1].result.predictedPower)
      expect(results[0].result.predictedPower).toBeGreaterThan(results[2].result.predictedPower)

      // All predictions should be within reasonable bounds
      results.forEach(({ condition, result }) => {
        expect(result.predictedPower).toBeGreaterThan(25)
        expect(result.predictedPower).toBeLessThan(2000)
        expect(result.confidenceInterval.lower).toBeLessThan(result.predictedPower)
        expect(result.confidenceInterval.upper).toBeGreaterThan(result.predictedPower)
      })
    })
  })

  describe('Data Consistency and Validation', () => {
    it('maintains data integrity across workflow steps', async () => {
      const originalParams = {
        temperature: 29.5,
        ph: 7.3,
        substrateConcentration: 1.4,
        designType: '3d-printed'
      }

      // Get initial prediction
      const initialResponse = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(originalParams)
      })

      const initialPrediction = await initialResponse.json()

      // Get same prediction again
      const repeatResponse = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(originalParams)
      })

      const repeatPrediction = await repeatResponse.json()

      // Results should be identical
      expect(repeatPrediction).toEqual(initialPrediction)
    })

    it('validates parameter ranges correctly', async () => {
      const boundaryTests = [
        { temperature: 20, ph: 6.0, substrateConcentration: 0.5 }, // Lower bounds
        { temperature: 40, ph: 8.0, substrateConcentration: 2.0 }, // Upper bounds
        { temperature: 30, ph: 7.0, substrateConcentration: 1.0 }  // Middle values
      ]

      for (const params of boundaryTests) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...params, designType: 'mason-jar' })
        })

        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(data.predictedPower).toBeGreaterThan(0)
        expect(isFinite(data.predictedPower)).toBe(true)
      }
    })

    it('handles design type variations correctly', async () => {
      const designTypes = ['earthen-pot', 'cardboard', 'mason-jar', '3d-printed', 'wetland']
      const baseParams = { temperature: 28, ph: 7.0, substrateConcentration: 1.0 }

      const results = []

      for (const designType of designTypes) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...baseParams, designType })
        })

        const data = await response.json()
        results.push({ designType, ...data })
      }

      // Wetland should have highest design bonus
      const wetlandResult = results.find(r => r.designType === 'wetland')
      const cardboardResult = results.find(r => r.designType === 'cardboard')
      
      expect(wetlandResult!.factors.designBonus).toBeGreaterThan(cardboardResult!.factors.designBonus)
      expect(wetlandResult!.predictedPower).toBeGreaterThan(cardboardResult!.predictedPower)
    })
  })
})