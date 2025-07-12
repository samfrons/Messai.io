/**
 * Regression tests for AI prediction functionality
 * Ensures prediction accuracy and prevents regressions in AI model calculations
 */

import { describe, it, expect } from 'vitest'
import { getSimplePrediction } from '@/lib/ai-predictions'

describe('AI Predictions Regression Tests', () => {
  const baselineParams = {
    temperature: 25,
    ph: 6.5,
    substrateConcentration: 1,
    designType: 'mason-jar'
  }

  describe('Design Type Multipliers', () => {
    it('should maintain consistent multipliers for all design types', () => {
      const expectedMultipliers = {
        'earthen-pot': 0.8,
        'cardboard': 0.6,
        'mason-jar': 1.0,
        '3d-printed': 1.3,
        'wetland': 2.2,
        'micro-chip': 0.3,
        'isolinear-chip': 0.9,
        'benchtop-bioreactor': 3.5,
        'wastewater-treatment': 5.0,
        'brewery-processing': 4.2,
        'architectural-facade': 8.0,
        'benthic-fuel-cell': 2.8,
        'kitchen-sink': 1.5
      }

      for (const [designType, expectedMultiplier] of Object.entries(expectedMultipliers)) {
        const result = getSimplePrediction({
          ...baselineParams,
          designType
        })

        // Calculate expected design bonus
        const baselinePower = 50
        const expectedDesignBonus = baselinePower * (expectedMultiplier - 1.0)
        
        expect(result.factors.designBonus).toBeCloseTo(expectedDesignBonus, 1)
      }
    })

    it('should handle unknown design types gracefully', () => {
      const result = getSimplePrediction({
        ...baselineParams,
        designType: 'unknown-design'
      })

      // Should default to no bonus (multiplier of 1.0)
      expect(result.factors.designBonus).toBe(0)
    })

    it('should handle missing design type', () => {
      const result = getSimplePrediction({
        temperature: 25,
        ph: 6.5,
        substrateConcentration: 1
        // designType omitted
      })

      expect(result.factors.designBonus).toBe(0)
    })
  })

  describe('Parameter Factor Calculations', () => {
    it('should calculate temperature factors correctly', () => {
      const testCases = [
        { temperature: 20, expectedFactor: -25 }, // (20-25) * 5
        { temperature: 25, expectedFactor: 0 },   // (25-25) * 5
        { temperature: 30, expectedFactor: 25 },  // (30-25) * 5
        { temperature: 35, expectedFactor: 50 }   // (35-25) * 5
      ]

      for (const { temperature, expectedFactor } of testCases) {
        const result = getSimplePrediction({
          ...baselineParams,
          temperature
        })

        expect(result.factors.temperature).toBeCloseTo(expectedFactor, 1)
      }
    })

    it('should calculate pH factors correctly', () => {
      const testCases = [
        { ph: 6.0, expectedFactor: -10 }, // (6.0-6.5) * 20
        { ph: 6.5, expectedFactor: 0 },   // (6.5-6.5) * 20
        { ph: 7.0, expectedFactor: 10 },  // (7.0-6.5) * 20
        { ph: 7.5, expectedFactor: 20 }   // (7.5-6.5) * 20
      ]

      for (const { ph, expectedFactor } of testCases) {
        const result = getSimplePrediction({
          ...baselineParams,
          ph
        })

        expect(result.factors.ph).toBeCloseTo(expectedFactor, 1)
      }
    })

    it('should calculate substrate factors correctly', () => {
      const testCases = [
        { substrate: 0.5, expectedFactor: -15 }, // (0.5-1) * 30
        { substrate: 1.0, expectedFactor: 0 },   // (1.0-1) * 30
        { substrate: 1.5, expectedFactor: 15 },  // (1.5-1) * 30
        { substrate: 2.0, expectedFactor: 30 }   // (2.0-1) * 30
      ]

      for (const { substrate, expectedFactor } of testCases) {
        const result = getSimplePrediction({
          ...baselineParams,
          substrateConcentration: substrate
        })

        expect(result.factors.substrate).toBeCloseTo(expectedFactor, 1)
      }
    })
  })

  describe('Power Output Calculations', () => {
    it('should ensure minimum power output is never negative', () => {
      // Test with very poor conditions
      const result = getSimplePrediction({
        temperature: 15, // Very low
        ph: 5.0,         // Very acidic
        substrateConcentration: 0.1, // Very low
        designType: 'cardboard' // Low efficiency design
      })

      expect(result.predictedPower).toBeGreaterThanOrEqual(0)
    })

    it('should produce reasonable power outputs for optimal conditions', () => {
      const result = getSimplePrediction({
        temperature: 30,   // Optimal
        ph: 7.0,          // Optimal
        substrateConcentration: 1.5, // Good
        designType: 'architectural-facade' // High efficiency
      })

      // Should produce significant power with optimal conditions
      expect(result.predictedPower).toBeGreaterThan(200)
    })

    it('should maintain proportional scaling across design types', () => {
      const conditions = {
        temperature: 28,
        ph: 7.0,
        substrateConcentration: 1.2
      }

      const cardboardResult = getSimplePrediction({
        ...conditions,
        designType: 'cardboard'
      })

      const facadeResult = getSimplePrediction({
        ...conditions,
        designType: 'architectural-facade'
      })

      // Architectural facade should produce significantly more power than cardboard
      expect(facadeResult.predictedPower).toBeGreaterThan(cardboardResult.predictedPower * 5)
    })
  })

  describe('Confidence Intervals', () => {
    it('should provide realistic confidence intervals', () => {
      const result = getSimplePrediction(baselineParams)

      expect(result.confidenceInterval.lower).toBeLessThan(result.predictedPower)
      expect(result.confidenceInterval.upper).toBeGreaterThan(result.predictedPower)

      // Confidence interval should be approximately ±15% of predicted power
      const expectedRange = result.predictedPower * 0.15
      const actualRange = (result.confidenceInterval.upper - result.confidenceInterval.lower) / 2

      expect(actualRange).toBeCloseTo(expectedRange, 1)
    })

    it('should never have negative lower confidence bounds', () => {
      // Test with very low power conditions
      const result = getSimplePrediction({
        temperature: 18,
        ph: 5.5,
        substrateConcentration: 0.3,
        designType: 'cardboard'
      })

      expect(result.confidenceInterval.lower).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Numerical Precision', () => {
    it('should round values to appropriate precision', () => {
      const result = getSimplePrediction(baselineParams)

      // All values should be rounded to 2 decimal places
      expect(result.predictedPower).toBe(Math.round(result.predictedPower * 100) / 100)
      expect(result.confidenceInterval.lower).toBe(Math.round(result.confidenceInterval.lower * 100) / 100)
      expect(result.confidenceInterval.upper).toBe(Math.round(result.confidenceInterval.upper * 100) / 100)
      expect(result.factors.temperature).toBe(Math.round(result.factors.temperature * 100) / 100)
      expect(result.factors.ph).toBe(Math.round(result.factors.ph * 100) / 100)
      expect(result.factors.substrate).toBe(Math.round(result.factors.substrate * 100) / 100)
      expect(result.factors.designBonus).toBe(Math.round(result.factors.designBonus * 100) / 100)
    })
  })

  describe('Design Category Performance Ranges', () => {
    const testConditions = {
      temperature: 28,
      ph: 7.0,
      substrateConcentration: 1.2
    }

    it('should maintain laboratory scale design performance ranges', () => {
      const labDesigns = ['micro-chip', 'isolinear-chip', 'mason-jar', 'earthen-pot']
      
      for (const designType of labDesigns) {
        const result = getSimplePrediction({
          ...testConditions,
          designType
        })

        // Lab scale should be under 200 mW
        expect(result.predictedPower).toBeLessThan(200)
      }
    })

    it('should maintain pilot scale design performance ranges', () => {
      const pilotDesigns = ['benchtop-bioreactor', '3d-printed', 'brewery-processing']
      
      for (const designType of pilotDesigns) {
        const result = getSimplePrediction({
          ...testConditions,
          designType
        })

        // Pilot scale should be 100-500 mW range
        expect(result.predictedPower).toBeGreaterThan(100)
        expect(result.predictedPower).toBeLessThan(500)
      }
    })

    it('should maintain industrial scale design performance ranges', () => {
      const industrialDesigns = ['wastewater-treatment', 'architectural-facade', 'benthic-fuel-cell']
      
      for (const designType of industrialDesigns) {
        const result = getSimplePrediction({
          ...testConditions,
          designType
        })

        // Industrial scale should exceed 200 mW
        expect(result.predictedPower).toBeGreaterThan(200)
      }
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extreme parameter values', () => {
      const extremeParams = {
        temperature: 100,   // Unrealistic but should not crash
        ph: 14,            // Maximum pH scale
        substrateConcentration: 10, // Very high concentration
        designType: 'architectural-facade'
      }

      expect(() => {
        getSimplePrediction(extremeParams)
      }).not.toThrow()

      const result = getSimplePrediction(extremeParams)
      expect(typeof result.predictedPower).toBe('number')
      expect(result.predictedPower).toBeGreaterThanOrEqual(0)
    })

    it('should handle zero and negative parameter values', () => {
      const negativeParams = {
        temperature: -10,
        ph: -1,
        substrateConcentration: -0.5,
        designType: 'mason-jar'
      }

      expect(() => {
        getSimplePrediction(negativeParams)
      }).not.toThrow()

      const result = getSimplePrediction(negativeParams)
      expect(result.predictedPower).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Consistency and Determinism', () => {
    it('should produce identical results for identical inputs', () => {
      const params = {
        temperature: 29.5,
        ph: 7.15,
        substrateConcentration: 1.35,
        designType: 'wetland'
      }

      const result1 = getSimplePrediction(params)
      const result2 = getSimplePrediction(params)

      expect(result1.predictedPower).toBe(result2.predictedPower)
      expect(result1.factors.temperature).toBe(result2.factors.temperature)
      expect(result1.factors.ph).toBe(result2.factors.ph)
      expect(result1.factors.substrate).toBe(result2.factors.substrate)
      expect(result1.factors.designBonus).toBe(result2.factors.designBonus)
    })

    it('should maintain factor additivity', () => {
      const result = getSimplePrediction({
        temperature: 30,   // +25 factor
        ph: 7.0,          // +10 factor  
        substrateConcentration: 1.5, // +15 factor
        designType: 'mason-jar' // +0 factor (baseline)
      })

      const expectedPowerWithoutDesign = 50 + 25 + 10 + 15 // 100
      const actualPowerWithoutDesign = 50 + result.factors.temperature + result.factors.ph + result.factors.substrate

      expect(actualPowerWithoutDesign).toBeCloseTo(expectedPowerWithoutDesign, 1)
    })
  })
})