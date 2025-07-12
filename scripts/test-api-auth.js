#!/usr/bin/env node

/**
 * Test authentication API endpoints
 * This script tests the actual API routes to ensure authentication works correctly
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data
const testUser = {
  email: `test-api-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!',
  name: 'API Test User',
  institution: 'Test University',
  researchArea: 'API Testing',
  acceptTerms: true,
};

async function testSignup() {
  console.log('\n📝 Testing Signup API...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log(`User ID: ${data.user?.id}`);
      console.log(`Email: ${data.user?.email}`);
      return true;
    } else {
      console.log('❌ Signup failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login API...\n');
  
  // Note: Direct login API testing requires NextAuth session handling
  console.log('Login testing requires NextAuth session handling.');
  console.log('Please test login through the web interface.');
  
  return true;
}

async function testUserEndpoints() {
  console.log('\n👤 Testing User Endpoints...\n');
  
  console.log('User endpoints require authentication.');
  console.log('These should be tested after logging in through the web interface.');
  
  // Example of what authenticated requests would look like:
  console.log('\nExample authenticated request structure:');
  console.log('GET /api/user/profile');
  console.log('Headers: { Cookie: "next-auth.session-token=..." }');
  
  return true;
}

async function main() {
  console.log('🧪 MESSAi API Authentication Test\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('Make sure the application is running!\n');
  
  let allPassed = true;
  
  // Test signup
  const signupPassed = await testSignup();
  allPassed = allPassed && signupPassed;
  
  // Test login (informational only)
  await testLogin();
  
  // Test user endpoints (informational only)
  await testUserEndpoints();
  
  if (allPassed) {
    console.log('\n✅ API tests completed!\n');
  } else {
    console.log('\n❌ Some API tests failed!\n');
  }
  
  console.log('📋 Manual Testing Checklist:\n');
  console.log('1. Open http://localhost:3000');
  console.log('2. Click "Sign Up" and create a new account');
  console.log('3. Check that you are redirected to login page');
  console.log('4. Log in with your credentials');
  console.log('5. Verify you see the welcome page');
  console.log('6. Check that onboarding starts after 5 seconds');
  console.log('7. Complete onboarding and reach dashboard');
  console.log('8. Try Google OAuth login');
  console.log('9. Check profile and settings pages work');
  console.log('10. Test logout functionality\n');
}

// Check if node-fetch is available
try {
  require.resolve('node-fetch');
  main();
} catch (e) {
  // For newer Node.js versions, fetch is built-in
  if (typeof fetch === 'undefined') {
    console.log('Installing node-fetch...');
    require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' });
    console.log('Please run the script again.');
  } else {
    // Use built-in fetch
    main();
  }
}