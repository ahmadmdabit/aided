/* eslint-disable @typescript-eslint/no-explicit-any */
import { bindEvent, bindAttr, bindClassList, bindStyle, URL_ATTRS, DANGEROUS_PROTOCOL } from './dom/bindings';
import { createEffect } from './primitives/effect';
import { devWarning } from './error';
import type { SignalGetter } from './types';

/**
 * Represents a child element that can be rendered in the DOM.
 * Can be a static value (Node, string, number) or a reactive value (signal, memo).
 */
type Child = Node | string | number | SignalGetter<any> | (() => Node);

/**
 * Processes a child element, handling both static and reactive values.
 *
 * For static values (Node, string, number), returns the appropriate DOM node immediately.
 * For reactive values (signals/memos), creates an effect that tracks changes and updates
 * the DOM automatically.
 *
 * @param child - The child to process
 * @returns A DOM Node that can be appended to the document
 *
 * @example
 * ```typescript
 * // Static children
 * processChild("Hello") // → Text node with "Hello"
 * processChild(document.createElement('div')) // → The div element
 *
 * // Reactive children
 * const [count] = createSignal(0)
 * processChild(count) // → Text node that updates when count changes
 * ```
 */
function processChild(child: Child): Node {
  // 1. Static nodes are returned directly.
  if (child instanceof Node) {
    return child;
  }

  // 2. Handle reactive functions (signals/memos).
  if (typeof child === 'function') {
    // --- THE FIX: Synchronous Initial Render ---
    const initialValue = (child as SignalGetter<any>)();
    let currentRenderedNode: Node;

    // a. Create the initial node synchronously based on the first value.
    if (initialValue instanceof Node) {
      currentRenderedNode = initialValue;
    } else {
      const textValue = initialValue === null || initialValue === undefined ? '' : String(initialValue);
      currentRenderedNode = document.createTextNode(textValue);
    }

    // b. Create an effect for subsequent updates only.
    createEffect(() => {
      const value = (child as SignalGetter<any>)();
      const parent = currentRenderedNode.parentNode;

      // Skip the first run if it's the same as the initial value, or handle updates.
      // This is a micro-optimization; the main logic handles replacement correctly.

      if (value instanceof Node) {
        if (currentRenderedNode !== value) {
          parent?.replaceChild(value, currentRenderedNode);
          currentRenderedNode = value;
        }
      } else {
        const textValue = value === null || value === undefined ? '' : String(value);
        if (currentRenderedNode instanceof Text) {
          if (currentRenderedNode.textContent !== textValue) {
            currentRenderedNode.textContent = textValue;
          }
        } else {
          const textNode = document.createTextNode(textValue);
          parent?.replaceChild(textNode, currentRenderedNode);
          currentRenderedNode = textNode;
        }
      }
    });

    return currentRenderedNode;
  }

  // 3. Handle static primitives.
  return document.createTextNode(String(child));
}

/**
 * Creates a hyperscript function for a specific HTML tag.
 *
 * The returned function accepts attributes/properties as the first argument (if it's an object)
 * and children as subsequent arguments. It handles reactive attributes and children automatically.
 *
 * @param tag - The HTML tag name (e.g., 'div', 'span', 'button')
 * @returns A function that creates HTMLElement instances with the specified tag
 *
 * @example
 * ```typescript
 * const div = hyperscript('div');
 *
 * // Create a div with attributes and children
 * const element = div(
 *   { class: 'container', id: 'main' },
 *   'Hello ',
 *   createSignal('World') // Reactive child
 * );
 * ```
 */
function hyperscript(tag: string) {
  return (...args: any[]): HTMLElement => {
    const el = document.createElement(tag);
    let ref: ((el: Element) => void) | undefined;

    for (const arg of args) {
      if (Array.isArray(arg)) {
        arg.forEach(child => el.appendChild(processChild(child)));
      } else if (typeof arg === 'object' && arg !== null && !(arg instanceof Node)) {
        // This is the attributes object
        for (const key in arg) {
          const value = arg[key];
          if (key === 'ref') {
            ref = value;
            continue; // Don't process ref as a normal attribute
          }
          if (key.startsWith('on')) {
            const eventName = key.substring(2).toLowerCase();
            bindEvent(el, eventName as any, value);
          } else if (key === 'classList') {
            // Special handling for classList
            bindClassList(el, value);
          } else if (key === 'style') {
            // Special handling for style object
            if (typeof value === 'object') {
              // Check if any style properties are signals
              const isReactive = Object.values(value).some(v => typeof v === 'function');
              if (isReactive) {
                bindStyle(el, value);
              } else {
                // It's a static style object
                Object.assign(el.style, value);
              }
            } else {
              // It's a static style string
              el.setAttribute('style', value);
            }
          } else {
            // Handle all other attributes
            if (typeof value === 'function') {
              bindAttr(el, key, value);
            } else {
              const strValue = String(value);
              const lowerKey = key.toLowerCase();

              // Security: Block dangerous URL protocols on static attributes
              if (URL_ATTRS.has(lowerKey) && DANGEROUS_PROTOCOL.test(strValue)) {
                throw new Error(
                  `Security: Dangerous protocol detected in '${key}' attribute. ` +
                  `Executable protocols like 'javascript:', 'vbscript:', and 'data:' are blocked.`
                );
              }

              el.setAttribute(key, strValue);
            }
          }
        }
      } else {
        el.appendChild(processChild(arg as Child));
      }
    }

    if (ref) {
      ref(el);
    }
    return el;
  };
}

// Valid tag name pattern: starts with letter, contains letters/numbers/hyphens
const VALID_TAG_PATTERN = /^[a-zA-Z][a-zA-Z0-9-]*$/;

// Tags that pose security risks (XSS, clickjacking, data exfiltration)
const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'base', 'meta', 'link', 'object', 'embed'
]);

// Properties that must be strictly blocked to prevent prototype pollution/escapes
const STRICTLY_BLOCKED = new Set(['constructor', 'prototype', '__proto__']);

/**
 * The main hyperscript helper for creating DOM elements with reactive capabilities.
 *
 * This is a proxy object that provides methods for every HTML tag. Each method
 * returns a function that creates HTMLElement instances with reactive attributes
 * and children.
 *
 * @example
 * ```typescript
 * import { h, createSignal } from 'aided-core';
 *
 * const [count, setCount] = createSignal(0);
 *
 * // Create reactive elements
 * const button = h.button(
 *   {
 *     onClick: () => setCount(count() + 1),
 *     class: () => count() > 5 ? 'active' : 'inactive'
 *   },
 *   'Count: ', count // Reactive child
 * );
 * ```
 */
export const h = new Proxy({}, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;

    // 1. Opt-in namespace for dangerous tags
    if (prop === 'dangerous') {
      return new Proxy({}, {
        get(_, dangerousProp: string | symbol) {
          if (typeof dangerousProp !== 'string') return undefined;
          if (STRICTLY_BLOCKED.has(dangerousProp)) {
            throw new Error(`Security: Cannot access '${dangerousProp}'.`);
          }
          if (DANGEROUS_TAGS.has(dangerousProp) || VALID_TAG_PATTERN.test(dangerousProp)) {
            devWarning(
              false,
              `Using h.dangerous.${dangerousProp}() bypasses security filters. Ensure all attributes and children are strictly sanitized.`
            );
            return hyperscript(dangerousProp);
          }
          throw new Error(`Invalid tag name '${dangerousProp}'. Tag names must start with a letter and contain only letters, numbers, and hyphens.`);
        }
      });
    }

    // 2. Strictly block prototype escapes
    if (STRICTLY_BLOCKED.has(prop)) {
      throw new Error(`Security: Cannot access '${prop}'.`);
    }

    // 3. Block dangerous tags in the standard namespace
    if (DANGEROUS_TAGS.has(prop)) {
      throw new Error(
        `Security: Cannot create '${prop}' element. ` +
        `This tag is blocked by default. Use h.dangerous.${prop}() if you explicitly need it and have sanitized the inputs.`
      );
    }

    // 4. Validate tag name format
    if (!VALID_TAG_PATTERN.test(prop)) {
      throw new Error(
        `Invalid tag name '${prop}'. ` +
        `Tag names must start with a letter and contain only letters, numbers, and hyphens.`
      );
    }

    return hyperscript(prop);
  }
}) as Record<string, (...args: any[]) => HTMLElement> & { dangerous: Record<string, (...args: any[]) => HTMLElement> };
