import type { Properties as CSSProperties } from 'csstype';
import { createEffect } from '../primitives/effect';
import { onCleanup } from '../lifecycle/lifecycle';
import type { SignalGetter, SignalSetter } from '../types';

/**
 * Binds a signal to the textContent of a DOM element.
 * Automatically updates the element's text content when the signal changes.
 *
 * @param element The DOM element to update
 * @param signal A signal whose value will be converted to string and set as textContent
 *
 * @example
 * ```typescript
 * const [message, setMessage] = createSignal('Hello');
 * const div = document.createElement('div');
 * bindText(div, message); // div.textContent = 'Hello'
 * setMessage('World');    // div.textContent = 'World'
 * ```
 */
export function bindText<T>(element: Node, signal: SignalGetter<T>): void {
  createEffect(() => {
    const value = signal();
    element.textContent = value === null || value === undefined ? '' : String(value);
  });
}

/**
 * Binds a signal to an attribute of a DOM element.
 * Automatically updates the attribute when the signal changes.
 * Removes the attribute when the signal value is null, undefined, or false.
 *
 * @param element The DOM element to update
 * @param attributeName The name of the attribute to bind
 * @param signal A signal whose value will be set as the attribute value
 *
 * @example
 * ```typescript
 * const [isDisabled, setDisabled] = createSignal(false);
 * const button = document.createElement('button');
 * bindAttr(button, 'disabled', () => isDisabled() || null);
 * // When isDisabled is true: <button disabled>
 * // When isDisabled is false/null: <button>
 * ```
 */
export function bindAttr<T>(element: Element, attributeName: string, signal: SignalGetter<T>): void {
  createEffect(() => {
    const value = signal();
    if (value === null || value === undefined || value === false) {
      element.removeAttribute(attributeName);
    } else {
      element.setAttribute(attributeName, String(value));
    }
  });
}

/**
 * Attaches an event listener to a DOM element with type-safe event objects.
 * The listener is automatically removed when the current reactive owner is disposed,
 * preventing memory leaks.
 *
 * @param element The DOM element to attach the listener to
 * @param eventName The name of the event (e.g., 'click', 'input', 'change')
 * @param handler The function to run when the event is triggered
 *
 * @example
 * ```typescript
 * const button = document.createElement('button');
 * const [count, setCount] = createSignal(0);
 *
 * createRoot(() => {
 *   bindEvent(button, 'click', () => setCount(count() + 1));
 *   // Listener is automatically removed when root is disposed
 * });
 * ```
 */
export function bindEvent<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void
): void {
  // Create a wrapper listener that includes our error handling.
  const listener = (ev: Event) => {
    try {
      // We call the user's handler, casting the generic Event to the specific type.
      handler(ev as HTMLElementEventMap[K]);
    } catch (err) {
      // Catch any errors and log them, preventing them from crashing the app.
      console.error(`Error in event handler for ${eventName}:`, err);
    }
  };

  element.addEventListener(eventName, listener);

  onCleanup(() => {
    element.removeEventListener(eventName, listener);
  });
}

/**
 * A map of class names to boolean signals.
 * If the signal's value is true, the class is added; otherwise, it's removed.
 */
type ClassListMap = {
  [key: string]: SignalGetter<boolean>;
};

/**
 * Reactively toggles CSS classes on an element based on boolean signals or static values.
 * Classes are added when the value is truthy and removed when falsy.
 *
 * @param element The DOM element to apply classes to
 * @param classMap An object where keys are class names and values are boolean signals or static booleans
 *
 * @example
 * ```typescript
 * const [isActive, setActive] = createSignal(true);
 * const [isLarge] = createSignal(false);
 * const div = document.createElement('div');
 *
 * bindClassList(div, {
 *   active: isActive,      // Reactive: added/removed based on signal
 *   large: () => isLarge(), // Reactive: computed value
 *   static: true           // Static: always present
 * });
 * // Result: <div class="active static">
 * ```
 */
export function bindClassList(element: Element, classMap: ClassListMap): void {
  for (const className in classMap) {
    const value = classMap[className];

    if (typeof value === 'function') {
      // It's a signal, so create a reactive effect.
      createEffect(() => {
        const shouldHaveClass = !!value();
        element.classList.toggle(className, shouldHaveClass);
      });
    } else {
      // It's a static boolean, so just set it once.
      // This is more efficient as it avoids creating an unnecessary effect.
      element.classList.toggle(className, !!value);
    }
  }
}

/**
 * A map of CSS properties to signals.
 * The signal's value will be applied as the style property.
 */
type StyleMap = {
  [K in keyof CSSProperties]: SignalGetter<CSSProperties[K]>;
};

/**
 * Reactively updates individual CSS style properties on an element.
 * Supports both static values and reactive signals for each style property.
 *
 * @param element The HTMLElement to apply styles to
 * @param styleMap An object where keys are CSS property names and values are signals or static values
 *
 * @example
 * ```typescript
 * const [color, setColor] = createSignal('red');
 * const div = document.createElement('div');
 *
 * bindStyle(div, {
 *   color: color,              // Reactive: changes with signal
 *   fontSize: '16px',          // Static: constant value
 *   backgroundColor: () => color() === 'red' ? 'lightcoral' : 'lightblue'
 * });
 * ```
 */
export function bindStyle(element: HTMLElement, styleMap: Partial<StyleMap>): void {
  // Use Object.keys for safer iteration over own properties
  for (const propName of Object.keys(styleMap)) {
    // Type assertion to tell TypeScript that propName is a valid key
    const key = propName as keyof StyleMap;
    const valueOrSignal = styleMap[key];

    // THE FIX for the 'undefined' error:
    // Ensure the valueOrSignal actually exists.
    if (valueOrSignal) {
      if (typeof valueOrSignal === 'function') {
        createEffect(() => {
          const value = valueOrSignal();
          // THE FIX for the 'any' error:
          // Use a more specific assertion. This tells TypeScript to treat the style
          // object as a plain object with a string index signature.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (element.style as Record<string, any>)[key] = value ?? '';
        });
      } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (element.style as Record<string, any>)[key] = valueOrSignal;
      }
    }
  }
}

/**
 * Creates a two-way binding between a form input and a signal.
 * Updates the signal when the input value changes, and updates the input value
 * when the signal changes. Handles different input types (text, checkbox, radio, select).
 *
 * @param element The input, textarea, or select element to bind
 * @param signal A tuple of [getter, setter] for the signal to bind to
 *
 * @example
 * ```typescript
 * const [name, setName] = createSignal('');
 * const input = document.createElement('input');
 *
 * Model(input, [name, setName]);
 * // Now input.value and name() stay in sync
 *
 * // For checkboxes
 * const [checked, setChecked] = createSignal(false);
 * const checkbox = document.createElement('input');
 * checkbox.type = 'checkbox';
 * Model(checkbox, [checked, setChecked]);
 * ```
 */
export function Model<T>(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  signal: [SignalGetter<T>, SignalSetter<T>]
): void {
  const [get, set] = signal;

  // --- Update the input when the signal changes ---
  createEffect(() => {
    const value = get();
    if (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio')) {
      element.checked = !!value;
    } else if (element.value !== String(value ?? '')) {
      // Avoid resetting the cursor position if the value is already the same
      element.value = String(value ?? '');
    }
  });

  // --- Update the signal when the input changes ---
  const onInput = () => {
    if (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio')) {
      (set as SignalSetter<boolean>)(element.checked);
    } else {
      (set as SignalSetter<string>)(element.value);
    }
  };

  bindEvent(element, 'input', onInput);
  // Also listen to 'change' for elements like checkboxes
  bindEvent(element, 'change', onInput);
}
