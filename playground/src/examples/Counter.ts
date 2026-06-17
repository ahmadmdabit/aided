import { createSignal, h } from "aided-core";
import { CodeSnippet } from '../components/CodeSnippet';

const counterCode = `const [count, setCount] = createSignal(0);

const counter = h.button(
  { onClick: () => setCount(count() + 1) },
  'Count: ', count
);`;

export function Counter() {
  const [count, setCount] = createSignal(0);

  // Use the `h` helper to build your UI
  return h.div(
    h.button(
      {
        'data-testid': 'counter-button',
      // Event handlers are passed as props
        onClick: () => setCount(count() + 1)
      },
    // Reactive children are automatically updated
      'Count: ', h.span({ 'data-testid': 'count-display' }, count)
    ),
    CodeSnippet({ code: counterCode })
  );
}
