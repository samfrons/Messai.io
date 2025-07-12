# 🚀 Remote Database Setup Guide

## Quick Setup with Railway (Recommended)

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (free)
3. Create a new project

### Step 2: Add PostgreSQL Database
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Railway will provision a PostgreSQL database
3. Go to the PostgreSQL service → "Connect" tab
4. Copy the "Postgres Connection URL"

### Step 3: Update Local Environment
Add to your `.env.local` file:
```bash
# Remote Database (Railway PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Step 4: Push Schema and Data
```bash
# Push schema to remote database
npx prisma db push

# Seed with our cleaned data
npx tsx scripts/seed-remote-database.ts
```

## Alternative: Supabase Setup

### Step 1: Create Supabase Project
1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Wait for setup to complete

### Step 2: Get Connection String
1. Go to Settings → Database
2. Copy the Connection String (URI)
3. Replace [YOUR-PASSWORD] with your database password

### Step 3: Configure Environment
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

## After Setup

Once you have the remote database configured:

1. **Test Connection**:
   ```bash
   npx prisma db push
   ```

2. **Migrate Data**:
   ```bash
   npx tsx scripts/seed-remote-database.ts
   ```

3. **Verify Data**:
   ```bash
   npx tsx scripts/verify-remote-sync.ts
   ```

4. **Continue Adding Papers**:
   ```bash
   npm run literature:enhance-all
   ```

## Security Notes

- Never commit the actual DATABASE_URL to git
- Use Railway/Supabase environment variables in production
- Keep backups of your data
- Test the connection before migrating all data

## Ready to Proceed?

Once you've set up Railway or Supabase, we can:
1. Push the cleaned database to remote
2. Add more real papers using enhanced scripts
3. Run improved data extraction
4. Scale up the literature collection safely