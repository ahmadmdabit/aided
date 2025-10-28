import type { Context } from '../types';

/**
 * Creates a new context object for dependency injection throughout the component tree.
 *
 * Contexts enable sharing data between components without prop drilling. Components
 * can provide values in a scope, and descendant components can inject those values.
 * If no provider is found, the default value is returned.
 *
 * @param defaultValue Optional fallback value when no provider is found in the hierarchy
 * @returns A context object that can be used with provide() and inject()
 *
 * @example
 * ```typescript
 * // Create a context with a default theme
 * const ThemeContext = createContext<Theme>({
 *   primary: 'blue',
 *   secondary: 'gray'
 * });
 *
 * // In a component
 * function App() {
 *   return createRoot(() => {
 *     // Provide a custom theme
 *     provide(ThemeContext, { primary: 'red', secondary: 'green' });
 *
 *     // Child components can inject this theme
 *     return h.div({}, h(ThemeButton));
 *   });
 * }
 *
 * // In ThemeButton component
 * function ThemeButton() {
 *   const theme = inject(ThemeContext);
 *   return h.button({
 *     style: { backgroundColor: theme.primary }
 *   }, 'Themed Button');
 * }
 * ```
 */
export function createContext<T>(defaultValue?: T): Context<T> {
  return {
    id: Symbol('context'),
    defaultValue,
  };
}
