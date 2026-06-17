# lis.ts

**Purpose**: Longest Increasing Subsequence (LIS) algorithm implementation for efficient list reconciliation, with adaptive algorithm selection based on array size.

## API

### longestIncreasingSubsequence

```typescript
longestIncreasingSubsequence<T extends number>(
  seq: ArrayLike<T>,
  workBuffer?: Uint32Array
): number[]
```

### configureLIS

```typescript
configureLIS(options: { smallArrayThreshold: number }): void
```

## Usage

```typescript
import { longestIncreasingSubsequence, configureLIS } from "aided-core";

// Basic usage
const seq = [0, 2, 1, 3, 5, 4];
const lisIndices = longestIncreasingSubsequence(seq);
console.log(lisIndices); // [0, 1, 3, 4] or [0, 2, 3, 4] (both valid)

// With sentinel values (-1 means skip)
const seqWithSentinel = [0, -1, 2, 3, -1, 4];
const lis = longestIncreasingSubsequence(seqWithSentinel);
console.log(lis); // [0, 2, 3, 5] (indices of non-sentinel values forming LIS)

// Zero-allocation path with work buffer
const workBuffer = new Uint32Array(20); // For sequences up to 10 items
const lis2 = longestIncreasingSubsequence(seq, workBuffer);

// Configure threshold
configureLIS({ smallArrayThreshold: 128 }); // Use simple algorithm for <128 items
```

## Key Concepts

- **Adaptive Algorithm Selection**: Small arrays (<64) use simple version, large use optimized
- **Sentinel Handling**: Value -1 treated as "skip this element" for new items
- **Zero-Allocation Path**: Optional workBuffer parameter for hot code paths
- **Binary Search**: Efficient O(log n) insertion position search
- **Predecessor Tracking**: Reconstructs LIS indices from tracking data

## Implementation Notes

### Algorithm Selection

```typescript
const config: LISConfig = {
  smallArrayThreshold: 64,
};

export function longestIncreasingSubsequence<T extends number>(
  seq: ArrayLike<T>,
  workBuffer?: Uint32Array,
): number[] {
  // ... validation ...

  if (n < config.smallArrayThreshold) {
    return lis_small(seq);
  } else {
    return lis_large(seq, workBuffer);
  }
}
```

**Why two implementations**:

- **Small arrays**: Simple JavaScript arrays, lower overhead
- **Large arrays**: TypedArray, better cache locality, memory efficiency

### Sentinel Values

```typescript
if (num === -1) {
  predecessors[i] = SENTINEL; // Mark as skipped
  continue;
}
```

**Purpose**: In list reconciliation, -1 represents "new items" that should be ignored by LIS:

- New items don't have stable positions yet
- They will be inserted, not moved
- Only existing items are candidates for stable positions

**Example**:

```typescript
// Old order: [A, B, C, D]  (indices 0, 1, 2, 3)
// New order: [A, X, C, D, B]  (X is new)
// seq = [0, -1, 2, 3, 1]  (indices of old items in new order, -1 for new)
// LIS = [0, 2, 3]  (A, C, D are stable, keep in place)
// Result: Insert X at index 1, move B to end
```

### Small Array Implementation (lis_small)

```typescript
function lis_small<T extends number>(seq: ArrayLike<T>): number[] {
  const n = seq.length;
  const predecessors: number[] = new Array(n);
  const tails: number[] = new Array(n);
  let len = 0;

  for (let i = 0; i < n; i++) {
    const num = seq[i];

    // Skip sentinel values
    if (num === -1) {
      predecessors[i] = -1;
      continue;
    }

    // Binary search for insertion position
    let lo = 0;
    let hi = len;

    while (lo < hi) {
      const mid = (lo + hi) >>> 1; // Bitwise shift is faster than Math.floor
      if (seq[tails[mid]] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    // Branchless predecessor assignment
    predecessors[i] = tails[lo - 1] ?? -1;
    if (lo === 0) predecessors[i] = -1; // Explicit for clarity

    tails[lo] = i;

    if (lo === len) {
      len++;
    }
  }

  // Reconstruct LIS from tails
  const lis: number[] = new Array(len);
  let k = tails[len - 1];

  for (let i = len - 1; i >= 0; i--) {
    lis[i] = k;
    k = predecessors[k];
  }

  return lis;
}
```

**Optimizations**:

- **Bitwise shift**: `(lo + hi) >>> 1` faster than `Math.floor((lo + hi) / 2)`
- **Branchless predecessor**: `tails[lo - 1] ?? -1` handles lo=0 case
- **Simple arrays**: JavaScript arrays have low overhead for small n

### Large Array Implementation (lis_large)

```typescript
function lis_large<T extends number>(
  seq: ArrayLike<T>,
  workBuffer?: Uint32Array,
): number[] {
  const n = seq.length;

  const needsSize = 2 * n;
  const useWorkBuffer = workBuffer && workBuffer.length >= needsSize;

  const buffer = useWorkBuffer ? workBuffer! : new Uint32Array(needsSize);

  // Split buffer into two views (zero-copy partitioning)
  const predecessors = buffer.subarray(0, n);
  const tails = buffer.subarray(n, 2 * n); // More explicit

  // ... same algorithm as small version, but using TypedArrays ...
}
```

**Optimizations**:

- **TypedArray**: Better cache locality for large n
- **Buffer reuse**: workBuffer parameter avoids allocation in hot paths
- **Subarray views**: Zero-copy partitioning of single buffer
- ** SENTINEL constant**: `0xFFFFFFFF` for typed array comparisons

**Zero-allocation path**:

```typescript
// Caller reuses buffer across calls
const workBuffer = new Uint32Array(2000); // For 1000 item arrays

for (const update of listUpdates) {
  const lis = longestIncreasingSubsequence(update.seq, workBuffer);
  // ... process LIS ...
  // No allocation! Buffer reused
}
```

### Binary Search

```typescript
let lo = 0;
let hi = len;

while (lo < hi) {
  const mid = (lo + hi) >>> 1;
  if (seq[tails[mid]] < num) {
    lo = mid + 1;
  } else {
    hi = mid;
  }
}
```

**Purpose**: Find leftmost position where `seq[tails[pos]] >= num`

**Why binary search**:

- Linear search: O(n) per element → O(n²) total
- Binary search: O(log n) per element → O(n log n) total

**Tails array invariant**:

- `tails[pos]` = index of smallest ending value of all increasing subsequences of length pos+1
- `seq[tails[0]] < seq[tails[1]] < ...` (strictly increasing)

### Predecessor Tracking

```typescript
predecessors[i] = tails[lo - 1] ?? -1;
if (lo === 0) predecessors[i] = -1;
```

**Purpose**: Track which element precedes current in LIS

**Reconstruction**:

```typescript
// Start from last element of LIS
let k = tails[len - 1];

// Walk backwards using predecessors
for (let i = len - 1; i >= 0; i--) {
  lis[i] = k;
  k = predecessors[k]; // Move to predecessor
}
```

**Example**:

```
seq = [0, 2, 1, 3, 5, 4]
tails after each step: [0], [0,1], [0,2], [0,2,3], [0,2,3,4], [0,2,3,5]
predecessors: [-1, 0, 0, 1, 3, 3]
LIS reconstruction: 5 → 4 → 3 → 2 → 0 (but in reverse order)
Result: [0, 2, 3, 5]
```

### Validation

```typescript
if (!seq || typeof seq.length !== "number" || !Number.isFinite(seq.length)) {
  return [];
}

const n = seq.length;
if (n === 0) {
  return [];
}
```

**Defensive checks**:

- Non-array-like input returns empty
- Non-finite length (NaN, Infinity) returns empty
- Empty array returns empty
- No throws, always returns valid result

## Security

No security concerns. This is a mathematical algorithm with no security implications.

## Performance Considerations

### Time Complexity

- **Small arrays**: O(n log n) with simple arrays
- **Large arrays**: O(n log n) with TypedArrays
- **Binary search**: O(log n) per element
- **Reconstruction**: O(n)

### Space Complexity

- **Small arrays**: O(n) for predecessors + tails arrays
- **Large arrays**: O(n) with TypedArrays
- **With workBuffer**: O(1) additional allocation (buffer provided by caller)

### When to Use workBuffer

- **Hot paths**: Code called frequently (scroll, render loops)
- **Large arrays**: 100+ items where allocation overhead matters
- **Repetitive calls**: Same algorithm called many times

### Benchmark Guidelines

- **< 64 items**: Simple array path, allocation negligible
- **64-1000 items**: TypedArray path, consider workBuffer for hot code
- **> 1000 items**: TypedArray path with workBuffer recommended

## Edge Cases

- **Empty sequence**: Returns empty array
- **Single element**: Returns [0] (or [] if sentinel)
- **All same values**: Returns [0] (first element only)
- **Strictly decreasing**: Returns [0] (only first element)
- **Strictly increasing**: Returns [0, 1, 2, ..., n-1] (entire sequence)
- **All sentinels**: Returns empty array
- **workBuffer too small**: Throws if used but not large enough (caller's responsibility)

## Test Coverage

- **100% coverage** expected for algorithm logic
- Test cases: empty, single, increasing, decreasing, mixed, sentinels, large arrays, workBuffer reuse
