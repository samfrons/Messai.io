# Development Tasks & Common Operations

This document outlines common development tasks and troubleshooting procedures for MESSAi.

## Common Tasks

### Adding a New System Design
1. Update `app/page.tsx` with design details
2. Add 3D model in `components/DesignSpecific3DModels.tsx`
3. Update prediction multipliers in `lib/ai-predictions.ts`

### Adding Electrode Materials
1. Update `components/MESSConfigPanel.tsx`
2. Add material properties and descriptions
3. Update cost and efficiency ratings

### Modifying Predictions
1. Adjust factors in `lib/ai-predictions.ts`
2. Update API route in `app/api/predictions/route.ts`
3. Add tests for new prediction logic

## Research System Tasks

### Processing Papers
```bash
# Enhanced Ollama processing
npx tsx scripts/research/enhanced-ollama-processor.ts

# Pattern matching extraction
npx tsx scripts/research/advanced-pattern-matching.ts

# Quality validation
npx tsx scripts/research/paper-quality-validator.ts
```

### Database Maintenance
```bash
# Integrity check
npx tsx scripts/research/database-integrity-check.ts

# Generate quality report
npx tsx scripts/research/final-quality-report.ts

# Clean malformed data
npx tsx scripts/research/cleanup-malformed-data.ts
```

### Data Collection
```bash
# Collect new papers
npx tsx scripts/research/real-paper-collection.ts

# Google Scholar scraping
npx tsx scripts/research/google-scholar-scraper.ts

# Comprehensive BES papers
npx tsx scripts/research/fetch-comprehensive-bes-papers.ts
```

## Troubleshooting

### 3D Visualization Issues
- Check WebGL support in browser
- Verify Three.js dependencies
- Monitor console for shader errors
- Test on different devices

### Database Connection Problems
- Verify DATABASE_URL environment variable
- Check Prisma client generation
- Test with `npm run db:studio`
- Validate schema migrations

### API Endpoint Issues
- Check route protection and authentication
- Verify request/response formats
- Test with curl or Postman
- Monitor server logs

### Performance Optimization
- Bundle size analysis: `npm run analyze`
- Database query optimization
- 3D rendering performance
- Image and asset optimization

## Development Environment

### Setup Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run test suite
npm run lint         # Code quality check
npm run format       # Format with Prettier
```

### Database Commands
```bash
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

## Important File Locations

### Core Application
- `app/page.tsx` - Main design catalog
- `components/MFC3DModel.tsx` - Core 3D visualization
- `components/ConditionalLayout.tsx` - Layout system
- `lib/ai-predictions.ts` - Prediction logic

### Research System
- `app/research/` - Research browsing interface
- `app/api/papers/` - Paper API endpoints
- `scripts/research/` - Enhancement pipeline
- `components/ErrorBoundary.tsx` - Error handling

### Tools
- `app/tools/bioreactor/` - Bioreactor design tool
- `app/tools/electroanalytical/` - Electroanalytical tool
- `components/3d/` - 3D visualization components

### Database
- `prisma/schema.prisma` - Database structure
- `prisma/seed.ts` - Database seeding
- Database utilities in `lib/database-utils.ts`