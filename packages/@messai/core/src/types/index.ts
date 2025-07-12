import { z } from 'zod'

// Base system type
export const SystemTypeSchema = z.enum(['MFC', 'MEC', 'MDC', 'MES'])
export type SystemType = z.infer<typeof SystemTypeSchema>

// Core MESS system interface
export const MESSSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: SystemTypeSchema,
  volume: z.number().positive(), // L
  electrodeArea: z.number().positive(), // m²
})

export type MESSSystem = z.infer<typeof MESSSystemSchema>

// Performance metrics
export const PerformanceMetricsSchema = z.object({
  powerDensity: z.number().nonnegative(), // mW/m²
  currentDensity: z.number().nonnegative(), // mA/cm²
  voltage: z.number().nonnegative(), // V
  efficiency: z.object({
    coulombic: z.number().min(0).max(100), // %
    energy: z.number().min(0).max(100), // %
  }),
})

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>

// Operating conditions
export const OperatingConditionsSchema = z.object({
  temperature: z.number().min(0).max(100), // °C
  pH: z.number().min(0).max(14),
  substrateConcentration: z.number().nonnegative(), // g/L
})

export type OperatingConditions = z.infer<typeof OperatingConditionsSchema>

// Material specifications
export const MaterialSpecSchema = z.object({
  anode: z.string(),
  cathode: z.string(),
  membrane: z.string().optional(),
})

export type MaterialSpec = z.infer<typeof MaterialSpecSchema>

// Base user interface (minimal)
export const BaseUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
})

export type BaseUser = z.infer<typeof BaseUserSchema>