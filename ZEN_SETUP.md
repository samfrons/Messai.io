# Zen MCP Server Setup Guide for MESSAi

## Installation Complete! ✅

I've installed and configured the Zen MCP Server integration for you. Here's what was set up:

### 1. Package Installation
- ✅ Installed `zen-mcp-server-199bio` (NPX wrapper for Zen MCP Server)
- ✅ Updated package.json scripts

### 2. Environment Variables
Added to your `.env.local`:
```env
# Zen MCP Server Configuration
ZEN_MCP_ENDPOINT="http://localhost:3001"
ZEN_MCP_API_KEY=""
NODE_ENV="production"  # Required to enable Zen features
```

### 3. Available Commands

#### Start Zen MCP Server
```bash
# Option 1: Use npm script
npm run zen:start

# Option 2: Use the shell script
./scripts/start-zen-server.sh

# Option 3: Direct npx command
npx zen-mcp-server-199bio
```

#### Paper Discovery
```bash
# Discover papers with default queries
npm run zen:discover

# Dry run (preview without saving)
npm run zen:discover -- --dry-run

# Search specific topic
npm run zen:discover -- --query "MXene electrode" --limit 10
```

#### Link Validation
```bash
# Validate links in database
npm run zen:validate

# Auto-fix broken links
npm run zen:validate -- --fix

# Validate specific batch
npm run zen:validate -- --max 50 --batch-size 5
```

#### Quality Checks
```bash
# Check paper quality
npm run zen:quality

# Update metadata from sources
npm run zen:quality -- --update

# Include citation analysis
npm run zen:quality -- --citations
```

## Quick Start

1. **Start the Zen MCP Server** (in a separate terminal):
   ```bash
   npm run zen:start
   ```
   
   **Note**: The Zen MCP Server has been configured with your OpenRouter API key. The configuration is stored in `~/.zen-mcp-server/.env`.
   
2. **Verify it's running** by visiting: http://localhost:3001

3. **Test paper discovery**:
   ```bash
   npm run zen:discover -- --dry-run --limit 3
   ```

## Important Notes

### Demo Mode
- Zen features are **disabled in demo mode**
- Your `.env.local` has `DEMO_MODE="false"` and `NODE_ENV="production"`
- This enables all Zen features

### Automation User
The scripts will automatically create an automation user (`automation@messai.io`) when needed. This is just an internal database user to track which papers were added by automated processes - it doesn't need to be a real email address.

### Rate Limiting
- The integration includes automatic rate limiting (30 requests/minute)
- Scripts have built-in delays between requests
- API endpoints return 429 status when rate limited

## Troubleshooting

### "Cannot run in demo mode" error
- Ensure `DEMO_MODE="false"` in `.env.local`
- Ensure `NODE_ENV="production"` in `.env.local`
- Restart your Next.js dev server

### "System user not found" error
- The script will automatically create the automation user
- If issues persist, check database connectivity

### Connection refused errors
- Make sure Zen MCP Server is running (`npm run zen:start`)
- Check it's accessible at http://localhost:3001
- Verify no firewall blocking port 3001

### Docker issues (if using Docker version)
- Ensure Docker Desktop is running
- Check Docker daemon is accessible
- Try restarting Docker

## UI Components

The integration includes React components you can use:

1. **Link Validator** - Add to paper detail pages
2. **Paper Discovery** - Add to literature section
3. **Citation Network** - Visualize paper relationships
4. **Bulk Link Validator** - Validate multiple papers

Example usage in your pages:
```jsx
import { PaperDiscovery } from '@/components/literature/PaperDiscovery'
import { LinkValidator } from '@/components/literature/LinkValidator'

// In your component
<PaperDiscovery />
<LinkValidator url={paperUrl} />
```

## Next Steps

1. Start the Zen MCP Server
2. Run a test discovery: `npm run zen:discover -- --dry-run`
3. Validate existing links: `npm run zen:validate`
4. Add UI components to your pages
5. Set up scheduled tasks for automated discovery

## Security

- All Zen features require authentication
- API keys are server-side only
- Rate limiting prevents abuse
- Input validation on all endpoints

Enjoy using the Zen MCP Server integration! 🚀