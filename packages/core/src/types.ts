/**
 * A function that can be run to clean up a subscription or effect.
 */
export type Disposer = () => void;

/**
 * The read-only part of a signal. It's a function that returns the value.
 */
export type SignalGetter<T> = () => T;

/**
 * The write-only part of a signal. It's a function that sets the value.
 */
export type SignalSetter<T> = (newValue: T) => void;

/**
 * A read-only signal whose value is derived from other signals.
 * @template T The type of the value held by the memo.
 */
export type Memo<T> = () => T;

/**
 * Common options for creating reactive primitives, including a debug name.
 */
export interface ReactiveOptions {
  name?: string;
}

/**
 * Represents the state of a Resource.
 * @template T The type of the successfully fetched data.
 * @template E The type of the error if the fetch fails.
 */
export interface Resource<T, E = unknown> extends Memo<T | undefined> {
  /**
   * A reactive boolean indicating if the resource is currently fetching.
   */
  readonly loading: Memo<boolean>;
  /**
   * A reactive signal holding the error object if the last fetch failed.
   */
  readonly error: Memo<E | undefined>;
}

/**
 * A Context object, which is an opaque object used to identify a specific context.
 */
export interface Context<T> {
  id: symbol;
  defaultValue?: T;
}
