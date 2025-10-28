import { h, createSignal, provide } from 'aided-core';
import { ThemeContext, type ThemeContextType } from './../context/ThemeContext';
import { Header } from './Header';
import { MainContent } from './MainContent';


const WIDGET_STYLE_ID = 'aided-theme-switcher-styles';

const widgetCSS = `
  body { transition: background-color 0.3s, color 0.3s; }
  .light { background-color: #fff; color: #1a1a1a; border-radius: 1rem; overflow: hidden;}
  .dark { background-color: #1a1a1a; color: #fff; border-radius: 1rem; overflow: hidden; }
  .header { padding: 1rem; background-color: #8f8f8f; display: flex; justify-content: space-between; align-items: center; }
  .main-content { padding: 1rem; }
  button { cursor: pointer; background-color: initial;  }
  .light button { background-color: #e2e2e2; color: #1a1a1a; }
  .dark button { background-color: #1a1a1a; color: #fff; }
`;

function injectThemeSwitchertSyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

export function ThemeSwitcher() {
  injectThemeSwitchertSyles();

  // 1. Create the actual theme state here in the top-level component.
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light');

  // 2. Create the function that will modify the state.
  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light');
  };

  // 3. Create the context value object.
  const themeContextValue: ThemeContextType = {
    theme,       // Pass the signal getter
    toggleTheme, // Pass the function
  };

  // 4. Provide the context value.
  // Any component rendered inside this `provide` call can now access this value.
  provide(ThemeContext, themeContextValue);

  // The `h` helper will create a div and apply a class reactively.
  // When the `theme` signal changes, this class will automatically update.
  return h.div(
    { class: theme }, // Applies 'light' or 'dark' class to the root
    Header(),
    MainContent()
  );
}

