#!/usr/bin/env node

/**
 * MESSAi Safe Migration Script
 * 
 * Performs database migrations with automatic backup creation:
 * - Creates pre-migration backup
 * - Runs Prisma migration
 * - Validates migration success
 * - Provides rollback instructions if needed
 * 
 * Usage:
 *   npm run db:migrate-safe
 *   node scripts/backup/safe-migrate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import backup functionality
const { createBackup } = require('./create-backup.js');

/**
 * Validates environment and prerequisites
 */
function validateEnvironment() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL environment variable');
    process.exit(1);
  }
  
  // Check if prisma is available
  try {
    execSync('prisma --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Prisma CLI not found. Please install Prisma first.');
    process.exit(1);
  }
}

/**
 * Creates a pre-migration backup
 */
async function createPreMigrationBackup() {
  console.log('💾 Creating pre-migration backup...');
  
  try {
    await createBackup();
    console.log('✅ Pre-migration backup created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create pre-migration backup:', error.message);
    console.error('🚨 Migration aborted for safety');
    return false;
  }
}

/**
 * Checks for pending migrations
 */
function checkPendingMigrations() {
  console.log('🔍 Checking for pending migrations...');
  
  try {
    const result = execSync('prisma migrate status', { encoding: 'utf8', stdio: 'pipe' });
    
    if (result.includes('Database schema is up to date')) {
      console.log('✅ No pending migrations found');
      return false;
    } else if (result.includes('Following migration(s) have not been applied')) {
      console.log('📋 Pending migrations detected');
      return true;
    } else {
      console.log('⚠️  Migration status unclear, proceeding with caution');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Could not check migration status, proceeding with migration');
    return true;
  }
}

/**
 * Runs the Prisma migration
 */
function runMigration() {
  console.log('🔄 Running Prisma migration...');
  
  try {
    execSync('prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * Validates the database after migration
 */
function validateDatabase() {
  console.log('🔍 Validating database after migration...');
  
  try {
    // Test database connectivity
    execSync('prisma db pull --force', { stdio: 'pipe' });
    
    // Generate Prisma client to ensure schema is valid
    execSync('prisma generate', { stdio: 'pipe' });
    
    console.log('✅ Database validation passed');
    return true;
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    return false;
  }
}

/**
 * Main safe migration process
 */
async function safeMigrate() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting safe database migration...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Validate environment
    validateEnvironment();
    
    // Check for pending migrations
    const hasPendingMigrations = checkPendingMigrations();
    
    if (!hasPendingMigrations) {
      console.log('✅ Database is already up to date');
      process.exit(0);
    }
    
    // Create pre-migration backup
    const backupSuccess = await createPreMigrationBackup();
    if (!backupSuccess) {
      process.exit(1);
    }
    
    // Confirm migration
    console.log('⚠️  WARNING: About to run database migration');
    console.log('💾 Pre-migration backup has been created');
    console.log('🔄 Proceeding with migration...');
    
    // Run migration
    const migrationSuccess = runMigration();
    if (!migrationSuccess) {
      console.error('🚨 Migration failed - database backup is available for restoration');
      process.exit(1);
    }
    
    // Validate database
    const validationSuccess = validateDatabase();
    if (!validationSuccess) {
      console.error('🚨 Database validation failed after migration');
      console.error('💾 Consider restoring from backup if issues persist');
      process.exit(1);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Safe migration completed successfully in ${duration}s`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Safe migration failed:', error.message);
    console.error('💾 Pre-migration backup should be available for restoration');
    process.exit(1);
  }
}

// Show usage if called directly
if (require.main === module) {
  safeMigrate();
}

module.exports = { safeMigrate, validateEnvironment };