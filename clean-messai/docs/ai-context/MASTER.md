# MESSAi Master Context Document

## Project Overview
MESSAi (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial electrochemical systems research, modeling, development, and operation. This document serves as the foundation tier of our 3-tier documentation system.

## Project Standards

### Code Quality Standards
- **TypeScript**: Strict mode enforced across all code
- **React Patterns**: Functional components with hooks only
- **Testing**: Test-driven development with >80% coverage
- **Documentation**: Inline JSDoc comments for all public APIs
- **Linting**: ESLint with strict rules, Prettier for formatting

### Scientific Standards
- **Accuracy**: All predictions based on peer-reviewed research
- **Data Integrity**: Only verified research papers, no fabricated data
- **Units**: SI units with clear conversions
- **Validation**: Cross-reference with published benchmarks
- **Traceability**: All data linked to source papers

## Architecture Principles

### 1. Clean Separation of Concerns
- **Domain Logic**: Isolated in packages (@messai/core)
- **UI Components**: Reusable components in @messai/ui
- **API Layer**: Standardized in @messai/api
- **Database**: Abstracted through @messai/database

### 2. Feature-Based Worktree Isolation
- **clean-messai**: Core platform with minimal features
- **messai-lab-clean**: Laboratory tools and simulations
- **messai-research-clean**: Research paper management
- **messai-ai-clean**: AI/ML predictions and insights
- **messai-marketing-clean**: Public-facing marketing site

### 3. Shared Component Libraries
- **@messai/core**: Business logic and calculations
- **@messai/ui**: Design system and UI components
- **@messai/api**: API utilities and middleware
- **@messai/database**: Database models and utilities

### 4. API-First Design
- **RESTful**: Standard REST conventions
- **Versioned**: /api/v1/* for stability
- **Documented**: OpenAPI/Swagger specs
- **Validated**: Input validation on all endpoints
- **Secured**: Authentication and rate limiting

## Development Workflow

### Phase-Based Execution
1. **Planning Phase**: Documentation-driven development
2. **Implementation Phase**: Multi-agent assistance
3. **Validation Phase**: Automated testing and external AI review
4. **Integration Phase**: Cross-worktree compatibility
5. **Deployment Phase**: Environment-specific builds

### Multi-Agent Assistance
- **Code Agent**: Implementation and refactoring
- **Test Agent**: Test generation and coverage
- **Docs Agent**: Documentation updates
- **Review Agent**: Code quality and best practices

### Automated Documentation Updates
- Pre-commit hooks update relevant docs
- CI/CD generates API documentation
- Component changes trigger doc regeneration
- Feature completion updates architecture docs

### Continuous Validation
- Unit tests on every commit
- Integration tests on PR
- Performance benchmarks weekly
- Security scans daily
- Accessibility audits on UI changes

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State**: Zustand for client state
- **3D Graphics**: Three.js + React Three Fiber

### Backend
- **API**: Next.js API Routes
- **Database**: Prisma ORM
- **Storage**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js
- **Validation**: Zod schemas

### Infrastructure
- **Deployment**: Vercel (primary), Docker (self-hosted)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Testing**: Vitest, React Testing Library
- **Documentation**: TypeDoc, Storybook

## Security Guidelines

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure session management
- OAuth2 integration ready

### Data Protection
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS protection in React
- HTTPS enforced in production
- Environment variable management

### Demo Mode vs Production
- Clear separation of demo/prod features
- No auth required in demo mode
- External links for production signups
- Safe demo data only

## Performance Standards

### Frontend Performance
- Lighthouse score >90
- First Contentful Paint <1.5s
- Time to Interactive <3.5s
- Bundle size <500KB initial

### Backend Performance
- API response time <200ms (p95)
- Database queries <50ms
- Concurrent users: 1000+
- Request rate: 100 req/s

### 3D Rendering
- 60 FPS for standard models
- Progressive loading for complex scenes
- WebGL fallbacks
- Mobile optimization

## Quality Metrics

### Code Quality
- TypeScript coverage: 100%
- Test coverage: >80%
- Code duplication: <5%
- Cyclomatic complexity: <10

### Documentation Quality
- API documentation: 100%
- Component documentation: 100%
- Architecture diagrams: Current
- User guides: Complete

### Scientific Quality
- Data accuracy: Validated
- Prediction confidence: >85%
- Research coverage: 6000+ papers
- Model validation: Peer-reviewed

## Communication Patterns

### Error Handling
- User-friendly error messages
- Technical details in logs only
- Graceful degradation
- Clear recovery actions

### Loading States
- Skeleton screens for content
- Progress indicators for long operations
- Optimistic updates where safe
- Clear cancellation options

### Feedback Mechanisms
- Success confirmations
- Operation progress
- Validation messages
- Help tooltips

## Deployment Strategy

### Environment Configuration
- Development: Local SQLite
- Staging: Vercel preview
- Production: Vercel + PostgreSQL
- Self-hosted: Docker compose

### Release Process
1. Feature branch development
2. PR with automated checks
3. Staging deployment
4. Production release
5. Post-release monitoring

### Rollback Procedures
- Database backup before migrations
- Feature flags for gradual rollout
- Quick revert via Vercel
- Automated rollback triggers

## Team Collaboration

### Code Review Standards
- PR template compliance
- Two approvals required
- Automated checks must pass
- Documentation updates included

### Knowledge Sharing
- Weekly tech talks
- Documentation reviews
- Pair programming sessions
- Architecture decision records

### Communication Channels
- GitHub Issues: Bug reports
- GitHub Discussions: Features
- Slack: Real-time communication
- Email: External correspondence

---

*This document serves as the single source of truth for MESSAi development standards and practices. It should be auto-loaded for all AI-assisted development sessions.*