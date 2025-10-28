/**
 * A reusable ref callback to automatically focus an element when it's mounted.
 * @param {HTMLElement} element The element to focus.
 */
export function autofocus(element: HTMLElement) {
  // Defer the focus call to the next event loop tick.
  setTimeout(() => { // OR queueMicrotask
    // It's also good practice to check if the element is still in the DOM.
    if (document.body.contains(element)) {
      element.focus();
    }
  }, 0);
}