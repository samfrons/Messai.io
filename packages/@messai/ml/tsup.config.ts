import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'mlops/index': 'src/mlops/index.ts',
    'research/index': 'src/research/index.ts',
    'maintenance/index': 'src/maintenance/index.ts',
    'discovery/index': 'src/discovery/index.ts',
    'analytics/index': 'src/analytics/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@tensorflow/tfjs', '@tensorflow/tfjs-node', 'openai'],
  noExternal: ['lodash', 'date-fns', 'uuid']
})