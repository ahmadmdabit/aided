import { createSignal, h } from "aided-core";

export function Counter() {
  const [count, setCount] = createSignal(0);

  // Use the `h` helper to build your UI
  return h.button(
    {
      'data-testid': 'counter-button',
      // Event handlers are passed as props
      onClick: () => setCount(count() + 1)
    },
    // Reactive children are automatically updated
    'Count: ', h.span({ 'data-testid': 'count-display' }, count)
  );
}