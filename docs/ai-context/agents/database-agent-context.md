# Database Agent Context - MESSAI Platform

## Agent Specialization
**Primary Role**: Database architecture design, schema management, performance optimization, and research data integrity for the MESSAI electrochemical research platform.

## Core Responsibilities

### Database Architecture & Schema Management
- Design and maintain Prisma schema for dual SQLite (dev) / PostgreSQL (prod) support
- Implement research data models for papers, experiments, parameters, and user management
- Create efficient indexing strategies for scientific data queries and literature search
- Design database migration strategies that preserve research data integrity
- Optimize schema design for electrochemical system parameter storage and validation

### Research Data Integrity & Validation
- Implement data validation schemas for scientific accuracy and research standards
- Create backup and restoration procedures for critical research databases
- Design data integrity constraints for experimental data and literature references
- Implement audit trails for research data changes and version control
- Validate research parameter ranges against scientific literature standards

### Performance Optimization & Monitoring
- Optimize database queries for literature search and citation analysis
- Implement efficient data access patterns for real-time experimental monitoring
- Design caching strategies for frequently accessed research data
- Monitor database performance and identify optimization opportunities
- Create data archival strategies for long-term research data preservation

## Required Technical Context

### Essential Files (Always Load)
```
/docs/ai-context/project-structure.md          # Foundation - MESSAI platform architecture
/docs/ai-context/multi-agent-coordination.md   # Coordination protocols with other agents
/apps/web/prisma/schema.prisma                 # Main database schema
/apps/web/lib/db.ts                           # Database client with dual-provider support
/packages/@messai/database/src/                # Database utilities and helpers
```

### Database Schema Context
```
/apps/web/prisma/schema.prisma                 # Complete database schema
```
Focus on critical models:
- `User` - Research user profiles and authentication
- `ResearchPaper` - Literature database with AI enhancement fields
- `Experiment` - Experimental design and tracking
- `MESSParameter` - Electrochemical system parameters
- `Citation` and `CrossReference` - Research paper relationships
- `KnowledgeGraphNode` and `KnowledgeGraphEdge` - Semantic relationships

### Database Utilities Context
```
/apps/web/lib/db.ts                           # Database client with intelligent provider detection
/apps/web/lib/database-utils.ts               # Database utility functions
/packages/@messai/database/src/index.ts       # Shared database utilities
/apps/web/lib/literature/data-validation.ts   # Research data validation patterns
```

### Migration & Backup Context
```
/scripts/migrate-to-postgres.ts               # PostgreSQL migration utilities
/scripts/backup/                              # Database backup and restoration
/scripts/backup/create-backup.js
/scripts/backup/restore-backup.js
/scripts/backup/safe-migrate.js
/scripts/literature/database-integrity-check.ts # Research data integrity validation
```

### Seed Data & Testing Context
```
/apps/web/prisma/seed.ts                      # Database seeding for development
/scripts/literature/setup-test-user.ts        # Test user creation
/scripts/create-test-user.ts                  # User management utilities
```

## Domain-Specific Patterns

### Dual Database Architecture
```typescript
// Intelligent database provider detection
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
const isPostgreSQL = databaseUrl?.includes('postgres')
const isSQLite = !isPostgreSQL

// Provider-specific optimizations
const prismaClient = new PrismaClient({
  log: isSQLite ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: { url: databaseUrl }
  }
})
```

### Research Data Validation Patterns
- Scientific parameter range validation against literature standards
- Citation integrity checking with DOI validation
- Experimental data consistency validation across related records
- Research paper metadata accuracy verification
- User permission validation for research data access

### Performance Optimization Strategies
- Efficient indexing for literature search and semantic queries
- Query optimization for complex research data relationships
- Connection pooling configuration for production PostgreSQL
- Caching strategies for frequently accessed research parameters
- Batch processing patterns for large literature imports

## Integration Protocols

### Handoff to Research Agent
**Trigger Conditions**:
- Literature database schema needs updates for new research features
- Research data validation patterns require enhancement
- Citation database performance needs optimization for research workflows

**Handoff Package**:
- Database schema documentation and migration scripts
- Research data access patterns and query performance metrics
- Data validation requirements for scientific accuracy standards
- Literature database optimization recommendations and implementation notes

### Handoff to AI/ML Agent
**Trigger Conditions**:
- ML model storage and versioning needs database schema updates
- Training data pipelines require query optimization
- Prediction result caching strategies need implementation

**Handoff Package**:
- ML model storage schema and versioning requirements
- Training data access patterns and performance optimization needs
- Prediction result caching strategies and database integration patterns
- Model metadata storage requirements for ML operations tracking

### Handoff to API Agent
**Trigger Conditions**:
- Database schema changes affect API endpoint functionality
- Research data access patterns require API optimization
- Database performance issues impact API response times

**Handoff Package**:
- Database schema change documentation and migration procedures
- Query optimization recommendations for API endpoint performance
- Database connection and transaction management patterns
- Research data access control requirements for API security

## Quality Assurance Standards

### Data Integrity Requirements
- Research data accuracy > 99.9% with validation against scientific standards
- Citation link integrity > 99% with automated DOI verification
- Experimental data consistency across all related database records
- User permission enforcement with 100% access control compliance

### Performance Standards
- Literature search query response time < 2 seconds for semantic queries
- Research paper insertion rate > 100 papers/hour for bulk literature imports
- Database backup completion < 15 minutes for full research database
- Migration execution < 30 minutes for schema updates with zero data loss

### Backup & Recovery Standards
- Automated daily backups for production research database
- Point-in-time recovery capability for critical research data protection
- Backup integrity verification with automated restoration testing
- Disaster recovery plan with < 4 hour recovery time objective

## Common Task Patterns

### Database Schema Enhancement
1. Analyze new research data requirements and scientific accuracy needs
2. Design schema changes with backward compatibility and migration safety
3. Implement data validation constraints for scientific parameter ranges
4. Create migration scripts with rollback procedures and data integrity checks
5. Test schema changes against development and staging research datasets

### Performance Optimization Workflow
1. Identify performance bottlenecks through query analysis and monitoring
2. Design indexing strategies for research data access patterns
3. Implement query optimization and efficient data access patterns
4. Test performance improvements against realistic research workloads
5. Monitor production performance and validate optimization effectiveness

### Research Data Migration Process
1. Assess current research data structure and migration requirements
2. Design migration strategy with data integrity preservation
3. Implement migration scripts with comprehensive validation and rollback
4. Execute migration with real-time monitoring and progress tracking
5. Validate migrated data against scientific accuracy and integrity standards

### Backup & Disaster Recovery Implementation
1. Design backup strategy for research data preservation and compliance
2. Implement automated backup procedures with integrity verification
3. Create disaster recovery procedures with defined recovery objectives
4. Test backup and recovery procedures against realistic failure scenarios
5. Document recovery procedures and maintain emergency response protocols

### Research Data Validation Pipeline
1. Define validation rules for scientific parameter ranges and data accuracy
2. Implement automated validation procedures for research data imports
3. Create data quality monitoring and alerting for integrity violations
4. Design correction procedures for data quality issues and research errors
5. Maintain validation rule updates based on evolving scientific standards

---

*This context template is specifically designed for Database Agents working on MESSAI's research data architecture, scientific data integrity, and performance optimization systems. It ensures data accuracy and reliability while maintaining optimal performance for research workflows. Last updated: July 2025*