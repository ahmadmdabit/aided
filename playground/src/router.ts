// playground/src/router.ts
import { createSignal } from 'aided-core';

// Store current path reactively
const [currentPath, setCurrentPath] = createSignal(window.location.pathname);

// Sync path reactively on browser back/forward (popstate event)
window.addEventListener('popstate', () => {
  setCurrentPath(window.location.pathname);
});

/**
 * Perform a clean, non-reloading client-side SPA navigation
 */
export function navigate(to: string) {
  window.history.pushState({}, '', to);
  setCurrentPath(to);
}

export { currentPath };
