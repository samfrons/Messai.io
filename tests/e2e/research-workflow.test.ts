// End-to-end tests for complete research workflows

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as PapersGET, POST as PapersPOST } from '@/apps/web/app/api/papers/route'
import { POST as PredictionsPOST } from '@/apps/web/app/api/predictions/route'
import { POST as BioreactorPOST } from '@/apps/web/app/api/laboratory/bioreactor/route'
import { POST as OptimizationPOST } from '@/apps/web/app/api/optimization/bioreactor/route'
import {
  createMockRequest,
  mockSession,
  parseApiResponse,
  apiAssertions,
  TEST_USERS,
  TEST_PAPERS,
  TEST_PARAMETERS,
  setupApiTest,
  performanceUtils,
} from '@/lib/test/api-test-utils'
import { UserRole } from '@/lib/api/types'

describe('Research Workflow End-to-End Tests', () => {
  const { mocks } = setupApiTest()

  describe('Complete Research Discovery to Optimization Workflow', () => {
    it('executes full research pipeline: discovery → analysis → modeling → optimization', async () => {
      // Step 1: Researcher logs in and discovers relevant papers
      mockSession(TEST_USERS.researcher)

      // Search for MFC papers
      const searchRequest = createMockRequest('http://localhost/api/papers', {
        searchParams: { 
          search: 'microbial fuel cell',
          systemTypes: 'MFC',
          hasFullData: 'true',
          sortBy: 'power',
        },
      })

      const searchResponse = await PapersGET(searchRequest)
      const { data: searchData } = await parseApiResponse(searchResponse)

      apiAssertions.success(searchData)
      expect(searchData.data.papers).toHaveLength(1)

      const discoveredPaper = searchData.data.papers[0]
      expect(discoveredPaper.systemType).toBe('MFC')
      expect(discoveredPaper.hasPerformanceData).toBe(true)

      // Step 2: Extract parameters from discovered research
      const extractedParams = {
        temperature: discoveredPaper.aiData?.temperature || 30,
        ph: discoveredPaper.aiData?.ph || 7.2,
        substrateConcentration: discoveredPaper.aiData?.substrateConcentration || 1.5,
        designType: 'benchtop-bioreactor',
      }

      // Step 3: Generate AI predictions based on research
      const predictionRequest = createMockRequest('http://localhost/api/predictions', {
        method: 'POST',
        body: extractedParams,
      })

      const predictionResponse = await PredictionsPOST(predictionRequest)
      const { data: predictionData } = await parseApiResponse(predictionResponse)

      apiAssertions.success(predictionData)
      expect(predictionData.data.predictedPower).toBeGreaterThan(0)
      expect(predictionData.data.factors).toBeDefined()

      const basePrediction = predictionData.data.predictedPower

      // Step 4: Create laboratory model based on research findings
      const bioreactorConfig = {
        name: 'Research-Inspired Bioreactor',
        type: 'bioreactor',
        description: `Designed based on findings from: ${discoveredPaper.title}`,
        parameters: {
          volume: 1000,
          temperature: extractedParams.temperature,
          ph: extractedParams.ph,
          agitationRate: 200,
          airFlowRate: 3.0,
          feedRate: 15,
          substrateType: 'acetate',
          electrodeMaterial: discoveredPaper.anodeMaterials?.[0] || 'carbon_cloth',
        },
        isPublic: false,
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...bioreactorConfig, id: 'bioreactor-research-123' }),
      } as Response)

      const bioreactorRequest = createMockRequest('http://localhost/api/laboratory/bioreactor', {
        method: 'POST',
        body: bioreactorConfig,
      })

      const bioreactorResponse = await BioreactorPOST(bioreactorRequest)
      const { data: bioreactorData } = await parseApiResponse(bioreactorResponse)

      apiAssertions.success(bioreactorData)
      expect(bioreactorData.data.name).toBe('Research-Inspired Bioreactor')
      expect(bioreactorData.data.parameters.temperature).toBe(extractedParams.temperature)

      // Step 5: Optimize design based on multiple objectives
      const optimizationConfig = {
        objectives: ['power', 'efficiency', 'cost'],
        constraints: {
          temperature: { min: 25, max: 40 },
          ph: { min: 6.5, max: 7.8 },
          budget: { max: 500 },
        },
        algorithm: 'nsga2',
        parameters: {
          populationSize: 50,
          generations: 25,
          mutationRate: 0.15,
        },
        baselineConfig: bioreactorConfig,
      }

      const mockOptimization = {
        id: 'optimization-research-123',
        status: 'completed',
        objectives: optimizationConfig.objectives,
        results: {
          optimalSolutions: [
            {
              power: basePrediction * 1.15, // 15% improvement
              efficiency: 91.2,
              cost: 350,
              parameters: { temperature: 32, ph: 7.1, agitationRate: 180 },
            },
            {
              power: basePrediction * 1.08, // 8% improvement
              efficiency: 94.5,
              cost: 280,
              parameters: { temperature: 29, ph: 7.3, agitationRate: 160 },
            },
          ],
          convergenceData: { generations: 25, convergenceReached: true },
          paretoFront: true,
          improvementOverBaseline: {
            powerIncrease: 0.15,
            efficiencyIncrease: 0.06,
            costReduction: 0.12,
          },
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimization,
      } as Response)

      const optimizationRequest = createMockRequest('http://localhost/api/optimization/bioreactor', {
        method: 'POST',
        body: optimizationConfig,
      })

      const optimizationResponse = await OptimizationPOST(optimizationRequest)
      const { data: optimizationData } = await parseApiResponse(optimizationResponse)

      apiAssertions.success(optimizationData)
      expect(optimizationData.data.status).toBe('completed')
      expect(optimizationData.data.results.optimalSolutions).toHaveLength(2)
      expect(optimizationData.data.results.improvementOverBaseline.powerIncrease).toBe(0.15)

      // Step 6: Validate optimized design with new predictions
      const optimizedParams = optimizationData.data.results.optimalSolutions[0].parameters

      const validationRequest = createMockRequest('http://localhost/api/predictions', {
        method: 'POST',
        body: {
          ...optimizedParams,
          substrateConcentration: extractedParams.substrateConcentration,
          designType: 'benchtop-bioreactor',
        },
      })

      const validationResponse = await PredictionsPOST(validationRequest)
      const { data: validationData } = await parseApiResponse(validationResponse)

      apiAssertions.success(validationData)
      expect(validationData.data.predictedPower).toBeGreaterThan(basePrediction)

      // Step 7: Document new research (create paper based on findings)
      const newPaperData = {
        title: 'Optimized Bioreactor Design Based on Literature Analysis and AI Predictions',
        authors: ['Dr. Research User', 'MESSAI AI System'],
        abstract: `This study presents an optimized bioreactor design derived from analysis of existing literature, 
                   AI-powered predictions, and multi-objective optimization. Starting from baseline parameters 
                   extracted from ${discoveredPaper.title}, we achieved a ${Math.round((optimizationData.data.results.improvementOverBaseline.powerIncrease) * 100)}% 
                   improvement in power output while maintaining high efficiency.`,
        keywords: ['bioreactor', 'optimization', 'artificial intelligence', 'microbial fuel cell', 'MESSAI'],
        systemType: 'MFC',
        powerOutput: optimizationData.data.results.optimalSolutions[0].power,
        efficiency: optimizationData.data.results.optimalSolutions[0].efficiency,
        organismTypes: discoveredPaper.organismTypes,
        anodeMaterials: discoveredPaper.anodeMaterials,
        cathodeMaterials: discoveredPaper.cathodeMaterials,
        externalUrl: 'https://messai.io/research/optimized-design-001',
        journal: 'MESSAI Research Findings',
        isPublic: true,
      }

      mocks.researchPaper.create.mockResolvedValue({
        ...newPaperData,
        id: 'paper-research-findings-123',
        uploadedBy: TEST_USERS.researcher.id,
        createdAt: new Date().toISOString(),
      })

      const newPaperRequest = createMockRequest('http://localhost/api/papers', {
        method: 'POST',
        body: newPaperData,
      })

      const newPaperResponse = await PapersPOST(newPaperRequest)
      const { data: newPaperResponseData } = await parseApiResponse(newPaperResponse)

      apiAssertions.success(newPaperResponseData)
      expect(newPaperResponseData.data.title).toContain('Optimized Bioreactor Design')
      expect(newPaperResponseData.data.powerOutput).toBeGreaterThan(discoveredPaper.powerOutput)

      // Workflow Summary Assertions
      expect(optimizationData.data.results.optimalSolutions[0].power).toBeGreaterThan(basePrediction)
      expect(optimizationData.data.results.convergenceData.convergenceReached).toBe(true)
      expect(newPaperResponseData.data.powerOutput).toBeGreaterThan(discoveredPaper.powerOutput)
    })

    it('executes collaborative research workflow with multiple users', async () => {
      // Research Team Workflow: Student → Researcher → Industry Engineer

      // Step 1: Student discovers and analyzes papers
      mockSession(TEST_USERS.student)

      const studentSearchRequest = createMockRequest('http://localhost/api/papers', {
        searchParams: { 
          search: 'algae fuel cell',
          algaeOnly: 'true',
          minEfficiency: '70',
        },
      })

      const studentSearchResponse = await PapersGET(studentSearchRequest)
      const { data: studentSearchData } = await parseApiResponse(studentSearchResponse)

      apiAssertions.success(studentSearchData)

      // Step 2: Researcher takes student findings and creates advanced model
      mockSession(TEST_USERS.researcher)

      const researcherModelConfig = {
        name: 'Advanced Algae-MFC System',
        type: 'fuel-cell',
        description: 'Based on student research findings on algae-based systems',
        parameters: {
          volume: 2000,
          temperature: 28,
          ph: 8.2, // Algae-optimized pH
          lightIntensity: 200,
          co2Concentration: 0.04,
          algaeStrain: 'Chlorella vulgaris',
        },
        isPublic: true, // Share with team
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...researcherModelConfig, id: 'model-algae-123' }),
      } as Response)

      const researcherModelRequest = createMockRequest('http://localhost/api/laboratory/bioreactor', {
        method: 'POST',
        body: researcherModelConfig,
      })

      const researcherModelResponse = await BioreactorPOST(researcherModelRequest)
      const { data: researcherModelData } = await parseApiResponse(researcherModelResponse)

      apiAssertions.success(researcherModelData)
      expect(researcherModelData.data.isPublic).toBe(true)

      // Step 3: Industry engineer scales up the design
      mockSession(TEST_USERS.industry)

      const industrialOptimizationConfig = {
        objectives: ['power', 'cost', 'sustainability'],
        constraints: {
          temperature: { min: 20, max: 35 },
          ph: { min: 7.5, max: 8.5 },
          budget: { max: 10000 }, // Industrial budget
          sustainability: { min: 0.8 },
        },
        algorithm: 'genetic',
        parameters: {
          populationSize: 100,
          generations: 50,
        },
        scaleFactors: {
          volume: 50, // Scale up 50x for industrial use
          powerTarget: 1000000, // 1MW target
        },
      }

      const mockIndustrialOptimization = {
        id: 'optimization-industrial-123',
        status: 'completed',
        objectives: industrialOptimizationConfig.objectives,
        results: {
          optimalSolutions: [
            {
              power: 1200000, // 1.2 MW
              cost: 8500,
              sustainability: 0.92,
              parameters: { 
                volume: 100000, // 100m³
                temperature: 25,
                ph: 8.0,
                efficiency: 89.5,
              },
            },
          ],
          scalingAnalysis: {
            scalabilityFactor: 0.95,
            costEfficiency: 'excellent',
            environmentalImpact: 'low',
          },
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndustrialOptimization,
      } as Response)

      const industrialOptimizationRequest = createMockRequest('http://localhost/api/optimization/bioreactor', {
        method: 'POST',
        body: industrialOptimizationConfig,
      })

      const industrialOptimizationResponse = await OptimizationPOST(industrialOptimizationRequest)
      const { data: industrialOptimizationData } = await parseApiResponse(industrialOptimizationResponse)

      apiAssertions.success(industrialOptimizationData)
      expect(industrialOptimizationData.data.results.optimalSolutions[0].power).toBe(1200000)
      expect(industrialOptimizationData.data.results.scalingAnalysis.scalabilityFactor).toBe(0.95)

      // Verify collaborative workflow completed successfully
      expect(industrialOptimizationData.data.results.optimalSolutions[0].sustainability).toBe(0.92)
    })
  })

  describe('Performance and Scalability Testing', () => {
    it('handles high-throughput research workflows', async () => {
      mockSession(TEST_USERS.researcher)

      // Simulate multiple concurrent research workflows
      const workflowCount = 10
      const workflows = Array(workflowCount).fill(null).map(async (_, index) => {
        // Search for papers
        const searchRequest = createMockRequest('http://localhost/api/papers', {
          searchParams: { 
            search: `research${index}`,
            page: '1',
            limit: '5',
          },
        })

        const searchResponse = await PapersGET(searchRequest)
        
        // Generate predictions
        const predictionRequest = createMockRequest('http://localhost/api/predictions', {
          method: 'POST',
          body: {
            ...TEST_PARAMETERS.valid,
            temperature: 25 + (index % 10), // Vary parameters
          },
        })

        const predictionResponse = await PredictionsPOST(predictionRequest)

        return { searchResponse, predictionResponse }
      })

      const { results, averageTime, successRate } = await performanceUtils.loadTest(
        async () => {
          const randomWorkflow = workflows[Math.floor(Math.random() * workflows.length)]
          const { searchResponse } = await randomWorkflow
          return searchResponse
        },
        { concurrent: 5, iterations: 2 }
      )

      expect(successRate).toBeGreaterThan(0.8) // 80% success rate minimum
      expect(averageTime).toBeLessThan(3000) // 3 second average maximum
    })

    it('maintains data consistency across complex workflows', async () => {
      mockSession(TEST_USERS.researcher)

      // Create a series of interconnected operations
      const operations = []

      // Operation 1: Create base model
      const baseModelConfig = {
        name: 'Consistency Test Model',
        type: 'bioreactor',
        parameters: { volume: 500, temperature: 30 },
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ ...baseModelConfig, id: 'model-consistency-123' }),
      } as Response)

      const modelRequest = createMockRequest('http://localhost/api/laboratory/bioreactor', {
        method: 'POST',
        body: baseModelConfig,
      })

      operations.push(BioreactorPOST(modelRequest))

      // Operation 2: Generate predictions for multiple scenarios
      const predictionScenarios = [
        { temperature: 25, ph: 6.8, substrateConcentration: 1.0 },
        { temperature: 30, ph: 7.0, substrateConcentration: 1.5 },
        { temperature: 35, ph: 7.2, substrateConcentration: 2.0 },
      ]

      predictionScenarios.forEach(scenario => {
        const predictionRequest = createMockRequest('http://localhost/api/predictions', {
          method: 'POST',
          body: { ...scenario, designType: 'benchtop-bioreactor' },
        })
        operations.push(PredictionsPOST(predictionRequest))
      })

      // Execute all operations
      const results = await Promise.all(operations)

      // Verify all operations succeeded
      const parsedResults = await Promise.all(
        results.map(result => parseApiResponse(result))
      )

      parsedResults.forEach(({ data, status }) => {
        expect(status).toBe(200)
        apiAssertions.success(data)
      })

      // Verify data consistency
      const modelResult = parsedResults[0]
      const predictionResults = parsedResults.slice(1)

      expect(modelResult.data.data.name).toBe('Consistency Test Model')
      
      // Predictions should be consistent with temperature trends
      const powers = predictionResults.map(r => r.data.data.predictedPower)
      expect(powers[2]).toBeGreaterThan(powers[0]) // Higher temp should give higher power
    })
  })

  describe('Error Handling and Recovery', () => {
    it('gracefully handles workflow interruptions', async () => {
      mockSession(TEST_USERS.researcher)

      // Step 1: Start successful operations
      const searchRequest = createMockRequest('http://localhost/api/papers', {
        searchParams: { search: 'test' },
      })

      const searchResponse = await PapersGET(searchRequest)
      const { data: searchData } = await parseApiResponse(searchResponse)
      apiAssertions.success(searchData)

      // Step 2: Simulate failure in prediction
      const predictionRequest = createMockRequest('http://localhost/api/predictions', {
        method: 'POST',
        body: TEST_PARAMETERS.outOfRange, // Invalid parameters
      })

      const predictionResponse = await PredictionsPOST(predictionRequest)
      const { data: predictionData, status } = await parseApiResponse(predictionResponse)

      expect(status).toBe(400)
      apiAssertions.error(predictionData, 'VALIDATION_ERROR')

      // Step 3: Recovery with valid parameters
      const recoveryRequest = createMockRequest('http://localhost/api/predictions', {
        method: 'POST',
        body: TEST_PARAMETERS.valid,
      })

      const recoveryResponse = await PredictionsPOST(recoveryRequest)
      const { data: recoveryData } = await parseApiResponse(recoveryResponse)

      apiAssertions.success(recoveryData)
      expect(recoveryData.data.predictedPower).toBeGreaterThan(0)
    })

    it('validates permissions throughout workflow', async () => {
      // Step 1: Student attempts advanced optimization (should fail)
      mockSession(TEST_USERS.student)

      const advancedOptimizationConfig = {
        objectives: ['power', 'efficiency', 'cost'],
        algorithm: 'nsga2',
        parameters: { populationSize: 200, generations: 100 },
      }

      // Mock to simulate permission check failure
      vi.mocked(fetch).mockRejectedValueOnce({
        status: 403,
        message: 'Insufficient permissions for advanced optimization',
      })

      const optimizationRequest = createMockRequest('http://localhost/api/optimization/bioreactor', {
        method: 'POST',
        body: advancedOptimizationConfig,
      })

      const optimizationResponse = await OptimizationPOST(optimizationRequest)
      const { status } = await parseApiResponse(optimizationResponse)

      expect(status).toBe(403)

      // Step 2: Researcher can perform the same operation
      mockSession(TEST_USERS.researcher)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'optimization-authorized-123',
          status: 'completed',
          results: { optimalSolutions: [] },
        }),
      } as Response)

      const authorizedOptimizationResponse = await OptimizationPOST(optimizationRequest)
      const { data: authorizedData, status: authorizedStatus } = await parseApiResponse(authorizedOptimizationResponse)

      expect(authorizedStatus).toBe(201)
      apiAssertions.success(authorizedData)
    })
  })
})