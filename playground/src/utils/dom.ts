/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from "aided-core";

/**
 * A reusable ref callback to automatically focus an element when it's mounted.
 * @param {HTMLElement} element The element to focus.
 */
export function autofocus(element: HTMLElement) {
  // Defer the focus call to the next event loop tick.
  setTimeout(() => { // OR queueMicrotask
    // It's also good practice to check if the element is still in the DOM.
    if (document.body.contains(element)) {
      element.focus();
    }
  }, 0);
}

/**
 * Safely and idempotently injects a style block into the document head.
 * Resolves Content Security Policy (CSP) inline-style violations by auto-detecting
 * and applying active cryptographic nonces, and provides fallback instantiation
 * if standard proxy creators are blocked.
 *
 * @param styleId - Unique identifier to prevent duplicate style injections.
 * @param cssRules - The raw CSS style rules to inject.
 * @returns The injected or existing HTMLStyleElement, or null if the document context is unavailable.
 *
 * @example
 * ```typescript
 * const myStyles = `
 *   .my-component { color: var(--accent); }
 * `;
 * injectStyles("my-component-styles", myStyles);
 * ```
 */
export function injectStyles(styleId: string, cssRules: string): HTMLStyleElement | null {
  // Defensive early exit for non-browser/SSR environments
  if (typeof document === "undefined" || !document.head) {
    return null;
  }

  if (!styleId || !cssRules) {
    throw new Error("[Aided] injectStyles requires both a valid styleId and cssRules string.");
  }

  // Idempotency: Check if styles have already been appended to the head
  const existingStyle = document.getElementById(styleId) as HTMLStyleElement | null;
  if (existingStyle) {
    return existingStyle;
  }

  let styleEl: HTMLStyleElement;

  try {
    // Attempt instantiation using the fast core framework proxy helper
    styleEl = h.style(cssRules) as HTMLStyleElement;
  } catch (error) {
    console.warn(error);
    // Fallback: Use standard browser element creation if framework proxies are heavily guarded
    styleEl = document.createElement("style");
    styleEl.textContent = cssRules;
  }

  // Set standard HTML properties safely
  styleEl.id = styleId;

  // CSP Hardening: Automatically acquire and apply a cryptographic nonce if defined
  // checks global or metadata scopes commonly used by bundlers/frameworks
  const nonce = 
    (window as any).__csp_nonce || 
    document.querySelector("script[nonce]")?.getAttribute("nonce");
    
  if (nonce) {
    styleEl.setAttribute("nonce", nonce);
  }

  // Surgical DOM Append to the active head
  document.head.appendChild(styleEl);

  return styleEl;
}
