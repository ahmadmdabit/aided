import { h } from 'aided-core';
import { ThemeToggleButton } from './ThemeToggleButton';

// This is an intermediate component. It doesn't use the context itself,
// but it renders a component that does.
export function Header() {
  return h.header(
    { class: 'header' },
    h.h1('My App'),
    ThemeToggleButton() // No props are passed down!
  );
}