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
- Advanced literature collection and analysis system with 6,000+ verified research papers
- AI-powered data extraction and categorization system
- Advanced filtering and search capabilities

## Key Technical Details

### Architecture
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme that will be implemented at a later date
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Database**: Prisma ORM (PostgreSQL ready)
- **Testing**: Vitest + React Testing Library

### Project Structure
```
messai                                                                                                                                   │
     │ ├── apps/                                                                                                                                            │
     │ │   ├── public-tools/          # app.messai.io (Public demos)                                                                                        │
     │ │   └── private-platform/      # messai.io (Full platform + auth)                                                                                    │
     │ ├── packages/                                                                                                                                        │
     │ │   ├── domains/              # Scientific domain packages                                                                                           │
     │ │   │   ├── anodes/           # Biological interface electrodes                                                                                      │
     │ │   │   ├── cathodes/         # Reduction electrodes (includes copper!)                                                                              │
     │ │   │   ├── microbes/         # Biological systems & biofilms                                                                                        │
     │ │   │   ├── geometries/       # Physical configurations & flow                                                                                       │
     │ │   │   ├── environments/     # Operational conditions & control                                                                                     │
     │ │   │   ├── substrates/       # Feed materials & nutrients                                                                                           │
     │ │   │   ├── performance/      # Measurable outputs & kinetics                                                                                        │
     │ │   │   └── infrastructure/   # Supporting materials & components                                                                                    │
     │ │   ├── shared/                                                                                                                                      │
     │ │   │   ├── ui/              # Shared React components                                                                                               │
     │ │   │   ├── auth/            # Authentication utilities                                                                                              │
     │ │   │   ├── database/        # Prisma schemas & utilities                                                                                            │
     │ │   │   └── validation/      # Data validation & types                                                                                               │
     │ │   └── tools/                                                                                                                                       │
     │ │       ├── bioreactor/      # Bioreactor simulation engine                                                                                          │
     │ │       ├── electroanalytical/ # Electroanalytical interface tools                                                                                   │
     │ │       └── models/          # 3D models & physics engine                                                                                            │
     │ ├── libs/                    # Core scientific libraries                                                                                             │
     │ │   ├── prediction-engine/   # AI prediction algorithms                                                                                              │
     │ │   ├── literature/          # Literature management system                                                                                          │
     │ │   └── materials/           # Materials database engine                                                                                             │
     │ └── infrastructure/                                                                                                                                  │
     │     ├── nx.json             # NX configuration                                                                                                       │
     │     ├── turbo.json          # Turbo build configuration                                                                                              │
     │     └── deployment/         # CI/CD & deployment configs                                                                                             │
     │                                                                                                                                                      │
     │ 🔬 Enhanced Domain Structures                                                                                                                        │
     │                                                                                                                                                      │
     │ cathodes/ Domain - Complete with Copper Integration                                                                                                  │
     │                                                                                                                                                      │
     │ packages/domains/cathodes/                                                                                                                           │
     │ ├── materials/                                                                                                                                       │
     │ │   ├── precious-metals/       # Pt, Pd, Ru group                                                                                                    │
     │ │   ├── base-metals/          # Cu, Ni, SS, Ti, Fe (KEY!)                                                                                            │
     │ │   │   ├── copper/           # Cu, Cu₂O, CuO, Cu alloys                                                                                             │
     │ │   │   │   ├── metallic/     # Pure copper electrodes                                                                                               │
     │ │   │   │   ├── oxides/       # Cuprous/cupric oxide                                                                                                 │
     │ │   │   │   ├── alloys/       # Cu-Zn, Cu-Ni, Cu-Ag                                                                                                  │
     │ │   │   │   └── nanostructured/ # Cu nanowires, particles                                                                                            │
     │ │   │   ├── nickel/           # Ni foam, Ni alloys                                                                                                   │
     │ │   │   ├── stainless-steel/  # SS316, SS304                                                                                                         │
     │ │   │   ├── titanium/         # Ti, TiO₂, Ti alloys                                                                                                  │
     │ │   │   └── iron/             # Fe, Fe₂O₃, Fe-N-C                                                                                                    │
     │ │   ├── carbon-supported/      # Metal-carbon composites                                                                                             │
     │ │   ├── air-cathodes/         # Gas diffusion electrodes                                                                                             │
     │ │   └── biocathodes/          # Biological reduction                                                                                                 │
     │ ├── applications/                                                                                                                                    │
     │ │   ├── oxygen-reduction/     # ORR optimization                                                                                                     │
     │ │   ├── metal-recovery/       # Electrowinning (copper focus!)                                                                                       │
     │ │   ├── alternative-reduction/ # NO₃⁻, SO₄²⁻, CO₂, H⁺                                                                                                │
     │ │   └── specialized/          # Desalination, sensors                                                                                                │
     │ ├── surface-treatments/                                                                                                                              │
     │ │   ├── copper-specific/      # Cu surface engineering                                                                                               │
     │ │   ├── general-treatments/   # Universal modifications                                                                                              │
     │ │   └── biocompatibility/     # Biofilm interface                                                                                                    │
     │ └── characterization/                                                                                                                                │
     │     ├── electrochemical/      # CV, EIS, performance                                                                                                 │
     │     ├── physical/             # XPS, SEM, conductivity                                                                                               │
     │     └── performance/          # System-level metrics                                                                                                 │
     │                                                                                                                                                      │
     │ anodes/ Domain - Biological Interface Focus                                                                                                          │
     │                                                                                                                                                      │
     │ packages/domains/anodes/                                                                                                                             │
     │ ├── materials/                                                                                                                                       │
     │ │   ├── carbon-based/         # Carbon cloth, felt, paper                                                                                            │
     │ │   ├── graphene-family/      # GO, rGO, aerogels                                                                                                    │
     │ │   ├── nanotube/            # SWCNT, MWCNT, arrays                                                                                                  │
     │ │   ├── mxene/               # Ti₃C₂Tₓ, V₂CTₓ, 2D materials                                                                                          │
     │ │   └── conductive-polymers/  # PEDOT, polyaniline                                                                                                   │
     │ ├── modifications/                                                                                                                                   │
     │ │   ├── surface-treatments/   # Ammonia, heat, plasma                                                                                                │
     │ │   ├── biocompatibility/    # Roughness, hydrophilicity                                                                                             │
     │ │   ├── biofilm-enhancement/ # Coatings, mediators                                                                                                   │
     │ │   └── conductivity-boost/   # Metal nanoparticles                                                                                                  │
     │ ├── biofilm-interface/                                                                                                                               │
     │ │   ├── adhesion-properties/  # Surface energy, roughness                                                                                            │
     │ │   ├── electron-transfer/    # Direct vs mediated                                                                                                   │
     │ │   ├── maintenance/         # Cleaning, regeneration                                                                                                │
     │ │   └── lifetime/            # Degradation, replacement                                                                                              │
     │ └── characterization/                                                                                                                                │
     │     ├── electrochemical/     # Biofilm electrochemistry                                                                                              │
     │     ├── biological/          # Biofilm analysis                                                                                                      │
     │     └── performance/         # Power density, stability                                                                                              │
     │                                                                                                                                                      │
     │ Other Key Domains                                                                                                                                    │
     │                                                                                                                                                      │
     │ packages/domains/microbes/                                                                                                                           │
     │ ├── organisms/              # Species, consortia                                                                                                     │
     │ ├── metabolism/             # Electron pathways                                                                                                      │
     │ ├── cultivation/            # Growth, maintenance                                                                                                    │
     │ └── characterization/       # Community analysis                                                                                                     │
     │                                                                                                                                                      │
     │ packages/domains/geometries/                                                                                                                         │
     │ ├── reactor-types/          # Single/dual chamber, flow                                                                                              │
     │ ├── flow-patterns/          # Hydraulics, mixing                                                                                                     │
     │ ├── electrode-arrangement/  # Spacing, surface area                                                                                                  │
     │ └── scaling-laws/           # Lab to industrial                                                                                                      │
     │                                                                                                                                                      │
     │ packages/domains/environments/                                                                                                                       │
     │ ├── physicochemical/        # pH, temperature, conductivity                                                                                          │
     │ ├── control-systems/        # Automation, monitoring                                                                                                 │
     │ ├── variations/             # Startup, steady-state                                                                                                  │
     │ └── optimization/           # Model predictive control                                                                                               │
     │                                                                                                                                                      │
     │ packages/domains/substrates/                                                                                                                         │
     │ ├── organic-feedstocks/     # Simple to complex organics                                                                                             │
     │ ├── nutrients/              # Macro, trace, vitamins                                                                                                 │
     │ ├── preprocessing/          # Treatment, conditioning                                                                                                │
     │ └── characterization/       # COD, BOD, composition                                                                                                  │
     │                                                                                                                                                      │
     │ packages/domains/performance/                                                                                                                        │
     │ ├── electrical/             # Power, current, voltage                                                                                                │
     │ ├── efficiency/             # Coulombic, energy, removal                                                                                             │
     │ ├── kinetics/               # Reaction rates, modeling                                                                                               │
     │ └── economics/              # LCOE, CAPEX, OPEX                                                                                                      │
     │                                                                                                                                                      │
     │ packages/domains/infrastructure/                                                                                                                     │
     │ ├── membranes/              # Ion exchange, selective                                                                                                │
     │ ├── housing/                # Materials, sealing                                                                                                     │
     │ ├── auxiliary/              # Pumps, sensors, DAQ                                                                                                    │
     │ └── safety/                 # Pressure relief, monitoring           

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow functional React patterns (hooks)
- Maintain design consistency
- Write tests for new features
- Document scientific assumptions
- Follow Test Driven Development practices

### Important Commands
```bash
npm run dev          # Start dev server on port 3003
npm test            # Run tests
npm run lint        # Check code quality
npm run format      # Format code with Prettier
npm run db:studio   # Open Prisma Studio

# Literature system management
npm run literature:enhance-all    # Full enhancement pipeline
npm run db:integrity             # Check database integrity
npm run db:validate-links        # Validate external URLs
npm run test:literature          # Run literature tests
```

## Scientific Context

### Bioelectrochemical System Designs (13 types)
- **Laboratory**: Benchtop electrochemical bioreactors, benthic fuel cells, micro lab-on-a-chip cells
- **Pilot Scale**: 3D printed, benchtop bioreactor 
- **Industrial**: Wastewater treatment, architectural facade 

### Key Parameters
- **Temperature**: Optimal 25-35°C
- **pH**: Optimal ~7.0
- **Substrate Concentration**: 1-2 g/L typical
- **Power Output**: 5 mW/m² to 50 W/m² depending on design

### Material Categories
1. **Traditional**: Carbon cloth, graphite, stainless steel
2. **Graphene-based**: GO, rGO, aerogel
3. **Carbon Nanotubes**: SWCNT, MWCNT
4. **MXenes**: Ti₃C₂Tₓ, V₂CTₓ (cutting-edge 2D materials)
5. **Upcycled**: Reclaimed electronics with pre-treatments

## AI Prediction Model

The prediction engine (`lib/ai-predictions.ts`) uses:
- Temperature factor (Arrhenius-based)
- pH factor (bell curve around 7.0)
- Substrate factor (Monod kinetics)
- Design-specific multipliers
- Random variation for realism

## Literature System Guidelines

### CRITICAL: Data Integrity Rules
- **NEVER generate fake research papers or fabricated scientific data**
- **ONLY work with real, verified papers from legitimate sources**
- **Extrapolation allowed ONLY when explicitly requested and clearly marked**
- **ALL papers must have verification (DOI, PubMed ID, arXiv ID, or verified PDF)**

### Literature Database Loading Requirements
Always ensure the literature database loads reliably by:

1. **Error Handling**:
   - Wrap all literature components with ErrorBoundary
   - Implement retry logic for failed API calls
   - Show meaningful error messages to users
   - Log errors for debugging

2. **Performance Optimization**:
   - Implement pagination (default: 10-20 papers per page)
   - Add loading states for all async operations
   - Cache API responses where appropriate
   - Use database indexes on frequently queried fields

3. **Fallback Strategies**:
   - If main API fails, show cached data if available
   - Provide offline mode with limited functionality
   - Gracefully degrade features rather than crash

4. **Testing Requirements**:
   - Test with empty database
   - Test with large datasets (1000+ papers)
   - Test network failures and timeouts
   - Test authentication state changes

### Data Extraction Standards
When extracting data from papers for predictive models:

1. **Structured Extraction**:
   - System designs and configurations
   - Microbial communities and performance metrics
   - Electroanalytical methods and results
   - Anode/cathode material performance data
   - Maintenance and optimization protocols
   - Operating conditions and their impacts

2. **Quality Assurance**:
   - Verify units and experimental conditions
   - Cross-reference multiple papers for validation
   - Flag contradictory findings for review
   - Track confidence scores for extracted values

3. **Model Integration**:
   - New data must pass quality checks before integration
   - Maintain traceability to source papers
   - Version control for model parameter updates
   - Test predictions against literature benchmarks

### Dynamic Knowledge Base
The literature system should continuously build upon predictive simulation models by:

1. **Comprehensive Data Extraction**:
   - System designs: geometry, dimensions, flow patterns
   - Microbial communities: species composition, growth conditions
   - Electroanalytical methods: voltammetry, impedance, chronoamperometry
   - Material performance: degradation rates, surface modifications
   - Maintenance protocols: cleaning, regeneration, troubleshooting
   - Operating parameters: startup procedures, optimization strategies

2. **Knowledge Graph Construction**:
   - Link papers to materials, organisms, and performance metrics
   - Track experimental conditions and outcomes
   - Build relationships between different system configurations
   - Identify optimal parameter combinations from literature

3. **Predictive Model Enhancement**:
   - Use extracted data to validate and refine predictions
   - Identify parameter ranges from real experiments
   - Incorporate new materials and methods as discovered
   - Generate data-driven recommendations for users

## 🔬 Literature Data Validation Framework

### Advanced Data Extraction Pipeline (2025-07)
MESSAi now includes a comprehensive validation framework for literature data extraction that addresses null/undefined issues and ensures high-quality data for predictive models.

#### **Core Components**
1. **JSON Schema Validation** (`lib/literature/data-validation.ts`)
   - Zod-based validation for all extracted data
   - Handles null values properly with `.nullable().optional()`
   - Type-safe data structures for performance metrics
   - Automatic data quality scoring (0-100)

2. **Unit Conversion System**
   - Standardizes all measurements to consistent units:
     - Power density → mW/m²
     - Current density → mA/cm²
     - Temperature → °C
     - Efficiency → percentage (0-100)
   - Handles multiple input formats automatically

3. **Enhanced AI Processing**
   - Multi-model Ollama fallback (deepseek-r1, qwen2.5-coder)
   - Example-based prompts with successful extractions
   - Increased timeout handling (60s vs 30s)
   - Confidence scoring for all extractions

4. **Advanced Pattern Matching** (`scripts/literature/advanced-pattern-matching.ts`)
   - 50+ regex patterns for bioelectrochemical metrics
   - Material identification (anode/cathode)
   - Microorganism classification
   - System type detection (MFC, MEC, MDC, MES, BES)

#### **API Data Transformation**
All literature API routes now include enhanced data parsing:

```typescript
// Automatically parses JSON fields and adds computed properties
{
  ...paper,
  authors: parsedAuthorsArray,           // Not JSON string
  anodeMaterials: parsedMaterialsArray,  // Not JSON string
  cathodeMaterials: parsedMaterialsArray,
  organismTypes: parsedOrganismsArray,
  keywords: parsedKeywordsArray,
  aiData: parsedAiExtractionData,        // Full AI extraction results
  hasPerformanceData: boolean,           // Computed flag
  isAiProcessed: boolean,                // Processing status
  processingMethod: string,              // 'pattern-matching-v2' | 'ollama-enhanced-v2'
  confidenceScore: number                // 0-1 confidence
}
```

#### **Database Status (Updated 2025-07-10 - Post Integration)**
- **Total Papers**: 6,022 verified research papers
- **AI Processed**: 1,200+ (19.9%+)
- **With Performance Data**: 850+ (14.1%+) 
- **Quality Score**: Comprehensive validation system in place
- **Frontend Integration**: ✅ **COMPLETE** - Advanced filtering and enhanced data display
- **Sources**: CrossRef API, PubMed API, arXiv API, comprehensive searches
- **Authentication**: ✅ **PRESERVED** - Full authentication system integrated with literature features

#### **Processing Methods Available**
1. **Pattern Matching**: Fast regex-based extraction for basic metrics
2. **Ollama Enhanced**: Local LLM processing with validation
3. **Google Scholar**: Targeted scraping for specific research areas
4. **Validation Pipeline**: Quality checks and unit standardization

#### **Running Data Processing**
```bash
# Test validation system
npx tsx scripts/literature/test-validation-system.ts

# Advanced pattern matching (fast)
npx tsx scripts/literature/advanced-pattern-matching.ts

# Enhanced Ollama processing (thorough)
npx tsx scripts/literature/enhanced-ollama-processor.ts

# Generate quality report
npx tsx scripts/literature/final-quality-report.ts

# Google Scholar scraping
npx tsx scripts/literature/google-scholar-scraper.ts
```

#### **Data Quality Standards**
- All extracted values must pass Zod schema validation
- Units are automatically converted to standard formats
- Null values are properly handled (no more undefined errors)
- Confidence scores track extraction reliability
- Material and organism data is structured consistently

#### **Frontend Integration**
The validation framework is fully integrated with frontend APIs:
- `/api/papers` - Returns transformed data with parsed JSON fields
- `/api/papers/[id]` - Individual papers with full AI extraction data
- `/api/papers-simple` - Lightweight endpoint with enhanced data

**Enhanced Data Transformation (Complete)**:
- ✅ JSON string fields automatically parsed to arrays/objects
- ✅ Smart filtering removes pattern matching artifacts ("the", "while the", etc.)
- ✅ Null/undefined values properly handled in frontend display
- ✅ Enhanced fields: `hasPerformanceData`, `isAiProcessed`, `processingMethod`, `confidenceScore`
- ✅ Improved JSON parsing handles nested objects and prevents "[object Object]" display
- ✅ Frontend components filter out low-quality extracted data automatically
- ✅ Database cleanup completed: 290/345 papers had malformed data fixed
- ✅ API filters properly exclude fake paper sources

#### **Current Database Status**
- **Total Papers**: 345 real, verified research papers
- **Sources**: CrossRef API (262), PubMed API (77), arXiv API (5), PubMed (1)
- **Quality Focus**: Only legitimate papers with DOI/PubMed/arXiv verification
- **No Fake Papers**: The `massive-final-expansion.ts` script (generates 2000 fake papers) is NOT used
- **Data Quality**: 290 papers cleaned of extraction artifacts, all display issues resolved

#### **Known Extraction Capabilities**
- **Performance Metrics**: Power density, current density, voltage, efficiency
- **Materials**: Anode/cathode materials with type classification
- **Microorganisms**: Species identification with type classification
- **System Parameters**: pH, temperature, substrate types
- **Research Data**: Key findings, experimental conditions

### Troubleshooting Data Validation Issues
1. **Check Processing Status**: Look for `isAiProcessed` and `processingMethod` fields
2. **Validate API Response**: Ensure JSON fields are parsed as arrays/objects, not strings
3. **Test Extraction**: Use test scripts to validate individual papers
4. **Quality Metrics**: Check `confidenceScore` and `hasPerformanceData` flags
5. **Re-process Papers**: Run enhanced processors on papers with poor quality scores

## 🔬 High-Quality Paper Collection System

MESSAi uses a comprehensive paper collection system (`scripts/literature/real-paper-collection.ts`) that ensures only real, verified research papers enter our database.

### Paper Sources and API Integration

#### **1. CrossRef API (Primary Source)**
- **Endpoint**: `https://api.crossref.org/works`
- **Authentication**: No API key required, but User-Agent header mandatory
- **Rate Limit**: 1 request per second
- **Returns**: DOI, title, authors, abstract, journal, publication date, URL
- **Best For**: Recent papers with DOIs from established journals

#### **2. PubMed API (Biomedical Focus)**
- **Search**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`
- **Fetch**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`
- **Process**: Two-step (search for IDs, then fetch full records)
- **Format**: XML response requiring parsing
- **Best For**: Biomedical and life sciences research

#### **3. arXiv API (Preprints)**
- **Endpoint**: `http://export.arxiv.org/api/query`
- **Format**: Atom XML feed
- **No authentication required**
- **Best For**: Latest research, preprints, open access

### Quality Validation System

Every paper must pass quality validation before database entry:

#### **Required Criteria**
```typescript
{
  hasAbstract: boolean        // Min 100 characters
  hasVerifiableId: boolean    // DOI, PubMed ID, or arXiv ID
  hasAuthors: boolean         // At least one author
  isRecentEnough: boolean     // Published 2015 or later
  isRelevantField: boolean    // Contains bioelectrochemical terms
  hasPerformanceData?: boolean // Optional but preferred
}
```

#### **Relevance Checking**
Papers must contain at least one core term:
- microbial fuel cell, bioelectrochemical, microbial electrolysis
- bioelectricity, electroactive bacteria, electron transfer
- biocathode, bioanode, biofilm electrode, microbial desalination

### Targeted Search Strategy

The collection system uses 19 targeted searches across key research areas:

#### **1. MXene and 2D Materials (2020+)**
- `MXene AND (microbial fuel cell OR bioelectrochemical)`
- `Ti3C2 AND bioelectrochemical AND electrode`
- `MXene AND "electron transfer" AND bacteria`
- Expected: ~105 papers

#### **2. Graphene-based Materials (2019+)**
- `graphene oxide AND "microbial fuel cell" AND performance`
- `reduced graphene oxide AND bioelectrochemical AND "power density"`
- Expected: ~140 papers

#### **3. Carbon Nanotubes (2019+)**
- `carbon nanotube AND "microbial electrolysis" AND hydrogen`
- Expected: ~40 papers

#### **4. High-Performance Systems (2019+)**
- `"power density" AND "mW/m2" AND "microbial fuel cell"`
- `optimization AND "microbial fuel cell" AND "current density"`
- Expected: ~170 papers

#### **5. Wastewater Treatment (2020+)**
- `"wastewater treatment" AND "microbial fuel cell" AND removal`
- `"heavy metal" AND bioelectrochemical AND remediation`
- Expected: ~140 papers

#### **6. Specific Organisms (2019+)**
- `Geobacter AND "electron transfer" AND electrode`
- `Shewanella AND biofilm AND "microbial fuel cell"`
- Expected: ~110 papers

#### **7. Advanced Materials (2020+)**
- `"electrode modification" AND bioelectrochemical AND conductivity`
- `PEDOT AND "microbial fuel cell" AND anode`
- `"metal oxide" AND cathode AND bioelectrochemical`
- Expected: ~135 papers

#### **8. AI/ML Integration (2021+)**
- `"machine learning" AND "microbial fuel cell" AND prediction`
- `"artificial intelligence" AND bioelectrochemical AND optimization`
- Expected: ~45 papers

#### **9. Scale-up Studies (2019+)**
- `"pilot scale" AND "microbial fuel cell" AND performance`
- `scale-up AND bioelectrochemical AND "wastewater treatment"`
- Expected: ~75 papers

**Total Expected**: ~845 high-quality papers

### Paper Quality Scoring

The quality validator (`scripts/literature/paper-quality-validator.ts`) assigns each paper a score from 0-100:

#### **Scoring Components**
1. **Verification (0-20 points)**
   - DOI present: 20 points
   - PubMed/arXiv ID: 15 points
   - External URL with DOI: 10 points
   - No verification: 0 points

2. **Completeness (0-15 points)**
   - Score = (fields present / 5) × 15
   - Required fields: title, authors, abstract, publicationDate, journal

3. **Relevance (0-20 points)**
   - Core terms: +0.2 per term (max 1.0)
   - Related terms: +0.1 per term

4. **Data Richness (0-25 points)**
   - Performance data: +10 points
   - Materials data: +8 points
   - Organism data: +7 points

5. **Recency (0-10 points)**
   - ≤1 year old: 10 points
   - ≤3 years: 8 points
   - ≤5 years: 6 points
   - ≤8 years: 4 points
   - >8 years: 2 points

6. **Impact (0-10 points)**
   - High-impact journals: 10 points
   - Other journals: 5 points

#### **Quality Categories**
- **Excellent (85-100)**: Immediately usable, high confidence
- **Good (70-84)**: Suitable for most purposes
- **Fair (50-69)**: Needs enhancement but usable
- **Poor (<50)**: Requires significant processing

### Enhanced Data Extraction

The extraction system (`scripts/literature/enhanced-data-extractor.ts`) uses pattern matching to extract structured data:

#### **Extraction Capabilities**
1. **Performance Data**
   - Power density (mW/m², W/m³) with conditions
   - Current density (mA/cm², A/m²) with conditions
   - Voltage (OCV, operating, max)
   - Efficiency (coulombic, energy, removal)
   - Hydrogen production rates

2. **Materials Identification**
   - Anode materials with modifications
   - Cathode materials with catalysts
   - Membrane/separator materials
   - Surface treatments and coatings

3. **Microorganism Data**
   - Species names (Geobacter, Shewanella, etc.)
   - Consortium types (mixed culture, biofilm)
   - Source information

4. **System Configuration**
   - Type (MFC, MEC, MDC, MES, BES)
   - Chamber configuration (single, dual, multi)
   - Volume and dimensions
   - Operating conditions (pH, temperature, substrate)

#### **Pattern Matching Engine**
- 50+ specialized regex patterns
- Unit-aware extraction (handles various formats)
- Condition capture (e.g., "at 30°C", "pH 7")
- Confidence scoring for each extraction

### Database Migration and Cloud Storage

MESSAi now uses Prisma PostgreSQL for secure cloud storage:

#### **Migration Process**
1. **Local to Cloud Migration**
   ```bash
   # Push schema to PostgreSQL
   npx prisma db push
   
   # Migrate data
   DATABASE_URL="postgres://..." npx tsx scripts/seed-remote-database.ts
   ```

2. **Current Status (2025-07-08)**
   - Successfully migrated 313 papers to PostgreSQL
   - All papers have verified IDs (DOI/PubMed/arXiv)
   - Ready for continuous enhancement
   - Secure cloud backup enabled

### Processing Commands

```bash
# Collect new papers from APIs
npx tsx scripts/literature/real-paper-collection.ts

# Validate paper quality
npx tsx scripts/literature/paper-quality-validator.ts

# Extract enhanced data
npx tsx scripts/literature/enhanced-data-extractor.ts [limit]

# Process single paper
npx tsx scripts/literature/process-paper.ts [paper-id]

# Generate quality report
npx tsx scripts/literature/quality-report.ts
```

### Best Practices for Paper Collection

1. **API Rate Limiting**
   - CrossRef: 1 second between requests
   - PubMed: Follow NCBI guidelines
   - arXiv: Be respectful, no hard limits
   - Always include proper User-Agent headers

2. **Duplicate Prevention**
   - Check by DOI first (most reliable)
   - Then check by exact title match
   - Consider fuzzy matching for similar titles

3. **Quality Over Quantity**
   - Better to have 300 high-quality papers than 3000 poor ones
   - Focus on papers with performance data
   - Prioritize recent research (2019+)
   - Ensure relevance to bioelectrochemical systems

4. **Data Integrity**
   - Never fabricate or modify paper data
   - Preserve original metadata
   - Track data provenance
   - Version control extraction methods

### Future Enhancements

1. **Additional Sources**
   - IEEE Xplore integration
   - ScienceDirect API
   - Web of Science export
   - Institutional repositories

2. **Advanced Extraction**
   - Machine learning models for extraction
   - Image analysis for figures/charts
   - Table data extraction
   - Full-text PDF processing

3. **Quality Improvements**
   - Author disambiguation
   - Citation network analysis
   - Research trend identification
   - Automated review generation

## 🔬 Enhanced Literature System (2025-07-10 Integration)

The MESSAi literature system has been significantly enhanced with advanced filtering, search capabilities, and comprehensive data extraction from 6,000+ verified research papers.

### Key Features

#### **Advanced Filtering & Search**
- **Multi-field filtering**: Filter by microbes, system types, configurations, performance metrics
- **Performance-based search**: Filter by power output, efficiency ranges
- **Sort options**: Date, power output, efficiency, relevance-based ranking
- **Real-time suggestions**: Dynamic filter options based on available data
- **Authentication-aware**: Respects user permissions while providing full functionality

#### **Enhanced Data Extraction**
- **Comprehensive field extraction**: 18+ new database fields for detailed categorization
- **AI-powered processing**: Pattern matching + LLM-based extraction
- **Performance metrics**: Power density, current density, efficiency with confidence scores
- **Material classification**: Detailed anode/cathode material categorization
- **Microbial taxonomy**: Species, genus, and community-level classification
- **System configuration**: Architecture, scale, and operational parameters

#### **Enhanced API Endpoints**
- **`/api/papers`**: Advanced filtering with 10+ new parameters
- **`/api/papers/filters`**: Dynamic filter options endpoint
- **Authentication preserved**: Full user permission system integrated

#### **Frontend Components**
- **AdvancedFilterPanel**: Tabbed interface with smart autocomplete
- **Performance sliders**: Range-based filtering
- **Quick presets**: High/Medium/Low performance tiers
- **URL persistence**: Filters persist across navigation

### Enhanced Scripts & Utilities

```bash
# Comprehensive paper collection (6,000+ papers)
npm run literature:collect-comprehensive

# Enhanced data extraction with confidence scoring
npm run literature:extract-enhanced

# Database backup with compression
npm run db:backup:enhanced

# Database restore with validation
npm run db:restore:enhanced
```

### Current Integration Status
- ✅ **Schema migration complete**: All new fields added to production database
- ✅ **API enhancement complete**: Advanced filtering fully functional  
- ✅ **Frontend integration complete**: AdvancedFilterPanel component ready
- ✅ **Authentication preserved**: Full security model maintained
- ✅ **Performance optimized**: Database indexes for fast filtering
- ✅ **6,022 papers verified**: All with DOI/PubMed/arXiv verification

## Common Tasks

## Requirements
1. Always review the requirements we delinated together in 'requirements' directory when implementing
2. Use ultrathink to ensure there are no conflicts and you are not breaking features


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

### Troubleshooting Literature Loading Issues
1. Check database connection: `npm run db:studio`
2. Verify API endpoints: `curl http://localhost:3003/api/papers`
3. Check error logs in browser console
4. Run integrity check: `npm run db:integrity`
5. Clear cache and retry
6. Verify authentication state if papers are missing
7. Check pagination settings if results are limited

### Working with Demo Mode
1. **Check current mode**: Look for `getDemoConfig()` usage
2. **Add demo content**: Place in appropriate demo data files
3. **Hide authenticated features**: Add `auth-only-nav` class
4. **External links**: Use production URL from config

### Security Considerations for New Features
1. **Input Validation**: Always validate and sanitize user inputs
2. **Output Encoding**: Use React's built-in XSS protection
3. **Database Queries**: Use Prisma's parameterized queries only
4. **File Operations**: Validate file types and sizes
5. **API Routes**: Check authentication and demo mode

## 🔒 Security & Demo Mode Guidelines

### Demo Mode vs Production
MESSAi operates in two distinct modes with different security requirements:

#### **Demo Mode (Default for Cloned Repos)**
- **Environment**: Set `DEMO_MODE="true"` and `NEXT_PUBLIC_DEMO_MODE="true"`
- **Authentication**: Completely disabled - no local auth forms
- **User Menu**: Shows external links to messai.io for account creation
- **Navigation**: Hides authenticated-only features (My Dashboard, My Experiments)
- **Data**: Uses safe, curated demo content only
- **Purpose**: Showcase platform capabilities without security complexity

#### **Production Mode (messai.io)**
- **Environment**: Set `DEMO_MODE="false"` and configure full auth
- **Authentication**: Full NextAuth.js with database sessions
- **User Menu**: Local login/signup forms
- **Navigation**: Shows personal features when authenticated
- **Data**: Real user data with proper protection
- **Purpose**: Full research platform with user accounts

### Security Best Practices

#### **Environment Variables**
- NEVER commit `.env.local` or any file with real credentials
- Use `.env.example` as template with dummy values
- Production secrets must be set in deployment environment only
- Always check for accidental credential commits before pushing

#### **Authentication Security**
- In demo mode: Remove ALL authentication endpoints
- Use `getDemoConfig()` utility to check mode consistently
- External links must use `target="_blank" rel="noopener noreferrer"`
- Production URLs should come from environment variables

#### **API Route Protection**
```typescript
// Always check demo mode in API routes
import { getDemoConfig } from '@/lib/demo-mode'

export async function POST(request: Request) {
  const demoConfig = getDemoConfig()
  
  if (demoConfig.isDemo) {
    return NextResponse.json({ error: 'Not available in demo mode' }, { status: 403 })
  }
  
  // Production logic here
}
```

#### **Demo Content Guidelines**
- Use realistic but fictional data
- No real researcher names without permission
- No unpublished research data
- Performance metrics should be clearly marked as examples
- Email addresses should use example.com domain

### Implementation Checklist
When implementing features, verify:
- [ ] Demo mode properly disables authentication
- [ ] External links to production are clearly marked
- [ ] No sensitive data in demo content
- [ ] API routes check demo mode
- [ ] Navigation respects authentication state
- [ ] Environment variables are properly separated

## Testing Approach

- **Unit Tests**: Individual functions and components
- **Integration Tests**: User workflows
- **API Tests**: Endpoint validation
- **Performance Tests**: 3D rendering optimization
- **Accessibility Tests**: WCAG compliance
- **Literature Tests**: Loading states, error handling, data integrity
- **Security Tests**: Demo mode verification, API protection, input validation

### Security Testing
- **Demo Mode Tests**: Verify auth is properly disabled
- **API Protection Tests**: Ensure routes check authentication
- **Input Validation Tests**: Test against malicious inputs
- **Navigation Tests**: Verify auth-based visibility
- **External Link Tests**: Check proper attributes

## Deployment

### Security Configuration

#### **Development (Demo Mode)**
- Local with SQLite
- Demo mode enabled by default
- No real authentication required
- Safe for public repositories

#### **Production (messai.io)**
- Vercel + PostgreSQL
- Full authentication enabled
- Environment variables in Vercel dashboard
- SSL/TLS required
- Regular security audits

### Pre-Deployment Checklist
- [ ] Remove all console.log with sensitive data
- [ ] Verify demo mode is default in .env.example
- [ ] Check no credentials in codebase
- [ ] Validate all API routes have proper protection
- [ ] Test demo mode functionality
- [ ] Verify external links work correctly

- **Docker**: Full stack available with docker-compose
- **CI/CD**: GitHub Actions configured

## Known Considerations

1. **3D Performance**: May need optimization for older devices
2. **Scientific Accuracy**: All predictions based on published research
3. **Browser Support**: WebGL required for 3D visualization
4. **Mobile Experience**: Responsive but optimized for desktop
5. **Literature Loading**: Large datasets may require pagination optimization
6. **API Rate Limits**: External APIs (CrossRef, PubMed) have rate limits
7. **Data Integrity**: Literature system must only contain verified research

## Future Enhancements

- Real-time sensor integration
- Collaborative experiments
- Machine learning model improvements
- Mobile native app
- Multi-language support

## Important Files to Review

- `app/page.tsx` - Main design catalog
- `components/MESS3DModel.tsx` - Core 3D visualization
- `lib/ai-predictions.ts` - Prediction logic
- `prisma/schema.prisma` - Database structure
- `app/literature/` - Literature browsing interface
- `app/api/papers/` - Paper API endpoints
- `scripts/literature/` - Enhancement pipeline
- `components/ErrorBoundary.tsx` - Error handling wrapper
- `scripts/literature/README.md` - Literature system documentation

### Literature Validation Framework Files (2025-07)
- `lib/literature/data-validation.ts` - Core validation schemas and unit conversion
- `scripts/literature/enhanced-ollama-processor.ts` - Multi-model AI processing
- `scripts/literature/advanced-pattern-matching.ts` - Regex-based extraction (50+ patterns)
- `scripts/literature/google-scholar-scraper.ts` - Targeted research paper scraping
- `scripts/literature/test-validation-system.ts` - Validation testing utility
- `scripts/literature/final-quality-report.ts` - Database quality assessment
- `quality-validation-report.md` - Latest quality metrics and status

### Security-Critical Files
- `lib/demo-mode.ts` - Demo mode configuration
- `middleware.ts` - Route protection logic
- `components/ClientLayout.tsx` - Navigation visibility
- `components/UserMenu.tsx` - Authentication UI
- `.env.example` - Safe environment template
- `app/api/*` - All API routes need protection

## Research References

The platform is based on peer-reviewed research:
- Logan, B.E. (2008). Microbial Fuel Cells (comprehensive MFC reference)
- Rozendal, R.A. et al. (2008). Hydrogen Production with MECs
- Wang, H. & Ren, Z.J. (2013). Bioelectrochemical Metal Recovery
- Anasori, B. et al. (2017). 2D Metal Carbides (MXenes)
- Rabaey, K. & Rozendal, R.A. (2010). Microbial Electrosynthesis

## Contact

For scientific questions or collaborations, the platform targets:
- University research labs
- Environmental engineering departments
- Wastewater treatment facilities
- Sustainable architecture firms

## 🤖 AI Assistant Security Guidelines

When working on MESSAi, always:

1. **Assume Demo Mode First**: Default to demo-safe implementations
2. **Protect Credentials**: Never generate real API keys or passwords
3. **Check Before Committing**: Verify no sensitive data in changes
4. **Use Safe Examples**: Demo data should be clearly fictional
5. **Validate Everything**: Input validation is mandatory
6. **Document Security**: Note security implications in comments
7. **Test Both Modes**: Ensure features work in demo and production

### Red Flags to Avoid
- Hardcoded credentials or API keys
- Real email addresses in demo data
- Bypassing authentication checks
- Direct database queries without Prisma
- Missing input validation
- Unprotected API routes
- Local storage of sensitive data

    - MESS Parameters JSON Schema Compliance
      - How to use the 500+ parameters from mess-parameters-json.json
      - Parameter categories (18 major categories, 80 subcategories)
      - Electrode configuration standards (separate anode/cathode parameters)
      - Type safety and validation requirements

    2. Conflict Prevention Between System Types

    - MESS vs Fuel Cell Parameter Mapping
      - How MFCConfig relates to fuel cell parameters
      - Avoiding parameter collisions between systems
      - Proper parameter inheritance and overrides
      - Interface type definitions for different system types

    3. Fuel Cell Systems Standards

    - White Paper Compliance Requirements
      - 700 bar hydrogen storage systems
      - Multi-fidelity modeling approach (high/medium/low)
      - Control system integration (thermal, pressure, humidity, flow)
      - Gas composition management (N2, O2, H2, H2O)
      - Performance metrics and safety thresholds

    4. Implementation Guidelines

    - Parameter Validation Rules
      - Type checking for electrode configurations
      - Range validation for operating conditions
      - Cross-system parameter compatibility checks
      - Error handling for invalid combinations

    5. Code Examples and Best Practices

    - Interface definitions for parameter structures
    - How to extend existing configs without conflicts
    - Validation functions for parameter checking
    - Migration strategies for adding new parameters

    Key Points to Address

    1. Parameter Consistency: Ensure MESS and fuel cell parameters use consistent naming and units
    2. Type Safety: Leverage TypeScript interfaces to prevent configuration errors  
    3. Validation: Add runtime checks for parameter ranges and compatibility
    4. Documentation: Clear examples of proper parameter usage
    5. Conflict Resolution: Guidelines for handling overlapping parameter spaces
    6. Future-Proofing: How to add new system types without breaking existing ones

    Integration with Existing CLAUDE.md

    - Will be added as a new major section after "AI Prediction Model"
    - Cross-references existing sections on system configuration
    - Builds on the requirements directory structure mentioned
    - Aligns with scientific accuracy and testing approach guidelines

Remember: MESSAI is open source but we have the secure separation for our marketing site and freemium software platform. 

---

*This file helps AI assistants understand the project context, make appropriate decisions, and maintain consistency with the scientific and technical requirements of MESSAi.*