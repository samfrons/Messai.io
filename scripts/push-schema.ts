#!/usr/bin/env npx tsx

import dotenv from 'dotenv'
import { execSync } from 'child_process'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('Environment loaded, pushing schema...')

try {
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  console.log('✅ Schema push completed successfully!')
} catch (error) {
  console.error('❌ Schema push failed:', error)
  process.exit(1)
}