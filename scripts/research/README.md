# Literature Enhancement System

A comprehensive system for managing, enhancing, and maintaining high-quality research papers in the MESSAi literature database.

## 🎯 Overview

This system ensures that only **real, high-quality, relevant research papers** are included in the literature database, with comprehensive data extraction and quality scoring.

## 📋 Features

### ✅ What This System Does
- **Removes all fake/AI-generated papers** from the database
- **Fetches real research papers** from CrossRef, PubMed, and arXiv APIs
- **Extracts comprehensive data** including performance metrics, materials, and experimental conditions
- **Scores paper quality** based on authenticity, relevance, and completeness
- **Enhances content** with full-text analysis and deep insights
- **Monitors data integrity** with automated quality checks

### 🚫 What This System Eliminates
- AI-generated papers
- Fake research content
- Papers without verification (DOI/PubMed/arXiv IDs)
- Low-quality or irrelevant content
- Broken external links
- Incomplete or unreliable data

## 🛠️ Available Scripts

### Core Enhancement Pipeline
```bash
# Run the complete enhancement pipeline
npm run literature:enhance-all

# With options:
npm run literature:enhance-all -- --skip-cleanup --limit-processing 50
```

### Individual Enhancement Steps
```bash
# 1. Clean up fake papers
npm run db:cleanup-fake
npm run db:cleanup-fake -- --dry-run  # Preview only

# 2. Extract advanced data from papers
npm run db:extract-data
npm run db:extract-data -- 25  # Limit to 25 papers

# 3. Score paper quality
npm run db:quality-score  
npm run db:quality-score -- 50  # Limit to 50 papers

# 4. Enhance content with full-text analysis
npm run db:enhance-content
npm run db:enhance-content -- 25  # Limit to 25 papers

# 5. Process papers with AI for summaries and insights
npm run ai:process                    # Process 10 papers (default)
npm run ai:process -- --batch 20      # Process 20 papers
npm run ai:process -- --paper [id]    # Process specific paper
npm run ai:process -- --stats         # Show AI processing stats
```

### Quality Monitoring
```bash
# Check database integrity
npm run db:integrity

# Validate external links
npm run db:validate-links
npm run db:validate-links -- 50  # Check 50 links
```

## 🤖 AI Paper Processing

The AI paper processor uses OpenRouter to generate summaries, extract key findings, and provide insights for research papers.

### Setup
1. Get an OpenRouter API key from https://openrouter.ai/keys
2. Add to your `.env` file:
   ```bash
   OPENROUTER_API_KEY="your-api-key-here"
   ```

### Features
- **AI Summary**: 2-3 sentence overview of paper's main contribution
- **Key Findings**: 3-5 important discoveries extracted
- **Methodology Summary**: Brief description of experimental approach
- **Research Implications**: Potential applications and impact
- **Data Extraction**: Materials, organisms, performance metrics, conditions
- **AI Insights**: How the research advances the field
- **Confidence Score**: Quality indicator for AI extraction

### Models Supported
By default uses `openai/gpt-4-turbo` through OpenRouter. Other options:
- `anthropic/claude-3-opus` - Excellent for scientific text
- `openai/gpt-3.5-turbo` - Faster, lower cost
- Any model available on OpenRouter

## 📊 Data Extraction Capabilities

### Performance Metrics
- **Power Density** (mW/m², W/m², kW/m²)
- **Current Density** (mA/m², A/m²)
- **Voltage** (V, mV)
- **Coulombic Efficiency** (%)
- **Energy Efficiency** (%)
- **Internal Resistance** (Ω)

### Materials Data
- **Anode Materials**: Carbon cloth, graphene, MXenes, carbon nanotubes, etc.
- **Cathode Materials**: Platinum catalysts, air cathodes, carbon materials
- **Membrane Types**: Nafion, CEM, AEM, salt bridges
- **Material Preparation**: Surface modifications, coatings, treatments

### Operational Conditions
- **Temperature Range** (°C)
- **pH Values**
- **Conductivity** (mS/cm)
- **Substrate COD** (mg/L)
- **Hydraulic Retention Time** (hours)
- **Load Resistance** (Ω)

### Microbial Data
- **Organisms**: Geobacter, Shewanella, mixed cultures, etc.
- **Inoculum Sources**: Wastewater sludge, marine sediment, soil
- **Community Analysis**: 16S sequencing, phylogenetic data
- **Diversity Metrics**

### System Configuration
- **System Types**: MFC, MEC, MDC, MES, BES
- **Configurations**: Single-chamber, dual-chamber, stacked
- **Scale**: Laboratory, pilot, industrial
- **Reactor Volumes** and electrode areas

## 🏆 Quality Scoring System

Papers are scored on multiple dimensions:

### Authenticity (0-100)
- ✅ Has DOI/PubMed/arXiv ID: +40 points
- ✅ Has external URL: +20 points  
- ✅ From reputable source: +20 points
- ✅ Has detailed abstract: +10 points
- ✅ Real author names: +10 points

### Relevance (0-100)
- MES-specific keywords
- System type specificity
- Performance data availability
- Technical depth

### Completeness (0-100)
- Essential fields (abstract, authors, dates)
- Technical data (performance, materials)
- Publication details

### Impact (0-100)
- Citation count
- Journal impact factor
- Publication in high-impact venues

### Methodology (0-100)
- Experimental setup details
- Quantitative data
- Statistical analysis

## 📈 Enhancement Pipeline

### Step 1: Cleanup 🧹
- Identifies and removes fake papers
- Checks for AI-generated content patterns
- Preserves only verified research

### Step 2: Fetch New Papers 📥
- Searches high-quality journals and databases
- Fetches papers with proper verification IDs
- Filters for MES relevance

### Step 3: Extract Data 🔬
- Advanced pattern matching for technical data
- Performance metrics extraction
- Materials and organisms identification

### Step 4: Quality Scoring 📊
- Multi-dimensional quality assessment
- Authenticity verification
- Relevance and impact scoring

### Step 5: Content Enhancement 🚀
- Full-text analysis when available
- Deep technical insights extraction
- Innovation and comparative analysis

## 📋 Quality Targets

| Metric | Current Target | Excellent |
|--------|----------------|-----------|
| Real Papers | >80% | >90% |
| Average Quality Score | >75/100 | >85/100 |
| Performance Data Coverage | >70% | >85% |
| Papers with External Links | >95% | >98% |
| Broken Links | <5% | <2% |

## 🔍 Monitoring & Alerts

The system includes automated monitoring for:

- **Database Integrity**: Daily checks for data consistency
- **Link Validation**: Regular verification of external URLs
- **Quality Degradation**: Alerts when quality metrics drop
- **New Content**: Notifications for newly added papers

## 📊 Reports Generated

All enhancement operations generate detailed reports:

- **Cleanup Reports**: What was removed and why
- **Enhancement Reports**: Data extraction results and confidence scores
- **Quality Reports**: Scoring breakdowns and recommendations
- **Pipeline Reports**: End-to-end execution summaries

Reports are saved in the `reports/` directory with timestamps.

## ⚙️ Configuration

### Pipeline Options
```bash
# Skip cleanup (if already done)
--skip-cleanup

# Skip fetching new papers
--skip-fetching

# Limit new papers to fetch
--limit-new 10

# Limit papers to process in each step
--limit-processing 50
```

### Quality Thresholds
Quality thresholds can be adjusted in the respective service classes:

- **Authenticity**: Minimum 70/100 for inclusion
- **Relevance**: Minimum 60/100 for MES papers
- **Completeness**: Minimum 50/100 for useful data

## 🚀 Getting Started

1. **Run Full Enhancement Pipeline** (Recommended for first time):
   ```bash
   npm run literature:enhance-all
   ```

2. **For Regular Maintenance**:
   ```bash
   # Weekly: Check integrity and validate links
   npm run db:integrity
   npm run db:validate-links

   # Monthly: Fetch new papers and enhance
   npm run db:extract-data -- 25
   npm run db:quality-score -- 25
   ```

3. **Review Reports**:
   - Check the `reports/` directory for detailed analysis
   - Monitor quality metrics trends
   - Address any issues highlighted in recommendations

## 📝 Best Practices

1. **Always backup** before running cleanup operations
2. **Review reports** after each enhancement run
3. **Monitor quality metrics** regularly
4. **Update search terms** to capture new research areas
5. **Validate samples** of enhanced data manually

## 🔧 Troubleshooting

### Common Issues

**Pipeline fails during cleanup**:
- Check database connectivity
- Ensure sufficient disk space
- Review cleanup logs for specific errors

**Low quality scores**:
- Verify DOI/PubMed/arXiv IDs are being captured
- Check if abstracts are being extracted properly
- Review relevance keyword patterns

**External link validation fails**:
- Check network connectivity
- Verify rate limiting isn't causing timeouts
- Review API endpoint availability

### Support

For issues or questions about the literature enhancement system:

1. Check the reports directory for error details
2. Review console output for specific error messages
3. Verify database connection and permissions
4. Check that all required APIs are accessible

---

**Generated by MESSAi Literature Enhancement System**