# MESSAi Testing Guide

This guide covers the comprehensive testing strategy for the MESSAi platform, including unit tests, integration tests, and end-to-end testing.

## 🧪 Testing Strategy

### Testing Pyramid
```
        E2E Tests (Few)
     ━━━━━━━━━━━━━━━━━━━
    Integration Tests (Some)  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unit Tests (Many)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Coverage Requirements
- **Statements**: 80% minimum
- **Branches**: 70% minimum
- **Functions**: 75% minimum
- **Lines**: 80% minimum

## 🛠️ Testing Tools

### Unit & Integration Testing
- **Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework
- **UI Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Mocking**: Vitest built-in mocks + MSW for API mocking
- **Coverage**: V8 coverage provider

### End-to-End Testing
- **Framework**: [Playwright](https://playwright.dev/) - Cross-browser testing
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome/Safari

## 🚀 Quick Start

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for CI (with coverage and verbose output)
pnpm test:ci

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Writing Your First Test

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

## 📁 Test Organization

```
tests/
├── setup.ts                 # Global test setup
├── utils/                   # Test utilities and helpers
│   ├── test-utils.tsx      # Custom render functions
│   ├── mocks/              # Mock data and factories
│   └── fixtures/           # Test fixtures
├── e2e/                    # End-to-end tests
│   ├── homepage.spec.ts    # Homepage E2E tests
│   └── api-health.spec.ts  # API health checks
└── __mocks__/              # Global mocks

packages/@messai/*/
└── src/
    ├── lib/
    │   └── utils.test.ts   # Unit tests colocated with source
    └── components/
        └── Button.test.tsx # Component tests
```

## 🎯 Testing Guidelines

### Unit Tests

**What to Test:**
- Pure functions and utilities
- Component rendering and behavior
- State management logic
- Custom hooks

**Example - Testing Utilities:**
```typescript
// packages/@messai/core/src/utils/temperature.test.ts
import { celsiusToKelvin, kelvinToCelsius } from './temperature'

describe('Temperature Conversion', () => {
  describe('celsiusToKelvin', () => {
    it('converts celsius to kelvin correctly', () => {
      expect(celsiusToKelvin(25)).toBe(298.15)
      expect(celsiusToKelvin(0)).toBe(273.15)
      expect(celsiusToKelvin(-273.15)).toBe(0)
    })
  })
})
```

**Example - Testing React Components:**
```typescript
// components/MFCDashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { MFCDashboard } from './MFCDashboard'
import { mockMFCData } from '../../../tests/utils/mocks'

describe('MFCDashboard', () => {
  it('displays MFC performance metrics', () => {
    render(<MFCDashboard data={mockMFCData} />)
    
    expect(screen.getByText('Power Output')).toBeInTheDocument()
    expect(screen.getByText('0.5 mW')).toBeInTheDocument()
    expect(screen.getByText('Voltage')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<MFCDashboard data={null} isLoading={true} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
```

### Integration Tests

**What to Test:**
- API route handlers
- Database operations
- Component integration
- Third-party service integration

**Example - API Route Testing:**
```typescript
// apps/web/app/api/predictions/route.test.ts
import { POST } from './route'
import { mockRequest } from '../../../../tests/utils/test-utils'

describe('/api/predictions', () => {
  it('returns prediction for valid MFC configuration', async () => {
    const request = mockRequest({
      method: 'POST',
      body: {
        configuration: mockMFCConfig,
        parameters: mockParameters
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('powerOutput')
    expect(data).toHaveProperty('efficiency')
  })
})
```

### End-to-End Tests

**What to Test:**
- Critical user journeys
- Authentication flows
- Cross-browser compatibility
- Performance requirements

**Example - User Journey:**
```typescript
// tests/e2e/mfc-configuration.spec.ts
import { test, expect } from '@playwright/test'

test('complete MFC configuration flow', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Navigate to configuration
  await page.click('[data-testid="new-configuration"]')
  
  // Fill configuration form
  await page.fill('[data-testid="anode-material"]', 'Graphite')
  await page.fill('[data-testid="cathode-material"]', 'Platinum')
  await page.fill('[data-testid="electrolyte"]', 'Phosphate Buffer')
  
  // Submit and verify prediction
  await page.click('[data-testid="generate-prediction"]')
  
  await expect(page.locator('[data-testid="power-output"]')).toBeVisible()
  await expect(page.locator('[data-testid="efficiency-score"]')).toBeVisible()
})
```

## 🔧 Test Configuration

### Vitest Configuration
Key settings in `vitest.config.ts`:
- **Environment**: jsdom for React components
- **Setup Files**: Global test setup
- **Coverage**: V8 provider with thresholds
- **Path Aliases**: Match production aliases

### Playwright Configuration
Key settings in `playwright.config.ts`:
- **Base URL**: http://localhost:3001
- **Browsers**: Desktop and mobile viewports
- **Web Server**: Auto-start dev server
- **Traces**: Enabled on failure for debugging

## 🎨 Testing Best Practices

### General Principles
1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Write Descriptive Test Names**: Test names should describe the expected behavior
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Test Edge Cases**: Empty states, error conditions, boundary values
5. **Keep Tests Independent**: Each test should be able to run in isolation

### Mock Strategy
```typescript
// Good: Mock at the boundary
vi.mock('@/lib/api', () => ({
  fetchMFCData: vi.fn(() => Promise.resolve(mockMFCData))
}))

// Avoid: Mocking internal implementation details
// vi.mock('./components/InternalComponent')
```

### Data-Testid Usage
```jsx
// Use semantic roles when possible
<button>Submit</button> // ✅ getByRole('button', { name: 'Submit' })

// Use data-testid for complex selectors
<div data-testid="mfc-power-chart">...</div> // ✅ getByTestId('mfc-power-chart')
```

## 🐛 Debugging Tests

### Failed Unit Tests
```bash
# Run specific test file
pnpm test Button.test.tsx

# Run tests matching pattern
pnpm test --grep "power calculation"

# Debug mode
pnpm test --inspect-brk
```

### Failed E2E Tests
```bash
# Run with headed browser
pnpm test:e2e --headed

# Run specific test
pnpm test:e2e tests/e2e/homepage.spec.ts

# Debug mode
pnpm test:e2e --debug

# Generate trace
pnpm test:e2e --trace on
```

### Common Issues

**❌ Tests timing out:**
```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ... test code
})
```

**❌ Element not found:**
```typescript
// Wait for element to appear
await expect(page.locator('[data-testid="result"]')).toBeVisible()

// Wait for network request
await page.waitForResponse('**/api/predictions')
```

## 📊 Coverage Reports

### Viewing Coverage
```bash
# Generate and view coverage report
pnpm test:coverage

# Coverage files are generated in:
coverage/
├── index.html          # Browse coverage in browser
├── lcov.info          # LCOV format for CI tools
└── coverage-final.json # JSON format
```

### Coverage Exclusions
Files excluded from coverage (configured in `vitest.config.ts`):
- Configuration files (`*.config.*`)
- Type definitions (`*.d.ts`)
- Test files themselves
- Build output directories

## 🔄 CI/CD Integration

### GitHub Actions
Tests automatically run on:
- Pull request creation/updates
- Push to main branch
- Scheduled runs (nightly)

### Quality Gates
All tests must pass before:
- Merging pull requests
- Deploying to staging
- Releasing to production

### Performance Monitoring
- Bundle size tracking
- Test execution time monitoring
- Coverage trend analysis

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

💡 **Need Help?** Check our [Troubleshooting Guide](./TROUBLESHOOTING.md) or ask in the team Discord.

*Last updated: 2025-07-13*