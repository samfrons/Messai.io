import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@messai.com' }
    });

    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@messai.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
        isActive: true
      }
    });

    console.log('Test user created successfully:');
    console.log('Email: test@messai.com');
    console.log('Password: password123');
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();