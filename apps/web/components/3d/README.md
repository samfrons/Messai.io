# 3D Viewer Components

This directory contains multiple approaches to handle the React Three Fiber reconciler error in Next.js 15.

## Available Components

### 1. **Minimal3D** (`minimal-3d.tsx`)
- Tests basic Three.js loading
- No React Three Fiber dependencies
- Useful for debugging if Three.js itself loads correctly

### 2. **Standalone3D** (`standalone-3d.tsx`)
- Pure Three.js implementation without React Three Fiber
- Direct DOM manipulation
- Most reliable but less React-friendly

### 3. **Progressive3D** (`progressive-3d.tsx`)
- Loads Three.js and React Three Fiber in stages
- Helps identify where the error occurs
- Good for debugging the reconciler issue

### 4. **Worker3DViewer** (`worker-3d-viewer.tsx`)
- Runs Three.js in a Web Worker
- Completely isolated from React's reconciler
- Best performance but limited React integration

### 5. **Safe3DViewer** (`safe-3d-viewer.tsx`)
- Production-ready component with error boundaries
- Dynamic imports with SSR disabled
- Graceful error handling and retry mechanism

## Usage

```tsx
// For testing - visit /test-3d
import { Safe3DViewer } from '@/src/components/3d/safe-3d-viewer';

function MyComponent() {
  return (
    <div className="h-96">
      <Safe3DViewer />
    </div>
  );
}
```

## Troubleshooting

If you're still experiencing the reconciler error:

1. **Clear all caches**:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   ```

2. **Check for conflicting React versions**:
   ```bash
   npm ls react react-dom
   ```

3. **Use the Standalone3D or Worker3DViewer** as alternatives that bypass React Three Fiber entirely

4. **Downgrade React Three Fiber** if necessary:
   ```bash
   npm install @react-three/fiber@8.15.0 @react-three/drei@9.88.0
   ```

## Architecture Notes

The reconciler error typically occurs due to:
- Next.js 15's stricter module resolution
- Conflicts between server and client rendering
- React Three Fiber's custom reconciler not being compatible with certain Next.js optimizations

The components in this directory provide different workarounds, from complete isolation (Worker) to progressive loading strategies.