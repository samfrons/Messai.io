# MESSAi Testing Guide

Comprehensive guide for testing the MESSAi platform, covering unit tests, integration tests, and end-to-end testing strategies.

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Patterns](#testing-patterns)
- [Mocking Strategies](#mocking-strategies)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [CI/CD Integration](#cicd-integration)

## Testing Philosophy

We follow these principles:
1. **Test user behavior, not implementation details**
2. **Write tests that give confidence the application works**
3. **Maintain a healthy test pyramid** (many unit tests, fewer integration, fewest E2E)
4. **Keep tests maintainable and readable**
5. **Test critical paths thoroughly**

## Test Structure

```
tests/
├── unit/                 # Isolated unit tests
├── integration/          # Component integration tests
├── e2e/                  # End-to-end tests
├── api/                  # API endpoint tests
├── accessibility/        # A11y tests
├── performance/          # Performance tests
├── regression/           # Regression test suite
├── mocks/               # Shared mocks and fixtures
├── utils/               # Test utilities
└── setup.ts             # Global test setup
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with UI
npm run test:ui
```

### Advanced Options

```bash
# Run tests matching pattern
npm test -- Button

# Run tests in specific file
npm test -- components/Button.test.tsx

# Debug tests
npm test -- --inspect-brk

# Run failed tests only
npm test -- --only-failures
```

## Writing Tests

### Unit Tests

Test individual functions and components in isolation.

```typescript
// lib/ai-predictions.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePowerOutput } from './ai-predictions';

describe('calculatePowerOutput', () => {
  it('should calculate power within expected range', () => {
    const result = calculatePowerOutput({
      temperature: 28,
      ph: 7.0,
      substrateConcentration: 1.5,
      designType: 'mason-jar'
    });
    
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1000);
  });

  it('should apply temperature factor correctly', () => {
    const cold = calculatePowerOutput({
      temperature: 15,
      ph: 7.0,
      substrateConcentration: 1.5,
      designType: 'mason-jar'
    });
    
    const optimal = calculatePowerOutput({
      temperature: 30,
      ph: 7.0,
      substrateConcentration: 1.5,
      designType: 'mason-jar'
    });
    
    expect(optimal).toBeGreaterThan(cold);
  });
});
```

### Component Tests

Test React components with user interactions.

```typescript
// components/MFCConfigPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MFCConfigPanel } from './MFCConfigPanel';

describe('MFCConfigPanel', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should display all material options', () => {
    render(<MFCConfigPanel onChange={mockOnChange} />);
    
    expect(screen.getByText('Carbon Cloth')).toBeInTheDocument();
    expect(screen.getByText('Graphene Oxide')).toBeInTheDocument();
    expect(screen.getByText('MXene Ti₃C₂Tₓ')).toBeInTheDocument();
  });

  it('should call onChange when material is selected', () => {
    render(<MFCConfigPanel onChange={mockOnChange} />);
    
    const select = screen.getByLabelText('Anode Material');
    fireEvent.change(select, { target: { value: 'graphene-oxide' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      anodeMaterial: 'graphene-oxide'
    });
  });
});
```

### Integration Tests

Test multiple components working together.

```typescript
// tests/integration/experiment-workflow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentPage } from '@/app/experiment/page';

describe('Experiment Workflow', () => {
  it('should complete full experiment creation flow', async () => {
    const user = userEvent.setup();
    render(<ExperimentPage />);
    
    // Select design
    await user.click(screen.getByText('Mason Jar MFC'));
    
    // Configure parameters
    await user.type(screen.getByLabelText('Temperature'), '28.5');
    await user.type(screen.getByLabelText('pH'), '7.1');
    
    // Submit
    await user.click(screen.getByText('Start Experiment'));
    
    // Verify prediction appears
    await waitFor(() => {
      expect(screen.getByText(/Predicted Power:/)).toBeInTheDocument();
    });
  });
});
```

### API Tests

Test API endpoints directly.

```typescript
// tests/api/predictions.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/predictions/route';

describe('/api/predictions', () => {
  it('should return prediction for valid input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const json = JSON.parse(res._getData());
    expect(json).toHaveProperty('predictedPower');
    expect(json).toHaveProperty('confidenceInterval');
  });

  it('should validate input parameters', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        temperature: 100, // Invalid
        ph: 7.1,
        substrateConcentration: 1.2,
        designType: 'mason-jar'
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});
```

## Testing Patterns

### Testing 3D Components

```typescript
// components/MFC3DModel.test.tsx
import { render } from '@testing-library/react';
import { MFC3DModel } from './MFC3DModel';
import * as THREE from 'three';

// Mock Three.js
vi.mock('three', () => ({
  WebGLRenderer: vi.fn(),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  // ... other mocks
}));

describe('MFC3DModel', () => {
  it('should create scene with correct elements', () => {
    const { container } = render(
      <MFC3DModel design="mason-jar" />
    );
    
    // Verify Three.js objects were created
    expect(THREE.Scene).toHaveBeenCalled();
    expect(THREE.PerspectiveCamera).toHaveBeenCalled();
  });
});
```

### Testing Async Operations

```typescript
describe('Async Operations', () => {
  it('should handle loading states', async () => {
    render(<DataLoader />);
    
    // Initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });
  });
});
```

### Testing Error Boundaries

```typescript
describe('Error Handling', () => {
  it('should display error message on failure', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });
});
```

## Mocking Strategies

### Mocking External Dependencies

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/predictions', (req, res, ctx) => {
    return res(
      ctx.json({
        predictedPower: 150,
        confidenceInterval: { lower: 120, upper: 180 }
      })
    );
  })
);

// In test setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mocking Modules

```typescript
// Mock Prisma client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    experiment: {
      create: vi.fn(),
      findMany: vi.fn(() => Promise.resolve([])),
      update: vi.fn()
    }
  }))
}));
```

## Performance Testing

### Component Render Performance

```typescript
import { measureRender } from './test-utils';

describe('Performance', () => {
  it('should render quickly', async () => {
    const renderTime = await measureRender(
      <MFCDashboard experiments={mockExperiments} />
    );
    
    expect(renderTime).toBeLessThan(100); // ms
  });
});
```

### Bundle Size Testing

```typescript
describe('Bundle Size', () => {
  it('should not exceed size limit', () => {
    const stats = require('.next/build-stats.json');
    const mainBundleSize = stats.bundles.main.size;
    
    expect(mainBundleSize).toBeLessThan(250000); // 250KB
  });
});
```

## Accessibility Testing

### Basic A11y Tests

```typescript
import { axe } from 'jest-axe';

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MFCConfigPanel />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation

```typescript
describe('Keyboard Navigation', () => {
  it('should be fully keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<DesignCatalog />);
    
    // Tab through elements
    await user.tab();
    expect(screen.getByText('Mason Jar MFC')).toHaveFocus();
    
    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText('Design Details')).toBeInTheDocument();
  });
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:ci
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:critical"
    }
  }
}
```

## Testing Best Practices

### Do's
- ✅ Test user-facing behavior
- ✅ Use descriptive test names
- ✅ Keep tests independent
- ✅ Mock external dependencies
- ✅ Test edge cases
- ✅ Use data-testid for querying

### Don'ts
- ❌ Test implementation details
- ❌ Mock everything
- ❌ Write brittle selectors
- ❌ Ignore flaky tests
- ❌ Skip error cases
- ❌ Use arbitrary delays

### Test File Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  // Basic rendering
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Component />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // User interactions
  describe('interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Component onClick={handleClick} />);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty data gracefully', () => {
      render(<Component data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
});
```

## Debugging Tests

### VS Code Debugging

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--inspect-brk"],
      "port": 9229
    }
  ]
}
```

### Common Issues

1. **Async timing issues**: Use `waitFor` instead of arbitrary delays
2. **State not updating**: Ensure proper act() wrapping
3. **Can't find element**: Check if element is rendered conditionally
4. **Mock not working**: Verify mock is imported before component

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Jest-Axe for A11y](https://github.com/nickcolley/jest-axe)