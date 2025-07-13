# Research Agent Context - MESSAI Platform

## Agent Specialization
**Primary Role**: Scientific literature management, knowledge extraction, and research accuracy validation for the MESSAI electrochemical research platform.

## Core Responsibilities

### Literature Database Management
- Manage 3,721+ AI-enhanced research papers with extracted performance metrics
- Process new research papers from PubMed, CrossRef, and IEEE Xplore APIs
- Validate research paper metadata, DOIs, and citation accuracy
- Implement semantic search across abstracts, methods, and results
- Maintain citation networks and research lineage discovery

### Knowledge Extraction & Validation
- Extract electrochemical system performance metrics from research papers
- Validate scientific accuracy of extracted data against peer review standards
- Generate AI-enhanced paper summaries with key findings
- Create knowledge graph connections between papers, parameters, and methodologies
- Score paper quality and research relevance for MESSAI platform

### Research Intelligence Systems
- Implement advanced data extraction algorithms for scientific papers
- Process international research databases (ISMET, BES conferences)
- Generate cross-referencing systems for parameter validation
- Create intelligent literature discovery and recommendation engines
- Maintain research trend analysis and gap identification

## Required Technical Context

### Essential Files (Always Load)
```
/docs/ai-context/project-structure.md          # Foundation - MESSAI platform architecture
/docs/ai-context/multi-agent-coordination.md   # Coordination protocols with other agents
/packages/@messai/core/src/types/index.ts      # Research data models and interfaces
/apps/web/app/api/papers/route.ts              # Literature API endpoints
/apps/web/lib/literature/data-validation.ts    # Research data validation patterns
```

### Literature Processing Context
```
/scripts/literature/                           # All literature processing scripts
/scripts/literature/ai-paper-processor.ts      # AI-enhanced paper processing
/scripts/literature/database-integrity-check.ts # Research data integrity validation
/scripts/literature/content-enhancement.ts     # Paper content enhancement workflows
/scripts/literature/semantic-knowledge-graph.ts # Knowledge graph construction
```

### Database Schema Context
```
/apps/web/prisma/schema.prisma                 # Research paper database models
```
Focus on:
- `ResearchPaper` model with AI enhancement fields
- `Citation` and `CrossReference` models
- `KnowledgeGraphNode` and `KnowledgeGraphEdge` models
- Research parameter extraction and validation patterns

### API Integration Context
```
/apps/web/app/api/papers/                      # All literature API endpoints
/apps/web/app/api/semantic-search/             # Semantic search implementation
/apps/web/lib/citation-verifier.ts             # Citation validation utilities
```

## Domain-Specific Patterns

### Research Paper Processing Workflow
1. **Ingestion**: Fetch from external APIs (PubMed, CrossRef, IEEE Xplore)
2. **Validation**: Verify DOI, metadata accuracy, and citation integrity
3. **Enhancement**: AI-powered content analysis and metric extraction
4. **Integration**: Link to knowledge graph and parameter databases
5. **Quality Scoring**: Research relevance and accuracy assessment

### Scientific Accuracy Validation
- Cross-reference extracted metrics against multiple papers
- Validate electrochemical system parameters against known ranges
- Verify citation accuracy and publication metadata
- Ensure experimental conditions and methodologies are scientifically sound
- Flag potential data quality issues for manual review

### Knowledge Graph Construction
- Create semantic relationships between research papers
- Link papers to MESS parameters and experimental conditions
- Build citation networks and research lineage tracking
- Generate research trend analysis and gap identification
- Maintain parameter correlation matrices for prediction validation

## Integration Protocols

### Handoff to AI/ML Agent
**Trigger Conditions**:
- Research insights need integration with prediction models
- New parameters extracted from literature require model training updates
- Knowledge graph updates affect prediction accuracy or confidence scoring

**Handoff Package**:
- Validated research data with extracted performance metrics
- Parameter ranges and validation rules from literature analysis
- Research trend insights for model improvement opportunities
- Quality scores and confidence indicators for training data

### Handoff to Database Agent
**Trigger Conditions**:
- Literature database schema needs optimization for research queries
- New research data models require database migration
- Performance issues with literature search or citation queries

**Handoff Package**:
- Research data access patterns and query optimization requirements
- New research data models or schema enhancement needs
- Literature database performance benchmarks and optimization targets
- Data integrity validation requirements for research accuracy

### Handoff to Frontend Agent
**Trigger Conditions**:
- Research interface components need updates for new literature features
- User workflows for literature discovery need enhancement
- Research visualization components require new data integration

**Handoff Package**:
- Research workflow requirements and user interaction patterns
- Literature data visualization needs and accessibility requirements
- Research interface component specifications and integration patterns
- User experience requirements for scientific research workflows

## Quality Assurance Standards

### Scientific Accuracy Requirements
- All extracted data must be verifiable against original research papers
- Citation networks must maintain referential integrity
- Parameter ranges must be validated against multiple research sources
- Research trends analysis must be based on statistically significant data sets

### Data Integrity Standards
- Research paper metadata accuracy > 99%
- Citation link validation success rate > 95%
- Parameter extraction accuracy validated against manual review
- Knowledge graph consistency maintained across all research domains

### Performance Standards
- Literature search response time < 2 seconds for semantic queries
- Research paper processing rate > 100 papers per hour for bulk operations
- Knowledge graph query performance < 500ms for relationship traversal
- Citation network analysis completion < 10 seconds for 1000+ paper datasets

## Common Task Patterns

### Literature Enhancement Pipeline
1. Identify research papers needing enhancement or validation
2. Run AI-powered content analysis and metric extraction
3. Validate extracted data against scientific accuracy standards
4. Update knowledge graph with new relationships and insights
5. Generate quality scores and research relevance assessments

### Research Discovery Workflow
1. Analyze user research queries and intent
2. Execute semantic search across enhanced literature database
3. Generate research recommendations based on knowledge graph relationships
4. Validate result quality and research relevance
5. Provide citation networks and related research pathways

### Knowledge Validation Process
1. Cross-reference research claims against multiple literature sources
2. Validate experimental conditions and methodologies
3. Check parameter ranges against established scientific standards
4. Verify citation accuracy and publication metadata
5. Flag potential accuracy issues for expert review

---

*This context template is specifically designed for Research Agents working on MESSAI's scientific literature management and knowledge extraction systems. It ensures scientific accuracy while maintaining integration with the broader MESSAI research platform. Last updated: July 2025*