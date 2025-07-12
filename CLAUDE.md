# CLAUDE.md - AI Assistant Context for MESSAI

> **Priority**: This file helps AI assistants work effectively on MESSAi. Read the Quick Start first, then reference other sections as needed.


## Project Overview

MESSAI (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial electrochemical systems research, modeling, development, and operation.


## Key Technical Details

### Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme that will be implemented at a later date
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Database**: Prisma ORM (PostgreSQL ready)
- **Testing**: Vitest + React Testing Library

### Project Structure
```
messai/
├── app/                          # Next.js 14 App Router pages and API routes
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication endpoints (NextAuth.js)
│   │   ├── predictions/          # AI prediction engine API
│   │   ├── papers/               # Research database API
│   │   ├── research/           # Enhanced research features
│   │   ├── fuel-cell/            # Fuel cell specific APIs
│   │   └── insights/             # Analytics and insights API
│   ├── (pages)/                  # Page routes
│   │   ├── page.tsx              # Main landing/catalog page
│   │   ├── dashboard/            # User dashboard
│   │   ├── research/           # Research browsing and search
│   │   │   ├── [id]/             # Paper detail view
│   │   │   ├── semantic-search/  # AI-powered search
│   │   │   └── upload/           # Paper upload interface
│   │   ├── models/               # 3D model showcase
│   │   ├── systems/              # System configuration
│   │   ├── platform/             # Platform overview
│   │   ├── tools/                # Specialized tools
│   │   │   ├── bioreactor/       # Bioreactor design tool
│   │   │   └── electroanalytical/# Electroanalytical tool
│   │   ├── experiment/           # Experiment management
│   │   │   └── [id]/             # Individual experiment
│   │   ├── insights/             # Analytics dashboard
│   │   ├── onboarding/           # User onboarding flow
│   │   ├── profile/              # User profile
│   │   ├── settings/             # User settings
│   │   │   ├── account/          # Account settings
│   │   │   ├── preferences/      # User preferences
│   │   │   ├── notifications/    # Notification settings
│   │   │   └── security/         # Security settings
│   │   ├── demo/                 # Demo-specific pages
│   │   ├── marketing/            # Marketing landing
│   │   └── research-dashboard/   # Research overview
│   └── globals.css               # Global styles
│
├── components/                   # React components organized by type
│   ├── 3d/                       # Three.js 3D visualization components
│   │   ├── vanilla-*.tsx         # Pure Three.js implementations
│   │   ├── safe-*.tsx            # Error-boundary wrapped versions
│   │   └── worker-*.tsx          # Web Worker based renderers
│   ├── fuel-cell/                # Fuel cell specific components
│   ├── research/               # Research system components
│   ├── lcars/                    # LCARS UI theme components
│   ├── ui/                       # Generic UI components
│   ├── unified/                  # Unified system components
│   └── *.tsx                     # Core feature components
│
├── lib/                          # Business logic and utilities
│   ├── ai-predictions.ts         # MESS prediction engine
│   ├── fuel-cell-*.ts            # Fuel cell logic
│   ├── auth/                     # Authentication utilities
│   ├── research/               # Research data processing
│   ├── types/                    # TypeScript type definitions
│   ├── demo-mode.ts              # Demo mode configuration
│   └── *.ts                      # Core utilities
│
├── scripts/                      # Development and maintenance scripts
│   ├── research/               # Research system management
│   │   ├── fetch-*.ts            # Paper fetching scripts
│   │   ├── enhance-*.ts          # Enhancement pipelines
│   │   ├── validate-*.ts         # Validation tools
│   │   └── README.md             # Research system docs
│   ├── backup/                   # Database backup utilities
│   ├── zen/                      # Zen browser integration
│   ├── test-*.js                 # Testing scripts
│   └── setup-*.ts                # Setup utilities
│
├── prisma/                       # Database schemas and migrations
│   ├── schema.prisma             # Main Prisma schema
│   ├── schema.*.prisma           # Environment-specific schemas
│   ├── seed.ts                   # Database seeding
│   └── *.db                      # SQLite databases (dev only)
│
├── tests/                        # Test suites organized by type
│   ├── components/               # Component tests
│   ├── api/                      # API endpoint tests
│   ├── integration/              # User workflow tests
│   ├── research/               # Research system tests
│   ├── performance/              # Performance benchmarks
│   └── setup.ts                  # Test configuration
│
├── docs/                         # Project documentation
│   ├── API.md                    # API documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── AUTH_*.md                 # Authentication guides
│   ├── DATABASE_SETUP.md         # Database configuration
│   └── *.md                      # Feature-specific docs
│
├── public/                       # Static assets
│   ├── papers/                   # PDF storage (research)
│   └── test-*.html               # Standalone test pages
│
├── requirements/                 # Feature requirements specs
│   └── YYYY-MM-DD-*/             # Timestamped requirements
│       ├── metadata.json         # Requirement metadata
│       └── *.md                  # Requirement documents
│
├── types/                        # Global TypeScript types
│   └── mess-models.ts            # MESS system type definitions
│
├── backups/                      # Database and system backups
│   └── *.json/.sql               # Timestamped backup files
│
├── hooks/                        # Custom React hooks
│   └── useKeyboardShortcuts.ts   # Keyboard navigation
│
├── deployment/                   # Deployment configurations
│   └── fuel-cell-config.md       # System-specific configs
│
├── reports/                      # Generated analysis reports
│   └── pipeline-report-*.json    # Research pipeline reports
│
├── messai-ai/                    # AI/ML experimentation workspace
│   └── (experimental features)   # Isolated development area
│
├── messai-research/              # Research branch mirror
│   └── (duplicate structure)     # Branch-specific development
│
├── vendor/                       # Third-party dependencies
│   └── (vendored libraries)      # Local copies of dependencies
│
├── packages/                     # Monorepo packages (if applicable)
│   └── (shared packages)         # Shared code between projects
│
├── Configuration Files           # Project configuration
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS config
│   ├── tsconfig.json             # TypeScript config
│   ├── vitest.config.ts          # Test runner config
│   ├── docker-compose.yml        # Docker configuration
│   └── vercel.json               # Deployment config
│
└── Root Files                    # Project root files
    ├── CLAUDE.md                 # This file - AI assistant context
    ├── README.md                 # Project documentation
    ├── README.research.md      # Research system guide
    ├── README.monorepo.md        # Monorepo setup guide
    ├── SECURITY.md               # Security guidelines
    ├── DEPLOYMENT.md             # Deployment instructions
    ├── CHANGELOG.md              # Version history
    ├── LICENSE                   # Project license
    ├── ZEN_SETUP.md              # Zen browser setup
    ├── package.json              # Dependencies and scripts
    ├── middleware.ts             # Next.js middleware
    ├── mess-parameters-json.json # MESS parameter definitions
    └── ultrathinkplan.txt        # Development planning
```

#### Directory Purpose Guide

**Core Application (`app/`)**
- Contains all Next.js pages and API routes
- Follows App Router conventions
- Each subdirectory represents a route or route group

**Components (`components/`)**
- Reusable React components
- Organized by feature area or type
- 3D components have multiple implementations for different use cases

**Business Logic (`lib/`)**
- Core application logic separated from UI
- Prediction engines, data processing, utilities
- Type definitions for TypeScript

**Scripts (`scripts/`)**
- Automation and maintenance tools
- Research system management
- Database operations and testing

**Database (`prisma/`)**
- Prisma ORM schemas and migrations
- Environment-specific configurations
- Seeding scripts for development

**Testing (`tests/`)**
- Comprehensive test coverage
- Organized by test type
- Includes performance benchmarks

**Documentation (`docs/`)**
- Technical documentation
- Architecture decisions
- Setup and deployment guides

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow functional React patterns (hooks)
- Maintain design consistency
- Write tests for new features
- Document scientific assumptions
- Follow Test Driven Development practices

### Important Commands
```bash
npm run dev          # Start dev server on port 3003
npm test            # Run tests
npm run lint        # Check code quality
npm run format      # Format code with Prettier
npm run db:studio   # Open Prisma Studio

# Research system management
npm run research:enhance-all    # Full enhancement pipeline
npm run db:integrity             # Check database integrity
npm run db:validate-links        # Validate external URLs
npm run test:research          # Run research tests
```

### Database Setup for Local Development

The project uses a dual-database approach:
- **Local Development**: SQLite database (`prisma/dev.db`)
- **Production**: PostgreSQL on Prisma Cloud

#### Setting Up Local Development Database

1. **Environment Configuration**:
   - The project automatically uses SQLite in development mode
   - `.env.development.local` overrides database settings for local development
   - Ensure `NODE_ENV=development` when running locally

2. **Generate Prisma Client for SQLite**:
   ```bash
   npm run db:generate:dev
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Database Management Commands**:
   ```bash
   npm run db:studio:dev      # Open Prisma Studio for SQLite
   npm run db:migrate:dev     # Run migrations on SQLite
   npm run db:seed:dev        # Seed SQLite database
   npm run db:reset:dev       # Reset SQLite database
   ```

#### Important Notes:
- The local SQLite database contains 345 research papers for development
- Production deployment automatically uses PostgreSQL without any changes
- Never commit `.env.development.local` as it contains local overrides
- The SQLite schema (`prisma/schema.sqlite.prisma`) is used only for local development

## Scientific Context

### Bioelectrochemical System Designs (13 types)
- **Laboratory**: Benchtop electrochemical bioreactors, benthic fuel cells, micro lab-on-a-chip cells
- **Pilot Scale**: 3D printed, benchtop bioreactor 
- **Industrial**: Wastewater treatment, architectural facade 

### Key Parameters
- **Temperature**: Optimal 25-35°C
- **pH**: Optimal ~7.0
- **Substrate Concentration**: 1-2 g/L typical
- **Power Output**: 5 mW/m² to 50 W/m² depending on design

### Material Categories
1. **Traditional**: Carbon cloth, graphite, stainless steel
2. **Graphene-based**: GO, rGO, aerogel
3. **Carbon Nanotubes**: SWCNT, MWCNT
4. **MXenes**: Ti₃C₂Tₓ, V₂CTₓ (cutting-edge 2D materials)
5. **Upcycled**: Reclaimed electronics with pre-treatments

## AI Prediction Model

The prediction engine (`lib/ai-predictions.ts`) uses:
- Temperature factor (Arrhenius-based)
- pH factor (bell curve around 7.0)
- Substrate factor (Monod kinetics)
- Design-specific multipliers
- Random variation for realism

## Research System Guidelines

### CRITICAL: Data Integrity Rules
- **NEVER generate fake research papers or fabricated scientific data**
- **ONLY work with real, verified papers from legitimate sources**
- **Extrapolation allowed ONLY when explicitly requested and clearly marked**
- **ALL papers must have verification (DOI, PubMed ID, arXiv ID, or verified PDF)**

### Research Database Loading Requirements
Always ensure the research database loads reliably by:

1. **Error Handling**:
   - Wrap all research components with ErrorBoundary
   - Implement retry logic for failed API calls
   - Show meaningful error messages to users
   - Log errors for debugging

2. **Performance Optimization**:
   - Implement pagination (default: 10-20 papers per page)
   - Add loading states for all async operations
   - Cache API responses where appropriate
   - Use database indexes on frequently queried fields

3. **Fallback Strategies**:
   - If main API fails, show cached data if available
   - Provide offline mode with limited functionality
   - Gracefully degrade features rather than crash

4. **Testing Requirements**:
   - Test with empty database
   - Test with large datasets (1000+ papers)
   - Test network failures and timeouts
   - Test authentication state changes

### Data Extraction Standards
When extracting data from papers for predictive models:

1. **Structured Extraction**:
   - System designs and configurations
   - Microbial communities and performance metrics
   - Electroanalytical methods and results
   - Anode/cathode material performance data
   - Maintenance and optimization protocols
   - Operating conditions and their impacts

2. **Quality Assurance**:
   - Verify units and experimental conditions
   - Cross-reference multiple papers for validation
   - Flag contradictory findings for review
   - Track confidence scores for extracted values

3. **Model Integration**:
   - New data must pass quality checks before integration
   - Maintain traceability to source papers
   - Version control for model parameter updates
   - Test predictions against research benchmarks

### Dynamic Knowledge Base
The research system should continuously build upon predictive simulation models by:

1. **Comprehensive Data Extraction**:
   - System designs: geometry, dimensions, flow patterns
   - Microbial communities: species composition, growth conditions
   - Electroanalytical methods: voltammetry, impedance, chronoamperometry
   - Material performance: degradation rates, surface modifications
   - Maintenance protocols: cleaning, regeneration, troubleshooting
   - Operating parameters: startup procedures, optimization strategies

2. **Knowledge Graph Construction**:
   - Link papers to materials, organisms, and performance metrics
   - Track experimental conditions and outcomes
   - Build relationships between different system configurations
   - Identify optimal parameter combinations from research

3. **Predictive Model Enhancement**:
   - Use extracted data to validate and refine predictions
   - Identify parameter ranges from real experiments
   - Incorporate new materials and methods as discovered
   - Generate data-driven recommendations for users

## Common Tasks

## Requirements
1. Always review the requirements we delinated together in 'requirements' directory when implementing
2. Use ultrathink to ensure there are no conflicts and you are not breaking features


### Adding a New System Design
1. Update `app/page.tsx` with design details
2. Add 3D model in `components/DesignSpecific3DModels.tsx`
3. Update prediction multipliers in `lib/ai-predictions.ts`

### Adding Electrode Materials
1. Update `components/MESSConfigPanel.tsx`
2. Add material properties and descriptions
3. Update cost and efficiency ratings

### Modifying Predictions
1. Adjust factors in `lib/ai-predictions.ts`
2. Update API route in `app/api/predictions/route.ts`
3. Add tests for new prediction logic

### Troubleshooting Research Loading Issues
1. Check database connection: `npm run db:studio`
2. Verify API endpoints: `curl http://localhost:3003/api/papers`
3. Check error logs in browser console
4. Run integrity check: `npm run db:integrity`
5. Clear cache and retry
6. Verify authentication state if papers are missing
7. Check pagination settings if results are limited

### Working with Demo Mode
1. **Check current mode**: Look for `getDemoConfig()` usage
2. **Add demo content**: Place in appropriate demo data files
3. **Hide authenticated features**: Add `auth-only-nav` class
4. **External links**: Use production URL from config

### Security Considerations for New Features
1. **Input Validation**: Always validate and sanitize user inputs
2. **Output Encoding**: Use React's built-in XSS protection
3. **Database Queries**: Use Prisma's parameterized queries only
4. **File Operations**: Validate file types and sizes
5. **API Routes**: Check authentication and demo mode

## 🔒 Security & Demo Mode Guidelines

### Demo Mode vs Production
MESSAi operates in two distinct modes with different security requirements:

#### **Demo Mode (Default for Cloned Repos)**
- **Environment**: Set `DEMO_MODE="true"` and `NEXT_PUBLIC_DEMO_MODE="true"`
- **Authentication**: Completely disabled - no local auth forms
- **User Menu**: Shows external links to messai.io for account creation
- **Navigation**: Hides authenticated-only features (My Dashboard, My Experiments)
- **Data**: Uses safe, curated demo content only
- **Purpose**: Showcase platform capabilities without security complexity

#### **Production Mode (messai.io)**
- **Environment**: Set `DEMO_MODE="false"` and configure full auth
- **Authentication**: Full NextAuth.js with database sessions
- **User Menu**: Local login/signup forms
- **Navigation**: Shows personal features when authenticated
- **Data**: Real user data with proper protection
- **Purpose**: Full research platform with user accounts

### Security Best Practices

#### **Environment Variables**
- NEVER commit `.env.local` or any file with real credentials
- Use `.env.example` as template with dummy values
- Production secrets must be set in deployment environment only
- Always check for accidental credential commits before pushing

#### **Authentication Security**
- In demo mode: Remove ALL authentication endpoints
- Use `getDemoConfig()` utility to check mode consistently
- External links must use `target="_blank" rel="noopener noreferrer"`
- Production URLs should come from environment variables

#### **API Route Protection**
```typescript
// Always check demo mode in API routes
import { getDemoConfig } from '@/lib/demo-mode'

export async function POST(request: Request) {
  const demoConfig = getDemoConfig()
  
  if (demoConfig.isDemo) {
    return NextResponse.json({ error: 'Not available in demo mode' }, { status: 403 })
  }
  
  // Production logic here
}
```

#### **Demo Content Guidelines**
- Use realistic but fictional data
- No real researcher names without permission
- No unpublished research data
- Performance metrics should be clearly marked as examples
- Email addresses should use example.com domain

### Implementation Checklist
When implementing features, verify:
- [ ] Demo mode properly disables authentication
- [ ] External links to production are clearly marked
- [ ] No sensitive data in demo content
- [ ] API routes check demo mode
- [ ] Navigation respects authentication state
- [ ] Environment variables are properly separated

## Testing Approach

- **Unit Tests**: Individual functions and components
- **Integration Tests**: User workflows
- **API Tests**: Endpoint validation
- **Performance Tests**: 3D rendering optimization
- **Accessibility Tests**: WCAG compliance
- **Research Tests**: Loading states, error handling, data integrity
- **Security Tests**: Demo mode verification, API protection, input validation

### Security Testing
- **Demo Mode Tests**: Verify auth is properly disabled
- **API Protection Tests**: Ensure routes check authentication
- **Input Validation Tests**: Test against malicious inputs
- **Navigation Tests**: Verify auth-based visibility
- **External Link Tests**: Check proper attributes

## Deployment

### Security Configuration

#### **Development (Demo Mode)**
- Local with SQLite
- Demo mode enabled by default
- No real authentication required
- Safe for public repositories

#### **Production (messai.io)**
- Vercel + PostgreSQL
- Full authentication enabled
- Environment variables in Vercel dashboard
- SSL/TLS required
- Regular security audits

### Pre-Deployment Checklist
- [ ] Remove all console.log with sensitive data
- [ ] Verify demo mode is default in .env.example
- [ ] Check no credentials in codebase
- [ ] Validate all API routes have proper protection
- [ ] Test demo mode functionality
- [ ] Verify external links work correctly

- **Docker**: Full stack available with docker-compose
- **CI/CD**: GitHub Actions configured

## 🏗️ Branch Architecture & Worktree Management

MESSAi uses a sophisticated multi-branch, multi-worktree architecture to support specialized deployments while maintaining a unified codebase.

### Worktree Configuration

**Active Worktrees:**

```bash
# Main Development Worktree
/Users/samfrons/Desktop/Messai           
├── Branch: master (primary)
├── Purpose: Full platform integration
├── Features: All systems, demo mode
└── Status: Active development

# Laboratory Tools Worktree  
/Users/samfrons/Desktop/messai-lab       
├── Branch: messai-lab
├── Purpose: Laboratory-only deployments
├── Features: Bioreactor, electroanalytical, materials
└── Status: Phase 3 development

# Research System Worktree
/Users/samfrons/Desktop/messai-research  
├── Branch: messai-research
├── Purpose: Research/literature system
├── Features: 3,721+ papers, AI insights
└── Status: Enhancement ongoing

# Marketing/Landing Worktree
/Users/samfrons/Desktop/messai-home      
├── Branch: messai-home
├── Purpose: Bio-inspired marketing site
├── Features: Public-facing landing page
└── Status: Design phase
```

### Branch Structure

**Production Branches:**
- `master` - Main production branch with full platform
- `messai-lab` - Laboratory tools only
- `messai-research` - Research and literature system
- `messai-home` - Marketing and landing page

**Development Branches:**
- `research-development` - Active research feature development
- `lab-development` - Laboratory feature development
- `messai-models` - Multi-scale MESS models
- `messai-ai` - AI/ML experimentation

### Deployment Scenarios

1. **Laboratory-Only**: Branch `messai-lab` → lab.messai.io
2. **Research-Only**: Branch `messai-research` → research.messai.io
3. **Combined**: Branch `research-lab` (planned) → platform.messai.io
4. **Full Platform**: Branch `master` → app.messai.io
5. **Demo/Educational**: Branch `master` (demo mode) → demo.messai.io

### Development Workflow

```bash
# Working with worktrees
git worktree list -v              # List all worktrees
git worktree add PATH BRANCH      # Add new worktree
git worktree remove PATH          # Remove worktree

# Feature development flow
cd /Users/samfrons/Desktop/messai-lab
git checkout lab-development
git checkout -b feature/new-bioreactor-model
# ... develop and test ...
git checkout lab-development
git merge feature/new-bioreactor-model
```

### Integration Strategy

**Phase 3 (Current)**: Laboratory Tools - 40% complete
**Phase 4 (Feb-Mar 2025)**: System Integration
**Phase 5 (Mar-Apr 2025)**: Experiment Platform

Integration flow: `messai-lab` → `master` ← `messai-research`

### Important Notes

- Each worktree should be self-contained
- 15 stashes contain important uncommitted work
- Never force push to production branches
- Use descriptive branch names: `feature/`, `fix/`, `enhance/`

For comprehensive branch architecture documentation, see:
- `/docs/BRANCH_ARCHITECTURE.md` - Technical guide
- `/docs/DEPLOYMENT_SCENARIOS.md` - Deployment options
- `/docs/BRANCHES.md` - Branch management guide
- `/docs/INTEGRATION_PLAN.md` - Phase-based integration strategy
- `/docs/WORKTREES.md` - Worktree management guide

## Known Considerations

1. **3D Performance**: May need optimization for older devices
2. **Scientific Accuracy**: All predictions based on published research
3. **Browser Support**: WebGL required for 3D visualization
4. **Mobile Experience**: Responsive but optimized for desktop
5. **Research Loading**: Large datasets may require pagination optimization
6. **API Rate Limits**: External APIs (CrossRef, PubMed) have rate limits
7. **Data Integrity**: Research system must only contain verified research

## Future Enhancements

- Real-time sensor integration
- Collaborative experiments
- Machine learning model improvements
- Mobile native app
- Multi-language support

## Important Files to Review

- `app/page.tsx` - Main design catalog
- `components/MESS3DModel.tsx` - Core 3D visualization
- `lib/ai-predictions.ts` - Prediction logic
- `prisma/schema.prisma` - Database structure
- `app/research/` - Research browsing interface
- `app/api/papers/` - Paper API endpoints
- `scripts/research/` - Enhancement pipeline
- `components/ErrorBoundary.tsx` - Error handling wrapper
- `scripts/research/README.md` - Research system documentation

### Security-Critical Files
- `lib/demo-mode.ts` - Demo mode configuration
- `middleware.ts` - Route protection logic
- `components/ClientLayout.tsx` - Navigation visibility
- `components/UserMenu.tsx` - Authentication UI
- `.env.example` - Safe environment template
- `app/api/*` - All API routes need protection

## Research References

The platform is based on peer-reviewed research:
- Logan, B.E. (2008). Microbial Fuel Cells (comprehensive MFC reference)
- Rozendal, R.A. et al. (2008). Hydrogen Production with MECs
- Wang, H. & Ren, Z.J. (2013). Bioelectrochemical Metal Recovery
- Anasori, B. et al. (2017). 2D Metal Carbides (MXenes)
- Rabaey, K. & Rozendal, R.A. (2010). Microbial Electrosynthesis

## Contact

For scientific questions or collaborations, the platform targets:
- University research labs
- Environmental engineering departments
- Wastewater treatment facilities
- Sustainable architecture firms

## 🤖 AI Assistant Security Guidelines

When working on MESSAi, always:

1. **Assume Demo Mode First**: Default to demo-safe implementations
2. **Protect Credentials**: Never generate real API keys or passwords
3. **Check Before Committing**: Verify no sensitive data in changes
4. **Use Safe Examples**: Demo data should be clearly fictional
5. **Validate Everything**: Input validation is mandatory
6. **Document Security**: Note security implications in comments
7. **Test Both Modes**: Ensure features work in demo and production

### Red Flags to Avoid
- Hardcoded credentials or API keys
- Real email addresses in demo data
- Bypassing authentication checks
- Direct database queries without Prisma
- Missing input validation
- Unprotected API routes
- Local storage of sensitive data

    - MESS Parameters JSON Schema Compliance
      - How to use the 500+ parameters from mess-parameters-json.json
      - Parameter categories (18 major categories, 80 subcategories)
      - Electrode configuration standards (separate anode/cathode parameters)
      - Type safety and validation requirements

    2. Conflict Prevention Between System Types

    - MESS vs Fuel Cell Parameter Mapping
      - How MFCConfig relates to fuel cell parameters
      - Avoiding parameter collisions between systems
      - Proper parameter inheritance and overrides
      - Interface type definitions for different system types

    3. Fuel Cell Systems Standards

    - White Paper Compliance Requirements
      - 700 bar hydrogen storage systems
      - Multi-fidelity modeling approach (high/medium/low)
      - Control system integration (thermal, pressure, humidity, flow)
      - Gas composition management (N2, O2, H2, H2O)
      - Performance metrics and safety thresholds

    4. Implementation Guidelines

    - Parameter Validation Rules
      - Type checking for electrode configurations
      - Range validation for operating conditions
      - Cross-system parameter compatibility checks
      - Error handling for invalid combinations

    5. Code Examples and Best Practices

    - Interface definitions for parameter structures
    - How to extend existing configs without conflicts
    - Validation functions for parameter checking
    - Migration strategies for adding new parameters

    Key Points to Address

    1. Parameter Consistency: Ensure MESS and fuel cell parameters use consistent naming and units
    2. Type Safety: Leverage TypeScript interfaces to prevent configuration errors  
    3. Validation: Add runtime checks for parameter ranges and compatibility
    4. Documentation: Clear examples of proper parameter usage
    5. Conflict Resolution: Guidelines for handling overlapping parameter spaces
    6. Future-Proofing: How to add new system types without breaking existing ones

    Integration with Existing CLAUDE.md

    - Will be added as a new major section after "AI Prediction Model"
    - Cross-references existing sections on system configuration
    - Builds on the requirements directory structure mentioned
    - Aligns with scientific accuracy and testing approach guidelines

## 📚 Research System Architecture & Knowledge Extraction

### Overview
MESSAi uses a sophisticated research collection system to build a queryable knowledge base from scientific papers. This system is developed in the messai-research branch and shared across the platform.

### Branch Structure
- **messai-research branch**: Primary development of research tools
- **Main branch**: Integration point for stable research features

### Database Architecture
The research system uses a dual-database approach:

1. **Research Database (SQLite - research.db)**
   - Location: `/messai-research/prisma/research.db`
   - Content: 6,022+ papers with enhanced extraction
   - Schema: Optimized for knowledge extraction
   - Purpose: Research and development

2. **Production Database (PostgreSQL)**
   - Location: Prisma Cloud
   - Content: 345 verified papers
   - Schema: Production-ready with user associations
   - Purpose: Live platform features

### Enhanced Research Paper Schema
The ResearchPaper model includes comprehensive fields for scientific data extraction:

```typescript
// Core metadata fields
{
  title: string
  authors: string[]         // JSON array
  abstract: string
  doi?: string             // Unique identifiers
  pubmedId?: string
  arxivId?: string
  ieeeId?: string
  
  // Performance extraction
  organismTypes?: string[]  // Microbial species
  anodeMaterials?: string[] // Electrode materials
  cathodeMaterials?: string[]
  powerOutput?: number      // mW/m²
  efficiency?: number       // percentage
  systemType?: string       // MFC, MEC, MDC, MES
  
  // AI-enhanced fields
  aiSummary?: string        // Concise summary
  aiKeyFindings?: string[]  // Key findings
  aiMethodology?: string    // Methods summary
  aiImplications?: string   // Research implications
  aiDataExtraction?: object // Structured data
  aiInsights?: string       // AI analysis
  aiConfidence?: number     // 0-1 confidence score
  
  // Comprehensive parameters
  experimentalConditions?: object  // Temperature, pH, duration
  reactorConfiguration?: object    // Volume, design, dimensions
  electrodeSpecifications?: object // Surface area, modifications
  biologicalParameters?: object    // Inoculum, biofilm age
  performanceMetrics?: object      // Extended metrics
  operationalParameters?: object   // HRT, OLR, resistance
  electrochemicalData?: object     // Impedance, voltammetry
  timeSeriesData?: object          // Performance over time
  economicMetrics?: object         // Cost analysis
  
  // Enhanced categorization
  microbialCommunity?: object      // Species composition
  microbialClassification?: object // Taxonomic data
  systemConfiguration?: object     // Architecture details
  performanceBenchmarks?: object   // Comparative metrics
}
```

### Knowledge Extraction Pipeline
```
Collection → Validation → Extraction → Domain Mapping → Integration
    ↓            ↓           ↓              ↓              ↓
 3 APIs      Quality     Patterns      5 Domains      Knowledge
            Scoring                                     Graph
```

### Extraction Patterns (messai-research)
```typescript
const EXTRACTION_PATTERNS = {
  powerDensity: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2])/gi,
  currentDensity: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/m[²2]|A\/m[²2])/gi,
  voltage: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mV|V)\s+(?:at|@)/gi,
  efficiency: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%\s*(?:coulombic|CE|energy)/gi,
  materials: /(?:anode|cathode).*?(?:carbon|graphite|steel|copper|platinum)/gi,
  organisms: /(?:Geobacter|Shewanella|Pseudomonas|mixed culture|consortium)/gi
}
```

### Core Scripts (messai-research branch)
1. **real-paper-collection.ts**: Multi-source paper collection
   - CrossRef API: DOI-verified papers
   - PubMed API: Biomedical research
   - arXiv API: Preprints
   - 19 targeted search queries
   - Expected yield: ~845 papers per run

2. **paper-quality-validator.ts**: Quality scoring (0-100)
   - Verification score (DOI/PubMed/arXiv presence)
   - Completeness score (metadata fields)
   - Relevance score (keyword matching)
   - Data richness (extracted metrics)
   - Recency factor (publication date)
   - Impact assessment (citations if available)

3. **enhanced-data-extractor.ts**: Pattern-based extraction
   - Performance metrics extraction
   - Material classification
   - Organism identification
   - System configuration detection
   - Confidence scoring per extraction

4. **clean-abstract-html.ts**: Text normalization
   - JATS XML tag removal
   - HTML entity decoding
   - Unicode normalization

### Research Database Statistics
- **Total Papers**: 6,022 (messai-research branch)
- **Verified Papers**: 426 with DOI/PubMed/arXiv IDs
- **Papers with Abstracts**: 5,700+
- **Performance Data**: 1,200+ papers
- **Power Output Data**: 850+ papers
- **Efficiency Data**: 750+ papers
- **Unique Materials**: 127 identified
- **Unique Organisms**: 99 identified

### Real Papers Filtering
The system distinguishes between verified research and AI-enhanced content:

```typescript
const realSources = [
  'crossref_api',
  'crossref_comprehensive',
  'pubmed_api',
  'pubmed_comprehensive',
  'arxiv_api',
  'local_pdf',
  'web_search',
  'comprehensive_search',
  'advanced_electrode_biofacade_search',
  'extensive_electrode_biofacade_collection'
]

// API filtering
const isRealPaper = (paper) => {
  return realSources.includes(paper.source) || 
         paper.doi || 
         paper.arxivId || 
         paper.pubmedId
}
```

### API Structure
```typescript
// Domain-based queries
GET /api/research/domains/anodes?material=carbon_cloth
GET /api/research/domains/cathodes?reaction=oxygen_reduction
GET /api/research/domains/microbes?species=geobacter
GET /api/research/domains/performance?metric=power_density

// Cross-domain insights
GET /api/research/insights/materials-performance
GET /api/research/insights/microbe-compatibility
GET /api/research/insights/optimal-conditions

// Paper filtering
GET /api/papers?realOnly=true&hasPerformanceData=true
GET /api/papers?systemType=MFC&minPowerOutput=1000
```

### Scientific Domains Coverage
1. **Anode Domain**: 2,100+ papers
2. **Cathode Domain**: 1,800+ papers
3. **Microbe Domain**: 1,500+ papers
4. **Environment Domain**: 2,200+ papers
5. **Performance Domain**: 1,200+ papers

### Integration Points
- Research data feeds ML predictions
- Extracted parameters enhance experiment design
- Knowledge graphs guide material selection
- Performance benchmarks validate predictions
- Cross-reference validation ensures data quality



### Research System Workflow
```
messai-research (develop) → master (integrate) → all branches (use)
       ↓                        ↓                      ↓
  New features            Stable features      Shared knowledge
```

### Database Synchronization Strategy
1. **Development**: Use messai-research SQLite for rapid iteration
2. **Integration**: Migrate verified data to PostgreSQL
3. **Production**: Serve from PostgreSQL with caching
4. **Backup**: Regular exports of both databases

### Shared Components
- `/scripts/research/`: Collection and processing scripts
- `/lib/research/`: Core extraction logic
- `/app/api/research/`: API endpoints
- `/app/research/`: UI components

## 🧬 Scientific Domain Data Management

### Domain-Driven Architecture
All scientific data is organized into interconnected domains that map to real-world research areas:

#### 1. Anode Domain (messai-research enhanced)
```typescript
interface AnodeDomain {
  materials: {
    carbonBased: ['carbon cloth', 'graphite felt', 'carbon paper']
    grapheneFamily: ['GO', 'rGO', 'graphene aerogel']
    nanotubes: ['SWCNT', 'MWCNT', 'CNT arrays']
    mxenes: ['Ti₃C₂Tₓ', 'V₂CTₓ', 'Mo₂CTₓ']
    polymers: ['PEDOT', 'polyaniline', 'polypyrrole']
  }
  biofilms: {
    species: string[]
    thickness: number // μm
    coverage: number // %
  }
  modifications: {
    chemical: string[]
    physical: string[]
    biological: string[]
  }
  performance: {
    currentDensity: number // mA/cm²
    chargeTransfer: number // Ω
    biocompatibility: number // 0-10
  }
}
```

#### 2. Cathode Domain
```typescript
interface CathodeDomain {
  materials: {
    metals: ['platinum', 'copper', 'stainless steel', 'nickel']
    carbonBased: ['activated carbon', 'carbon cloth', 'graphite']
    composites: ['Pt/C', 'metal oxides', 'conductive polymers']
  }
  catalysts: {
    precious: ['Pt', 'Pd', 'Ru', 'Ir']
    nonPrecious: ['Fe-N-C', 'Co-N-C', 'MnO₂']
    biological: ['laccase', 'bilirubin oxidase']
  }
  reactions: {
    ORR: 'oxygen reduction'
    HER: 'hydrogen evolution'
    metalRecovery: string[]
    CO2reduction: string[]
  }
  performance: {
    overpotential: number // mV
    exchangeCurrent: number // A/cm²
    durability: number // hours
  }
}
```

#### 3. Performance Metrics Extracted
- **From messai-research**: 1,200+ papers with performance data
- **Power density**: 850+ data points (mW/m²)
- **Current density**: 750+ data points (mA/cm²)
- **Efficiency**: 650+ data points (%)
- **Treatment**: 500+ data points (% removal)

### Data Flow Between Branches
```
messai-research → Extraction → Domain Mapping → Shared Database → All Features
     ↓                ↓             ↓                ↓              ↓
  Papers         Patterns      Categories        PostgreSQL      UI/API
```

## 🔗 Cross-Branch Integration Strategy

### Shared Resources Management
Resources that must be synchronized across branches:

1. **Research Database**
   - Primary: messai-research (6,022 papers)
   - Production: master (345 verified papers)
   - ML Training: messai-ai-clean (uses both)

2. **API Endpoints**
   - `/api/papers/*`: Basic CRUD (all branches)
   - `/api/research/*`: Advanced queries (messai-research)
   - `/api/predictions/*`: ML integration (messai-ai-clean)

3. **Extraction Patterns**
   - Location: `/lib/research/patterns.ts`
   - Shared via: Git subtree or symlinks
   - Updates: Coordinated across branches

### Integration Workflow
1. **Feature Development**: messai-research branch
2. **Testing**: Isolated branch testing
3. **Integration**: Merge to master
4. **Distribution**: Cherry-pick to other branches

### Avoiding Conflicts
- Research system owned by messai-research branch
- Other branches consume via API
- Database migrations coordinated
- Shared types in `/types/research.ts`

## 🛠️ Development Guidelines for Multi-Branch Work

### Before Starting Research Work
1. Check which branch owns the feature:
   - Research collection: messai-research
   - ML predictions: messai-ai-clean
   - Production features: master
   - Marketing: private/

2. Verify database state:
   ```bash
   # Check messai-research database
   cd messai-research && npx prisma studio
   
   # Check main database
   cd .. && npx prisma studio
   ```

3. Coordinate with active agents:
   - Check git status in all worktrees
   - Review recent commits
   - Communication via PR descriptions

### Research System Best Practices
1. **Data Collection**: Only in messai-research branch
2. **API Development**: Test in branch, deploy to master
3. **UI Changes**: Develop in master, backport if needed
4. **Database Changes**: Always migrate both databases

### Shared Configuration
Create `.env.shared` for common settings:
```env
# Shared across all branches
RESEARCH_API_BASE=/api/research
PAPERS_PER_PAGE=10
EXTRACTION_CONFIDENCE_MIN=0.7
```

## 🏗️ Repository Architecture & Multi-Domain Strategy

### Domain Separation
- **app.messai.io**: Open-source scientific platform
- **messai.io**: Commercial marketing site + user platform

### Complete Repository Structure
```
/messai/                        # Public GitHub repository
├── app/                       # Next.js app directory (PUBLIC)
│   ├── page.tsx              # Landing page
│   ├── tools/                # Scientific tools
│   │   ├── bioreactor/      # Bioreactor design
│   │   └── electroanalytical/ # Analysis tools
│   ├── research/             # Research papers browser
│   ├── models/               # MESS models showcase
│   └── api/                  # Public API routes
├── components/                # React components (PUBLIC)
│   ├── 3d/                  # Three.js visualizations
│   ├── ui/                  # UI components
│   └── charts/              # Data visualizations
├── lib/                      # Core libraries (PUBLIC)
│   ├── domains/             # Scientific domains
│   ├── ai-predictions.ts    # Basic ML
│   └── db.ts                # Database utilities
├── prisma/                   # Database schema
│   ├── schema.prisma        # Main schema
│   └── migrations/          # Version history
├── public/                   # Static assets
├── scripts/                  # Utility scripts
│   └── research/            # Paper processing
├── tests/                    # Test suites
├── docs/                     # Documentation
├── shared/                   # Shared between domains
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Common utilities
│   └── constants/           # Shared constants
├── private/                  # PRIVATE (not on GitHub)
│   ├── app/                 # Marketing site
│   ├── auth/                # Authentication
│   ├── components/          # Private UI
│   └── package.json         # Separate deps
├── messai-ai/               # AI worktree (branch: messai-ai-clean)
│   ├── lib/                 # Advanced ML
│   ├── components/          # AI visualizations
│   └── api/                 # ML endpoints
└── messai-research/         # Research worktree (branch: messai-research)
    ├── prisma/              # Research database
    ├── scripts/             # Collection tools
    └── lib/                 # Extraction logic
```

### Import Rules
1. Public → Public: ✅ Allowed
2. Public → Shared: ✅ Allowed
3. Private → Public: ✅ Allowed
4. Private → Shared: ✅ Allowed
5. Public → Private: ❌ Forbidden
6. Shared → Private: ❌ Forbidden

## 🧪 Experiment Management System

### Experiment Lifecycle
MESSAi supports complete experiment tracking from design to analysis:

#### Database Schema
```typescript
// Core experiment model (see prisma/schema.prisma)
model Experiment {
  id           String            @id @default(cuid())
  name         String
  userId       String            // Links to User (private platform only)
  designId     String            // Links to MFCDesign
  status       String            @default("SETUP") // SETUP, RUNNING, COMPLETED, FAILED
  parameters   String            // JSON configuration
  isPublic     Boolean           @default(false)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  
  // Relations
  design       MFCDesign         @relation(...)
  measurements Measurement[]      // Time-series data
  papers       ExperimentPaper[] // Research references
}

model Measurement {
  id           String     @id @default(cuid())
  experimentId String
  voltage      Float      // V
  current      Float      // mA
  power        Float      // mW
  temperature  Float      // °C
  ph           Float
  substrate    Float?     // g/L
  notes        String?
  timestamp    DateTime   @default(now())
}
```

#### Experiment States
1. **SETUP**: Configuration and preparation
   - Select system design
   - Configure materials
   - Set operating parameters
   - Link reference papers

2. **RUNNING**: Active data collection
   - Real-time measurements
   - Automated data logging
   - Alert thresholds
   - Performance tracking

3. **COMPLETED**: Analysis phase
   - Performance summaries
   - Comparison with predictions
   - Export capabilities
   - Report generation

4. **FAILED**: Troubleshooting
   - Failure analysis
   - Parameter logs
   - Recommendations

### Data Collection & Analysis

#### Real-time Monitoring
```typescript
// Measurement collection API
POST /api/experiments/{id}/measurements
{
  voltage: 0.65,
  current: 12.5,
  temperature: 30.2,
  ph: 7.1,
  timestamp: "2025-01-08T10:30:00Z"
}
```

#### Analysis Features
- Time-series visualization
- Performance metrics calculation
- Comparison with research benchmarks
- AI-powered optimization suggestions
- Export to CSV/JSON

### Integration Points

#### 1. Research System
- Link papers to experiments
- Compare with published results
- Extract best practices
- Validate performance

#### 2. Prediction Engine
- Pre-experiment predictions
- Real-time comparison
- Parameter optimization
- Anomaly detection

#### 3. 3D Visualization
- System configuration display
- Real-time data overlay
- Performance heatmaps
- Component highlighting

### Experiment Sharing

#### Public Platform (app.messai.io)
- Demo experiments only
- Educational datasets
- No user accounts required
- Read-only access

#### Private Platform (messai.io)
- Personal experiment library
- Collaboration features
- Private/public toggle
- Team workspaces

Remember: MESSAI is open source but we have the secure separation for our marketing site and freemium software platform. 

---

*This file helps AI assistants understand the project context, make appropriate decisions, and maintain consistency with the scientific and technical requirements of MESSAi.*