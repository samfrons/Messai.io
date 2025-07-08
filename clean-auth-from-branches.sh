#!/bin/bash

# Script to clean auth code from public feature branches
# This script will remove auth-related files from each public branch

set -e  # Exit on error

echo "🔒 Starting auth code cleanup from public branches..."
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Current directory
CURRENT_DIR=$(pwd)

# Function to clean auth from a branch
clean_branch() {
    local branch=$1
    local worktree_path=$2
    
    echo -e "${YELLOW}Cleaning branch: $branch${NC}"
    echo "Worktree path: $worktree_path"
    
    # Check if worktree exists
    if [ ! -d "$worktree_path" ]; then
        echo -e "${RED}Error: Worktree not found at $worktree_path${NC}"
        return 1
    fi
    
    # Change to worktree directory
    cd "$worktree_path"
    
    # Check current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "$branch" ]; then
        echo -e "${RED}Error: Expected branch $branch but found $current_branch${NC}"
        cd "$CURRENT_DIR"
        return 1
    fi
    
    # Check if auth directories exist
    auth_exists=false
    if [ -d "app/api/auth" ] || [ -d "lib/auth" ]; then
        auth_exists=true
    fi
    
    if [ "$auth_exists" = true ]; then
        echo "Found auth directories to remove..."
        
        # Remove auth directories
        if [ -d "app/api/auth" ]; then
            git rm -rf app/api/auth
            echo "✓ Removed app/api/auth"
        fi
        
        if [ -d "lib/auth" ]; then
            git rm -rf lib/auth
            echo "✓ Removed lib/auth"
        fi
        
        # Commit the changes
        git commit -m "security: Remove auth code from public branch

This commit removes all authentication-related code from the public
$branch branch. Auth code has been moved to the private/auth-system
branch for security reasons."
        
        echo -e "${GREEN}✓ Auth code removed and committed${NC}"
    else
        echo -e "${GREEN}✓ No auth code found (already clean)${NC}"
    fi
    
    # Return to original directory
    cd "$CURRENT_DIR"
    echo ""
}

# Main execution
echo "Starting cleanup process..."
echo ""

# Clean feature/3d-visualization
clean_branch "feature/3d-visualization" "/Users/samfrons/Desktop/Messai/messai-3d-models"

# Clean feature/experiments
clean_branch "feature/experiments" "/Users/samfrons/Desktop/Messai/messai-experiments"

# Clean feature/literature-system
clean_branch "feature/literature-system" "/Users/samfrons/Desktop/Messai/messai-literature"

echo "=================================================="
echo -e "${GREEN}Cleanup process completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes in each worktree"
echo "2. Push all cleaned branches:"
echo ""
echo "   git push origin feature/3d-visualization"
echo "   git push origin feature/experiments"
echo "   git push origin feature/literature-system"
echo ""
echo "3. Update Vercel environment variables with new OAuth credentials"
echo "4. Test authentication flow"