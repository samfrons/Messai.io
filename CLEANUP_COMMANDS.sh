#!/bin/bash

# Script to clean auth code from public branches
# Run these commands from within each worktree directory

echo "🔒 Cleaning Auth Code from Public Branches"
echo "=========================================="
echo ""
echo "Run these commands from the parent Messai directory:"
echo ""

# For 3d-models worktree
echo "# 1. Clean feature/3d-visualization branch:"
echo "cd messai-3d-models"
echo "git rm -rf app/api/auth lib/auth"
echo 'git commit -m "security: Remove auth code from public branch"'
echo "cd .."
echo ""

# For experiments worktree  
echo "# 2. Clean feature/experiments branch:"
echo "cd messai-experiments"
echo "git rm -rf app/api/auth lib/auth"
echo 'git commit -m "security: Remove auth code from public branch"'
echo "cd .."
echo ""

# For literature worktree
echo "# 3. Clean feature/literature-system branch:"
echo "cd messai-literature"
echo "git rm -rf app/api/auth lib/auth"
echo 'git commit -m "security: Remove auth code from public branch"'
echo "cd .."
echo ""

# Push all branches
echo "# 4. Push all cleaned branches:"
echo "cd messai-mvp"
echo "git push origin master"
echo "git push origin feature/3d-visualization"
echo "git push origin feature/experiments"
echo "git push origin feature/literature-system"
echo "git push origin private/auth-system"
echo ""

echo "# 5. Verify no auth code remains in public branches:"
echo 'for branch in master feature/3d-visualization feature/experiments feature/literature-system; do echo "=== $branch ==="; git ls-tree -r $branch --name-only | grep -E "(app/api/auth|lib/auth)" || echo "✅ Clean"; done'