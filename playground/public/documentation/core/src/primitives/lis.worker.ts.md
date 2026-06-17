# lis.worker.ts

**Purpose**: Web Worker for off-thread LIS computation with type-safe error handling.

## Types
```typescript
type WorkerResponse = number[] | { error: string }
```

## Behavior
- Receives TypedArray via postMessage
- Computes LIS using longestIncreasingSubsequence
- Posts result back to main thread with type-safe response
- Posts error object on failure

## Message Format
**Input**: TypedArray (Int32Array | Uint32Array | Float32Array | Float64Array)
**Output**: WorkerResponse (number[] | { error: string })

## Implementation Notes
- Runs in worker context (self)
- Catches and reports errors gracefully with typed response
- Used by longestIncreasingSubsequenceAsync
- WorkerResponse type ensures consistent error format
- Type-safe postMessage calls prevent runtime errors
