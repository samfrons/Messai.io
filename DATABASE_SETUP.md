# Database Setup Guide

MESSAi supports both local development with SQLite and production deployment with PostgreSQL.

## Local Development (SQLite)

For local development, the application automatically uses SQLite for simplicity and speed.

### Configuration

1. The `.env.development` file is automatically loaded when `NODE_ENV=development`
2. It configures SQLite with: `DATABASE_URL="file:./prisma/dev.db"`
3. Uses the SQLite schema at `prisma/schema.sqlite.prisma`
4. Database provider detection in `lib/database-utils.ts` handles compatibility

### Setup Commands

```bash
# Generate Prisma client for SQLite
DATABASE_URL="file:./prisma/dev.db" npx prisma generate --schema=prisma/schema.sqlite.prisma

# Push schema to SQLite database
DATABASE_URL="file:./prisma/dev.db" npx prisma db push --schema=prisma/schema.sqlite.prisma

# Start development server
npm run dev
```

### SQLite-Specific Features

- Uses `contains` for text searches (no case-insensitive mode)
- Automatic database creation when running `db push`
- Local file-based storage in `prisma/dev.db`

## Production (PostgreSQL)

Production uses PostgreSQL with Prisma Accelerate for enhanced performance.

### Configuration

1. Set `DATABASE_URL` and `DIRECT_URL` in production environment
2. Optionally set `PRISMA_ACCELERATE_URL` for connection pooling
3. Uses the main schema at `prisma/schema.prisma`

### Setup Commands

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start production server
npm start
```

### PostgreSQL-Specific Features

- Uses `mode: "insensitive"` for case-insensitive searches
- Connection pooling via Prisma Accelerate
- Advanced indexing and performance optimizations

## Database Compatibility

The application automatically detects the database provider and adjusts queries accordingly:

- **SQLite**: Uses simple `contains` filters
- **PostgreSQL**: Uses `contains` with `mode: "insensitive"` for case-insensitive searches

This is handled by the `createStringFilter()` function in `lib/database-utils.ts`, which prevents SQLite compatibility errors while maintaining PostgreSQL features.

## Environment Detection

The database provider is automatically detected based on the `DATABASE_URL`:

- SQLite: URLs starting with `file:`
- PostgreSQL: URLs containing `postgres` or `postgresql`

## Switching Between Databases

### To use SQLite locally:
1. Comment out `DATABASE_URL` in `.env.local`
2. Ensure `.env.development` has the SQLite URL
3. Restart the development server

### To use PostgreSQL locally:
1. Uncomment `DATABASE_URL` in `.env.local`
2. Restart the development server

## Schema Synchronization

Both schemas are kept in sync manually:
- `prisma/schema.prisma` - PostgreSQL (production)
- `prisma/schema.sqlite.prisma` - SQLite (development)

When adding new fields, update both schemas and test with both databases.