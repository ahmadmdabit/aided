import { longestIncreasingSubsequence } from './../internal/lis';

/**
 * Response type from the LIS Web Worker.
 * Either returns the computed LIS indices or an error object.
 */
type WorkerResponse = number[] | { error: string };

/**
 * Web Worker for computing Longest Increasing Subsequence (LIS) asynchronously.
 *
 * This worker handles heavy LIS computations off the main thread to prevent
 * UI blocking during large list reconciliations. It receives TypedArrays containing
 * sequence data, computes the LIS indices, and posts the result back to the main thread.
 *
 * The worker expects TypedArray messages and responds with either:
 * - number[]: Array of LIS indices on success
 * - { error: string }: Error message on failure
 *
 * @example
 * ```typescript
 * // Main thread usage
 * const worker = new LISWorker();
 * worker.postMessage(sequenceData, [sequenceData.buffer]);
 *
 * worker.onmessage = (event) => {
 *   if (event.data.error) {
 *     console.error('LIS computation failed:', event.data.error);
 *   } else {
 *     console.log('LIS result:', event.data);
 *   }
 * };
 * ```
 */

// Listen for messages from the main thread containing sequence data
self.onmessage = (event: MessageEvent<Int32Array | Uint32Array | Float32Array | Float64Array>) => {
  const seq = event.data;

  try {
    // Perform the heavy computation inside the worker to avoid blocking the main thread
    const result = longestIncreasingSubsequence(seq);
    // Post the result back to the main thread
    self.postMessage(result as WorkerResponse);
  } catch (error) {
    // If an error occurs during computation, post error details back
    const errorResponse: WorkerResponse = { 
      error: error instanceof Error ? error.message : 'Unknown worker error' 
    };
    self.postMessage(errorResponse);
  }
};
