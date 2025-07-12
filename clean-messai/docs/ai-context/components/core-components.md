# Core Components Documentation (clean-messai)

## Overview
The clean-messai branch contains the minimal, essential components that form the foundation for all other MESSAi features. This serves as the base platform from which feature-specific worktrees extend.

## Architecture Principles

### Minimal Core Philosophy
- Only essential features included in base
- Maximum extensibility for feature worktrees
- Clean separation of concerns
- No feature-specific business logic

### Component Organization
```
clean-messai/
├── app/                     # Next.js 14 App Router (minimal)
│   ├── api/                 # Core API endpoints only
│   │   ├── health/          # System health check
│   │   └── auth/            # Authentication stubs
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # Core UI components
│   ├── ui/                  # Base design system
│   │   ├── Button.tsx       # Base button component
│   │   ├── Input.tsx        # Base input component
│   │   ├── Layout.tsx       # Page layout wrapper
│   │   └── ErrorBoundary.tsx # Error handling
│   └── providers/           # Context providers
├── lib/                     # Core utilities
│   ├── db.ts                # Database client
│   ├── auth.ts              # Auth utilities
│   ├── utils.ts             # Common utilities
│   └── types.ts             # Shared types
├── packages/                # Monorepo core packages
│   └── @messai/core/        # Business logic foundation
└── prisma/                  # Database schema (minimal)
```

## Core Components

### 1. Authentication System
**Location**: `lib/auth.ts`, `app/api/auth/`
**Purpose**: Foundation for user management
**Features**:
- NextAuth.js configuration
- JWT token handling
- Session management
- Demo mode support

**Dependencies**: NextAuth.js, Prisma
**Integration Points**: All feature worktrees

### 2. Database Layer
**Location**: `lib/db.ts`, `prisma/`
**Purpose**: Data persistence foundation
**Features**:
- Prisma client configuration
- Connection pooling
- Environment-based database switching
- Migration support

**Dependencies**: Prisma, PostgreSQL/SQLite
**Integration Points**: All data-dependent features

### 3. API Foundation
**Location**: `app/api/`
**Purpose**: RESTful API infrastructure
**Features**:
- Health monitoring
- Error handling
- Request validation
- Response formatting

**Dependencies**: Next.js API routes, Zod
**Integration Points**: All backend functionality

### 4. UI Foundation
**Location**: `components/ui/`
**Purpose**: Base design system
**Features**:
- Consistent styling
- Accessibility support
- Responsive design
- Error boundaries

**Dependencies**: React, Tailwind CSS
**Integration Points**: All UI components

### 5. Layout System
**Location**: `app/layout.tsx`, `components/ui/Layout.tsx`
**Purpose**: Page structure and navigation
**Features**:
- Responsive navigation
- Authentication-aware UI
- Demo mode indicators
- Error handling

**Dependencies**: React, Next.js
**Integration Points**: All pages and routes

## Package Architecture

### @messai/core Package
**Location**: `packages/@messai/core/`
**Purpose**: Shared business logic
**Contents**:
```typescript
// Core types and interfaces
export interface MESSSSystem {
  id: string
  name: string
  type: 'MFC' | 'MEC' | 'MDC' | 'MES'
}

// Core utilities
export const formatCurrency = (amount: number) => { /* ... */ }
export const validateEmail = (email: string) => { /* ... */ }

// Scientific constants
export const SCIENTIFIC_CONSTANTS = {
  FARADAY_CONSTANT: 96485, // C/mol
  GAS_CONSTANT: 8.314,     // J/(mol·K)
  STANDARD_TEMP: 298.15    // K
}
```

**Dependencies**: None (framework-agnostic)
**Integration Points**: All feature packages

## Configuration Management

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Demo Mode
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false

# External Services (stubs)
OPENAI_API_KEY=stub
ANTHROPIC_API_KEY=stub
```

### Build Configuration
**Location**: `next.config.js`
**Features**:
- TypeScript strict mode
- Environment variable validation
- Build optimization
- Static asset handling

## Testing Infrastructure

### Test Categories
1. **Unit Tests**: Core utilities and functions
2. **Integration Tests**: API endpoints
3. **Component Tests**: UI components
4. **E2E Tests**: Critical user flows

### Test Configuration
**Location**: `vitest.config.ts`
**Features**:
- TypeScript support
- React Testing Library
- Mock service workers
- Coverage reporting

## Performance Considerations

### Bundle Size
- Target: <100KB initial bundle
- Tree shaking enabled
- Dynamic imports for optional features
- CDN for external dependencies

### Runtime Performance
- Server-side rendering for initial load
- Client-side hydration
- Optimistic updates
- Error boundaries prevent crashes

## Security Architecture

### Authentication
- JWT-based sessions
- Secure cookie handling
- CSRF protection
- Rate limiting ready

### Data Protection
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (React defaults)
- Environment variable security

## Integration Patterns

### Feature Worktree Integration
```typescript
// How feature worktrees extend core
import { MESSSSystem } from '@messai/core'
import { DatabaseClient } from '@messai/core/db'

// Feature-specific extension
interface LabSystem extends MESSSSystem {
  bioreactorConfig: BioreactorConfig
  sensors: SensorArray
}
```

### API Extension Pattern
```typescript
// Core API structure
/api/v1/core/health     // Health check
/api/v1/core/auth       // Authentication

// Feature extensions
/api/v1/lab/bioreactor  // Lab-specific
/api/v1/research/papers // Research-specific
/api/v1/ai/predictions  // AI-specific
```

## Development Workflow

### Local Development
```bash
cd clean-messai
npm install
npm run dev  # Port 3000
```

### Feature Development
1. Clone from clean-messai base
2. Add feature-specific packages
3. Extend core APIs
4. Test integration points

### Testing Strategy
```bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

## Monitoring and Observability

### Health Checks
**Endpoint**: `/api/health`
**Metrics**: Database connectivity, memory usage, response time

### Error Tracking
- React Error Boundaries
- API error logging
- Performance monitoring
- User feedback collection

## Future Extensibility

### Planned Extensions
1. **Real-time Features**: WebSocket infrastructure
2. **File Uploads**: Secure file handling
3. **Notifications**: Push notification system
4. **Analytics**: Usage tracking

### Extension Points
- Plugin system for features
- Event-driven architecture
- Microservice readiness
- API versioning support

---

*This documentation should be referenced when working on the core platform or when extending functionality in feature worktrees.*