# MESSAi Platform

AI-powered platform for microbial electrochemical systems research.

## Project Structure

This is a monorepo containing multiple packages and applications:

```
messai/
├── apps/
│   ├── web/              # Main platform (messai.io)
│   ├── core-site/        # Documentation site (core.messai.io)
│   └── api/              # API service (api.messai.io)
├── packages/
│   ├── messai-core/      # Open source prediction engine
│   ├── ui/               # Shared UI components
│   └── database/         # Prisma schemas
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Run all apps in development mode
npm run dev

# Run specific app
npm run dev --workspace=apps/web

# Build all packages
npm run build
```

## Packages

### @messai/core

Open source prediction engine for MFC systems.

```bash
npm install @messai/core
```

```typescript
import { predictPower } from '@messai/core';

const result = await predictPower({
  temperature: 25,
  ph: 7.0,
  substrate: 1.0,
  design: 'earthen-pot'
});
```

### @messai/ui

Shared UI components with ChatGPT-inspired design.

```typescript
import { Button, Card, Input } from '@messai/ui';
```

## API Endpoints

Base URL: `https://api.messai.io/v1`

- `POST /predictions` - Power output predictions
- `GET /materials` - Electrode materials database
- `GET /microbes` - Microbe species database
- `GET /designs` - MFC design specifications

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

## License

- Core package: MIT License
- Platform: Proprietary

## Links

- Documentation: [docs.messai.io](https://docs.messai.io)
- Core Package: [core.messai.io](https://core.messai.io)
- Platform: [messai.io](https://messai.io)