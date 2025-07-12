# Detail Questions

## Q1: Should we implement the detailed 3D models for all 5 MESS types in components/3d/vanilla-design-models.tsx following the existing pattern?
**Default if unknown:** Yes (maintains consistency with current 3D visualization architecture and algal fuel cell pattern)

## Q2: Should each MESS model have its own specialized parameter panel component similar to components/algal-fuel-cell/ParameterControls.tsx?
**Default if unknown:** Yes (allows for design-specific parameters like HRT for wastewater, sediment depth for benthic, etc.)

## Q3: Should we update the AI prediction multipliers in lib/ai-predictions.ts to include more sophisticated calculations for each model type?
**Default if unknown:** Yes (current multipliers are basic; need substrate-specific, scale-dependent, and environmental factors)

## Q4: Should we create dedicated experiment workflow pages for each MESS type under app/experiment/[type]/[id]/page.tsx?
**Default if unknown:** No (extend existing experiment page with conditional rendering based on design type to maintain codebase simplicity)

## Q5: Should the enhanced models include real-time animation features (flow visualization, biofilm growth, gas bubbles)?
**Default if unknown:** Yes (helps users understand system dynamics and troubleshoot performance issues)