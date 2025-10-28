# The Aided Project: Core Principles & Contribution Guide

Welcome, contributor! This document is the charter for the Aided project. It codifies the principles, patterns, and practices that guide our development. Reading and understanding this document is the best way to ensure your contributions align with the project's goals and quality standards.

## 1. Core Philosophy: The "Why" Behind Aided

Aided is built on a set of core beliefs that guide every architectural decision.

*   **Performance by Default, Simplicity in API:** We implement sophisticated, optimized internals (like fine-grained reactivity and LIS-based reconciliation) so that the developer using Aided gets exceptional performance without having to think about it. The public API should always be as simple and explicit as possible.
*   **No Magic:** The library's behavior should be predictable and transparent. We avoid implicit behaviors and favor clear, functional APIs. For example, reactivity is triggered by explicitly calling a signal (`count()`), not through proxy-based magic.
*   **Robustness and Correctness First:** We prioritize building a leak-free, bug-resistant foundation. Every feature is built with memory management (`createRoot`, `onCleanup`) and error handling in mind from the start.
*   **Developer Experience is a Feature:** A great library is one that is a joy to use. We invest heavily in clear and actionable error messages, development-mode warnings, strong TypeScript support, and ergonomic APIs like the `h` helper.
*   **Lean and Dependency-Free:** The core runtime (`aided-core`) has zero third-party dependencies. This ensures it is lightweight, secure, and has a minimal footprint.

## 2. Design Patterns & Architecture

*   **Fine-Grained Reactivity:** This is our foundational paradigm. We do not use a Virtual DOM. State changes are tracked through signals, and updates are applied directly and surgically to the DOM.
*   **Render-Once Components:** Components are simple functions that run once to set up the DOM structure and reactive bindings. They do not re-render.
*   **Ownership Graph for Memory Management:** All reactive primitives (`createEffect`, `createMemo`, etc.) are created within an "owner" scope. When a scope is destroyed (via the disposer from `createRoot`), all of its children are automatically cleaned up.
*   **Declarative UI with Hyperscript (`h`):** UI is constructed using the `h` helper, a function-based approach that avoids a JSX build step. Reactive primitives (signals, memos) are passed directly as children or props, allowing the `h` helper's internal effects to create fine-grained subscriptions to the DOM.
*   **Headless Logic:** We prefer to separate complex logic from rendering components. The `createVirtualizer` is a perfect example of a "headless" engine that contains all the state and logic, while the `VirtualFor` component is a thin rendering layer on top of it.
*   **Explicit is Better than Implicit:** We prefer APIs that make their function clear. For example, we use a `key` prop in the `For` component and provide a dev warning if it's missing, rather than silently falling back to a less performant index-based key.
*   **Controlled Dependency Tracking:** The `untrack` utility allows selective disabling of reactive dependency tracking, enabling advanced patterns like component state isolation and performance optimizations.
*   **Interactive Playground:** Our comprehensive playground serves as both a learning resource and testing ground, featuring live examples, real-world patterns, component showcases, and advanced reactivity demonstrations.

## 3. Code Style & Conventions

### Language & Environment
*   **Language:** TypeScript 5.x+ with `strict` mode enabled (see `tsconfig.json`).
*   **Module System:** ES modules (`"type": "module"` in `package.json`).
*   **Target Environment:** ES2020+ (aligned with Node.js 18+ requirement).
*   **Package Manager:** Yarn 4.x with Corepack (see `CONTRIBUTING.md` for setup).

### Formatting & Linting
*   **Formatter:** Prettier with project configuration. Code should be formatted before committing.
*   **Linter:** ESLint with TypeScript support and strict ruleset:
    *   `typescript-eslint/recommended` - Core TypeScript rules
    *   `eslint-plugin-import` - Import/export validation
    *   Custom rules for reactivity patterns
*   **Quality Gates:** All code must pass `yarn lint` before commits.
*   **Editor Support:** Configure your editor to format on save and show linting errors.

### File Naming & Organization
*   **Component Files:** PascalCase (e.g., `Show.ts`, `For.ts`, `VirtualFor.ts`).
*   **Utility Files:** camelCase (e.g., `createSignal.ts`, `signal.ts`, `scheduler.ts`).
*   **Test Files:** Mirror source filename with `.test.ts` suffix (e.g., `signal.test.ts`).
*   **Type Definition Files:** PascalCase with `Types` suffix when needed (e.g., `types.ts`).
*   **Configuration Files:** Standard naming (e.g., `vite.config.ts`, `tsconfig.json`).

### Folder Structure
The `src` directory follows a concept-based organization:

```
src/
├── primitives/          # Core reactive building blocks
│   ├── signal.ts        # State management
│   ├── effect.ts        # Reactive computations
│   ├── memo.ts          # Derived values
│   ├── resource.ts      # Async data management
│   └── untrack.ts       # Dependency tracking control
├── lifecycle/           # Ownership & cleanup
│   ├── lifecycle.ts     # Root management
│   └── context.ts       # Dependency injection
├── dom/                 # DOM manipulation
│   ├── bindings.ts      # Reactive attributes/events
│   ├── render.ts        # Main rendering entry
│   └── query.ts         # DOM querying utilities
├── components/          # Structural components
│   ├── For.ts          # List rendering
│   ├── Show.ts         # Conditional rendering
│   ├── VirtualFor.ts   # Virtualized lists
│   └── Fragment.ts     # DOM grouping
└── internal/           # Private utilities
    ├── scheduler.ts    # Effect batching
    └── lis.ts          # List reconciliation
```

### TypeScript & Type Safety
*   **Strict Mode:** All TypeScript code uses strict mode for maximum type safety.
*   **Return Types:** All exported functions must have explicit return types.
*   **Type Avoidance:** Avoid `any` - use `unknown` for safe casting, `never` for impossible cases.
*   **Generic Constraints:** Use constrained generics where appropriate (e.g., `T extends object`).
*   **Utility Types:** Leverage TypeScript's utility types (`Partial`, `Pick`, `Omit`, etc.).
*   **Branded Types:** Use nominal typing for domain-specific types when needed.

### Naming Conventions
*   **Variables:** camelCase (`count`, `userName`, `isLoading`).
*   **Constants:** SCREAMING_SNAKE_CASE for global constants.
*   **Functions:** camelCase, descriptive names (`createSignal`, `renderComponent`).
*   **Classes/Types:** PascalCase (`Signal`, `Effect`, `VirtualizerOptions`).
*   **Reactive Primitives:** Descriptive names with context (`countSignal`, `userEffect`).
*   **Event Handlers:** Prefix with `handle` or `on` (`handleClick`, `onSubmit`).
*   **Boolean Props:** Prefix with `is`, `has`, `can`, `should` (`isActive`, `hasError`).

### Import/Export Patterns
*   **Barrel Exports:** Use `index.ts` files for clean public APIs (see `src/index.ts`).
*   **Import Ordering:** Group imports by type (external → internal → types).
*   **Relative Imports:** Prefer relative imports within the same package.
*   **Type Imports:** Use `import type` for type-only imports to avoid bundling overhead.
*   **Side Effects:** Avoid side-effect imports except in entry points.

### Error Handling & Logging
*   **Custom Errors:** Use `devWarning` for development-time warnings (see `src/error.ts`).
*   **Error Messages:** Provide clear, actionable error messages.
*   **Logging Levels:** Use appropriate logging for debugging (console.warn, console.error).
*   **Graceful Degradation:** Handle errors gracefully in production builds.

## 4. Testing Strategy

Our standard of quality is defined by our tests. Adhering to these testing patterns is critical for preventing regressions and ensuring reliability. See `CONTRIBUTING.md` for setup instructions and `yarn test` / `yarn coverage` commands.

### Coverage & Quality Goals
*   **100% Coverage Target:** We aim for 100% statement, branch, and function coverage for all logical files.
*   **Coverage Verification:** Use `yarn coverage` to generate reports and verify changes.
*   **Quality Gates:** All tests must pass in CI before merging (see GitHub Actions workflow).
*   **Test Categories:** Unit tests, integration tests, and DOM interaction tests.

### Core Testing Principles

#### The Golden Rule: Test Inside a Reactive Root
Any component or function that uses lifecycle features (`onCleanup`, `createEffect`) or attaches event listeners **must** be created within a `createRoot` scope for its cleanup logic to be registered. Failure to do so will result in silent failures, memory leaks, and test pollution.

```typescript
// ✅ CORRECT: Component created inside reactive root
it('should clean up correctly', () => {
  disposeRoot = createRoot(() => {
    const myComponent = h.button({ onClick: spy });
    root.appendChild(myComponent);
  });
  // ... assertions ...
});

// ❌ INCORRECT: Component created outside root
it('should fail silently', () => {
  const myComponent = h.button({ onClick: spy }); // No cleanup registration
  root.appendChild(myComponent);
  // Memory leaks and unreliable behavior
});
```

#### Asynchronous Testing Patterns
Aided's reactive updates are scheduled as microtasks. Initial renders of reactive children are therefore **asynchronous**. All tests checking reactive updates **must** be `async` and use `await tick()`.

```typescript
// ✅ CORRECT: Waits for reactive effects
it('should render reactive content', async () => {
  return createRoot(async (dispose) => {
    const el = h.p(mySignal);
    root.appendChild(el);

    await tick(); // Wait for initial effect execution
    expect(el.textContent).toBe('initial');

    mySignal.set('updated');
    await tick(); // Wait for update effect
    expect(el.textContent).toBe('updated');

    dispose();
  });
});

// ❌ INCORRECT: Synchronous assertions fail
it('should fail unexpectedly', () => {
  const el = h.p(mySignal);
  root.appendChild(el);
  expect(el.textContent).toBe('initial'); // Fails - effect hasn't run yet
});
```

### Test Structure & Isolation

#### Test Setup & Teardown
Every component test file must use `beforeEach`/`afterEach` for proper isolation:

```typescript
describe('MyComponent', () => {
  let root: HTMLElement;
  let disposeRoot: (() => void) | undefined;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    if (disposeRoot) disposeRoot(); // Clean up reactive scopes
    root.remove(); // Clean up DOM
  });

  it('should work correctly', () => {
    disposeRoot = createRoot(() => {
      // ... test implementation ...
    });
  });
});
```

#### Complex Async Test Patterns
For complex async flows within `createRoot`, use explicit Promise wrapping:

```typescript
it('should handle complex async flows', () => {
  return new Promise<void>(resolve => {
    disposeRoot = createRoot(async () => {
      // Setup reactive state
      const [state, setState] = createSignal('initial');

      // Create component
      const el = h.div(state);
      root.appendChild(el);

      // Initial render check
      await tick();
      expect(root.textContent).toBe('initial');

      // State change and re-check
      setState('updated');
      await tick();
      expect(root.textContent).toBe('updated');

      resolve(); // Signal test completion
    });
  });
});
```

### Test Categories & Patterns

#### 1. Happy Path Testing
Test that features work correctly with valid inputs:
```typescript
it('should render static content', () => {
  const el = h.div('Hello World');
  expect(el.textContent).toBe('Hello World');
});
```

#### 2. Error Path Testing
Test graceful failure handling:
```typescript
it('should handle null nodes gracefully', () => {
  expect(() => render(null, document.body)).toThrow();
});
```

#### 3. Edge Case Testing
Test boundary conditions:
```typescript
it('should handle empty arrays', () => {
  const [items] = createSignal([]);
  disposeRoot = createRoot(() => {
    const list = h.ul(For({ each: items, children: () => h.li('item') }));
    expect(list.children.length).toBe(0);
  });
});

it('should handle null/undefined values', async () => {
  const [value] = createSignal<string | null>(null);
  disposeRoot = createRoot(async () => {
    const el = h.span(value);
    root.appendChild(el);
    await tick();
    expect(el.textContent).toBe('');
  });
});
```

#### 4. Lifecycle Testing
Verify proper cleanup and memory management:
```typescript
it('should clean up event listeners', () => {
  const spy = vi.fn();
  disposeRoot = createRoot(() => {
    const btn = h.button({ onClick: spy });
    root.appendChild(btn);
  });

  // Trigger event before cleanup
  root.querySelector('button')!.click();
  expect(spy).toHaveBeenCalledTimes(1);

  // Clean up and verify listeners removed
  disposeRoot();
  root.querySelector('button')!.click();
  expect(spy).toHaveBeenCalledTimes(1); // No additional calls
});
```

### Advanced Testing Techniques

#### Mocking & Isolation
Use Vitest's mocking for external dependencies:
```typescript
it('should handle async resources', async () => {
  const mockFetcher = vi.fn().mockResolvedValue('data');
  disposeRoot = createRoot(async () => {
    const resource = createResource(createSignal(true), mockFetcher);
    await tick();
    expect(resource()).toBe('data');
  });
});
```

#### DOM Testing Utilities
Custom helpers for DOM verification:
```typescript
function expectTextContent(element: Element, expected: string) {
  expect(element.textContent?.trim()).toBe(expected);
}

function expectClass(element: Element, className: string, present = true) {
  const hasClass = element.classList.contains(className);
  expect(hasClass).toBe(present);
}
```

#### Performance Testing
Basic performance assertions:
```typescript
it('should render large lists efficiently', () => {
  const startTime = performance.now();
  const largeList = Array.from({ length: 1000 }, (_, i) => i);

  disposeRoot = createRoot(() => {
    const list = h.ul(
      For({
        each: createSignal(largeList),
        children: (item) => h.li(item.toString())
      })
    );
  });

  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
});
```

### Development-Mode Testing
Test warnings and errors that only appear in development:
```typescript
it('should warn about effects outside root', () => {
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  // This should trigger a warning
  createEffect(() => { /* ... */ });

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('createEffect was called outside of a reactive root')
  );

  consoleSpy.mockRestore();
});
```

### CI/CD Integration
- **Automated Testing:** All tests run on every PR via GitHub Actions
- **Coverage Reports:** Coverage badges update automatically
- **Quality Gates:** PRs blocked if tests fail or coverage drops
- **Parallel Execution:** Tests run in parallel for faster feedback

### Testing Best Practices
- **Descriptive Names:** Test names should clearly describe what they verify
- **Single Responsibility:** Each test should verify one specific behavior
- **Independent Tests:** Tests should not depend on each other
- **Fast Execution:** Keep tests fast to maintain quick feedback loops
- **Realistic Scenarios:** Test real usage patterns, not just implementation details

## 5. Commit Convention

We follow the **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)** specification. This is mandatory as it helps us automate releases and generate changelogs.

*   **Format:** `<type>(<scope>): <subject>`
*   **Common Types:**
    *   `feat`: A new feature (e.g., adding the `h` helper).
    *   `fix`: A bug fix (e.g., fixing the LIS algorithm).
    *   `refactor`: A code change that neither fixes a bug nor adds a feature (e.g., renaming the project).
    *   `test`: Adding missing tests or correcting existing tests.
    *   `docs`: Documentation only changes.
    *   `chore`: Changes to the build process or auxiliary tools.
*   **Scope:** The package or area of the codebase affected (e.g., `core`, `components`, `dom`, `dx`).
*   **Subject:** A short, imperative summary of the change (e.g., "add key prop to For component").
*   **Body:** Provide a detailed explanation of the "what" and "why" for any significant change.

By adhering to these principles, we can ensure that Aided remains a high-quality, performant, and maintainable library that is a pleasure to both use and contribute to.
