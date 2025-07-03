# MESSAi - Microbial Electrochemical Systems AI Platform

<div align="center">
  
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

[Live Demo](https://messai-demo.vercel.app) | [Documentation](docs/) | [Report Bug](https://github.com/your-org/messai/issues) | [Request Feature](https://github.com/your-org/messai/issues)

</div>

## 🚀 Overview

MESSAi is an advanced platform for microbial fuel cell (MFC) researchers, providing interactive 3D modeling, AI-powered predictions, and comprehensive experiment tracking. Transform your bioelectrochemical research with cutting-edge visualization and machine learning.

<div align="center">
  <img src="public/screenshots/dashboard.png" alt="MESSAi Dashboard" width="600">
</div>

## ✨ Key Features

- **📊 13+ Validated MFC Designs** - From $0.50 cardboard to $5,000 architectural systems
- **🎨 Interactive 3D Visualization** - Real-time manipulation with Three.js
- **🤖 AI-Powered Predictions** - Machine learning models for power output optimization
- **🔬 27 Electrode Materials** - Including graphene, MXenes, and upcycled materials
- **📈 Experiment Tracking** - Comprehensive data management and analysis
- **🌟 LCARS UI Theme** - Star Trek-inspired interface for the future of science

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/messai-mvp.git
cd messai-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3003` to see the application.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and technical details
- [Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow
- [API Reference](docs/API.md) - REST API endpoints and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment options
- [Testing Guide](docs/TESTING.md) - Testing strategies and patterns
- [Contributing](docs/CONTRIBUTING.md) - How to contribute to the project

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS, Framer Motion
- **State**: Zustand
- **Database**: Prisma ORM (PostgreSQL ready)
- **Testing**: Vitest, React Testing Library

## 🎯 For Researchers

MESSAi is designed specifically for:
- Microbial electrochemical systems researchers
- Environmental engineers
- Bioelectrochemistry students and educators
- Laboratory managers
- Industry professionals

### Design Categories

**Laboratory Scale** ($1-$50)
- Earthen Pot MFC - Low-cost clay design
- Mason Jar MFC - Classic benchtop setup
- Micro MFC Chip - Silicon microfluidic device

**Pilot Scale** ($30-$1,800)
- 3D Printed MFC - Customizable geometry
- Benchtop Bioreactor - 5L stirred tank
- Brewery Processing - Food-grade system

**Industrial Scale** ($150-$5,000)
- Wastewater Treatment - 500L modular system
- BioFacade Power Cell - Building-integrated
- Benthic Fuel Cell - Marine deployment

## 🔌 API Example

```bash
curl -X POST http://localhost:3003/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28.5,
    "ph": 7.1,
    "substrateConcentration": 1.2,
    "designType": "benchtop-bioreactor"
  }'
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development

```bash
npm run dev      # Start development server
npm test         # Run tests
npm run build    # Build for production
npm run lint     # Lint code
```

## 📈 Roadmap

- [ ] Real-time sensor integration
- [ ] Machine learning model improvements
- [ ] Collaborative experiment sharing
- [ ] Mobile application
- [ ] Advanced data export formats
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Based on peer-reviewed research in bioelectrochemistry
- LCARS design inspired by Star Trek
- Built with amazing open-source technologies

## 💬 Community & Support

- [GitHub Discussions](https://github.com/your-org/messai/discussions)
- [Discord Server](https://discord.gg/messai)
- Email: support@messai.com

---

<div align="center">
  <strong>MESSAi</strong> - Advancing microbial electrochemical systems research through intelligent design
</div>