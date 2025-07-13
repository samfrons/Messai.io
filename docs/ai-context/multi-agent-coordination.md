# MESSAI Multi-Agent Coordination Framework

This document defines the specialized agent roles, coordination protocols, and context injection patterns for optimal multi-agent development of the MESSAI electrochemical research platform.

## Agent Specialization Matrix

### 1. Research Agent
**Primary Responsibility**: Scientific literature management and knowledge extraction

**Core Competencies**:
- Literature database management and paper processing
- AI-enhanced research paper analysis and validation
- Citation network analysis and knowledge graph construction
- PubMed, CrossRef, and IEEE Xplore API integration
- Scientific accuracy validation and peer review workflows
- Research trend analysis and discovery algorithms

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/packages/@messai/core/src/types/` (research data models)
- `/apps/web/app/api/papers/` (literature API endpoints)
- `/scripts/literature/` (processing workflows)
- Research paper validation schemas and quality scoring algorithms

**Handoff Triggers**:
- To **AI/ML Agent**: When research insights need prediction model integration
- To **Database Agent**: When literature database schema changes are required
- To **Frontend Agent**: When research interface components need updating

### 2. 3D Visualization Agent
**Primary Responsibility**: Three.js-based electrochemical system modeling and visualization

**Core Competencies**:
- Three.js and React Three Fiber component development
- WebGL optimization and performance tuning
- Electrochemical system 3D modeling (MFC, MEC, fuel cells, bioreactors)
- Real-time data visualization and animation systems
- Multi-scale modeling from molecular to system-level perspectives
- Material property visualization and flow simulation

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/packages/@messai/3d/` and `/packages/@messai/ui/src/3d/` (3D utilities)
- `/apps/web/components/3d/` (3D components)
- Three.js performance optimization patterns
- Electrochemical system modeling requirements

**Handoff Triggers**:
- To **AI/ML Agent**: When 3D models need performance prediction overlays
- To **Core Agent**: When new material properties need 3D representation
- To **Frontend Agent**: When 3D components need UI integration

### 3. AI/ML Agent
**Primary Responsibility**: Machine learning models, prediction algorithms, and research assistance

**Core Competencies**:
- Electrochemical system performance prediction algorithms
- Multi-objective optimization (genetic algorithms, particle swarm, gradient descent)
- Research assistance and hypothesis generation
- Knowledge graph construction and semantic analysis
- ML model training on 3,721+ research paper dataset
- Confidence scoring and prediction reliability assessment

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/packages/@messai/ai/` and `/packages/@messai/ml/` (ML libraries)
- `/apps/web/lib/ai-predictions.ts` (prediction engine)
- Research paper dataset structure and training patterns
- Electrochemical system modeling principles

**Handoff Triggers**:
- To **Research Agent**: When new research insights affect prediction models
- To **Database Agent**: When ML model results need persistent storage
- To **3D Agent**: When predictions need visualization overlays

### 4. Database Agent
**Primary Responsibility**: Data architecture, schema management, and performance optimization

**Core Competencies**:
- Prisma schema design and migration management
- SQLite (development) and PostgreSQL (production) optimization
- Research data modeling and experimental data storage
- Literature database architecture and indexing strategies
- Data validation schemas and integrity enforcement
- Backup and restoration procedures for research data

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/apps/web/prisma/schema.prisma` (database schema)
- `/packages/@messai/database/` (database utilities)
- `/scripts/backup/` and `/scripts/migrate-to-postgres.ts` (data management)
- Research data patterns and scientific accuracy requirements

**Handoff Triggers**:
- To **API Agent**: When database changes affect API endpoints
- To **Research Agent**: When literature database schema updates are needed
- To **AI/ML Agent**: When ML model storage patterns need optimization

### 5. API Agent
**Primary Responsibility**: Backend API development, validation, and authentication

**Core Competencies**:
- Next.js API route development and middleware design
- Authentication and authorization with NextAuth.js
- Input validation with Zod schemas and scientific data validation
- Real-time WebSocket integration for experiment monitoring
- External API integration (research databases, AI services)
- Rate limiting and security pattern implementation

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/apps/web/app/api/` (API endpoints)
- `/apps/web/lib/auth/` (authentication patterns)
- `/apps/web/middleware.ts` (request processing)
- Scientific data validation requirements and research workflows

**Handoff Triggers**:
- To **Database Agent**: When API changes require schema modifications
- To **Frontend Agent**: When new API endpoints need client integration
- To **AI/ML Agent**: When prediction APIs need algorithm updates

### 6. Frontend Agent
**Primary Responsibility**: User interface components, state management, and research workflows

**Core Competencies**:
- React component development and composition patterns
- Research workflow design and user experience optimization
- State management with Zustand and form handling with React Hook Form
- Scientific data visualization and accessibility compliance
- Responsive design for research tools and mobile optimization
- User onboarding and educational content development

**Required Context**:
- `/docs/ai-context/project-structure.md` (foundation)
- `/apps/web/components/` (component library)
- `/packages/@messai/ui/` (shared UI components)
- Research workflow requirements and user personas
- Accessibility standards for scientific applications

**Handoff Triggers**:
- To **3D Agent**: When UI components need 3D visualization integration
- To **API Agent**: When frontend changes require new API endpoints
- To **Research Agent**: When interface updates affect research workflows

## Coordination Protocols

### 1. Context Injection Protocol
**Automatic Context Loading**:
- All agents receive Tier 1 foundation documentation automatically
- Task-specific agents receive relevant Tier 2 component documentation
- Feature-specific Tier 3 documentation loaded only when working on specific components

**Manual Context Addition**:
- Agents can request additional context for cross-component work
- Research accuracy requirements always included for scientific features
- Performance optimization patterns included for 3D and ML work

### 2. Task Handoff Protocol
**Handoff Initialization**:
1. Current agent identifies need for specialized expertise
2. Documents current state and blockers in task description
3. Specifies required handoff agent and context requirements
4. Provides clear success criteria and integration points

**Handoff Execution**:
1. Receiving agent reviews handoff documentation and current state
2. Loads appropriate context for the specialized domain
3. Requests clarification if integration points are unclear
4. Completes specialized work with clear deliverables

**Handoff Completion**:
1. Receiving agent documents completed work and integration notes
2. Returns control to original agent or passes to next specialist
3. Updates shared context with new patterns or architectural decisions
4. Validates integration with existing MESSAI components

### 3. Quality Assurance Protocol
**Scientific Accuracy Validation**:
- Research Agent validates all scientific claims and data accuracy
- Database Agent ensures research data integrity and validation schemas
- API Agent implements proper validation for scientific input parameters

**Performance Validation**:
- 3D Agent validates WebGL performance and optimization patterns
- AI/ML Agent validates prediction accuracy and confidence scoring
- Database Agent validates query performance and data access patterns

**Integration Validation**:
- Frontend Agent validates user workflow integration and accessibility
- API Agent validates endpoint integration and authentication flows
- All agents validate against existing MESSAI architectural patterns

## Multi-Agent Task Patterns

### 1. Research Feature Development
**Agent Sequence**: Research → Database → API → Frontend
**Example**: Implementing new literature search algorithm
1. **Research Agent**: Designs semantic search algorithm and validation rules
2. **Database Agent**: Optimizes database queries and indexing strategies
3. **API Agent**: Implements search endpoints with proper validation
4. **Frontend Agent**: Creates search interface with result visualization

### 2. 3D Visualization Enhancement
**Agent Sequence**: 3D → AI/ML → API → Frontend
**Example**: Adding real-time performance prediction to 3D models
1. **3D Agent**: Implements performance overlay rendering and optimization
2. **AI/ML Agent**: Integrates prediction algorithms with 3D data streams
3. **API Agent**: Creates WebSocket endpoints for real-time data
4. **Frontend Agent**: Integrates 3D controls with prediction interface

### 3. AI Model Integration
**Agent Sequence**: AI/ML → Research → Database → API
**Example**: Training new electrochemical system prediction model
1. **AI/ML Agent**: Develops and trains prediction model with validation
2. **Research Agent**: Validates model against research literature and accuracy requirements
3. **Database Agent**: Implements model storage and versioning patterns
4. **API Agent**: Creates prediction endpoints with confidence scoring

### 4. Cross-Platform Feature
**Agent Sequence**: All agents in parallel with coordination checkpoints
**Example**: Implementing new experiment tracking system
1. **Parallel Phase**: All agents work on their domain-specific components
2. **Integration Checkpoint**: Validate interfaces and data flows
3. **Testing Phase**: End-to-end validation with scientific accuracy checks
4. **Deployment Phase**: Coordinated release with performance monitoring

## Success Metrics

### Development Efficiency
- Reduced context switching between specialized domains
- Faster feature development through parallel agent work
- Improved code quality through specialized expertise

### Scientific Accuracy
- Research Agent validation ensures scientific accuracy
- Database Agent maintains data integrity for research workflows
- AI/ML Agent provides reliable prediction confidence scoring

### Platform Integration
- Seamless handoffs between agent specializations
- Consistent architectural patterns across all MESSAI components
- Maintained performance standards for research computing workloads

---

*This coordination framework is specifically designed for MESSAI's AI-powered electrochemical research platform development. It ensures specialized expertise while maintaining scientific accuracy and platform integration. Last updated: July 2025*