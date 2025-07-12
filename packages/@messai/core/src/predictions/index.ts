import { SCIENTIFIC_CONSTANTS } from '../index'
import { OperatingConditions, PerformanceMetrics } from '../types'
import { celsiusToKelvin, clamp } from '../utils'

/**
 * Basic power prediction using simplified bioelectrochemical models
 */
export class PowerPredictor {
  /**
   * Apply Arrhenius correction for temperature effects
   */
  private applyTemperatureCorrection(baseRate: number, temperature: number): number {
    const activationEnergy = 35000 // J/mol (typical for bioelectrochemical reactions)
    const tempKelvin = celsiusToKelvin(temperature)
    const referenceTemp = celsiusToKelvin(25) // 25°C reference
    
    const factor = Math.exp(
      (activationEnergy / SCIENTIFIC_CONSTANTS.GAS_CONSTANT) * 
      (1 / referenceTemp - 1 / tempKelvin)
    )
    
    return baseRate * factor
  }

  /**
   * Calculate pH effect using bell curve around optimal pH
   */
  private calculatePHEffect(pH: number, optimalPH: number = 7.0): number {
    const tolerance = 1.5
    const deviation = Math.abs(pH - optimalPH)
    
    if (deviation > tolerance * 2) return 0.1 // Extreme pH
    
    return Math.exp(-Math.pow(deviation / tolerance, 2))
  }

  /**
   * Apply Monod kinetics for substrate limitation
   */
  private applySubstrateKinetics(concentration: number): number {
    const maxRate = 1.0
    const halfSaturation = 0.5 // g/L
    
    return maxRate * concentration / (halfSaturation + concentration)
  }

  /**
   * Predict basic performance metrics
   */
  predict(
    conditions: OperatingConditions,
    systemType: 'MFC' | 'MEC' | 'MDC' | 'MES' = 'MFC'
  ): PerformanceMetrics {
    // Base power density for different system types (mW/m²)
    const basePowerDensity = {
      MFC: 100,
      MEC: 150,
      MDC: 80,
      MES: 120
    }

    const basePower = basePowerDensity[systemType]
    
    // Apply environmental corrections
    const tempFactor = this.applyTemperatureCorrection(1.0, conditions.temperature)
    const pHFactor = this.calculatePHEffect(conditions.pH)
    const substrateFactor = this.applySubstrateKinetics(conditions.substrateConcentration)
    
    const correctedPower = basePower * tempFactor * pHFactor * substrateFactor
    
    // Estimate other metrics based on power
    const currentDensity = correctedPower / 0.3 // Assume ~0.3V average
    const coulombicEfficiency = clamp(60 + (pHFactor * 30), 10, 95)
    const energyEfficiency = clamp(coulombicEfficiency * 0.8, 5, 80)
    
    return {
      powerDensity: Math.max(0, correctedPower),
      currentDensity: Math.max(0, currentDensity),
      voltage: clamp(0.1 + (pHFactor * 0.5), 0.05, 0.8),
      efficiency: {
        coulombic: coulombicEfficiency,
        energy: energyEfficiency
      }
    }
  }
}