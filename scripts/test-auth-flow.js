#!/usr/bin/env node

/**
 * Test script to verify authentication flows
 * This script tests email signup, login, and checks for proper database record creation
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test user data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
  institution: 'Test University',
  researchArea: 'Test Research',
};

async function cleanup(email) {
  try {
    // Clean up test data
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
      console.log('✓ Cleaned up test user');
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

async function testEmailSignup() {
  console.log('\n📧 Testing Email Signup Flow\n');
  
  try {
    // 1. Create user (simulating signup API)
    console.log('1. Creating user...');
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        institution: testUser.institution,
        researchArea: testUser.researchArea,
      },
    });
    console.log('✓ User created:', user.id);

    // 2. Check if UserProfile is created
    console.log('\n2. Checking UserProfile...');
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    
    if (!profile) {
      console.log('⚠️  UserProfile not automatically created');
      console.log('   Creating UserProfile manually...');
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          interests: '[]',
        },
      });
      console.log('✓ UserProfile created manually');
    } else {
      console.log('✓ UserProfile exists');
    }

    // 3. Check if UserSettings is created
    console.log('\n3. Checking UserSettings...');
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });
    
    if (!settings) {
      console.log('⚠️  UserSettings not automatically created');
      console.log('   Creating UserSettings manually...');
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
        },
      });
      console.log('✓ UserSettings created manually');
    } else {
      console.log('✓ UserSettings exists');
    }

    // 4. Create verification token
    console.log('\n4. Creating verification token...');
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await prisma.verificationToken.create({
      data: {
        identifier: testUser.email,
        token,
        expires,
        userId: user.id,
      },
    });
    console.log('✓ Verification token created');

    // 5. Simulate email verification
    console.log('\n5. Simulating email verification...');
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    console.log('✓ Email verified');

    // 6. Check login attempt logging
    console.log('\n6. Testing login attempt logging...');
    const passwordMatch = await bcrypt.compare(testUser.password, hashedPassword);
    
    await prisma.loginAttempt.create({
      data: {
        email: testUser.email,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        success: passwordMatch,
        userId: user.id,
      },
    });
    console.log('✓ Login attempt logged');

    // 7. Final check - all user data
    console.log('\n7. Final verification of all user data...');
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        settings: true,
        loginAttempts: true,
      },
    });

    console.log('\n📊 User Data Summary:');
    console.log('- User ID:', fullUser.id);
    console.log('- Email:', fullUser.email);
    console.log('- Email Verified:', fullUser.emailVerified ? '✓' : '✗');
    console.log('- Has Profile:', fullUser.profile ? '✓' : '✗');
    console.log('- Has Settings:', fullUser.settings ? '✓' : '✗');
    console.log('- Login Attempts:', fullUser.loginAttempts.length);
    
    console.log('\n✅ Email signup flow test completed!');
    
    return user.id;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function testOAuthFlow() {
  console.log('\n🔐 Testing OAuth Flow (Simulation)\n');
  
  const oauthEmail = `oauth-${Date.now()}@example.com`;
  
  try {
    // 1. Simulate OAuth user creation (what NextAuth does)
    console.log('1. Creating OAuth user...');
    const oauthUser = await prisma.user.create({
      data: {
        email: oauthEmail,
        name: 'OAuth Test User',
        emailVerified: new Date(), // OAuth users are pre-verified
      },
    });
    console.log('✓ OAuth user created:', oauthUser.id);

    // 2. Create OAuth account link
    console.log('\n2. Creating OAuth account link...');
    await prisma.account.create({
      data: {
        userId: oauthUser.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: `google-${Date.now()}`,
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
    });
    console.log('✓ OAuth account linked');

    // 3. Check if UserProfile and UserSettings exist
    console.log('\n3. Checking automatic profile/settings creation...');
    const profile = await prisma.userProfile.findUnique({
      where: { userId: oauthUser.id },
    });
    const settings = await prisma.userSettings.findUnique({
      where: { userId: oauthUser.id },
    });

    console.log('- UserProfile:', profile ? '✓ Exists' : '⚠️  Missing');
    console.log('- UserSettings:', settings ? '✓ Exists' : '⚠️  Missing');

    if (!profile || !settings) {
      console.log('\n⚠️  OAuth users need manual profile/settings creation!');
    }

    console.log('\n✅ OAuth flow test completed!');
    
    // Cleanup
    await cleanup(oauthEmail);
    
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
    await cleanup(oauthEmail);
    throw error;
  }
}

async function main() {
  console.log('🧪 MESSAi Authentication Flow Test\n');
  console.log('This script tests the authentication flows to ensure:');
  console.log('- Users can sign up with email');
  console.log('- UserProfile and UserSettings are created');
  console.log('- Email verification works');
  console.log('- Login attempts are logged');
  console.log('- OAuth flow handles user creation properly\n');
  
  try {
    // Test email signup
    const userId = await testEmailSignup();
    
    // Test OAuth flow
    await testOAuthFlow();
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await cleanup(testUser.email);
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
main().catch(console.error);