import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { server } from '../mocks/server'

describe('Performance Tests', () => {
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  describe('API Performance', () => {
    it('predictions API responds within acceptable time limits', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const startTime = performance.now()
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(100) // Should respond within 100ms
    })

    it('handles concurrent requests efficiently', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      const concurrentRequests = 20
      const startTime = performance.now()

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      )

      const responses = await Promise.all(promises)
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(500) // All 20 requests within 500ms
      expect(totalTime / concurrentRequests).toBeLessThan(50) // Average under 50ms per request
    })

    it('maintains performance with large parameter values', async () => {
      const largeValueRequest = {
        temperature: 999999,
        ph: 999999,
        substrateConcentration: 999999,
        designType: 'mason-jar'
      }

      const startTime = performance.now()
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeValueRequest)
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(50) // Should still be very fast
      
      const data = await response.json()
      expect(isFinite(data.predictedPower)).toBe(true)
    })

    it('handles rapid sequential requests without degradation', async () => {
      const baseRequest = {
        temperature: 28,
        ph: 7.0,
        substrateConcentration: 1.0,
        designType: 'mason-jar'
      }

      const requestCount = 50
      const responseTimes: number[] = []

      for (let i = 0; i < requestCount; i++) {
        const request = {
          ...baseRequest,
          temperature: 25 + (i % 10) // Vary temperature
        }

        const startTime = performance.now()
        
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })

        const endTime = performance.now()
        responseTimes.push(endTime - startTime)

        expect(response.status).toBe(200)
      }

      // Calculate performance metrics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)

      expect(avgResponseTime).toBeLessThan(30) // Average under 30ms
      expect(maxResponseTime).toBeLessThan(100) // No request over 100ms
      expect(minResponseTime).toBeGreaterThan(0) // Sanity check

      // Performance should be consistent (max shouldn't be much higher than average)
      expect(maxResponseTime / avgResponseTime).toBeLessThan(5)
    })
  })

  describe('Memory Performance', () => {
    it('does not leak memory with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      // Make many requests to test for memory leaks
      for (let i = 0; i < 100; i++) {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('handles large data structures efficiently', async () => {
      // Create request with very long strings
      const largeRequest = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar',
        metadata: 'x'.repeat(10000) // Large string
      }

      const startTime = performance.now()
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeRequest)
      })

      const endTime = performance.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(200) // Should handle large data efficiently
    })
  })

  describe('Computational Performance', () => {
    it('prediction calculations are computationally efficient', async () => {
      // Test various combinations to ensure calculation complexity is reasonable
      const testCombinations = [
        { temperature: 20, ph: 6.0, substrateConcentration: 0.5, designType: 'cardboard' },
        { temperature: 25, ph: 6.5, substrateConcentration: 1.0, designType: 'earthen-pot' },
        { temperature: 30, ph: 7.0, substrateConcentration: 1.5, designType: 'mason-jar' },
        { temperature: 35, ph: 7.5, substrateConcentration: 2.0, designType: '3d-printed' },
        { temperature: 40, ph: 8.0, substrateConcentration: 2.0, designType: 'wetland' }
      ]

      const startTime = performance.now()

      const promises = testCombinations.map(params =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
      )

      const responses = await Promise.all(promises)
      const endTime = performance.now()

      // All calculations should complete quickly
      expect(endTime - startTime).toBeLessThan(100)

      // Verify all calculations completed successfully
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Verify calculation results are reasonable
      const results = await Promise.all(responses.map(r => r.json()))
      results.forEach(result => {
        expect(result.predictedPower).toBeGreaterThan(0)
        expect(result.predictedPower).toBeLessThan(10000)
        expect(isFinite(result.predictedPower)).toBe(true)
      })
    })

    it('handles edge case calculations without performance degradation', async () => {
      const edgeCases = [
        { temperature: 0, ph: 0, substrateConcentration: 0, designType: 'mason-jar' },
        { temperature: 1000, ph: 14, substrateConcentration: 100, designType: 'mason-jar' },
        { temperature: -50, ph: -5, substrateConcentration: -10, designType: 'mason-jar' },
        { temperature: 0.001, ph: 0.001, substrateConcentration: 0.001, designType: 'mason-jar' }
      ]

      const startTime = performance.now()

      for (const params of edgeCases) {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })

        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(isFinite(data.predictedPower)).toBe(true)
        expect(!isNaN(data.predictedPower)).toBe(true)
      }

      const endTime = performance.now()

      // Edge cases should not significantly impact performance
      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('Scalability Performance', () => {
    it('maintains performance with increasing load', async () => {
      const loadLevels = [1, 5, 10, 20, 50]
      const performanceResults: Array<{ load: number, avgTime: number }> = []

      for (const load of loadLevels) {
        const requestBody = {
          temperature: 28.5,
          ph: 7.1,
          substrateConcentration: 1.2,
          designType: 'mason-jar'
        }

        const startTime = performance.now()

        const promises = Array.from({ length: load }, () =>
          fetch('/api/predictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })
        )

        await Promise.all(promises)
        const endTime = performance.now()

        const avgTime = (endTime - startTime) / load
        performanceResults.push({ load, avgTime })
      }

      // Performance should scale reasonably (not exponentially worse)
      const lowLoadPerf = performanceResults[0].avgTime
      const highLoadPerf = performanceResults[performanceResults.length - 1].avgTime

      // High load should not be more than 10x slower per request than low load
      expect(highLoadPerf / lowLoadPerf).toBeLessThan(10)

      // All load levels should maintain reasonable performance
      performanceResults.forEach(result => {
        expect(result.avgTime).toBeLessThan(100) // Average under 100ms per request
      })
    })

    it('handles burst traffic patterns efficiently', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      // Simulate burst pattern: high load followed by low load
      const burstSize = 30
      const followUpSize = 5

      // Burst phase
      const burstStart = performance.now()
      const burstPromises = Array.from({ length: burstSize }, () =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      )

      await Promise.all(burstPromises)
      const burstEnd = performance.now()

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10))

      // Follow-up phase
      const followUpStart = performance.now()
      const followUpPromises = Array.from({ length: followUpSize }, () =>
        fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      )

      await Promise.all(followUpPromises)
      const followUpEnd = performance.now()

      const burstAvgTime = (burstEnd - burstStart) / burstSize
      const followUpAvgTime = (followUpEnd - followUpStart) / followUpSize

      // System should recover quickly after burst
      expect(burstAvgTime).toBeLessThan(50)
      expect(followUpAvgTime).toBeLessThan(30)

      // Follow-up requests should be faster (system has recovered)
      expect(followUpAvgTime).toBeLessThanOrEqual(burstAvgTime * 1.5)
    })
  })

  describe('Resource Utilization', () => {
    it('efficiently uses CPU resources', async () => {
      const requestBody = {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }

      // Monitor CPU-intensive operations
      const iterations = 100
      const startTime = process.hrtime.bigint()

      for (let i = 0; i < iterations; i++) {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      }

      const endTime = process.hrtime.bigint()
      const executionTime = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds

      // Should complete many iterations efficiently
      expect(executionTime / iterations).toBeLessThan(10) // Under 10ms per iteration average
    })

    it('handles different request patterns efficiently', async () => {
      const patterns = [
        { name: 'uniform', count: 20, delayMs: 0 },
        { name: 'spaced', count: 10, delayMs: 5 },
        { name: 'clustered', count: 30, delayMs: 0 }
      ]

      const results: Array<{ pattern: string, avgTime: number }> = []

      for (const pattern of patterns) {
        const requestBody = {
          temperature: 28.5,
          ph: 7.1,
          substrateConcentration: 1.2,
          designType: 'mason-jar'
        }

        const startTime = performance.now()

        for (let i = 0; i < pattern.count; i++) {
          await fetch('/api/predictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })

          if (pattern.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, pattern.delayMs))
          }
        }

        const endTime = performance.now()
        const avgTime = (endTime - startTime) / pattern.count

        results.push({ pattern: pattern.name, avgTime })
      }

      // All patterns should maintain good performance
      results.forEach(result => {
        expect(result.avgTime).toBeLessThan(50)
      })

      // Spaced requests should be fastest (less contention)
      const spacedResult = results.find(r => r.pattern === 'spaced')!
      const clusteredResult = results.find(r => r.pattern === 'clustered')!
      
      expect(spacedResult.avgTime).toBeLessThanOrEqual(clusteredResult.avgTime)
    })
  })
})