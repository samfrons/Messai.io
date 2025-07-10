# Cross-Branch Integration Guide

## Overview

This guide outlines the process for safely integrating features across MESSAi's multi-branch development workflow, ensuring compatibility and preventing conflicts between the specialized branches.

## Integration Strategy

### Branch Hierarchy

```
master (production)
├── messai-home (marketing/public)
├── messai-lab (modeling/3D)
├── messai-research (literature)
└── research-development (experimental research)
```

### Integration Flow

1. **Feature Development** → Specialized branch
2. **Testing & Validation** → Branch-specific tests
3. **Integration Testing** → Cross-branch compatibility
4. **Merge to Master** → Production deployment

## Pre-Integration Checklist

### Universal Requirements (All Branches)

- [ ] **Code Quality**
  ```bash
  npm run lint           # Must pass
  npm run type-check     # Must pass
  npm run format:check   # Code formatting
  ```

- [ ] **Testing**
  ```bash
  npm run test          # Unit tests
  npm run test:ci       # CI test suite
  npm run build         # Production build
  ```

- [ ] **Documentation**
  - [ ] Update CLAUDE.md if workflow changes
  - [ ] Document new API endpoints
  - [ ] Update component documentation

### Branch-Specific Requirements

#### Research Branches (`messai-research`, `research-development`)
- [ ] **Database Integrity**
  ```bash
  npm run db:integrity           # Database consistency
  npm run db:validate-links      # External links validation
  npm run test:research          # Literature system tests
  ```

- [ ] **Data Quality**
  - [ ] Verify paper counts remain consistent
  - [ ] Test literature page loading
  - [ ] Validate API response formats
  - [ ] Check authentication integration

#### Lab Branch (`messai-lab`)
- [ ] **3D Performance**
  ```bash
  npm run test -- tests/components/3d/   # 3D component tests
  npm run analyze                        # Bundle size analysis
  ```

- [ ] **Modeling Tools**
  - [ ] Test bioreactor tools functionality
  - [ ] Validate electroanalytical interfaces
  - [ ] Check Three.js compatibility
  - [ ] Performance test on various devices

#### Home Branch (`messai-home`)
- [ ] **Public Interface**
  - [ ] Verify demo mode functionality
  - [ ] Test external link routing
  - [ ] Validate SEO metadata
  - [ ] Check marketing component display

## Integration Process

### Step 1: Sync with Master

```bash
# In your feature branch worktree
git fetch origin
git rebase origin/master

# Resolve any conflicts
git status
# Fix conflicts if any
git add .
git rebase --continue
```

### Step 2: Cross-Branch Compatibility Testing

#### Database Schema Compatibility

```bash
# Test with both database types
DATABASE_URL="file:./test.db" npm test
DATABASE_URL="postgresql://..." npm test

# Verify migrations work
npx prisma migrate dev
npx prisma db push
```

#### Component Integration Testing

```bash
# Test component imports across branches
npm run test:integration

# Verify no circular dependencies
npm run build -- --analyze
```

#### API Compatibility

```bash
# Test API endpoints
curl http://localhost:3003/api/papers
curl http://localhost:3003/api/predictions
curl http://localhost:3003/api/research/stats

# Verify authentication flows
npm run test -- tests/api/
```

### Step 3: Create Integration PR

#### PR Template
```markdown
## Integration Summary
**Source Branch**: [branch-name]
**Target Branch**: master
**Type**: [Feature/Bugfix/Enhancement]

## Changes Overview
- [ ] New features added
- [ ] Breaking changes (if any)
- [ ] Database schema changes
- [ ] API modifications

## Testing Completed
- [ ] Branch-specific tests pass
- [ ] Cross-branch compatibility verified
- [ ] Database compatibility tested
- [ ] Performance impact assessed

## Deployment Notes
- [ ] Environment variables needed
- [ ] Migration scripts required
- [ ] Post-deployment validation steps

## Review Checklist
- [ ] Code quality standards met
- [ ] Documentation updated
- [ ] No sensitive data exposed
- [ ] Performance impact acceptable
```

### Step 4: Review & Validation

#### Code Review Focus Areas

1. **API Compatibility**
   - Existing endpoints unchanged
   - New endpoints documented
   - Authentication preserved
   - Response formats consistent

2. **Database Safety**
   - Schema changes backward compatible
   - Migration scripts tested
   - Data integrity maintained
   - Performance impact assessed

3. **Component Integration**
   - No circular dependencies
   - Shared components compatible
   - Import paths correct
   - TypeScript types updated

#### Automated Validation

The CI/CD pipeline automatically checks:
- Build success across Node.js versions
- Test suite completion
- Security vulnerability scan
- Bundle size impact

### Step 5: Merge Strategy

```bash
# Use no-fast-forward merge for traceability
git checkout master
git merge --no-ff feature-branch-name

# Tag significant releases
git tag -a v1.x.x -m "Release notes"

# Push to origin
git push origin master
git push origin --tags
```

## Conflict Resolution

### Common Conflict Types

#### 1. Package.json Dependencies
```bash
# Check for dependency conflicts
npm ls
npm audit

# Resolve version mismatches
npm install package@specific-version
```

#### 2. Database Schema Conflicts
```bash
# Generate new migration
npx prisma migrate dev --name resolve_conflicts

# Test migration on both databases
DATABASE_URL="file:./test.db" npx prisma migrate dev
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

#### 3. Component Import Conflicts
```bash
# Check for duplicate exports
npm run type-check

# Resolve import path conflicts
# Update import statements to be explicit
```

#### 4. API Route Conflicts
```bash
# List all API routes
find app/api -name "route.ts" | sort

# Check for overlapping routes
npm run build 2>&1 | grep -i route
```

### Resolution Strategies

1. **Favor Master Branch** for core functionality
2. **Preserve Feature Branch** for specialized features
3. **Create New Implementation** for incompatible changes
4. **Coordinate with Team** for breaking changes

## Post-Integration Validation

### Health Checks

```bash
# Start the integrated application
npm run dev

# Run health check endpoints
curl http://localhost:3003/api/debug
curl http://localhost:3003/api/papers/filters
curl http://localhost:3003/api/research/stats

# Verify key user flows
npm run test:integration
```

### Performance Monitoring

```bash
# Bundle analysis
npm run analyze

# Performance testing
npm run test:performance

# Database query performance
npm run db:studio
```

### Rollback Plan

If integration causes issues:

```bash
# Emergency rollback
git revert merge-commit-hash
git push origin master

# Or reset to previous state
git reset --hard previous-commit-hash
git push --force origin master  # Use with caution
```

## Branch Synchronization

### Regular Sync Schedule

1. **Daily**: Sync development branches with master
2. **Weekly**: Cross-branch dependency updates
3. **Monthly**: Major integration cycles

### Sync Commands

```bash
# Update all worktrees from master
cd /path/to/main/repo
git checkout master
git pull origin master

# Update each worktree
cd ../messai-lab
git rebase master

cd ../messai-research  
git rebase master

cd ../research-development
git rebase master
```

## Special Considerations

### Research Database Integration

When integrating research features:

1. **Verify Paper Counts**: Ensure 3,721 papers maintained
2. **Test Literature Loading**: Check for infinite loops
3. **Validate API Filters**: Verify real/fake paper filtering
4. **Check Authentication**: Research features with auth

### 3D Model Integration

When integrating 3D features:

1. **Performance Testing**: Test on various devices
2. **Memory Management**: Check for memory leaks
3. **Three.js Compatibility**: Verify version compatibility
4. **Bundle Size Impact**: Monitor JavaScript bundle growth

### Authentication Integration

When integrating auth-related features:

1. **Demo Mode Compatibility**: Ensure demo mode still works
2. **Route Protection**: Verify protected routes
3. **Session Management**: Test session persistence
4. **External Links**: Validate external auth redirects

## Troubleshooting Integration Issues

### Build Failures

```bash
# Clear caches
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Identify problematic imports
npm run lint
```

### Runtime Errors

```bash
# Check error logs
npm run dev 2>&1 | tee dev.log

# Test API endpoints individually
curl -v http://localhost:3003/api/papers
curl -v http://localhost:3003/api/predictions

# Database connectivity
npm run db:studio
```

### Performance Degradation

```bash
# Profile bundle size
npm run analyze

# Check for memory leaks
# Use browser dev tools profiler

# Database query optimization
npm run db:studio
# Examine slow queries
```

## Best Practices

### Development
- Work in appropriate branch for feature type
- Test locally before creating PR
- Keep branches up to date with master
- Use meaningful commit messages

### Integration
- Small, focused PRs are easier to review
- Include comprehensive testing results
- Document breaking changes clearly
- Coordinate database schema changes

### Maintenance
- Regular dependency updates
- Monitor performance metrics
- Keep documentation current
- Archive unused branches

---

For integration support, consult the [development team](mailto:dev@messai.io) or check recent integration examples in the Git history.