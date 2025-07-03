#!/usr/bin/env node

/**
 * Quick setup script for Vercel deployment
 * Run with: node scripts/setup-vercel.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 MESSAi Vercel Setup Helper\n');

// Generate a secure secret
const generateSecret = () => crypto.randomBytes(32).toString('base64');

// Check if we're using PostgreSQL schema
const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const isUsingSQLite = schemaContent.includes('provider = "sqlite"');

if (isUsingSQLite) {
  console.log('⚠️  WARNING: Your schema is configured for SQLite.');
  console.log('   SQLite does not work on Vercel (serverless environment).');
  console.log('   You need to switch to PostgreSQL:\n');
  console.log('   1. Get a PostgreSQL database (Vercel Postgres, Supabase, or Neon)');
  console.log('   2. Run: mv prisma/schema.prisma prisma/schema.sqlite.prisma');
  console.log('   3. Run: mv prisma/schema.postgresql.prisma prisma/schema.prisma');
  console.log('   4. Update your DATABASE_URL\n');
}

// Check package.json for postinstall
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (!packageJson.scripts.postinstall || !packageJson.scripts.postinstall.includes('prisma generate')) {
  console.log('📦 Adding Prisma postinstall script...');
  packageJson.scripts.postinstall = 'prisma generate';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json\n');
}

// Generate environment variables template
const envTemplate = `# Vercel Environment Variables
# Add these in your Vercel project settings

# Database (PostgreSQL required for Vercel)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://your-project.vercel.app"
NEXTAUTH_SECRET="${generateSecret()}"

# Email Service (recommended for production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM="MESSAi <noreply@your-domain.com>"

# Email Verification
REQUIRE_EMAIL_VERIFICATION="true"
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`;

// Save template
fs.writeFileSync('.env.vercel.template', envTemplate);
console.log('📄 Created .env.vercel.template with required variables\n');

// Check if vercel.json exists
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (!fs.existsSync(vercelConfigPath)) {
  const vercelConfig = {
    buildCommand: "prisma generate && prisma db push && next build",
    env: {
      NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION: "@require_email_verification"
    }
  };
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('📄 Created vercel.json configuration\n');
}

console.log('📋 Next Steps:');
console.log('1. Set up a PostgreSQL database (Vercel Postgres, Supabase, or Neon)');
console.log('2. Copy environment variables from .env.vercel.template');
console.log('3. Add them to your Vercel project settings');
console.log('4. Deploy with: vercel --prod\n');

console.log('🔗 Useful Links:');
console.log('- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres');
console.log('- Supabase: https://supabase.com');
console.log('- Neon: https://neon.tech');
console.log('- Vercel Environment Variables: https://vercel.com/docs/environment-variables\n');

console.log('✨ Happy deploying!');