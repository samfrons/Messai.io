# Requirements Specification - Research Literature Database

## Problem Statement

MESSAi users need access to scientific literature related to microbial electrochemical systems to support their research and experiments. Currently, there's no integrated way to search, manage, and cite relevant papers within the platform. Researchers must use external tools and manually track references, creating friction in their workflow.

## Solution Overview

Implement a comprehensive research literature database that allows users to:
1. Search and browse scientific papers from multiple sources
2. Upload and manage their own research papers
3. Link papers to experiments for proper citation
4. Search using MES-specific metadata fields
5. Access cached results for improved performance

## Functional Requirements

### 1. Paper Management
- **FR1.1**: Users can upload paper metadata (title, authors, abstract, DOI, etc.)
- **FR1.2**: Users can manage their uploaded papers (edit, delete)
- **FR1.3**: System stores paper metadata and external links (not PDFs)
- **FR1.4**: Each paper has a unique detail page at `/app/literature/[id]`

### 2. Search Functionality
- **FR2.1**: Full-text search across title, abstract, authors, and keywords
- **FR2.2**: Advanced search with filters (date range, journal, MES-specific fields)
- **FR2.3**: Search results show relevance ranking
- **FR2.4**: Search includes both local and external database results

### 3. External Integration
- **FR3.1**: Integration with PubMed API for biomedical literature
- **FR3.2**: Integration with CrossRef API for DOI resolution
- **FR3.3**: Integration with IEEE Xplore for engineering papers
- **FR3.4**: Cached storage of external search results

### 4. MES-Specific Features
- **FR4.1**: Papers can be tagged with organism types (from existing database)
- **FR4.2**: Papers can be tagged with electrode materials
- **FR4.3**: Papers can include power output and efficiency metrics
- **FR4.4**: Filter search by MES-specific parameters

### 5. Experiment Integration
- **FR5.1**: Users can link papers to their experiments
- **FR5.2**: Experiments show cited papers
- **FR5.3**: Papers show which experiments cite them
- **FR5.4**: Bulk citation management for experiments

### 6. User Interface
- **FR6.1**: Main literature page at `/app/literature`
- **FR6.2**: Upload interface at `/app/literature/upload`
- **FR6.3**: Search bar with instant results
- **FR6.4**: Paper cards following MFCDesignCard pattern
- **FR6.5**: LCARS-themed UI components

## Technical Requirements

### 1. Database Schema

```prisma
model ResearchPaper {
  id                String      @id @default(cuid())
  title             String
  authors           String      // JSON array
  abstract          String?
  doi               String?     @unique
  pubmedId          String?     @unique
  arxivId           String?     @unique
  ieeeId            String?     @unique
  publicationDate   DateTime?
  journal           String?
  volume            String?
  issue             String?
  pages             String?
  keywords          String      // JSON array
  externalUrl       String
  
  // MES-specific fields
  organismTypes     String?     // JSON array of organism IDs
  anodeMaterials    String?     // JSON array
  cathodeMaterials  String?     // JSON array
  powerOutput       Float?      // mW/m²
  efficiency        Float?      // percentage
  systemType        String?     // MFC, MEC, MDC, MES
  
  // Metadata
  source            String      // 'user', 'pubmed', 'crossref', 'ieee'
  uploadedBy        String
  isPublic          Boolean     @default(true)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  user              User        @relation(fields: [uploadedBy], references: [id])
  experiments       ExperimentPaper[]
  
  @@index([title])
  @@index([uploadedBy])
  @@index([publicationDate])
  @@fulltext([title, abstract, keywords])
}

model ExperimentPaper {
  id           String        @id @default(cuid())
  experimentId String
  paperId      String
  notes        String?
  citationType String?       // 'background', 'method', 'comparison'
  createdAt    DateTime      @default(now())
  
  experiment   Experiment    @relation(fields: [experimentId], references: [id])
  paper        ResearchPaper @relation(fields: [paperId], references: [id])
  
  @@unique([experimentId, paperId])
  @@index([experimentId])
  @@index([paperId])
}
```

### 2. API Endpoints

```typescript
// Paper CRUD
GET    /api/papers              // List papers with pagination
GET    /api/papers/[id]         // Get paper details
POST   /api/papers              // Create paper
PUT    /api/papers/[id]         // Update paper
DELETE /api/papers/[id]         // Delete paper

// Search
GET    /api/papers/search       // Search with query params
POST   /api/papers/search/external // Search external databases

// Upload & Import
POST   /api/papers/upload       // Upload paper metadata
POST   /api/papers/import/doi   // Import by DOI
POST   /api/papers/import/pubmed // Import by PubMed ID

// Experiment Integration
GET    /api/experiments/[id]/papers // Get papers for experiment
POST   /api/experiments/[id]/papers // Link paper to experiment
DELETE /api/experiments/[id]/papers/[paperId] // Unlink paper
```

### 3. External API Integration

Create `lib/literature/api-clients.ts`:
```typescript
interface ExternalAPIClient {
  search(query: string, options?: SearchOptions): Promise<Paper[]>
  fetchByIdentifier(id: string): Promise<Paper | null>
}

class PubMedClient implements ExternalAPIClient
class CrossRefClient implements ExternalAPIClient  
class IEEEXploreClient implements ExternalAPIClient
```

### 4. UI Components

New components in `components/literature/`:
- `PaperCard.tsx` - Display paper summary
- `PaperSearch.tsx` - Search interface
- `PaperUploadForm.tsx` - Metadata upload
- `CitationManager.tsx` - Link papers to experiments
- `PaperFilters.tsx` - Advanced search filters

### 5. Search Implementation

- Use PostgreSQL full-text search in production
- Implement search ranking algorithm
- Cache frequent searches
- Batch external API requests

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. Database schema and migrations
2. Basic CRUD API endpoints
3. Authentication integration
4. Simple UI pages

### Phase 2: Search & External APIs (Week 2)
1. Search functionality
2. PubMed integration
3. CrossRef integration
4. Result caching

### Phase 3: MES Features (Week 3)
1. MES-specific metadata fields
2. Organism/material tagging
3. Advanced filters
4. Experiment linking

### Phase 4: Polish & Testing (Week 4)
1. UI refinements
2. Performance optimization
3. Comprehensive testing
4. Documentation

## Acceptance Criteria

1. **Search Performance**: Results return within 2 seconds
2. **External Integration**: Successfully fetch from at least 2 external sources
3. **Data Integrity**: No duplicate papers (by DOI)
4. **User Experience**: Follows LCARS design system
5. **Experiment Integration**: Seamless citation workflow
6. **Search Relevance**: MES papers rank higher for MES queries
7. **Caching**: External results cached for 24 hours
8. **Mobile Responsive**: Works on tablet and mobile devices

## Assumptions

1. External APIs have reasonable rate limits for academic use
2. Users have rights to upload paper metadata they contribute
3. PostgreSQL will be available in production for full-text search
4. Initial dataset will be under 10,000 papers
5. Most searches will be in English language

## Future Enhancements

1. PDF upload for automatic metadata extraction
2. Citation format export (BibTeX, RIS)
3. Recommendation engine based on user's experiments
4. Collaborative paper annotations
5. Integration with reference managers (Zotero, Mendeley)
6. Real-time alerts for new relevant papers
7. Author profile pages
8. Impact metrics and citation tracking