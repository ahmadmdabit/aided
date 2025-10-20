import type { Properties as CSSProperties } from 'csstype';
import { createEffect } from '../primitives/effect';
import { onCleanup } from '../lifecycle/lifecycle';
import type { SignalGetter, SignalSetter } from '../types';

/**
 * Binds a signal to the textContent of a DOM element.
 * This is a side effect, so it should be run within a root or an effect.
 *
 * @param element The DOM element to update.
 * @param signal A signal whose value will be set as the textContent.
 */
export function bindText<T>(element: Node, signal: SignalGetter<T>): void {
  createEffect(() => {
    const value = signal();
    element.textContent = value === null || value === undefined ? '' : String(value);
  });
}

/**
 * Binds a signal to an attribute of a DOM element.
 *
 * @param element The DOM element to update.
 * @param attributeName The name of the attribute to bind.
 * @param signal A signal whose value will be set as the attribute.
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
 * The handler is automatically cleaned up when the owner scope is disposed.
 *
 * @param element The DOM element to attach the listener to.
 * @param eventName The name of the event (e.g., 'click').
 * @param handler The function to run when the event is triggered.
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
 * Reactively toggles CSS classes on an element based on boolean signals.
 *
 * @param element The DOM element to apply classes to.
 * @param classMap An object where keys are class names and values are boolean signals.
 */
export function bindClassList(element: Element, classMap: ClassListMap): void {
  for (const className in classMap) {
    createEffect(() => {
      const shouldHaveClass = !!classMap[className]();
      element.classList.toggle(className, shouldHaveClass);
    });
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
 *
 * @param element The HTMLElement to apply styles to.
 * @param styleMap An object where keys are CSS property names and values are signals.
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
 * when the signal changes.
 *
 * @param element The input, textarea, or select element.
 * @param signal The signal to bind to.
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
