# CLAUDE.md - Research Literature System for MESSAi

This file provides context for AI assistants working on the MESSAi research literature system, which serves as a knowledge extraction engine for building a comprehensive database of microbial electrochemical interactions.

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

1. **collect-2000-papers.ts**
   - Multi-source collection (CrossRef, PubMed, arXiv)
   - 24 targeted search queries
   - Deduplication and validation

2. **enhance-all-papers.ts**
   - Pattern-based data extraction
   - Performance metric parsing
   - Material and organism identification

3. **clean-abstract-html.ts**
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

- **Papers**: 2,030 total
- **With abstracts**: 1,804 (88.9%)
- **With summaries**: 661 (32.6%)
- **Power output data**: 33 papers
- **Efficiency data**: 42 papers
- **Materials extracted**: 99 unique
- **Organisms identified**: 99 unique

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
# Test extraction patterns
npm run test:literature:extraction

# Test API endpoints
npm run test:literature:api

# Test domain mapping
npm run test:literature:domains
```

Remember: The goal is to transform unstructured research literature into a structured, queryable knowledge base that advances the field of microbial electrochemical systems.