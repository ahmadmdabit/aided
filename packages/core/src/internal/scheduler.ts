// A Subscriber is an effect that has dependencies.
// We store the dependencies on the effect itself for easy cleanup.
export type Subscriber = {
  execute: () => void;
  dependencies: Set<Set<Subscriber>>;
  name?: string; // Add the optional name property
};

// The global stack of effects currently being executed.
// The effect at the top of the stack is the one that is currently tracking dependencies.
export const effectStack: Subscriber[] = [];

// A set of effects that have been marked as "dirty" and need to be re-run.
// Using a Set automatically handles deduplication.
export const dirtyEffects = new Set<Subscriber>();

// A flag to prevent effects from running while a batch is in progress.
export let isBatching = false;

/**
 * Schedules a flush of all dirty effects to run in the next microtask.
 *
 * This function implements Aided's batching mechanism. When signals change,
 * dependent effects are marked as "dirty" but don't execute immediately.
 * Instead, they're batched together and executed asynchronously in a microtask.
 * This prevents redundant re-executions and ensures consistent state updates.
 *
 * The batching works by:
 * 1. Signal writes mark dependent effects as dirty
 * 2. Multiple synchronous writes can occur before any effects run
 * 3. A single microtask schedules execution of all dirty effects
 * 4. Effects run in dependency order when possible
 *
 * @internal This is an internal scheduling function
 */
export function flushQueue() {
  // If we are already in a batch or a flush is already scheduled, do nothing.
  if (isBatching) return;

  isBatching = true;
  // Use queueMicrotask to defer the execution until the current synchronous
  // code block has finished executing.
  queueMicrotask(() => {
    try {
      // Run all unique effects that have been marked as dirty.
      dirtyEffects.forEach((effect) => {
        try {
          effect.execute();
        } catch (err) {
          console.error(`Error in effect${effect.name ? ` "${effect.name}"` : ''}:`, err);
        }
      });
    } finally {
      // Clear the queue and reset the batching flag after execution.
      dirtyEffects.clear();
      isBatching = false;
    }
  });
}

/**
 * Removes an effect from all signals it was subscribed to.
 *
 * This cleanup process is essential for preventing memory leaks. When effects
 * are disposed or re-executed, they must be removed from their dependency lists
 * in all signals they previously accessed. Without this cleanup, signals would
 * retain references to dead effects, preventing garbage collection.
 *
 * The cleanup iterates through all dependency sets (signals) that the effect
 * is subscribed to and removes the effect from each set.
 *
 * @param effect The subscriber (effect) to clean up
 * @internal This is an internal cleanup function
 */
export function cleanup(effect: Subscriber) {
  for (const dependency of effect.dependencies) {
    dependency.delete(effect);
  }
  effect.dependencies.clear();
}
