import LISWorker from './lis.worker.ts?worker';

/**
 * Finds the LIS of a sequence asynchronously in a Web Worker.
 *
 * This is the recommended approach for extremely large arrays to avoid blocking the main UI thread.
 *
 * @param seq The sequence of numbers. Must be a TypedArray for zero-copy transfer.
 * @returns A Promise that resolves with the array of LIS indices.
 * @throws An error if the worker computation fails or times out.
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

    worker.onmessage = (event: MessageEvent<number[] | { error: string }>) => {
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
