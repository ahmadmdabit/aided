import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'url';

/**
 * Vite configuration for building the Aided core library.
 *
 * This configuration sets up:
 * - Library build mode with ES and UMD outputs
 * - TypeScript declaration file generation
 * - Environment variable injection for development mode detection
 * - Proper entry point resolution for the core package
 */
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    lib: {
      // Use import.meta.url to get the current file's path
      entry: resolve(fileURLToPath(new URL('./src/index.ts', import.meta.url))),
      name: 'AidedCore', // The UMD global name
      fileName: (format) => `aided-core.${format}.js`,
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
    }),
  ],
});
