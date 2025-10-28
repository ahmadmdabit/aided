/// <reference types="vite/client" />

/**
 * Type declarations for Vite-specific features used in the Aided build system.
 *
 * This file provides TypeScript support for:
 * - Vite's client-side APIs and environment variables
 * - Web Worker imports with the ?worker suffix
 * - Custom module declarations for build-time transformations
 */

/**
 * Module declaration for Web Worker imports using Vite's ?worker suffix.
 *
 * This allows importing Web Worker scripts as constructor functions that
 * create new Worker instances. Used for offloading heavy computations
 * like LIS calculations to background threads.
 *
 * @example
 * ```typescript
 * import LISWorker from './lis.worker.ts?worker';
 * const worker = new LISWorker();
 * ```
 */
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
