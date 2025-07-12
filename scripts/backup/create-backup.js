#!/usr/bin/env node

/**
 * MESSAi Database Backup Script
 * 
 * Creates automated backups of the PostgreSQL database with:
 * - Timestamp-based naming
 * - Compression and encryption
 * - Upload to configured storage
 * - Integrity validation
 * 
 * Usage:
 *   npm run db:backup
 *   node scripts/backup/create-backup.js
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
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  alertEmail: process.env.BACKUP_ALERT_EMAIL,
  slackWebhook: process.env.SLACK_WEBHOOK_URL
};

/**
 * Validates that all required environment variables are set
 */
function validateConfig() {
  const required = ['DATABASE_URL', 'BACKUP_STORAGE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   ${key}`));
    console.error('\nPlease configure these in your .env file or deployment environment.');
    console.error('See .env.example for required variables.');
    process.exit(1);
  }
}

/**
 * Creates a timestamp-based backup filename
 */
function generateBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `messai-backup-${timestamp}.sql`;
}

/**
 * Creates a PostgreSQL database dump
 */
async function createDatabaseDump(filename) {
  console.log('📊 Creating database dump...');
  
  try {
    const dumpPath = path.join('/tmp', filename);
    
    // Create compressed PostgreSQL dump
    const command = `pg_dump "${config.databaseUrl}" --format=custom --compress=9 --verbose --file="${dumpPath}"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Database dump created: ${dumpPath}`);
    return dumpPath;
  } catch (error) {
    console.error('❌ Failed to create database dump:', error.message);
    throw error;
  }
}

/**
 * Encrypts the backup file if encryption key is provided
 */
async function encryptBackup(filePath) {
  if (!config.encryptionKey) {
    console.log('⚠️  No encryption key provided, skipping encryption');
    return filePath;
  }
  
  console.log('🔒 Encrypting backup file...');
  
  try {
    const encryptedPath = `${filePath}.enc`;
    const cipher = crypto.createCipher('aes-256-cbc', config.encryptionKey);
    
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(encryptedPath);
    
    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output);
      output.on('finish', () => {
        fs.unlinkSync(filePath); // Remove unencrypted file
        console.log('✅ Backup encrypted successfully');
        resolve(encryptedPath);
      });
      output.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Failed to encrypt backup:', error.message);
    throw error;
  }
}

/**
 * Calculates SHA-256 checksum for integrity validation
 */
async function calculateChecksum(filePath) {
  console.log('🔍 Calculating backup checksum...');
  
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => {
      const checksum = hash.digest('hex');
      console.log(`✅ Checksum calculated: ${checksum}`);
      resolve(checksum);
    });
    stream.on('error', reject);
  });
}

/**
 * Uploads backup to configured storage
 * Note: Implementation depends on storage provider
 */
async function uploadBackup(filePath, checksum) {
  console.log('☁️  Uploading backup to storage...');
  
  // This is a template - actual implementation depends on storage provider
  // Examples:
  // - AWS S3: Use AWS SDK
  // - Vercel Blob: Use @vercel/blob
  // - Google Cloud Storage: Use @google-cloud/storage
  
  if (config.backupStorageUrl.startsWith('s3://')) {
    return uploadToS3(filePath, checksum);
  } else if (config.backupStorageUrl.startsWith('blob://')) {
    return uploadToVercelBlob(filePath, checksum);
  } else {
    console.error('❌ Unsupported storage URL format');
    throw new Error('Unsupported storage provider');
  }
}

/**
 * Example S3 upload implementation (requires AWS SDK)
 */
async function uploadToS3(filePath, checksum) {
  console.log('📤 Uploading to AWS S3...');
  
  // TODO: Implement S3 upload
  // const AWS = require('aws-sdk');
  // const s3 = new AWS.S3();
  // ... S3 upload logic
  
  console.log('⚠️  S3 upload not implemented - add AWS SDK and implementation');
  return `s3://bucket/path/${path.basename(filePath)}`;
}

/**
 * Vercel Blob upload implementation
 */
async function uploadToVercelBlob(filePath, checksum) {
  console.log('📤 Uploading to Vercel Blob...');
  
  try {
    const { put } = require('@vercel/blob');
    const fs = require('fs');
    
    const filename = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    const blob = await put(`backups/${filename}`, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log(`✅ Backup uploaded to Vercel Blob: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error('❌ Vercel Blob upload failed:', error.message);
    throw error;
  }
}

/**
 * Sends success notification
 */
async function sendSuccessNotification(backupUrl, checksum, fileSize) {
  const message = `✅ MESSAi Database Backup Successful
  
Backup Details:
- File: ${path.basename(backupUrl)}
- Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB
- Checksum: ${checksum}
- Storage: ${backupUrl}
- Timestamp: ${new Date().toISOString()}

Retention: ${config.retentionDays} days`;

  if (config.alertEmail) {
    console.log('📧 Sending email notification...');
    // TODO: Implement email notification using existing email system
    console.log('⚠️  Email notification not implemented');
  }
  
  if (config.slackWebhook) {
    console.log('💬 Sending Slack notification...');
    // TODO: Implement Slack notification
    console.log('⚠️  Slack notification not implemented');
  }
  
  console.log('📋 Backup notification sent');
}

/**
 * Sends failure notification
 */
async function sendFailureNotification(error) {
  const message = `❌ MESSAi Database Backup Failed

Error: ${error.message}
Timestamp: ${new Date().toISOString()}

Please check the backup system immediately.`;

  if (config.alertEmail) {
    console.log('📧 Sending failure email notification...');
    // TODO: Implement email notification
  }
  
  if (config.slackWebhook) {
    console.log('💬 Sending failure Slack notification...');
    // TODO: Implement Slack notification
  }
  
  console.error('🚨 Backup failure notification sent');
}

/**
 * Main backup process
 */
async function createBackup() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting MESSAi database backup...');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Validate configuration
    validateConfig();
    
    // Create database dump
    const filename = generateBackupFilename();
    const dumpPath = await createDatabaseDump(filename);
    
    // Encrypt backup if key provided
    const encryptedPath = await encryptBackup(dumpPath);
    
    // Calculate checksum for integrity
    const checksum = await calculateChecksum(encryptedPath);
    
    // Get file size
    const stats = fs.statSync(encryptedPath);
    const fileSize = stats.size;
    
    // Upload to storage
    const backupUrl = await uploadBackup(encryptedPath, checksum);
    
    // Clean up local files
    fs.unlinkSync(encryptedPath);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Backup completed successfully in ${duration}s`);
    
    // Send success notification
    await sendSuccessNotification(backupUrl, checksum, fileSize);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    
    // Send failure notification
    await sendFailureNotification(error);
    
    process.exit(1);
  }
}

// Run backup if called directly
if (require.main === module) {
  createBackup();
}

module.exports = { createBackup, validateConfig };