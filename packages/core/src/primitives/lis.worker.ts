import { longestIncreasingSubsequence } from './../internal/lis';

// Listen for messages from the main thread.
self.onmessage = (event: MessageEvent<Int32Array | Uint32Array | Float32Array | Float64Array>) => {
  const seq = event.data;
  
  try {
    // Perform the heavy computation inside the worker.
    const result = longestIncreasingSubsequence(seq);
    // Post the result back to the main thread.
    self.postMessage(result);
  } catch (error) {
    // If an error occurs during computation, post it back.
    self.postMessage({ error: error instanceof Error ? error.message : 'Unknown worker error' });
  }
};
