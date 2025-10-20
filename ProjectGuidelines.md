# The Aided Project: Core Principles & Contribution Guide

Welcome, contributor! This document is the charter for the Aided project. It codifies the principles, patterns, and practices that guide our development. Reading and understanding this document is the best way to ensure your contributions align with the project's goals and quality standards.

## 1. Core Philosophy: The "Why" Behind Aided

Aided is built on a set of core beliefs that guide every architectural decision.

*   **Performance by Default, Simplicity in API:** We implement sophisticated, optimized internals (like fine-grained reactivity and LIS-based reconciliation) so that the developer using Aided gets exceptional performance without having to think about it. The public API should always be as simple and explicit as possible.
*   **No Magic:** The library's behavior should be predictable and transparent. We avoid implicit behaviors and favor clear, functional APIs. For example, reactivity is triggered by explicitly calling a signal (`count()`), not through proxy-based magic.
*   **Robustness and Correctness First:** We prioritize building a leak-free, bug-resistant foundation. Every feature is built with memory management (`createRoot`, `onCleanup`) and error handling in mind from the start.
*   **Developer Experience is a Feature:** A great library is one that is a joy to use. We invest heavily in clear and actionable error messages, development-mode warnings, strong TypeScript support, and ergonomic APIs like the `h` helper.
*   **Lean and Dependency-Free:** The core runtime (`@aided/core`) has zero third-party dependencies. This ensures it is lightweight, secure, and has a minimal footprint.

## 2. Design Patterns & Architecture

*   **Fine-Grained Reactivity:** This is our foundational paradigm. We do not use a Virtual DOM. State changes are tracked through signals, and updates are applied directly and surgically to the DOM.
*   **Render-Once Components:** Components are simple functions that run once to set up the DOM structure and reactive bindings. They are not re-rendered.
*   **Ownership Graph for Memory Management:** All reactive primitives (`createEffect`, `createMemo`, etc.) are created within an "owner" scope. When a scope is destroyed (via the disposer from `createRoot`), all of its children are automatically cleaned up. **Every effect must be associated with a root.**
*   **Headless Logic:** We prefer to separate complex logic from rendering components. The `createVirtualizer` is a perfect example of a "headless" engine that contains all the state and logic, while the `VirtualFor` component is a thin rendering layer on top of it.
*   **Explicit is Better than Implicit:** We prefer APIs that make their function clear. For example, we use a `key` prop in the `For` component and provide a dev warning if it's missing, rather than silently falling back to a less performant index-based key.

## 3. Code Style & Conventions

*   **Language:** TypeScript (`strict` mode enabled).
*   **Formatting:** We use Prettier (or an equivalent like the `.editorconfig`) to ensure consistent formatting. Code should be formatted before committing.
*   **Linting:** We use ESLint with a strict ruleset (`typescript-eslint/recommended`, `eslint-plugin-import`) to enforce code quality and prevent common bugs like phantom dependencies. All code must pass the linter (`yarn lint`).
*   **File Naming:**
    *   Component files (e.g., `Show`, `For`) are named in **PascalCase**: `Show.ts`.
    *   All other source files are named in **camelCase**: `createSignal.ts` or `signal.ts`.
    *   Test files mirror the name of the file they are testing: `signal.test.ts`.
*   **Folder Structure:** The `src` directory is organized by concept:
    *   `primitives`: The core reactive building blocks.
    *   `lifecycle`: Ownership, cleanup, and context.
    *   `dom`: DOM-specific rendering and binding.
    *   `components`: High-level structural components.
    *   `internal`: Low-level utilities not exposed to the user (like `scheduler.ts`).
*   **Types:** All exported functions must have explicit return types. Avoid the use of `any` wherever possible; use `unknown` for type-safe casting when necessary.

## 4. Testing Strategy

Our standard of quality is defined by our tests.

*   **100% Coverage Goal:** We aim for 100% statement, branch, and function coverage for all logical files in the core library. Use `yarn coverage` to verify your changes.
*   **Test Granularity:** Every feature should have tests for:
    1.  **The "Happy Path":** Does it work correctly with valid inputs?
    2.  **Error Paths:** Does it fail gracefully with invalid inputs? (e.g., `render` with a `null` node).
    3.  **Edge Cases:** What happens with empty arrays, `null`/`undefined` values, or zero values?
    4.  **Lifecycle:** Does it clean up after itself? Every test that creates a reactive scope should use `createRoot` and call its disposer.
*   **Asynchronous Testing:** Use `async/await` and helpers like `tick()` for testing reactive updates. For complex async logic (like workers), use `vi.mock` to create predictable, controllable tests.
*   **Warnings and Errors:** All development-mode warnings and custom errors must have a corresponding test to ensure they fire under the correct conditions.

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
