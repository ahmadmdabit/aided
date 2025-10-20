import { createSignal } from './signal';
import { createEffect } from './effect';
import { createMemo } from './memo';
import type { Resource, SignalGetter, ReactiveOptions } from '../types';

type Fetcher<S, T> = (source: S) => T | Promise<T>;

/**
 * Creates a resource that handles asynchronous data fetching.
 * It automatically re-fetches when its source signal changes.
 *
 * @param source A signal that provides the input for the fetcher.
 * @param fetcher A function that takes the source value and returns the data or a Promise.
 * @param options Optional configuration, including a debug name.
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

    const executeFetch = async () => {
      try {
        const result = await fetcher(sourceValue);
        setData(result);
      } catch (e) {
        setError(e as E);
      } finally {
        setLoading(false);
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
