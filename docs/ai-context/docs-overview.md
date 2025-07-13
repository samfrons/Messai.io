# MESSAI Documentation Architecture

MESSAI uses a **3-tier documentation system** specifically designed for AI-powered research platform development, organizing knowledge by stability and scope to enable efficient AI context loading and coordinated multi-agent development.

## How the 3-Tier System Works for MESSAI

**Tier 1 (Foundation)**: Core MESSAI platform documentation that rarely changes - electrochemical systems architecture, AI prediction principles, 3D visualization patterns, research database design, and development protocols for scientific applications.

**Tier 2 (Component)**: Architectural charters for MESSAI's major systems - research intelligence, 3D modeling lab, prediction engine, literature management, experiment tracking, and shared package libraries with integration patterns specific to electrochemical research.

**Tier 3 (Feature-Specific)**: Granular documentation co-located with MESSAI features - specific implementation patterns for bioelectrochemical modeling, AI research assistance, literature processing workflows, parameter validation, and experimental design tools.

This hierarchy allows AI agents to efficiently load context for complex electrochemical research tasks while maintaining stable knowledge about MESSAI's core scientific and technical foundations.

## Documentation Principles
- **Co-location**: Documentation lives near relevant code
- **Smart Extension**: New documentation files created automatically when warranted
- **AI-First**: Optimized for efficient AI context loading and machine-readable patterns

## Tier 1: Foundational Documentation (MESSAI Platform-Wide)

- **[Master Context](/CLAUDE.md)** - *Essential for every MESSAI session.* Scientific computing standards, electrochemical system principles, AI research protocols, security requirements for research data, and MCP server integration patterns
- **[Project Structure](/docs/ai-context/project-structure.md)** - *REQUIRED reading.* Complete MESSAI technology stack, Nx monorepo structure, and research platform architecture. Must be attached to Gemini consultations
- **[System Integration](/docs/ai-context/system-integration.md)** - *For cross-component work.* MESSAI data flow patterns between literature → AI → 3D visualization, research pipeline architecture, and electrochemical system modeling integration
- **[Multi-Agent Coordination](/docs/ai-context/multi-agent-coordination.md)** - *For complex tasks.* Specialized agent roles for research, 3D modeling, AI/ML, database, API, and frontend work with coordination protocols
- **[Deployment Infrastructure](/docs/ai-context/deployment-infrastructure.md)** - *Infrastructure patterns.* Vercel deployment, PostgreSQL/SQLite dual database setup, research data backup strategies, and performance monitoring
- **[Task Management](/docs/ai-context/handoff.md)** - *Session continuity.* Current research platform development tasks, multi-agent coordination progress, and scientific feature implementation goals

## Tier 2: Component-Level Documentation (MESSAI Systems)

### Core Application
- **[Web Application](/apps/web/CONTEXT.md)** - *Main MESSAI platform.* Next.js patterns, research dashboard architecture, 3D visualization integration, and user interaction patterns for scientific workflows

### Shared MESSAI Libraries
- **[Core Library](/packages/@messai/core/CONTEXT.md)** - *Business logic.* Electrochemical system types, material databases, prediction algorithms, and research data models
- **[UI Library](/packages/@messai/ui/CONTEXT.md)** - *Component library.* 3D visualization components, research interface patterns, scientific data display, and accessibility for research tools
- **[AI Library](/packages/@messai/ai/CONTEXT.md)** - *AI/ML systems.* Knowledge graph architecture, optimization algorithms, research assistance patterns, and prediction engine integration
- **[3D Library](/packages/@messai/3d/CONTEXT.md)** - *3D visualization.* Three.js utilities, performance optimization, WebGL patterns, and electrochemical system modeling
- **[ML Library](/packages/@messai/ml/CONTEXT.md)** - *Machine learning.* Research models, MLOps patterns, model training workflows, and scientific data processing
- **[Database Library](/packages/@messai/database/CONTEXT.md)** - *Data management.* Prisma utilities, research data patterns, literature database management, and experimental data storage

### Research Infrastructure
- **[Literature Management](/docs/literature-system-context.md)** - *Research papers.* AI-enhanced paper processing, citation networks, knowledge extraction, and semantic search patterns
- **[Parameter System](/docs/parameter-system-context.md)** - *MESS parameters.* 1500+ parameter library, validation patterns, compatibility matrices, and scientific accuracy enforcement
- **[Experiment Tracking](/docs/experiment-system-context.md)** - *Research workflow.* Experiment lifecycle management, data collection patterns, performance benchmarking, and collaboration tools

## Tier 3: Feature-Specific Documentation (MESSAI Features)

Granular CONTEXT.md files co-located with MESSAI research platform code for minimal cascade effects:

### Research Platform Features
- **[Literature API](/apps/web/app/api/papers/CONTEXT.md)** - *Research papers API.* Literature database endpoints, AI-enhanced search, citation analysis, and paper validation
- **[Prediction API](/apps/web/app/api/predictions/CONTEXT.md)** - *AI predictions API.* Electrochemical system performance prediction, optimization algorithms, and confidence scoring
- **[Materials API](/apps/web/app/api/materials/CONTEXT.md)** - *Material database API.* Electrode materials, compatibility matrices, property calculations, and validation rules
- **[Experiments API](/apps/web/app/api/experiments/CONTEXT.md)** - *Experiment tracking API.* Lifecycle management, real-time monitoring, performance benchmarking, and collaboration
- **[User Management](/apps/web/app/api/user/CONTEXT.md)** - *User system API.* Research profiles, onboarding workflows, preferences, and authentication patterns

### 3D Visualization Features
- **[3D Components](/apps/web/components/3d/CONTEXT.md)** - *3D visualization.* Three.js components, electrochemical system models, performance optimization, and real-time rendering
- **[Bioreactor Models](/apps/web/components/3d/bioreactor/CONTEXT.md)** - *Bioreactor 3D.* Multi-scale modeling, flow simulation, electrode geometry, and material visualization
- **[Electroanalytical Tools](/apps/web/components/3d/electroanalytical/CONTEXT.md)** - *Analysis tools 3D.* Electrochemical measurement visualization, data analysis integration, and interactive controls

### Research Interface Features
- **[Literature Components](/apps/web/components/literature/CONTEXT.md)** - *Research interface.* Paper discovery, citation networks, semantic search, and knowledge graph visualization
- **[Fuel Cell Components](/apps/web/components/fuel-cell/CONTEXT.md)** - *Fuel cell systems.* Configuration panels, optimization interfaces, comparative analysis, and control system design
- **[Research Dashboard](/apps/web/components/research/CONTEXT.md)** - *Research tools.* Advanced filtering, knowledge graph visualization, semantic search, and collaborative research features
- **[Onboarding System](/apps/web/components/onboarding/CONTEXT.md)** - *User onboarding.* Research wizard, preference collection, interest mapping, and tutorial system

### Core Scientific Features
- **[Authentication System](/apps/web/lib/auth/CONTEXT.md)** - *Research auth.* Multi-provider authentication, research profile management, collaboration permissions, and data access control
- **[Database Integration](/apps/web/lib/CONTEXT.md)** - *Data patterns.* Research data models, experimental data storage, literature database patterns, and performance optimization
- **[AI Predictions](/apps/web/lib/ai-predictions.ts)** - *Prediction engine.* ML model integration, electrochemical system analysis, optimization algorithms, and confidence scoring
- **[Parameter Management](/apps/web/lib/parameters-data.ts)** - *MESS parameters.* 1500+ parameter library, validation patterns, compatibility checking, and scientific accuracy enforcement

### Shared Research Utilities
- **[Core Types](/packages/@messai/core/src/types/CONTEXT.md)** - *Research types.* Electrochemical system interfaces, material properties, experimental data models, and scientific data structures
- **[UI Component Library](/packages/@messai/ui/src/CONTEXT.md)** - *Research UI.* Scientific visualization components, data display patterns, research workflow interfaces, and accessibility
- **[Knowledge Graph](/packages/@messai/ai/src/knowledge-graph/CONTEXT.md)** - *AI knowledge.* Semantic relationships, research paper connections, parameter correlations, and insight generation
- **[3D Model Catalog](/packages/@messai/ui/src/3d/models/CONTEXT.md)** - *3D models.* Electrochemical system designs, multi-scale representations, material visualizations, and performance overlays



## Adding New MESSAI Documentation

### New Research Component
1. Create `/packages/@messai/new-component/CONTEXT.md` (Tier 2)
2. Add entry to this file under MESSAI Systems section
3. Create feature-specific Tier 3 docs as research features develop
4. Reference electrochemical system principles and AI integration patterns

### New Scientific Feature
1. Create `/apps/web/app/feature-name/CONTEXT.md` or `/apps/web/components/feature/CONTEXT.md` (Tier 3)
2. Reference parent component patterns and scientific accuracy requirements
3. Add entry to this file under appropriate research feature section
4. Include validation patterns for scientific data and research workflows

### New API Endpoint
1. Create `/apps/web/app/api/endpoint-name/CONTEXT.md` (Tier 3)
2. Document research data patterns, validation schemas, and AI integration
3. Reference authentication patterns for research data access
4. Include performance considerations for scientific computing workloads

### Deprecating Research Documentation
1. Remove obsolete CONTEXT.md files from research features
2. Update this mapping document with current MESSAI structure
3. Check for broken references in other research platform docs
4. Preserve scientific accuracy requirements and validation patterns

## Multi-Agent Development Patterns

### Agent Specialization for MESSAI
- **Research Agent**: Literature processing, paper validation, knowledge extraction
- **3D Agent**: Electrochemical system modeling, performance visualization, WebGL optimization
- **AI/ML Agent**: Prediction algorithms, optimization, research assistance
- **Database Agent**: Scientific data management, experimental data storage, literature database
- **API Agent**: Research platform endpoints, validation, authentication
- **Frontend Agent**: Research interface components, scientific workflows, user experience

### Context Loading Strategy
- Load Tier 1 foundation docs for all MESSAI sessions
- Load relevant Tier 2 component docs based on research domain (literature, 3D, AI, etc.)
- Load specific Tier 3 feature docs only when working on particular research tools
- Always include scientific accuracy requirements and validation patterns

---

*This documentation architecture is specifically designed for MESSAI's AI-powered electrochemical research platform. It supports multi-agent development workflows and maintains scientific accuracy across all research features. Last updated: July 2025*