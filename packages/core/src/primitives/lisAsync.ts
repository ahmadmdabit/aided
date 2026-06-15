import LISWorker from './lis.worker.ts?worker';

/**
 * Response type from the LIS Web Worker.
 * Either returns the computed LIS indices or an error object.
 */
type WorkerResponse = number[] | { error: string };

/**
 * Computes the Longest Increasing Subsequence (LIS) asynchronously using a Web Worker.
 *
 * This function is recommended for large arrays (>1000 elements) to prevent blocking
 * the main UI thread during computationally intensive LIS calculations. It transfers
 * the TypedArray to a worker thread for processing and returns a Promise that resolves
 * with the LIS indices.
 *
 * The function uses zero-copy transfer of the TypedArray buffer to the worker for
 * optimal performance. A timeout prevents hanging computations.
 *
 * @param seq The sequence of numbers as a TypedArray for efficient transfer to worker
 * @returns Promise resolving to array of LIS indices, or rejecting on error/timeout
 * @throws Error if worker computation fails or times out after 30 seconds
 *
 * @example
 * ```typescript
 * // For large lists that might block the UI
 * const largeList = new Uint32Array(5000);
 * // ... populate array ...
 *
 * try {
 *   const lisIndices = await longestIncreasingSubsequenceAsync(largeList);
 *   console.log('LIS indices:', lisIndices);
 * } catch (error) {
 *   console.error('LIS computation failed:', error);
 * }
 *
 * // Compare with sync version for small arrays
 * const smallList = [3, 1, 4, 1, 5];
 * const syncResult = longestIncreasingSubsequence(smallList); // Faster for small arrays
 * ```
 */
export function longestIncreasingSubsequenceAsync(
  seq: Int32Array | Uint32Array | Float32Array | Float64Array
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    if (!seq || seq.length === 0) {
      // Handle empty input gracefully without creating a worker.
      return resolve([]);
    }

    const worker = new LISWorker();

    // Set a timeout to prevent hanging workers.
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Worker timeout: LIS computation took too long.'));
    }, 30000); // 30-second timeout

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      clearTimeout(timeout);
      worker.terminate();
      
      if (event.data && typeof event.data === 'object' && 'error' in event.data) {
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
      // Post the sequence to the worker with a transferable object.
      worker.postMessage(seq, [seq.buffer]);
    } catch (error) {
      clearTimeout(timeout);
      worker.terminate();
      reject(error);
    }
  });
}
