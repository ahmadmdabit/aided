import { createSignal } from './signal';
import { createEffect } from './effect';
import { createMemo } from './memo';
import { onCleanup } from '../lifecycle/lifecycle';
import type { Resource, SignalGetter, ReactiveOptions } from '../types';

/**
 * Information passed to the fetcher function, including an AbortSignal
 * to cancel the request if the resource is disposed or re-fetched.
 */
export interface FetcherInfo {
  signal: AbortSignal;
}

type Fetcher<S, T> = (source: S, info?: FetcherInfo) => T | Promise<T>;

/**
 * Creates a resource that handles asynchronous data fetching with reactive state management.
 *
 * Resources automatically track loading, error, and data states. They re-fetch data
 * whenever their source signal changes and provide reactive access to all states.
 *
 * @param source A signal that provides the input for the fetcher function
 * @param fetcher A function that takes the source value and returns data or a Promise
 * @param options Optional configuration including debug name
 * @returns A resource object with reactive loading, error, and data states
 *
 * @example
 * ```typescript
 * const [userId, setUserId] = createSignal(1);
 *
 * const userResource = createResource(userId, async (id) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * });
 *
 * // Access reactive states
 * console.log(userResource.loading()); // true while fetching
 * console.log(userResource.error());   // Error object if fetch failed
 * console.log(userResource());         // User data when available
 *
 * // Change source triggers automatic re-fetch
 * setUserId(2); // Automatically fetches user with ID 2
 *
 * // Handle different states in effects
 * createEffect(() => {
 *   if (userResource.loading()) {
 *     showLoadingSpinner();
 *   } else if (userResource.error()) {
 *     showError(userResource.error());
 *   } else {
 *     displayUser(userResource());
 *   }
 * });
 * ```
 */
export function createResource<S, T, E = unknown>(
  source: SignalGetter<S>,
  fetcher: Fetcher<S, T>,
  options?: ReactiveOptions
): Resource<T, E> {
  const [data, setData] = createSignal<T | undefined>(undefined, options);
  const [loading, setLoading] = createSignal<boolean>(true);
  const [error, setError] = createSignal<E | undefined>(undefined);

  createEffect(() => {
    const sourceValue = source();
    setLoading(true);
    setError(undefined);

    const controller = new AbortController();

    // Abort the fetch if the effect re-runs or the reactive scope is disposed
    onCleanup(() => {
      controller.abort();
    });

    const executeFetch = async () => {
      try {
        const result = await fetcher(sourceValue, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e as E);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    executeFetch();
  }, options);

  // The main return value is a memo of the data
  const resourceMemo = createMemo(() => data(), options);

  // Attach the loading and error states as memos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (resourceMemo as any).loading = createMemo(() => loading());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (resourceMemo as any).error = createMemo(() => error());

  return resourceMemo as Resource<T, E>;
}
