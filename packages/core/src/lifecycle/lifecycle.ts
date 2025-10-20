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
 * Creates a new ownership scope and returns a disposer function for it.
 * All nested effects and resources created within this scope will be cleaned up
 * when the disposer is called.
 *
 * @param fn The function to execute within the new scope.
 * @returns A disposer function to clean up the entire scope.
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
 * Checks if there is a current reactive owner.
 * @internal
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
 * Provides a value for a given context within the current scope.
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
 * Injects a value from the context hierarchy.
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
