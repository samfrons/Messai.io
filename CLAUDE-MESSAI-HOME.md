# CLAUDE-MESSAI-HOME.md - Marketing Website Context (messai-home branch)

This file provides specific context for the marketing website on the `messai-home` branch.

## Branch Purpose

The **`messai-home`** branch contains the revolutionary bio-inspired marketing website for MESSAi. This is separate from the main platform code and focuses on showcasing MESSAi's capabilities to potential users, researchers, and industry partners.

## Key Differences from Master Branch

- **Marketing-focused routes** under `/marketing`
- **Bio-inspired theme system** with easy customization
- **No changes to core platform** - research database and demo remain accessible
- **Professional public face** for the MESSAi platform

## Bio-Inspired Design Implementation

### Files Added/Modified on This Branch
- `app/marketing/layout.tsx` - Marketing layout with theme provider
- `app/marketing/page.tsx` - Revolutionary homepage
- `app/marketing/platform/page.tsx` - Platform overview
- `components/marketing/ThemeSelector.tsx` - Theme customization widget
- `lib/themes/refined-bio-theme.ts` - Bio-inspired theme system
- `hooks/useTheme.ts` - Theme management hook
- `tailwind.config.ts` - Extended with bio-inspired colors

### Design Philosophy
- **Sophisticated but fun** - Professional with organic touches
- **Inspired by microscopy** - Real algae and microorganism imagery
- **Easy to customize** - Switch themes with one click

## Marketing Content

### Homepage Messaging
- "Unlock the Magic of Microbial Systems"
- 3,721 research papers as flagship feature
- Three pillars: Discover, Design, Scale
- Industry applications showcase

### Target Audiences
- Researchers seeking comprehensive literature
- Engineers designing systems
- Industry partners looking to scale
- Investors understanding the opportunity

## Development on This Branch

### Running the Marketing Site
```bash
npm run dev
# Visit http://localhost:3003/marketing
```

### Testing Themes
1. Visit `/marketing`
2. Use floating theme selector (bottom-right)
3. Try different presets: refined, bold, minimal
4. Test industry themes: wastewater, energy

### Making Changes
- Marketing pages isolated under `/marketing`
- Theme changes in `lib/themes/refined-bio-theme.ts`
- Keep research database publicly accessible
- Don't modify core platform functionality

## Merging Guidelines

Before merging to master:
- [ ] All themes tested and working
- [ ] Mobile responsive verified
- [ ] Research database integration intact
- [ ] Performance acceptable
- [ ] No conflicts with platform code

## Important Notes

1. **This is a feature branch** - not yet in production
2. **Preserves existing functionality** - research and demo unchanged
3. **Bio-inspired but professional** - not childish
4. **Easy theme switching** - for quick style iterations
5. **Isolated from core platform** - safe to experiment

---

*This documentation is specific to the messai-home branch marketing website.*