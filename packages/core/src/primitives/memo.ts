import { createSignal } from './signal';
import { createEffect } from './effect';
import type { Memo, ReactiveOptions } from '../types';

/**
 * Creates a derived, memoized signal that only re-computes when its dependencies change.
 *
 * @param fn The function to compute the value.
 * @param options Optional configuration, including a debug name.
 * @returns A read-only Memo object.
 */
export function createMemo<T>(fn: () => T, options?: ReactiveOptions): Memo<T> {
  // A memo is essentially a signal that is updated by an effect.
  // The signal can hold either the computed value T or be undefined initially.
  const [memo, setMemo] = createSignal<T | undefined>(undefined, options);

  // This effect tracks the dependencies of the memo function and updates the signal's value.
  // Pass the name to the underlying effect for better debugging
  createEffect(() => {
    setMemo(fn());
  }, options);

  // The type cast here is safe and intentional.
  // The internal effect runs synchronously upon creation, so the `memo` signal
  // is guaranteed to have a value of type `T` before it's returned to the user.
  // This hides the initial `undefined` state from the public API.
  return memo as Memo<T>;
}
