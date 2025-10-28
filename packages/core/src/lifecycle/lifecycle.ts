import { devWarning } from '../error';
import type { Context , Disposer } from '../types';

type Owner = {
  parent: Owner | null;
  cleanups: Disposer[];
  // NEW: Add a map to store context values for this scope
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexts?: Map<symbol, any>;
} | null;

let currentOwner: Owner = null;

/**
 * Creates a new reactive ownership scope and returns a disposer function.
 *
 * The ownership system is Aided's memory management mechanism. All reactive primitives
 * (effects, memos, resources) created within a root are automatically tracked and
 * cleaned up when the root is disposed. This prevents memory leaks and ensures
 * proper resource management.
 *
 * @param fn Function that receives the disposer and executes within the new scope
 * @returns A disposer function that cleans up all resources created in this scope
 *
 * @example
 * ```typescript
 * // Create a reactive scope
 * const dispose = createRoot((disposeRoot) => {
 *   const [count, setCount] = createSignal(0);
 *
 *   // Effects created here are automatically managed
 *   createEffect(() => {
 *     console.log('Count:', count());
 *   });
 *
 *   // Manual cleanup when needed
 *   setTimeout(() => {
 *     disposeRoot(); // Cleans up all effects and resources
 *   }, 1000);
 * });
 *
 * // Alternative pattern - return disposer for external control
 * const cleanup = createRoot(() => {
 *   // ... reactive code ...
 * });
 * // cleanup() can be called later to dispose everything
 * ```
 */
export function createRoot(fn: (dispose: Disposer) => void): Disposer {
  const parentOwner = currentOwner;
  const root: Owner = {
    parent: parentOwner,
    cleanups: [],
  };

  const dispose = () => {
    // Set the owner to this root during cleanup to catch any nested cleanups
    const prevOwner = currentOwner;
    currentOwner = root;
    try {
      // Run cleanups in reverse order to handle dependencies correctly
      for (let i = root.cleanups.length - 1; i >= 0; i--) {
        root.cleanups[i]();
      }
      root.cleanups = [];
    } finally {
      currentOwner = prevOwner;
    }
  };

  // Set the current owner for the function execution
  currentOwner = root;
  try {
    fn(dispose);
  } finally {
    // Restore the parent owner
    currentOwner = parentOwner;
  }

  return dispose;
}

/**
 * Registers a cleanup function to run when the current reactive owner is disposed.
 *
 * Cleanup functions are typically used to remove event listeners, cancel timers,
 * abort network requests, or perform any other necessary cleanup when reactive
 * scopes are destroyed.
 *
 * @param fn The cleanup function to register - will be called when the owner scope is disposed
 *
 * @example
 * ```typescript
 * createRoot(() => {
 *   const button = document.createElement('button');
 *
 *   // Add event listener
 *   button.addEventListener('click', handleClick);
 *
 *   // Register cleanup to remove listener
 *   onCleanup(() => {
 *     button.removeEventListener('click', handleClick);
 *   });
 *
 *   // When the root is disposed, the listener is automatically removed
 * });
 * ```
 */
export function onCleanup(fn: Disposer): void {
  // Use devWarning to provide a helpful message
  devWarning(
    !!currentOwner,
    'onCleanup() was called outside of a reactive scope (like createRoot or createEffect). The cleanup function will not be registered.'
  );

  if (currentOwner) {
    currentOwner.cleanups.push(fn);
  }
}

/**
 * Checks if there is a current reactive owner in the call stack.
 *
 * This is primarily used internally to provide warnings when reactive primitives
 * are created outside of a proper reactive scope, which can lead to memory leaks
 * and unexpected behavior.
 *
 * @returns true if called within a reactive root or effect, false otherwise
 * @internal This function is for internal use and warning systems
 */
export function hasOwner(): boolean {
  return !!currentOwner;
}

/**
 * Retrieves a value from the context hierarchy.
 * It walks up the owner tree to find the nearest provider.
 *
 * @param context The Context object to look up.
 * @returns The value from the nearest Provider, or the context's default value.
 */
// export function useContext<T>(context: Context<T>): T {
//   let owner = currentOwner;
//   while (owner) {
//     if (owner.contexts?.has(context.id)) {
//       return owner.contexts.get(context.id);
//     }
//     owner = owner.parent;
//   }
//   return context.defaultValue;
// }

/**
 * Provides a value for a context within the current reactive scope.
 *
 * Values provided in a scope are available to all descendant scopes through
 * the inject function. When the providing scope is disposed, the context
 * value is no longer available.
 *
 * @param context The context object to provide a value for
 * @param value The value to provide for this context
 *
 * @example
 * ```typescript
 * const ThemeContext = createContext<Theme>({ primary: 'blue' });
 *
 * createRoot(() => {
 *   // Provide theme to all child scopes
 *   provide(ThemeContext, { primary: 'red' });
 *
 *   // Children can now inject this theme
 *   createEffect(() => {
 *     const theme = inject(ThemeContext);
 *     console.log(theme.primary); // 'red'
 *   });
 * });
 * ```
 */
export function provide<T>(context: Context<T>, value: T): void {
  devWarning(!!currentOwner, 'provide() was called outside of a reactive scope.');
  if (!currentOwner) return;

  if (!currentOwner.contexts) {
    currentOwner.contexts = new Map();
  }
  currentOwner.contexts.set(context.id, value);
}

/**
 * Injects a value from the nearest context provider in the ownership hierarchy.
 *
 * Searches up the reactive ownership tree to find the closest scope that provides
 * the requested context. Returns the provided value or the context's default value
 * if no provider is found.
 *
 * @param context The context object to retrieve a value for
 * @returns The provided value or the context's default value
 *
 * @example
 * ```typescript
 * const ThemeContext = createContext<Theme>({ primary: 'blue' });
 *
 * createRoot(() => {
 *   provide(ThemeContext, { primary: 'red' });
 *
 *   createEffect(() => {
 *     const theme = inject(ThemeContext);
 *     console.log(theme.primary); // 'red'
 *   });
 *
 *   // Nested scopes inherit context
 *   createRoot(() => {
 *     const theme = inject(ThemeContext);
 *     console.log(theme.primary); // 'red' (inherited)
 *   });
 * });
 *
 * // Outside root, gets default
 * const theme = inject(ThemeContext);
 * console.log(theme.primary); // 'blue' (default)
 * ```
 */
export function inject<T>(context: Context<T>): T | undefined {
  let owner = currentOwner;
  while (owner) {
    if (owner.contexts?.has(context.id)) {
      return owner.contexts.get(context.id);
    }
    owner = owner.parent;
  }
  return context.defaultValue;
}
