/**
 * Comprehensive test runner configuration
 * Ensures all functionality is tested and prevents regressions
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        '.next/**',
        'coverage/**',
        '*.config.*',
        'prisma/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: [
      'tests/**/*.test.{ts,tsx}',
      'tests/**/*.spec.{ts,tsx}'
    ],
    exclude: [
      'node_modules/**',
      '.next/**',
      'coverage/**'
    ],
    // Run tests in specific order to catch regressions
    sequence: {
      hooks: 'stack'
    },
    // Parallel execution for faster testing
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2
      }
    },
    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
    // Reporter configuration
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
    },
  },
})

/**
 * Test Categories and Priorities
 * 
 * 1. CRITICAL - Core functionality that must not break
 *    - Experiment workflow (design selection → parameter form → experiment creation)
 *    - AI predictions accuracy
 *    - 3D model rendering
 *    - Data persistence (localStorage)
 * 
 * 2. HIGH - Important features that affect user experience
 *    - All design types functionality
 *    - Material configuration
 *    - Responsive design
 *    - Error handling
 * 
 * 3. MEDIUM - Nice-to-have features
 *    - Performance optimizations
 *    - Accessibility improvements
 *    - Animation quality
 * 
 * Test Execution Order:
 * 1. Unit tests (fastest, catch basic issues)
 * 2. Integration tests (catch workflow issues)
 * 3. Regression tests (prevent breaking changes)
 * 4. E2E tests (full user scenarios)
 * 5. Performance tests (optimization validation)
 * 6. Accessibility tests (compliance validation)
 */