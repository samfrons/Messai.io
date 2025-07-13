# MESSAI Project Structure

This document provides the complete technology stack and file tree structure for the MESSAI platform. **AI agents MUST read this file to understand the project organization before making any changes.**

## Technology Stack

### Core Framework & Language
- **Node.js 18+** with **npm 9+** - Runtime and package management
- **TypeScript 5.8.3** - Type-safe development with strict mode enabled
- **Nx 20.3.0** - Monorepo management and build orchestration
- **Next.js 15.3.5** - Full-stack React framework with App Router

### Frontend Technologies
- **React 18.3.1** - Component-based UI framework
- **React Three Fiber 9.2.0** - React renderer for Three.js
- **Three.js 0.169.0** - 3D graphics and WebGL rendering
- **@react-three/drei 10.4.4** - Three.js helper components and utilities
- **Tailwind CSS 3.4.17** - Utility-first styling with custom theme support
- **Framer Motion 12.23.0** - Animation and gesture library
- **Zustand 5.0.6** - Lightweight state management
- **React Hook Form 7.59.0** - Form handling with validation
- **Recharts 2.15.4** - Data visualization and charting

### Database & Authentication
- **Prisma 5.22.0** - Type-safe ORM with intelligent dual-database support
- **SQLite** - Development database (file:./prisma/dev.db)
- **PostgreSQL** - Production database with automatic provider detection
- **NextAuth.js 4.24.11** - Authentication with multiple providers:
  - Google OAuth (GOOGLE_CLIENT_ID/SECRET)
  - GitHub OAuth (GITHUB_CLIENT_ID/SECRET)
  - Email/Password with bcryptjs hashing

### AI & Machine Learning
- **OpenAI API 5.8.2** - AI-powered research assistance and predictions
- **Zod 3.25.72** - Schema validation and type inference
- **Axios 1.10.0** - HTTP client for external API integrations
- **Cheerio 1.1.0** - Server-side HTML parsing for literature extraction

### Development & Quality Tools
- **Vitest 3.2.4** - Fast unit testing framework
- **@testing-library/react 16.3.0** - Component testing utilities
- **ESLint 8.57.1** - Code linting with Next.js configuration
- **Prettier** - Code formatting (configured via package scripts)
- **TypeScript Compiler** - Static type checking with strict configuration

### Real-time Communication & Performance
- **WebSocket** - Real-time experiment monitoring and live data updates
- **React Suspense** - Async component loading and error boundaries
- **Next.js Image Optimization** - Automatic image optimization and lazy loading
- **Dynamic Imports** - Code splitting for 3D models and heavy components

### Deployment & Infrastructure
- **Vercel** - Primary deployment platform with edge functions
- **Docker** - Containerization support for alternative deployments
- **Vercel Blob** - File storage for research papers and experimental data
- **Node Mailer 6.10.1** - Email service integration with SMTP support

### External Integrations
- **PubMed API** - Scientific literature discovery and metadata extraction
- **CrossRef API** - Citation validation and academic paper verification
- **IEEE Xplore API** - Engineering literature access and indexing
- **Google Scholar** - Research paper discovery and citation analysis
- **Resend 4.6.0** - Transactional email service for user communications

## Complete MESSAI Project Structure

```
messai-mvp/
├── README.md                           # Project overview and setup instructions
├── CLAUDE.md                           # Master AI context and development protocols
├── package.json                        # Root package configuration with Nx scripts
├── nx.json                             # Nx workspace configuration and caching
├── tsconfig.json                       # TypeScript root configuration
├── .gitignore                          # Git ignore patterns
│
├── apps/                               # Nx applications directory
│   └── web/                            # Main Next.js application
│       ├── app/                        # Next.js 15 App Router structure
│       │   ├── globals.css             # Global styles and Tailwind imports
│       │   ├── layout.tsx              # Root layout with authentication
│       │   ├── page.tsx                # Landing page with 3D visualization
│       │   ├── api/                    # Next.js API routes
│       │   │   ├── auth/[...nextauth]/ # NextAuth authentication endpoints
│       │   │   ├── papers/             # Research literature API endpoints
│       │   │   ├── predictions/        # AI prediction API endpoints
│       │   │   ├── materials/          # Material database API
│       │   │   ├── experiments/        # Experiment tracking API
│       │   │   └── user/               # User management API
│       │   ├── dashboard/              # Main research dashboard
│       │   ├── literature/             # Research paper management
│       │   ├── experiments/            # Experiment design and tracking
│       │   ├── models/                 # 3D system visualization
│       │   ├── parameters/             # MESS parameter configuration
│       │   └── settings/               # User preferences and account
│       ├── components/                 # React components library
│       │   ├── 3d/                     # Three.js 3D visualization components
│       │   │   ├── bioreactor/         # Bioreactor 3D models
│       │   │   └── electroanalytical/  # Electroanalytical tool models
│       │   ├── literature/             # Research paper components
│       │   ├── fuel-cell/              # Fuel cell system components
│       │   ├── onboarding/             # User onboarding wizard
│       │   └── ui/                     # Shared UI component library
│       ├── lib/                        # Utility libraries and configurations
│       │   ├── auth/                   # Authentication configuration
│       │   ├── db.ts                   # Database client with dual-provider support
│       │   ├── config.ts               # Application configuration and feature flags
│       │   ├── ai-predictions.ts       # AI prediction engine integration
│       │   └── utils.ts                # Shared utility functions
│       ├── prisma/                     # Database schema and migrations
│       │   ├── schema.prisma           # Unified Prisma schema
│       │   ├── seed.ts                 # Database seeding scripts
│       │   └── dev.db                  # SQLite development database
│       ├── middleware.ts               # Next.js middleware for auth
│       ├── next.config.js              # Next.js configuration
│       ├── package.json                # Web app dependencies
│       ├── project.json                # Nx project configuration
│       └── tsconfig.json               # TypeScript configuration
│
├── packages/                           # Nx shared libraries
│   └── @messai/                        # MESSAI-specific packages namespace
│       ├── core/                       # Core business logic and types
│       │   ├── src/
│       │   │   ├── types/              # Shared TypeScript interfaces
│       │   │   ├── materials/          # Electrode and material database
│       │   │   ├── microbes/           # Microbial species database
│       │   │   ├── predictions/        # Prediction engine algorithms
│       │   │   └── analysis/           # Electroanalytical analysis tools
│       │   ├── package.json            # Core package dependencies
│       │   └── project.json            # Nx project configuration
│       ├── ui/                         # Shared UI component library
│       │   ├── src/
│       │   │   ├── 3d/                 # 3D visualization components
│       │   │   ├── optimization/       # Optimization interface components
│       │   │   └── [components].tsx    # Shared React components
│       │   ├── package.json            # UI package dependencies
│       │   └── project.json            # Nx project configuration
│       ├── ai/                         # AI and machine learning utilities
│       │   ├── src/
│       │   │   ├── knowledge-graph/    # Semantic knowledge graph
│       │   │   └── optimization/       # Optimization algorithms
│       │   ├── package.json            # AI package dependencies
│       │   └── project.json            # Nx project configuration
│       ├── 3d/                         # 3D visualization utilities
│       │   ├── src/
│       │   │   └── index.ts            # 3D utility functions
│       │   ├── package.json            # 3D package dependencies
│       │   └── project.json            # Nx project configuration
│       ├── ml/                         # Machine learning models and research
│       │   ├── src/
│       │   │   ├── research/           # Research assistance tools
│       │   │   ├── mlops/              # ML operations and monitoring
│       │   │   └── maintenance/        # Model maintenance utilities
│       │   ├── package.json            # ML package dependencies
│       │   └── project.json            # Nx project configuration
│       └── database/                   # Database utilities and helpers
│           ├── src/
│           │   └── index.ts            # Database utility functions
│           ├── package.json            # Database package dependencies
│           └── project.json            # Nx project configuration
│
├── docs/                               # Documentation and specifications
│   ├── ai-context/                     # AI-specific documentation
│   │   ├── project-structure.md        # This file - complete tech stack
│   │   ├── docs-overview.md            # 3-tier documentation architecture
│   │   ├── system-integration.md       # MESSAI component integration patterns
│   │   ├── deployment-infrastructure.md # Deployment and infrastructure docs
│   │   ├── handoff.md                  # Task management and session continuity
│   │   └── multi-agent-coordination.md # Multi-agent development protocols
│   ├── specs/                          # Feature specifications
│   └── open-issues/                    # Known issues and technical debt
│
├── scripts/                            # Automation and maintenance scripts
│   ├── literature/                     # Literature database management
│   ├── backup/                         # Database backup and restoration
│   ├── test-*.js                       # Testing and verification scripts
│   └── migrate-to-postgres.ts          # Database migration utilities
│
├── tests/                              # Test suites and testing utilities
│   ├── components/                     # Component unit tests
│   ├── integration/                    # Integration tests
│   ├── e2e/                            # End-to-end tests
│   ├── api/                            # API endpoint tests
│   └── setup.ts                       # Test configuration and setup
│
├── parameters/                         # MESS parameter library
│   ├── MESS_PARAMETERS_UNIFIED.json    # Comprehensive parameter database
│   ├── schemas/                        # Parameter validation schemas
│   └── docs/                           # Parameter documentation
│
├── reference/                          # Research references and validation
│   ├── designing-fuel-cell-systems-using-system-level-design-white-paper.pdf
│   ├── parameters/                     # Parameter reference data
│   └── validation/                     # Validation functions and ranges
│
├── requirements/                       # Feature requirements and specifications
│   ├── [timestamp-feature]/            # Timestamped requirement analysis
│   └── index.md                        # Requirements index
│
├── docker-compose.postgres.yml         # PostgreSQL development environment
├── vercel.json                         # Vercel deployment configuration
├── Dockerfile                          # Container configuration
└── .env.example                        # Environment variables template
```


## Key Architectural Decisions

### Nx Monorepo Strategy
- **Single Repository:** All MESSAI components in unified codebase
- **Shared Libraries:** Reusable packages under @messai namespace
- **Build Optimization:** Nx caching and dependency graph analysis
- **Development Commands:** `nx serve web`, `nx build web`, `nx test web`

### Database Architecture
- **Dual Database Support:** Automatic provider detection in lib/db.ts
- **Development:** SQLite file database for rapid local development
- **Production:** PostgreSQL with connection pooling and performance optimization
- **Schema Management:** Single Prisma schema with provider-specific optimizations

### 3D Visualization Strategy
- **React Three Fiber:** React integration for Three.js with component-based architecture
- **Performance Optimization:** Dynamic imports, render pooling, WebGL optimization
- **Model Catalog:** Standardized 3D models for different MESS configurations
- **Real-time Updates:** WebSocket integration for live experimental data

### AI Integration Patterns
- **OpenAI Integration:** Research assistance and prediction generation
- **Knowledge Graph:** Semantic relationships between research papers and parameters
- **Literature Processing:** Automated extraction from scientific papers
- **Prediction Engine:** ML models trained on 3,721+ research papers

### Authentication & Security
- **NextAuth.js:** Multi-provider authentication (Google, GitHub, Email)
- **Row-Level Security:** Database-level access control
- **Environment-based Configuration:** Feature flags and security settings
- **Session Management:** Secure token handling and user state persistence

---

*This documentation reflects the actual MESSAI platform architecture and should be referenced by all AI agents working on the project. Last updated: July 2025*