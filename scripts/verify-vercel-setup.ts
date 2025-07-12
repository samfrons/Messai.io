#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

async function verifyVercelSetup() {
  console.log('🔍 Verifying Vercel Postgres Setup...\n')
  
  try {
    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL
    
    console.log('📋 Environment Variables:')
    console.log(`   DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Missing'}`)
    console.log(`   DIRECT_URL: ${directUrl ? '✅ Set' : '❌ Missing'}`)
    
    if (databaseUrl) {
      const isPostgres = databaseUrl.includes('postgres://') || databaseUrl.includes('postgresql://')
      const hasPooling = databaseUrl.includes('pgbouncer=true')
      console.log(`   PostgreSQL: ${isPostgres ? '✅' : '❌'}`)
      console.log(`   Connection Pooling: ${hasPooling ? '✅' : '⚠️ Recommended'}`)
    }
    
    if (!databaseUrl || !directUrl) {
      console.log('\n❌ Missing required environment variables!')
      console.log('Please add to .env.local:')
      console.log('DATABASE_URL="postgres://username:password@pooler-host:port/database?pgbouncer=true"')
      console.log('DIRECT_URL="postgres://username:password@direct-host:port/database"')
      return
    }
    
    // Test database connection
    console.log('\n🔌 Testing Database Connection...')
    const prisma = new PrismaClient()
    
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful!')
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT version()`
      console.log('✅ PostgreSQL version check passed')
      
      // Check if tables exist
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      ` as any[]
      
      console.log(`✅ Found ${tables.length} tables in database`)
      
      if (tables.length === 0) {
        console.log('\n📝 Next Steps:')
        console.log('1. Run: npx prisma db push')
        console.log('2. Run: npx tsx scripts/seed-remote-database.ts')
      } else {
        // Check for ResearchPaper table and count
        const paperCount = await prisma.researchPaper.count()
        console.log(`📚 Research papers in database: ${paperCount}`)
        
        if (paperCount === 0) {
          console.log('\n📝 Next Steps:')
          console.log('1. Run: npx tsx scripts/seed-remote-database.ts')
        } else {
          console.log('\n🎉 Vercel Postgres setup is complete!')
          console.log('✅ Database is connected and contains data')
        }
      }
      
    } catch (dbError: any) {
      console.log('❌ Database connection failed:', dbError.message)
      
      if (dbError.message.includes('connect ECONNREFUSED')) {
        console.log('💡 Check your DATABASE_URL and ensure Vercel Postgres is running')
      } else if (dbError.message.includes('authentication failed')) {
        console.log('💡 Check your username and password in the connection string')
      } else if (dbError.message.includes('does not exist')) {
        console.log('💡 Database may not be created yet - check Vercel dashboard')
      }
    } finally {
      await prisma.$disconnect()
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

if (require.main === module) {
  verifyVercelSetup()
}