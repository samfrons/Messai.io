#!/bin/bash

# MESSAi Literature Worktree Setup Script
# This script updates the literature worktree with the latest AI features

set -e

echo "🔧 MESSAi Literature Worktree Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MAIN_REPO=$(pwd)
LITERATURE_PATH="../messai-literature"

# Check if we're in the main repo
if [[ ! -f "package.json" ]] || ! grep -q "messai-mvp" package.json 2>/dev/null; then
    echo -e "${RED}❌ Error: Please run this script from the main messai-mvp directory${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Main repo: ${MAIN_REPO}${NC}"
echo -e "${BLUE}📍 Literature worktree: ${LITERATURE_PATH}${NC}"

# Check if literature worktree exists
if [[ ! -d "$LITERATURE_PATH" ]]; then
    echo -e "${YELLOW}⚠️  Literature worktree not found. Creating...${NC}"
    git worktree add "$LITERATURE_PATH" feature/literature-system
    echo -e "${GREEN}✅ Created literature worktree${NC}"
else
    echo -e "${GREEN}✅ Literature worktree exists${NC}"
fi

# Function to copy file if it exists
copy_if_exists() {
    local source="$1"
    local dest="$2"
    if [[ -f "$source" ]]; then
        cp "$source" "$dest"
        echo -e "${GREEN}✅ Copied $(basename "$source")${NC}"
    else
        echo -e "${YELLOW}⚠️  ${source} not found, skipping${NC}"
    fi
}

# Switch to literature directory for operations
cd "$LITERATURE_PATH"

echo ""
echo -e "${BLUE}📦 Updating literature worktree configuration...${NC}"

# Copy literature-specific configuration files
copy_if_exists "$MAIN_REPO/package.literature.json" "package.json"
copy_if_exists "$MAIN_REPO/next.config.literature.js" "next.config.js"
copy_if_exists "$MAIN_REPO/.env.literature.example" ".env.example"

# Copy .env.local if it doesn't exist
if [[ ! -f ".env.local" ]] && [[ -f "$MAIN_REPO/.env.local" ]]; then
    cp "$MAIN_REPO/.env.local" ".env.local"
    echo -e "${GREEN}✅ Copied .env.local${NC}"
    echo -e "${YELLOW}⚠️  Don't forget to update NEXTAUTH_URL to http://localhost:3004${NC}"
else
    echo -e "${BLUE}ℹ️  .env.local already exists or not found in main repo${NC}"
fi

# Merge latest changes from master
echo ""
echo -e "${BLUE}🔄 Merging latest changes from master...${NC}"
git merge master --no-edit || {
    echo -e "${RED}❌ Merge conflicts detected!${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually and run:${NC}"
    echo "  git add ."
    echo "  git commit -m 'Resolve merge conflicts'"
    echo ""
    echo "Then re-run this script."
    exit 1
}

# Install/update dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo ""
echo -e "${BLUE}🗄️  Generating Prisma client...${NC}"
npx prisma generate

# Update .env.local with correct port
if [[ -f ".env.local" ]]; then
    echo ""
    echo -e "${BLUE}⚙️  Updating .env.local for literature system...${NC}"
    
    # Update NEXTAUTH_URL to use port 3004
    if grep -q "NEXTAUTH_URL" .env.local; then
        sed -i.bak 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="http://localhost:3004"|' .env.local
        echo -e "${GREEN}✅ Updated NEXTAUTH_URL to port 3004${NC}"
    else
        echo 'NEXTAUTH_URL="http://localhost:3004"' >> .env.local
        echo -e "${GREEN}✅ Added NEXTAUTH_URL for port 3004${NC}"
    fi
    
    # Add literature mode if not present
    if ! grep -q "LITERATURE_MODE" .env.local; then
        echo "" >> .env.local
        echo "# Literature System" >> .env.local
        echo 'LITERATURE_MODE="true"' >> .env.local
        echo 'NEXT_PUBLIC_LITERATURE_MODE="true"' >> .env.local
        echo -e "${GREEN}✅ Added literature mode flags${NC}"
    fi
fi

# Create literature-specific scripts directory if needed
if [[ ! -d "scripts/literature" ]]; then
    echo -e "${BLUE}📁 Creating scripts/literature directory...${NC}"
    mkdir -p scripts/literature
fi

# Check if AI processor exists
if [[ -f "scripts/literature/ai-paper-processor.ts" ]]; then
    echo -e "${GREEN}✅ AI paper processor available${NC}"
else
    echo -e "${YELLOW}⚠️  AI paper processor not found${NC}"
fi

# Test if the setup works
echo ""
echo -e "${BLUE}🧪 Testing setup...${NC}"

# Check if next.config.js is valid
if node -c next.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ next.config.js is valid${NC}"
else
    echo -e "${RED}❌ next.config.js has syntax errors${NC}"
fi

# Check if package.json is valid
if npm run --silent 2>/dev/null | grep -q "dev:lit"; then
    echo -e "${GREEN}✅ Literature scripts available${NC}"
else
    echo -e "${YELLOW}⚠️  Literature scripts not found in package.json${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Literature worktree setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start the literature development server:"
echo -e "   ${YELLOW}npm run dev:lit${NC}"
echo ""
echo "2. Open in browser:"
echo -e "   ${YELLOW}http://localhost:3004/literature${NC}"
echo ""
echo "3. Process papers with AI:"
echo -e "   ${YELLOW}npm run ai:process -- --batch 5${NC}"
echo ""
echo "4. Check database integrity:"
echo -e "   ${YELLOW}npm run db:integrity${NC}"
echo ""
echo -e "${BLUE}📚 Read README.literature.md for more details${NC}"

# Return to main repo directory
cd "$MAIN_REPO"