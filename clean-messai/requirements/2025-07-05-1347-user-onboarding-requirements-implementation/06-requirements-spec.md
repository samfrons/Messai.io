# Requirements Specification: MESSAi Maker Training - User Onboarding for Requirements & Modifications

## Problem Statement

MESSAi platform users need guidance on how to gather requirements and implement their own modifications to the platform tools. Currently, while a sophisticated requirements gathering system exists, there's no user-facing onboarding to teach researchers how to use it effectively. Users lack structured guidance for customizing MESSAi's bioelectrochemical systems tools, creating templates for scientific modifications, and understanding the platform's 500+ scientific parameters.

## Solution Overview

Extend the existing OnboardingWizard.tsx with a new "MESSAi Maker Training" step that teaches users the 7-stage requirements gathering workflow, provides pre-built templates for common scientific modifications, and integrates with the scientific parameter system to enable self-service customization.

## Functional Requirements

### 1. MESSAi Maker Training Integration
- **FR1.1**: Add new "MESSAi Maker Training" step as step 6 in OnboardingWizard.tsx
- **FR1.2**: Extend STEPS array to include maker training with appropriate progress tracking
- **FR1.3**: Maintain visual consistency with existing LCARS-themed onboarding steps
- **FR1.4**: Allow users to skip maker training while tracking completion status

### 2. Requirements Workflow Training
- **FR2.1**: Teach users the 7-stage requirements gathering workflow
- **FR2.2**: Provide interactive walkthrough of each stage with examples
- **FR2.3**: Show sample requirement files from existing successful projects
- **FR2.4**: Include hands-on practice with guided requirement creation

### 3. Scientific Modification Templates
- **FR3.1**: Create 5 pre-built templates for common modifications:
  - Electrode materials customization
  - Experimental protocol development
  - AI prediction model adjustments
  - Literature integration workflows
  - Testing protocol implementation
- **FR3.2**: Template selection interface with descriptions and use cases
- **FR3.3**: Template customization wizard with parameter selection
- **FR3.4**: Template validation against scientific accuracy standards

### 4. Parameter System Integration
- **FR4.1**: Interactive exploration of mess-parameters-json.json structure
- **FR4.2**: Parameter category browsing with search functionality
- **FR4.3**: Parameter validation rules explanation and examples
- **FR4.4**: Common parameter combination patterns for typical modifications

### 5. Progress Tracking and API Integration
- **FR5.1**: New API endpoint /api/user/requirements-training following existing patterns
- **FR5.2**: Training completion tracking with progress persistence
- **FR5.3**: Integration with user profile to show maker training status
- **FR5.4**: Analytics tracking for training effectiveness measurement

## Technical Requirements

### Database Schema Extensions
```sql
-- Add to existing User table
ALTER TABLE User ADD COLUMN makerTrainingCompleted BOOLEAN DEFAULT FALSE;
ALTER TABLE User ADD COLUMN makerTrainingStep INTEGER DEFAULT 0;
ALTER TABLE User ADD COLUMN makerTrainingCompletedAt DATETIME;

-- New table for training progress
CREATE TABLE RequirementsTraining (
  id          STRING PRIMARY KEY,
  userId      STRING NOT NULL,
  templateId  STRING,
  step        INTEGER NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  data        JSON,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

### API Endpoints

#### 1. Training Progress API
```typescript
// app/api/user/requirements-training/route.ts
interface TrainingRequest {
  step: number;
  completed?: boolean;
  templateId?: string;
  data?: any;
}

interface TrainingResponse {
  success: boolean;
  trainingStep: number;
  completedTraining: boolean;
  availableTemplates: Template[];
}
```

#### 2. Template API
```typescript
// app/api/templates/route.ts
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'electrode' | 'experiment' | 'ai' | 'literature' | 'testing';
  parameters: Parameter[];
  workflow: WorkflowStep[];
  examples: Example[];
}
```

### Component Structure Extensions

#### 1. OnboardingWizard.tsx Modifications
```typescript
// Extend STEPS array
const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'profile', title: 'Profile', component: ProfileStep },
  { id: 'interests', title: 'Interests', component: InterestsStep },
  { id: 'preferences', title: 'Preferences', component: PreferencesStep },
  { id: 'complete', title: 'Complete', component: CompleteStep },
  { id: 'maker-training', title: 'MESSAi Maker', component: MakerTrainingStep }, // NEW
];

// Extend OnboardingData interface
interface OnboardingData {
  // ... existing fields
  makerTrainingCompleted: boolean;
  selectedTemplates: string[];
  parameterExplored: boolean;
}
```

#### 2. New Component: MakerTrainingStep
```typescript
// components/onboarding/steps/MakerTrainingStep.tsx
interface MakerTrainingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function MakerTrainingStep({ data, updateData }: MakerTrainingStepProps) {
  // Interactive training interface
  // Template selection
  // Parameter exploration
  // Requirements workflow tutorial
}
```

### File Structure Extensions
```
components/onboarding/
├── steps/
│   ├── MakerTrainingStep.tsx          # NEW: Main training step
│   ├── RequirementsWorkflowGuide.tsx  # NEW: 7-stage workflow tutorial
│   ├── TemplateSelector.tsx           # NEW: Template selection interface
│   └── ParameterExplorer.tsx          # NEW: Parameter system exploration
├── templates/
│   ├── ElectrodeMaterialTemplate.tsx  # NEW: Electrode customization
│   ├── ExperimentProtocolTemplate.tsx # NEW: Experiment development
│   ├── AIPredictionTemplate.tsx       # NEW: AI model adjustment
│   ├── LiteratureIntegrationTemplate.tsx # NEW: Literature workflow
│   └── TestingProtocolTemplate.tsx    # NEW: Testing implementation
app/api/
├── user/
│   └── requirements-training/
│       └── route.ts                   # NEW: Training progress API
└── templates/
    └── route.ts                       # NEW: Template management API
```

## Implementation Patterns and Hints

### 1. OnboardingWizard.tsx Extension Pattern
```typescript
// Follow existing pattern for step management
const handleMakerTrainingComplete = async () => {
  // Update training completion status
  await fetch('/api/user/requirements-training', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      step: STEPS.length,
      completed: true,
      selectedTemplates: data.selectedTemplates,
    }),
  });
  
  // Continue to next step or complete onboarding
  handleNext();
};
```

### 2. Template System Integration
```typescript
// components/onboarding/templates/ElectrodeMaterialTemplate.tsx
import { messParameters } from '@/mess-parameters-json.json';

export function ElectrodeMaterialTemplate() {
  const electrodeParams = messParameters.filter(p => 
    p.category === 'Electrode Configuration'
  );
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <h3 className="text-xl font-bold text-lcars-gold mb-4">
        Electrode Material Customization
      </h3>
      {/* Interactive parameter selection */}
      {/* Requirements workflow guidance */}
      {/* Example implementations */}
    </div>
  );
}
```

### 3. Parameter System Integration
```typescript
// components/onboarding/steps/ParameterExplorer.tsx
interface ParameterCategory {
  name: string;
  parameters: Parameter[];
  description: string;
  commonModifications: string[];
}

const parameterCategories: ParameterCategory[] = [
  {
    name: 'Electrode Configuration',
    parameters: messParameters.filter(p => p.category === 'Electrode Configuration'),
    description: 'Customize electrode materials and surface treatments',
    commonModifications: ['Material substitution', 'Surface coating', 'Size optimization']
  },
  // ... other categories
];
```

### 4. Requirements Workflow Integration
```typescript
// components/onboarding/steps/RequirementsWorkflowGuide.tsx
const WORKFLOW_STEPS = [
  {
    id: 'initial-request',
    title: 'Initial Request',
    description: 'Capture your modification idea',
    example: 'I want to add a new graphene-based electrode material',
    template: '00-initial-request.md'
  },
  {
    id: 'discovery',
    title: 'Discovery Questions',
    description: 'Answer 5 key questions about scope and integration',
    example: 'Will this integrate with existing material database?',
    template: '01-discovery-questions.md'
  },
  // ... remaining workflow steps
];
```

## Integration with Existing Infrastructure

### 1. Maintain Existing Onboarding Flow
- Preserve all existing onboarding steps and functionality
- Add maker training as optional step with skip capability
- Maintain existing API contracts and data structures
- Use existing progress tracking patterns

### 2. Leverage Scientific Parameter System
- Use mess-parameters-json.json as training data source
- Integrate with existing parameter validation logic
- Follow existing scientific accuracy standards
- Maintain compatibility with AI prediction system

### 3. Follow Existing UI/UX Patterns
- Use LCARS theme consistency throughout training
- Follow existing button and form patterns
- Maintain responsive design for mobile users
- Use existing loading states and error handling

## Acceptance Criteria

- [ ] MESSAi Maker Training step integrated into existing onboarding wizard
- [ ] 7-stage requirements workflow tutorial with interactive examples
- [ ] 5 pre-built scientific modification templates available
- [ ] Parameter system exploration with search and filtering
- [ ] Training progress tracked via new API endpoint
- [ ] User profile updated with maker training completion status
- [ ] All existing onboarding functionality preserved
- [ ] LCARS theme consistency maintained throughout
- [ ] Mobile-responsive design for all training components
- [ ] Skip functionality available for advanced users
- [ ] Training effectiveness analytics implemented
- [ ] Integration with existing user authentication system

## Assumptions

- Users have basic understanding of bioelectrochemical systems
- Training will be optional but encouraged for new users
- Templates will be based on most common modification patterns
- Parameter system will remain stable during implementation
- Existing onboarding completion rates will be maintained
- Scientific accuracy standards will be preserved
- Mobile users will have reduced training functionality
- Training data will be stored in existing database
- API performance will meet existing standards

## Dependencies

- Existing OnboardingWizard.tsx component
- mess-parameters-json.json parameter system
- User authentication and profile management
- Existing API infrastructure and patterns
- LCARS theme and component library
- Requirements gathering system documentation
- Scientific parameter validation logic
- Database schema modification capabilities

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
- Extend OnboardingWizard.tsx with new step
- Create MakerTrainingStep component skeleton
- Implement API endpoint for training progress
- Add database schema extensions

### Phase 2: Core Training (Week 3-4)
- Implement requirements workflow tutorial
- Create parameter system explorer
- Build template selection interface
- Add progress tracking and validation

### Phase 3: Templates (Week 5-6)
- Develop 5 scientific modification templates
- Implement template customization wizards
- Add template validation and examples
- Create template management API

### Phase 4: Integration & Polish (Week 7-8)
- Complete onboarding wizard integration
- Implement analytics tracking
- Add mobile responsive design
- Conduct user testing and refinement

This comprehensive maker training system will enable MESSAi users to effectively gather requirements and implement their own scientific modifications while maintaining the platform's quality and consistency standards.