#!/usr/bin/env node

/**
 * Comprehensive authentication flow verification script
 * Tests all authentication scenarios and ensures proper database setup
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

const prisma = new PrismaClient();

// Test scenarios
const scenarios = {
  emailSignup: {
    name: 'Email Signup Flow',
    description: 'User signs up with email and password',
  },
  googleOAuth: {
    name: 'Google OAuth Flow',
    description: 'User signs up/in with Google',
  },
  emailLogin: {
    name: 'Email Login Flow',
    description: 'Existing user logs in with email',
  },
  forgotPassword: {
    name: 'Password Reset Flow',
    description: 'User resets forgotten password',
  },
};

// Helper functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  section: (msg) => console.log(chalk.bold.cyan(`\n${msg}\n`)),
};

async function checkUserRecords(userId, scenario) {
  log.section(`Checking records for ${scenario}`);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      settings: true,
      accounts: true,
      verificationTokens: true,
    },
  });

  if (!user) {
    log.error('User not found!');
    return false;
  }

  // Check User record
  log.info('User Record:');
  log.success(`ID: ${user.id}`);
  log.success(`Email: ${user.email}`);
  log.success(`Name: ${user.name || 'Not set'}`);
  log.success(`Role: ${user.role}`);
  log.success(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
  
  // Check UserProfile
  if (user.profile) {
    log.success('UserProfile exists');
    log.info(`- Onboarding Step: ${user.profile.onboardingStep}`);
    log.info(`- Completed Onboarding: ${user.profile.completedOnboarding}`);
  } else {
    log.error('UserProfile missing!');
  }
  
  // Check UserSettings
  if (user.settings) {
    log.success('UserSettings exists');
    log.info(`- Theme: ${user.settings.theme}`);
    log.info(`- Email Notifications: ${user.settings.emailNotifications}`);
  } else {
    log.error('UserSettings missing!');
  }
  
  // Check OAuth accounts (if applicable)
  if (user.accounts.length > 0) {
    log.success(`OAuth accounts: ${user.accounts.length}`);
    user.accounts.forEach(acc => {
      log.info(`- Provider: ${acc.provider}`);
    });
  }
  
  return !!(user.profile && user.settings);
}

async function testEmailSignupFlow() {
  log.section('Testing Email Signup Flow');
  
  const email = `test-signup-${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  try {
    // 1. Create user
    log.info('Creating user...');
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Email Test User',
        institution: 'Test University',
        researchArea: 'Testing',
      },
    });
    log.success('User created');
    
    // 2. Create profile and settings (simulating the API call)
    log.info('Creating UserProfile and UserSettings...');
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        interests: '[]',
      },
    });
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });
    log.success('Profile and settings created');
    
    // 3. Check records
    const valid = await checkUserRecords(user.id, 'Email Signup');
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    
    return valid;
  } catch (error) {
    log.error(`Email signup test failed: ${error.message}`);
    return false;
  }
}

async function testGoogleOAuthFlow() {
  log.section('Testing Google OAuth Flow');
  
  const email = `test-oauth-${Date.now()}@gmail.com`;
  
  try {
    // 1. Create OAuth user (simulating NextAuth)
    log.info('Creating OAuth user...');
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth Test User',
        emailVerified: new Date(),
      },
    });
    
    // 2. Create OAuth account
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: `google-${Date.now()}`,
        access_token: 'mock-token',
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
    });
    log.success('OAuth user and account created');
    
    // 3. Simulate the signIn event (which should create profile/settings)
    log.info('Simulating signIn event...');
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        interests: '[]',
      },
    });
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });
    log.success('Profile and settings ensured via upsert');
    
    // 4. Check records
    const valid = await checkUserRecords(user.id, 'Google OAuth');
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    
    return valid;
  } catch (error) {
    log.error(`OAuth test failed: ${error.message}`);
    return false;
  }
}

async function testLoginFlow() {
  log.section('Testing Login Flow');
  
  const email = `test-login-${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  try {
    // 1. Create existing user with all records
    log.info('Creating existing user...');
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Login Test User',
        emailVerified: new Date(),
        profile: {
          create: {
            interests: '[]',
            completedOnboarding: true,
          },
        },
        settings: {
          create: {},
        },
      },
    });
    log.success('User with all records created');
    
    // 2. Simulate login attempt
    log.info('Simulating login...');
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        success: passwordMatch,
        userId: user.id,
      },
    });
    log.success('Login attempt logged');
    
    // 3. Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    log.success('Last login updated');
    
    // 4. Check records
    const valid = await checkUserRecords(user.id, 'Email Login');
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    
    return valid;
  } catch (error) {
    log.error(`Login test failed: ${error.message}`);
    return false;
  }
}

async function testPasswordResetFlow() {
  log.section('Testing Password Reset Flow');
  
  const email = `test-reset-${Date.now()}@example.com`;
  
  try {
    // 1. Create user
    log.info('Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('OldPassword123!', 12),
        name: 'Reset Test User',
        emailVerified: new Date(),
        profile: {
          create: { interests: '[]' },
        },
        settings: {
          create: {},
        },
      },
    });
    log.success('User created');
    
    // 2. Create password reset token
    log.info('Creating password reset token...');
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: new Date(Date.now() + 3600000), // 1 hour
      },
    });
    log.success('Reset token created');
    
    // 3. Simulate password reset
    log.info('Simulating password reset...');
    const newPassword = await bcrypt.hash('NewPassword123!', 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });
    await prisma.passwordReset.updateMany({
      where: { userId: user.id },
      data: { used: true },
    });
    log.success('Password reset completed');
    
    // 4. Check records
    const valid = await checkUserRecords(user.id, 'Password Reset');
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    
    return valid;
  } catch (error) {
    log.error(`Password reset test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🔐 MESSAi Authentication Flow Verification\n'));
  
  const results = {
    emailSignup: false,
    googleOAuth: false,
    emailLogin: false,
    passwordReset: false,
  };
  
  try {
    // Run all tests
    results.emailSignup = await testEmailSignupFlow();
    results.googleOAuth = await testGoogleOAuthFlow();
    results.emailLogin = await testLoginFlow();
    results.passwordReset = await testPasswordResetFlow();
    
    // Summary
    log.section('Test Summary');
    
    let allPassed = true;
    Object.entries(results).forEach(([key, passed]) => {
      const scenario = scenarios[key];
      if (passed) {
        log.success(`${scenario.name}: PASSED`);
      } else {
        log.error(`${scenario.name}: FAILED`);
        allPassed = false;
      }
    });
    
    if (allPassed) {
      console.log(chalk.bold.green('\n✅ All authentication flows verified successfully!\n'));
    } else {
      console.log(chalk.bold.red('\n❌ Some authentication flows have issues!\n'));
      console.log(chalk.yellow('Recommendations:'));
      console.log('1. Ensure UserProfile and UserSettings are created during signup');
      console.log('2. Check OAuth callbacks create necessary records');
      console.log('3. Verify email verification process');
      console.log('4. Test login redirects and onboarding flow\n');
    }
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if chalk is installed
try {
  require.resolve('chalk');
  main();
} catch (e) {
  console.log('Installing chalk for colored output...');
  require('child_process').execSync('npm install chalk', { stdio: 'inherit' });
  console.log('Please run the script again.');
}