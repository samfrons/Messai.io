#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

async function main() {
  console.log('Checking users in database...')
  
  const users = await prisma.user.findMany({ 
    take: 5,
    select: { id: true, email: true, name: true }
  })
  
  console.log(`Found ${users.length} users`)
  
  if (users.length > 0) {
    console.log('\nFirst user:')
    console.log(`ID: ${users[0].id}`)
    console.log(`Email: ${users[0].email}`)
    console.log(`Name: ${users[0].name || 'No name'}`)
  } else {
    console.log('\nNo users found. Creating a system user...')
    
    const systemUser = await prisma.user.create({
      data: {
        email: 'system@messai.io',
        name: 'System',
        password: 'not-used', // This is for the system user only
      }
    })
    
    console.log('Created system user:')
    console.log(`ID: ${systemUser.id}`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)