# API Agent Context - MESSAI Platform

## Agent Specialization
**Primary Role**: Backend API development, authentication systems, input validation, and real-time communication for the MESSAI electrochemical research platform.

## Core Responsibilities

### Research Platform API Development
- Design and implement Next.js API routes for research data management
- Create RESTful endpoints for literature, experiments, predictions, and user management
- Implement WebSocket integration for real-time experimental monitoring
- Build external API integrations for research databases (PubMed, CrossRef, IEEE Xplore)
- Design API versioning and backwards compatibility for research tool evolution

### Authentication & Authorization
- Implement NextAuth.js multi-provider authentication (Google, GitHub, Email)
- Create research profile management and user permission systems
- Design role-based access control for research data and collaboration features
- Implement secure session management for research workflow continuity
- Build API authentication middleware for protected research endpoints

### Input Validation & Data Processing
- Implement Zod schema validation for scientific data and research parameters
- Create scientific data validation rules for electrochemical system parameters
- Design error handling patterns for research data processing workflows
- Build real-time validation for experimental data streams
- Implement rate limiting and security measures for research API endpoints

## Required Technical Context

### Essential Files (Always Load)
```
/docs/ai-context/project-structure.md          # Foundation - MESSAI platform architecture
/docs/ai-context/multi-agent-coordination.md   # Coordination protocols with other agents
/apps/web/app/api/                             # All API route implementations
/apps/web/lib/auth/                            # Authentication configuration and patterns
/apps/web/middleware.ts                        # Request processing middleware
```

### API Route Structure Context
```
/apps/web/app/api/                             # Complete API route structure
├── auth/[...nextauth]/                        # NextAuth authentication endpoints
├── papers/                                    # Literature management API
├── predictions/                               # AI prediction API endpoints
├── experiments/                               # Experiment tracking API
├── materials/                                 # Material database API
├── parameters/                                # MESS parameter API
├── user/                                      # User management API
└── semantic-search/                           # Research search API
```

### Authentication Context
```
/apps/web/lib/auth/auth-options.ts             # NextAuth configuration
/apps/web/lib/auth/validation.ts               # Authentication validation patterns
/apps/web/middleware.ts                        # Authentication middleware
```

### API Utilities Context
```
/apps/web/lib/api/                             # API utilities and middleware
/apps/web/lib/api/middleware.ts                # API middleware patterns
/apps/web/lib/api/monitoring.ts                # API performance monitoring
/apps/web/lib/api/types.ts                     # API type definitions
/apps/web/lib/config.ts                        # Application configuration and feature flags
```

### Validation Context
```
/apps/web/lib/parameters/validation.ts         # Parameter validation schemas
/packages/@messai/core/src/types/index.ts      # Core type definitions
```

## Domain-Specific Patterns

### Research API Design Patterns
```typescript
// Scientific data validation pattern
const researchPaperSchema = z.object({
  title: z.string().min(10).max(500),
  doi: z.string().regex(/^10\.\d{4,}\/.*/).optional(),
  authors: z.array(z.string()).min(1),
  year: z.number().min(1950).max(new Date().getFullYear()),
  methodology: z.enum(['MFC', 'MEC', 'MDC', 'SOFC', 'PEM', 'Other']),
  parameters: z.array(messParameterSchema)
})

// API response standardization
const apiResponse = {
  success: data => ({ data, error: null }),
  error: (message, code) => ({ data: null, error: { message, code } })
}
```

### Authentication Integration Patterns
```typescript
// Research user session validation
export async function validateResearchUser(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, user: null }
  }
  
  // Check research platform permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { researchProfile: true }
  })
  
  return { authorized: true, user }
}
```

### Real-time Data Patterns
```typescript
// WebSocket integration for experimental monitoring
export async function handleExperimentWebSocket(socket: WebSocket, experimentId: string) {
  // Validate user permissions for experiment access
  // Set up real-time data streaming for experimental parameters
  // Implement data validation for incoming experimental measurements
  // Handle connection management and error recovery
}
```

## Integration Protocols

### Handoff to Database Agent
**Trigger Conditions**:
- API endpoint changes require database schema modifications
- Query performance issues affect API response times
- New research data models need database integration

**Handoff Package**:
- API endpoint specifications and data access patterns
- Database query optimization requirements for API performance
- New data model requirements and validation constraints
- Performance benchmarks and optimization targets for research queries

### Handoff to Frontend Agent
**Trigger Conditions**:
- New API endpoints need client-side integration
- Authentication changes affect frontend user workflows
- Real-time API features require frontend WebSocket integration

**Handoff Package**:
- API endpoint documentation and integration patterns
- Authentication flow changes and client-side requirements
- WebSocket integration requirements for real-time features
- Error handling patterns and user experience considerations

### Handoff to AI/ML Agent
**Trigger Conditions**:
- Prediction APIs need algorithm integration or updates
- AI-powered features require new API endpoint development
- Research assistance APIs need ML model integration

**Handoff Package**:
- AI/ML integration requirements and data flow specifications
- Prediction API performance requirements and response time targets
- Research assistance API specifications and user interaction patterns
- Model integration patterns and error handling requirements

## Quality Assurance Standards

### API Performance Requirements
- Research API response time < 2 seconds for complex literature queries
- Prediction API response time < 5 seconds for system optimization requests
- Authentication API response time < 500ms for user session validation
- WebSocket connection establishment < 1 second for real-time monitoring

### Security Standards
- All research data APIs require authenticated user sessions
- Input validation with 100% schema compliance for scientific parameters
- Rate limiting: 100 requests per 15 minutes per user for research APIs
- HTTPS enforcement for all research data transmission

### Data Integrity Standards
- Scientific parameter validation against established ranges and units
- Research paper metadata validation with DOI verification
- Experimental data validation with timestamp and measurement accuracy checks
- User permission validation with 100% access control enforcement

## Common Task Patterns

### New Research API Endpoint Development
1. Define API specification with scientific data requirements and validation rules
2. Implement Zod validation schemas for research parameter accuracy
3. Create database integration with optimized queries for research data access
4. Implement authentication and authorization for research data protection
5. Add monitoring and error handling with research workflow considerations

### Authentication System Enhancement
1. Analyze new authentication requirements for research collaboration features
2. Implement NextAuth provider integration with research profile management
3. Create middleware for research data access control and user permissions
4. Test authentication flows against research user workflows and security requirements
5. Document authentication patterns and integration requirements for frontend

### Real-time Feature Implementation
1. Design WebSocket integration for experimental monitoring and live data streams
2. Implement data validation and error handling for real-time research data
3. Create connection management and recovery patterns for sustained research sessions
4. Integrate with database for persistent storage of real-time experimental data
5. Test real-time performance under research workload conditions

### External API Integration
1. Analyze research database APIs (PubMed, CrossRef, IEEE Xplore) for integration requirements
2. Implement API clients with authentication, rate limiting, and error handling
3. Create data transformation patterns for external research data normalization
4. Design caching strategies for frequently accessed external research content
5. Validate external API integration against research accuracy and performance standards

### API Performance Optimization
1. Identify performance bottlenecks through API monitoring and research usage analysis
2. Implement query optimization and caching strategies for research data endpoints
3. Design efficient pagination and filtering for large research datasets
4. Create background processing patterns for compute-intensive research operations
5. Monitor and validate performance improvements against research workflow requirements

---

*This context template is specifically designed for API Agents working on MESSAI's backend API development, authentication systems, and real-time communication features. It ensures secure, performant, and scientifically accurate API design for research workflows. Last updated: July 2025*