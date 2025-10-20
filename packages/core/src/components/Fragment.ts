/**
 * A component that groups multiple children without adding an extra element to the DOM.
 *
 * @param props An object containing the children to render.
 * @returns A DocumentFragment containing the children.
 */
export function Fragment(props: { children: Node[] }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  // Append all children to the fragment
  fragment.append(...props.children);
  return fragment;
}
