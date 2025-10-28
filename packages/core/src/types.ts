/**
 * A function that can be run to clean up a subscription or effect.
 * Returned by reactive primitives to allow manual cleanup.
 */
export type Disposer = () => void;

/**
 * The read-only part of a signal. It's a function that returns the current value
 * and automatically tracks dependencies when called within an effect.
 *
 * @template T The type of value stored in the signal
 */
export type SignalGetter<T> = () => T;

/**
 * The write-only part of a signal. It's a function that updates the signal's value
 * and notifies all dependent effects.
 *
 * @template T The type of value to store in the signal
 */
export type SignalSetter<T> = (newValue: T) => void;

/**
 * A read-only signal whose value is derived from other signals.
 * Automatically re-computes when its dependencies change.
 *
 * @template T The type of the computed value
 */
export type Memo<T> = () => T;

/**
 * Common options for creating reactive primitives, including a debug name.
 */
export interface ReactiveOptions {
  /** Optional name for debugging and development tools */
  name?: string;
}

/**
 * Represents the state of an asynchronous resource with reactive loading and error states.
 *
 * @template T The type of the successfully fetched data
 * @template E The type of the error if the fetch fails (defaults to unknown)
 *
 * @example
 * ```typescript
 * const userResource = createResource(
 *   createSignal(1), // source signal
 *   (userId) => fetch(`/api/users/${userId}`).then(r => r.json())
 * );
 *
 * // Access reactive states
 * console.log(userResource.loading()); // true/false
 * console.log(userResource.error());   // Error object or undefined
 * console.log(userResource());         // Data or undefined
 * ```
 */
export interface Resource<T, E = unknown> extends Memo<T | undefined> {
  /**
   * A reactive boolean indicating if the resource is currently fetching.
   * Automatically becomes true when a new fetch starts and false when it completes.
   */
  readonly loading: Memo<boolean>;

  /**
   * A reactive signal holding the error object if the last fetch failed.
   * Automatically cleared when a new fetch starts successfully.
   */
  readonly error: Memo<E | undefined>;
}

/**
 * A Context object used for dependency injection throughout the component tree.
 * Contexts allow components to share data without prop drilling.
 *
 * @template T The type of value stored in the context
 *
 * @example
 * ```typescript
 * // Create a context
 * const ThemeContext = createContext<Theme>({ primary: 'blue' });
 *
 * // Provide a value
 * provide(ThemeContext, { primary: 'red' });
 *
 * // Consume the value
 * const theme = inject(ThemeContext);
 * ```
 */
export interface Context<T> {
  /** Unique symbol identifier for the context */
  readonly id: symbol;

  /** Default value to use if no provider is found */
  readonly defaultValue?: T;
}
