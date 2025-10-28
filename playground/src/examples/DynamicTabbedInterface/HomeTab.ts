import { h, createSignal } from 'aided-core';

export function HomeTab() {
  const [count, setCount] = createSignal(0);

  return h.div(
    h.h3('Welcome to the Home Tab'),
    h.p('This component has its own independent state.'),
    h.div(
      h.strong('Count: '),
      count // Pass the signal directly as a child
    ),
    h.button({ onClick: () => setCount(count() + 1) }, h.span(`You clicked `, count, ` times`))
  );
}
