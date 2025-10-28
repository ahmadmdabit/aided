import { createContext } from 'aided-core';

// Define the "shape" of our context value.
// It will contain the current theme (a signal getter) and a function to change it.
export type ThemeContextType = {
  theme: () => 'light' | 'dark';
  toggleTheme: () => void;
};

// Create the context object. We provide a default value for safety,
// though in our app, a provider will always be present.
export const ThemeContext = createContext<ThemeContextType>({
  theme: () => 'light',
  toggleTheme: () => console.warn('Theme provider not found!'),
});