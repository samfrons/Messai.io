# MESSAi Documentation Overview

## Documentation Architecture

MESSAi uses a hierarchical, 3-tier documentation system designed for AI-assisted development and human developers:

### Tier 1: Foundation (Master Context)
**Purpose**: Project-wide standards and architectural principles
**Files**: 
- `docs/ai-context/MASTER.md` - Core development standards
- `CLAUDE.md` - Comprehensive AI assistant context
- `docs/ai-context/project-structure.md` - Repository structure

### Tier 2: Component Documentation  
**Purpose**: System-level implementation details
**Structure**:
```
docs/ai-context/components/
├── core-components.md        # Base platform components
├── lab-components.md         # Laboratory tool components  
├── research-components.md    # Research system components
├── ai-components.md          # AI/ML components
└── ui-components.md          # Shared UI components
```

### Tier 3: Feature Documentation
**Purpose**: Granular feature-level specifications
**Structure**:
```
docs/ai-context/features/
├── predictions-engine.md     # AI prediction system
├── 3d-visualization.md       # Three.js integration
├── research-extraction.md    # Paper data extraction
├── experiment-tracking.md    # Experiment management
├── authentication.md         # Auth system
└── database-management.md    # Database operations
```

## Existing Documentation Files

### Root Level Documentation
- `README.md` - Project overview and setup
- `CLAUDE.md` - Comprehensive AI context (2000+ lines)
- `SECURITY.md` - Security guidelines
- `CHANGELOG.md` - Version history

### Technical Documentation (`docs/`)
- `ARCHITECTURE.md` - System architecture
- `API.md` - API documentation
- `DATABASE_SETUP.md` - Database configuration
- `DEPLOYMENT.md` - Deployment guides
- `TESTING.md` - Testing strategies

### Branch-Specific Documentation
- `README.research.md` - Research system guide
- `README.monorepo.md` - Monorepo setup
- `docs/BRANCH_ARCHITECTURE.md` - Multi-branch strategy
- `docs/WORKTREES.md` - Worktree management

### Feature Documentation
- `docs/MESS-MODELS-SUMMARY.md` - Scientific models
- `docs/zen-mcp-integration.md` - External integrations
- `deployment/fuel-cell-config.md` - System configs

### Development Documentation
- `docs/DEVELOPMENT.md` - Development workflow
- `docs/CONTRIBUTING.md` - Contribution guidelines
- `docs/PRIVATE_BRANCH_WORKFLOW.md` - Branch management

## Auto-Loading Configuration

### Claude Context Configuration
The `.claude/` directory contains auto-loading configurations:

```
.claude/
├── commands/                 # Custom Claude commands
│   ├── README.md
│   ├── code-review.md
│   ├── create-docs.md
│   ├── full-context.md
│   ├── gemini-consult.md
│   ├── handoff.md
│   ├── refactor.md
│   └── update-docs.md
└── hooks/                    # Git hooks for documentation
```

### Context Loading Hierarchy
1. **Always Auto-Load**:
   - `docs/ai-context/MASTER.md`
   - `docs/ai-context/project-structure.md`
   - `docs/ai-context/docs-overview.md` (this file)

2. **Context-Specific Loading**:
   - Component docs based on file being edited
   - Feature docs based on task being performed
   - Workflow docs based on command being executed

3. **Dynamic Loading**:
   - Recent commits and changes
   - Active branch documentation
   - Current phase documentation

## Documentation Standards

### Writing Standards
- **Clarity**: Use simple, direct language
- **Structure**: Follow consistent markdown formatting
- **Completeness**: Cover all aspects thoroughly
- **Currency**: Update immediately when code changes
- **Traceability**: Link to relevant code and issues

### AI Context Standards
- **Specificity**: Include exact file paths and line numbers
- **Examples**: Provide code examples and usage patterns
- **Constraints**: Document limitations and requirements
- **Dependencies**: List all dependencies and relationships

### Code Documentation Standards
- **JSDoc**: All public APIs documented
- **Type Annotations**: Complete TypeScript types
- **Comments**: Explain why, not what
- **Examples**: Usage examples in component docs
- **Tests**: Test cases serve as documentation



## Adding New Documentation

### New Component
1. Create `/new-component/CONTEXT.md` (Tier 2)
2. Add entry to this file under appropriate section
3. Create feature-specific Tier 3 docs as features develop

### New Feature
1. Create `/component/src/feature/CONTEXT.md` (Tier 3)
2. Reference parent component patterns
3. Add entry to this file under component's features

### Deprecating Documentation
1. Remove obsolete CONTEXT.md files
2. Update this mapping document
3. Check for broken references in other docs

---

*This documentation architecture template should be customized to match your project's actual structure and components. Add or remove sections based on your architecture.*