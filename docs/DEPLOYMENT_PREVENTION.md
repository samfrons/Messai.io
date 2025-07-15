# Deployment Error Prevention Guide

This guide documents common deployment issues and how to prevent them.

## Common Deployment Issues

### 1. Missing TypeScript Exports

**Issue**: Build fails with "Module has no exported member"
```
Type error: Module '"@/lib/fuel-cell-predictions"' has no exported member 'FuelCellPredictionInput'.
```

**Prevention**:
- Always export all types and interfaces used in API routes
- Use the pre-deployment check script before deploying
- Keep exports consistent across all library files

**Fixed Example**:
```typescript
// In @/lib/fuel-cell-predictions.ts
export interface FuelCellParameters {
  type: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
  // ... rest of interface
}

// Extended interface for API compatibility
export interface FuelCellPredictionInput extends FuelCellParameters {
  fuelCellType?: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
}
```

**Status**: ✅ **RESOLVED** - Export added successfully

### 2. Missing File Path Issues

**Issue**: ESLint cannot find files during build
```
ESLint: ENOENT: no such file or directory, open '/vercel/path0/apps/web/src/app/api/auth/[...nextauth]/auth'
```

**Prevention**:
- Verify all imported files exist with correct paths
- Use consistent file extensions (.ts for TypeScript files)
- Check that all API routes have proper file structure

**Fixed Example**:
```bash
# Create symlink for ESLint compatibility
cd apps/web/app/api/auth/[...nextauth]
ln -sf auth.ts auth

# Add to .gitignore
echo "apps/web/app/api/auth/[...nextauth]/auth" >> .gitignore
```

**Status**: ✅ **RESOLVED** - Symlink workaround implemented

### 3. Build Configuration Issues

**Issue**: Build fails due to missing configurations or temporary flags
```
ignoreBuildErrors: true // This should be removed for production
```

**Prevention**:
- Remove all temporary build flags before deployment
- Ensure ESLint configuration is properly set up
- Use strict TypeScript checking

## Pre-Deployment Checklist

### Automated Checks

Run the pre-deployment check script before every deployment:

```bash
npm run pre-deploy-check
```

This script automatically verifies:
- ✅ TypeScript imports are valid
- ✅ All exports are properly defined
- ✅ Required files exist at correct paths
- ✅ ESLint configuration is working
- ✅ Build completes successfully

### Manual Verification

Before deploying, manually verify:

1. **Package.json Scripts**
   ```json
   {
     "scripts": {
       "pre-deploy-check": "node scripts/pre-deployment-check.js",
       "build": "nx run-many -t build",
       "type-check": "nx run-many -t type-check"
     }
   }
   ```

2. **Next.js Configuration**
   ```javascript
   // apps/web/next.config.js should NOT have:
   // typescript: { ignoreBuildErrors: true }
   // eslint: { ignoreDuringBuilds: true }
   ```

3. **TypeScript Configuration**
   ```json
   // tsconfig.json should have strict settings
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "noImplicitReturns": true
     }
   }
   ```

## Git Hooks Setup

Add a pre-push hook to prevent deployment issues:

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running pre-deployment checks..."
npm run pre-deploy-check
```

## CI/CD Integration

### GitHub Actions

Add to your deployment workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main, master]

jobs:
  pre-deployment-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run pre-deployment checks
        run: npm run pre-deploy-check
        
  deploy:
    needs: pre-deployment-check
    runs-on: ubuntu-latest
    # ... deployment steps
```

### Vercel Integration

Add to your `vercel.json`:

```json
{
  "buildCommand": "npm run pre-deploy-check && npm run build",
  "framework": "nextjs",
  "installCommand": "npm ci"
}
```

## Troubleshooting Common Issues

### Issue: TypeScript Build Errors

**Symptoms**: Build fails with TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix import paths
npm run type-check
```

### Issue: ESLint Configuration Problems

**Symptoms**: ESLint cannot find files or has configuration errors

**Solution**:
```bash
# Test ESLint configuration
npx eslint --print-config apps/web/app/api/test.ts

# Fix ESLint rules
npm run lint -- --fix
```

### Issue: Missing Dependencies

**Symptoms**: Build fails with missing module errors

**Solution**:
```bash
# Verify all dependencies are installed
npm ci

# Check for missing peer dependencies
npm ls --depth=0
```

## Best Practices

### 1. Export Management
- Always export types used in API routes
- Use barrel exports for better organization
- Keep exports consistent across library files

### 2. File Structure
- Maintain consistent file structure
- Use TypeScript extensions (.ts, .tsx)
- Keep API routes in proper directories

### 3. Build Configuration
- Never use `ignoreBuildErrors: true` in production
- Remove temporary flags before deployment
- Use strict TypeScript settings

### 4. Testing
- Run full build before deployment
- Test TypeScript compilation
- Verify ESLint configuration

## Recovery Procedures

If deployment fails:

1. **Immediate Actions**
   ```bash
   # Revert to last known good commit
   git revert HEAD
   
   # Or fix the specific issue
   npm run pre-deploy-check
   ```

2. **Investigation**
   ```bash
   # Check build logs
   npm run build 2>&1 | grep -i error
   
   # Verify TypeScript
   npx tsc --noEmit
   
   # Check ESLint
   npm run lint
   ```

3. **Prevention**
   ```bash
   # Add pre-push hook
   npx husky add .husky/pre-push "npm run pre-deploy-check"
   ```

## Monitoring

### Build Success Metrics
- Track build success rate
- Monitor deployment time
- Alert on repeated failures

### Key Indicators
- TypeScript compilation success
- ESLint pass rate
- Build time trends
- Deployment success rate

---

*This guide should be updated whenever new deployment issues are discovered and resolved.*