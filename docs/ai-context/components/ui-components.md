# UI Components Documentation (Shared across all worktrees)

## Overview
This document describes the shared UI component system that provides consistency across all MESSAi worktrees. The design system is based on modern accessibility standards and scientific application requirements.

## Design System Principles

### Scientific Application UI
- **Clarity**: Information-dense displays with clear hierarchy
- **Precision**: Exact values and measurements prominently displayed
- **Context**: Rich tooltips and explanations for scientific concepts
- **Efficiency**: Keyboard shortcuts and power-user features

### Component Organization
```
packages/@messai/ui/src/
├── components/              # Core UI components
│   ├── forms/              # Form controls and validation
│   ├── data/               # Data display components
│   ├── navigation/         # Navigation and routing
│   ├── feedback/           # Alerts, notifications, loading
│   ├── layout/             # Page layout components
│   └── scientific/         # Science-specific components
├── hooks/                  # Reusable React hooks
├── utils/                  # UI utility functions
├── themes/                 # Design tokens and themes
└── icons/                  # Icon components
```

## Core Component Library

### 1. Form Components
**Location**: `packages/@messai/ui/src/components/forms/`

**Base Form Controls**:
```typescript
// Input with scientific notation support
export interface ScientificInputProps {
  value: number | string
  unit?: string
  precision?: number
  scientificNotation?: boolean
  min?: number
  max?: number
  onChange: (value: number) => void
  onUnitChange?: (unit: string) => void
}

// Parameter slider with logarithmic scale
export interface ParameterSliderProps {
  value: number
  min: number
  max: number
  scale: 'linear' | 'logarithmic'
  step?: number
  unit: string
  label: string
  onChange: (value: number) => void
}

// Multi-select for materials/conditions
export interface MultiSelectProps<T> {
  options: SelectOption<T>[]
  value: T[]
  placeholder: string
  searchable?: boolean
  maxSelections?: number
  onChange: (selected: T[]) => void
}
```

### 2. Data Display Components
**Location**: `packages/@messai/ui/src/components/data/`

**Scientific Data Display**:
```typescript
// Performance metrics card
export interface MetricsCardProps {
  title: string
  metrics: Array<{
    label: string
    value: number
    unit: string
    confidence?: number
    trend?: 'up' | 'down' | 'stable'
  }>
  comparison?: {
    baseline: number
    label: string
  }
}

// Data table with sorting and filtering
export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortable?: boolean
  filterable?: boolean
  pagination?: PaginationConfig
  selection?: 'single' | 'multiple' | 'none'
  onSelectionChange?: (selected: T[]) => void
}

// Scientific chart wrapper
export interface ChartProps {
  type: 'line' | 'scatter' | 'bar' | 'heatmap'
  data: ChartData
  xAxis: AxisConfig
  yAxis: AxisConfig
  title?: string
  subtitle?: string
  errorBars?: boolean
  confidence?: boolean
}
```

### 3. Navigation Components
**Location**: `packages/@messai/ui/src/components/navigation/`

**Navigation System**:
```typescript
// Breadcrumb navigation
export interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    icon?: IconType
    current?: boolean
  }>
  separator?: React.ReactNode
}

// Tab system for complex interfaces
export interface TabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: IconType
    content: React.ReactNode
    disabled?: boolean
  }>
  defaultTab?: string
  orientation?: 'horizontal' | 'vertical'
  onChange?: (tabId: string) => void
}

// Sidebar navigation
export interface SidebarProps {
  items: NavigationItem[]
  collapsed?: boolean
  onToggle?: () => void
  footer?: React.ReactNode
}
```

### 4. Scientific Components
**Location**: `packages/@messai/ui/src/components/scientific/`

**Specialized Scientific UI**:
```typescript
// Periodic table element selector
export interface ElementSelectorProps {
  selected: string[]
  categories?: ElementCategory[]
  onSelect: (elements: string[]) => void
  maxSelections?: number
}

// pH scale input
export interface pHScaleProps {
  value: number
  onChange: (pH: number) => void
  range?: [number, number]
  indicators?: Array<{
    value: number
    label: string
    color: string
  }>
}

// Temperature input with unit conversion
export interface TemperatureInputProps {
  value: number
  unit: 'C' | 'F' | 'K'
  onChange: (value: number, unit: string) => void
  precision?: number
  range?: [number, number]
}

// Molecular formula renderer
export interface MolecularFormulaProps {
  formula: string
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  onElementClick?: (element: string) => void
}
```

### 5. Feedback Components
**Location**: `packages/@messai/ui/src/components/feedback/`

**User Feedback System**:
```typescript
// Alert system with scientific context
export interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  actions?: Array<{
    label: string
    action: () => void
    variant: 'primary' | 'secondary'
  }>
  scientific?: {
    confidence?: number
    references?: string[]
    methodology?: string
  }
}

// Loading states for calculations
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  progress?: number
  estimated?: string
  cancellable?: boolean
  onCancel?: () => void
}

// Tooltip with rich content
export interface TooltipProps {
  content: React.ReactNode
  trigger: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  interactive?: boolean
  scientific?: {
    formula?: string
    definition?: string
    references?: string[]
  }
}
```

## Design Tokens

### Color System
**Location**: `packages/@messai/ui/src/themes/colors.ts`

```typescript
export const colors = {
  // Primary palette (scientific blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  
  // Scientific data colors
  data: {
    positive: '#10b981',    // Green for positive values
    negative: '#ef4444',    // Red for negative values
    neutral: '#6b7280',     // Gray for neutral
    confidence: '#8b5cf6'   // Purple for confidence intervals
  },
  
  // Material categories
  materials: {
    carbon: '#374151',      // Dark gray
    metal: '#f59e0b',       // Amber
    polymer: '#ec4899',     // Pink
    ceramic: '#84cc16'      // Lime
  },
  
  // System status
  status: {
    operational: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    offline: '#6b7280'
  }
}
```

### Typography
**Location**: `packages/@messai/ui/src/themes/typography.ts`

```typescript
export const typography = {
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'monospace'],
    scientific: ['STIX Two Text', 'Times', 'serif']
  },
  
  sizes: {
    xs: '0.75rem',    // Small labels
    sm: '0.875rem',   // Body text
    base: '1rem',     // Default
    lg: '1.125rem',   // Headings
    xl: '1.25rem',    // Large headings
    '2xl': '1.5rem',  // Page titles
    '3xl': '1.875rem' // Hero text
  },
  
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
}
```

### Spacing and Layout
**Location**: `packages/@messai/ui/src/themes/spacing.ts`

```typescript
export const spacing = {
  // Base spacing scale (rem)
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  
  // Component-specific spacing
  component: {
    padding: '1rem',
    margin: '0.5rem',
    gap: '0.75rem'
  }
}
```

## Accessibility Standards

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators

### Scientific Accessibility
```typescript
// Accessible scientific notation
export const AccessibleFormula: React.FC<{formula: string}> = ({formula}) => {
  const ariaLabel = convertFormulaToSpeech(formula)
  
  return (
    <span 
      role="img" 
      aria-label={ariaLabel}
      className="scientific-formula"
    >
      {renderFormula(formula)}
    </span>
  )
}

// Screen reader friendly data tables
export const AccessibleDataTable: React.FC<DataTableProps> = (props) => {
  return (
    <table role="table" aria-label={props.caption}>
      <caption className="sr-only">{props.caption}</caption>
      {/* Table implementation */}
    </table>
  )
}
```

## Responsive Design

### Breakpoint System
```typescript
export const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Ultra-wide
}
```

### Mobile Optimizations
- Touch-friendly interactive elements (minimum 44px)
- Simplified navigation for mobile
- Responsive data tables with horizontal scrolling
- Collapsible sections for complex forms

## Performance Considerations

### Component Optimization
```typescript
// Memoized components for expensive renders
export const MemoizedChart = React.memo(Chart, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data && 
         prevProps.config === nextProps.config
})

// Virtualized lists for large datasets
export const VirtualizedDataTable: React.FC<{items: any[]}> = ({items}) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {TableRow}
    </FixedSizeList>
  )
}
```

### Bundle Optimization
- Tree shaking for unused components
- Code splitting by component category
- Lazy loading for complex visualizations
- SVG sprite sheets for icons

## Testing Strategy

### Component Testing
```typescript
// Example component test
describe('ScientificInput', () => {
  it('formats scientific notation correctly', () => {
    render(<ScientificInput value={0.000123} scientificNotation />)
    expect(screen.getByDisplayValue('1.23e-4')).toBeInTheDocument()
  })
  
  it('validates input ranges', () => {
    const onChange = jest.fn()
    render(<ScientificInput min={0} max={100} onChange={onChange} />)
    
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '150'}})
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

### Accessibility Testing
```typescript
// Accessibility test example
describe('DataTable accessibility', () => {
  it('provides proper ARIA labels', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-label')
  })
  
  it('supports keyboard navigation', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    fireEvent.keyDown(screen.getByRole('table'), {key: 'ArrowDown'})
    // Test keyboard navigation behavior
  })
})
```

## Usage Guidelines

### Component Composition
```typescript
// Good: Composable components
const SystemMetrics = () => (
  <Card>
    <CardHeader>
      <CardTitle>Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <MetricsGrid>
        <MetricItem label="Power Density" value={1.2} unit="mW/m²" />
        <MetricItem label="Efficiency" value={85} unit="%" />
      </MetricsGrid>
    </CardContent>
  </Card>
)

// Avoid: Monolithic components
const BadSystemDisplay = () => (
  <div className="everything-in-one-component">
    {/* Hundreds of lines of JSX */}
  </div>
)
```

### State Management
```typescript
// Use local state for UI-only concerns
const [isExpanded, setIsExpanded] = useState(false)

// Use context for cross-component state
const { theme, setTheme } = useTheme()

// Use external state for business logic
const { predictions, loading } = usePredictions()
```

---

*This documentation ensures consistent, accessible, and maintainable UI components across all MESSAi worktrees.*