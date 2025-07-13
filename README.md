# MESSAi - Clean Architecture

> **Microbial Electrochemical Systems AI Platform** - Clean, minimal foundation for bioelectrochemical systems research and development.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/messai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green)](https://vitest.dev/)

## Architecture Overview

This repository implements a **production-ready** modular monorepo architecture using:

- **Nx Monorepo** for build orchestration and project management
- **PNPM 8+** for package management with workspaces
- **TypeScript 5** for type safety with strict mode
- **Next.js 15** for the web application with App Router
- **Vitest** for testing (Jest completely removed)

## Project Structure

```
clean-messai/
├── packages/                    # Shared packages
│   ├── @messai/core/           # Core business logic
│   ├── @messai/ui/             # UI components
│   ├── @messai/api/            # API utilities (planned)
│   └── @messai/database/       # Database layer (planned)
├── apps/
│   └── web/                    # Main Next.js application
├── infrastructure/             # Deployment configs (planned)
└── docs/                       # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM 8+

### Installation

```bash
# Clone and install dependencies
git clone <repository>
cd clean-messai
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check
```

The web application will be available at `http://localhost:3001`.

## Packages

### @messai/core
Core business logic and scientific calculations for bioelectrochemical systems.

**Features:**
- Scientific constants and utilities
- Power prediction algorithms  
- Material and microbial databases
- Type-safe interfaces with Zod validation

### @messai/ui
Shared UI components and design system.

**Features:**
- Basic components (Button, Input, Card)
- Tailwind CSS integration
- Theme utilities
- Accessible design patterns

## Comprehensive Library System

The following 12 library files provide full functionality for the MESS platform:

### Core Libraries
- **demo-mode.ts** - Demo mode utilities and state management
- **db.ts** - Database connection utilities and helpers
- **database-utils.ts** - Advanced database utilities and query builders

### Authentication & Security
- **auth/auth-options.ts** - NextAuth.js configuration with Google/GitHub OAuth

### Scientific Computing
- **fuel-cell-predictions.ts** - AI-powered performance prediction engine
- **parameters-data.ts** - Comprehensive MESS parameters library (1500+ parameters)
- **unified-systems-catalog.ts** - Systems catalog with 13 MFC designs
- **control-system-simulation.ts** - Control system simulation and PID controllers
- **fuel-cell-optimization.ts** - Genetic algorithms and optimization functions

### Research & Academic
- **citation-verifier.ts** - Citation verification and academic reference system
- **zen-browser.ts** - Web scraping integration and data extraction

### Type Definitions
- **types/fuel-cell-types.ts** - Comprehensive TypeScript definitions for fuel cell systems

## API Endpoints

- **GET /api/health** - System health check
- **POST /api/predictions** - AI-powered performance predictions
- **GET /api/materials** - Material database access
- **GET /api/systems** - System catalog access

## Deployment

This architecture supports multiple deployment strategies:

- **Vercel** (recommended for web apps)
- **Docker** (self-hosted)
- **Individual packages** (npm registry)

## Development Workflow

### Port Configuration
- **Development Server**: `http://localhost:3001` (not 3000)
- **Nx Graph**: `http://localhost:4213`

### Testing
- **Framework**: Vitest (Jest completely removed)
- **Commands**: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
- **E2E**: Playwright for end-to-end testing

### Module Resolution
TypeScript path mappings configured for:
- `@/*` → `./src/*` (local app paths)
- `@/components/*` → `../../components/*` (shared components)
- `@/lib/*` → `./src/lib/*` (app-specific libraries)
- `@messai/ui` → Shared UI package
- `@messai/core` → Core business logic package

### Development Process
1. **Core changes** → `packages/@messai/core`
2. **UI components** → `packages/@messai/ui`  
3. **Web features** → `apps/web`
4. **Cross-cutting** → Shared packages

## Extension Points

This clean foundation can be extended with:

- Laboratory tools (3D modeling, simulations)
- Research management (paper database, analysis)
- AI/ML features (advanced predictions, optimization)
- Marketing site (public-facing content)

Each extension should be developed in feature-specific worktrees that build upon this foundation.

## Scientific Focus

MESSAi specializes in:

- **Microbial Fuel Cells (MFC)**
- **Microbial Electrolysis Cells (MEC)**  
- **Microbial Desalination Cells (MDC)**
- **Microbial Electrosynthesis (MES)**

## Contributing

1. Follow the established architecture patterns
2. Maintain type safety with TypeScript
3. Add tests for new functionality
4. Update documentation as needed

## License

MIT License - see LICENSE file for details.