// packages/core/src/signal.ts
import { effectStack, dirtyEffects, flushQueue } from '../internal/scheduler';
import type { Subscriber } from '../internal/scheduler';
import type { SignalGetter, SignalSetter, ReactiveOptions } from '../types';

/**
 * Creates a reactive signal that holds a value.
 *
 * @param value The initial value of the signal.
 * @param options Optional configuration, including a debug name.
 * @returns A tuple containing the signal's getter and setter.
 */
export function createSignal<T>(
  value: T,
  options?: ReactiveOptions
): [SignalGetter<T>, SignalSetter<T>] {
  const subscribers = new Set<Subscriber>();

  const read: SignalGetter<T> = (): T => {
    const currentEffect = effectStack[effectStack.length - 1];
    if (currentEffect) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }
    return value;
  };

  const write: SignalSetter<T> = (newValue: T) => {
    if (Object.is(value, newValue)) {
      return;
    }
    value = newValue;
    subscribers.forEach((sub) => dirtyEffects.add(sub));
    flushQueue();
  };

  // We can attach the name to the read function for debugging purposes.
  // This is a common pattern in reactive libraries.
  if (process.env.NODE_ENV !== 'production' && options?.name) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (read as any)._name = options.name;
  }

  return [read, write];
}
