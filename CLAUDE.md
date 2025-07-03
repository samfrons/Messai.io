# CLAUDE.md - AI Assistant Context for MESSAi

This file provides context and instructions for AI assistants (like Claude) working on the MESSAi project.

## Project Overview

MESSAi (Microbial Electrochemical Systems AI Platform) is a sophisticated web platform for microbial fuel cell (MFC) research. It combines:
- Interactive 3D visualization using Three.js
- AI-powered predictions for power output optimization
- Comprehensive experiment tracking
- Scientific material database with 27 electrode options
- LCARS (Star Trek-inspired) UI theme

## Key Technical Details

### Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom LCARS theme
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
- Maintain LCARS design consistency
- Write tests for new features
- Document scientific assumptions

### Important Commands
```bash
npm run dev          # Start dev server on port 3003
npm test            # Run tests
npm run lint        # Check code quality
npm run format      # Format code with Prettier
npm run db:studio   # Open Prisma Studio
```

## Scientific Context

### MFC Designs (13 types)
- **Laboratory**: Mason jar, earthen pot, micro-chip ($1-$50)
- **Pilot Scale**: 3D printed, benchtop bioreactor ($30-$1,800)
- **Industrial**: Wastewater treatment, architectural facade ($150-$5,000)

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

## Common Tasks

### Adding a New MFC Design
1. Update `app/page.tsx` with design details
2. Add 3D model in `components/DesignSpecific3DModels.tsx`
3. Update prediction multipliers in `lib/ai-predictions.ts`

### Adding Electrode Materials
1. Update `components/MFCConfigPanel.tsx`
2. Add material properties and descriptions
3. Update cost and efficiency ratings

### Modifying Predictions
1. Adjust factors in `lib/ai-predictions.ts`
2. Update API route in `app/api/predictions/route.ts`
3. Add tests for new prediction logic

## Testing Approach

- **Unit Tests**: Individual functions and components
- **Integration Tests**: User workflows
- **API Tests**: Endpoint validation
- **Performance Tests**: 3D rendering optimization
- **Accessibility Tests**: WCAG compliance

## Deployment

- **Development**: Local with SQLite
- **Production**: Vercel + PostgreSQL recommended
- **Docker**: Full stack available with docker-compose
- **CI/CD**: GitHub Actions configured

## Known Considerations

1. **3D Performance**: May need optimization for older devices
2. **Scientific Accuracy**: All predictions based on published research
3. **Browser Support**: WebGL required for 3D visualization
4. **Mobile Experience**: Responsive but optimized for desktop

## Future Enhancements

- Real-time sensor integration
- Collaborative experiments
- Machine learning model improvements
- Mobile native app
- Multi-language support

## Important Files to Review

- `app/page.tsx` - Main design catalog
- `components/MFC3DModel.tsx` - Core 3D visualization
- `lib/ai-predictions.ts` - Prediction logic
- `components/algal-fuel-cell/` - Specialized algae simulator
- `prisma/schema.prisma` - Database structure

## Research References

The platform is based on peer-reviewed research:
- Logan, B.E. (2008). Microbial Fuel Cells
- Wang, H. & Ren, Z.J. (2013). Bioelectrochemical Metal Recovery
- Anasori, B. et al. (2017). 2D Metal Carbides (MXenes)

## Contact

For scientific questions or collaborations, the platform targets:
- University research labs
- Environmental engineering departments
- Wastewater treatment facilities
- Sustainable architecture firms

---

*This file helps AI assistants understand the project context, make appropriate decisions, and maintain consistency with the scientific and technical requirements of MESSAi.*