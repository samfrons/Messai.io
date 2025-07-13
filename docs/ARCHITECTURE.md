# MESSAi Architecture Overview

## Table of Contents
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

## System Architecture

MESSAi follows a modern, component-based architecture built on Next.js 15 with the App Router pattern and Nx monorepo management. The application is designed for scalability, maintainability, and optimal performance with comprehensive library support.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18.3.1)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   LCARS UI  │  │ 3D Rendering │  │ Data Viz Charts │   │
│  │ Components  │  │  (Three.js)  │  │   (Chart.js)    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│               Next.js 15 App Router + Nx Monorepo            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Pages/App  │  │  API Routes  │  │   Middleware    │   │
│  │   Router    │  │              │  │                 │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Layer (12 Libraries)             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ AI Predict. │  │  Experiment  │  │    Material     │   │
│  │   Engine    │  │   Manager    │  │    Database     │   │
│  │             │  │              │  │                 │   │
│  │ Optimization│  │ Citation     │  │ Control System  │   │
│  │ Algorithms  │  │ Verification │  │   Simulation    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Prisma ORM  │  │  PostgreSQL  │  │   File Store    │   │
│  │   6.11.1    │  │              │  │                 │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router (updated 2025-07-13)
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5.8.2** - Type-safe development with strict mode

### Build System & Package Management
- **Nx 21.2.3** - Monorepo build orchestration and project management
- **PNPM 8.15.0** - Package manager with workspace support
- **Vite 6.0.0** - Build tool and development server

### UI & Styling
- **Tailwind CSS 3.3** - Utility-first CSS with custom LCARS theme
- **Framer Motion 12** - Animation library
- **Lucide React** - Icon library

### 3D Visualization
- **Three.js 0.177** - WebGL 3D graphics
- **React Three Fiber 8.18** - React renderer for Three.js
- **@react-three/drei 9.122** - Helper components

### Data Visualization
- **Chart.js 4.5** - Canvas-based charts
- **Recharts 2.8** - React-based charts

### State Management
- **Zustand 5.0** - Lightweight state management
- **React Context** - Component-level state

### Database & ORM
- **Prisma 6.11.1** - Type-safe ORM (updated)
- **PostgreSQL** - Primary database (production)
- **SQLite** - Development database

### Testing (Vitest Only - Jest Removed)
- **Vitest 3.0.0** - Unit testing framework (Jest completely removed)
- **@vitest/ui 3.0.0** - Testing UI interface
- **@vitest/coverage-v8 3.0.5** - Coverage reporting
- **React Testing Library 16.1.0** - Component testing
- **Playwright 1.40.0** - End-to-end testing

## Core Components

### 1. Design Catalog System
Located in `app/page.tsx`, this is the main entry point showcasing all MFC designs.

**Key Features:**
- 13 pre-configured MFC designs
- Categorization by scale (lab, pilot, industrial)
- Real-time 3D preview
- Cost and performance metrics

### 2. 3D Visualization Engine
Core component: `components/MFC3DModel.tsx`

**Architecture:**
```typescript
// Simplified structure
interface MFC3DModelProps {
  design: MFCDesign;
  interactive: boolean;
  showLabels: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
}
```

**Rendering Pipeline:**
1. Design selection triggers model generation
2. Geometry creation based on design specs
3. Material application with PBR properties
4. Post-processing effects (bloom, shadows)
5. Interactive controls via OrbitControls

### 3. AI Prediction Engine
Located in `lib/ai-predictions.ts` and `app/api/predictions/route.ts`

**Prediction Algorithm:**
```typescript
// Simplified algorithm
predictedPower = basePower * 
  temperatureFactor * 
  phFactor * 
  substrateFactor * 
  designMultiplier + 
  randomVariation
```

**Factors Considered:**
- Temperature (optimal: 25-35°C)
- pH levels (optimal: ~7.0)
- Substrate concentration
- Design-specific multipliers
- Material efficiency ratings

### 4. Experiment Management
Core components:
- `app/experiment/[id]/page.tsx` - Individual experiment view
- `app/dashboard/page.tsx` - Experiment overview
- `components/ExperimentChart.tsx` - Data visualization

**Data Flow:**
1. User creates experiment with parameters
2. System generates predictions
3. Real-time monitoring and updates
4. Data export capabilities

### 5. Comprehensive Library System (12 Libraries)
**Location**: `apps/web/src/lib/`

**Core Libraries:**
- `demo-mode.ts` - Demo utilities and state management
- `db.ts` - Database connection and utilities
- `database-utils.ts` - Advanced database operations

**Scientific Computing:**
- `fuel-cell-predictions.ts` - AI-powered performance prediction
- `parameters-data.ts` - 1500+ MESS parameters library
- `unified-systems-catalog.ts` - 13 MFC design catalog
- `control-system-simulation.ts` - PID controllers and simulation
- `fuel-cell-optimization.ts` - Genetic algorithms and optimization

**Research & Academic:**
- `citation-verifier.ts` - DOI validation and CrossRef integration
- `zen-browser.ts` - Web scraping and data extraction

**Authentication & Types:**
- `auth/auth-options.ts` - NextAuth.js with Google/GitHub OAuth
- `types/fuel-cell-types.ts` - Comprehensive TypeScript definitions

## Data Flow

### Request Lifecycle

```
User Action → Next.js Route → API Handler → Business Logic → Database
     ↑                                                           ↓
     └───────────── Response with UI Update ←───────────────────┘
```

### State Management Pattern

```typescript
// Zustand store example
interface MFCStore {
  selectedDesign: MFCDesign | null;
  parameters: ExperimentParameters;
  predictions: PredictionResult | null;
  
  // Actions
  selectDesign: (design: MFCDesign) => void;
  updateParameters: (params: Partial<ExperimentParameters>) => void;
  fetchPredictions: () => Promise<void>;
}
```

## Security Architecture

### Authentication & Authorization
- Session-based authentication (ready for NextAuth integration)
- Role-based access control (RBAC) structure in Prisma schema
- API route protection middleware

### Data Security
- Input validation on all forms
- Parameterized database queries via Prisma
- Environment variable protection
- CORS configuration for API routes

### Best Practices
- No hardcoded secrets
- Secure headers via Next.js config
- Content Security Policy (CSP) ready
- XSS protection through React's built-in escaping

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**
   - Automatic with Next.js App Router
   - Dynamic imports for heavy components
   - Lazy loading of 3D models

2. **3D Rendering Optimization**
   - LOD (Level of Detail) system
   - Frustum culling
   - Instanced rendering for repeated geometries
   - Performance mode selection

3. **Data Fetching**
   - Server Components for initial data
   - Client-side caching with SWR patterns
   - Optimistic UI updates

4. **Asset Optimization**
   - Image optimization via Next.js Image
   - Font subsetting
   - CSS purging with Tailwind

### Monitoring & Metrics
- Web Vitals tracking
- Custom performance marks
- Error boundary implementation
- Analytics integration ready

## Deployment Architecture

### Production Setup
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────►│  Next.js 15  │────►│ PostgreSQL  │
│   CDN       │     │ + Nx Monorepo │     │  Database   │
│             │     │   (Docker)   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Scalability Considerations
- Horizontal scaling via containerization
- Database connection pooling
- Static asset CDN distribution
- API rate limiting ready

## Recent Architecture Improvements (2025-07-13)

### Build System Modernization
- ✅ **Complete Jest Removal**: Migrated to Vitest exclusively for all testing
- ✅ **Nx Monorepo Integration**: Full monorepo orchestration with PNPM workspaces
- ✅ **Next.js 15 Upgrade**: Latest framework version with optimized transpilation
- ✅ **TypeScript Path Mapping**: Comprehensive module resolution for all @/ imports
- ✅ **ESLint Simplification**: Streamlined configuration for monorepo compatibility

### Library System Implementation
- ✅ **12 Comprehensive Libraries**: Full-featured implementations covering all platform needs
- ✅ **Type Safety**: Complete TypeScript definitions for fuel cell systems
- ✅ **Scientific Computing**: AI predictions, optimization algorithms, control systems
- ✅ **Research Integration**: Citation verification, web scraping, academic tools
- ✅ **Database Utilities**: Advanced query builders and connection management

### Configuration Standardization
- ✅ **Port Configuration**: Standardized on port 3001 for development
- ✅ **Environment Management**: Secure environment variable handling with validation
- ✅ **Authentication Setup**: NextAuth.js with Google/GitHub OAuth integration
- ✅ **Testing Infrastructure**: Vitest + Playwright for comprehensive test coverage

## Future Architecture Enhancements

1. **Microservices Migration**
   - Separate AI prediction service
   - Independent 3D rendering service
   - Dedicated data processing pipeline

2. **Real-time Features**
   - WebSocket integration for live updates
   - Collaborative experiment tracking
   - Real-time sensor data ingestion

3. **Machine Learning Pipeline**
   - Model training infrastructure
   - A/B testing for predictions
   - User behavior analytics

4. **Enhanced Security**
   - OAuth2/OIDC integration
   - Multi-factor authentication
   - Audit logging system