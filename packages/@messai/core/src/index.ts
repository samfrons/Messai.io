// Core MESSAi business logic exports
export * from './types'
export * from './utils'
export * from './predictions'
export * from './domains'

// Scientific constants
export const SCIENTIFIC_CONSTANTS = {
  FARADAY_CONSTANT: 96485, // C/mol
  GAS_CONSTANT: 8.314,     // J/(mol·K)
  STANDARD_TEMP: 298.15,   // K (25°C)
  STANDARD_PRESSURE: 101325 // Pa
} as const