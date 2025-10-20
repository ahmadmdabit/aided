/**
 * Creates a query function that is scoped to a specific root element.
 * This is a safer and more convenient alternative to using `document.querySelector`.
 *
 * @param root The root element to scope the queries to.
 * @returns A typed query function.
 */
export function scopeQuery(root: Element) {
  return function query<T extends Element>(selector: string): T | null {
    return root.querySelector<T>(selector);
  };
}
