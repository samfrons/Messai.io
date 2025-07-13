# [MESSAI.AI] - AI Context Template (claude-master)

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

## 2. Project Structure

  Technology Stack

  - Frontend: Next.js 15, React 18, TypeScript 5 (strict mode), WebSocket for real-time updates
  - 3D Graphics: Three.js, React Three Fiber, WebGL
  - Styling: Tailwind CSS, easy custom theme switching
  - State: Zustand, React Context
  - Database: PostgreSQL (prod), SQLite (dev), Prisma ORM
  - Auth: NextAuth.js with OAuth providers
  - Testing: Vitest, React Testing Library
  - Deployment: Vercel, Docker support



**⚠️ CRITICAL: AI agents MUST read the [Project Structure documentation](/docs/ai-context/project-structure.md) before attempting any task to understand the complete technology stack, file tree and project organization.**

[Project Name] follows a [describe architecture pattern]. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Coding Standards & AI Instructions

### General Instructions
- Your most important job is to manage your own context. Always read any relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not commit to git without user approval.
- Do not run any servers, rather tell the user to run servers for testing.
- Always consider industry standard libraries/frameworks first over custom implementations.
- Never mock anything. Never use placeholders. Never omit code.
- Apply SOLID principles where relevant. Use modern framework features rather than reinventing solutions.
- Be brutally honest about whether an idea is good or bad.
- Make side effects explicit and minimal.
- Design database schema to be evolution-friendly (avoid breaking changes).


### File Organization & Modularity
- Default to creating multiple small, focused files rather than large monolithic ones
- Each file should have a single responsibility and clear purpose
- Keep files under 350 lines when possible - split larger files by extracting utilities, constants, types, or logical components into separate modules
- Separate concerns: utilities, constants, types, components, and business logic into different files
- Prefer composition over inheritance - use inheritance only for true 'is-a' relationships, favor composition for 'has-a' or behavior mixing

- Follow existing project structure and conventions - place files in appropriate directories. Create new directories and move files if deemed appropriate.
- Use well defined sub-directories to keep things organized and scalable
- Structure projects with clear folder hierarchies and consistent naming conventions
- Import/export properly - design for reusability and maintainability

### Type Hints (REQUIRED)
- **Always** use type hints for function parameters and return values
- Use `from typing import` for complex types
- Prefer `Optional[T]` over `Union[T, None]`
- Use Pydantic models for data structures

```python
# Good
from typing import Optional, List, Dict, Tuple

async def process_audio(
    audio_data: bytes,
    session_id: str,
    language: Optional[str] = None
) -> Tuple[bytes, Dict[str, Any]]:
    """Process audio through the pipeline."""
    pass
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `VoicePipeline`)
- **Functions/Methods**: snake_case (e.g., `process_audio`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_AUDIO_SIZE`)
- **Private methods**: Leading underscore (e.g., `_validate_input`)
- **Pydantic Models**: PascalCase with `Schema` suffix (e.g., `ChatRequestSchema`, `UserSchema`)


### Documentation Requirements
- Every module needs a docstring
- Every public function needs a docstring
- Use Google-style docstrings
- Include type information in docstrings

```python
def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate semantic similarity between two texts.

    Args:
        text1: First text to compare
        text2: Second text to compare

    Returns:
        Similarity score between 0 and 1

    Raises:
        ValueError: If either text is empty
    """
    pass
```

### Security First
- Never trust external inputs - validate everything at the boundaries
- Keep secrets in environment variables, never in code
- Log security events (login attempts, auth failures, rate limits, permission denials) but never log sensitive data (audio, conversation content, tokens, personal info)
- Authenticate users at the API gateway level - never trust client-side tokens
- Use Row Level Security (RLS) to enforce data isolation between users
- Design auth to work across all client types consistently
- Use secure authentication patterns for your platform
- Validate all authentication tokens server-side before creating sessions
- Sanitize all user inputs before storing or processing

### Error Handling
- Use specific exceptions over generic ones
- Always log errors with context
- Provide helpful error messages
- Fail securely - errors shouldn't reveal system internals

### Observable Systems & Logging Standards
- Every request needs a correlation ID for debugging
- Structure logs for machines, not humans - use JSON format with consistent fields (timestamp, level, correlation_id, event, context) for automated analysis
- Make debugging possible across service boundaries

### State Management
- Have one source of truth for each piece of state
- Make state changes explicit and traceable
- Design for multi-service voice processing - use session IDs for state coordination, avoid storing conversation data in server memory
- Keep conversation history lightweight (text, not audio)

### API Design Principles
- RESTful design with consistent URL patterns
- Use HTTP status codes correctly
- Version APIs from day one (/v1/, /v2/)
- Support pagination for list endpoints
- Use consistent JSON response format:
  - Success: `{ "data": {...}, "error": null }`
  - Error: `{ "data": null, "error": {"message": "...", "code": "..."} }`


## 4. Multi-Agent Workflows & Context Injection

### Automatic Context Injection for Sub-Agents
When using the Task tool to spawn sub-agents, the core project context (CLAUDE.md, project-structure.md, docs-overview.md) is automatically injected into their prompts via the subagent-context-injector hook. This ensures all sub-agents have immediate access to essential project documentation without the need of manual specification in each Task prompt.


## 5. MCP Server Integrations

### Gemini Consultation Server
**When to use:**
- Complex coding problems requiring deep analysis or multiple approaches
- Code reviews and architecture discussions
- Debugging complex issues across multiple files
- Performance optimization and refactoring guidance
- Detailed explanations of complex implementations
- Highly security relevant tasks

**Automatic Context Injection:**
- The kit's `gemini-context-injector.sh` hook automatically includes two key files for new sessions:
  - `/docs/ai-context/project-structure.md` - Complete project structure and tech stack
  - `/MCP-ASSISTANT-RULES.md` - Your project-specific coding standards and guidelines
- This ensures Gemini always has comprehensive understanding of your technology stack, architecture, and project standards

**Usage patterns:**
```python
# New consultation session (project structure auto-attached by hooks)
mcp__gemini__consult_gemini(
    specific_question="How should I optimize this voice pipeline?",
    problem_description="Need to reduce latency in real-time audio processing",
    code_context="Current pipeline processes audio sequentially...",
    attached_files=[
        "src/core/pipelines/voice_pipeline.py"  # Your specific files
    ],
    preferred_approach="optimize"
)

# Follow-up in existing session
mcp__gemini__consult_gemini(
    specific_question="What about memory usage?",
    session_id="session_123",
    additional_context="Implemented your suggestions, now seeing high memory usage"
)
```

**Key capabilities:**
- Persistent conversation sessions with context retention
- File attachment and caching for multi-file analysis
- Specialized assistance modes (solution, review, debug, optimize, explain)
- Session management for complex, multi-step problems

**Important:** Treat Gemini's responses as advisory feedback. Evaluate the suggestions critically, incorporate valuable insights into your solution, then proceed with your implementation.

### Context7 Documentation Server
**Repository**: [Context7 MCP Server](https://github.com/upstash/context7)

**When to use:**
- Working with external libraries/frameworks (React, FastAPI, Next.js, etc.)
- Need current documentation beyond training cutoff
- Implementing new integrations or features with third-party tools
- Troubleshooting library-specific issues

**Usage patterns:**
```python
# Resolve library name to Context7 ID
mcp__context7__resolve_library_id(libraryName="react")

# Fetch focused documentation
mcp__context7__get_library_docs(
    context7CompatibleLibraryID="/facebook/react",
    topic="hooks",
    tokens=8000
)
```

**Key capabilities:**
- Up-to-date library documentation access
- Topic-focused documentation retrieval
- Support for specific library versions
- Integration with current development practices



## 6. Post-Task Completion Protocol
After completing any coding task, follow this checklist:

### 1. Type Safety & Quality Checks
Run the appropriate commands based on what was modified:
- **Python projects**: Run mypy type checking
- **TypeScript projects**: Run tsc --noEmit
- **Other languages**: Run appropriate linting/type checking tools

### 2. Verification
- Ensure all type checks pass before considering the task complete
- If type errors are found, fix them before marking the task as done