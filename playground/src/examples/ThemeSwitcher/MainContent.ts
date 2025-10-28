import { h, useContext } from 'aided-core';
import { ThemeContext } from './../context/ThemeContext';

export function MainContent() {
  // This component also consumes the context to display the current theme.
  const themeContext = useContext(ThemeContext);
  const { theme } = themeContext!;

  return h.main(
    { class: 'main-content' },
    h.p('Welcome to the application.'),
    h.p('The current theme is: ', h.strong(theme))
  );
}
