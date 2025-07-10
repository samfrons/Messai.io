# CLAUDE.md - AI Assistant Context for MESSAi

This file provides context and instructions for AI assistants (like Claude) working on the MESSAi project.

## Project Overview

MESSAi (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial electrochemical systems research. It supports various bioelectrochemical technologies including:
- Microbial Fuel Cells (MFCs) - electricity generation
- Microbial Electrolysis Cells (MECs) - hydrogen production
- Microbial Desalination Cells (MDCs) - water treatment
- Microbial Electrosynthesis (MES) - chemical production
- Other bioelectrochemical systems

The platform combines:
- Interactive 3D visualization using Three.js
- AI-powered predictions for system optimization
- Comprehensive experiment tracking
- Scientific material database with 27 electrode options, differentiating between anode and cathode
- Clean UI theme
- Advanced research collection and analysis system with 3,721 verified research papers
- AI-powered data extraction and categorization system
- Advanced filtering and search capabilities

## Key Technical Details

### Architecture
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme that will be implemented at a later date
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Database**: Prisma ORM (SQLite dev, PostgreSQL prod)
- **Testing**: Vitest + React Testing Library

## Branch Architecture

MESSAi uses a comprehensive branch structure to support different deployment scenarios:

### **Production Branches**
- **master** - Stable production base (currently messai-ai branch)
- **messai-lab** - Lab tools only (clean, focused) → *worktree at `/Users/samfrons/Desktop/messai-lab`*
- **messai-research** - Research system only → *worktree at `/Users/samfrons/Desktop/messai-research`*
- **research-lab** - Research + lab tools combined
- **experiments** - Experiment management platform
- **full-platform** - All features combined (research + lab + experiments)

### **Development Branches**
- **research-development** - Research feature development
- **lab-development** - Lab feature development
- **experiments-development** - Experiment feature development

### **Combined Branches**
- **lab-experiments** - Lab tools + experiments
- **research-experiments** - Research + experiments

### **Deployment Options**
1. **Lab-only**: Use `messai-lab` for pure laboratory tools
2. **Research-only**: Use `messai-research` for literature and AI features
3. **Research + Lab**: Use `research-lab` for academic institutions
4. **Full Platform**: Use `full-platform` for complete MESSAi experience

### **Development Workflow**
1. **Feature Development**: Work on dedicated `*-development` branches
2. **Integration**: Merge development branches to production branches
3. **Deployment**: Deploy production branches to appropriate environments

### Current Project Structure
```
messai/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # API endpoints for all features
│   ├── research/       # Research papers browsing interface
│   ├── tools/          # Specialized tools
│   │   ├── bioreactor/        # Bioreactor design tool
│   │   └── electroanalytical/ # Electroanalytical tool
│   ├── dashboard/      # User dashboard
│   ├── experiment/     # Experiment tracking
│   └── [pages]/        # Other application pages
├── components/          # React components
│   ├── 3d/            # Three.js visualization components
│   │   ├── bioreactor/        # Bioreactor 3D components
│   │   └── electroanalytical/ # Electroanalytical visualizations
│   ├── research/       # Research system components
│   ├── fuel-cell/     # Fuel cell specific components
│   ├── ui/            # Generic UI components
│   └── unified/       # Unified system components
├── lib/                # Business logic and utilities
│   ├── ai-predictions.ts     # Prediction algorithms
│   ├── database-utils.ts     # Database compatibility
│   ├── auth/                 # Authentication utilities
│   └── types/               # TypeScript type definitions
├── scripts/            # Development and maintenance scripts
│   ├── research/       # Research system management
│   ├── backup/        # Database backup utilities
│   └── zen/           # Zen browser integration
├── prisma/             # Database schemas and migrations
│   ├── schema.prisma        # Main schema
│   └── seed.ts             # Database seeding
├── tests/              # Test suites
│   ├── components/    # Component tests
│   ├── api/          # API tests
│   └── integration/  # Integration tests
├── docs/              # Project documentation
├── public/            # Static assets
│   └── papers/       # PDF storage
└── requirements/      # Feature requirements specs
```

### Future Monorepo Architecture
For the planned monorepo architecture and domain-driven design structure, see `ARCHITECTURE_VISION.md`.

### Layout System
The application uses **ConditionalLayout** to provide:
- **Landing page**: Full-width display for homepage (`/`)
- **Application pages**: Sidebar navigation for all other routes
- **Responsive design**: Mobile-friendly navigation
- **Authentication context**: Shows/hides auth-specific features

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
npm run literature:enhance-all   # Full enhancement pipeline
npm run db:integrity             # Check database integrity
npm run db:validate-links        # Validate external URLs
npm run test:research            # Run research tests
```

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

## Research System & Tools

### Data Integrity
- **ONLY real, verified papers** with DOI/PubMed/arXiv verification
- **3,721 papers** currently in database with AI-powered extraction
- **NEVER fabricate** scientific data - extrapolation only when explicitly requested

### Detailed Documentation
- **Research System**: See `docs/RESEARCH_SYSTEM.md` for full guidelines
- **Tools Documentation**: See `docs/TOOLS_DOCUMENTATION.md` for bioreactor and electroanalytical tools
- **Development Tasks**: See `docs/DEVELOPMENT_TASKS.md` for common operations

## Testing Approach

- **Unit Tests**: Individual functions and components
- **Integration Tests**: User workflows
- **API Tests**: Endpoint validation
- **Performance Tests**: 3D rendering optimization
- **Accessibility Tests**: WCAG compliance
- **Research Tests**: Loading states, error handling, data integrity

## Deployment

- **Development**: Local with SQLite and ConditionalLayout
- **Production**: Vercel + PostgreSQL
- **Docker**: Full stack available with docker-compose
- **CI/CD**: GitHub Actions configured

## Known Considerations

1. **3D Performance**: May need optimization for older devices
2. **Scientific Accuracy**: All predictions based on published research
3. **Browser Support**: WebGL required for 3D visualization
4. **Mobile Experience**: Responsive but optimized for desktop
5. **Research Loading**: Large datasets may require pagination optimization
6. **API Rate Limits**: External APIs (CrossRef, PubMed) have rate limits
7. **Data Integrity**: Research system must only contain verified research

## Database Configuration

### Development (Local SQLite)
- **Database**: `file:/Users/samfrons/Desktop/Messai/prisma/dev.db`
- **Schema**: `prisma/schema.sqlite.prisma` 
- **Usage**: Automatic detection via `NODE_ENV=development`

### Production (PostgreSQL + Prisma Accelerate)
- **Database**: PostgreSQL with connection pooling
- **Schema**: `prisma/schema.prisma`
- **Usage**: Requires `DATABASE_URL` and optional `PRISMA_ACCELERATE_URL`

### Commands
```bash
# Local development
npm run dev              # Uses SQLite automatically
npm run db:studio:dev    # Prisma Studio for SQLite

# Production
npm run build            # Uses PostgreSQL
npm run db:studio        # Prisma Studio for PostgreSQL
```

## Important Files to Review

- `app/page.tsx` - Main design catalog
- `components/MFC3DModel.tsx` - Core 3D visualization
- `components/ConditionalLayout.tsx` - Layout system
- `lib/ai-predictions.ts` - Prediction logic
- `prisma/schema.prisma` - Database structure
- `app/research/` - Research browsing interface
- `app/tools/bioreactor/` - Bioreactor design tool
- `app/tools/electroanalytical/` - Electroanalytical tool
- `app/api/papers/` - Paper API endpoints
- `scripts/literature/` - Literature enhancement pipeline
- `components/ErrorBoundary.tsx` - Error handling wrapper

## Future Enhancements

- Real-time sensor integration
- Collaborative experiments
- Machine learning model improvements
- Mobile native app
- Multi-language support

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

---

*This file helps AI assistants understand the project context, make appropriate decisions, and maintain consistency with the scientific and technical requirements of MESSAi.*