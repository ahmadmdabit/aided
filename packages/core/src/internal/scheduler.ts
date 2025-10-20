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
 * Schedules a flush of the dirty effects queue to run in the next microtask.
 * This is the core of our batching mechanism.
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
      dirtyEffects.forEach((effect) => effect.execute());
    } finally {
      // Clear the queue and reset the batching flag after execution.
      dirtyEffects.clear();
      isBatching = false;
    }
  });
}

/**
 * Cleans up an effect by removing it from all of its dependencies (the signals it subscribes to).
 * This is crucial for preventing memory leaks.
 */
export function cleanup(effect: Subscriber) {
  for (const dependency of effect.dependencies) {
    dependency.delete(effect);
  }
  effect.dependencies.clear();
}
