import { effectStack } from '../internal/scheduler';

/**
 * Executes a function without tracking any of its dependencies.
 * 
 * This is a powerful utility that temporarily disables reactive dependency tracking.
 * Any signals read inside the untracked function will not cause the currently
 * executing effect to re-run when those signals change.
 * 
 * Common use cases:
 * - Creating component instances that should maintain their own state
 * - Performing side effects that shouldn't trigger reactive updates  
 * - Breaking unwanted dependency chains in complex reactive graphs
 * 
 * @param fn The function to execute without tracking dependencies.
 * @returns The return value of the function.
 * 
 * @example
 * ```typescript
 * const [count, setCount] = createSignal(0);
 * 
 * // This effect would normally re-run every time count changes
 * createEffect(() => {
 *   console.log('Count changed:', count());
 * });
 * 
 * // But this won't trigger the effect
 * untrack(() => {
 *   setCount(count() + 1); // Reading count here doesn't track it
 * });
 * ```
 */
export function untrack<T>(fn: () => T): T {
  // 1. Save the current effect stack to restore later
  const prevStack = [...effectStack];
  
  // 2. Clear the global tracking stack to disable dependency tracking
  effectStack.length = 0;
  
  try {
    // 3. Execute the function without any dependency tracking
    return fn();
  } finally {
    // 4. Always restore the previous stack, even if an error occurs
    effectStack.push(...prevStack);
  }
}
