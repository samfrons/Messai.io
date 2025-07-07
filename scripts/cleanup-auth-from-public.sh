#!/bin/bash

# Script to help remove auth-related code from public branches
# WARNING: This modifies git history - backup first!

echo "🔒 Auth Code Cleanup Script"
echo "=========================="
echo ""
echo "This script helps remove authentication code from public branches."
echo "⚠️  WARNING: This will modify git history!"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Function to check branch for auth files
check_branch_for_auth() {
    local branch=$1
    echo "Checking branch: $branch"
    
    git checkout "$branch" 2>/dev/null
    
    # Check for auth-related files
    if [ -d "app/api/auth" ]; then
        echo "  ⚠️  Found app/api/auth/"
    fi
    
    if [ -d "lib/auth" ]; then
        echo "  ⚠️  Found lib/auth/"
    fi
    
    # Check for auth imports in code
    if grep -r "from.*auth" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules; then
        echo "  ⚠️  Found auth imports"
    fi
}

# Function to remove auth files from a branch
remove_auth_from_branch() {
    local branch=$1
    echo "Removing auth code from branch: $branch"
    
    git checkout "$branch"
    
    # Remove auth directories
    if [ -d "app/api/auth" ]; then
        git rm -rf app/api/auth
        echo "  ✅ Removed app/api/auth/"
    fi
    
    if [ -d "lib/auth" ]; then
        git rm -rf lib/auth
        echo "  ✅ Removed lib/auth/"
    fi
    
    # Commit if changes were made
    if ! git diff --cached --quiet; then
        git commit -m "security: Remove authentication code from public branch

Moving authentication implementation to private/auth-system branch
for security. Auth code should not be in public repositories."
        echo "  ✅ Committed removal"
    else
        echo "  ℹ️  No auth files to remove"
    fi
}

# Main menu
echo "What would you like to do?"
echo "1. Check all public branches for auth code"
echo "2. Remove auth code from specific branch"
echo "3. Remove auth code from all public branches"
echo "4. Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Checking public branches..."
        echo ""
        for branch in $(git branch -r | grep -E "feature/|master" | sed 's/origin\///'); do
            check_branch_for_auth "$branch"
        done
        ;;
    
    2)
        echo ""
        read -p "Enter branch name: " branch_name
        remove_auth_from_branch "$branch_name"
        ;;
    
    3)
        echo ""
        echo "⚠️  This will remove auth code from ALL public branches!"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            for branch in $(git branch | grep -E "feature/|master" | sed 's/\*//g' | tr -d ' '); do
                remove_auth_from_branch "$branch"
            done
        else
            echo "Cancelled"
        fi
        ;;
    
    4)
        echo "Exiting..."
        exit 0
        ;;
    
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "Next steps:"
echo "1. Review changes with: git log --oneline -5"
echo "2. Push changes with: git push origin <branch-name>"
echo "3. Consider cleaning git history if needed"