/* eslint-disable @typescript-eslint/no-explicit-any */
import { bindEvent, bindAttr, bindClassList, bindStyle } from './dom/bindings';
import { createEffect } from './primitives/effect';
import type { SignalGetter } from './types';

type Child = Node | string | number | SignalGetter<any> | (() => Node);

function processChild(child: Child): Node {
  if (child instanceof Node) {
    return child;
  }
  // Check if it's a function (could be a signal or a memo)
  if (typeof child === 'function') {
    const textNode = document.createTextNode('');
    // Use createEffect directly for text binding to avoid circular dependencies if h is used inside a binder
    createEffect(() => {
      const value = (child as SignalGetter<any>)();
      textNode.textContent = value === null || value === undefined ? '' : String(value);
    });
    return textNode;
  }
  // For static strings and numbers
  return document.createTextNode(String(child));
}

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
              el.setAttribute(key, String(value));
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

export const h = new Proxy({}, {
  get(_target, prop: string) {
    return hyperscript(prop);
  }
}) as Record<string, (...args: any[]) => HTMLElement>;
