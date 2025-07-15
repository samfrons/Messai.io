# Context Findings

## Current State Analysis

### Color Scheme Status
- **Globals.css**: Well-defined Caladan Bio color scheme with CSS custom properties
  - Light mode: Professional greens (150 hue variants)
  - Dark mode: Deep green background with bright green accents
  - Custom caladan-* utility classes already implemented
- **Homepage**: Uses dark Caladan Bio aesthetic consistently 
- **Enhanced Parameters Page**: Uses caladan-card, caladan-button, caladan-icon-bg classes
- **Other Pages**: Inconsistent styling - many still use basic Tailwind defaults

### Typography Status
- **Current Fonts**: Inter (primary), Playfair Display, Crimson Text
- **Font Variables**: Properly configured with CSS variables
- **Usage**: Inconsistent application across pages

### Layout & Navigation
- **Navigation**: Uses light theme (white background, blue accents) - inconsistent with dark Caladan theme
- **ConditionalLayout**: Shows nav on most pages except homepage
- **Root Layout**: Basic light/dark theme setup but not using Caladan colors

### Component Library Status
- **Custom Icons**: Excellent CaladanIcons system with 8+ SVG components
- **UI Components**: ParameterCard, FeatureCard with Caladan styling
- **Design System**: Partially implemented - some pages use it, others don't

## Files Requiring Updates

### Core Layout Files
- `/apps/web/app/layout.tsx` - Update font pair and theme
- `/apps/web/app/globals.css` - Enhance typography utilities
- `/apps/web/components/Navigation.tsx` - Apply Caladan theme
- `/apps/web/components/ConditionalLayout.tsx` - Theme consistency

### Page-Level Updates Needed
- `/apps/web/app/dashboard/page.tsx` - Apply unified styling
- `/apps/web/app/research/page.tsx` - Convert to Caladan theme
- `/apps/web/app/models/page.tsx` - Standardize design
- `/apps/web/app/features/**` - Ensure consistency
- `/apps/web/app/settings/**` - Apply unified theme

### Config Files
- `/apps/web/tailwind.config.js` - Enhance with Caladan variables

## Typography Recommendations (Based on Research)

### Recommended Font Pair Options:
1. **Inter + Crimson Text** (Current, needs refinement)
   - Inter: Modern, readable sans-serif for UI elements
   - Crimson Text: Elegant serif for headings and emphasis
   
2. **DM Sans + JetBrains Mono** (Alternative)
   - DM Sans: Clean, professional sans-serif
   - JetBrains Mono: Technical monospace for code/data

3. **Lato + PT Serif** (Conservative option)
   - Lato: Trusted biotech industry standard
   - PT Serif: Readable serif for scientific content

## Design System Patterns Found

### Successful Caladan Patterns
- `caladan-bg-dark`: Deep green backgrounds
- `caladan-bg-medium`: Medium green sections  
- `caladan-text-accent`: Bright green highlights
- `caladan-card`: Glass morphism cards
- `caladan-button`: Gradient green buttons
- `caladan-icon-bg`: Icon background treatment

### Missing Standardization
- Page layouts inconsistent
- Navigation doesn't match Caladan theme
- Typography scale not systematically applied
- Component usage varies by page

## Browser Compatibility Considerations
- CSS custom properties: Well supported
- Font loading: Already optimized with font-display: swap
- Dark theme: Ready for both modes as requested