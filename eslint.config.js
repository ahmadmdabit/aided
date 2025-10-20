// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Start with the recommended configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Global configuration for all files
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // This is the key rule to prevent phantom dependencies.
      // It will error if you import a package that is not in your package.json
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
  },

  // NEW: Add this override block for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      // Allow importing devDependencies in test files
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          // THIS IS THE FIX: Tell the rule to also check the monorepo root for dependencies.
          packageDir: ['.', './packages/core', './playground'],
        },
      ],
    },
  },

  // Configuration to ignore specific files/directories
  {
    ignores: [
      'dist/',
      'packages/core/dist/',
      'node_modules/',
      '.yarn/',
      '**/*.config.js', // Ignore config files themselves
      '**/*.config.ts',
    ],
  }
);
