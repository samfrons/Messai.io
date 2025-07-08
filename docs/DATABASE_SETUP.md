# MESSAi Database Setup Guide

## Overview

MESSAi uses a dual database strategy:
- **Development**: SQLite for fast local development
- **Production**: PostgreSQL with Prisma Accelerate for scalability

## Development Setup (SQLite)

### Quick Start
```bash
# Use SQLite automatically in development
npm run dev

# Run migrations for SQLite
npm run db:migrate:dev

# Open Prisma Studio
npm run db:studio
```

### Benefits
- Zero configuration
- Fast startup
- Easy to reset/backup
- Perfect for local development

## Production Setup (PostgreSQL)

### Prerequisites
1. PostgreSQL database (Prisma Data Platform, Supabase, Neon, etc.)
2. Database connection URLs from your provider

### Configuration

#### 1. Set Environment Variables

In Vercel or your hosting platform, set:

```bash
# Direct connection (for migrations)
DATABASE_URL="postgres://[user]:[password]@db.prisma.io:5432/[database]?sslmode=require"

# Accelerate connection (for app queries)
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=[your-api-key]"

NODE_ENV="production"
```

#### 2. Push Schema to Production

```bash
# Push schema without migrations (recommended for first setup)
npm run db:push:prod

# Or run migrations
npm run db:migrate:prod
```

## Data Migration

### Export from SQLite
```bash
# Export all data to JSON
npm run migrate:export
```

### Import to PostgreSQL
```bash
# Set PostgreSQL URL
export DATABASE_URL="postgres://..."

# Import data
npm run migrate:import
```

### Full Migration
```bash
# Export and import in one command
npm run migrate:full
```

## Database Client Configuration

The database client (`lib/db.ts`) automatically:
- Uses SQLite when no PostgreSQL URL is set
- Uses PostgreSQL when DATABASE_URL contains "postgres"
- Uses Prisma Accelerate when PRISMA_DATABASE_URL is set in production

## Multiple Environments

### Local Development
```bash
# .env.local
DATABASE_URL="file:./prisma/dev.db"
```

### Staging
```bash
# .env.staging
DATABASE_URL="postgres://staging-url..."
NODE_ENV="production"
```

### Production
```bash
# Set in Vercel/hosting platform
DATABASE_URL="postgres://production-url..."
PRISMA_DATABASE_URL="prisma+postgres://accelerate-url..."
NODE_ENV="production"
```

## Prisma Accelerate

### Benefits
- Global connection pooling
- Query caching
- Reduced connection overhead
- Better performance at scale

### Setup
1. Enable Accelerate in Prisma Data Platform
2. Copy the Accelerate connection string
3. Set as PRISMA_DATABASE_URL in production

### Usage
The client automatically uses Accelerate when:
- NODE_ENV is "production"
- PRISMA_DATABASE_URL is set

## Literature Worktree

Both main app and literature worktree share the same database:

### Development
- Both use same SQLite file: `./prisma/dev.db`
- Changes are instantly visible in both

### Production
- Both use same PostgreSQL database
- Set same DATABASE_URL in both deployments

## Troubleshooting

### "Database is locked" (SQLite)
- Only one process can write at a time
- Stop other dev servers or Prisma Studio

### Connection refused (PostgreSQL)
- Check DATABASE_URL format
- Verify SSL mode (`?sslmode=require`)
- Check firewall/IP allowlist

### Schema out of sync
```bash
# Reset and push schema
npx prisma db push --force-reset

# Generate client
npx prisma generate
```

### Performance issues
- Enable Prisma Accelerate
- Check query optimization with `prisma.$queryRaw`
- Use indexes for frequently queried fields

## Best Practices

1. **Development**: Use SQLite for speed
2. **CI/CD**: Test with PostgreSQL in CI
3. **Staging**: Mirror production setup
4. **Production**: Use Accelerate for scale
5. **Backups**: Regular automated backups
6. **Monitoring**: Track query performance

## Commands Reference

```bash
# Development
npm run db:migrate:dev    # SQLite migrations
npm run db:studio         # Open Prisma Studio

# Production
npm run db:push:prod      # Push schema to PostgreSQL
npm run db:migrate:prod   # Run production migrations

# Migration
npm run migrate:export    # Export SQLite data
npm run migrate:import    # Import to PostgreSQL
npm run migrate:full      # Full migration

# Maintenance
npm run db:integrity      # Check database health
npm run db:backup         # Backup database
```