# MESSAi Branch Workflow Guide

## Overview

MESSAi uses a multi-branch development strategy with git worktrees to enable parallel development across different feature areas while maintaining code quality and deployment reliability.

## Branch Structure

### Active Development Branches

#### `messai-home` - Public Website & Marketing
- **Purpose**: Public-facing website, marketing content, demo interfaces
- **Deployment**: app.messai.io (public demos)
- **Key Features**:
  - Landing pages and marketing content
  - Public demos and showcases
  - User acquisition funnels
  - Documentation and guides

**Development Focus:**
- User experience optimization
- Marketing content updates
- Public demo functionality
- SEO and performance optimization

#### `messai-lab` - Modeling & 3D Features
- **Purpose**: Advanced modeling tools, 3D visualization, simulation engines
- **Key Features**:
  - Bioreactor design tools (`app/tools/bioreactor/`)
  - Electroanalytical interfaces (`app/tools/electroanalytical/`)
  - 3D model systems (`components/3d/`)
  - Advanced prediction engines

**Recent Additions:**
- Bioreactor and electroanalytical tools with 3D models
- Enhanced Three.js visualizations
- Performance optimization for 3D rendering

#### `messai-research` - Literature & Research System
- **Purpose**: Research paper management, literature collection, AI extraction
- **Database**: 3,721 verified research papers
- **Key Features**:
  - Literature browsing and search (`app/research/`)
  - Paper collection scripts (`scripts/research/`)
  - AI-powered data extraction
  - Research database management

**Development Focus:**
- Paper collection automation
- AI extraction improvements
- Research database optimization
- Literature system enhancements

#### `research-development` - Dedicated Research Features
- **Purpose**: Dedicated branch for research feature development (newly created)
- **Based on**: `messai-research` branch
- **Focus**: Experimental research features and advanced literature processing

#### `master` - Production Integration
- **Purpose**: Stable production releases and feature integration
- **Deployment**: messai.io (integrated platform)
- **Strategy**: Merge stable features from development branches

## Git Worktree Setup

### Initial Setup
```bash
# Verify current worktrees
git worktree list

# Add worktrees for parallel development
git worktree add ../messai-lab messai-lab
git worktree add ../messai-research messai-research
git worktree add ../research-development research-development

# Navigate to specific worktrees
cd ../messai-lab        # For modeling features
cd ../messai-research   # For literature system
```

### Maintenance Commands
```bash
# Clean up broken worktrees
git worktree prune

# Remove a worktree
git worktree remove ../branch-name

# List all worktrees
git worktree list
```

## Development Workflow

### Feature Development Process

1. **Choose the Right Branch**
   - **3D/Modeling features** → `messai-lab`
   - **Research/Literature** → `messai-research` or `research-development`
   - **Marketing/Public** → `messai-home`
   - **Bug fixes/Integration** → `master`

2. **Start Development**
   ```bash
   # Navigate to appropriate worktree
   cd ../messai-lab  # or other branch directory
   
   # Ensure latest changes
   git pull origin messai-lab
   
   # Start development
   npm run dev
   ```

3. **Branch-Specific Commands**
   ```bash
   # Research branches
   npm run test:research
   npm run research:enhance-all
   npm run db:integrity
   
   # Lab branch
   npm run test -- --testPathPattern="3d|bioreactor"
   npm run analyze  # Bundle analysis
   
   # All branches
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Testing Requirements**
   - **All branches**: Pass linting and type-checking
   - **Research branches**: Literature system tests must pass
   - **Lab branch**: 3D rendering and modeling tests
   - **Home branch**: Marketing component tests

### Integration Process

1. **Pre-Integration Checklist**
   ```bash
   # In your feature branch
   npm run lint           # Must pass
   npm run type-check     # Must pass
   npm run test          # Branch-specific tests
   npm run build         # Must build successfully
   ```

2. **Sync with Master**
   ```bash
   # Update master first
   git checkout master
   git pull origin master
   
   # Rebase feature branch
   git checkout your-feature-branch
   git rebase master
   ```

3. **Create Pull Request**
   - Target: `master` branch
   - Include: Test results, deployment notes
   - Review: Required for production changes

4. **Merge to Master**
   ```bash
   git checkout master
   git merge --no-ff your-feature-branch
   git push origin master
   ```

## Branch-Specific Guidelines

### `messai-research` Development

**Database Requirements:**
- Use SQLite for local development
- Test with production data structure
- Validate paper collection scripts

**Key Commands:**
```bash
npm run research:enhance-all      # Full literature pipeline
npm run db:studio:dev            # Local database viewer
npm run test:research            # Literature system tests
```

**Common Issues:**
- Database connection pool exhaustion
- Literature page infinite loops
- Authentication conflicts

### `messai-lab` Development

**3D Development Requirements:**
- Test across different devices
- Optimize for performance
- Validate WebGL compatibility

**Key Commands:**
```bash
npm run test -- tests/components/3d/  # 3D component tests
npm run analyze                       # Bundle size analysis
```

**Common Issues:**
- Three.js version conflicts
- Performance on older devices
- Memory leaks in 3D scenes

### `messai-home` Development

**Marketing Focus:**
- SEO optimization
- Performance metrics
- User experience testing

**Deployment Considerations:**
- Public-facing content
- Demo mode compatibility
- External link validation

## Deployment Strategy

### Branch-Specific Deployments

| Branch | Domain | Purpose | Database |
|--------|--------|---------|----------|
| `messai-home` | app.messai.io | Public marketing | Demo data |
| `messai-research` | research.messai.io | Research tools | Research DB |
| `messai-lab` | lab.messai.io | Modeling tools | Demo data |
| `master` | messai.io | Full platform | Production |

### Deployment Process

1. **Automatic Deployments**
   - Vercel monitors all active branches
   - Each push triggers build and deploy
   - Branch protection prevents broken deploys

2. **Manual Deployment**
   ```bash
   # Deploy specific branch
   vercel --prod --target production
   
   # Deploy to preview
   vercel
   ```

3. **Deployment Validation**
   - Health checks on key endpoints
   - Database connectivity verification
   - Authentication flow testing

## CI/CD Pipeline

### Automated Testing

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Universal Tests** (All Branches)
   - ESLint code quality
   - TypeScript compilation
   - Unit test suite
   - Build verification

2. **Branch-Specific Tests**
   - Research: Literature system tests
   - Lab: 3D component tests
   - Home: Marketing component tests

3. **Security Scanning**
   - npm audit for vulnerabilities
   - Snyk security analysis
   - Dependency vulnerability checks

### Build Requirements

All branches must pass:
```bash
npm run lint          # Code quality
npm run type-check    # TypeScript validation
npm run test:ci       # Automated test suite
npm run build         # Production build
```

## Common Issues & Solutions

### Recurring Build Issues

1. **Next.js 15 Compatibility**
   - Solution: Pin compatible dependency versions
   - Monitor: Build logs for deprecation warnings

2. **Database Connection Pool Exhaustion**
   - Solution: Implement connection pooling
   - Prevention: Use Prisma Accelerate in production

3. **CSP Errors with Vercel Scripts**
   - Solution: Update CSP headers in vercel.json
   - Testing: Validate in development mode

4. **Authentication Conflicts Between Branches**
   - Solution: Branch-specific auth configuration
   - Isolation: Use demo mode for public branches

### Worktree Management Issues

1. **Broken Worktree Paths**
   ```bash
   git worktree prune
   git worktree add ../branch-name branch-name
   ```

2. **Disk Space Issues**
   ```bash
   # Clean up node_modules in worktrees
   find .. -name "node_modules" -type d -exec rm -rf {} +
   # Reinstall in active worktree
   npm install
   ```

3. **Branch Synchronization**
   ```bash
   # Sync all worktrees with remote
   git fetch --all
   git branch -a  # Verify branch status
   ```

## Best Practices

### Code Quality
- Follow TypeScript strict mode
- Write tests for new features
- Document scientific assumptions
- Maintain design consistency

### Database Management
- Coordinate schema changes across branches
- Test migrations before integration
- Use branch-specific databases for development
- Backup before major changes

### Performance
- Monitor bundle size growth
- Optimize 3D rendering performance
- Test literature system with large datasets
- Profile memory usage in development

### Security
- Validate input in all API routes
- Check demo mode in public branches
- Secure environment variable handling
- Regular security audits

## Future Improvements

1. **Enhanced Automation**
   - Automated dependency updates
   - Cross-branch compatibility testing
   - Performance regression detection

2. **Development Experience**
   - Hot reloading across worktrees
   - Shared development database
   - Unified logging system

3. **Deployment Pipeline**
   - Blue-green deployments
   - Automated rollback mechanisms
   - Advanced monitoring and alerting

---

For questions or issues with the branch workflow, check the [GitHub Discussions](https://github.com/your-org/messai-mvp/discussions) or review recent commit logs for similar issues.