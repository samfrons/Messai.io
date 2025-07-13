import { z } from 'zod'

// Define the environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),
  PRISMA_ACCELERATE_URL: z.string().url('PRISMA_ACCELERATE_URL must be a valid URL').optional(),
  
  // AI & API Keys
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required').optional(),
  CORE_API_KEY: z.string().min(1, 'CORE_API_KEY is required').optional(),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required').optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DEBUG: z.string().transform(val => val === 'true').optional(),
  
  // Optional APIs
  ARXIV_API_URL: z.string().url().optional(),
})

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Type for the validated environment
export type Env = z.infer<typeof envSchema>