# MESSAi Architecture Overview

## Table of Contents
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

## System Architecture

MESSAi follows a modern, component-based architecture built on Next.js 14 with the App Router pattern. The application is designed for scalability, maintainability, and optimal performance.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   LCARS UI  │  │ 3D Rendering │  │ Data Viz Charts │   │
│  │ Components  │  │  (Three.js)  │  │   (Chart.js)    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    Pages    │  │  API Routes  │  │   Middleware    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ AI Predict. │  │  Experiment  │  │    Material     │   │
│  │   Engine    │  │   Manager    │  │    Database     │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Prisma ORM  │  │  PostgreSQL  │  │   File Store    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
- **Next.js 14.2.5** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript 5** - Type-safe development

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
- **Prisma 5.6** - Type-safe ORM
- **PostgreSQL** - Primary database (production)
- **SQLite** - Development database

### Testing
- **Vitest 3.2** - Unit testing framework
- **React Testing Library 16.3** - Component testing
- **MSW 2.10** - API mocking

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

### 5. Material Database
Defined in `components/MFCConfigPanel.tsx`

**Structure:**
- 27 materials across 5 categories
- Cost per unit area
- Efficiency ratings
- Conductivity classifications
- Pre-treatment options

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
│   Vercel    │────►│  Next.js App │────►│ PostgreSQL  │
│   CDN       │     │   (Docker)   │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Scalability Considerations
- Horizontal scaling via containerization
- Database connection pooling
- Static asset CDN distribution
- API rate limiting ready

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