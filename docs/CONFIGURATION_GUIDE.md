# MESSAI Configuration Guide

This comprehensive guide covers all configuration aspects of the MESSAI platform, including build system setup, development tools, and deployment configurations.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Package Manager Setup](#package-manager-setup)
- [Build System Configuration](#build-system-configuration)
- [Testing Configuration](#testing-configuration)
- [TypeScript Configuration](#typescript-configuration)
- [ESLint & Code Quality](#eslint--code-quality)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Deployment Configuration](#deployment-configuration)
- [IDE Configuration](#ide-configuration)
- [Troubleshooting](#troubleshooting)

## Project Architecture

### Nx Monorepo Structure

The project uses Nx for monorepo management with the following structure:

```
clean-messai/
├── apps/
│   └── web/                # Next.js 15 application
├── packages/
│   ├── @messai/core/      # Business logic & scientific calculations
│   └── @messai/ui/        # Shared UI components
├── docs/                  # Documentation
└── [configuration files]  # Root-level configs
```

### Key Configuration Files

- `nx.json` - Nx workspace configuration
- `package.json` - Root package with PNPM workspaces
- `tsconfig.base.json` - Base TypeScript configuration
- `.eslintrc.json` - ESLint rules for monorepo
- `pnpm-workspace.yaml` - PNPM workspace definition

## Package Manager Setup

### PNPM Configuration

**Required Version**: PNPM 8.15.0 or higher

#### Installation
```bash
# Install PNPM globally
npm install -g pnpm@8.15.0

# Verify installation
pnpm --version
```

#### Workspace Configuration

**File**: `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**File**: `package.json` (root)
```json
{
  "packageManager": "pnpm@8.15.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

#### PNPM Scripts

All scripts use PNPM with Nx orchestration:

```json
{
  "scripts": {
    "dev": "nx run-many -t dev --parallel",
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "lint": "nx run-many -t lint",
    "type-check": "nx run-many -t type-check"
  }
}
```

## Build System Configuration

### Nx Configuration

**File**: `nx.json`
```json
{
  "npmScope": "messai",
  "affected": {
    "defaultBase": "master"
  },
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "packages"
  },
  "targetDefaults": {
    "build": {
      "cache": true
    },
    "test": {
      "cache": true
    }
  }
}
```

### Port Configuration

**Custom Ports** (to avoid conflicts with other projects):
- **Development Server**: 3001 (instead of default 3000)
- **Nx Graph**: 4213 (instead of default 4211)

**File**: `apps/web/project.json`
```json
{
  "targets": {
    "dev": {
      "executor": "@nx/next:dev",
      "options": {
        "port": 3001
      }
    }
  }
}
```

**File**: `package.json` (root)
```json
{
  "scripts": {
    "graph": "NX_GRAPH_PORT=4213 nx graph"
  }
}
```

### Next.js 15 Configuration

**File**: `apps/web/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moved out of experimental in Next.js 15
  transpilePackages: ['@messai/ui', '@messai/core'],
  
  experimental: {
    // Other experimental features can go here
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

## Testing Configuration

### Vitest Setup (Jest Completely Removed)

**Critical**: This project uses Vitest exclusively. All Jest references have been removed.

#### Root Package Configuration

**File**: `package.json` (dependencies removed)
```json
{
  "devDependencies": {
    // ❌ "@nx/jest": "^21.2.3" - REMOVED
    "@vitest/coverage-v8": "^3.0.5",
    "@vitest/ui": "^3.0.0",
    "vitest": "^3.0.0"
  }
}
```

#### Test Setup Configuration

**File**: `tests/setup.ts`
```typescript
// ✅ Correct Vitest import
import '@testing-library/jest-dom/vitest';

// ❌ OLD (Jest): import '@testing-library/jest-dom';
```

#### Package Test Configurations

**File**: `packages/@messai/core/project.json`
```json
{
  "targets": {
    "test": {
      "executor": "@nx/vite:test",
      "options": {
        "command": "vitest run"
      }
    }
  }
}
```

#### Vitest Configuration

**File**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80
      }
    }
  }
});
```

### Playwright E2E Configuration

**File**: `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3001,
  },
});
```

## TypeScript Configuration

### Base Configuration

**File**: `tsconfig.base.json`
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2022",
    "module": "esnext",
    "lib": ["es2022", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "strict": true
  },
  "exclude": ["node_modules", "tmp"]
}
```

### Web App TypeScript Configuration

**File**: `apps/web/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "es6"],
    "module": "esnext",
    "moduleResolution": "node",
    "noEmit": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "resolveJsonModule": true,
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["../../components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["../../hooks/*"],
      "@/app/*": ["./app/*"],
      "@/reference/*": ["../../reference/*"],
      "@messai/ui": ["../../packages/@messai/ui/src/index.ts"],
      "@messai/ui/*": ["../../packages/@messai/ui/src/*"],
      "@messai/core": ["../../packages/@messai/core/src/index.ts"],
      "@messai/core/*": ["../../packages/@messai/core/src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "../../.next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### Key Path Mappings

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@/*` | `./src/*` | Local app files |
| `@/components/*` | `../../components/*` | Shared components |
| `@/lib/*` | `./src/lib/*` | App-specific libraries |
| `@messai/ui` | UI package | Shared UI components |
| `@messai/core` | Core package | Business logic |

## ESLint & Code Quality

### Simplified ESLint Configuration

**File**: `.eslintrc.json`
```json
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nx"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "*",
                "onlyDependOnLibsWithTags": ["*"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### Removed Package-Specific ESLint Configs

These files were removed to prevent conflicts:
- `packages/@messai/core/.eslintrc.json`
- `packages/@messai/ui/.eslintrc.json`

### Pre-commit Hooks

**File**: `.lintstagedrc.json`
```json
{
  "{apps,packages}/**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,html,css}": [
    "prettier --write"
  ]
}
```

## Environment Variables

### Environment File Structure

```
.env.example        # Template with dummy values
.env.local          # Local development (gitignored)
.env.production     # Production values (gitignored)
```

### Environment Schema Validation

**File**: `apps/web/src/env.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/messai"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Configuration

### Prisma Configuration

**File**: `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models go here...
```

### Database Scripts

```json
{
  "scripts": {
    "db:generate": "nx run-many -t db:generate",
    "db:push": "nx run-many -t db:push",
    "db:studio": "nx run-many -t db:studio"
  }
}
```

### Development Database (SQLite)

For local development:
```bash
DATABASE_URL="file:./dev.db"
```

### Production Database (PostgreSQL)

For production:
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Deployment Configuration

### Vercel Configuration

**File**: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/apps/web/$1"
    }
  ]
}
```

### Docker Configuration

**File**: `Dockerfile`
```dockerfile
FROM node:18-alpine AS base

# Install PNPM
RUN npm install -g pnpm@8.15.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3001
CMD ["pnpm", "start"]
```

### GitHub Actions CI/CD

**File**: `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:ci
      - run: pnpm build
```

## IDE Configuration

### VS Code Configuration

**File**: `.vscode/settings.json`
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

**File**: `.vscode/extensions.json`
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Node Version Management

**File**: `.nvmrc`
```
18.18.0
```

**File**: `.editorconfig`
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## Troubleshooting

### Common Configuration Issues

#### 1. Module Resolution Problems

**Problem**: `Cannot resolve '@/components/...'`

**Solution**: Check TypeScript path mappings in `apps/web/tsconfig.json`

#### 2. Test Execution Fails

**Problem**: Tests fail with Jest-related errors

**Solution**: Ensure complete Jest removal and Vitest setup:
```bash
# Check for any remaining Jest references
grep -r "jest" . --exclude-dir=node_modules
```

#### 3. ESLint Configuration Errors

**Problem**: ESLint fails to load configuration

**Solution**: Use simplified configuration and remove package-specific configs

#### 4. Port Conflicts

**Problem**: Port 3000 already in use

**Solution**: Project is configured for port 3001. Check `apps/web/project.json`

#### 5. PNPM Workspace Issues

**Problem**: Packages not found in workspace

**Solution**: Verify `pnpm-workspace.yaml` and package locations

### Debugging Commands

```bash
# Check Nx configuration
pnpm nx report

# View project graph
pnpm graph

# Clear all caches
pnpm nx reset
rm -rf node_modules .next
pnpm install

# Validate TypeScript configuration
pnpm type-check

# Check ESLint configuration
pnpm lint --debug
```

### Performance Optimization

#### Build Performance
- Enable Nx caching: `"cache": true` in targets
- Use parallel execution: `--parallel` flag
- Implement affected builds: `nx affected:build`

#### Development Performance
- Use Nx graph for dependency visualization
- Implement incremental builds
- Optimize TypeScript compilation with project references

---

**Configuration Guide Last Updated**: 2025-07-13  
**Next Review**: After major dependency updates  
**Status**: All configurations tested and verified