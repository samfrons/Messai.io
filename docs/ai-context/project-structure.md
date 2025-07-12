# MESSAi Project Structure

## Current Repository State
- **Location**: /Users/samfrons/Desktop/Messai
- **Current Branch**: master
- **Active Worktrees**: 4 (master, messai-home, messai-lab, messai-research)
- **Uncommitted Changes**: 204 files
- **Repository Size**: ~178MB

## Directory Structure

```
/Users/samfrons/Desktop/Messai/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication (NextAuth.js)
│   │   ├── papers/               # Research paper APIs
│   │   ├── research/             # Research system APIs
│   │   └── production-router/    # Production routing
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── research/                 # Research pages
│       ├── page.tsx              # Research browser
│       └── [id]/                 # Paper details
├── components/                   # React components
│   ├── 3d/                       # Three.js components
│   ├── ui/                       # UI components
│   ├── Layout.tsx                # Layout components
│   └── *.tsx                     # Feature components
├── lib/                          # Core libraries
│   ├── database-utils.ts         # Database utilities
│   ├── db.ts                     # Prisma client
│   └── *.ts                      # Utility functions
├── packages/                     # Monorepo packages
│   ├── @messai/core/             # Core business logic
│   │   ├── package.json
│   │   └── src/
│   │       ├── electrodes/       # Electrode database
│   │       ├── microbes/         # Microbe database
│   │       ├── power-calculator.ts
│   │       └── types.ts
│   └── @messai/ui/               # UI components
│       ├── package.json
│       └── src/
├── prisma/                       # Database
│   ├── schema.prisma             # Main schema
│   ├── dev.db                    # SQLite database
│   └── migrations/               # Database migrations
├── scripts/                      # Utility scripts
│   ├── research/                 # Research scripts
│   │   ├── advanced-data-extraction.ts
│   │   └── full-enhancement-pipeline.ts
│   └── backup/                   # Backup utilities
├── docs/                         # Documentation
│   ├── ai-context/               # AI context docs (NEW)
│   │   ├── MASTER.md            # Foundation tier
│   │   ├── project-structure.md  # This file
│   │   ├── components/          # Component docs
│   │   ├── features/            # Feature docs
│   │   └── workflows/           # Workflow docs
│   ├── README.md                 # Main docs index
│   └── *.md                      # Various docs
├── tests/                        # Test suites
├── public/                       # Static assets
├── .claude/                      # Claude configuration (NEW)
│   ├── commands/                 # Custom commands
│   └── hooks/                    # Git hooks
├── .github/                      # GitHub Actions
│   └── workflows/
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── package.json                  # Root package.json
├── pnpm-workspace.yaml           # PNPM workspace
├── CLAUDE.md                     # AI assistant context
└── README.md                     # Project README
```

## Key Files

### Configuration Files
- `next.config.js`: Next.js configuration
- `tsconfig.json`: TypeScript settings
- `tailwind.config.js`: Tailwind CSS config
- `package.json`: Dependencies and scripts
- `pnpm-workspace.yaml`: Monorepo configuration

### Database Files
- `prisma/schema.prisma`: Database schema
- `prisma/dev.db`: SQLite development database
- `lib/db.ts`: Prisma client instance

### Documentation Files
- `CLAUDE.md`: Comprehensive AI context
- `README.md`: Project overview
- `docs/ai-context/`: 3-tier documentation

### Core Application Files
- `app/layout.tsx`: Root layout component
- `app/page.tsx`: Landing page
- `lib/database-utils.ts`: Database helpers

## Worktree Locations

```
/Users/samfrons/Desktop/
├── Messai/                      # Main repository (master)
├── messai-home/                 # Marketing site
├── messai-lab/                  # Laboratory tools
├── messai-research/             # Research system
└── clean-messai/                # Clean architecture (planned)
```

## Package Structure

### @messai/core
- Business logic and calculations
- Scientific models and algorithms
- Type definitions
- No UI dependencies

### @messai/ui
- Reusable React components
- Design system implementation
- UI-specific hooks
- Component documentation

## API Structure

### Public APIs (/api)
- `/api/papers`: Paper CRUD operations
- `/api/research/stats`: Research statistics
- `/api/production-router`: Production routing

### Planned APIs (/api/v1)
- `/api/v1/core`: Core functionality
- `/api/v1/lab`: Laboratory tools
- `/api/v1/research`: Research system
- `/api/v1/ai`: AI/ML endpoints

## Database Schema Overview

### Core Models
- ResearchPaper: Scientific papers
- User: User accounts (future)
- Session: Auth sessions (future)

### Research Models
- Enhanced paper fields
- AI extraction data
- Performance metrics
- Material classifications

## Script Organization

### Research Scripts
- Data collection from APIs
- Quality validation
- Enhancement pipeline
- Database maintenance

### Utility Scripts
- Database backups
- Migration helpers
- Development tools
- Testing utilities

## Testing Structure

### Test Categories
- Unit tests: Individual functions
- Integration tests: API endpoints
- Component tests: React components
- E2E tests: User workflows

### Test Locations
- `tests/`: Main test directory
- `*.test.ts`: Unit tests
- `*.test.tsx`: Component tests

---

*This document provides a comprehensive overview of the MESSAi project structure and should be referenced when navigating the codebase.*