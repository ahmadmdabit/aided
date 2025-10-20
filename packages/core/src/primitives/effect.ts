import { effectStack, cleanup } from '../internal/scheduler';
import type { Subscriber } from '../internal/scheduler';
import type { Disposer, ReactiveOptions } from '../types';
import { hasOwner, onCleanup } from '../lifecycle/lifecycle';
import { devWarning } from '../error';

/**
 * Creates an effect that automatically re-runs when its dependencies (signals) change.
 *
 * @param fn The function to run as an effect.
 * @returns A disposer function to manually stop the effect.
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
      try {
        fn();
      } finally {
        // Always pop the effect from the stack after execution.
        effectStack.pop();
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
