# Prisma Accelerate Setup Guide

## Overview

Prisma Accelerate provides global connection pooling and query caching for production PostgreSQL databases. This guide walks through enabling it for MESSAi.

## Prerequisites

1. PostgreSQL database deployed (you have this ✓)
2. Prisma Data Platform account
3. Direct database URL and Accelerate URL from Vercel

## Step 1: Install Accelerate Extension

```bash
npm install @prisma/extension-accelerate
```

## Step 2: Update Database Client

Update `lib/db.ts` to use Accelerate in production:

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isLocalDev = !isProduction && !process.env.DATABASE_URL?.includes('postgres')
  
  // Use SQLite for local development if no PostgreSQL URL is set
  const databaseUrl = isLocalDev 
    ? 'file:./prisma/dev.db' 
    : (process.env.DATABASE_URL || 'file:./prisma/dev.db')
  
  // For production with Prisma Accelerate, use PRISMA_DATABASE_URL if available
  const connectionUrl = isProduction && process.env.PRISMA_DATABASE_URL 
    ? process.env.PRISMA_DATABASE_URL 
    : databaseUrl

  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: isProduction ? ['error'] : ['error', 'warn'],
  })

  // Enable Accelerate in production
  if (isProduction && process.env.PRISMA_DATABASE_URL) {
    return client.$extends(withAccelerate())
  }

  return client
}
```

## Step 3: Environment Variables

In Vercel, ensure these are set:

```bash
# Direct connection (for migrations)
DATABASE_URL="postgres://[user]:[password]@db.prisma.io:5432/[database]?sslmode=require"

# Accelerate connection (for app queries)
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=[your-api-key]"

NODE_ENV="production"
```

## Step 4: Deploy Schema

```bash
# Push schema to production database
npm run db:push:prod

# Or run migrations
npm run db:migrate:prod
```

## Step 5: Verify Setup

1. Deploy to Vercel
2. Check logs for connection success
3. Monitor Prisma Data Platform dashboard

## Benefits

- **Connection Pooling**: Reduces connection overhead
- **Query Caching**: Faster repeated queries
- **Global Edge Network**: Lower latency worldwide
- **Automatic Retry**: Built-in resilience

## Monitoring

Access metrics at: https://console.prisma.io/

Track:
- Query performance
- Connection pool usage
- Cache hit rates
- Error rates

## Troubleshooting

### "Invalid prisma accelerate URL"
- Check PRISMA_DATABASE_URL format
- Verify API key is correct

### "Connection timeout"
- Check Accelerate is enabled in Prisma Console
- Verify network connectivity

### "Schema out of sync"
- Run migrations with direct DATABASE_URL
- Then restart app to use Accelerate URL

## Local Development

Accelerate is NOT used locally. The system automatically:
- Uses SQLite by default
- Or PostgreSQL if DATABASE_URL is set
- Never uses Accelerate URL in development

## Testing with PostgreSQL Locally

```bash
# Start local PostgreSQL
npm run db:postgres:up

# Test setup
npm run db:test-postgres

# Use PostgreSQL locally
cp .env.postgres.local .env.local
npm run dev

# Stop PostgreSQL
npm run db:postgres:down
```