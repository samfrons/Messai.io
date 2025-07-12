# Context Findings - Research Literature Database

## Codebase Analysis Summary

### 1. Database Architecture
- **ORM**: Prisma with SQLite (dev) / PostgreSQL (prod)
- **Pattern**: Uses CUID for IDs, timestamps, proper indexing
- **Relationships**: Well-defined with cascade deletes
- **Files**: `prisma/schema.prisma`, `lib/db.ts`

### 2. Existing Models to Integrate With
- **User Model**: Has experiments, profile, settings
- **Experiment Model**: Has measurements, linked to MFCDesign and User
- **Pattern**: Many-to-many relationships use junction tables

### 3. API Route Patterns
- **Location**: `app/api/*/route.ts`
- **Structure**: Separate GET/POST/PUT/DELETE functions
- **Error Handling**: Consistent try-catch with status codes
- **Response Format**: NextResponse.json()
- **Examples**: `/api/predictions`, `/api/user`, `/api/auth/*`

### 4. Authentication & Authorization
- **Auth**: NextAuth with multiple providers (Google, Email)
- **Middleware**: Protected routes in `middleware.ts`
- **User Context**: Available via `getServerSession()`
- **Files**: `lib/auth/auth-options.ts`, `app/api/auth/[...nextauth]/route.ts`

### 5. UI Component Patterns
- **Design System**: LCARS theme (Star Trek inspired)
- **Components**: Modular with TypeScript interfaces
- **State Management**: React hooks, some Zustand usage
- **Examples**: `MFCDesignCard`, `LCARSPanel`, `ParameterForm`

### 6. File Structure Patterns
```
app/
├── literature/           # New feature pages
│   ├── page.tsx         # Main literature search page
│   ├── [id]/page.tsx    # Individual paper view
│   └── upload/page.tsx  # Upload interface
├── api/
│   ├── papers/          # Literature API endpoints
│   └── integrations/    # External API integrations
components/
├── literature/          # Literature-specific components
│   ├── PaperCard.tsx
│   ├── SearchBar.tsx
│   └── CitationList.tsx
lib/
├── literature/          # Business logic
│   ├── api-clients.ts   # External API integrations
│   └── validators.ts    # Data validation
```

### 7. External Integration Considerations
- **Pattern**: Fetch API with error handling
- **Config**: Environment variables for API keys
- **Rate Limiting**: RateLimit model exists in schema
- **Examples**: `examples/api-usage.js` shows API patterns

### 8. Search Implementation Options
- **Database**: Prisma text search capabilities
- **Full-text**: PostgreSQL text search when in production
- **Client-side**: Filter arrays for simple searches
- **External**: Leverage external API search endpoints

### 9. Similar Features to Reference
- **Algal Fuel Cell Database**: `components/algal-fuel-cell/AlgalFuelCellDatabase.ts`
  - Static data structure for scientific information
  - Could adapt pattern for literature metadata
- **Experiment Tracking**: Full CRUD with relationships
  - Similar pattern for paper management

### 10. Missing Patterns (Need to Implement)
- File upload handling (for PDF metadata extraction)
- Batch import functionality
- Advanced search with filters
- Citation formatting utilities
- Periodic sync jobs for external databases

## Technical Constraints
1. **Storage**: No local PDF storage (metadata only)
2. **Performance**: Need efficient search indexing
3. **Scale**: Must handle thousands of papers
4. **Integration**: Must work with existing auth system
5. **UI**: Must follow LCARS design theme

## Implementation Priority
1. Database schema and migrations
2. Basic CRUD API for papers
3. Search functionality
4. External API integrations (PubMed, CrossRef)
5. UI components
6. Experiment linking features
7. Batch import/sync features