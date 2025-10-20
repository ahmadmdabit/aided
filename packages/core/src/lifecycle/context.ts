import type { Context } from '../types';

/**
 * Creates a new Context object used to provide and inject values.
 *
 * @param defaultValue An optional default value if no provider is found.
 */
export function createContext<T>(defaultValue?: T): Context<T> {
  return {
    id: Symbol('context'),
    defaultValue,
  };
}
