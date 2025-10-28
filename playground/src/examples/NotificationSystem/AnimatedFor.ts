import { For, createEffect, onCleanup, type SignalGetter } from 'aided-core';

// 1. Define the props interface using a generic type parameter `T`.
// `T` will represent the type of a single item in the array (e.g., Notification).
export interface AnimatedForProps<T> {
  /** The reactive list of items to render. */
  each: SignalGetter<T[]>;

  /** A function that returns a unique and stable key for each item. */
  key: (item: T) => string | number;

  /**
   * A render-prop function that receives a signal for each item
   * and must return an HTMLElement.
   */
  children: (item: SignalGetter<T>) => HTMLElement;

  /** The CSS class to apply to an element when it enters. */
  enterClass: string;

  /** The CSS class to apply to an element when it leaves. */
  leaveClass: string;

  /**
   * The duration of the leave animation in milliseconds.
   * This must match the duration in your CSS.
   */
  animationDuration: number;
}

/**
 * A generic, animated list-rendering component. It wraps the `For`
 * component to provide enter and leave animations via CSS classes.
 */
export function AnimatedFor<T>(props: AnimatedForProps<T>) {
  const { each, key, children, enterClass, leaveClass, animationDuration } = props;

  return For({
    each: each,
    key: key,
    children: (item) => {// The `item` is correctly typed here
      // `children` is called, and `element` is correctly inferred as HTMLElement
      
      // 1. Render the actual child content.
      const element = children(item);

      // 2. Create an effect to handle the enter animation.
      createEffect(() => {
        // Add the enter class.
        element.classList.add(enterClass);

        // Use requestAnimationFrame to ensure the class is applied after the
        // element is in the DOM, allowing the transition to trigger.
        requestAnimationFrame(() => {
          element.classList.remove(enterClass);
        });
      });

      // 3. Handle the leave animation using onCleanup.
      onCleanup(() => {
        // This cleanup function runs when Aided wants to remove the element.
        // Instead of letting it be removed instantly, we intercept the process.

        // a. Add the leave class to trigger the exit animation.
        element.classList.add(leaveClass);

        // b. Set a timeout to remove the element from the DOM *after*
        // the animation has finished.
        setTimeout(() => {
          element.remove();
        }, animationDuration);
      });

      return element;
    }
  });
}