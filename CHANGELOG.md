# Changelog

All notable changes to the MESSAi Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features
- Comprehensive testing infrastructure with Vitest and Playwright
- GitHub Actions CI/CD pipeline with automated testing and deployment
- Semantic release workflow with conventional commits
- Environment variable validation with Zod schemas
- Security middleware with CSP headers and CORS protection

### 🐛 Bug Fixes
- Fixed port configuration to use 3001 consistently
- Resolved TypeScript path mapping issues after structure cleanup
- Removed duplicate configuration files

### 🔒 Security
- Added comprehensive security middleware for Next.js
- Implemented environment variable validation
- Created security alert documentation for credential management
- Added pre-commit hooks for code quality

### ♻️ Code Refactoring
- Consolidated testing setup to use Vitest only (removed Jest)
- Cleaned up monorepo structure (removed /libs, consolidated to /packages)
- Updated TypeScript configuration to use ES2022 target
- Removed embedded git worktrees and duplicate project copies

### 📚 Documentation
- Created comprehensive TESTING.md guide
- Updated CONTRIBUTING.md with detailed guidelines
- Added improvement tracking documentation
- Created security alert documentation

### 🏗️ Build System
- Upgraded Next.js from 14.1.0 to 15.x
- Added Playwright for E2E testing
- Configured coverage thresholds (80% statements, 70% branches)
- Set up automated release process with semantic-release

### 🧪 Testing
- Added unit test coverage requirements
- Implemented E2E testing with Playwright
- Created test utilities and mock data factories
- Added CI/CD test automation

## [1.0.0] - 2025-07-13

### ✨ Features
- Initial MESSAi platform release
- Nx monorepo architecture with clean structure
- Next.js 15 web application
- TypeScript strict mode throughout
- Tailwind CSS for styling
- Scientific constants and utilities for MES research
- Basic UI component library
- Health check API endpoint

### 🏗️ Project Structure
- Clean Nx monorepo setup
- Package organization with @messai namespace
- PNPM workspace configuration
- Proper TypeScript configuration
- ESLint and Prettier setup

---

## Semantic Versioning Guide

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes that require user action
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and small improvements

### Commit Types → Version Bumps

- `feat:` → MINOR version bump
- `fix:` → PATCH version bump
- `perf:` → PATCH version bump
- `refactor:` → PATCH version bump
- `BREAKING CHANGE:` → MAJOR version bump
- `docs:`, `style:`, `test:`, `chore:` → No version bump

### Release Process

1. Commits are analyzed for conventional commit format
2. Version is determined based on commit types
3. CHANGELOG.md is automatically updated
4. Git tag is created with new version
5. GitHub release is published
6. Deployment to staging and production

---

*This changelog is automatically maintained by [semantic-release](https://github.com/semantic-release/semantic-release).*