import { effectStack, cleanup } from '../internal/scheduler';
import type { Subscriber } from '../internal/scheduler';
import type { Disposer, ReactiveOptions } from '../types';
import { hasOwner, onCleanup } from '../lifecycle/lifecycle';
import { isProfilerEnabled, recordEffectExecution } from '../internal/profiler';
import { devWarning } from '../error';

/**
 * Creates an effect that automatically re-runs when its dependencies change.
 *
 * Effects are functions that run immediately and re-run whenever any signals they
 * read during execution change. They're the primary way to create side effects
 * that respond to reactive state changes.
 *
 * @param fn The function to run as an effect - will be called immediately and whenever dependencies change
 * @param options Optional configuration including debug name
 * @returns A disposer function to manually stop the effect and clean up resources
 *
 * @example
 * ```typescript
 * const [count, setCount] = createSignal(0);
 *
 * createEffect(() => {
 *   console.log('Count changed to:', count());
 *   document.title = `Count: ${count()}`;
 * });
 *
 * setCount(1); // Logs: "Count changed to: 1"
 * setCount(2); // Logs: "Count changed to: 2"
 *
 * // Effects must be created within a reactive root for proper cleanup
 * createRoot(() => {
 *   const dispose = createEffect(() => {
 *     // ... effect logic
 *   });
 *   // dispose() will clean up the effect when called
 * });
 * ```
 */
export function createEffect(fn: () => void, options?: ReactiveOptions): Disposer {
  // Add the warning here
  devWarning(
    hasOwner(),
    `createEffect(${options?.name ? `"${options.name}"` : ''}) was called outside of a reactive root. This effect will not be automatically cleaned up.`
  );

  const effect: Subscriber = {
    execute: () => {
      // Clean up any old dependencies before re-running the effect.
      cleanup(effect);
      // Push this effect onto the global stack to track new dependencies.
      effectStack.push(effect);

      const profiling = isProfilerEnabled();
      const start = profiling ? performance.now() : 0;

      try {
        fn();
      } finally {
        // Always pop the effect from the stack after execution.
        effectStack.pop();

        const duration = profiling ? (performance.now() - start) : 0;
        recordEffectExecution(effect.name || 'anonymous', duration);
      }
    },
    dependencies: new Set(),
    // NEW: Store the name on the subscriber object
    name: options?.name,
  };

  // Run the effect immediately to establish its initial dependencies.
  effect.execute();

  const disposer = () => {
    cleanup(effect);
  };

  // NEW: Register the effect's own disposer with the current owner.
  onCleanup(disposer);

  return disposer;
}
