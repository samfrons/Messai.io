# MESSAi Deployment Scenarios
## Choose Your Perfect Setup

### 🎯 **Quick Decision Guide**

**What do you need MESSAi for?**

- 🧪 **Laboratory Work Only** → Use `messai-lab` branch
- 📚 **Research & Literature** → Use `messai-research` branch  
- 🏫 **Academic Institution** → Use `research-lab` branch
- 🏢 **Enterprise/Complete** → Use `full-platform` branch
- 🧑‍🔬 **Experiment Tracking** → Use `experiments` branch

---

## 🧪 **Scenario 1: Laboratory-Only Deployment**

### **Use Case**: Research Labs, Equipment Integration, Lab Tools
**Branch**: `messai-lab`

```bash
git checkout messai-lab
npm install
npm run dev
```

### **What's Included**
✅ **Bioreactor Design Tools**
- Interactive 3D modeling
- Parameter optimization
- Design validation

✅ **Electroanalytical Tools**  
- Voltammetry simulation
- Impedance analysis
- Performance prediction

✅ **3D System Visualization**
- Real-time manipulation
- Material property visualization
- Equipment integration models

✅ **Clean Interface**
- No authentication overhead
- Focused lab workflow
- Equipment-ready APIs

### **What's NOT Included**
❌ Research paper database
❌ Literature analysis tools
❌ User accounts/authentication
❌ Experiment collaboration features

### **Perfect For**
- Research facilities focused on lab work
- Equipment manufacturers
- Lab automation systems
- Educational lab courses

---

## 📚 **Scenario 2: Research-Only Deployment**

### **Use Case**: Academic Research, Literature Analysis, Data Mining
**Branch**: `messai-research`

```bash
git checkout messai-research
npm install  
npm run dev
```

### **What's Included**
✅ **Comprehensive Research Database**
- 3,721+ verified research papers
- AI-powered data extraction
- Advanced search and filtering

✅ **Literature Analysis Tools**
- Citation network analysis
- Research trend identification
- Knowledge graph visualization

✅ **AI Research Intelligence**
- Pattern recognition across papers
- Automated data extraction
- Research gap identification

✅ **Research Workflow**
- Paper collection and curation
- Data export capabilities
- Research collaboration tools

### **What's NOT Included**
❌ Laboratory design tools
❌ Equipment modeling
❌ Bioreactor simulation
❌ 3D lab equipment visualization

### **Perfect For**
- Academic researchers
- Literature review projects
- Research trend analysis
- Grant writing and proposal development

---

## 🏫 **Scenario 3: Academic Institution Deployment**

### **Use Case**: Universities, Research Institutions, Complete Research Labs
**Branch**: `research-lab`

```bash
git checkout research-lab
npm install
npm run dev
```

### **What's Included**
✅ **Complete Research Database** (from research branch)
✅ **All Laboratory Tools** (from lab branch)
✅ **Integrated Workflow**
- Literature-guided experiment design
- Research-to-lab pipeline
- Publication-ready data export

✅ **Academic Features**
- Multi-user support
- Project collaboration
- Educational content integration

### **Use Cases**
- University research departments
- Research institution installations
- Graduate student research projects
- Academic collaboration platforms

---

## 🏢 **Scenario 4: Enterprise/Complete Deployment**

### **Use Case**: Large Institutions, Commercial Research, Full Platform
**Branch**: `full-platform`

```bash
git checkout full-platform
npm install
npm run dev
```

### **What's Included**
✅ **Everything from research-lab** 
✅ **Advanced Experiment Management**
- Multi-team collaboration
- Enterprise authentication
- Advanced analytics dashboard

✅ **Enterprise Features**
- User management and permissions
- Audit trails and compliance
- API access and integrations
- Custom deployment options

### **Perfect For**
- Large research institutions
- Commercial R&D departments
- Multi-site research organizations
- Platform-as-a-service deployments

---

## 🧑‍🔬 **Scenario 5: Experiment Management Only**

### **Use Case**: Experiment Tracking, Team Collaboration, Data Management
**Branch**: `experiments`

```bash
git checkout experiments
npm install
npm run dev
```

### **What's Included**
✅ **Experiment Lifecycle Management**
- Experiment design and setup
- Real-time data collection
- Results analysis and export

✅ **Collaboration Tools**
- Team experiment sharing
- Comment and annotation system
- Version control for experiments

✅ **Data Management**
- Structured data storage
- Export capabilities
- Integration with lab equipment

### **Perfect For**
- Research teams focused on experiment tracking
- Lab data management systems
- Collaborative research projects
- Experiment documentation and sharing

---

## 🔀 **Mixed Scenarios**

### **Lab + Experiments** (`lab-experiments`)
```bash
git checkout lab-experiments
# Laboratory tools with experiment tracking
# Perfect for: Lab-focused teams with experiment management
```

### **Research + Experiments** (`research-experiments`)  
```bash
git checkout research-experiments
# Research database with experiment management
# Perfect for: Research teams with experiment tracking
```

---

## 🚀 **Quick Setup Commands**

### **Development Setup** (Any Branch)
```bash
# Clone repository
git clone https://github.com/your-org/messai-mvp.git
cd messai-mvp

# Choose your branch
git checkout [branch-name]

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3003
```

### **Production Setup**
```bash
# Set environment variables
cp .env.example .env.local
# Edit .env.local based on your deployment needs

# Database setup (if needed)
npx prisma migrate dev
npx prisma generate

# Build for production  
npm run build
npm start
```

---

## 📊 **Feature Comparison Matrix**

| Feature | Lab | Research | Research-Lab | Experiments | Full Platform |
|---------|-----|----------|--------------|-------------|---------------|
| 3D Lab Tools | ✅ | ❌ | ✅ | ❌ | ✅ |
| Research Papers | ❌ | ✅ | ✅ | ❌ | ✅ |
| AI Analysis | ❌ | ✅ | ✅ | ❌ | ✅ |
| Bioreactor Design | ✅ | ❌ | ✅ | ❌ | ✅ |
| Experiment Tracking | ❌ | ❌ | ❌ | ✅ | ✅ |
| Team Collaboration | ❌ | ❌ | ❌ | ✅ | ✅ |
| Authentication | ❌ | ❌ | Optional | ✅ | ✅ |
| Enterprise Features | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 **Choosing Your Deployment**

### **Start Simple**
1. **Try Demo Mode** first on any branch
2. **Identify core needs** from the feature matrix
3. **Deploy minimal branch** that meets your needs
4. **Scale up** to more comprehensive branches as needed

### **Migration Path**
- **Lab → Research-Lab** (add research features)
- **Research → Research-Lab** (add lab tools)  
- **Any → Full Platform** (add enterprise features)
- **Single → Combined** (merge multiple deployments)

### **Support & Documentation**
- **Branch Architecture**: [docs/BRANCH_ARCHITECTURE.md](BRANCH_ARCHITECTURE.md)
- **Technical Setup**: [README.md](../README.md)
- **AI Assistant Context**: [CLAUDE.md](../CLAUDE.md)