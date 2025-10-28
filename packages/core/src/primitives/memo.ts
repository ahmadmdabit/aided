import { createSignal } from './signal';
import { createEffect } from './effect';
import type { Memo, ReactiveOptions } from '../types';

/**
 * Creates a derived, memoized signal that caches its computed value.
 *
 * Memos are read-only signals that compute their value from other signals.
 * They automatically track dependencies and only re-compute when those dependencies change.
 * The computed value is cached and returned on subsequent reads until dependencies change.
 *
 * @param fn The function to compute the memoized value - runs when dependencies change
 * @param options Optional configuration including debug name
 * @returns A read-only memo that can be called to get the current computed value
 *
 * @example
 * ```typescript
 * const [firstName, setFirstName] = createSignal('John');
 * const [lastName, setLastName] = createSignal('Doe');
 *
 * const fullName = createMemo(() => `${firstName()} ${lastName()}`);
 *
 * console.log(fullName()); // "John Doe"
 * setFirstName('Jane');    // Triggers re-computation
 * console.log(fullName()); // "Jane Doe"
 *
 * // Memos are lazy - they only compute when read
 * const expensive = createMemo(() => {
 *   console.log('Computing...');
 *   return heavyComputation();
 * });
 *
 * // Nothing computed yet
 * expensive(); // Logs "Computing..." and returns result
 * expensive(); // Returns cached result (no re-computation)
 * ```
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
