# Contributing to MESSAi

Thank you for your interest in contributing to MESSAi! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/messai-mvp.git
   cd messai-mvp
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/messai-mvp.git
   ```

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Git

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### Database Setup (Optional)

If you need to work with the database:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes** - Fix existing issues
2. **Features** - Add new functionality
3. **Documentation** - Improve or add documentation
4. **Tests** - Add missing tests or improve existing ones
5. **Performance** - Optimize code for better performance
6. **Design** - Improve UI/UX
7. **Scientific Accuracy** - Enhance prediction models or add new MFC designs

### Finding Issues to Work On

- Check issues labeled [`good first issue`](https://github.com/ORIGINAL_OWNER/messai-mvp/labels/good%20first%20issue)
- Look for [`help wanted`](https://github.com/ORIGINAL_OWNER/messai-mvp/labels/help%20wanted) labels
- Review the [project roadmap](https://github.com/ORIGINAL_OWNER/messai-mvp/projects)

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Calculates predicted power output for an MFC design
 * @param params - Experimental parameters
 * @returns Predicted power in mW/m²
 */
export function calculatePower(params: ExperimentParams): number {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types for props

```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  // Component implementation
}
```

### CSS/Styling

- Use Tailwind CSS utilities
- Follow the LCARS design system
- Keep custom CSS minimal
- Use CSS modules for component-specific styles

### File Organization

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── Button.module.css
└── index.ts
```

## Testing Guidelines

### Writing Tests

All new features should include tests:

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user workflows

### Test Structure

```typescript
describe('Component/Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples
```
feat(predictions): add substrate concentration factor

fix(3d-model): correct electrode positioning in mason jar design

docs(api): update prediction endpoint documentation

test(mfc-config): add tests for material selection
```

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin your-branch-name
   ```

3. **Create Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm test`)
- [ ] New code includes appropriate tests
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions
- [ ] PR description clearly explains changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the FAQ** in documentation
3. **Verify the issue** is reproducible

### Issue Template

```markdown
## Bug Report

### Description
Clear description of the bug

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: [e.g., Chrome 91]
- OS: [e.g., macOS 11.4]
- Node version: [e.g., 18.12.0]

### Screenshots
If applicable, add screenshots
```

## Scientific Contributions

For contributions related to MFC science:

1. **Provide References**: Include peer-reviewed sources
2. **Validate Models**: Ensure predictions align with published data
3. **Document Assumptions**: Clearly state any assumptions made
4. **Add Test Cases**: Include test cases with known outputs

Example:
```typescript
// Based on Logan et al. (2006) - DOI: 10.1021/es0605016
const TEMPERATURE_COEFFICIENT = 0.065; // Q10 temperature coefficient
```

## Getting Help

If you need help:

1. **Check documentation** first
2. **Ask in discussions** on GitHub
3. **Join our Discord** (if available)
4. **Contact maintainers** as last resort

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in relevant documentation

Thank you for contributing to MESSAi! Your efforts help advance microbial electrochemical systems research.