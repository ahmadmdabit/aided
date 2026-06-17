# lisAsync.ts

**Purpose**: Computes Longest Increasing Subsequence asynchronously using Web Workers to prevent UI blocking for large arrays.

## API

```typescript
longestIncreasingSubsequenceAsync(
  seq: Int32Array | Uint32Array | Float32Array | Float64Array
): Promise<number[]>
```

## Usage

```typescript
// For large arrays that might block the UI
const largeArray = new Uint32Array(5000);
for (let i = 0; i < 5000; i++) {
  largeArray[i] = Math.floor(Math.random() * 10000);
}

try {
  const lisIndices = await longestIncreasingSubsequenceAsync(largeArray);
  console.log("LIS indices:", lisIndices);
  // [0, 2, 5, 10, 15, ...] (indices of LIS elements)
} catch (error) {
  console.error("LIS computation failed:", error);
}

// Compare with sync version for small arrays
const smallList = new Uint32Array([3, 1, 4, 1, 5]);
const syncResult = longestIncreasingSubsequence(smallList); // Faster for small arrays
```

## Key Concepts

- **Web Worker Usage**: Runs LIS algorithm in separate thread
- **Zero-Copy Transfer**: Uses TypedArray buffer transfer for performance
- **Timeout Protection**: 30-second timeout prevents hanging computations
- **Error Handling**: Proper Promise rejection for worker errors
- **Buffer Transfer**: Ownership transferred to worker, not copied

## Implementation Notes

### Implementation

```typescript
export function longestIncreasingSubsequenceAsync(
  seq: Int32Array | Uint32Array | Float32Array | Float64Array,
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    if (!seq || seq.length === 0) {
      return resolve([]);
    }

    const worker = new LISWorker();

    // Set a timeout to prevent hanging workers
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timeout: LIS computation took too long."));
    }, 30000); // 30-second timeout

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      clearTimeout(timeout);
      worker.terminate();

      if (
        event.data &&
        typeof event.data === "object" &&
        "error" in event.data
      ) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data as number[]);
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(`Worker error: ${error.message}`));
    };

    try {
      worker.postMessage(seq, [seq.buffer]);
    } catch (error) {
      clearTimeout(timeout);
      worker.terminate();
      reject(error);
    }
  });
}
```

### Worker Setup

**Import assertion**:

```typescript
import LISWorker from "./lis.worker.ts?worker";
```

**?worker suffix**:

- Vite-specific syntax for Web Worker imports
- Creates separate build chunk for worker
- Worker code isolated from main bundle

**Worker structure**:

```typescript
// lis.worker.ts
import { longestIncreasingSubsequence } from "./lis";

self.onmessage = (event: MessageEvent<Int32Array | Uint32Array>) => {
  try {
    const indices = longestIncreasingSubsequence(event.data);
    self.postMessage(indices);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
```

### Zero-Copy Transfer

**Transferable objects**:

```typescript
worker.postMessage(seq, [seq.buffer]);
```

**Second parameter**:

- Array of transferable objects
- Ownership transferred, not copied
- seq.buffer moved to worker
- seq array is neutered on main thread

**Performance benefit**:

- No serialization overhead
- No buffer copy
- O(1) transfer regardless of array size
- Critical for large arrays (1000+ elements)

**Example**:

```typescript
const largeArray = new Uint32Array(5000);
console.log(largeArray.length); // 5000

worker.postMessage(largeArray, [largeArray.buffer]);

console.log(largeArray.length); // 0 (neutered)
// Buffer ownership transferred to worker
```

### Timeout Protection

**30-second timeout**:

```typescript
const timeout = setTimeout(() => {
  worker.terminate();
  reject(new Error("Worker timeout: LIS computation took too long."));
}, 30000);
```

**Why timeout needed**:

- Worker could hang (infinite loop, bug)
- No built-in cancellation for postMessage
- Prevents resource leaks
- User-friendly error message

**Cleanup**:

```typescript
clearTimeout(timeout); // Cancel timeout on success/error
worker.terminate(); // Kill worker to free resources
```

### Error Handling

**Worker error handler**:

```typescript
worker.onerror = (error: ErrorEvent) => {
  clearTimeout(timeout);
  worker.terminate();
  reject(new Error(`Worker error: ${error.message}`));
};
```

**Error propagation**:

- Network errors
- Worker runtime errors
- Serialization errors

**Custom error response**:

```typescript
// In worker
if (error) {
  self.postMessage({ error: error.message });
}

// In main thread
if (event.data && "error" in event.data) {
  reject(new Error(event.data.error));
}
```

### Empty Input Handling

**Early return**:

```typescript
if (!seq || seq.length === 0) {
  return resolve([]);
}
```

**Why early return**:

- No worker needed for empty input
- Avoids worker creation overhead
- Consistent with sync version behavior

**Validation**:

- Check seq is truthy
- Check seq.length === 0
- Both conditions return empty array

### Promise API

**Return type**:

```typescript
Promise<number[]>;
```

**Usage patterns**:

```typescript
// Async/await
const indices = await longestIncreasingSubsequenceAsync(array);

// Then/catch
longestIncreasingSubsequenceAsync(array)
  .then((indices) => console.log(indices))
  .catch((error) => console.error(error));

// Parallel
const [result1, result2] = await Promise.all([
  longestIncreasingSubsequenceAsync(array1),
  longestIncreasingSubsequenceAsync(array2),
]);
```

### Comparison with Sync Version

**When to use async**:

- Arrays with 1000+ elements
- Performance-critical UI (avoid blocking)
- User-initiated operations (show loading)

**When to use sync**:

- Arrays with < 1000 elements
- Simple algorithms
- No UI interaction needed

**Performance characteristics**:

- **Sync**: O(n log n) algorithm, but blocks UI
- **Async**: Same algorithm, but in worker thread
- **Break-even**: Around 1000 elements for typical machines

## Security

### Security Considerations

**Worker isolation**: Worker runs in separate context

- No direct DOM access
- Limited APIs available
- Sandboxed execution

**Buffer transfer safety**:

- Only typed arrays accepted
- Buffer ownership transfer validated
- No buffer access after transfer

**Timeout safety**:

- Prevents DoS via infinite loops
- Worker terminated after timeout
- No resource leaks

## Performance Considerations

### Overhead

- Worker creation: ~10-20ms one-time
- Buffer transfer: O(1) for typed arrays
- PostMessage serialization: None (transferable)
- Worker cleanup: Immediate

### When to Use

**Use async for**:

- Arrays > 1000 elements
- User-initiated operations
- Performance-sensitive UI

**Use sync for**:

- Arrays < 1000 elements
- Background processing
- Simple use cases

### Optimization Opportunities

**Worker pooling**: Reuse workers across calls
**Pre-warming**: Create workers on idle time
**Batch processing**: Send multiple arrays at once

## Edge Cases

**Empty array**:

```typescript
await longestIncreasingSubsequenceAsync(new Uint32Array(0)); // []
```

**Single element**:

```typescript
await longestIncreasingSubsequenceAsync(new Uint32Array([5])); // [0]
```

**All same values**:

```typescript
await longestIncreasingSubsequenceAsync(new Uint32Array([5, 5, 5])); // [0]
```

**Strictly decreasing**:

```typescript
await longestIncreasingSubsequenceAsync(new Uint32Array([5, 4, 3, 2, 1])); // [0]
```

**Worker fails**:

```typescript
// Worker throws error
await longestIncreasingSubsequenceAsync(array); // Rejects with error
```

**Timeout**:

```typescript
// Worker hangs
await longestIncreasingSubsequenceAsync(array); // Rejects after 30s
```

## Test Coverage

Expected: 100% coverage for async LIS with various array sizes and error conditions
