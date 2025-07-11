# MESSAi Deployment Scenarios Guide

## Quick Start

**Choose your deployment scenario:**

| Need | Scenario | Branch | Guide |
|------|----------|--------|-------|
| 🧪 Lab tools only | [Laboratory](#laboratory-deployment) | `messai-lab` | [Jump to guide](#laboratory-deployment) |
| 📚 Research papers only | [Research](#research-deployment) | `messai-research` | [Jump to guide](#research-deployment) |
| 🔬 Lab + Research | [Combined](#combined-deployment) | `research-lab` | [Jump to guide](#combined-deployment) |
| 🏢 Everything | [Enterprise](#enterprise-deployment) | `master` | [Jump to guide](#enterprise-deployment) |
| 🎓 Demo/Teaching | [Educational](#educational-deployment) | `master` (demo) | [Jump to guide](#educational-deployment) |

---

## Laboratory Deployment

### Overview
Deploy only the laboratory tools for institutions focused on hardware and experimental design.

**Perfect for:**
- University laboratory facilities
- Equipment manufacturers
- Research institutions with existing literature systems
- Teams focused on bioreactor optimization

### Features Included
✅ **Bioreactor Design Tool**
- Interactive 3D modeling
- Real-time parameter adjustment  
- Material optimization
- Flow simulation

✅ **Electroanalytical Tools**
- Voltammetry simulation
- Impedance spectroscopy modeling
- Performance prediction
- Data visualization

✅ **Material Database**
- 27+ electrode materials
- Cost analysis
- Performance metrics
- Compatibility matrix

❌ **Not Included**
- Research paper database
- Literature analytics
- User authentication
- Experiment tracking (full version)

### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/messai/messai.git
cd messai

# 2. Switch to lab worktree
git worktree add ../messai-lab-deploy messai-lab
cd ../messai-lab-deploy

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local:
# DEPLOYMENT_MODE=laboratory
# NEXT_PUBLIC_SITE_URL=https://lab.yourdomain.com

# 5. Build and deploy
npm run build
npm start

# Or deploy to Vercel
vercel --prod
```

### Configuration Options

```javascript
// config/deployment.js
export const labDeploymentConfig = {
  features: {
    bioreactor: true,
    electroanalytical: true,
    materials: true,
    literature: false,
    auth: false,
    experiments: 'basic' // basic tracking only
  },
  branding: {
    title: 'MESSAi Laboratory Tools',
    logo: '/lab-logo.png'
  },
  api: {
    endpoints: ['/api/bioreactor', '/api/materials', '/api/predictions']
  }
}
```

### Customization
- Modify `/components/lab/*` for UI changes
- Update `/lib/lab/*` for calculation logic
- Add custom materials in `/data/materials.json`

---

## Research Deployment

### Overview
Deploy the comprehensive research and literature system for academic researchers.

**Perfect for:**
- University research departments
- Literature review teams
- PhD students and postdocs
- Research consortiums

### Features Included
✅ **Research Database**
- 3,721+ verified papers
- Advanced search and filtering
- Citation network analysis
- Full-text search

✅ **AI Analytics**
- Automated insights extraction
- Trend analysis
- Research gap identification
- Recommendation engine

✅ **Knowledge Management**
- Personal libraries
- Annotation tools
- Export capabilities
- Collaboration features

❌ **Not Included**
- Laboratory design tools
- Hardware integration
- Bioreactor modeling
- Material optimization

### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/messai/messai.git
cd messai

# 2. Switch to research worktree
git worktree add ../messai-research-deploy messai-research
cd ../messai-research-deploy

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local:
# DEPLOYMENT_MODE=research
# DATABASE_URL=your_postgres_url
# NEXT_PUBLIC_SITE_URL=https://research.yourdomain.com

# 5. Setup database
npx prisma migrate deploy
npx prisma db seed

# 6. Build and deploy
npm run build
npm start
```

### Database Requirements

```sql
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector";  -- For embeddings

-- Minimum database specs
-- Storage: 10GB for papers + growth
-- RAM: 4GB minimum
-- CPU: 2 cores minimum
```

### API Configuration

```javascript
// config/research-api.js
export const researchAPIConfig = {
  rateLimit: {
    anonymous: 100, // requests per hour
    authenticated: 1000
  },
  search: {
    maxResults: 100,
    defaultPageSize: 20
  },
  export: {
    formats: ['bibtex', 'ris', 'csv', 'json'],
    maxPapers: 500
  }
}
```

---

## Combined Deployment

### Overview
Deploy both laboratory tools and research system for comprehensive research institutions.

**Perfect for:**
- Research universities
- National laboratories  
- R&D departments
- Innovation centers

### Features Included
✅ **Everything from Lab Deployment**
✅ **Everything from Research Deployment**
✅ **Integration Features**
- Literature-guided lab design
- Lab results linked to papers
- Cross-system search
- Unified dashboard

### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/messai/messai.git
cd messai

# 2. Create combined deployment (Phase 4)
git checkout research-lab  # Coming in Phase 4
# Or manually merge:
git checkout -b combined-deploy master
git merge messai-lab
git merge messai-research

# 3. Install dependencies
npm install

# 4. Configure for combined mode
cp .env.example .env.local
# Edit .env.local:
# DEPLOYMENT_MODE=combined
# ENABLE_LAB=true
# ENABLE_RESEARCH=true

# 5. Build and deploy
npm run build:combined
npm start
```

### Integration Features

```typescript
// Enhanced workflows in combined mode
interface CombinedWorkflow {
  // Start with literature review
  literatureReview: {
    searchPapers: (query: string) => Paper[]
    extractParameters: (papers: Paper[]) => LabParameters
  }
  
  // Design based on literature
  labDesign: {
    suggestMaterials: (papers: Paper[]) => Material[]
    optimizeFromLiterature: (params: LabParameters) => Design
  }
  
  // Connect results back
  publishResults: {
    linkToReferences: (experiment: Experiment, papers: Paper[]) => void
    compareWithLiterature: (results: Results) => Comparison
  }
}
```

---

## Enterprise Deployment

### Overview
Full-featured deployment with all systems, authentication, and enterprise features.

**Perfect for:**
- Commercial research facilities
- Multi-site organizations
- Subscription-based services
- Research platforms

### Features Included
✅ **All Features from All Deployments**
✅ **Enterprise Additions**
- Multi-tenant support
- Advanced authentication (SSO, SAML)
- Team management
- Usage analytics
- API access
- Priority support

### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/messai/messai.git
cd messai

# 2. Use master branch
git checkout master

# 3. Install dependencies
npm install

# 4. Configure for enterprise
cp .env.example .env.production
# Configure all required environment variables

# 5. Setup infrastructure
docker-compose up -d  # PostgreSQL, Redis, etc.

# 6. Deploy with high availability
# Use Kubernetes manifests in /k8s directory
kubectl apply -f k8s/
```

### Enterprise Configuration

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: messai-config
data:
  deployment_mode: "enterprise"
  features: |
    {
      "lab": true,
      "research": true,
      "experiments": true,
      "collaboration": true,
      "api": true,
      "analytics": true
    }
  scaling: |
    {
      "minReplicas": 2,
      "maxReplicas": 10,
      "targetCPU": 70
    }
```

### Security Requirements

- **Authentication**: OAuth2/OIDC provider required
- **Database**: Encrypted at rest
- **Network**: HTTPS only, WAF recommended
- **Compliance**: GDPR, SOC2 ready
- **Backups**: Automated daily backups

---

## Educational Deployment

### Overview
Demo mode deployment perfect for teaching and public demonstrations.

**Perfect for:**
- University courses
- Workshops and tutorials
- Public demonstrations
- Open science initiatives

### Features Included
✅ **All Platform Features**
✅ **Educational Enhancements**
- Guided tutorials
- Sample datasets
- No authentication required
- Reset capabilities
- Simplified UI options

### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/messai/messai.git
cd messai

# 2. Use master with demo mode
git checkout master

# 3. Install dependencies
npm install

# 4. Configure for demo
cp .env.example .env.local
# Edit .env.local:
# DEPLOYMENT_MODE=demo
# DEMO_MODE=true
# NEXT_PUBLIC_DEMO_MODE=true

# 5. Build and deploy
npm run build:demo
npm start

# For static export (no server required)
npm run export:demo
# Deploy /out directory to any static host
```

### Demo Configuration

```javascript
// config/demo.js
export const demoConfig = {
  // Pre-loaded sample data
  sampleData: {
    papers: 50,        // Curated papers
    experiments: 10,   // Example experiments
    designs: 5         // Pre-made designs
  },
  
  // Simplified features
  features: {
    advancedSearch: false,
    aiInsights: 'basic',
    export: 'limited'
  },
  
  // Reset options
  reset: {
    enabled: true,
    schedule: 'daily',  // Reset data daily
    preserveBookmarks: true
  }
}
```

### Educational Resources

```
/educational
├── tutorials/
│   ├── 01-introduction.md
│   ├── 02-literature-review.md
│   ├── 03-lab-design.md
│   └── 04-data-analysis.md
├── exercises/
│   ├── bioreactor-optimization/
│   ├── literature-analysis/
│   └── experiment-design/
└── instructor-guide.pdf
```

---

## Deployment Comparison Matrix

| Feature | Laboratory | Research | Combined | Enterprise | Educational |
|---------|------------|----------|-----------|------------|-------------|
| **Lab Tools** | ✅ Full | ❌ | ✅ Full | ✅ Full | ✅ Simplified |
| **Research DB** | ❌ | ✅ Full | ✅ Full | ✅ Full | ✅ Sample |
| **AI Insights** | ✅ Basic | ✅ Full | ✅ Full | ✅ Advanced | ✅ Demo |
| **Authentication** | ❌ | Optional | Optional | ✅ Required | ❌ |
| **Multi-tenant** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **API Access** | Limited | Limited | Full | ✅ Full | Read-only |
| **Data Persistence** | Local | Database | Database | Database | Session |
| **Customization** | High | Medium | Medium | Full | Limited |
| **Min RAM** | 2GB | 4GB | 6GB | 8GB+ | 2GB |
| **Min Storage** | 5GB | 20GB | 30GB | 50GB+ | 5GB |

---

## Migration Paths

### From Laboratory to Combined
```bash
# 1. Backup current deployment
npm run backup:lab

# 2. Merge research features
git checkout combined-deployment
git merge messai-research

# 3. Migrate configuration
npm run migrate:lab-to-combined

# 4. Update environment
# Add DATABASE_URL and research configs

# 5. Deploy update
npm run deploy:update
```

### From Research to Combined
```bash
# 1. Backup current deployment
npm run backup:research

# 2. Merge lab features
git checkout combined-deployment
git merge messai-lab

# 3. Migrate configuration
npm run migrate:research-to-combined

# 4. Deploy update
npm run deploy:update
```

### To Enterprise from Any
```bash
# 1. Full backup
npm run backup:full

# 2. Setup enterprise infrastructure
./scripts/setup-enterprise.sh

# 3. Migrate data
npm run migrate:to-enterprise

# 4. Configure authentication
npm run setup:auth

# 5. Deploy with zero downtime
npm run deploy:enterprise
```

---

## Support & Resources

### Documentation
- **Setup Guides**: `/docs/setup/[deployment-type].md`
- **API Reference**: `/docs/api/README.md`
- **Troubleshooting**: `/docs/troubleshooting.md`

### Community Support
- **GitHub Discussions**: General help
- **Discord**: Real-time chat
- **Stack Overflow**: Tag with `messai`

### Professional Support
- **Laboratory**: lab-support@messai.io
- **Research**: research-support@messai.io
- **Enterprise**: enterprise@messai.io

### Training Options
- **Self-paced**: [learn.messai.io](https://learn.messai.io)
- **Workshops**: Monthly online sessions
- **On-site**: Available for enterprise

---

*Choose the deployment that best fits your needs. Start simple and upgrade as you grow.*