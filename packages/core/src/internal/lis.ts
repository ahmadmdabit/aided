/**
 * A configuration object for the LIS factory.
 */
export interface LISConfig {
  /**
   * The threshold below which a simpler, lower-overhead algorithm is used.
   * @default 64
   */
  smallArrayThreshold: number;
}

const config: LISConfig = {
  smallArrayThreshold: 64,
};

/**
 * Configures the LIS factory's internal thresholds.
 * @param newConfig A partial configuration object.
 */
export function configureLIS(newConfig: Partial<LISConfig>): void {
  Object.assign(config, newConfig);
}

/**
 * Finds the indices of the Longest Increasing Subsequence (LIS) in a sequence of numbers.
 *
 * This function is a high-level dispatcher that intelligently selects the most optimal
 * implementation based on the input array's size.
 *
 * - For small arrays (`< 64` elements), it uses a simple, low-overhead version.
 * - For medium to large arrays, it uses a highly-optimized version with TypedArrays.
 *
 * @param seq The sequence of numbers. Can be any array-like structure.
 *            Elements with value -1 are treated as "new items" and skipped.
 * @param workBuffer Optional reusable buffer to enable a zero-allocation path for hot code.
 *        The buffer should have a length of at least `2 * seq.length`.
 * @returns An array of indices representing one of the longest increasing subsequences.
 */
export function longestIncreasingSubsequence<T extends number>(
  seq: ArrayLike<T>,
  workBuffer?: Uint32Array
): number[] {
  // --- 1. Runtime Input Validation ---
  if (!seq || typeof seq.length !== 'number' || !Number.isFinite(seq.length)) {
    return [];
  }

  const n = seq.length;
  if (n === 0) {
    return [];
  }

  // --- 2. Adaptive Sizing Logic ---
  if (n < config.smallArrayThreshold) {
    return lis_small(seq);
  } else {
    return lis_large(seq, workBuffer);
  }
}

/**
 * Optimized LIS for small arrays using regular JavaScript arrays.
 * Lower overhead for small inputs.
 * 
 * OPTIMIZATION: Reduced branches, better locality
 */
function lis_small<T extends number>(seq: ArrayLike<T>): number[] {
  const n = seq.length;
  if (n === 0) return [];
  if (n === 1) return seq[0] === -1 ? [] : [0];

  const predecessors: number[] = new Array(n);
  const tails: number[] = new Array(n);
  let len = 0;

  for (let i = 0; i < n; i++) {
    const num = seq[i];
    
    // Skip sentinel values (-1 represents "new items" to be ignored)
    if (num === -1) {
      predecessors[i] = -1; // Mark as skipped
      continue;
    }

    // Binary search for the leftmost position where seq[tails[pos]] >= num
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

    // OPTIMIZATION: Eliminate branch with branchless computation
    // predecessors[i] = lo > 0 ? tails[lo - 1] : -1;
    // Rewritten as:
    predecessors[i] = tails[lo - 1] ?? -1; // Handles lo=0 case naturally
    if (lo === 0) predecessors[i] = -1; // Explicit for clarity and coverage
    
    tails[lo] = i;

    if (lo === len) {
      len++;
    }
  }

  // No valid subsequence found
  if (len === 0) return [];

  // Reconstruct the LIS from the predecessors
  const lis: number[] = new Array(len);
  let k = tails[len - 1];
  
  for (let i = len - 1; i >= 0; i--) {
    lis[i] = k;
    k = predecessors[k];
  }

  return lis;
}

/**
 * Optimized LIS for large arrays using TypedArrays for better cache locality
 * and memory efficiency.
 * 
 * OPTIMIZATIONS:
 * - Uses TypedArrays for cache-friendly memory layout
 * - Supports buffer reuse to eliminate allocations in hot paths
 * - Optimized reconstruction with sentinel handling
 */
function lis_large<T extends number>(
  seq: ArrayLike<T>,
  workBuffer?: Uint32Array
): number[] {
  const n = seq.length;
  if (n === 0) return [];
  if (n === 1) return seq[0] === -1 ? [] : [0];

  // Use workBuffer if provided and large enough, otherwise allocate
  const needsSize = 2 * n;
  const useWorkBuffer = workBuffer && workBuffer.length >= needsSize;
  
  const buffer = useWorkBuffer ? workBuffer! : new Uint32Array(needsSize);
  
  // Split buffer into two views (zero-copy partitioning)
  const predecessors = buffer.subarray(0, n);
  const tails = buffer.subarray(n, 2 * n); // More explicit
  
  let len = 0;
  const SENTINEL = 0xFFFFFFFF; // Named constant for clarity

  for (let i = 0; i < n; i++) {
    const num = seq[i];
    
    // Skip sentinel values
    if (num === -1) {
      predecessors[i] = SENTINEL;
      continue;
    }

    // Binary search - optimized for TypedArray access patterns
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

    // OPTIMIZATION: Explicit handling for coverage and clarity
    if (lo > 0) {
      predecessors[i] = tails[lo - 1];
    } else {
      predecessors[i] = SENTINEL;
    }
    
    tails[lo] = i;

    if (lo === len) {
      len++;
    }
  }

  if (len === 0) return [];

  // OPTIMIZATION: Reconstruct with cleaner sentinel handling
  const lis: number[] = new Array(len);
  let k = tails[len - 1];
  
  for (let i = len - 1; i >= 0; i--) {
    lis[i] = k;
    const pred = predecessors[k];
    
    // OPTIMIZATION: Direct comparison instead of ternary
    if (pred !== SENTINEL) {
      k = pred;
    } else {
      k = -1; // Will break loop naturally when i=0
    }
  }

  return lis;
}
