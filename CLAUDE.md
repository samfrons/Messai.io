# CLAUDE.md - AI Assistant Context for MESSAi

This file provides context and instructions for AI assistants (like Claude) working on the MESSAi project.

## Project Overview

MESSAi (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial electrochemical systems research. It supports various bioelectrochemical technologies including:
- Microbial Fuel Cells (MFCs) - electricity generation
- Microbial Electrolysis Cells (MECs) - hydrogen production
- Microbial Desalination Cells (MDCs) - water treatment
- Microbial Electrosynthesis (MES) - chemical production
- Other bioelectrochemical systems

The platform combines:
- Interactive 3D visualization using Three.js
- AI-powered predictions for system optimization
- Comprehensive experiment tracking
- Scientific material database with 27 electrode options
- LCARS (Star Trek-inspired) UI theme

## Key Technical Details

### Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme that will be implemented at a later date
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Database**: Prisma ORM (PostgreSQL ready)
- **Testing**: Vitest + React Testing Library

### Project Structure
```
messai-mvp/
├── app/              # Next.js pages and API routes
├── components/       # React components (LCARS themed)
├── lib/             # Business logic and utilities
├── docs/            # Comprehensive documentation
├── examples/        # Usage examples
└── tests/           # Test suites
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow functional React patterns (hooks)
- Maintain design consistency
- Write tests for new features
- Document scientific assumptions
- Follow Test Driven Development practices

### Important Commands
```bash
npm run dev          # Start dev server on port 3003
npm test            # Run tests
npm run lint        # Check code quality
npm run format      # Format code with Prettier
npm run db:studio   # Open Prisma Studio

# Literature system management
npm run literature:enhance-all    # Full enhancement pipeline
npm run db:integrity             # Check database integrity
npm run db:validate-links        # Validate external URLs
npm run test:literature          # Run literature tests
```

## Scientific Context

### Bioelectrochemical System Designs (13 types)
- **Laboratory**: Benchtop electrochemical bioreactors, benthic fuel cells, micro lab-on-a-chip cells
- **Pilot Scale**: 3D printed, benchtop bioreactor 
- **Industrial**: Wastewater treatment, architectural facade 

### Key Parameters
- **Temperature**: Optimal 25-35°C
- **pH**: Optimal ~7.0
- **Substrate Concentration**: 1-2 g/L typical
- **Power Output**: 5 mW/m² to 50 W/m² depending on design

### Material Categories
1. **Traditional**: Carbon cloth, graphite, stainless steel
2. **Graphene-based**: GO, rGO, aerogel
3. **Carbon Nanotubes**: SWCNT, MWCNT
4. **MXenes**: Ti₃C₂Tₓ, V₂CTₓ (cutting-edge 2D materials)
5. **Upcycled**: Reclaimed electronics with pre-treatments

## AI Prediction Model

The prediction engine (`lib/ai-predictions.ts`) uses:
- Temperature factor (Arrhenius-based)
- pH factor (bell curve around 7.0)
- Substrate factor (Monod kinetics)
- Design-specific multipliers
- Random variation for realism

## Literature System Guidelines

### CRITICAL: Data Integrity Rules
- **NEVER generate fake research papers or fabricated scientific data**
- **ONLY work with real, verified papers from legitimate sources**
- **Extrapolation allowed ONLY when explicitly requested and clearly marked**
- **ALL papers must have verification (DOI, PubMed ID, arXiv ID, or verified PDF)**

### Literature Database Loading Requirements
Always ensure the literature database loads reliably by:

1. **Error Handling**:
   - Wrap all literature components with ErrorBoundary
   - Implement retry logic for failed API calls
   - Show meaningful error messages to users
   - Log errors for debugging

2. **Performance Optimization**:
   - Implement pagination (default: 10-20 papers per page)
   - Add loading states for all async operations
   - Cache API responses where appropriate
   - Use database indexes on frequently queried fields

3. **Fallback Strategies**:
   - If main API fails, show cached data if available
   - Provide offline mode with limited functionality
   - Gracefully degrade features rather than crash

4. **Testing Requirements**:
   - Test with empty database
   - Test with large datasets (1000+ papers)
   - Test network failures and timeouts
   - Test authentication state changes

### Data Extraction Standards
When extracting data from papers for predictive models:

1. **Structured Extraction**:
   - System designs and configurations
   - Microbial communities and performance metrics
   - Electroanalytical methods and results
   - Anode/cathode material performance data
   - Maintenance and optimization protocols
   - Operating conditions and their impacts

2. **Quality Assurance**:
   - Verify units and experimental conditions
   - Cross-reference multiple papers for validation
   - Flag contradictory findings for review
   - Track confidence scores for extracted values

3. **Model Integration**:
   - New data must pass quality checks before integration
   - Maintain traceability to source papers
   - Version control for model parameter updates
   - Test predictions against literature benchmarks

### Dynamic Knowledge Base
The literature system should continuously build upon predictive simulation models by:

1. **Comprehensive Data Extraction**:
   - System designs: geometry, dimensions, flow patterns
   - Microbial communities: species composition, growth conditions
   - Electroanalytical methods: voltammetry, impedance, chronoamperometry
   - Material performance: degradation rates, surface modifications
   - Maintenance protocols: cleaning, regeneration, troubleshooting
   - Operating parameters: startup procedures, optimization strategies

2. **Knowledge Graph Construction**:
   - Link papers to materials, organisms, and performance metrics
   - Track experimental conditions and outcomes
   - Build relationships between different system configurations
   - Identify optimal parameter combinations from literature

3. **Predictive Model Enhancement**:
   - Use extracted data to validate and refine predictions
   - Identify parameter ranges from real experiments
   - Incorporate new materials and methods as discovered
   - Generate data-driven recommendations for users

## Common Tasks

## Requirements
1. Always review the requirements we delinated together in 'requirements' directory when implementing
2. Use ultrathink to ensure there are no conflicts and you are not breaking features


### Adding a New System Design
1. Update `app/page.tsx` with design details
2. Add 3D model in `components/DesignSpecific3DModels.tsx`
3. Update prediction multipliers in `lib/ai-predictions.ts`

### Adding Electrode Materials
1. Update `components/MESSConfigPanel.tsx`
2. Add material properties and descriptions
3. Update cost and efficiency ratings

### Modifying Predictions
1. Adjust factors in `lib/ai-predictions.ts`
2. Update API route in `app/api/predictions/route.ts`
3. Add tests for new prediction logic

### Troubleshooting Literature Loading Issues
1. Check database connection: `npm run db:studio`
2. Verify API endpoints: `curl http://localhost:3003/api/papers`
3. Check error logs in browser console
4. Run integrity check: `npm run db:integrity`
5. Clear cache and retry
6. Verify authentication state if papers are missing
7. Check pagination settings if results are limited

### Working with Demo Mode
1. **Check current mode**: Look for `getDemoConfig()` usage
2. **Add demo content**: Place in appropriate demo data files
3. **Hide authenticated features**: Add `auth-only-nav` class
4. **External links**: Use production URL from config

### Security Considerations for New Features
1. **Input Validation**: Always validate and sanitize user inputs
2. **Output Encoding**: Use React's built-in XSS protection
3. **Database Queries**: Use Prisma's parameterized queries only
4. **File Operations**: Validate file types and sizes
5. **API Routes**: Check authentication and demo mode

## 🔒 Security & Demo Mode Guidelines

### Demo Mode vs Production
MESSAi operates in two distinct modes with different security requirements:

#### **Demo Mode (Default for Cloned Repos)**
- **Environment**: Set `DEMO_MODE="true"` and `NEXT_PUBLIC_DEMO_MODE="true"`
- **Authentication**: Completely disabled - no local auth forms
- **User Menu**: Shows external links to messai.io for account creation
- **Navigation**: Hides authenticated-only features (My Dashboard, My Experiments)
- **Data**: Uses safe, curated demo content only
- **Purpose**: Showcase platform capabilities without security complexity

#### **Production Mode (messai.io)**
- **Environment**: Set `DEMO_MODE="false"` and configure full auth
- **Authentication**: Full NextAuth.js with database sessions
- **User Menu**: Local login/signup forms
- **Navigation**: Shows personal features when authenticated
- **Data**: Real user data with proper protection
- **Purpose**: Full research platform with user accounts

### Security Best Practices

#### **Environment Variables**
- NEVER commit `.env.local` or any file with real credentials
- Use `.env.example` as template with dummy values
- Production secrets must be set in deployment environment only
- Always check for accidental credential commits before pushing

#### **Authentication Security**
- In demo mode: Remove ALL authentication endpoints
- Use `getDemoConfig()` utility to check mode consistently
- External links must use `target="_blank" rel="noopener noreferrer"`
- Production URLs should come from environment variables

#### **API Route Protection**
```typescript
// Always check demo mode in API routes
import { getDemoConfig } from '@/lib/demo-mode'

export async function POST(request: Request) {
  const demoConfig = getDemoConfig()
  
  if (demoConfig.isDemo) {
    return NextResponse.json({ error: 'Not available in demo mode' }, { status: 403 })
  }
  
  // Production logic here
}
```

#### **Demo Content Guidelines**
- Use realistic but fictional data
- No real researcher names without permission
- No unpublished research data
- Performance metrics should be clearly marked as examples
- Email addresses should use example.com domain

### Implementation Checklist
When implementing features, verify:
- [ ] Demo mode properly disables authentication
- [ ] External links to production are clearly marked
- [ ] No sensitive data in demo content
- [ ] API routes check demo mode
- [ ] Navigation respects authentication state
- [ ] Environment variables are properly separated

## Testing Approach

- **Unit Tests**: Individual functions and components
- **Integration Tests**: User workflows
- **API Tests**: Endpoint validation
- **Performance Tests**: 3D rendering optimization
- **Accessibility Tests**: WCAG compliance
- **Literature Tests**: Loading states, error handling, data integrity
- **Security Tests**: Demo mode verification, API protection, input validation

### Security Testing
- **Demo Mode Tests**: Verify auth is properly disabled
- **API Protection Tests**: Ensure routes check authentication
- **Input Validation Tests**: Test against malicious inputs
- **Navigation Tests**: Verify auth-based visibility
- **External Link Tests**: Check proper attributes

## Deployment

### Security Configuration

#### **Development (Demo Mode)**
- Local with SQLite
- Demo mode enabled by default
- No real authentication required
- Safe for public repositories

#### **Production (messai.io)**
- Vercel + PostgreSQL
- Full authentication enabled
- Environment variables in Vercel dashboard
- SSL/TLS required
- Regular security audits

### Pre-Deployment Checklist
- [ ] Remove all console.log with sensitive data
- [ ] Verify demo mode is default in .env.example
- [ ] Check no credentials in codebase
- [ ] Validate all API routes have proper protection
- [ ] Test demo mode functionality
- [ ] Verify external links work correctly

- **Docker**: Full stack available with docker-compose
- **CI/CD**: GitHub Actions configured

## Known Considerations

1. **3D Performance**: May need optimization for older devices
2. **Scientific Accuracy**: All predictions based on published research
3. **Browser Support**: WebGL required for 3D visualization
4. **Mobile Experience**: Responsive but optimized for desktop
5. **Literature Loading**: Large datasets may require pagination optimization
6. **API Rate Limits**: External APIs (CrossRef, PubMed) have rate limits
7. **Data Integrity**: Literature system must only contain verified research

## Future Enhancements

- Real-time sensor integration
- Collaborative experiments
- Machine learning model improvements
- Mobile native app
- Multi-language support

## Important Files to Review

- `app/page.tsx` - Main design catalog
- `components/MESS3DModel.tsx` - Core 3D visualization
- `lib/ai-predictions.ts` - Prediction logic
- `components/algal-fuel-cell/` - Specialized algae simulator
- `prisma/schema.prisma` - Database structure
- `app/literature/` - Literature browsing interface
- `app/api/papers/` - Paper API endpoints
- `scripts/literature/` - Enhancement pipeline
- `components/ErrorBoundary.tsx` - Error handling wrapper
- `scripts/literature/README.md` - Literature system documentation

### Security-Critical Files
- `lib/demo-mode.ts` - Demo mode configuration
- `middleware.ts` - Route protection logic
- `components/ClientLayout.tsx` - Navigation visibility
- `components/UserMenu.tsx` - Authentication UI
- `.env.example` - Safe environment template
- `app/api/*` - All API routes need protection

## Research References

The platform is based on peer-reviewed research:
- Logan, B.E. (2008). Microbial Fuel Cells (comprehensive MFC reference)
- Rozendal, R.A. et al. (2008). Hydrogen Production with MECs
- Wang, H. & Ren, Z.J. (2013). Bioelectrochemical Metal Recovery
- Anasori, B. et al. (2017). 2D Metal Carbides (MXenes)
- Rabaey, K. & Rozendal, R.A. (2010). Microbial Electrosynthesis

## Contact

For scientific questions or collaborations, the platform targets:
- University research labs
- Environmental engineering departments
- Wastewater treatment facilities
- Sustainable architecture firms

## 🤖 AI Assistant Security Guidelines

When working on MESSAi, always:

1. **Assume Demo Mode First**: Default to demo-safe implementations
2. **Protect Credentials**: Never generate real API keys or passwords
3. **Check Before Committing**: Verify no sensitive data in changes
4. **Use Safe Examples**: Demo data should be clearly fictional
5. **Validate Everything**: Input validation is mandatory
6. **Document Security**: Note security implications in comments
7. **Test Both Modes**: Ensure features work in demo and production

### Red Flags to Avoid
- Hardcoded credentials or API keys
- Real email addresses in demo data
- Bypassing authentication checks
- Direct database queries without Prisma
- Missing input validation
- Unprotected API routes
- Local storage of sensitive data

    - MESS Parameters JSON Schema Compliance
      - How to use the 500+ parameters from mess-parameters-json.json
      - Parameter categories (18 major categories, 80 subcategories)
      - Electrode configuration standards (separate anode/cathode parameters)
      - Type safety and validation requirements

    2. Conflict Prevention Between System Types

    - MESS vs Fuel Cell Parameter Mapping
      - How MFCConfig relates to fuel cell parameters
      - Avoiding parameter collisions between systems
      - Proper parameter inheritance and overrides
      - Interface type definitions for different system types

    3. Fuel Cell Systems Standards

    - White Paper Compliance Requirements
      - 700 bar hydrogen storage systems
      - Multi-fidelity modeling approach (high/medium/low)
      - Control system integration (thermal, pressure, humidity, flow)
      - Gas composition management (N2, O2, H2, H2O)
      - Performance metrics and safety thresholds

    4. Implementation Guidelines

    - Parameter Validation Rules
      - Type checking for electrode configurations
      - Range validation for operating conditions
      - Cross-system parameter compatibility checks
      - Error handling for invalid combinations

    5. Code Examples and Best Practices

    - Interface definitions for parameter structures
    - How to extend existing configs without conflicts
    - Validation functions for parameter checking
    - Migration strategies for adding new parameters

    Key Points to Address

    1. Parameter Consistency: Ensure MESS and fuel cell parameters use consistent naming and units
    2. Type Safety: Leverage TypeScript interfaces to prevent configuration errors  
    3. Validation: Add runtime checks for parameter ranges and compatibility
    4. Documentation: Clear examples of proper parameter usage
    5. Conflict Resolution: Guidelines for handling overlapping parameter spaces
    6. Future-Proofing: How to add new system types without breaking existing ones

    Integration with Existing CLAUDE.md

    - Will be added as a new major section after "AI Prediction Model"
    - Cross-references existing sections on system configuration
    - Builds on the requirements directory structure mentioned
    - Aligns with scientific accuracy and testing approach guidelines

Remember: MESSAI is open source but we have the secure separation for our marketing site and freemium software platform. 

---

*This file helps AI assistants understand the project context, make appropriate decisions, and maintain consistency with the scientific and technical requirements of MESSAi.*