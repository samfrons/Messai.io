// Scientific utility functions

/**
 * Convert Celsius to Kelvin
 */
export const celsiusToKelvin = (celsius: number): number => celsius + 273.15

/**
 * Convert Kelvin to Celsius
 */
export const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15

/**
 * Calculate pH from hydrogen ion concentration
 */
export const concentrationToPH = (hConcentration: number): number => -Math.log10(hConcentration)

/**
 * Calculate hydrogen ion concentration from pH
 */
export const pHToConcentration = (pH: number): number => Math.pow(10, -pH)

/**
 * Format scientific values with appropriate precision
 */
export const formatScientific = (value: number, precision: number = 3): string => {
  if (value === 0) return '0'
  
  const absValue = Math.abs(value)
  if (absValue >= 1000 || absValue < 0.001) {
    return value.toExponential(precision)
  }
  
  return value.toPrecision(precision)
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate unique identifier
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor
}