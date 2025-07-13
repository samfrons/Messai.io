# Contributing to MESSAi Platform

Thank you for your interest in contributing to MESSAi! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18+ 
- **PNPM**: 8.15.0+
- **Git**: Latest version

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/messai-platform.git
cd messai-platform

# 2. Install dependencies
pnpm install

# 3. Copy environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Setup pre-commit hooks
pnpm prepare

# 5. Start development server
pnpm dev
```

The application will be available at `http://localhost:3001`.

## 📋 Development Workflow

### Branch Strategy

```
main (production) ← release/v1.1.0 ← develop ← feature/new-feature
```

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features and improvements
- **fix/***: Bug fixes
- **release/***: Release preparation

### Creating a Pull Request

1. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Write tests** for new functionality

4. **Run quality checks**:
   ```bash
   pnpm lint          # Check code style
   pnpm type-check    # Type checking
   pnpm test:coverage # Run tests with coverage
   pnpm test:e2e      # End-to-end tests
   ```

5. **Commit using conventional commits**:
   ```bash
   git commit -m "feat: add power prediction algorithm"
   git commit -m "fix: resolve temperature conversion bug"
   git commit -m "docs: update API documentation"
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**
```bash
feat: add 3D visualization for MFC configurations
fix(api): resolve memory leak in prediction engine
docs: update installation instructions
test: add unit tests for temperature utilities
```

## 🧪 Testing Guidelines

### Test Requirements
- **Unit tests** for all new functions and components
- **Integration tests** for API routes
- **E2E tests** for new user workflows
- **Coverage**: 80% statements, 70% branches

### Writing Tests

```typescript
// Unit test example
describe('PowerPredictor', () => {
  it('calculates power output correctly', () => {
    const config = mockMFCConfig()
    const result = PowerPredictor.predict(config)
    
    expect(result.powerOutput).toBeGreaterThan(0)
    expect(result.efficiency).toBeBetween(0, 100)
  })
})

// Component test example
describe('MFCDashboard', () => {
  it('displays power metrics', () => {
    render(<MFCDashboard data={mockData} />)
    
    expect(screen.getByText('Power Output')).toBeInTheDocument()
    expect(screen.getByTestId('power-value')).toHaveTextContent('0.5 mW')
  })
})
```

### Running Tests

```bash
# Unit tests
pnpm test                 # All tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # With coverage

# E2E tests
pnpm test:e2e            # All E2E tests
pnpm test:e2e:ui         # With UI
```

## 📁 Project Structure

### Monorepo Organization
```
messai-platform/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   └── @messai/
│       ├── core/           # Business logic
│       ├── ui/             # UI components
│       └── database/       # Database utilities
├── tests/                  # Global tests
├── docs/                   # Documentation
└── scripts/                # Build scripts
```

### Code Organization
- **Components**: React components in `apps/web/src/components/`
- **API Routes**: Next.js routes in `apps/web/app/api/`
- **Utilities**: Shared logic in `packages/@messai/core/`
- **Types**: TypeScript types in each package
- **Tests**: Co-located with source files

## 🎨 Coding Standards

### TypeScript
- Use **strict mode** enabled
- Prefer **interfaces** over types for object shapes
- Use **meaningful names** for variables and functions
- Add **JSDoc comments** for public APIs

```typescript
/**
 * Calculates power output for a microbial fuel cell configuration
 * @param config - MFC configuration parameters
 * @returns Power prediction with confidence interval
 */
export function predictPower(config: MFCConfiguration): PowerPrediction {
  // Implementation
}
```

### React Components
- Use **functional components** with hooks
- Prefer **composition** over inheritance
- Use **TypeScript** for all props
- Add **data-testid** for complex elements

```tsx
interface MFCDashboardProps {
  data: MFCData | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function MFCDashboard({ data, isLoading, onRefresh }: MFCDashboardProps) {
  if (isLoading) {
    return <div data-testid="loading-spinner">Loading...</div>
  }

  return (
    <div data-testid="mfc-dashboard">
      {/* Component content */}
    </div>
  )
}
```

### Styling
- Use **Tailwind CSS** for styling
- Follow **mobile-first** responsive design
- Use **semantic HTML** elements
- Ensure **accessibility** compliance

### API Development
- Use **Next.js App Router** for API routes
- Implement **proper error handling**
- Add **input validation** with Zod
- Include **comprehensive tests**

```typescript
// apps/web/app/api/predictions/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const config = configSchema.parse(body)
    
    const prediction = await predictPower(config)
    
    return Response.json(prediction)
  } catch (error) {
    return Response.json(
      { error: 'Invalid configuration' },
      { status: 400 }
    )
  }
}
```

## 📚 Documentation

### Code Documentation
- Add **JSDoc comments** for public functions
- Include **usage examples** in comments
- Document **complex algorithms** thoroughly
- Keep **README files** updated

### API Documentation
- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Use OpenAPI specification

## 🔍 Code Review Process

### Review Checklist
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Tests**: Are there adequate tests with good coverage?
- [ ] **Performance**: Are there any performance concerns?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Accessibility**: Does the UI meet accessibility standards?
- [ ] **Documentation**: Is the code well-documented?
- [ ] **Style**: Does the code follow our style guidelines?

### Review Guidelines
- **Be constructive** and specific in feedback
- **Explain the "why"** behind suggestions
- **Approve quickly** for minor changes
- **Test locally** for complex changes
- **Ask questions** if something is unclear

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Update to latest version** and test again
3. **Check documentation** for known limitations
4. **Gather debugging information**

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.2.3]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 📞 Getting Help

- **Documentation**: Check our [docs](./docs/) first
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Discord**: For real-time collaboration
- **Email**: For security issues or private matters

## 🏆 Recognition

Contributors are recognized in:
- **CHANGELOG.md**: For each release
- **GitHub Contributors**: Automatic recognition
- **Annual Report**: Major contributors highlighted
- **Conference Talks**: Speaking opportunities

## 📄 License

By contributing to MESSAi, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Thank you for contributing to MESSAi! Your efforts help democratize microbial electrochemical systems research worldwide. 🚀

*Last updated: 2025-07-13*