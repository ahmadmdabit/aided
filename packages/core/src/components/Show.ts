import { createEffect } from '../primitives/effect';
import { createRoot, onCleanup } from '../lifecycle/lifecycle';  // Added import for onCleanup
import type { Disposer, SignalGetter } from '../types';

type ShowProps<T> = {
  when: SignalGetter<T>;
  fallback?: () => Node;
  children: () => Node;
};

export function Show<T>(props: ShowProps<T>): Node {
  const { when, fallback, children } = props;
  const container = document.createDocumentFragment();
  const endMarker = document.createTextNode('');  // Added: Invisible marker for insertion point
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
