#!/usr/bin/env npx tsx

import fs from 'fs'
import path from 'path'

async function switchToVercelPostgres() {
  console.log('🔄 Switching to Vercel Postgres configuration...\n')
  
  try {
    const projectRoot = process.cwd()
    const originalSchema = path.join(projectRoot, 'prisma', 'schema.prisma')
    const vercelSchema = path.join(projectRoot, 'prisma', 'schema.vercel.prisma')
    const sqliteBackup = path.join(projectRoot, 'prisma', 'schema.sqlite.backup.prisma')
    
    // 1. Backup current SQLite schema
    if (fs.existsSync(originalSchema)) {
      fs.copyFileSync(originalSchema, sqliteBackup)
      console.log('✅ Backed up SQLite schema to schema.sqlite.backup.prisma')
    }
    
    // 2. Copy Vercel PostgreSQL schema
    if (fs.existsSync(vercelSchema)) {
      fs.copyFileSync(vercelSchema, originalSchema)
      console.log('✅ Switched to Vercel PostgreSQL schema')
    } else {
      throw new Error('Vercel schema file not found')
    }
    
    // 3. Check environment variables
    const envLocal = path.join(projectRoot, '.env.local')
    let envContent = ''
    
    if (fs.existsSync(envLocal)) {
      envContent = fs.readFileSync(envLocal, 'utf8')
    }
    
    const hasDatabaseUrl = envContent.includes('DATABASE_URL=')
    const hasDirectUrl = envContent.includes('DIRECT_URL=')
    
    console.log('\n🔍 Environment Check:')
    console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ Found' : '❌ Missing'}`)
    console.log(`   DIRECT_URL: ${hasDirectUrl ? '✅ Found' : '❌ Missing'}`)
    
    if (!hasDatabaseUrl || !hasDirectUrl) {
      console.log('\n⚠️ Missing required environment variables!')
      console.log('Add to your .env.local:')
      console.log('DATABASE_URL="postgres://username:password@pooler-host:port/database?pgbouncer=true"')
      console.log('DIRECT_URL="postgres://username:password@direct-host:port/database"')
    }
    
    // 4. Show next steps
    console.log('\n🎯 Next Steps:')
    console.log('1. Set up Vercel Postgres database')
    console.log('2. Add DATABASE_URL and DIRECT_URL to .env.local')
    console.log('3. Run: npx prisma generate')
    console.log('4. Run: npx prisma db push')
    console.log('5. Run: npx tsx scripts/seed-remote-database.ts')
    
    console.log('\n📚 Reference:')
    console.log('See: scripts/setup-vercel-postgres.md for detailed instructions')
    
  } catch (error) {
    console.error('❌ Switch failed:', error)
    throw error
  }
}

async function switchBackToSQLite() {
  console.log('🔄 Switching back to SQLite configuration...\n')
  
  try {
    const projectRoot = process.cwd()
    const originalSchema = path.join(projectRoot, 'prisma', 'schema.prisma')
    const sqliteBackup = path.join(projectRoot, 'prisma', 'schema.sqlite.backup.prisma')
    
    if (fs.existsSync(sqliteBackup)) {
      fs.copyFileSync(sqliteBackup, originalSchema)
      console.log('✅ Restored SQLite schema from backup')
      
      console.log('\n🎯 Next Steps:')
      console.log('1. Update .env.local: DATABASE_URL="file:./prisma/dev.db"')
      console.log('2. Run: npx prisma generate')
      console.log('3. Your local SQLite database should work again')
    } else {
      console.log('❌ No SQLite backup found')
    }
    
  } catch (error) {
    console.error('❌ Switch back failed:', error)
    throw error
  }
}

if (require.main === module) {
  const command = process.argv[2]
  
  if (command === '--sqlite') {
    switchBackToSQLite()
  } else if (command === '--postgres' || !command) {
    switchToVercelPostgres()
  } else {
    console.log('Usage:')
    console.log('  npx tsx scripts/switch-to-vercel-postgres.ts          # Switch to Vercel Postgres')
    console.log('  npx tsx scripts/switch-to-vercel-postgres.ts --sqlite # Switch back to SQLite')
  }
}