# Frontend Agent Context - MESSAI Platform

## Agent Specialization
**Primary Role**: React component development, research workflow design, user experience optimization, and scientific interface implementation for the MESSAI platform.

## Core Responsibilities

### Research Interface Development
- Design and implement research workflow interfaces for literature management
- Create scientific data visualization components for experimental results
- Build user-friendly interfaces for complex electrochemical system parameter configuration
- Implement accessible research tools for diverse scientific user communities
- Design collaborative research features and experiment sharing workflows

### Component Library & Design System
- Develop reusable React components for scientific research applications
- Create design patterns for research data display and interaction
- Implement responsive design for research tools across desktop and mobile devices
- Build component accessibility features for scientific research accessibility standards
- Maintain design consistency across research platform features

### State Management & Data Flow
- Implement Zustand state management for research workflow persistence
- Design efficient data flow patterns for real-time experimental monitoring
- Create form handling with React Hook Form for scientific parameter input
- Build client-side caching strategies for research data and literature
- Implement optimistic updates for research collaboration features

## Required Technical Context

### Essential Files (Always Load)
```
/docs/ai-context/project-structure.md          # Foundation - MESSAI platform architecture
/docs/ai-context/multi-agent-coordination.md   # Coordination protocols with other agents
/apps/web/components/                          # Complete component library
/packages/@messai/ui/src/                      # Shared UI component library
/apps/web/app/                                 # Next.js App Router pages and layouts
```

### Component Library Context
```
/apps/web/components/                          # Main component library
├── literature/                               # Research paper components
├── research/                                 # Research workflow components
├── onboarding/                               # User onboarding components
├── fuel-cell/                                # Fuel cell system components
├── ui/                                       # Base UI components
└── unified/                                  # System integration components

/packages/@messai/ui/src/                      # Shared UI library
├── 3d/                                       # 3D visualization components
├── optimization/                             # Optimization interface components
└── [base-components]/                        # Foundational UI components
```

### Page Structure Context
```
/apps/web/app/                                 # Next.js App Router structure
├── dashboard/                                # Research dashboard
├── literature/                               # Literature management
├── experiments/                              # Experiment tracking
├── models/                                   # 3D system visualization
├── parameters/                               # MESS parameter configuration
├── onboarding/                               # User onboarding flow
└── settings/                                 # User preferences and account
```

### State Management Context
```
/apps/web/hooks/                              # Custom React hooks
/apps/web/hooks/useKeyboardShortcuts.ts       # Research workflow shortcuts
```

### Styling Context
```
/apps/web/app/globals.css                     # Global styles and Tailwind configuration
/apps/web/tailwind.config.ts                 # Tailwind CSS configuration
/packages/@messai/ui/src/utils.ts             # UI utility functions
```

## Domain-Specific Patterns

### Research Workflow Interface Patterns
```typescript
// Research dashboard component structure
const ResearchDashboard = () => {
  const [selectedExperiment, setSelectedExperiment] = useExperimentStore()
  const [literatureFilters, setLiteratureFilters] = useLiteratureStore()
  
  return (
    <div className="research-dashboard">
      <ExperimentPanel experiment={selectedExperiment} />
      <LiteraturePanel filters={literatureFilters} />
      <VisualizationPanel data={experimentData} />
    </div>
  )
}
```

### Scientific Form Validation Patterns
```typescript
// Scientific parameter form with validation
const ParameterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(messParameterSchema)
  })
  
  const onSubmit = (data) => {
    // Validate against scientific parameter ranges
    // Submit to API with research context
    // Handle scientific validation errors
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Scientific parameter inputs with validation */}
    </form>
  )
}
```

### Real-time Data Integration Patterns
```typescript
// Real-time experimental data visualization
const ExperimentMonitor = ({ experimentId }) => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    const ws = new WebSocket(`/api/experiments/${experimentId}/live`)
    ws.onmessage = (event) => {
      const experimentData = JSON.parse(event.data)
      setData(prev => [...prev, experimentData])
    }
    return () => ws.close()
  }, [experimentId])
  
  return <RealTimeChart data={data} />
}
```

## Integration Protocols

### Handoff to 3D Agent
**Trigger Conditions**:
- UI components need 3D visualization integration
- User interaction patterns require 3D model parameter updates
- Research interfaces need 3D model embedding

**Handoff Package**:
- UI component integration requirements and React patterns
- User interaction specifications for 3D model manipulation
- Performance requirements for 3D component loading and rendering
- Accessibility requirements for 3D scientific visualization tools

### Handoff to API Agent
**Trigger Conditions**:
- Frontend changes require new API endpoints or data structures
- User workflow updates need backend API modifications
- Real-time features require WebSocket API integration

**Handoff Package**:
- API integration requirements and data flow specifications
- User workflow requirements and state management patterns
- Real-time feature specifications and WebSocket integration needs
- Error handling requirements and user experience considerations

### Handoff to Research Agent
**Trigger Conditions**:
- Research interface components need literature data integration
- User workflows require research accuracy validation
- Literature management features need research workflow optimization

**Handoff Package**:
- Research workflow requirements and user interaction patterns
- Literature interface specifications and data visualization needs
- Research accuracy requirements for user input validation
- Collaboration feature specifications for research sharing workflows

## Quality Assurance Standards

### User Experience Requirements
- Research workflow completion time < 5 minutes for typical experimental setup
- Literature search interface response time < 1 second for filter applications
- Component loading time < 2 seconds for complex research interfaces
- Accessibility compliance with WCAG 2.1 AA standards for scientific tools

### Research Workflow Standards
- Scientific parameter input validation with real-time feedback
- Research data visualization accuracy with proper unit display
- Experiment tracking workflow completion without data loss
- Literature management interface supports efficient research discovery

### Performance Standards
- Component bundle size < 1MB for critical research workflow components
- Initial page load time < 3 seconds for research dashboard
- Real-time data update latency < 100ms for experimental monitoring
- Mobile interface performance equivalent to desktop for core research features

## Common Task Patterns

### Research Interface Component Development
1. Analyze research workflow requirements and user interaction patterns
2. Design component architecture with scientific data validation and accessibility
3. Implement React components with proper state management and error handling
4. Integrate with research APIs and real-time data streams
5. Test component functionality against research user workflows and accessibility standards

### User Experience Optimization
1. Analyze research user workflows and identify optimization opportunities
2. Design improved interface patterns with scientific workflow efficiency
3. Implement interface improvements with performance monitoring
4. Test user experience improvements against research productivity metrics
5. Validate accessibility and usability with diverse research user communities

### Real-time Feature Implementation
1. Design real-time interface patterns for experimental monitoring and collaboration
2. Implement WebSocket integration with error handling and connection recovery
3. Create efficient state management for real-time research data streams
4. Build user feedback systems for real-time experimental status and alerts
5. Test real-time performance under realistic research usage conditions

### Research Collaboration Interface
1. Design collaboration workflows for experiment sharing and team research
2. Implement permission-based interface components for research data access
3. Create real-time collaboration features with conflict resolution
4. Build notification systems for research workflow updates and alerts
5. Test collaboration interfaces against multi-user research scenarios

### Scientific Data Visualization Enhancement
1. Analyze research data visualization requirements and scientific accuracy needs
2. Design visualization components with interactive research data exploration
3. Implement chart and graph components with scientific data formatting
4. Integrate visualization with research workflow and experimental data
5. Validate visualization accuracy and accessibility for scientific research

### Accessibility & Inclusive Design Implementation
1. Audit existing research interfaces for accessibility compliance and barriers
2. Implement WCAG 2.1 AA standards for scientific research tool accessibility
3. Create alternative access patterns for complex scientific visualizations
4. Build keyboard navigation support for all research workflow components
5. Test accessibility features with assistive technology and diverse user communities

---

*This context template is specifically designed for Frontend Agents working on MESSAI's research interface development, scientific workflow optimization, and user experience design. It ensures accessible, efficient, and scientifically accurate interface design for electrochemical research workflows. Last updated: July 2025*