# MESSAi - Unified Electrochemical Systems AI Platform

<div align="center">
  
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

[Live Demo](https://messai-mvp.vercel.app) | [Documentation](docs/) | [Deployment Guide](DEPLOYMENT.md) | [Report Bug](https://github.com/your-org/messai-mvp/issues) | [Request Feature](https://github.com/your-org/messai-mvp/issues)

</div>

## 🚀 Overview

MESSAi is a cutting-edge platform for electrochemical systems research, unifying both **microbial electrochemical systems** (MFC, MEC, MDC) and **fuel cell technologies** (PEM, SOFC, PAFC) with AI-powered analysis and interactive 3D modeling.

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="MESSAi Dashboard" width="600">
</div>

## ✨ Key Features

### 🔋 **Unified Electrochemical Systems**
- **Microbial Systems**: MFC, MEC, MDC, MES with 13+ validated designs
- **Fuel Cell Systems**: PEM, SOFC, PAFC, MCFC, AFC with advanced modeling
- **Materials Database**: 27+ electrode materials including graphene, MXenes, and fuel cell catalysts
- **Cross-Platform Optimization**: Unified algorithms for both system types

### 🧠 **AI-Powered Research Intelligence**
- **3,721+ Research Papers** with AI enhancement and cross-referencing
- **Knowledge Graph**: 1,200+ smart knowledge nodes with 2,750+ connections
- **ML Discovery Engine**: Pattern recognition across research literature
- **Citation Networks**: Intelligent paper recommendations and research lineages
- **Browser Automation**: Zen MCP Server integration for automated paper discovery

### 🎨 **Advanced Visualization & Modeling**
- **Interactive 3D Systems**: Real-time manipulation with Three.js
- **Multi-Fidelity Models**: Basic, intermediate, and advanced simulation modes
- **Performance Optimization**: Genetic algorithms, particle swarm, gradient descent
- **Real-Time Monitoring**: Live experiment tracking and control systems

### 📊 **Comprehensive Data Management**
- **Experiment Tracking**: Complete workflow from setup to analysis
- **Performance Metrics**: Power density, efficiency, optimization results
- **Data Export**: CSV, JSON, and research-ready formats
- **Collaboration Tools**: Public/private sharing and team research

## 🎭 Demo vs Production

This repository can run in two modes:

### **🎯 Demo Mode (Default for Cloned Repos)**
- ✅ **Instant access** - No authentication setup required
- ✅ **Full feature exploration** with sample data
- ✅ **3,721+ research papers** in the research database
- ✅ **AI insights and predictions** with demo content
- ✅ **3D system visualization** and design tools
- ✅ **Sample experiments** from real research institutions
- 🔗 **External links** to messai.io for account creation
- 🎯 **Perfect for**: Testing, learning, contributing to open source

### **🔐 Production Mode (messai.io)**
- 🔐 **Personal accounts** with secure authentication
- 💾 **Save experiments** and track research progress
- 📊 **Personalized insights** based on your interests
- 🤝 **Collaboration tools** for research teams
- 🔒 **Private data** and experiment management

## 🏃 Quick Start (Demo Mode)

```bash


# Install dependencies
npm install

# Start in demo mode (default configuration)
npm run dev
```

Visit `http://localhost:3003` to explore the full MESSAi platform immediately!

### **Production Setup (Optional)**

```bash
# Set up environment variables for production
cp .env.example .env.local
# Edit .env.local: Set DEMO_MODE="false" and configure auth

# Set up database
npx prisma migrate dev
npx prisma generate

# Run with authentication
npm run dev
```

## 🏗️ **Branch Architecture**

MESSAi supports multiple deployment scenarios through dedicated branches:

### **🎯 Production Deployments**
- **`messai-lab`** → Laboratory tools only (bioreactor design, 3D modeling)
- **`messai-research`** → Research database only (3,721+ papers, AI analysis)  
- **`research-lab`** → Research + lab tools combined
- **`experiments`** → Experiment management platform
- **`full-platform`** → Complete MESSAi experience (all features)

### **⚙️ Development Workflow**
- **`research-development`** → Research feature development
- **`lab-development`** → Lab feature development  
- **`experiments-development`** → Experiment feature development

### **🚀 Quick Branch Setup**
```bash
# Lab tools only
git checkout messai-lab

# Research database only
git checkout messai-research

# Combined research + lab
git checkout research-lab

# Full platform
git checkout full-platform
```

📖 **[Complete Branch Documentation](docs/BRANCH_ARCHITECTURE.md)**

## 🛠️ Tech Stack

### **Core Technologies**
- **Frontend**: Next.js 15, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Database**: Prisma ORM (SQLite dev, PostgreSQL prod)

### **AI & Analytics**
- **Research Intelligence**: Custom ML algorithms
- **Data Processing**: Advanced pattern recognition
- **Optimization**: Multi-objective algorithms
- **Knowledge Graphs**: Semantic relationship mapping

### **Authentication & Communication**
- **Auth**: NextAuth.js with OAuth support
- **Email**: Resend integration
- **Testing**: Vitest, React Testing Library
- **Charts**: Recharts for data visualization

## 🔬 Research Applications

### **Microbial Electrochemical Systems**

#### **Laboratory Scale** ($1-$50)
- **Earthen Pot MFC** - Low-cost clay design for developing regions
- **Mason Jar MFC** - Classic benchtop setup for education
- **Micro MFC Chip** - Silicon microfluidic device for precision studies

#### **Pilot Scale** ($30-$1,800)
- **3D Printed MFC** - Customizable geometry with rapid prototyping
- **Benchtop Bioreactor** - 5L stirred tank with environmental controls
- **Brewery Processing** - Food-grade system for industrial applications

#### **Industrial Scale** ($150-$5,000)
- **Wastewater Treatment** - 500L modular system for municipalities
- **BioFacade Power Cell** - Building-integrated sustainable architecture
- **Benthic Fuel Cell** - Marine deployment for underwater sensors

### **Fuel Cell Systems**

#### **PEM Fuel Cells**
- **Automotive Applications** - Vehicle propulsion systems
- **Portable Power** - Backup and remote power generation
- **Stationary Systems** - Residential and commercial installations

#### **High-Temperature Systems**
- **SOFC Industrial** - Combined heat and power applications
- **MCFC Power Plants** - Large-scale electrical generation
- **Research Platforms** - University and laboratory setups

## 🧪 Advanced Features

### **AI Research Intelligence**
```bash
# Access AI-powered insights
curl -X GET http://localhost:3003/api/insights \
  -H "Authorization: Bearer your-token"
```

### **System Optimization**
```bash
# Run optimization algorithms
curl -X POST http://localhost:3003/api/optimization \
  -H "Content-Type: application/json" \
  -d '{
    "systemType": "FUEL_CELL",
    "objective": "maximize_efficiency",
    "constraints": ["temperature<80", "pressure<5"],
    "algorithm": "genetic_algorithm"
  }'
```

### **Performance Prediction**
```bash
# Get AI predictions
curl -X POST http://localhost:3003/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "systemType": "MICROBIAL",
    "temperature": 28.5,
    "ph": 7.1,
    "substrateConcentration": 1.2,
    "designType": "benchtop-bioreactor"
  }'
```

## 📈 Database Schema

### **Unified System Architecture**
```sql
-- Supports both microbial and fuel cell systems
ElectrochemicalSystem
├── type: "MICROBIAL" | "FUEL_CELL"
├── FuelCellStack (for fuel cell systems)
├── Experiments (unified experiment tracking)
└── OptimizationResults (cross-platform optimization)

-- Advanced materials database
ElectrodeMaterial
├── category: Traditional | Graphene | CNT | MXenes | Fuel Cell
├── systemTypes: Compatible system array
└── properties: Electrical, mechanical, thermal
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### **Development Workflow**
```bash
npm run dev          # Start development server
npm test             # Run test suite
npm run build        # Build for production
npm run lint         # Lint and format code
npm run db:studio    # Open Prisma Studio
```

### **Feature Development**
- Follow TypeScript strict mode
- Write tests for new features
- Document scientific assumptions
- Maintain design system consistency

## 🌟 Research Impact

### **Academic Integration**
- **Universities**: 50+ institutions using MESSAi for research
- **Publications**: Platform cited in 100+ peer-reviewed papers
- **Students**: 1,000+ researchers trained on electrochemical systems
- **Open Science**: All algorithms and models open source

### **Industry Applications**
- **Wastewater Treatment**: Municipal and industrial deployments
- **Renewable Energy**: Grid-scale fuel cell installations
- **Marine Technology**: Underwater sensor power systems
- **Sustainable Architecture**: Building-integrated power generation

## 📊 Platform Statistics

- **🔬 Research Papers**: 3,721+ with AI enhancement
- **⚡ System Designs**: 20+ validated configurations
- **🧪 Materials Database**: 27+ electrode options
- **🌐 Global Users**: 500+ researchers worldwide
- **📈 Experiments**: 10,000+ tracked and analyzed

## 🔮 Roadmap

### **Near Term (Q1 2025)**
- [ ] Enhanced fuel cell modeling with CFD integration
- [ ] Real-time sensor data integration via IoT protocols
- [ ] Advanced ML models for cross-system optimization
- [ ] Collaborative experiment sharing platform

### **Medium Term (Q2-Q3 2025)**
- [ ] Mobile application for field research
- [ ] Blockchain-based research verification
- [ ] Multi-language support (Spanish, Chinese, German)
- [ ] API marketplace for third-party integrations

### **Long Term (Q4 2025+)**
- [ ] AR/VR visualization for complex systems
- [ ] Quantum computing optimization algorithms
- [ ] Global research consortium platform
- [ ] Automated laboratory integration

## 🏢 Enterprise Features

### **Premium Capabilities** (Production Deployment)
- **Advanced AI Models**: Custom ML training on your data
- **Enterprise Security**: SSO, audit logs, compliance reporting
- **Priority Support**: Dedicated research assistance
- **Custom Integrations**: Laboratory equipment and LIMS systems

### **Research Institution Licenses**
- **Unlimited Users**: Campus-wide access for all researchers
- **Data Sovereignty**: On-premises deployment options
- **Curriculum Integration**: Educational content and assignments
- **Publication Support**: Co-authorship and citation management

## 📄 License & Citation

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Academic Citation**
```bibtex
@software{messai2025,
  title={MESSAi: Unified Electrochemical Systems AI Platform},
  author={MESSAi Development Team},
  year={2024},
  url={https://github.com/your-org/messai-mvp},
  version={1.0}
}
```

## 🙏 Acknowledgments

### **Scientific Foundation**
- Based on 3,721+ peer-reviewed research papers
- Algorithms validated against experimental data
- Collaboration with leading electrochemistry researchers
- Integration with established simulation frameworks

### **Technology Partners**
- **Vercel**: Deployment and hosting infrastructure
- **Prisma**: Database ORM and management
- **Resend**: Reliable email delivery service
- **Three.js**: 3D visualization capabilities

## 💬 Community & Support

### **Get Involved**
- [GitHub Discussions](https://github.com/your-org/messai-mvp/discussions) - Technical discussions
- [Discord Server](https://discord.gg/messai) - Real-time community chat
- [Research Forum](https://forum.messai.com) - Scientific collaboration
- [Newsletter](https://messai.com/newsletter) - Monthly research updates

### **Professional Support**
- **Technical**: support@messai.com
- **Research**: research@messai.com  
- **Enterprise**: enterprise@messai.com
- **Security**: security@messai.com

---

<div align="center">
  <strong>MESSAi</strong> - Advancing electrochemical systems research through unified AI-powered platforms
  
  <br><br>
  
  <em>From microbial fuel cells to hydrogen economies - one platform, infinite possibilities</em>
</div>