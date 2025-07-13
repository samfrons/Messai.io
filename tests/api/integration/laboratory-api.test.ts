// Integration tests for Laboratory APIs with unified middleware

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST as BioreactorPOST } from '@/apps/web/app/api/laboratory/bioreactor/route'
import { POST as OptimizationPOST } from '@/apps/web/app/api/optimization/bioreactor/route'
import { POST as PredictionsPOST } from '@/apps/web/app/api/predictions/route'
import {
  createMockRequest,
  mockSession,
  parseApiResponse,
  apiAssertions,
  TEST_USERS,
  TEST_PARAMETERS,
  setupApiTest,
  performanceUtils,
} from '@/lib/test/api-test-utils'
import { UserRole, Permission } from '@/lib/api/types'

describe('Laboratory API Integration Tests', () => {
  const { mocks } = setupApiTest()

  describe('POST /api/laboratory/bioreactor', () => {
    describe('Authentication & Authorization', () => {
      it('requires authentication', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: { name: 'Test Bioreactor', type: 'bioreactor' },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(401)
        apiAssertions.error(data, 'UNAUTHORIZED')
      })

      it('requires laboratory permissions', async () => {
        const userWithoutPermissions = {
          ...TEST_USERS.demo,
          permissions: [Permission.READ_PAPERS], // Missing USE_LABORATORY
        }
        mockSession(userWithoutPermissions as any)

        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: { name: 'Test Bioreactor', type: 'bioreactor' },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(403)
        apiAssertions.error(data, 'INSUFFICIENT_PERMISSIONS')
      })

      it('allows researchers with laboratory permissions', async () => {
        mockSession(TEST_USERS.researcher)

        const mockBioreactor = {
          id: 'bioreactor-123',
          name: 'Test Bioreactor',
          type: 'bioreactor',
          parameters: { volume: 500, temperature: 30 },
          userId: TEST_USERS.researcher.id,
        }

        // Mock successful creation
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockBioreactor,
        } as Response)

        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: {
            name: 'Test Bioreactor',
            type: 'bioreactor',
            parameters: { volume: 500, temperature: 30 },
          },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
        expect(data.data.name).toBe('Test Bioreactor')
      })
    })

    describe('Input Validation', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('validates required fields', async () => {
        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: { name: '' }, // Missing required fields
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })

      it('validates bioreactor type', async () => {
        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: {
            name: 'Test Bioreactor',
            type: 'invalid-type',
            parameters: {},
          },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
        expect(data.error!.field).toBe('type')
      })

      it('validates scientific parameters', async () => {
        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: {
            name: 'Test Bioreactor',
            type: 'bioreactor',
            parameters: {
              temperature: -50, // Invalid: too low
              ph: 15, // Invalid: too high
              volume: -100, // Invalid: negative
            },
          },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })
    })

    describe('Model Configuration', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('processes valid bioreactor configuration', async () => {
        const mockBioreactor = {
          id: 'bioreactor-123',
          name: 'Advanced Bioreactor',
          type: 'bioreactor',
          parameters: {
            volume: 1000,
            temperature: 35,
            ph: 7.0,
            agitationRate: 150,
            airFlowRate: 2.5,
            feedRate: 10,
          },
          userId: TEST_USERS.researcher.id,
          createdAt: new Date().toISOString(),
        }

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockBioreactor,
        } as Response)

        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: {
            name: 'Advanced Bioreactor',
            type: 'bioreactor',
            parameters: {
              volume: 1000,
              temperature: 35,
              ph: 7.0,
              agitationRate: 150,
              airFlowRate: 2.5,
              feedRate: 10,
            },
            isPublic: false,
          },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
        expect(data.data.parameters.volume).toBe(1000)
        expect(data.data.parameters.temperature).toBe(35)
        expect(data.data.userId).toBe(TEST_USERS.researcher.id)
      })

      it('applies default configuration for minimal input', async () => {
        const mockBioreactor = {
          id: 'bioreactor-minimal',
          name: 'Minimal Bioreactor',
          type: 'bioreactor',
          parameters: {
            volume: 500, // Default
            temperature: 30, // Default
            ph: 7.0, // Default
          },
          userId: TEST_USERS.researcher.id,
          isPublic: false,
        }

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockBioreactor,
        } as Response)

        const request = createMockRequest('http://localhost/api/laboratory/bioreactor', {
          method: 'POST',
          body: {
            name: 'Minimal Bioreactor',
            type: 'bioreactor',
            parameters: {},
          },
        })

        const response = await BioreactorPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
        expect(data.data.parameters.volume).toBe(500)
        expect(data.data.parameters.temperature).toBe(30)
        expect(data.data.parameters.ph).toBe(7.0)
      })
    })
  })

  describe('POST /api/optimization/bioreactor', () => {
    describe('Optimization Parameters', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('performs multi-objective optimization', async () => {
        const mockOptimization = {
          id: 'optimization-123',
          objectives: ['power', 'efficiency', 'cost'],
          parameters: TEST_PARAMETERS.valid,
          results: {
            optimalSolutions: [
              { power: 280, efficiency: 88.5, cost: 150, parameters: { temperature: 32, ph: 7.2 } },
              { power: 260, efficiency: 92.1, cost: 180, parameters: { temperature: 28, ph: 6.8 } },
            ],
            convergenceData: { generations: 50, convergenceReached: true },
            paretoFront: true,
          },
          status: 'completed',
          userId: TEST_USERS.researcher.id,
        }

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockOptimization,
        } as Response)

        const request = createMockRequest('http://localhost/api/optimization/bioreactor', {
          method: 'POST',
          body: {
            objectives: ['power', 'efficiency', 'cost'],
            constraints: {
              temperature: { min: 25, max: 40 },
              ph: { min: 6.0, max: 8.0 },
              budget: { max: 200 },
            },
            algorithm: 'nsga2',
            parameters: {
              populationSize: 100,
              generations: 50,
              mutationRate: 0.1,
            },
          },
        })

        const response = await OptimizationPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
        expect(data.data.objectives).toEqual(['power', 'efficiency', 'cost'])
        expect(data.data.results.optimalSolutions).toHaveLength(2)
        expect(data.data.results.convergenceData.convergenceReached).toBe(true)
      })

      it('validates optimization constraints', async () => {
        const request = createMockRequest('http://localhost/api/optimization/bioreactor', {
          method: 'POST',
          body: {
            objectives: [], // Invalid: empty objectives
            constraints: {
              temperature: { min: 50, max: 40 }, // Invalid: min > max
            },
          },
        })

        const response = await OptimizationPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })

      it('handles optimization algorithm selection', async () => {
        const algorithms = ['nsga2', 'genetic', 'particle_swarm', 'gradient_descent']

        for (const algorithm of algorithms) {
          vi.clearAllMocks()
          mockSession(TEST_USERS.researcher)

          const mockResult = {
            id: `optimization-${algorithm}`,
            algorithm,
            status: 'completed',
            results: { optimalSolutions: [] },
          }

          vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
          } as Response)

          const request = createMockRequest('http://localhost/api/optimization/bioreactor', {
            method: 'POST',
            body: {
              objectives: ['power'],
              algorithm,
              constraints: { temperature: { min: 25, max: 35 } },
            },
          })

          const response = await OptimizationPOST(request)
          const { data, status } = await parseApiResponse(response)

          expect(status).toBe(201)
          expect(data.data.algorithm).toBe(algorithm)
        }
      })
    })

    describe('Performance & Scalability', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('handles long-running optimizations', async () => {
        const mockOptimization = {
          id: 'optimization-long',
          status: 'running',
          progress: 0.3,
          estimatedCompletion: Date.now() + 300000, // 5 minutes
        }

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockOptimization,
        } as Response)

        const request = createMockRequest('http://localhost/api/optimization/bioreactor', {
          method: 'POST',
          body: {
            objectives: ['power', 'efficiency', 'cost', 'sustainability'],
            constraints: { temperature: { min: 20, max: 45 } },
            parameters: { generations: 200, populationSize: 500 },
          },
        })

        const { result, duration } = await performanceUtils.measureResponseTime(async () => {
          return OptimizationPOST(request)
        })

        const { data, status } = await parseApiResponse(result)

        expect(status).toBe(202) // Accepted for processing
        expect(data.data.status).toBe('running')
        expect(data.data.progress).toBeDefined()
        expect(duration).toBeLessThan(5000) // Should respond quickly even for long tasks
      })

      it('provides optimization progress tracking', async () => {
        const mockProgress = {
          id: 'optimization-123',
          status: 'running',
          progress: 0.75,
          currentGeneration: 37,
          totalGenerations: 50,
          bestSolutions: [
            { power: 275, efficiency: 89.2, generation: 37 },
          ],
          convergenceMetrics: {
            diversityIndex: 0.65,
            hypervolume: 1250.3,
          },
        }

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockProgress,
        } as Response)

        const request = createMockRequest('http://localhost/api/optimization/bioreactor', {
          method: 'POST',
          body: {
            objectives: ['power', 'efficiency'],
            trackProgress: true,
          },
        })

        const response = await OptimizationPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        expect(data.data.progress).toBe(0.75)
        expect(data.data.convergenceMetrics).toBeDefined()
      })
    })
  })

  describe('POST /api/predictions', () => {
    describe('AI Prediction Engine', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('generates power output predictions', async () => {
        const request = createMockRequest('http://localhost/api/predictions', {
          method: 'POST',
          body: TEST_PARAMETERS.valid,
        })

        const response = await PredictionsPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(200)
        apiAssertions.success(data)
        expect(data.data.predictedPower).toBeGreaterThan(0)
        expect(data.data.confidenceInterval).toBeDefined()
        expect(data.data.confidenceInterval.lower).toBeLessThan(data.data.predictedPower)
        expect(data.data.confidenceInterval.upper).toBeGreaterThan(data.data.predictedPower)
        expect(data.data.factors).toBeDefined()
      })

      it('validates prediction parameters', async () => {
        const request = createMockRequest('http://localhost/api/predictions', {
          method: 'POST',
          body: TEST_PARAMETERS.outOfRange,
        })

        const response = await PredictionsPOST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })

      it('applies design-specific multipliers', async () => {
        const designTypes = [
          'benchtop-bioreactor',
          'wastewater-treatment',
          'brewery-processing',
          'architectural-facade',
        ]

        const basePrediction = await (async () => {
          const request = createMockRequest('http://localhost/api/predictions', {
            method: 'POST',
            body: { ...TEST_PARAMETERS.valid, designType: 'mason-jar' }, // Baseline
          })
          const response = await PredictionsPOST(request)
          const { data } = await parseApiResponse(response)
          return data.data.predictedPower
        })()

        for (const designType of designTypes) {
          const request = createMockRequest('http://localhost/api/predictions', {
            method: 'POST',
            body: { ...TEST_PARAMETERS.valid, designType },
          })

          const response = await PredictionsPOST(request)
          const { data } = await parseApiResponse(response)

          expect(data.data.predictedPower).toBeGreaterThan(basePrediction)
          expect(data.data.factors.designBonus).toBeGreaterThan(0)
        }
      })

      it('provides factor analysis', async () => {
        const request = createMockRequest('http://localhost/api/predictions', {
          method: 'POST',
          body: TEST_PARAMETERS.valid,
        })

        const response = await PredictionsPOST(request)
        const { data } = await parseApiResponse(response)

        expect(data.data.factors.temperature).toBeDefined()
        expect(data.data.factors.ph).toBeDefined()
        expect(data.data.factors.substrate).toBeDefined()
        expect(data.data.factors.designBonus).toBeDefined()

        // Verify factor contributions are realistic
        const totalFactorContribution = 
          data.data.factors.temperature + 
          data.data.factors.ph + 
          data.data.factors.substrate + 
          data.data.factors.designBonus

        expect(Math.abs(totalFactorContribution)).toBeLessThan(data.data.predictedPower)
      })

      it('handles edge cases in parameter ranges', async () => {
        const edgeCases = [
          { temperature: 20, ph: 6, substrateConcentration: 0.5 }, // Minimum values
          { temperature: 40, ph: 8, substrateConcentration: 2 }, // Maximum values
          { temperature: 30, ph: 7, substrateConcentration: 1 }, // Optimal values
        ]

        for (const params of edgeCases) {
          const request = createMockRequest('http://localhost/api/predictions', {
            method: 'POST',
            body: params,
          })

          const response = await PredictionsPOST(request)
          const { data, status } = await parseApiResponse(response)

          expect(status).toBe(200)
          expect(data.data.predictedPower).toBeGreaterThanOrEqual(0)
          expect(data.data.confidenceInterval.lower).toBeGreaterThanOrEqual(0)
        }
      })
    })

    describe('Performance & Reliability', () => {
      beforeEach(() => {
        mockSession(TEST_USERS.researcher)
      })

      it('provides fast prediction responses', async () => {
        const { duration } = await performanceUtils.measureResponseTime(async () => {
          const request = createMockRequest('http://localhost/api/predictions', {
            method: 'POST',
            body: TEST_PARAMETERS.valid,
          })
          return PredictionsPOST(request)
        })

        expect(duration).toBeLessThan(500) // 500ms max for predictions
      })

      it('handles concurrent prediction requests', async () => {
        const { successRate, averageTime } = await performanceUtils.loadTest(
          async () => {
            const request = createMockRequest('http://localhost/api/predictions', {
              method: 'POST',
              body: TEST_PARAMETERS.valid,
            })
            return PredictionsPOST(request)
          },
          { concurrent: 10, iterations: 2 }
        )

        expect(successRate).toBe(1.0) // 100% success rate
        expect(averageTime).toBeLessThan(1000) // 1 second average
      })

      it('provides consistent results for identical inputs', async () => {
        const requests = Array(5).fill(null).map(() => 
          createMockRequest('http://localhost/api/predictions', {
            method: 'POST',
            body: TEST_PARAMETERS.valid,
          })
        )

        const responses = await Promise.all(
          requests.map(request => PredictionsPOST(request))
        )

        const results = await Promise.all(
          responses.map(response => parseApiResponse(response))
        )

        // All should be successful
        results.forEach(({ status }) => expect(status).toBe(200))

        // Results should be very similar (allowing for small noise)
        const predictions = results.map(({ data }) => data.data.predictedPower)
        const mean = predictions.reduce((sum, p) => sum + p, 0) / predictions.length
        const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length

        expect(Math.sqrt(variance)).toBeLessThan(50) // Low variance
      })
    })
  })
})