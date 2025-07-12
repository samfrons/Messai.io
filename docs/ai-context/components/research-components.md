# Research Components Documentation (messai-research-clean)

## Overview
The messai-research-clean worktree contains the comprehensive research paper management system with advanced AI-powered analysis, data extraction, and knowledge discovery. It manages 6,000+ scientific papers with sophisticated processing pipelines.

## Architecture Principles

### Research-First Design
- Scientific accuracy and data integrity
- AI-powered knowledge extraction
- Comprehensive paper validation
- Real-time research insights

### Component Organization
```
messai-research-clean/
├── app/
│   ├── research/                # Research browsing interface
│   │   ├── page.tsx            # Paper browser
│   │   ├── [id]/               # Individual paper view
│   │   ├── search/             # Advanced search
│   │   └── insights/           # AI insights dashboard
│   └── api/
│       └── research/           # Research-specific APIs
├── components/
│   ├── research/               # Research UI components
│   ├── papers/                 # Paper management
│   ├── search/                 # Search interfaces
│   └── insights/               # Data visualization
├── packages/
│   ├── @messai/research-core/  # Research business logic
│   └── @messai/research-ui/    # Research UI components
├── scripts/
│   ├── collection/             # Paper collection scripts
│   ├── processing/             # Data processing pipelines
│   └── validation/             # Quality assurance
└── lib/
    ├── extraction/             # Data extraction engines
    ├── analysis/               # Research analysis
    └── ml/                     # Machine learning models
```

## Core Research Components

### 1. Paper Management System
**Location**: `components/papers/`, `app/research/`
**Purpose**: Comprehensive paper browsing and management

**Key Components**:
- `PaperBrowser.tsx` - Main paper listing interface
- `PaperDetail.tsx` - Individual paper view
- `PaperSearch.tsx` - Advanced search interface
- `PaperFilters.tsx` - Multi-dimensional filtering
- `PaperComparison.tsx` - Side-by-side comparison

**Features**:
- Real-time search across 6,000+ papers
- Advanced filtering by multiple criteria
- PDF viewing and annotation
- Citation management
- Export to reference managers

### 2. AI-Powered Data Extraction
**Location**: `lib/extraction/`, `scripts/processing/`
**Purpose**: Automated extraction of scientific data from papers

**Key Modules**:
```typescript
// Performance metrics extraction
export class PerformanceExtractor {
  extractPowerDensity(text: string): MetricExtraction {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*mW\/m[²2]/gi,
      /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*W\/m[²2]/gi
    ]
    // Pattern matching and confidence scoring
  }
}

// Material identification
export class MaterialExtractor {
  identifyElectrodeMaterials(text: string): MaterialMatch[] {
    // Advanced NLP for material identification
    // Cross-reference with material database
    // Confidence scoring and validation
  }
}
```

**Extraction Categories**:
- Performance metrics (power, current, efficiency)
- Materials (anodes, cathodes, membranes)
- Operating conditions (pH, temperature, substrate)
- System configurations (MFC, MEC, MDC types)
- Microbial communities (species, consortia)

### 3. Quality Assurance System
**Location**: `scripts/validation/`, `lib/analysis/`
**Purpose**: Multi-dimensional paper quality scoring

**Quality Metrics**:
```typescript
export interface QualityScore {
  overall: number          // 0-100 composite score
  verification: number     // DOI/PubMed verification
  completeness: number     // Metadata completeness
  relevance: number        // MES relevance score
  dataRichness: number     // Extracted data quantity
  recency: number          // Publication recency
  impact: number           // Citation impact
}

export class QualityAssessment {
  calculateQualityScore(paper: ResearchPaper): QualityScore {
    // Multi-factor quality assessment
    // Weighted scoring algorithm
    // Confidence intervals
  }
}
```

### 4. Advanced Search Engine
**Location**: `components/search/`, `app/research/search/`
**Purpose**: Sophisticated research paper discovery

**Search Capabilities**:
- Full-text search across abstracts
- Semantic search using embeddings
- Filter by performance metrics
- Material-based search
- Author and journal filtering
- Date range filtering
- Quality score thresholds

**Search Interface**:
```typescript
export interface SearchQuery {
  text?: string                    // Full-text search
  materials?: string[]             // Material filters
  systemTypes?: SystemType[]       // MFC, MEC, etc.
  performanceRange?: {
    powerMin?: number
    powerMax?: number
    efficiencyMin?: number
    efficiencyMax?: number
  }
  qualityThreshold?: number        // Minimum quality score
  dateRange?: {
    from?: Date
    to?: Date
  }
}
```

### 5. Research Insights Dashboard
**Location**: `components/insights/`, `app/research/insights/`
**Purpose**: AI-powered research analytics and trends

**Key Insights**:
- Performance trend analysis
- Material effectiveness rankings
- Research gap identification
- Citation network analysis
- Emerging technology detection

## Research Database Schema

### Enhanced Paper Model
```typescript
export interface ResearchPaper {
  // Core metadata
  id: string
  title: string
  authors: string[]
  abstract: string
  doi?: string
  pubmedId?: string
  arxivId?: string
  
  // AI extraction results
  performanceMetrics?: {
    powerDensity?: number         // mW/m²
    currentDensity?: number       // mA/cm²
    coulombicEfficiency?: number  // %
    energyEfficiency?: number     // %
  }
  
  materials?: {
    anodes: MaterialMatch[]
    cathodes: MaterialMatch[]
    membranes: MaterialMatch[]
  }
  
  systemConfiguration?: {
    type: 'MFC' | 'MEC' | 'MDC' | 'MES'
    volume?: number               // L
    design: string
    configuration: string
  }
  
  operatingConditions?: {
    temperature?: number          // °C
    pH?: number
    substrate?: string
    concentration?: number        // g/L
  }
  
  microbialData?: {
    species: string[]
    community: 'pure' | 'mixed' | 'consortium'
    source: string
  }
  
  // Quality and confidence
  qualityScore: QualityScore
  extractionConfidence: number
  verificationStatus: 'verified' | 'pending' | 'unverified'
  
  // Processing metadata
  source: string                  // Collection source
  collectedAt: Date
  processedAt?: Date
  aiModel?: string               // AI model used for processing
}
```

## Data Collection Pipeline

### Multi-Source Collection
**Location**: `scripts/collection/`

**Data Sources**:
1. **CrossRef API** - DOI-verified papers
2. **PubMed API** - Biomedical research
3. **arXiv API** - Preprints and early research
4. **Web Scraping** - Targeted journal searches
5. **Manual Uploads** - User-contributed papers

**Collection Scripts**:
```typescript
// Automated collection from multiple APIs
export class PaperCollector {
  async collectFromCrossRef(queries: string[]): Promise<RawPaper[]> {
    // CrossRef API integration
    // Rate limiting and error handling
    // Duplicate detection
  }
  
  async collectFromPubMed(queries: string[]): Promise<RawPaper[]> {
    // PubMed API integration
    // MeSH term optimization
    // Citation processing
  }
}
```

### Processing Pipeline
**Location**: `scripts/processing/`

**Pipeline Stages**:
1. **Validation** - DOI verification, duplicate detection
2. **Cleaning** - Text normalization, HTML removal
3. **Extraction** - AI-powered data extraction
4. **Classification** - System type classification
5. **Quality Scoring** - Multi-dimensional assessment
6. **Indexing** - Search index generation

## Research APIs

### Paper Management API
**Base Route**: `/api/research/papers`

**Endpoints**:
```typescript
GET    /papers              // List papers with pagination
GET    /papers/:id          // Get specific paper
POST   /papers/search       // Advanced search
GET    /papers/:id/similar  // Find similar papers
POST   /papers/upload       // Upload new paper
PUT    /papers/:id/validate // Manual validation
```

### Analytics API
**Base Route**: `/api/research/analytics`

**Endpoints**:
```typescript
GET    /stats                    // Overall statistics
GET    /trends/performance       // Performance trends
GET    /trends/materials         // Material usage trends
GET    /insights/gaps            // Research gap analysis
GET    /networks/citations       // Citation networks
POST   /reports/generate         // Custom reports
```

### Data Export API
**Base Route**: `/api/research/export`

**Endpoints**:
```typescript
POST   /bibtex              // BibTeX export
POST   /csv                 // CSV data export
POST   /json                // JSON export
POST   /report              // PDF report generation
```

## Advanced Features

### AI-Powered Insights
**Location**: `lib/ml/`

**Machine Learning Models**:
- Text embeddings for semantic search
- Performance prediction models
- Material recommendation engine
- Research trend analysis
- Automatic paper classification

### Real-Time Processing
**Location**: `lib/processing/`

**Real-Time Features**:
- Live paper feed monitoring
- Automatic duplicate detection
- Real-time quality scoring
- Instant search index updates
- Performance alerting

### Knowledge Graph
**Location**: `lib/knowledge/`

**Graph Structure**:
```typescript
export interface KnowledgeNode {
  id: string
  type: 'paper' | 'material' | 'organism' | 'metric'
  properties: Record<string, any>
  connections: Connection[]
}

export interface Connection {
  target: string
  type: 'cites' | 'uses_material' | 'studies_organism'
  weight: number
  confidence: number
}
```

## Performance Optimization

### Database Optimization
- Indexed fields for fast queries
- Materialized views for aggregations
- Query result caching
- Pagination with cursor-based navigation

### Search Performance
- Elasticsearch integration for full-text search
- Pre-computed search indices
- Query result caching
- Parallel processing for large datasets

### UI Performance
- Virtual scrolling for large lists
- Lazy loading of paper details
- Image optimization for figures
- Progressive loading of search results

## Testing Strategy

### Data Quality Testing
```typescript
describe('Data Extraction', () => {
  it('should extract power density accurately', () => {
    const text = "achieved 1.2 mW/m² power density"
    const result = extractor.extractPowerDensity(text)
    expect(result.value).toBe(1.2)
    expect(result.unit).toBe('mW/m²')
    expect(result.confidence).toBeGreaterThan(0.9)
  })
})
```

### Search Quality Testing
```typescript
describe('Search Engine', () => {
  it('should return relevant papers for material search', async () => {
    const results = await searchEngine.search({
      materials: ['carbon cloth']
    })
    expect(results.papers.length).toBeGreaterThan(0)
    expect(results.papers[0].relevanceScore).toBeGreaterThan(0.8)
  })
})
```

## Development Workflow

### Local Development
```bash
cd messai-research-clean
npm install
npm run dev:research  # Port 3002
```

### Data Processing Workflow
1. Run collection scripts for new papers
2. Execute validation and cleaning pipeline
3. Perform AI extraction and analysis
4. Update search indices
5. Generate quality reports

### Research Analysis Workflow
1. Define research question
2. Use advanced search to find relevant papers
3. Apply filters and quality thresholds
4. Analyze extracted data
5. Generate insights and reports

## Integration with Core Platform

### Shared Infrastructure
- Authentication from core platform
- Database client from `@messai/core`
- Common UI components
- Error handling and logging

### Data Integration
- Research data feeds prediction models
- Material data enhances design tools
- Performance benchmarks validate simulations
- Citation data supports credibility

---

*This documentation guides development of research management and AI-powered analysis features in the messai-research-clean worktree.*