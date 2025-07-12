# MESSAi - Clean Architecture

> **Microbial Electrochemical Systems AI Platform** - Clean, minimal foundation for bioelectrochemical systems research and development.

## Architecture Overview

This repository implements a clean, modular monorepo architecture using:

- **Turborepo** for build orchestration
- **PNPM** for package management
- **TypeScript** for type safety
- **Next.js 14** for the web application

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

The web application will be available at `http://localhost:3000`.

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

## API Endpoints

- **GET /api/health** - System health check

## Deployment

This architecture supports multiple deployment strategies:

- **Vercel** (recommended for web apps)
- **Docker** (self-hosted)
- **Individual packages** (npm registry)

## Development Workflow

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