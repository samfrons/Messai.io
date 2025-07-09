# CLAUDE.md - AI Assistant Context for MESSAi

This file provides context and instructions for AI assistants (like Claude) working on the MESSAi project.

## Project Overview

MESSAi (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial electrochemical systems research. It supports various bioelectrochemical technologies including:
- Microbial Fuel Cells (MFCs) - electricity generation
- Microbial Electrolysis Cells (MECs) - hydrogen production
- Microbial Desalination Cells (MDCs) - water treatment
- Microbial Electrosynthesis (MES) - chemical production
- Other bioelectrochemical systems

The platform combines:
- Interactive 3D visualization using Three.js
- AI-powered predictions for system optimization
- Comprehensive experiment tracking
- Scientific material database with 27 electrode options, differentiating between anode and cathode
- Clean UI theme
- Advanced literature collection and analysis system

## Research Literature System

The literature system serves as a knowledge extraction engine for building a comprehensive database of microbial electrochemical interactions.

## Purpose

The research literature system is designed to:
- Extract structured scientific data from research papers
- Map extracted knowledge to specific scientific domains
- Build a queryable database of microbial electrochemical interactions
- Enable data-driven predictions and insights

## Scientific Domain Architecture

The literature system extracts data that maps to these core domains:

### 1. Anode Domain
- **Materials**: Carbon cloth, graphite, biochar, conductive polymers
- **Biofilms**: Geobacter, Shewanella, mixed consortia
- **Surface modifications**: Chemical treatments, nanoparticle coatings
- **Performance metrics**: Current density, coulombic efficiency

### 2. Cathode Domain  
- **Materials**: Platinum, stainless steel, carbon-based, copper electrodes
- **Catalysts**: Metal oxides, biocathodes, air cathodes
- **Reactions**: Oxygen reduction, metal recovery, CO2 reduction
- **Performance**: Overpotential, catalytic efficiency

### 3. Microbe Domain
- **Species**: Pure cultures, enriched consortia, syntrophic communities
- **Metabolism**: Electron transfer mechanisms, substrate utilization
- **Genetics**: Gene expression, biofilm formation
- **Growth conditions**: pH, temperature, nutrients

### 4. Environment Domain
- **Operating conditions**: Temperature, pH, salinity, dissolved oxygen
- **Substrates**: Wastewater types, synthetic media, industrial effluents  
- **Reactor configurations**: Batch, continuous flow, stacked cells
- **Scale**: Laboratory, pilot, field deployment

### 5. Performance Domain
- **Power metrics**: Power density, current density, voltage
- **Efficiency metrics**: Coulombic efficiency, energy efficiency
- **Treatment metrics**: COD removal, metal recovery rates
- **Economic metrics**: Cost per kWh, payback period

## Data Extraction Pipeline

### Current Implementation

```typescript
// Pattern-based extraction from papers
const EXTRACTION_PATTERNS = {
  powerDensity: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2])/gi,
  currentDensity: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/m[²2]|A\/m[²2])/gi,
  voltage: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mV|V)\s+(?:at|@)/gi,
  efficiency: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%\s*(?:coulombic|CE|energy)/gi,
  materials: /(?:anode|cathode).*?(?:carbon|graphite|steel|copper|platinum)/gi,
  organisms: /(?:Geobacter|Shewanella|Pseudomonas|mixed culture|consortium)/gi
}
```

### Knowledge Building Process

1. **Paper Collection** → 2. **Data Extraction** → 3. **Domain Mapping** → 4. **Knowledge Integration**

Each paper contributes to multiple domains:
- A paper on "copper cathodes with Geobacter biofilms" feeds into:
  - Cathode domain (copper material properties)
  - Microbe domain (Geobacter characteristics)
  - Performance domain (power output data)

## API Structure for Domain Integration

### Literature API Endpoints

```typescript
// Get papers by domain
GET /api/literature/domains/anodes?material=carbon_cloth
GET /api/literature/domains/cathodes?reaction=oxygen_reduction  
GET /api/literature/domains/microbes?species=geobacter
GET /api/literature/domains/performance?metric=power_density

// Get cross-domain insights
GET /api/literature/insights/materials-performance
GET /api/literature/insights/microbe-compatibility
GET /api/literature/insights/optimal-conditions
```

### Database Schema Extensions

```prisma
model ResearchPaper {
  // Core paper metadata
  id            String   @id
  title         String
  abstract      String?
  
  // Domain-specific extracted data
  anodeMaterials     String?  // JSON array
  cathodeMaterials   String?  // JSON array
  organismTypes      String?  // JSON array
  
  // Performance metrics
  powerOutput    Float?
  currentDensity Float?
  efficiency     Float?
  
  // Environmental conditions
  temperature    Float?
  pH            Float?
  substrate     String?
  
  // Domain relationships
  anodeDomain    AnodeDomain[]
  cathodeDomain  CathodeDomain[]
  microbeDomain  MicrobeDomain[]
  performanceData PerformanceData[]
}
```

## Scripts and Tools

### Core Scripts

1. **real-paper-collection.ts**
   - Multi-source collection (CrossRef, PubMed, arXiv)
   - 19 targeted search queries across research areas
   - Deduplication and validation
   - Expected yield: ~845 papers per run

2. **paper-quality-validator.ts**
   - Quality scoring system (0-100 scale)
   - Evaluates: verification, completeness, relevance, data richness, recency, impact
   - Pattern matching for performance metrics, materials, organisms
   - Flags papers needing enhancement

3. **enhanced-data-extractor.ts**
   - Advanced pattern matching for structured data extraction
   - Extracts: performance metrics with units and conditions
   - Material classification (anode/cathode/membrane)
   - Organism identification and classification
   - System configuration detection
   - Confidence scoring for all extractions

4. **clean-abstract-html.ts**
   - JATS XML tag removal
   - HTML entity decoding
   - Text normalization

### Running the Pipeline

```bash
# Collect papers from multiple sources
npm run literature:collect

# Enhance papers with extracted data
npm run literature:enhance

# Clean HTML from abstracts
npm run literature:clean

# Full pipeline
npm run literature:pipeline
```

## Development Guidelines

### Data Integrity
- NEVER create fake papers or fabricated data
- Only work with real, verified research
- Validate all extracted values have proper units
- Cross-reference multiple papers for accuracy

### Domain Mapping
- Each extracted data point should map to at least one domain
- Maintain relationships between domains (e.g., material-microbe compatibility)
- Build queryable connections for insights

### Quality Assurance
- Test extraction patterns against known papers
- Verify units and value ranges
- Flag outliers for manual review
- Track extraction confidence scores

## Current Status

- **Papers**: 6,022 total (as of latest database count)
- **Verified papers**: 426 with DOI/PubMed/arXiv IDs
- **With abstracts**: 5,700+ 
- **With performance data**: 1,200+ papers
- **Power output data**: 850+ papers
- **Efficiency data**: 750+ papers
- **Materials extracted**: 127 unique
- **Organisms identified**: 99 unique
- **Sources**: CrossRef API, PubMed API, arXiv API, comprehensive searches

## Future Enhancements

1. **Advanced Extraction**
   - Machine learning models for context-aware extraction
   - Relationship extraction between entities
   - Temporal analysis of field evolution

2. **Domain Integration**
   - GraphQL API for complex queries
   - Recommendation engine for material-microbe combinations
   - Predictive models based on extracted data

3. **Visualization**
   - Knowledge graphs of domain relationships
   - Performance heatmaps by configuration
   - Trend analysis dashboards

## Key Files

- `/scripts/literature/` - All data collection and processing scripts
- `/app/api/literature/` - API endpoints for literature access
- `/lib/literature/` - Core extraction and processing logic
- `/prisma/schema.prisma` - Database schema with domain fields
- `/app/literature/` - UI for browsing and searching papers

## Environment Configuration

```env
DATABASE_URL="postgresql://..."  # Required
NEXT_PUBLIC_DEMO_MODE="false"    # For full functionality
```

## Testing

```bash
# Run all literature tests
npm run test:literature

# Test specific components
npm run test tests/literature/paper-quality-validator.test.ts
npm run test tests/literature/enhanced-data-extractor.test.ts
npm run test tests/api/papers-filters.test.ts
npm run test tests/literature/literature-page.test.tsx
```

### Test Coverage

- **Paper Quality Validator**: Pattern matching, scoring logic, edge cases
- **Enhanced Data Extractor**: Performance metrics, materials, organisms, confidence scoring
- **Papers API**: Filtering, pagination, data transformation, error handling
- **Literature UI**: Component rendering, user interactions, API integration

## API Filtering and Source Management

### Real Papers Filter
The API distinguishes between verified research papers and other sources:

```typescript
const realSources = [
  'crossref_api',
  'crossref_comprehensive', 
  'pubmed_api',
  'pubmed_comprehensive',
  'arxiv_api',
  'local_pdf',
  'web_search',
  'comprehensive_search',
  'advanced_electrode_biofacade_search',
  'extensive_electrode_biofacade_collection'
]
```

### Frontend Display Optimization

1. **JSON Field Parsing**: All API routes use `parseJsonField` to handle mixed string/array data
2. **Material Filtering**: Removes artifacts like "null", "undefined", "[object Object]"
3. **Pagination**: Default 10 papers per page, max 100
4. **URL Parameters**: Filters persist across page navigation

## Common Issues and Solutions

### Issue: Frontend showing "[object Object]" or nulls
**Solution**: Implemented parseJsonField function in API routes to properly transform JSON strings

### Issue: Only showing 313 papers instead of 6,000+
**Solution**: Added crossref_comprehensive and pubmed_comprehensive to realSources array

### Issue: Database migration to PostgreSQL
**Solution**: Use seed-remote-database.ts script with proper DIRECT_URL connection string

## Important Notes for AI Agents

1. **Data Integrity**: NEVER create fake papers or fabricated scientific data
2. **Source Verification**: Always check paper.source against realSources for filtering
3. **Performance**: Use pagination for large datasets, implement proper loading states
4. **Error Handling**: Wrap all API calls in try-catch, provide meaningful error messages
5. **Testing**: Run tests before committing any changes to literature system

Remember: The goal is to transform unstructured research literature into a structured, queryable knowledge base that advances the field of microbial electrochemical systems.