# Three.js Best Practices for MESSAi

This document outlines best practices for working with Three.js in the MESSAi bioreactor visualization system.

## 1. TypeScript Configuration

Ensure your `tsconfig.json` targets ES2015 or later for proper Three.js compatibility:

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["dom", "dom.iterable", "ES2015", "ES2017", "ES2018"]
  }
}
```

## 2. React Three Fiber Points Usage

When using `<points>` elements in React Three Fiber, add type assertions to avoid namespace errors:

```tsx
// ❌ May cause "P is not part of the THREE namespace" error
<points ref={pointsRef}>

// ✅ Correct usage
<points ref={pointsRef as any}>
```

## 3. Version Alignment

Keep Three.js related packages aligned to prevent conflicts:

```json
{
  "dependencies": {
    "three": "^0.169.0",
    "@types/three": "^0.169.0",
    "@react-three/fiber": "^8.17.10",
    "@react-three/drei": "^9.114.0"
  }
}
```

## 4. Next.js Configuration

Configure Next.js for Three.js compatibility:

```javascript
// next.config.js
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, { canvas: 'canvas' }]
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    return config
  },
}
```

## 5. Performance Optimization

### Particle Systems
- Limit particle count based on device capabilities
- Use instanced rendering for repeated geometries
- Implement LOD (Level of Detail) for complex scenes

### Memory Management
- Dispose of geometries and materials when unmounting
- Use texture atlases to reduce draw calls
- Implement object pooling for frequently created/destroyed objects

### Animation Best Practices
- Use `useFrame` hook efficiently - avoid heavy calculations
- Batch geometry updates
- Use worker threads for complex physics calculations

## 6. Material Optimization

```tsx
// Reuse materials when possible
const sharedMaterial = useMemo(() => 
  new THREE.MeshStandardMaterial({ color: 0x00ff00 }), 
  []
)

// Dispose materials on cleanup
useEffect(() => {
  return () => {
    sharedMaterial.dispose()
  }
}, [sharedMaterial])
```

## 7. Suspense and Loading

Always wrap 3D components in Suspense:

```tsx
<Canvas>
  <Suspense fallback={<Loader />}>
    <BioreactorModel />
  </Suspense>
</Canvas>
```

## 8. Type Safety

Create helper functions for type checking Three.js materials:

```tsx
export function isMeshStandardMaterial(material: THREE.Material): material is THREE.MeshStandardMaterial {
  return material.type === 'MeshStandardMaterial'
}
```

## 9. Error Handling

Implement error boundaries for 3D components:

```tsx
<ErrorBoundary fallback={<div>3D visualization failed to load</div>}>
  <Canvas>
    {/* 3D content */}
  </Canvas>
</ErrorBoundary>
```

## 10. Testing 3D Components

Create isolated test pages for 3D components:

```tsx
// app/test-3d/page.tsx
export default function Test3DPage() {
  return (
    <div className="grid grid-cols-3">
      <TestCanvas component={<Component1 />} />
      <TestCanvas component={<Component2 />} />
      <TestCanvas component={<Component3 />} />
    </div>
  )
}
```

## Common Issues and Solutions

### Issue: "R3F: X is not part of the THREE namespace"
**Solution**: This often occurs with Points or other Three.js objects. Add type assertions or ensure proper imports.

### Issue: Version conflicts between Three.js packages
**Solution**: Align all Three.js related package versions and run `npm dedupe`.

### Issue: Poor performance on mobile devices
**Solution**: Implement adaptive quality settings based on device capabilities and use performance monitoring.

### Issue: Memory leaks in long-running applications
**Solution**: Properly dispose of Three.js resources and implement cleanup in useEffect hooks.

## Performance Monitoring

Use the custom performance monitor for tracking:

```tsx
import { usePerformanceMonitor, PerformanceDisplay } from '@/lib/performance-monitor'

function Scene() {
  const { metrics, isPerformanceDegraded } = usePerformanceMonitor()
  
  if (isPerformanceDegraded(30)) {
    // Reduce quality settings
  }
  
  return (
    <>
      <PerformanceDisplay metrics={metrics} />
      {/* Scene content */}
    </>
  )
}
```