import { describe, it, expect, vi, afterEach } from 'vitest';
import { createSignal, createRoot, createResource } from '../index';

// A more advanced tick helper for finer control
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

// A helper to create a manually resolvable promise
function createManualPromise<T>() {
  let resolve: (value: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

describe('Aided createResource', () => {
  let dispose: () => void;

  afterEach(() => {
    if (dispose) {
      dispose();
    }
  });

  it('should fetch data and update loading state', async () => {
    const { promise, resolve } = createManualPromise<string>();
    const fetcher = vi.fn(async (id: number) => {
      await promise;
      return `User ${id}`;
    });
    const [userId] = createSignal(1);
    let resource: ReturnType<typeof createResource>;

    dispose = createRoot(() => {
      resource = createResource(userId, fetcher);
    });

    // Immediately after creation, the effect has run, and it's loading
    expect(resource!.loading()).toBe(true);
    expect(resource!()).toBeUndefined();

    // Resolve the fetcher's promise
    resolve('User 1');
    await tick(); // Wait for the reactive updates to flush

    expect(resource!.loading()).toBe(false);
    expect(resource!()).toBe('User 1');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should re-fetch when the source signal changes', async () => {
    const { promise: promise1, resolve: resolve1 } = createManualPromise<string>();
    const { promise: promise2, resolve: resolve2 } = createManualPromise<string>();
    const fetcher = vi.fn()
      .mockImplementationOnce(async (id: number) => {
        await promise1;
        return `User ${id}`;
      })
      .mockImplementationOnce(async (id: number) => {
        await promise2;
        return `User ${id}`;
      });

    const [userId, setUserId] = createSignal(1);
    let resource: ReturnType<typeof createResource>;

    dispose = createRoot(() => {
      resource = createResource(userId, fetcher);
    });

    // Initial fetch
    resolve1('User 1');
    await tick();
    expect(resource!()).toBe('User 1');
    expect(fetcher).toHaveBeenCalledTimes(1);

    // --- THE FIX ---
    // Change the source, which triggers the re-fetch
    setUserId(2);
    await tick(); // Wait for the effect to start

    // NOW, we are in the intermediate loading state
    expect(resource!.loading()).toBe(true);
    // The data is still the old data
    expect(resource!()).toBe('User 1');

    // Now, resolve the second fetch
    resolve2('User 2');
    await tick(); // Wait for the reactive updates to flush

    // Now the fetch is complete
    expect(resource!.loading()).toBe(false);
    expect(resource!()).toBe('User 2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should handle fetch errors and update the error state', async () => {
    const error = new Error('Fetch failed');
    const { promise, reject } = createManualPromise<string>();
    const fetcher = vi.fn(async () => {
      await promise;
      // This function will be made to throw by rejecting the promise
    });
    const [userId] = createSignal(1);
    let resource: ReturnType<typeof createResource>;

    dispose = createRoot(() => {
      resource = createResource(userId, fetcher);
    });

    expect(resource!.loading()).toBe(true);

    // Reject the promise to simulate a fetch error
    reject(error);
    await tick();

    expect(resource!.loading()).toBe(false);
    expect(resource!.error()).toBe(error);
    expect(resource!()).toBeUndefined(); // Data should be undefined
  });

  // ... (The synchronous fetcher test can remain as is, it's a different case)
  it('should handle synchronous fetchers', async () => {
    const fetcher = vi.fn((id: number) => `Sync User ${id}`);
    const [userId, setUserId] = createSignal(1);
    let resource: ReturnType<typeof createResource>;

    dispose = createRoot(() => {
      resource = createResource(userId, fetcher);
    });

    expect(resource!.loading()).toBe(true);
    await tick();
    expect(resource!.loading()).toBe(false);
    expect(resource!()).toBe('Sync User 1');

    setUserId(2);
    await tick();
    expect(resource!()).toBe('Sync User 2');
  });
});
