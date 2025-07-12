# Zen MCP Server Integration Guide

This guide explains how to use the Zen MCP Server integration in MESSAi for browser automation, web scraping, and research discovery.

## Overview

The Zen MCP Server integration provides:
- 🔍 **Automated Paper Discovery** - Search and extract papers from CrossRef, arXiv, and PubMed
- ✅ **Link Validation** - Verify external links in real-time
- 📊 **Quality Checks** - Validate paper metadata accuracy
- 🔗 **Citation Verification** - Extract and verify citation networks

## Prerequisites

1. Install Zen MCP Server: https://github.com/BeehiveInnovations/zen-mcp-server
2. Set up environment variables:
   ```bash
   ZEN_MCP_ENDPOINT=http://localhost:3001
   ZEN_MCP_API_KEY=your-api-key
   ```
3. Ensure `NODE_ENV=production` (features disabled in demo mode)

## Features

### 1. Paper Discovery Scripts

Discover new papers from research databases:

```bash
# Discover papers with default queries
npm run zen:discover

# Dry run to preview results
npm run zen:discover -- --dry-run

# Search specific query
npm run zen:discover -- --query "MXene electrode" --limit 10

# Search specific source
npm run zen:discover -- --source arxiv --limit 3
```

### 2. Link Validation

Validate external links in the database:

```bash
# Validate links
npm run zen:validate

# Auto-fix broken links
npm run zen:validate -- --fix

# Validate specific batch size
npm run zen:validate -- --max 50 --batch-size 5

# Validate papers from specific source
npm run zen:validate -- --source crossref_api --fix
```

### 3. Quality Checks

Perform comprehensive quality checks:

```bash
# Basic quality check
npm run zen:quality

# Update metadata with extracted data
npm run zen:quality -- --update

# Check with citation analysis
npm run zen:quality -- --citations

# Check specific sample size
npm run zen:quality -- --sample 50 --update
```

## API Endpoints

### Link Validation
```javascript
POST /api/papers/validate-link
{
  "url": "https://doi.org/10.1234/example"
}
```

### Paper Extraction
```javascript
POST /api/papers/extract
{
  "url": "https://arxiv.org/abs/2401.00000",
  "save": true  // Optional: save to database
}
```

### Paper Discovery
```javascript
POST /api/papers/discover
{
  "query": "microbial fuel cell optimization",
  "sources": ["crossref", "arxiv", "pubmed"],
  "limit": 5
}
```

### Citation Verification
```javascript
POST /api/papers/{paperId}/citations/verify
```

## React Components

### LinkValidator Component
```jsx
import { LinkValidator } from '@/components/literature/LinkValidator'

<LinkValidator 
  url="https://doi.org/10.1234/example"
  onValidated={(isValid) => console.log('Valid:', isValid)}
/>
```

### BulkLinkValidator Component
```jsx
import { BulkLinkValidator } from '@/components/literature/LinkValidator'

<BulkLinkValidator 
  papers={papers}
  onComplete={(results) => console.log('Results:', results)}
/>
```

### PaperDiscovery Component
```jsx
import { PaperDiscovery } from '@/components/literature/PaperDiscovery'

<PaperDiscovery />
```

### CitationNetwork Component
```jsx
import { CitationNetwork } from '@/components/literature/CitationNetwork'

<CitationNetwork 
  paperId="paper-id-123"
  depth={2}
/>
```

## Rate Limiting

The integration includes built-in rate limiting:
- **30 requests per minute** per endpoint
- **Automatic retry** with exponential backoff
- **Queue management** for bulk operations

## Error Handling

Common errors and solutions:

1. **Rate Limit Exceeded**
   - Wait for the rate limit window to reset
   - Reduce batch sizes or add delays

2. **Demo Mode Error**
   - Set `NODE_ENV=production`
   - Ensure `DEMO_MODE=false`

3. **Connection Failed**
   - Check Zen MCP Server is running
   - Verify endpoint URL and API key

## Best Practices

1. **Use Batch Operations**
   - Process papers in batches to avoid rate limits
   - Use built-in queue management

2. **Monitor Quality Scores**
   - Regularly run quality checks
   - Update metadata when improvements found

3. **Verify Critical Links**
   - Run link validation before deployments
   - Fix broken links promptly

4. **Build Citation Networks**
   - Use citation verification to enhance connections
   - Visualize networks for research insights

## Troubleshooting

### Zen features not working?
1. Check demo mode is disabled
2. Verify Zen MCP Server is running
3. Check environment variables
4. Review browser console for errors

### Scripts failing?
1. The automation user will be created automatically
2. Check network connectivity
3. Verify API credentials
4. Check rate limit status

### Performance issues?
1. Reduce batch sizes
2. Increase delays between requests
3. Run during off-peak hours
4. Use selective filters (source, date range)

## Security Considerations

- API keys are never exposed to client
- All requests authenticated via NextAuth
- Demo mode completely disables browser automation
- Rate limiting prevents abuse
- Input validation on all endpoints

## Future Enhancements

Planned improvements:
- Parallel processing for faster discovery
- Machine learning for better extraction
- Advanced citation graph algorithms
- Integration with more research databases
- Real-time monitoring dashboard