// Utility Functions

/**
 * Calculate power from voltage and current
 */
export function calculatePower(voltage: number, current: number): number {
  return voltage * current;
}

/**
 * Calculate power density
 */
export function calculatePowerDensity(
  power: number,
  area: number,
  unit: 'W/m2' | 'mW/m2' = 'mW/m2'
): number {
  const powerDensity = power / area;
  return unit === 'mW/m2' ? powerDensity * 1000 : powerDensity;
}

/**
 * Calculate efficiency for fuel cells
 */
export function calculateEfficiency(
  actualVoltage: number,
  theoreticalVoltage: number = 1.23
): number {
  return (actualVoltage / theoreticalVoltage) * 100;
}

/**
 * Convert temperature units
 */
export function convertTemperature(
  value: number,
  from: 'C' | 'F' | 'K',
  to: 'C' | 'F' | 'K'
): number {
  let celsius: number;
  
  // Convert to Celsius first
  switch (from) {
    case 'C':
      celsius = value;
      break;
    case 'F':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
  }
  
  // Convert from Celsius to target unit
  switch (to) {
    case 'C':
      return celsius;
    case 'F':
      return celsius * 9 / 5 + 32;
    case 'K':
      return celsius + 273.15;
  }
}

/**
 * Format number with significant figures
 */
export function formatNumber(
  value: number,
  significantFigures: number = 3
): string {
  return value.toPrecision(significantFigures);
}

/**
 * Validate pH value
 */
export function isValidPH(ph: number): boolean {
  return ph >= 0 && ph <= 14;
}

/**
 * Validate temperature in Celsius
 */
export function isValidTemperature(temp: number): boolean {
  return temp >= -273.15 && temp <= 1000; // Absolute zero to reasonable upper limit
}