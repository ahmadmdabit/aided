/**
 * A custom error class for all errors thrown by the Aided library.
 * This allows users to easily identify and filter for errors originating from Aided.
 *
 * @param message The error message.
 * @param code An optional error code for programmatic handling.
 */
export class AidedError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'AidedError';
  }
}

/**
 * A development-mode-only warning function.
 * These warnings will be stripped out in production builds.
 *
 * @param condition The condition to check. If false, the warning is logged.
 * @param message The warning message to log to the console.
 */
export function devWarning(condition: boolean, message: string): void {
  // This block will be removed by bundlers like Vite in production mode
  // when `process.env.NODE_ENV` is replaced with `"production"`.
  if (process.env.NODE_ENV !== 'production') {
    if (condition) return;
    console.warn(`[Aided Warning] ${message}`);
  }
}
