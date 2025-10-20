/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { longestIncreasingSubsequenceAsync } from './lisAsync';
import { longestIncreasingSubsequence } from '../internal/lis';

// Create a configurable mock behavior registry
const mockWorkerBehavior = {
  mode: 'normal' as 'normal' | 'timeout' | 'error-message' | 'error-event' | 'post-error',
  reset() {
    this.mode = 'normal';
  }
};

// Mock the worker module ONCE at the top level
vi.mock('./lis.worker.ts?worker', () => {
  return {
    default: class MockWorker {
      onmessage: ((event: { data: any }) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      postMessage(data: any) {
        // Throw synchronous errors BEFORE scheduling async operations
        const behavior = mockWorkerBehavior.mode;

        if (behavior === 'post-error') {
          throw new Error('Transfer failed');
        }

        // Use setTimeout to simulate async worker behavior
        setTimeout(() => {
          switch (behavior) {
            case 'normal': {
              const result = longestIncreasingSubsequence(data);
              if (this.onmessage) {
                this.onmessage({ data: result });
              }
              break;
            }

            case 'timeout': {
              // Don't call onmessage - simulate hanging worker
              break;
            }

            case 'error-message': {
              if (this.onmessage) {
                this.onmessage({ data: { error: 'Computation failed' } });
              }
              break;
            }

            case 'error-event': {
              if (this.onerror) {
                const errorEvent = new ErrorEvent('error', { message: 'Failed to load script' });
                this.onerror(errorEvent);
              }
              break;
            }
          }
        }, 0);
      }

      terminate() {
        // Cleanup
      }
    },
  };
});

describe('longestIncreasingSubsequenceAsync', () => {
  beforeEach(() => {
    mockWorkerBehavior.reset();
  });

  it('should correctly calculate the LIS by calling the worker logic', async () => {
    mockWorkerBehavior.mode = 'normal';
    const seq = new Int32Array([0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]);
    const result = await longestIncreasingSubsequenceAsync(seq);
    expect(result).toEqual([0, 4, 6, 9, 13, 15]);
  });

  describe('Error and Edge Case Handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve with an empty array for empty input without creating a worker', async () => {
      const seq = new Int32Array([]);
      const result = await longestIncreasingSubsequenceAsync(seq);
      expect(result).toEqual([]);
    });

    it('should reject if the worker times out', async () => {
      mockWorkerBehavior.mode = 'timeout';
      const seq = new Int32Array([1, 2, 3]);
      const promise = longestIncreasingSubsequenceAsync(seq);
      const assertion = expect(promise).rejects.toThrow('Worker timeout: LIS computation took too long.');
      vi.advanceTimersByTime(30001);
      await assertion;
    });

    it('should reject if the worker sends an error message', async () => {
      mockWorkerBehavior.mode = 'error-message';
      const seq = new Int32Array([1, 2, 3]);
      const promise = longestIncreasingSubsequenceAsync(seq);
      const assertion = expect(promise).rejects.toThrow('Computation failed');
      await vi.runAllTimersAsync();
      await assertion;
    });

    it('should reject on a worker.onerror event', async () => {
      mockWorkerBehavior.mode = 'error-event';
      const seq = new Int32Array([1, 2, 3]);
      const promise = longestIncreasingSubsequenceAsync(seq);
      const assertion = expect(promise).rejects.toThrow('Worker error: Failed to load script');
      await vi.runAllTimersAsync();
      await assertion;
    });
  });

  // Separate describe block for synchronous error test (no fake timers)
  describe('Synchronous Error Handling', () => {
    it('should reject if postMessage throws an error', async () => {
      mockWorkerBehavior.mode = 'post-error';
      const seq = new Int32Array([1, 2, 3]);
      const promise = longestIncreasingSubsequenceAsync(seq);
      const assertion = expect(promise).rejects.toThrow('Transfer failed');
      await assertion;
    });
  });
});
