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

  // Track actual nodes to handle DocumentFragments correctly.
  // Fragments are emptied upon insertion, so we must track their children
  // to ensure proper cleanup and prevent NotFoundError crashes.
  const nodes = children instanceof DocumentFragment
    ? Array.from(children.childNodes)
    : [children];

  nodes.forEach(node => mount.appendChild(node));

  // When the Portal's owner scope is cleaned up, remove the children
  // from the mount target.
  onCleanup(() => {
    nodes.forEach(node => {
      if (node.parentNode === mount) {
        mount.removeChild(node);
      }
    });
  });

  return placeholder;
}
