# CLAUDE.md - MESSAi Marketing Website (messai-home branch)

This file provides context for AI assistants working on the MESSAi marketing website on the `messai-home` branch.

## Branch Overview

This is the **`messai-home`** branch, dedicated to the public-facing marketing website for MESSAi. It showcases the platform's revolutionary capabilities for bioelectrochemical systems research and development.

## Project Vision

**Mission**: "To boldly build what no one has built before: smart, slick, scalable microbial electrochemical systems that unlock the magic of microbes and conductive materials working together!"

This marketing site serves as the gateway to demonstrate MESSAi's complete research-to-commercialization platform for experimenting, discovering, and designing the most advanced microbial electrochemical systems.

## Marketing Website Structure

### Key Routes
- **`/marketing`** - Main marketing homepage with bio-inspired design
- **`/marketing/platform`** - Detailed platform capabilities overview
- **`/marketing/industries`** - Industry-specific applications (planned)
- **`/marketing/about`** - Company mission and team (planned)
- **`/marketing/pricing`** - Pricing tiers and plans (planned)
- **`/marketing/contact`** - Contact and demo requests (planned)
- **`/research`** - Public research database (3,721 papers)
- **`/demo`** - Interactive platform demo

### Bio-Inspired Design System

#### Theme Philosophy
- **Sophisticated but fun** - Professional scientific credibility with organic bio-inspiration
- **Living aesthetics** - Inspired by microscopy images of algae, microorganisms, and cellular structures
- **Easy customization** - Modular theme system for quick style iterations

#### Color Palette
The design uses a refined bio-inspired color system based on actual microscopy imagery:
- **Deep forest greens** - Primary brand colors (#1e3a32, #2d5a47)
- **Refined cellular pink** - Accent color (#c2185b)
- **Clean lab whites** - Neutral backgrounds (#f8f9fa)
- **Organic overlays** - Subtle bio-accents for depth

#### Theme Variants
1. **Refined** (default) - Professional and elegant
2. **Bold** - More vibrant for energy
3. **Minimal** - Clean and simple
4. **Industry-specific** - Wastewater, energy, environmental themes

### Key Features Implemented

#### 1. Revolutionary Homepage (`/marketing`)
- Hero section: "Unlock the Magic of Microbial Systems"
- 3,721 research papers as flagship feature
- Three pillars: Discover, Design, Scale
- Industry applications showcase
- Interactive stats with hover effects

#### 2. Platform Overview (`/marketing/platform`)
- Three integrated engines: Research, Design, Scale-up
- Detailed capability breakdown
- Innovation workflow visualization
- Call-to-action for trials and demos

#### 3. Theme Customization System
- **Theme Selector** - Floating widget for easy style testing
- **CSS Custom Properties** - Instant theme switching
- **Multiple Presets** - Scientific, vibrant, minimal, industry-specific
- **Tailwind Integration** - Extended with bio-inspired colors

#### 4. Professional Navigation
- Sticky header with bio-inspired logo
- Hover states with descriptive tooltips
- Mobile-responsive menu
- Comprehensive footer with all links

## Technical Implementation

### File Structure
```
app/marketing/
├── layout.tsx          # Marketing-specific layout with theme provider
├── page.tsx           # Revolutionary homepage
└── platform/
    └── page.tsx       # Platform capabilities overview

components/marketing/
└── ThemeSelector.tsx  # Theme customization widget

lib/themes/
└── refined-bio-theme.ts  # Bio-inspired theme system

hooks/
└── useTheme.ts        # Theme management hook
```

### Theme System Architecture
- **Base themes**: Refined, Bold, Minimal
- **Industry themes**: Wastewater, Energy, Environmental
- **Dynamic switching**: Real-time theme updates
- **CSS variables**: For instant color changes
- **Tailwind extended**: Custom bio-inspired utilities

### Key Technologies
- **Next.js 15** - App Router for marketing pages
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Extended with bio-inspired design system
- **Framer Motion** - Smooth animations (planned)
- **React Hooks** - Theme state management

## Content Strategy

### Value Propositions
1. **World's Largest Database** - 3,721 verified research papers
2. **AI-Powered Insights** - Automated performance extraction
3. **Complete Platform** - Research to commercial deployment
4. **Industry Applications** - Wastewater, energy, manufacturing, environmental

### Target Audiences
- **Researchers** - Access comprehensive literature and AI analysis
- **Engineers** - Design and optimize systems with 3D tools
- **Industry** - Scale from lab to commercial deployment
- **Investors** - Understand the market opportunity

### Key Messaging
- "Unlock the Magic of Microbes"
- "From Scientific Discovery to Commercial Deployment"
- "Make the Impossible Inevitable"
- "Pioneer the Microbial Revolution"

## Development Guidelines

### When Working on Marketing Pages
1. **Maintain sophistication** - Professional appearance is crucial
2. **Use theme system** - Apply consistent bio-inspired styling
3. **Mobile-first** - Ensure responsive design
4. **Performance** - Optimize images and animations
5. **SEO-ready** - Add proper meta tags and structure

### Theme Customization
1. **Test all variants** - Use ThemeSelector to preview changes
2. **Keep it elegant** - Bio-inspiration should enhance, not dominate
3. **Industry relevance** - Tailor themes to sector needs
4. **Accessibility** - Ensure contrast ratios meet WCAG standards

### Content Updates
1. **Verify numbers** - Keep research count accurate (currently 3,721)
2. **Scientific accuracy** - All claims must be verifiable
3. **Professional tone** - Inspiring but credible
4. **Visual hierarchy** - Guide users through the journey

## Integration Notes

### With Main Platform
- Research database (`/research`) remains publicly accessible
- Demo (`/demo`) links to interactive platform features
- Authentication not required for marketing pages
- Seamless navigation between marketing and platform

### With Other Branches
- **DO NOT merge to master** without thorough testing
- Marketing site is isolated to `messai-home` branch
- Coordinate with platform features from other branches
- Maintain consistent branding across all touchpoints

## Future Enhancements

### Planned Pages
- **Industries** - Detailed sector-specific solutions
- **About** - Team, mission, and values
- **Pricing** - Tiered pricing structure
- **Contact** - Forms and demo scheduling
- **Blog** - Research insights and tutorials
- **Case Studies** - Success stories

### Technical Additions
- **Animations** - Framer Motion for smooth transitions
- **3D Previews** - Showcase platform capabilities
- **Performance** - Image optimization, lazy loading
- **Analytics** - Conversion tracking
- **A/B Testing** - Theme and content optimization

## Testing Checklist

Before considering merge to master:
- [ ] All theme variants work correctly
- [ ] Mobile responsive across devices
- [ ] Links to research database functional
- [ ] Performance metrics acceptable
- [ ] SEO meta tags in place
- [ ] Accessibility standards met
- [ ] Cross-browser compatibility verified
- [ ] Content accuracy verified

## Important Notes

1. **This is a feature branch** - Not yet merged to master
2. **Bio-inspired design** - Sophisticated implementation, not childish
3. **Easy to customize** - Theme system allows quick iterations
4. **Research-first** - 3,721 papers as primary differentiator
5. **Professional focus** - Scientific credibility is paramount

---

*This CLAUDE.md is specific to the `messai-home` branch and should be updated as the marketing website evolves.*