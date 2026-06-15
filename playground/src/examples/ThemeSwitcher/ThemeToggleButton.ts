import { h, useContext } from 'aided-core';
import { ThemeContext } from './../context/ThemeContext';

// This component is deeply nested, but it can access the global theme state.
export function ThemeToggleButton() {
  // 1. Use the `useContext` hook to get the value from the nearest provider.
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    // This is a defensive check in case the provider is missing.
    return h.button({ disabled: true }, 'No Theme Context');
  }

  // 2. Destructure the context value to get the state and the function.
  const { theme, toggleTheme } = themeContext;

  // 3. Use the context values to render the UI.
  return h.button(
    {
      'data-testid': 'theme-toggle',
      // Call the `toggleTheme` function from the context on click.
      onClick: toggleTheme
    },
    // The button's text is reactive and will change when the `theme` signal changes.
    () => `Switch to ${theme() === 'light' ? 'Dark' : 'Light'} Mode`
  );
}
