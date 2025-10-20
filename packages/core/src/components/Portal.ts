import { onCleanup } from '../lifecycle/lifecycle';

/**
 * Renders children into a different part of the DOM.
 * Returns a placeholder comment node to mark its position in the original tree.
 *
 * @param props An object containing the mount target and the children to render.
 */
export function Portal(props: { mount: Element; children: Node }): Comment {
  const { mount, children } = props;
  const placeholder = document.createComment('portal');

  // Mount the children to the target
  mount.appendChild(children);

  // When the Portal's owner scope is cleaned up, remove the children
  // from the mount target.
  onCleanup(() => {
    mount.removeChild(children);
  });

  return placeholder;
}
