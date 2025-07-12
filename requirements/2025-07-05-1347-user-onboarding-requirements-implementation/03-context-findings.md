# Context Findings

## Existing Requirements System Analysis

### System Architecture
The MESSAi platform uses a sophisticated file-based requirements gathering system with a 7-stage workflow:

1. **Initial Request** (`00-initial-request.md`)
2. **Discovery Questions** (`01-discovery-questions.md`)
3. **Discovery Answers** (`02-discovery-answers.md`)
4. **Context Findings** (`03-context-findings.md`)
5. **Detail Questions** (`04-detail-questions.md`)
6. **Detail Answers** (`05-detail-answers.md`)
7. **Requirements Specification** (`06-requirements-spec.md`)

### Key Files Identified

#### Onboarding Infrastructure
- `app/onboarding/page.tsx` - Main onboarding page
- `components/onboarding/OnboardingWizard.tsx` - 5-step wizard (279 lines)
- `app/api/user/onboarding/route.ts` - API for tracking progress
- `components/onboarding/steps/` - Individual onboarding steps

#### Requirements System
- `requirements/index.md` - System documentation
- `requirements/.current-requirement` - Active requirement tracker
- Multiple requirement folders with 7-stage workflow
- `mess-parameters-json.json` - 500+ scientific parameters

#### Scientific Context
- `lib/ai-predictions.ts` - AI prediction engine
- `components/MFCConfigPanel.tsx` - Equipment configuration
- `components/DesignSpecific3DModels.tsx` - 3D visualization
- `prisma/schema.prisma` - Database schema patterns

### Patterns for Scientific Modifications

#### Common Modification Types
- **MESS Model Configuration**: Custom electrode materials, microbial communities
- **Research Literature Integration**: Publication tracking, paper databases
- **Testing Scripts and Protocols**: Scientific validation workflows
- **Sustainability Research**: Grants database, environmental metrics
- **User Authentication**: Research collaboration, institutional verification

#### Parameter Integration
- 500+ parameters across 18 categories
- Structured validation rules
- Scientific accuracy based on peer-reviewed research
- Units, ranges, descriptions for each parameter

### Integration Points

#### Database Schema Extensions
- User management tables
- Research collaboration models
- Scientific parameter storage
- Configuration presets

#### API Patterns
- RESTful endpoints in `app/api/`
- Zod validation schemas
- Role-based access control
- Rate limiting for admin features

#### Component Architecture
- React functional components with hooks
- Tailwind CSS with LCARS theme
- Three.js for 3D visualizations
- Zustand for state management

### Technical Constraints

#### Performance Considerations
- WebGL memory management for 3D models
- Large scientific datasets
- Real-time parameter validation
- Concurrent user interactions

#### Security Requirements
- Scientific data protection
- Institutional collaboration controls
- API rate limiting
- File upload validation

### Similar Features Analysis

#### Existing Onboarding (components/onboarding/OnboardingWizard.tsx)
- 5-step wizard: Welcome, Profile, Interests, Preferences, Complete
- Progress tracking with visual indicators
- API integration for user profile updates
- Skip functionality for optional steps
- Error handling and validation

#### Requirements Workflow Examples
- **2025-07-05-1024-mess-model-configuration**: Equipment customization
- **2025-01-05-1428-research-literature-database**: Scientific paper management
- **2025-01-05-1107-testing-scripts-protocols**: Quality assurance workflows

### User Experience Patterns

#### LCARS Theme Consistency
- Orange/gold accent colors
- Geometric button shapes
- Consistent typography scale
- Scientific interface aesthetics

#### Progressive Disclosure
- Simple start with advanced options
- Contextual help for complex parameters
- Visual feedback for user actions
- Clear navigation patterns

### Recommendations

1. **Extend Existing Onboarding**: Add requirements gathering as step 6
2. **Create Template Library**: Common scientific modification templates
3. **Integrate Parameter System**: Use mess-parameters-json.json for validation
4. **Leverage API Patterns**: Follow existing endpoint conventions
5. **Maintain Theme Consistency**: Use LCARS design patterns
6. **Support Scientific Workflow**: Focus on research-specific use cases