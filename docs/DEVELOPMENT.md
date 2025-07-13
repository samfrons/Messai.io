# MESSAi Development Guide

This guide provides detailed instructions for setting up and developing the MESSAi platform locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Debugging](#debugging)
- [Development Tools](#development-tools)
- [Common Tasks](#common-tasks)
- [Best Practices](#best-practices)

## Prerequisites

### Required Software
- **Node.js** 18.0.0 or higher (.nvmrc specifies exact version)
- **PNPM** 8.15.0 or higher (specified in package.json)
- **Git** 2.30.0 or higher
- **Code Editor** (VS Code recommended)

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ]
}
```

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/messai-mvp.git
cd messai-mvp
```

### 2. Install Dependencies
```bash
# Use PNPM (preferred package manager)
pnpm install

# Alternative: if you don't have PNPM
npm install -g pnpm
pnpm install
```

### 3. Environment Configuration
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Minimum required for development:
DATABASE_URL="file:./dev.db"  # SQLite for development
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server
```bash
# Start all development servers using Nx
pnpm dev

# Or start just the web app
pnpm --filter web dev
```

Visit `http://localhost:3001` to see the application.

## Development Workflow

### Branch Strategy

We follow GitHub Flow:

1. **Main branch** (`main`): Always deployable
2. **Feature branches**: For new features (`feature/feature-name`)
3. **Fix branches**: For bug fixes (`fix/bug-description`)

```bash
# Create a new feature branch
git checkout -b feature/algae-growth-animation

# Make changes and commit
git add .
git commit -m "feat: add algae growth animation to 3D model"

# Push to origin
git push origin feature/algae-growth-animation
```

### Development Cycle

1. **Pick an issue** from GitHub Issues
2. **Create a branch** from latest main
3. **Develop** with hot reloading
4. **Test** your changes
5. **Commit** with conventional commits
6. **Push** and create PR

## Project Structure

```
messai-mvp/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with LCARS theme
│   ├── page.tsx           # Homepage with design catalog
│   ├── dashboard/         # Experiment dashboard
│   ├── experiment/[id]/   # Dynamic experiment pages
│   └── api/               # API routes
├── components/            # React components
│   ├── lcars/            # LCARS UI components
│   ├── algal-fuel-cell/  # Algae-specific components
│   └── *.tsx             # Shared components
├── lib/                   # Utility functions
│   ├── ai-predictions.ts  # AI prediction logic
│   ├── db.ts             # Database utilities
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed data
├── public/               # Static assets
├── styles/               # Global styles
└── tests/                # Test files
```

### Key Directories Explained

#### `/app`
Next.js 14 App Router structure. Each folder represents a route.

#### `/components`
Reusable React components. Follow the pattern:
```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Tests
├── ComponentName.module.css # Styles (if needed)
└── index.ts              # Barrel export
```

#### `/lib`
Pure utility functions and business logic. No React dependencies.

#### `/tests`
Organized by test type:
- `unit/` - Unit tests
- `integration/` - Integration tests
- `e2e/` - End-to-end tests

## Available Scripts

### Development
```bash
pnpm dev             # Start dev server on port 3001 (Nx orchestrated)
pnpm build           # Build all packages and apps
pnpm start           # Start production server  
pnpm lint            # Run ESLint across all packages
pnpm type-check      # Run TypeScript compiler check
pnpm clean           # Clean build artifacts
```

### Testing (Vitest)
```bash
pnpm test            # Run all tests (uses Vitest exclusively)
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Generate coverage report
pnpm test:ci         # Run tests in CI mode with coverage
pnpm test:e2e        # Run Playwright E2E tests
pnpm test:e2e:ui     # Run E2E tests with UI
```

### Database (via Nx)
```bash
pnpm db:studio       # Open Prisma Studio GUI
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema changes (dev only)

# Direct Prisma commands (if needed)
npx prisma migrate dev # Create migration
npx prisma db seed   # Seed the database
```

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Next.js: debug client-side",
      "url": "http://localhost:3001",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Browser DevTools

1. **React DevTools**: Install browser extension
2. **Network tab**: Monitor API calls
3. **Console**: Check for errors
4. **Performance**: Profile rendering

### Common Debugging Commands

```bash
# Check TypeScript errors
pnpm type-check

# Check for unused dependencies
npx depcheck

# Update dependencies safely
npx npm-check-updates -u
pnpm install

# View Nx project graph
pnpm graph

# Clean and rebuild everything
pnpm clean && pnpm build
```

## Development Tools

### Prisma Studio
Visual database editor:
```bash
npx prisma studio
```

### API Testing
Use Thunder Client, Postman, or cURL:
```bash
# Test health check API
curl http://localhost:3001/api/health

# Test prediction API
curl -X POST http://localhost:3001/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28.5,
    "ph": 7.1,
    "substrateConcentration": 1.2,
    "designType": "mason-jar"
  }'
```

### Component Development
Use Vitest UI for component testing:
```bash
pnpm test:watch  # Interactive test runner
```

Or start Storybook (if configured):
```bash
pnpm storybook
```

## Common Tasks

### Adding a New MFC Design

1. **Update design catalog** in `app/page.tsx`:
```typescript
const mockDesigns = [
  // ... existing designs
  {
    id: '14',
    name: 'Your New Design',
    type: 'your-design-type',
    cost: '$100',
    powerOutput: '50-100 mW/m²',
    materials: {
      container: 'Material description',
      electrodes: 'Electrode type',
      separator: 'Separator type',
      features: 'Key features'
    }
  }
];
```

2. **Add 3D model** in `components/DesignSpecific3DModels.tsx`
3. **Update prediction multipliers** in `lib/ai-predictions.ts`

### Adding a New Electrode Material

1. **Update material list** in `components/MFCConfigPanel.tsx`
2. **Add material properties**
3. **Update material descriptions**

### Creating a New Component

```bash
# Create component structure
mkdir components/NewComponent
touch components/NewComponent/NewComponent.tsx
touch components/NewComponent/NewComponent.test.tsx
touch components/NewComponent/index.ts
```

Example component:
```typescript
// components/NewComponent/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div className="lcars-panel">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Working with the Database

```bash
# Create a new model
# Edit prisma/schema.prisma, then:
npx prisma migrate dev --name add-new-model

# Reset database (warning: deletes all data)
npx prisma migrate reset
```

## Best Practices

### Code Style

1. **Use TypeScript** for all new code
2. **Prefer functional components** with hooks
3. **Use proper typing** - avoid `any`
4. **Keep components small** and focused
5. **Extract constants** to separate files

### Performance

1. **Use Next.js Image** for images
2. **Implement lazy loading** for heavy components
3. **Memoize expensive calculations**
4. **Use React.memo** for pure components
5. **Profile before optimizing**

### Testing

1. **Write tests alongside code**
2. **Test user behavior**, not implementation
3. **Use data-testid** for test selectors
4. **Mock external dependencies**
5. **Aim for 80%+ coverage**

### Git Workflow

1. **Commit early and often**
2. **Write meaningful commit messages**
3. **Keep commits atomic**
4. **Rebase before merging**
5. **Delete branches after merge**

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

#### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install

# Clear Nx cache
pnpm nx reset
```

#### TypeScript Errors
```bash
# Restart TS server in VS Code
Cmd+Shift+P > TypeScript: Restart TS Server
```

#### Database Issues
```bash
# Reset and reseed database
npx prisma migrate reset
npx prisma db seed
```

### Getting Help

1. **Check existing issues** on GitHub
2. **Search Discord/Slack** (if available)
3. **Read the docs** thoroughly
4. **Ask specific questions** with context

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Three.js Docs](https://threejs.org/docs)

### Learning Resources
- [Next.js Tutorial](https://nextjs.org/learn)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Regex101](https://regex101.com) - Test regex patterns
- [Transform](https://transform.tools) - Convert between formats
- [Bundle Analyzer](https://bundlephobia.com) - Check package sizes