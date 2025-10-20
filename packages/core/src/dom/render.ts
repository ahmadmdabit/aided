import { AidedError } from '../error';
import { createRoot } from '../lifecycle/lifecycle';
import type { Disposer } from '../types';

/**
 * Renders a component into a DOM node.
 *
 * @param component A function that returns a DOM element.
 * @param mountNode The DOM node to mount the component into.
 * @returns A disposer function to unmount the component and clean up all resources.
 */
export function render(component: () => Element, mountNode: Element): Disposer {
  if (!mountNode) {
    // Use the new custom error with a more descriptive message
    throw new AidedError(
      'render(...): The provided mount node is null or undefined. Aided requires a valid DOM element to render into.',
      'INVALID_MOUNT_NODE'
    );
  }

  // createRoot establishes the lifecycle for the entire application.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispose = createRoot((disposeRoot) => {
    const appElement = component();
    mountNode.innerHTML = ''; // Clear the mount node
    mountNode.appendChild(appElement);
  });

  return dispose;
}
