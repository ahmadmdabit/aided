/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random email address
 */
export function generateRandomEmail(): string {
  return `test-${generateRandomString(8)}@example.com`;
}

/**
 * Generate a random task description
 */
export function generateRandomTask(): string {
  const tasks = [
    'Learn Aided',
    'Build a cool app',
    'Publish to NPM',
    'Write documentation',
    'Add tests',
    'Optimize performance',
    'Fix bugs',
    'Review code'
  ];
  return tasks[Math.floor(Math.random() * tasks.length)];
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Wait for dev server to be ready
 * Note: This is a placeholder for CI scripts using wait-on package
 * TestCafe tests use fixture.page() which automatically waits for page load
 */
export async function waitForDevServer(
  url: string,
  timeout: number = 30000
): Promise<void> {
  // This function is called from CI scripts using wait-on CLI tool
  // Example: npx wait-on http://localhost:5173 --timeout 30000
  // TestCafe tests don't need explicit server waiting - they use fixture.page() which waits automatically
  console.log(`Waiting for dev server at ${url} (timeout: ${timeout}ms)`);
}
