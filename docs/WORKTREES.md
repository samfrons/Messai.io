# MESSAi Worktree Management Guide

## Overview

Git worktrees enable MESSAi's multi-agent development approach by providing separate working directories for different branches, allowing simultaneous development on multiple features without conflicts.

**Current Configuration**: 3 active worktrees supporting specialized development workflows

## Active Worktree Structure

### Primary Worktree
**Location**: `/Users/samfrons/Desktop/Messai`  
**Branch**: `master`  
**Purpose**: Main development hub with complete platform integration  
**Features**: Unified system, demo mode, full codebase

### Laboratory Worktree  
**Location**: `/Users/samfrons/Desktop/messai-lab`  
**Branch**: `messai-lab`  
**Purpose**: Specialized laboratory tools development  
**Features**: Bioreactor design, electroanalytical tools, material optimization

### Research Worktree
**Location**: `/Users/samfrons/Desktop/messai-research`  
**Branch**: `messai-research`  
**Purpose**: Research literature system development  
**Features**: Paper database, AI insights, literature analytics

## Worktree Advantages

### Development Benefits
- **Parallel Development**: Multiple agents can work simultaneously
- **Branch Isolation**: No need to switch branches and lose context
- **Feature Specialization**: Each worktree optimized for specific domain
- **Reduced Conflicts**: Separate working directories prevent interference

### Deployment Benefits
- **Environment-Specific**: Each worktree can have different configurations
- **Testing Isolation**: Independent testing environments
- **Deployment Targets**: Direct deployment from specialized worktrees
- **Rollback Safety**: Issues in one worktree don't affect others

## Worktree Management Commands

### Listing and Status
```bash
# List all worktrees with branch info
git worktree list

# Show detailed worktree status
git worktree list --porcelain

# Check status of specific worktree
git --work-tree=/path/to/worktree status
```

### Creating Worktrees
```bash
# Create new worktree for existing branch
git worktree add ../new-worktree existing-branch

# Create worktree and new branch simultaneously
git worktree add ../feature-worktree -b new-feature-branch

# Create worktree from specific commit
git worktree add ../temp-worktree commit-hash
```

### Managing Worktrees
```bash
# Move worktree to new location
git worktree move ../old-location ../new-location

# Remove worktree (must be clean)
git worktree remove ../worktree-path

# Prune stale worktree references
git worktree prune
```

## Cross-Worktree Operations

### Working with Multiple Worktrees
```bash
# Commit in specific worktree
git --work-tree=/path/to/worktree add .
git --work-tree=/path/to/worktree commit -m "Message"

# Stash changes in specific worktree  
git --work-tree=/path/to/worktree stash push -m "Description"

# Check branch status across all worktrees
git branch -vv
```

### Synchronization Strategies
```bash
# Fetch updates for all branches
git fetch --all

# Update specific worktree branch
git --work-tree=/path/to/worktree pull origin branch-name

# Sync changes between worktrees via git
git push origin branch-name  # From source worktree
git pull origin branch-name   # In target worktree
```

## Development Workflows

### Multi-Agent Development
1. **Agent Assignment**: Each agent works in designated worktree
2. **Feature Development**: Independent development in isolated environments
3. **Integration**: Changes merged through git, not file system
4. **Testing**: Parallel testing in different worktrees
5. **Deployment**: Direct deployment from appropriate worktree

### Specialized Development Scenarios

#### Laboratory Tools Development
**Worktree**: `messai-lab`
```bash
cd /Users/samfrons/Desktop/messai-lab
npm run dev              # Start lab-specific development server
npm run test:lab         # Run laboratory-specific tests
npm run build:lab        # Build lab-only deployment
```

#### Research System Development  
**Worktree**: `messai-research`
```bash
cd /Users/samfrons/Desktop/messai-research
npm run dev:research     # Start research-specific server
npm run test:research    # Run research system tests
npm run db:research      # Manage research database
```

## Configuration Management

### Environment Isolation
Each worktree can maintain separate:
- **Environment variables** (`.env.local` files)
- **Database connections** (different Prisma configs)
- **Build configurations** (specialized webpack/next configs)
- **Package dependencies** (different `package.json` if needed)

### Shared vs Isolated Resources
**Shared Across Worktrees**:
- Git history and branches
- Stash storage
- Global git configuration
- Remote repository connections

**Isolated Per Worktree**:
- Working directory files
- Build outputs
- Local environment variables
- Running processes (dev servers, etc.)

## Troubleshooting

### Common Issues

#### 1. Worktree Access Errors
```bash
# Error: worktree path already exists
git worktree remove ../existing-path
git worktree add ../new-path branch-name
```

#### 2. Conflicting Changes
```bash
# Stash changes in problematic worktree
git --work-tree=/path/to/worktree stash

# Or commit changes locally
git --work-tree=/path/to/worktree add .
git --work-tree=/path/to/worktree commit -m "WIP: local changes"
```

#### 3. Branch Checkout Conflicts
```bash
# Branch is checked out in another worktree
git worktree list  # Find which worktree has the branch
# Either work in that worktree or create new branch
```

### Recovery Procedures

#### Corrupted Worktree
```bash
# Remove corrupted worktree
git worktree remove ../corrupted-worktree --force

# Recreate clean worktree
git worktree add ../new-worktree branch-name
```

#### Lost Changes
```bash
# Check all worktrees for uncommitted changes
git --work-tree=/path/to/each/worktree status

# Check stash for potentially lost work
git stash list
git stash show -p stash@{n}
```

## Best Practices

### Security Considerations
- **Never commit sensitive data** that could affect other worktrees
- **Use environment-specific configs** for API keys and secrets
- **Regularly backup** important worktree-specific configurations

### Performance Optimization
- **Limit active worktrees** to what you actively use (3-4 maximum recommended)
- **Clean up unused worktrees** regularly with `git worktree prune`
- **Monitor disk space** as each worktree duplicates working files

### Development Efficiency
- **Use descriptive worktree paths** that indicate their purpose
- **Maintain worktree documentation** when team structure changes
- **Establish naming conventions** for consistency across team

## Integration with MESSAi Architecture

### Phase-Based Development
- **Phase 3** (current): Lab and research worktrees for specialized development
- **Phase 4** (upcoming): Integration testing across worktrees
- **Phase 5** (future): Unified deployment from main worktree

### Deployment Scenarios
- **Demo deployments**: From main worktree (`master` branch)
- **Lab-only deployments**: From lab worktree (`messai-lab` branch)
- **Research-only deployments**: From research worktree (`messai-research` branch)
- **Production deployments**: Merged features deployed from main worktree

### Multi-Agent Coordination
Each AI agent can be assigned to:
- **Specific worktree** for focused development
- **Cross-worktree integration** tasks for feature merging
- **Testing coordination** across multiple environments
- **Documentation maintenance** for worktree-specific features

---

*This guide supports MESSAi's distributed development approach. Update when adding/removing worktrees or changing development workflows.*