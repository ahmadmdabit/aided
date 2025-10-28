import { createEffect } from '../primitives/effect';
import { createRoot, onCleanup } from '../lifecycle/lifecycle';
import type { Disposer, SignalGetter } from '../types';

/**
 * Props for the Show component that conditionally renders content.
 */
type ShowProps<T> = {
  /** Signal that determines whether to show children or fallback */
  when: SignalGetter<T>;
  /** Optional function that returns content to show when condition is falsy */
  fallback?: () => Node;
  /** Function that returns content to show when condition is truthy */
  children: () => Node;
};

/**
 * Conditionally renders content based on a reactive condition.
 *
 * The Show component efficiently switches between showing children or fallback content
 * based on the truthiness of the `when` signal. Each conditional branch gets its own
 * reactive scope for proper cleanup when switching.
 *
 * @param props Configuration object with when, children, and optional fallback
 * @returns A DocumentFragment that conditionally contains the rendered content
 *
 * @example
 * ```typescript
 * const [isLoggedIn, setLoggedIn] = createSignal(false);
 *
 * const content = Show({
 *   when: isLoggedIn,
 *   fallback: () => h.p('Please log in'),
 *   children: () => h.p('Welcome back!')
 * });
 *
 * // Shows "Please log in" initially, switches to "Welcome back!" when logged in
 * ```
 */
export function Show<T>(props: ShowProps<T>): Node {
  const { when, fallback, children } = props;
  const container = document.createDocumentFragment();
  // End marker provides stable insertion point for conditional content
  const endMarker = document.createTextNode('');
  container.appendChild(endMarker);
  let currentDisposer: Disposer | null = null;

  createEffect(() => {
    const condition = !!when();

    // Always clean up the previous state before rendering the new one
    if (currentDisposer) {
      currentDisposer();
      // Removed: container.textContent = ''; (invalid on DocumentFragment)
    }

    const renderer = condition ? children : fallback;
    let branchElement: Node | null = null;  // Local to this effect run

    if (renderer) {
      // Create a new root for the branch, so it gets its own lifecycle
      currentDisposer = createRoot(() => {
        branchElement = renderer();
        // Added: Explicit cleanup to remove the node from DOM on dispose
        onCleanup(() => {
          if (branchElement && branchElement.parentNode) {
            branchElement.parentNode.removeChild(branchElement);
          }
        });
      });
    } else {
      currentDisposer = null;
    }

    // Added: Insert the new branch before the endMarker (handles fragment initial / DOM updates)
    if (branchElement) {
      endMarker.parentNode!.insertBefore(branchElement, endMarker);
    }
  });

  return container;
}
