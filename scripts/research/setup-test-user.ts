import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupTestUser() {
  try {
    // Check if any users exist
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })
    
    console.log(`Found ${users.length} existing users:`)
    users.forEach(user => {
      console.log(`  ${user.id} - ${user.name || user.email}`)
    })
    
    // Create a test user if none exist
    if (users.length === 0) {
      console.log('\nNo users found. Creating a test user...')
      
      const hashedPassword = await bcrypt.hash('testpassword123', 10)
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@messai.com',
          name: 'Test User',
          password: hashedPassword,
          emailVerified: new Date(),
          role: 'USER'
        }
      })
      
      console.log(`Created test user: ${testUser.id} - ${testUser.email}`)
      return testUser.id
    }
    
    return users[0].id
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  setupTestUser().then(userId => {
    if (userId) {
      console.log(`\nYou can now run the import script with user ID: ${userId}`)
      console.log(`npx tsx scripts/literature/import-papers-to-db.ts /Users/samfrons/Desktop/clean-messai/literature/extracted-paper-data.json ${userId}`)
    }
  })
}

export default setupTestUser