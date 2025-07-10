import { z } from 'zod'

// Core parameter validation schemas
export const EnvironmentalParamsSchema = z.object({
  temperature: z.object({
    value: z.number().min(-10).max(100),
    unit: z.literal('°C'),
    tolerance: z.number().optional()
  }).optional(),
  ph: z.object({
    value: z.number().min(0).max(14),
    unit: z.literal('pH'),
    tolerance: z.number().optional()
  }).optional(),
  pressure: z.object({
    value: z.number().min(0),
    unit: z.enum(['bar', 'atm', 'Pa', 'kPa']),
    tolerance: z.number().optional()
  }).optional(),
  humidity: z.object({
    value: z.number().min(0).max(100),
    unit: z.literal('%'),
    tolerance: z.number().optional()
  }).optional(),
  conductivity: z.object({
    value: z.number().min(0),
    unit: z.enum(['mS/cm', 'μS/cm', 'S/m']),
    tolerance: z.number().optional()
  }).optional()
}).optional()

export const BiologicalParamsSchema = z.object({
  organisms: z.array(z.object({
    name: z.string(),
    type: z.enum(['pure_culture', 'mixed_culture', 'consortium']),
    concentration: z.object({
      value: z.number().min(0),
      unit: z.enum(['cells/mL', 'CFU/mL', 'g/L', 'OD600'])
    }).optional(),
    source: z.string().optional()
  })).optional(),
  biofilm: z.object({
    age: z.object({
      value: z.number().min(0),
      unit: z.enum(['days', 'weeks', 'months'])
    }).optional(),
    thickness: z.object({
      value: z.number().min(0),
      unit: z.enum(['μm', 'mm'])
    }).optional(),
    coverage: z.object({
      value: z.number().min(0).max(100),
      unit: z.literal('%')
    }).optional()
  }).optional(),
  substrate: z.object({
    type: z.string(),
    concentration: z.object({
      value: z.number().min(0),
      unit: z.enum(['mg/L', 'g/L', 'mM', 'M'])
    }),
    feedingMode: z.enum(['batch', 'continuous', 'fed-batch']).optional()
  }).optional()
}).optional()

export const MaterialParamsSchema = z.object({
  anode: z.object({
    material: z.string(),
    surfaceArea: z.object({
      value: z.number().min(0),
      unit: z.enum(['cm²', 'm²', 'cm²/g'])
    }).optional(),
    modifications: z.array(z.string()).optional(),
    thickness: z.object({
      value: z.number().min(0),
      unit: z.enum(['mm', 'μm'])
    }).optional()
  }).optional(),
  cathode: z.object({
    material: z.string(),
    surfaceArea: z.object({
      value: z.number().min(0),
      unit: z.enum(['cm²', 'm²', 'cm²/g'])
    }).optional(),
    catalyst: z.string().optional(),
    thickness: z.object({
      value: z.number().min(0),
      unit: z.enum(['mm', 'μm'])
    }).optional()
  }).optional(),
  membrane: z.object({
    type: z.string(),
    thickness: z.object({
      value: z.number().min(0),
      unit: z.enum(['mm', 'μm'])
    }).optional(),
    ionExchangeCapacity: z.object({
      value: z.number().min(0),
      unit: z.literal('meq/g')
    }).optional()
  }).optional(),
  electrolyte: z.object({
    type: z.string(),
    concentration: z.object({
      value: z.number().min(0),
      unit: z.enum(['mM', 'M', 'mg/L', 'g/L'])
    }).optional(),
    ph: z.number().min(0).max(14).optional()
  }).optional()
}).optional()

export const OperationalParamsSchema = z.object({
  flowRate: z.object({
    anode: z.object({
      value: z.number().min(0),
      unit: z.enum(['mL/min', 'L/h', 'L/day'])
    }).optional(),
    cathode: z.object({
      value: z.number().min(0),
      unit: z.enum(['mL/min', 'L/h', 'L/day'])
    }).optional()
  }).optional(),
  hydraulicRetentionTime: z.object({
    value: z.number().min(0),
    unit: z.enum(['hours', 'days'])
  }).optional(),
  organicLoadingRate: z.object({
    value: z.number().min(0),
    unit: z.enum(['kg COD/m³/day', 'g COD/L/day'])
  }).optional(),
  externalResistance: z.object({
    value: z.number().min(0),
    unit: z.enum(['Ω', 'kΩ', 'MΩ'])
  }).optional(),
  operatingMode: z.enum(['batch', 'continuous', 'fed-batch']).optional()
}).optional()

export const PerformanceParamsSchema = z.object({
  powerDensity: z.object({
    volumetric: z.object({
      value: z.number().min(0),
      unit: z.enum(['mW/m³', 'W/m³'])
    }).optional(),
    areal: z.object({
      value: z.number().min(0),
      unit: z.enum(['mW/m²', 'W/m²'])
    }).optional()
  }).optional(),
  currentDensity: z.object({
    value: z.number().min(0),
    unit: z.enum(['mA/cm²', 'A/m²'])
  }).optional(),
  voltage: z.object({
    openCircuit: z.object({
      value: z.number().min(0),
      unit: z.literal('V')
    }).optional(),
    operating: z.object({
      value: z.number().min(0),
      unit: z.literal('V')
    }).optional()
  }).optional(),
  efficiency: z.object({
    coulombic: z.object({
      value: z.number().min(0).max(100),
      unit: z.literal('%')
    }).optional(),
    energy: z.object({
      value: z.number().min(0).max(100),
      unit: z.literal('%')
    }).optional(),
    treatment: z.object({
      value: z.number().min(0).max(100),
      unit: z.literal('%'),
      parameter: z.string().optional() // COD, BOD, etc.
    }).optional()
  }).optional()
}).optional()

export const EconomicParamsSchema = z.object({
  capitalCost: z.object({
    value: z.number().min(0),
    unit: z.enum(['USD', 'EUR', 'USD/m³', 'EUR/m³'])
  }).optional(),
  operationalCost: z.object({
    value: z.number().min(0),
    unit: z.enum(['USD/day', 'EUR/day', 'USD/m³', 'EUR/m³'])
  }).optional(),
  paybackPeriod: z.object({
    value: z.number().min(0),
    unit: z.enum(['months', 'years'])
  }).optional(),
  energyRecovery: z.object({
    value: z.number().min(0),
    unit: z.enum(['kWh/m³', 'MJ/m³'])
  }).optional()
}).optional()

export const SafetyParamsSchema = z.object({
  pressureLimit: z.object({
    value: z.number().min(0),
    unit: z.enum(['bar', 'atm', 'Pa', 'kPa'])
  }).optional(),
  temperatureLimit: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.literal('°C')
  }).optional(),
  gasDetection: z.object({
    h2: z.boolean().optional(),
    ch4: z.boolean().optional(),
    h2s: z.boolean().optional()
  }).optional(),
  emergencyShutdown: z.boolean().optional()
}).optional()

export const MonitoringParamsSchema = z.object({
  sensors: z.array(z.object({
    type: z.enum(['temperature', 'ph', 'pressure', 'flow', 'voltage', 'current', 'gas']),
    location: z.string(),
    frequency: z.object({
      value: z.number().min(0),
      unit: z.enum(['seconds', 'minutes', 'hours'])
    }),
    alert: z.object({
      enabled: z.boolean(),
      threshold: z.number().optional(),
      condition: z.enum(['above', 'below', 'outside_range']).optional()
    }).optional()
  })).optional(),
  dataLogging: z.object({
    enabled: z.boolean(),
    frequency: z.object({
      value: z.number().min(0),
      unit: z.enum(['seconds', 'minutes', 'hours'])
    }),
    retention: z.object({
      value: z.number().min(0),
      unit: z.enum(['days', 'weeks', 'months', 'years'])
    }).optional()
  }).optional()
}).optional()

// Complete parameter set schema
export const ParameterSetSchema = z.object({
  environmentalParams: EnvironmentalParamsSchema,
  biologicalParams: BiologicalParamsSchema,
  materialParams: MaterialParamsSchema,
  operationalParams: OperationalParamsSchema,
  performanceParams: PerformanceParamsSchema,
  economicParams: EconomicParamsSchema,
  safetyParams: SafetyParamsSchema,
  monitoringParams: MonitoringParamsSchema
})

// Parameter template schema
export const ParameterTemplateSchema = z.object({
  $schema: z.string().url().optional(),
  title: z.string(),
  description: z.string().optional(),
  type: z.literal('object'),
  properties: z.record(z.any()),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional()
})

// Validation functions
export function validateParameterSet(data: unknown) {
  return ParameterSetSchema.safeParse(data)
}

export function validateParameterTemplate(data: unknown) {
  return ParameterTemplateSchema.safeParse(data)
}

export function calculateParameterCompleteness(params: any): number {
  let totalFields = 0
  let filledFields = 0

  function countFields(obj: any, parent = '') {
    if (!obj || typeof obj !== 'object') return

    Object.entries(obj).forEach(([key, value]) => {
      const path = parent ? `${parent}.${key}` : key
      totalFields++
      
      if (value !== null && value !== undefined) {
        filledFields++
        if (typeof value === 'object' && !Array.isArray(value)) {
          countFields(value, path)
        }
      }
    })
  }

  countFields(params)
  return totalFields > 0 ? (filledFields / totalFields) * 100 : 0
}

export function getParameterValidationErrors(data: unknown) {
  const result = validateParameterSet(data)
  if (result.success) return []
  
  return result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }))
}

// Unit conversion utilities
export const UNIT_CONVERSIONS = {
  temperature: {
    '°C': 1,
    '°F': (c: number) => (c * 9/5) + 32,
    'K': (c: number) => c + 273.15
  },
  pressure: {
    'bar': 1,
    'atm': 1.01325,
    'Pa': 100000,
    'kPa': 100
  },
  power: {
    'mW': 1,
    'W': 1000,
    'kW': 1000000
  }
}

export function convertUnit(value: number, fromUnit: string, toUnit: string, category: keyof typeof UNIT_CONVERSIONS): number {
  const conversions = UNIT_CONVERSIONS[category]
  if (!conversions || !(fromUnit in conversions) || !(toUnit in conversions)) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit} in category ${category}`)
  }
  
  // Convert to base unit first, then to target unit
  const toBase = typeof conversions[fromUnit] === 'function' 
    ? (conversions[fromUnit] as Function)(value)
    : value * (conversions[fromUnit] as number)
    
  const fromBase = typeof conversions[toUnit] === 'function'
    ? (conversions[toUnit] as Function)(toBase)
    : toBase / (conversions[toUnit] as number)
    
  return fromBase
}