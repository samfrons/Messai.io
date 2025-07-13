# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## 1. Project Overview
- **Vision:**   To democratize microbial electrochemical systems research, development, education and commericalization by creating the world's most comprehensive, AI-powered platform that unifies and standardizes knowledge extraction, experimentation, and design, accelerating the transition to sustainable energy solutions.

- **Mission:**   MESSAI empowers researchers, engineers, and innovators worldwide with cutting-edge tools for designing, simulating, and optimizing electrochemical systems
  through intelligent 3D modeling, AI-driven predictions, and collaborative research capabilities.

- **Value Proposition**

  MESSAI bridges the gap between complex electrochemical theory and practical implementation by providing:
  - Unified Platform: Single interface and intelligent database for both microbial (MFC, MEC, MDC) and fuel cell (PEM, SOFC, PAFC), and electrochemical bioreactor systems
  - AI Intelligence: Machine learning models trained on 3,721+ research papers for accurate predictions
  - 3D Visualization: Interactive, real-time system modeling and visualization
  - Knowledge Base: Comprehensive research library with AI-enhanced insights
  - Collaborative Tools: Experiment tracking, sharing, and team collaboration features

- **Core Features & Capabilities**

1. Research Intelligence System (Phase 1)
  - 3,721+ Enhanced Papers: AI-summarized with extracted performance metrics that informs our prediction engine
  - Knowledge Graph: 1,200+ nodes with 2,750+ connections
  - Smart Search: Semantic search across abstracts, methods, and results
  - Citation Networks: Discover research lineages and related work
  - External Integration: PubMed, CrossRef, IEEE Xplore APIs

2. MESS Parameter Database (Phase 2)

  - 1500+ MESS Parameters: Comprehensive parameter library with 150 categories
  - Custom Materials: User-defined electrodes and microbial species
  - Compatibility Matrix: Material-microbe-configuration-operation interaction predictions
  - Property Calculations: Auto-derived properties from basic inputs
  - Validation Rules: Scientific accuracy enforcement

2. MESS Model Design Catalog

  - Starting with 4, a growing collection of original Multi-scale MESS models in our production pipeline 
  - Microfluidic algal fuel cell microscope slide chip with magnetic electrodes and hydrogel top layer membrane 
  - Stacked fuel cell slide pile for series or parellel configurations to increase current and/or voltage 
  - Benchtop bioelectrochemical reactor for lab experiments and culture cultivation
  - Industrial scale waste-to-energy system with a focus on brewery 
  

3. Research-derived, AI-Enhanced Performance Prediction Engine

  - Performance Predictions: Power output, efficiency, and optimization recommendations
  - Multi-objective Optimization: Genetic algorithms, particle swarm, gradient descent
  - Confidence Scoring: Prediction reliability based on training data quality
  - Parameter Sensitivity Analysis: Understand impact of design choices


  4. Interactive 3D Modeling Lab

  - Real-time Rendering: Three.js-powered system visualization
  - Complete Model Representation: Visual differentiation of electrode materials, chamber configurations, environmental parameters
  - Biofilm Simulation: Dynamic microbial community visualization
  - Flow Patterns: Animated substrate and electron flow
  - Multi-scale Views: From molecular to system-level perspectives
  - Real-time Cost Analysis: Material costs, efficiency ratings, and ROI calculations
  - Run time-based experiments on digital models to have foundational knowledge from digital research before expensive and time-consuming real-world system experiements

  5. Experiment Management Platform

  - Complete Lifecycle: Setup → Running → Analysis → Sharing
  - Real-time Monitoring: Live data collection and visualization
  - Performance Benchmarking: Compare against predictions and reesarch literature
  - Collaboration Tools: Public/private sharing, team workspaces
  - Data Export: CSV, JSON, research-ready formats

6. Publication and Funding Pipeline Platform (future features)
- Accelerate research publication with templates that integrate your experiment outcomes, background research, and key findings
- Grant funding matching and application template generation

## 2. User Stories & Requirements
  1. Research Scientist Persona

  "As a research scientist, I need to..."

  Literature Management

  - Search scientific papers using MES-specific parameters (organism types, electrode materials, power output)
  - Upload and manage my own research papers with proper metadata
  - Link papers to experiments for accurate citation tracking
  - Access cached results for improved performance when offline
  - Filter searches by date range, journal, and performance metrics

  Model Configuration

  - Configure custom electrode materials beyond predefined options
  - Select and customize microbial communities with specific properties
  - Save successful configurations as reusable presets
  - Share configurations with the research community
  - Get real-time performance predictions based on my configurations

  Experiment Tracking

  - Track experiments from initial setup through completion
  - Record time-series measurements (voltage, current, pH, temperature)
  - Compare actual results with AI predictions
  - Generate publication-ready reports and visualizations
  - Collaborate with team members on shared experiments

2. Laboratory Manager Persona

  "As a lab manager, I need to..."

  - Design cost-effective experimental setups within budget constraints
  - Optimize material selection for performance vs. cost
  - Track inventory of electrode materials and supplies
  - Schedule experiments across multiple researchers
  - Generate compliance reports for safety protocols

3. Graduate Student Persona

  "As a graduate student, I need to..."

  - Learn about different MFC designs through interactive 3D models
  - Access educational content about electrochemical principles
  - Practice with guided tutorials and example configurations
  - Receive compatibility warnings with educational explanations
  - Track my learning progress through the platform

4. Industry Engineer Persona

  "As an industry engineer, I need to..."

  - Scale laboratory designs to pilot and industrial applications
  - Perform techno-economic analysis for commercial viability
  - Integrate with existing wastewater treatment infrastructure
  - Model long-term performance and maintenance requirements
  - Generate reports for stakeholder presentations

- **Phases:**   
Phase 1: 
- Core platform architecture
  - Basic 3D visualization
  - AI prediction engine
  - Research paper database
  - User authentication

  Phase 2: Enhancement 

  - Advanced material customization
  - Preset sharing community
  - Real-time sensor integration
  - Mobile application
  - Enhanced ML models

  Phase 3: Integration 

  - IoT device connectivity
  - Laboratory equipment APIs
  - Blockchain research verification
  - Multi-language support
  - API marketplace

  Phase 4: Scale

  - Global research consortium
  - AR/VR visualization
  - Quantum computing optimization
  - Automated lab integration
  - Enterprise features

  Long-term Vision (2026+)

  Research Acceleration

  - AI Research Assistant: Automated literature review and hypothesis generation
  - Predictive Maintenance: ML-driven system health monitoring
  - Materials Discovery: AI-guided new material recommendations

  Global Collaboration

  - Research Networks: Connected labs sharing real-time data
  - Standardization: Industry-standard protocols and benchmarks
  - Open Science: Reproducible research with versioned experiments

  Sustainability Impact

  - Carbon Tracking: Environmental impact assessment
  - Circular Economy: Waste-to-energy optimization
  - Policy Integration: Regulatory compliance automation


Success Metrics

  Platform Adoption

  - 500+ active researchers within first year
  - 50+ universities using for education
  - 10,000+ experiments tracked
  - 100+ peer-reviewed papers citing MESSAI

  Scientific Impact

  - 20% improvement in prediction accuracy
  - 30% reduction in experiment design time
  - 5x increase in successful configurations
  - 1000+ new material combinations tested

  Business Metrics

  - 80% user retention rate
  - 50% conversion to premium features
  - 90% user satisfaction score
  - 25% quarterly growth rate



  Contributing & Community

  Open Source Philosophy

  MESSAI is committed to open science and collaborative development. The core platform is MIT licensed, encouraging:
  - Community contributions
  - Fork for specialized applications
  - Integration with other tools
  - Transparent development

  Contribution Areas

  - Core Features: Platform enhancements
  - Scientific Models: Algorithm improvements
  - Documentation: Tutorials and guides
  - Translations: Multi-language support
  - Integrations: Third-party connections

  Community Channels

  - GitHub Discussions for technical topics
  - Discord for real-time collaboration
  - Monthly research webinars
  - Annual user conference


- **Key Architecture:** Nx Monorepo [Claude help here]
- **Development Strategy:** Independent worktrees for each of the core features with sub-agents working within same context but on different, coordinated workstreams [Claude help here]

## 2. Project Structure & Technology Stack

### Current Technology Stack (Updated 2025)

**Frontend & UI:**
- **Next.js 15** with App Router for production builds
- **React 18** with TypeScript 5 (strict mode)
- **Three.js & React Three Fiber** for 3D visualization
- **Tailwind CSS** with custom theme switching
- **Framer Motion** for animations

**Development & Build:**
- **Nx Monorepo** for build orchestration and project management
- **PNPM 8+** as package manager (workspaces configured)
- **Vitest** for unit and integration testing (Jest fully removed)
- **Playwright** for end-to-end testing
- **TypeScript 5** with strict mode and comprehensive path mapping

**State Management & Data:**
- **Zustand** for client-side state management
- **React Context** for component-level state
- **PostgreSQL** (production) / **SQLite** (development)
- **Prisma ORM** with type-safe database access

**Authentication & Security:**
- **NextAuth.js** with OAuth providers (Google, GitHub)
- **Enhanced security middleware** with CSP headers
- **Environment validation** with Zod schemas

**Deployment & Infrastructure:**
- **Vercel** primary deployment platform
- **Docker** support for self-hosting
- **Custom port configuration**: Dev server on port 3001 (not 3000)




## Development Configuration & Commands

### Port Configuration
This project is configured to run on non-default ports to allow multiple Nx repos to run simultaneously:
- **Next.js Dev Server**: Port 3001 (default: 3000)
- **Nx Graph Visualization**: Port 4213 (default: 4211)

### Testing Framework Migration
**IMPORTANT**: This project uses Vitest exclusively. All Jest references have been completely removed.
- ✅ Removed Jest dependencies from package.json
- ✅ Updated all project.json test commands to use Vitest
- ✅ Fixed test setup to use @testing-library/jest-dom/vitest
- ✅ All tests now run through Vitest with proper module resolution

### Module Resolution & TypeScript Paths
The project now has comprehensive path mapping configured in apps/web/tsconfig.json:
- `@/*` → `./src/*` (local app paths)
- `@/components/*` → `../../components/*` (shared components)
- `@/lib/*` → `./src/lib/*` (app-specific libraries)
- `@messai/ui` → Shared UI package
- `@messai/core` → Core business logic package

### Essential Commands
```bash
# Install dependencies
pnpm install

# Start development server (Next.js app on port 3001)
pnpm dev

# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint

# Run tests across all packages (uses Vitest)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking across all packages
pnpm type-check

# Clean build artifacts
pnpm clean
```

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Push database schema changes
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Configuration Status
The following configuration issues have been resolved:
- ✅ ESLint configuration simplified for monorepo compatibility
- ✅ Next.js 15 transpilePackages moved out of experimental section
- ✅ TypeScript path mappings fixed for all @/ imports
- ✅ 12 comprehensive library files created for missing modules
- ✅ Vitest setup optimized with proper test configuration
- ✅ Build process now succeeds without errors

### Created Library Files
The following libraries were created to resolve module resolution issues:
1. **apps/web/src/lib/demo-mode.ts** - Demo mode utilities and state management
2. **apps/web/src/lib/auth/auth-options.ts** - NextAuth.js configuration with Google/GitHub OAuth
3. **apps/web/src/lib/fuel-cell-predictions.ts** - AI-powered performance prediction engine
4. **apps/web/src/lib/parameters-data.ts** - Comprehensive MESS parameters library (1500+ params)
5. **apps/web/src/lib/unified-systems-catalog.ts** - Systems catalog with 13 MFC designs
6. **apps/web/src/lib/types/fuel-cell-types.ts** - TypeScript definitions for fuel cell systems
7. **apps/web/src/lib/control-system-simulation.ts** - Control system simulation and PID controllers
8. **apps/web/src/lib/fuel-cell-optimization.ts** - Genetic algorithms and optimization functions
9. **apps/web/src/lib/db.ts** - Database connection utilities and helpers
10. **apps/web/src/lib/citation-verifier.ts** - Citation verification and academic reference system
11. **apps/web/src/lib/zen-browser.ts** - Web scraping integration and data extraction
12. **apps/web/src/lib/database-utils.ts** - Advanced database utilities and query builders

## Project Architecture

### Nx Monorepo Structure
This is a clean architecture foundation using Nx for build orchestration. The project follows a modular monorepo pattern with:

- **Root workspace**: Contains the main Next.js web application in `apps/web/`
- **Shared packages**: Located in `packages/@messai/` namespace
- **Package manager**: PNPM with workspace configuration
- **Build system**: Nx for efficient builds, caching, and dependency management

### Core Packages

#### @messai/core
Business logic and scientific calculations for bioelectrochemical systems:
- Scientific constants and utilities
- Power prediction algorithms
- Material and microbial databases
- Type-safe interfaces with Zod validation
- Location: `packages/@messai/core/`

#### @messai/ui
Shared UI components and design system:
- Basic components (Button, Input, Card)
- Tailwind CSS integration
- Theme utilities
- Accessible design patterns
- Location: `packages/@messai/ui/`

### Technology Stack
- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Package Manager**: PNPM 8+
- **Build Tool**: Nx (with Turborepo migration)
- **Node Version**: 18+

### Scientific Domain
MESSAi specializes in microbial electrochemical systems:
- Microbial Fuel Cells (MFC)
- Microbial Electrolysis Cells (MEC)
- Microbial Desalination Cells (MDC)
- Microbial Electrosynthesis (MES)

## Development Patterns

### Code Quality Standards
- TypeScript strict mode enforced
- React functional components with hooks only
- Test-driven development approach
- ESLint with strict rules, Prettier for formatting

### Package Development
When making changes:
1. **Core logic changes** → `packages/@messai/core`
2. **UI components** → `packages/@messai/ui`
3. **Web application features** → `apps/web`
4. **Cross-cutting concerns** → Shared packages

### Extension Strategy
This clean foundation supports feature-specific worktrees:
- Laboratory tools (3D modeling, simulations)
- Research management (paper database, analysis)
- AI/ML features (advanced predictions, optimization)
- Marketing site (public-facing content)

## API Structure
- **Health Check**: GET `/api/health`
- Current APIs are minimal in this clean architecture foundation
- Follow RESTful conventions for new endpoints

## Deployment
- **Primary**: Vercel (recommended for Next.js apps)
- **Alternative**: Docker for self-hosted deployments
- **Packages**: Can be published to npm registry individually