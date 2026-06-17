# vite-env.d.ts

## Purpose
TypeScript type declarations for Vite-specific features used in the Aided build system.

## Declarations

### `/// <reference types="vite/client" />`
Includes Vite's client-side type definitions for environment variables and APIs.

### `declare module '*?worker'`
Enables importing Web Worker scripts with Vite's `?worker` suffix.

**Provides:**
- Constructor type for creating Worker instances
- Type safety for worker imports

## Usage Example
```typescript
// Import a worker file
import LISWorker from './lis.worker.ts?worker';

// Create worker instance
const worker = new LISWorker();

// Use worker
worker.postMessage({ data: [1, 2, 3] });
worker.onmessage = (e) => console.log(e.data);
```

## Key Concepts
- Vite-specific module declarations for build-time features
- Enables type-safe Web Worker imports
- Used for offloading heavy computations (like LIS) to background threads

## Implementation Notes
- Only needed for TypeScript type checking
- Does not affect runtime behavior
- Vite handles actual worker bundling and loading
