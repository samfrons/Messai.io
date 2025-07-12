# Private Branch Workflow Guide

## Overview

MESSAi uses a dual-branch strategy to separate public and private code:
- **Public branches** (`feature/*`): Open source features
- **Private branches** (`private/*`): Security-sensitive code

## Branch Structure

```
Public Branches:
├── master                      # Main development
├── feature/3d-visualization    # 3D components
├── feature/experiments         # Experiment tracking
└── feature/literature-system   # Literature database

Private Branches (restricted access):
├── private/auth-system         # Authentication implementation
├── private/marketing-site      # Marketing content
├── private/admin-dashboard     # Admin features (future)
└── private/billing             # Payment processing (future)
```

## Creating Private Worktrees

### 1. Create Private Branch
```bash
# From main repository
git checkout -b private/feature-name
```

### 2. Create Worktree
```bash
# Create worktree for private development
git worktree add ../messai-feature-name private/feature-name
```

### 3. Security Checklist
- [ ] Never include API keys in code
- [ ] Use environment variables for secrets
- [ ] Keep authentication logic private
- [ ] Review before pushing

## Working with Private Branches

### Development Flow
1. **Create feature** in private worktree
2. **Test locally** with production-like config
3. **Security review** before commits
4. **Push to private branch** only

### Merging Private Features
```bash
# Merge private features carefully
git checkout master
git merge private/feature-name --no-ff

# Review for exposed secrets
git diff HEAD~1
```

## Security Best Practices

### 1. Environment Variables
```typescript
// ❌ Bad - Never hardcode
const CLIENT_ID = "485735910523-xxx"

// ✅ Good - Use environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
```

### 2. Separate Interfaces
```typescript
// In public code: lib/auth-interface.ts
export interface AuthProvider {
  signIn(credentials: Credentials): Promise<User>
  signOut(): Promise<void>
}

// In private code: Implementation details
```

### 3. Git Configuration
```bash
# Set up pre-commit hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Check for secrets
if git diff --cached | grep -E "(api_key|secret|password)" ; then
  echo "⚠️  Possible secret detected!"
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

## Private Branch Guidelines

### What Goes in Private Branches

✅ **SHOULD be private:**
- Authentication implementation
- OAuth configuration
- Payment processing
- Admin dashboards
- User PII handling
- API key management
- Security algorithms
- Rate limiting logic

❌ **SHOULD be public:**
- UI components
- Public features
- Documentation
- Tests (without secrets)
- Type definitions
- Public APIs
- Utilities

## Emergency Procedures

### If Secrets Are Exposed

1. **Immediately rotate credentials**
2. **Document in SECURITY_ALERT.md**
3. **Clean git history if needed**
4. **Notify team members**

### Cleaning Git History
```bash
# ⚠️  DANGEROUS - Backup first!
# Remove file from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret-file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team)
git push origin --force --all
```

## Team Access Control

### GitHub Settings
1. Go to Settings > Branches
2. Add branch protection rule for `private/*`
3. Restrict push access to authorized team
4. Require code reviews

### Local Development
```bash
# Clone with specific branch
git clone -b private/auth-system https://github.com/user/repo.git

# Fetch private branches
git fetch origin 'refs/heads/private/*:refs/remotes/origin/private/*'
```

## Deployment Considerations

### Vercel Deployment
- Private branches can deploy to preview URLs
- Use Vercel environment variables
- Enable authentication on preview deployments
- Restrict access with passwords

### Environment Configuration
```javascript
// vercel.json
{
  "env": {
    "PRIVATE_DEPLOYMENT": "@private-deployment"
  },
  "build": {
    "env": {
      "INCLUDE_PRIVATE_FEATURES": "true"
    }
  }
}
```

## Monitoring & Auditing

### Regular Security Audits
```bash
# Check for exposed secrets
git log --all --full-history -- "*secret*" "*key*" "*password*"

# List files in private branches
git ls-tree -r private/auth-system --name-only

# Audit branch access
git log --oneline --graph private/*
```

### Automated Scanning
- Enable GitHub secret scanning
- Use pre-commit hooks
- Regular credential rotation
- Monitor access logs

## FAQ

**Q: Can I merge private branches to master?**
A: Yes, but review carefully for secrets first.

**Q: How do I share private code with team?**
A: Team members need repository access and must fetch private branches.

**Q: What if I accidentally commit secrets?**
A: Follow emergency procedures immediately - rotate and clean.

**Q: Can private branches be deployed?**
A: Yes, use preview deployments with access restrictions.

## Summary

Private branches provide security isolation while maintaining development flexibility. Always:
- 🔒 Keep secrets in environment variables
- 🔍 Review before pushing
- 🔄 Rotate credentials regularly
- 📝 Document security decisions