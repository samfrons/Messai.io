# 🐘 Vercel Postgres Setup for MESSAi

## Step 1: Create Vercel Postgres Database

### Option A: Through Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Storage" in the sidebar
3. Click "Create Database" → "Postgres"
4. Choose your database name: `messai-literature-db`
5. Select region closest to your users
6. Click "Create"

### Option B: Through Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Create database
vercel storage create postgres messai-literature-db
```

## Step 2: Get Connection Details

After creation, you'll see:
- **Database URL**: `postgres://username:password@host:port/database`
- **Connection Pooling URL**: `postgres://username:password@pooler-host:port/database`
- **Direct URL**: For migrations and schema pushes

**Important**: Use the **Connection Pooling URL** for your app, and **Direct URL** for Prisma migrations.

## Step 3: Configure Environment Variables

Add to your `.env.local`:
```bash
# Vercel Postgres - Connection Pooling (for app)
DATABASE_URL="postgres://username:password@pooler-host:port/database?pgbouncer=true&connect_timeout=15"

# Vercel Postgres - Direct Connection (for migrations)
DIRECT_URL="postgres://username:password@direct-host:port/database"

# Keep your existing API keys
OPENROUTER_API_KEY="your-existing-key"
CORE_API_KEY="your-existing-key"
GEMINI_API_KEY="your-existing-key"
```

## Step 4: Update Prisma Schema

Update your `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Your existing models stay the same...
```

## Step 5: Deploy Schema and Data

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to Vercel Postgres
npx prisma db push

# Seed with your cleaned data
npx tsx scripts/seed-remote-database.ts

# Verify the migration
npx tsx scripts/verify-remote-sync.ts
```

## Step 6: Update Production Environment

In your Vercel project settings:
1. Go to Settings → Environment Variables
2. Add the same DATABASE_URL and DIRECT_URL
3. Redeploy your application

## Security Best Practices

✅ **Connection Security**:
- Vercel Postgres uses SSL by default
- Connection pooling prevents connection exhaustion
- Automatic IP allowlisting for Vercel deployments

✅ **Data Security**:
- Regular automated backups
- Point-in-time recovery available
- Encrypted at rest and in transit

✅ **Access Control**:
- Never commit database URLs to git
- Use Vercel environment variables in production
- Rotate credentials periodically

## Benefits of Vercel Postgres

🚀 **Performance**:
- Global edge caching
- Connection pooling included
- Optimized for serverless functions

💰 **Cost-Effective**:
- Free tier: 60 hours of compute time
- Pay-as-you-scale pricing
- No upfront costs

🔧 **Developer Experience**:
- Seamless Prisma integration
- Built-in connection pooling
- Automatic SSL certificates

## Ready to Proceed?

Once you've completed these steps:

1. ✅ Your 345 cleaned papers will be safely stored in Vercel Postgres
2. 🚀 We can start collecting 845+ additional papers
3. 🤖 Run enhanced AI extraction on the expanded dataset
4. 📊 Scale to 1,200+ high-quality research papers

## Troubleshooting

**Connection Issues**:
```bash
# Test connection
npx prisma db push --preview-feature
```

**Migration Problems**:
```bash
# Reset and re-push if needed
npx prisma migrate reset
npx prisma db push
```

**Environment Variable Issues**:
- Make sure both DATABASE_URL and DIRECT_URL are set
- Restart your dev server after adding env vars
- Verify URLs don't have extra spaces or characters