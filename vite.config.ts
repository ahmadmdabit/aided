/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    watch: false,
    // NEW: Add worker configuration
    // worker: { // 'worker' does not exist in type 'InlineConfig'.
    //   format: 'es',
    // },
    // Enable coverage
    coverage: {
      // Specify the provider
      provider: 'v8',
      // Specify which files to include in the coverage report
      include: ['packages/core/src/**/*.ts'],
      // Specify which files to exclude
      exclude: [
        'packages/core/src/error.ts', // Often excluded if it's just class definitions
        'packages/core/src/index.ts', // No logic to test in the barrel file
        'packages/core/src/types.ts', // No logic to test in type definitions
        // Exclude test files from coverage report
        '**/*.test.ts',
        'packages/core/src/vite-env.d.ts',
        'packages/core/src/primitives/lis.worker.ts',
      ],
      // Set your desired coverage thresholds
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      // Generate a text report in the console
      reporter: ['text', 'json', 'json-summary', 'html'],
    },
  },
});
