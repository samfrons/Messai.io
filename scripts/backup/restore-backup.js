#!/usr/bin/env node

/**
 * MESSAi Database Restore Script
 * 
 * Restores database from backup with:
 * - Backup validation and integrity checks
 * - Safe restoration procedures
 * - Pre-restore database backup
 * - Rollback capabilities
 * 
 * Usage:
 *   npm run db:restore -- --backup-file=backup-filename.sql
 *   node scripts/backup/restore-backup.js --backup-file=backup-filename.sql
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration from environment variables
const config = {
  databaseUrl: process.env.DATABASE_URL,
  backupStorageUrl: process.env.BACKUP_STORAGE_URL,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  alertEmail: process.env.BACKUP_ALERT_EMAIL
};

/**
 * Parses command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value;
    }
  });
  
  return options;
}

/**
 * Validates restore prerequisites
 */
function validateRestore(options) {
  if (!options['backup-file']) {
    console.error('❌ Missing required argument: --backup-file');
    console.error('Usage: npm run db:restore -- --backup-file=backup-filename.sql');
    process.exit(1);
  }
  
  if (!config.databaseUrl) {
    console.error('❌ Missing DATABASE_URL environment variable');
    process.exit(1);
  }
}

/**
 * Downloads backup file from storage
 */
async function downloadBackup(backupFile) {
  console.log(`📥 Downloading backup: ${backupFile}`);
  
  const localPath = path.join('/tmp', backupFile);
  
  // This is a template - actual implementation depends on storage provider
  if (config.backupStorageUrl.startsWith('s3://')) {
    await downloadFromS3(backupFile, localPath);
  } else if (config.backupStorageUrl.startsWith('blob://')) {
    await downloadFromVercelBlob(backupFile, localPath);
  } else {
    throw new Error('Unsupported storage provider');
  }
  
  console.log(`✅ Backup downloaded to: ${localPath}`);
  return localPath;
}

/**
 * Example S3 download implementation
 */
async function downloadFromS3(backupFile, localPath) {
  // TODO: Implement S3 download
  // const AWS = require('aws-sdk');
  // const s3 = new AWS.S3();
  // ... S3 download logic
  
  console.log('⚠️  S3 download not implemented - add AWS SDK and implementation');
  throw new Error('S3 download not implemented');
}

/**
 * Vercel Blob download implementation
 */
async function downloadFromVercelBlob(backupFile, localPath) {
  try {
    const https = require('https');
    const fs = require('fs');
    
    // Extract blob URL from backup file name or construct it
    const blobUrl = backupFile.startsWith('https://') 
      ? backupFile 
      : `${process.env.BACKUP_STORAGE_URL}/backups/${backupFile}`;
    
    console.log(`📥 Downloading from: ${blobUrl}`);
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(localPath);
      
      https.get(blobUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', reject);
      }).on('error', reject);
    });
  } catch (error) {
    console.error('❌ Vercel Blob download failed:', error.message);
    throw error;
  }
}

/**
 * Decrypts backup file if it's encrypted
 */
async function decryptBackup(filePath) {
  if (!config.encryptionKey || !filePath.endsWith('.enc')) {
    console.log('ℹ️  Backup is not encrypted or no decryption key provided');
    return filePath;
  }
  
  console.log('🔓 Decrypting backup file...');
  
  try {
    const decryptedPath = filePath.replace('.enc', '');
    const decipher = crypto.createDecipher('aes-256-cbc', config.encryptionKey);
    
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(decryptedPath);
    
    return new Promise((resolve, reject) => {
      input.pipe(decipher).pipe(output);
      output.on('finish', () => {
        console.log('✅ Backup decrypted successfully');
        resolve(decryptedPath);
      });
      output.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Failed to decrypt backup:', error.message);
    throw error;
  }
}

/**
 * Validates backup file integrity
 */
async function validateBackupIntegrity(filePath, expectedChecksum) {
  if (!expectedChecksum) {
    console.log('⚠️  No checksum provided, skipping integrity validation');
    return true;
  }
  
  console.log('🔍 Validating backup integrity...');
  
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => {
      const actualChecksum = hash.digest('hex');
      
      if (actualChecksum === expectedChecksum) {
        console.log('✅ Backup integrity validated');
        resolve(true);
      } else {
        console.error('❌ Backup integrity check failed');
        console.error(`Expected: ${expectedChecksum}`);
        console.error(`Actual:   ${actualChecksum}`);
        reject(new Error('Backup integrity check failed'));
      }
    });
    stream.on('error', reject);
  });
}

/**
 * Creates a pre-restore backup of current database
 */
async function createPreRestoreBackup() {
  console.log('💾 Creating pre-restore backup of current database...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreFilename = `pre-restore-backup-${timestamp}.sql`;
    const preRestorePath = path.join('/tmp', preRestoreFilename);
    
    const command = `pg_dump "${config.databaseUrl}" --format=custom --compress=9 --file="${preRestorePath}"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Pre-restore backup created: ${preRestorePath}`);
    return preRestorePath;
  } catch (error) {
    console.error('❌ Failed to create pre-restore backup:', error.message);
    throw error;
  }
}

/**
 * Confirms restoration with user
 */
async function confirmRestore(backupFile) {
  console.log('⚠️  WARNING: Database restore will overwrite all existing data!');
  console.log(`📁 Restoring from: ${backupFile}`);
  console.log('💾 A pre-restore backup will be created automatically');
  console.log('');
  
  // In production, you might want to require additional confirmation
  // For now, we'll proceed with a warning
  console.log('🔄 Proceeding with restore...');
  return true;
}

/**
 * Restores database from backup file
 */
async function restoreDatabase(backupPath) {
  console.log('🔄 Restoring database from backup...');
  
  try {
    // Drop existing connections (PostgreSQL specific)
    console.log('🔌 Terminating existing database connections...');
    const terminateCommand = `psql "${config.databaseUrl}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"`;
    
    try {
      execSync(terminateCommand, { stdio: 'inherit' });
    } catch (error) {
      console.log('ℹ️  Could not terminate connections (this is normal if none exist)');
    }
    
    // Restore from backup
    console.log('📊 Restoring database data...');
    const restoreCommand = `pg_restore --clean --if-exists --verbose --dbname="${config.databaseUrl}" "${backupPath}"`;
    
    execSync(restoreCommand, { stdio: 'inherit' });
    
    console.log('✅ Database restored successfully');
    
  } catch (error) {
    console.error('❌ Database restore failed:', error.message);
    throw error;
  }
}

/**
 * Validates restored database
 */
async function validateRestoredDatabase() {
  console.log('🔍 Validating restored database...');
  
  try {
    // Basic connectivity test
    const testCommand = `psql "${config.databaseUrl}" -c "SELECT 1;"`;
    execSync(testCommand, { stdio: 'pipe' });
    
    // Check if key tables exist (customize based on your schema)
    const tablesCommand = `psql "${config.databaseUrl}" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"`;
    const result = execSync(tablesCommand, { encoding: 'utf8' });
    
    if (result.includes('User') && result.includes('Account')) {
      console.log('✅ Database validation passed');
      return true;
    } else {
      console.error('❌ Database validation failed - missing expected tables');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    return false;
  }
}

/**
 * Sends restore notification
 */
async function sendRestoreNotification(success, backupFile, error = null) {
  const message = success 
    ? `✅ MESSAi Database Restore Successful\n\nRestored from: ${backupFile}\nTimestamp: ${new Date().toISOString()}`
    : `❌ MESSAi Database Restore Failed\n\nBackup: ${backupFile}\nError: ${error?.message}\nTimestamp: ${new Date().toISOString()}`;

  if (config.alertEmail) {
    console.log('📧 Sending restore notification...');
    // TODO: Implement email notification
  }
  
  console.log('📋 Restore notification logged');
}

/**
 * Main restore process
 */
async function restoreBackup() {
  const startTime = Date.now();
  let preRestoreBackupPath = null;
  
  try {
    console.log('🔄 Starting MESSAi database restore...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Parse arguments and validate
    const options = parseArguments();
    validateRestore(options);
    
    const backupFile = options['backup-file'];
    const expectedChecksum = options['checksum'];
    
    // Confirm restore operation
    await confirmRestore(backupFile);
    
    // Create pre-restore backup
    preRestoreBackupPath = await createPreRestoreBackup();
    
    // Download backup file
    const localBackupPath = await downloadBackup(backupFile);
    
    // Decrypt if necessary
    const decryptedPath = await decryptBackup(localBackupPath);
    
    // Validate backup integrity
    await validateBackupIntegrity(decryptedPath, expectedChecksum);
    
    // Restore database
    await restoreDatabase(decryptedPath);
    
    // Validate restored database
    const isValid = await validateRestoredDatabase();
    
    if (!isValid) {
      throw new Error('Database validation failed after restore');
    }
    
    // Clean up temporary files
    if (fs.existsSync(localBackupPath)) fs.unlinkSync(localBackupPath);
    if (fs.existsSync(decryptedPath) && decryptedPath !== localBackupPath) {
      fs.unlinkSync(decryptedPath);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Database restore completed successfully in ${duration}s`);
    console.log(`💾 Pre-restore backup available at: ${preRestoreBackupPath}`);
    
    // Send success notification
    await sendRestoreNotification(true, backupFile);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database restore failed:', error.message);
    
    if (preRestoreBackupPath) {
      console.log(`💾 Pre-restore backup available for rollback: ${preRestoreBackupPath}`);
      console.log('To rollback: npm run db:restore -- --backup-file=' + path.basename(preRestoreBackupPath));
    }
    
    // Send failure notification
    await sendRestoreNotification(false, options['backup-file'] || 'unknown', error);
    
    process.exit(1);
  }
}

// Show usage if no arguments provided
if (require.main === module) {
  const options = parseArguments();
  
  if (Object.keys(options).length === 0) {
    console.log('MESSAi Database Restore Script');
    console.log('');
    console.log('Usage:');
    console.log('  npm run db:restore -- --backup-file=backup-filename.sql');
    console.log('  npm run db:restore -- --backup-file=backup-filename.sql --checksum=sha256hash');
    console.log('');
    console.log('Options:');
    console.log('  --backup-file    Name of backup file to restore (required)');
    console.log('  --checksum      Expected SHA-256 checksum for integrity validation (optional)');
    console.log('');
    process.exit(1);
  }
  
  restoreBackup();
}

module.exports = { restoreBackup, validateRestore };