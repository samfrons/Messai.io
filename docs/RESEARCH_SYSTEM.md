# Research System Documentation

This document contains detailed guidelines for MESSAi's research literature system.

## CRITICAL: Data Integrity Rules

- **NEVER generate fake research papers or fabricated scientific data**
- **ONLY work with real, verified papers from legitimate sources**
- **Extrapolation allowed ONLY when explicitly requested and clearly marked**
- **ALL papers must have verification (DOI, PubMed ID, arXiv ID, or verified PDF)**

## Research Database Loading Requirements

Always ensure the research database loads reliably by:

### 1. Error Handling
- Wrap all research components with ErrorBoundary
- Implement retry logic for failed API calls
- Show meaningful error messages to users
- Log errors for debugging

### 2. Performance Optimization
- Implement pagination (default: 10-20 papers per page)
- Add loading states for all async operations
- Cache API responses where appropriate
- Use database indexes on frequently queried fields

### 3. Fallback Strategies
- If main API fails, show cached data if available
- Provide offline mode with limited functionality
- Gracefully degrade features rather than crash

### 4. Testing Requirements
- Test with empty database
- Test with large datasets (3,700+ papers)
- Test network failures and timeouts
- Test authentication state changes

## Troubleshooting Research Loading Issues

1. Check database connection: `npm run db:studio`
2. Verify API endpoints: `curl http://localhost:3003/api/papers`
3. Check error logs in browser console
4. Run integrity check: `npm run db:integrity`
5. Clear cache and retry
6. Verify authentication state if papers are missing
7. Check pagination settings if results are limited

## Available Research Scripts

### Enhanced Processing
- `enhanced-ollama-processor.ts` - AI-powered data extraction
- `advanced-pattern-matching.ts` - Regex-based extraction
- `enhanced-data-extractor.ts` - Comprehensive extraction

### Quality Assurance
- `paper-quality-validator.ts` - Quality scoring
- `final-quality-report.ts` - Database analysis
- `database-integrity-check.ts` - Integrity validation

### Data Collection
- `real-paper-collection.ts` - Multi-source collection
- `google-scholar-scraper.ts` - Targeted scraping
- `fetch-comprehensive-bes-papers.ts` - BES-focused collection

## Current Database Status

- **Total Papers**: 3,721 verified research papers
- **AI Processed**: 1,200+ (32%+)
- **With Performance Data**: 850+ (23%+)
- **Sources**: CrossRef API, PubMed API, arXiv API