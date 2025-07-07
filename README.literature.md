# MESSAi Literature System

A dedicated workspace for developing and testing the literature management and AI analysis features of MESSAi.

## Quick Start

### Setup Literature Worktree

```bash
# From main repo directory
git worktree add ../messai-literature feature/literature-system

# Switch to literature worktree
cd ../messai-literature

# Copy literature-specific configuration
cp package.literature.json package.json
cp next.config.literature.js next.config.js
cp .env.literature.example .env.local

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start literature development server
npm run dev:lit
```

### Development

```bash
# Literature system runs on port 3004
npm run dev:lit

# AI processing
npm run ai:process -- --batch 10

# Database operations
npm run db:integrity
npm run literature:enhance-all

# Testing
npm run test:literature
```

## Features

### ✨ AI-Powered Analysis
- **Smart Summaries**: Automatic paper summarization using OpenRouter
- **Key Findings**: Extraction of critical research results
- **Research Insights**: AI-generated implications and applications
- **Confidence Scoring**: Quality indicators for AI analysis

### 📊 Data Management
- **Real Paper Verification**: DOI, PubMed, arXiv validation
- **Quality Scoring**: Multi-dimensional paper assessment
- **Broken Link Detection**: Automated URL validation
- **Duplicate Detection**: Smart deduplication algorithms

### 🔍 Advanced Search
- **Semantic Search**: AI-powered paper discovery
- **Faceted Filtering**: Filter by materials, organisms, metrics
- **Citation Networks**: Visual relationship mapping
- **Cross-referencing**: Intelligent paper connections

### 🛠️ Enhancement Pipeline
- **Fake Paper Cleanup**: Remove AI-generated content
- **Metadata Enrichment**: Fetch complete paper information
- **Performance Extraction**: Automated data extraction
- **Content Enhancement**: Full-text analysis when available

## Architecture

### Shared Resources
- **Database**: Same SQLite database as main app
- **Prisma Schema**: Synchronized via git
- **API Routes**: Shared backend functionality
- **Components**: Core UI components

### Literature-Specific
- **Port**: Runs on 3004 (main app on 3003)
- **Configuration**: Literature-optimized Next.js config
- **Scripts**: Specialized literature processing tools
- **Environment**: Literature-focused settings

## Development Workflow

### Parallel Development
```bash
# Terminal 1: Main app
cd /path/to/messai-mvp
npm run dev  # Port 3003

# Terminal 2: Literature
cd /path/to/messai-literature  
npm run dev:lit  # Port 3004

# Both share the same database
```

### Synchronization
```bash
# In literature worktree
git merge master  # Pull latest changes
git push origin feature/literature-system  # Push literature changes

# In main repo
git merge feature/literature-system  # Integrate literature features
```

## AI Processing

### Setup
1. Get OpenRouter API key: https://openrouter.ai/keys
2. Add to `.env.local`: `OPENROUTER_API_KEY="your-key"`
3. Process papers: `npm run ai:process`

### Models Supported
- `openai/gpt-4-turbo` (default)
- `anthropic/claude-3-opus`
- `openai/gpt-3.5-turbo`
- Any OpenRouter model

### Processing Commands
```bash
# Process 10 papers (default)
npm run ai:process

# Process specific amount
npm run ai:process -- --batch 25

# Process single paper
npm run ai:process -- --paper paper-id

# Show statistics
npm run ai:process -- --stats
```

## Database Integration

### Shared Database Approach
Both main app and literature worktree use the same database:
- **File**: `./prisma/dev.db` (SQLite)
- **Schema**: Synchronized via git merges
- **Migrations**: Applied from either worktree

### Benefits
- ✅ Real-time data sharing
- ✅ No synchronization needed
- ✅ Consistent data state
- ✅ Single source of truth

## Testing

### Literature-Specific Tests
```bash
# Run literature tests
npm run test:literature

# Watch mode
npm run test:literature:watch

# Integration tests
npm test -- tests/literature/
```

### AI Processing Tests
```bash
# Test AI processor
npm run ai:process -- --paper test-paper-id

# Validate processing
npm run db:integrity
```

## Deployment

### Separate Deployment
The literature system can be deployed independently:

```bash
# Build literature app
npm run build:lit

# Deploy to separate subdomain
# literature.messai.io
```

### Integrated Deployment
Or integrated into main app:
```bash
# Merge to master
git checkout master
git merge feature/literature-system

# Deploy together
npm run build
```

## Troubleshooting

### Common Issues

**Port conflicts**:
- Literature: `http://localhost:3004`
- Main app: `http://localhost:3003`

**Database locked**:
- Only one process can write to SQLite at a time
- Stop other processes if needed

**Missing AI fields**:
- Run: `npx prisma generate`
- Restart development server

**OpenRouter API errors**:
- Check API key in `.env.local`
- Verify rate limits
- Check model availability

### Getting Help

1. Check logs in both terminals
2. Verify database connectivity: `npm run db:studio`
3. Test API endpoints: `curl http://localhost:3004/api/papers`
4. Validate environment: `npm run type-check`

---

**Happy Literature Development! 📚✨**