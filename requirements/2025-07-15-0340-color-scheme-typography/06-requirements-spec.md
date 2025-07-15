# Requirements Specification: Unified Color Scheme & Typography

## Problem Statement
The MESSAI application currently has inconsistent styling across different pages. While the homepage and enhanced parameters page use the sophisticated Caladan Bio aesthetic with dark green themes and custom components, other pages use basic Tailwind defaults with white backgrounds and blue accents. Typography usage is also inconsistent, with the Inter + Crimson Text font pairing not being systematically applied.

## Solution Overview
Implement a unified design system across all pages using the Caladan Bio aesthetic with consistent color schemes, typography patterns, and component styling. This includes updating the navigation, layout system, and all page components to use the established dark green theme while maintaining light/dark mode functionality.

## Functional Requirements

### 1. Color Scheme Unification
- **FR1.1**: Apply Caladan Bio color variables consistently across all pages
- **FR1.2**: Maintain light/dark mode toggle with both modes using Caladan colors
- **FR1.3**: Update Navigation component to use dark Caladan theme
- **FR1.4**: Replace generic Tailwind colors with Caladan variables throughout

### 2. Typography Standardization
- **FR2.1**: Use Inter + Crimson Text font pairing consistently
- **FR2.2**: Create typography utility classes for common patterns
- **FR2.3**: Ensure all text is legible with proper contrast ratios
- **FR2.4**: Apply consistent font weights and sizes across similar elements

### 3. Component Consistency
- **FR3.1**: Preserve and expand custom CaladanIcons usage
- **FR3.2**: Apply caladan-card, caladan-button patterns to all similar components
- **FR3.3**: Ensure consistent hover states and transitions
- **FR3.4**: Maintain glass morphism effects where appropriate

## Technical Requirements

### 1. File Updates Required

#### Core Layout Files
```
/apps/web/app/globals.css
- Add typography utility classes (caladan-heading-*, caladan-body-*, caladan-caption)
- Enhance existing Caladan utility classes
- Add typography scale variables

/apps/web/app/layout.tsx
- Update body className to use Caladan background variables
- Ensure font variables are properly applied
- Remove hardcoded color classes

/apps/web/components/Navigation.tsx
- Replace white background with caladan-bg-dark
- Update text colors to use Caladan variables
- Replace blue accents with green accents
- Update hover states to match Caladan patterns

/apps/web/components/ConditionalLayout.tsx
- Ensure consistent theme application
```

#### Page-Level Updates
```
/apps/web/app/dashboard/page.tsx
/apps/web/app/research/page.tsx
/apps/web/app/models/page.tsx
/apps/web/app/features/**/*.tsx
/apps/web/app/settings/**/*.tsx
/apps/web/app/tools/**/*.tsx
/apps/web/app/experiment/**/*.tsx
- Apply caladan-bg-dark as base background
- Use Caladan text color variables
- Apply new typography utility classes
- Replace generic cards with caladan-card
- Update buttons to use caladan-button
```

### 2. Typography Classes to Create
```css
.caladan-heading-1 /* 4xl-6xl, Crimson Text, light weight */
.caladan-heading-2 /* 3xl-4xl, Crimson Text, light weight */
.caladan-heading-3 /* 2xl-3xl, Inter, medium weight */
.caladan-body-large /* lg-xl, Inter, normal weight */
.caladan-body /* base, Inter, normal weight */
.caladan-caption /* sm, Inter, normal weight */
.caladan-label /* xs, Inter, medium weight, uppercase */
```

### 3. Color Variable Usage
```css
/* Light Mode */
--background: var(--caladan-light)
--foreground: var(--caladan-dark)
--card: slightly lighter than background
--primary: var(--caladan-accent)

/* Dark Mode */
--background: var(--caladan-dark)
--foreground: light text
--card: var(--caladan-medium) with opacity
--primary: var(--caladan-accent)
```

## Implementation Hints

### 1. Navigation Update Pattern
```tsx
// From:
<nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">

// To:
<nav className="fixed top-0 z-50 w-full caladan-bg-dark border-b border-gray-700/30">
```

### 2. Typography Application Pattern
```tsx
// Headings
<h1 className="caladan-heading-1">Title</h1>

// Body text
<p className="caladan-body">Content</p>

// Cards
<div className="caladan-card">...</div>
```

### 3. Button Pattern
```tsx
// Primary action
<button className="caladan-button">Action</button>

// Secondary action
<button className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">
  Secondary
</button>
```

## Acceptance Criteria

### 1. Visual Consistency
- [ ] All pages use Caladan Bio color scheme
- [ ] Navigation matches dark theme on all pages
- [ ] No white backgrounds except in light mode
- [ ] Consistent green accent usage

### 2. Typography
- [ ] Inter used for all UI text
- [ ] Crimson Text used for major headings
- [ ] Consistent font sizes across similar elements
- [ ] All text meets WCAG AA contrast requirements

### 3. Component Styling
- [ ] All cards use caladan-card styling
- [ ] All primary buttons use caladan-button
- [ ] CaladanIcons used consistently
- [ ] Glass morphism effects preserved

### 4. Mode Support
- [ ] Light mode uses light Caladan colors
- [ ] Dark mode uses dark Caladan colors
- [ ] Mode toggle works on all pages
- [ ] No color flashing on page load

## Testing Considerations
- Test on multiple screen sizes for responsive typography
- Verify contrast ratios meet accessibility standards
- Check dark/light mode transitions
- Ensure no unstyled content flash
- Test navigation active states
- Verify hover/focus states are visible

## Migration Strategy
1. Update globals.css with new typography utilities
2. Update root layout.tsx
3. Update Navigation component
4. Update page by page starting with most visible
5. Test each page in both light and dark modes
6. Final review for consistency

## Assumptions
- Existing Caladan color variables will be preserved
- Custom SVG icons will continue to be used
- Glass morphism effects are desired throughout
- Performance impact of consistent styling is acceptable
- All pages should have equal visual priority