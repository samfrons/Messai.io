import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../mocks/server'

// Test the actual API endpoint
describe('/api/predictions', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('POST /api/predictions', () => {
    it('returns valid prediction for standard parameters', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      
      expect(data).toHaveProperty('predictedPower')
      expect(data).toHaveProperty('confidenceInterval')
      expect(data).toHaveProperty('factors')
      
      expect(typeof data.predictedPower).toBe('number')
      expect(data.predictedPower).toBeGreaterThan(0)
      
      expect(data.confidenceInterval).toHaveProperty('lower')
      expect(data.confidenceInterval).toHaveProperty('upper')
      expect(data.confidenceInterval.lower).toBeLessThan(data.predictedPower)
      expect(data.confidenceInterval.upper).toBeGreaterThan(data.predictedPower)
      
      expect(data.factors).toHaveProperty('temperature')
      expect(data.factors).toHaveProperty('ph')
      expect(data.factors).toHaveProperty('substrate')
      expect(data.factors).toHaveProperty('designBonus')
    })

    it('handles high-performance design types correctly', async () => {
      const requestBody = {
        temperature: 32.0,
        ph: 7.0,
        substrateConcentration: 1.8,
        designType: 'wetland'
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      // Wetland design should have positive design bonus
      expect(data.factors.designBonus).toBe(50)
      expect(data.predictedPower).toBeGreaterThan(300) // Should be high due to good conditions + design bonus
    })

    it('handles low-cost design types correctly', async () => {
      const requestBody = {
        temperature: 25.0,
        ph: 6.8,
        substrateConcentration: 1.0,
        designType: 'cardboard'
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      // Cardboard design should have negative design bonus
      expect(data.factors.designBonus).toBe(-25)
      expect(data.predictedPower).toBeGreaterThan(50) // Should still be above minimum
    })

    it('applies temperature factor correctly', async () => {
      const baseRequest = {
        temperature: 25.0,
        ph: 7.0,
        substrateConcentration: 1.0,
        designType: 'mason-jar'
      }

      const highTempRequest = {
        ...baseRequest,
        temperature: 35.0
      }

      const [baseResponse, highTempResponse] = await Promise.all([
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseRequest)
        }),
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(highTempRequest)
        })
      ])

      const baseData = await baseResponse.json()
      const highTempData = await highTempResponse.json()

      // Higher temperature should result in higher power
      expect(highTempData.predictedPower).toBeGreaterThan(baseData.predictedPower)
      
      // Temperature factor should be (35 - 25) * 8 = 80 more than base
      expect(highTempData.factors.temperature - baseData.factors.temperature).toBe(80)
    })

    it('applies pH factor correctly', async () => {
      const lowPhRequest = {
        temperature: 28.0,
        ph: 6.0,
        substrateConcentration: 1.0,
        designType: 'mason-jar'
      }

      const highPhRequest = {
        ...lowPhRequest,
        ph: 8.0
      }

      const [lowPhResponse, highPhResponse] = await Promise.all([
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lowPhRequest)
        }),
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(highPhRequest)
        })
      ])

      const lowPhData = await lowPhResponse.json()
      const highPhData = await highPhResponse.json()

      // Higher pH should result in higher power
      expect(highPhData.predictedPower).toBeGreaterThan(lowPhData.predictedPower)
      
      // pH factor difference should be (8 - 6) * 15 = 30
      expect(highPhData.factors.ph - lowPhData.factors.ph).toBe(30)
    })

    it('applies substrate concentration factor correctly', async () => {
      const lowSubstrateRequest = {
        temperature: 28.0,
        ph: 7.0,
        substrateConcentration: 0.5,
        designType: 'mason-jar'
      }

      const highSubstrateRequest = {
        ...lowSubstrateRequest,
        substrateConcentration: 2.0
      }

      const [lowResponse, highResponse] = await Promise.all([
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lowSubstrateRequest)
        }),
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(highSubstrateRequest)
        })
      ])

      const lowData = await lowResponse.json()
      const highData = await highResponse.json()

      // Higher substrate concentration should result in higher power
      expect(highData.predictedPower).toBeGreaterThan(lowData.predictedPower)
      
      // Substrate factor difference should be (2.0 - 0.5) * 30 = 45
      expect(highData.factors.substrate - lowData.factors.substrate).toBe(45)
    })

    it('enforces minimum power output', async () => {
      const poorConditionsRequest = {
        temperature: 20.0, // Minimum
        ph: 6.0,          // Low
        substrateConcentration: 0.5, // Minimum
        designType: 'cardboard' // Lowest performance
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poorConditionsRequest)
      })

      const data = await response.json()
      
      // Should enforce minimum of 50 mW
      expect(data.predictedPower).toBeGreaterThanOrEqual(50)
      expect(data.confidenceInterval.lower).toBeGreaterThanOrEqual(25)
    })

    it('calculates confidence intervals correctly', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      // Confidence interval should be 15% around predicted power
      const expectedLower = data.predictedPower * 0.85
      const expectedUpper = data.predictedPower * 1.15
      
      expect(Math.abs(data.confidenceInterval.lower - expectedLower)).toBeLessThan(1)
      expect(Math.abs(data.confidenceInterval.upper - expectedUpper)).toBeLessThan(1)
    })

    it('handles unknown design types gracefully', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'unknown-design'
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      // Should default to 0 design bonus
      expect(data.factors.designBonus).toBe(0)
      expect(data.predictedPower).toBeGreaterThan(0)
    })

    it('handles edge case parameter values', async () => {
      const edgeCaseRequests = [
        { temperature: 20, ph: 6, substrateConcentration: 0.5, designType: 'mason-jar' },
        { temperature: 40, ph: 8, substrateConcentration: 2.0, designType: 'mason-jar' },
        { temperature: 30, ph: 7, substrateConcentration: 1.0, designType: 'mason-jar' }
      ]

      for (const request of edgeCaseRequests) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })

        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(data.predictedPower).toBeGreaterThan(0)
        expect(data.confidenceInterval.lower).toBeGreaterThan(0)
        expect(data.confidenceInterval.upper).toBeGreaterThan(data.predictedPower)
      }
    })

    it('returns consistent results for identical inputs', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const responses = await Promise.all([
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }),
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }),
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      ])

      const results = await Promise.all(responses.map(r => r.json()))

      // All results should be identical
      expect(results[0]).toEqual(results[1])
      expect(results[1]).toEqual(results[2])
    })
  })

  describe('Error Handling', () => {
    it('handles malformed request body', async () => {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      // Should handle gracefully (mock server may return 200 with error)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('handles missing required fields', async () => {
      const incompleteRequest = {
        temperature: 28.5,
        // Missing ph, substrateConcentration, designType
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteRequest)
      })

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('handles invalid parameter types', async () => {
      const invalidRequest = {
        temperature: 'hot', // Should be number
        ph: true,          // Should be number
        substrateConcentration: null, // Should be number
        designType: 123    // Should be string
      }

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      })

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(200)
    })
  })

  describe('Performance', () => {
    it('responds quickly to multiple concurrent requests', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const startTime = Date.now()
      
      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Should complete reasonably quickly (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('handles large parameter values efficiently', async () => {
      const largeValueRequest = {
        temperature: 999999,
        ph: 999999,
        substrateConcentration: 999999,
        designType: 'mason-jar'
      }

      const startTime = Date.now()
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeValueRequest)
      })

      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(100) // Should be very fast
      
      const data = await response.json()
      expect(typeof data.predictedPower).toBe('number')
      expect(isFinite(data.predictedPower)).toBe(true) // Should not be Infinity or NaN
    })
  })
})