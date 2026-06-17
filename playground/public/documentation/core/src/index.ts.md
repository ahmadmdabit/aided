# index.ts

## Purpose

Main entry point that exports the complete public API for the Aided reactive UI library.

## Exported Categories

### Core Reactivity Primitives

- `createSignal` - Create reactive state
- `createEffect` - Run side effects on state changes
- `createMemo` - Create derived computed values
- `untrack` - Read signals without tracking dependencies
- `createResource` - Manage async data loading
- `longestIncreasingSubsequenceAsync` - Async LIS algorithm

### Configuration & Utilities

- `configureLIS` - Configure LIS algorithm settings

### Lifecycle & Context Management

- `createRoot` - Create reactive root context
- `onCleanup` - Register cleanup callbacks
- `hasOwner` - Check if reactive owner exists
- `provide` / `inject` / `useContext` - Context API
- `createContext` - Create context object

### Performance Profiling

- `enableProfiler` - Enable/disable effect profiling
- `getProfilerReport` - Get profiling report with effect execution times
- `isProfilerEnabled` - Check if profiling is enabled

### DOM Manipulation & Rendering

- `render` - Render component to DOM
- `bindText`, `bindAttr`, `bindEvent`, `bindClassList`, `bindStyle`, `Model` - DOM bindings
- `scopeQuery` - Scoped DOM queries

### Structural Components (Control Flow)

- `Show` - Conditional rendering
- `For` - List rendering with keyed reconciliation
- `VirtualFor` - Virtualized list rendering for large lists
- `createVirtualizer` - Custom virtualizer for headless lists
- `Fragment` - Group elements without wrapper
- `Portal` - Render to different DOM location

### Utilities

- `h` - Hyperscript helper for creating elements
- `AidedError` - Custom error class for Aided-specific errors

### Type Definitions

- All types exported from types.ts
- SignalGetter, SignalSetter, Memo, Resource, Context, Attribute, etc.

## Usage Example

```typescript
import {
  createSignal,
  createEffect,
  render,
  h,
  createRoot,
  onCleanup,
} from "aided-core";

// Create reactive state
const [count, setCount] = createSignal(0);

// Create effect
createEffect(() => {
  console.log("Count changed to:", count());
});

// Render component
const App = () => {
  const [message, setMessage] = createSignal("Hello");

  return h(
    "div",
    {},
    h(
      "button",
      {
        onClick: () => setCount(count() + 1),
      },
      "Count: ",
      count,
    ),
    h("p", {}, message()),
  );
};

render(App, document.getElementById("app")!);
```

## Key Concepts

- **Single import point**: One import for entire library
- **Organized by category**: Logical grouping of related exports
- **Re-export pattern**: Modules re-export from internal files
- **Type exports**: All types available for TypeScript
- **Complete API**: No hidden imports required

## Export Structure

### Core Primitives

```typescript
// primitives/signal.ts
export { createSignal } from "./primitives/signal";

// primitives/effect.ts
export { createEffect } from "./primitives/effect";

// primitives/memo.ts
export { createMemo } from "./primitives/memo";

// primitives/untrack.ts
export { untrack } from "./primitives/untrack";

// primitives/resource.ts
export { createResource } from "./primitives/resource";
export type { FetcherInfo } from "./primitives/resource";

// primitives/lisAsync.ts
export { longestIncreasingSubsequenceAsync } from "./primitives/lisAsync";
```

### Configuration

```typescript
// internal/lis.ts
export { configureLIS } from "./internal/lis";
```

### Lifecycle

```typescript
// lifecycle/lifecycle.ts
export {
  createRoot,
  onCleanup,
  hasOwner,
  provide,
  inject,
} from "./lifecycle/lifecycle";
export { inject as useContext } from "./lifecycle/lifecycle"; // Alias

// lifecycle/context.ts
export { createContext } from "./lifecycle/context";
```

### Profiling

```typescript
// internal/profiler.ts
export { enableProfiler, getProfilerReport } from "./internal/profiler";
export type { ProfilerReport } from "./internal/profiler";
```

### DOM

```typescript
// dom/render.ts
export { render } from "./dom/render";

// dom/bindings.ts
export {
  bindText,
  bindAttr,
  bindEvent,
  bindClassList,
  bindStyle,
  Model,
} from "./dom/bindings";

// dom/query.ts
export { scopeQuery } from "./dom/query";
```

### Components

```typescript
// components/Show.ts
export { Show } from "./components/Show";

// components/For.ts
export { For } from "./components/For";

// components/VirtualFor.ts
export { VirtualFor } from "./components/VirtualFor";

// components/virtualizer.ts
export { createVirtualizer } from "./components/virtualizer";

// components/Fragment.ts
export { Fragment } from "./components/Fragment";

// components/Portal.ts
export { Portal } from "./components/Portal";
```

### Utilities

```typescript
// h.ts
export { h } from "./h";

// error.ts
export { AidedError } from "./error";
```

### Types

```typescript
// types.ts
export * from "./types";
```

## Development Practices

### Import Patterns

**Full API**:

```typescript
import { createSignal, createEffect, h } from "aided-core";
```

**Specific items**:

```typescript
import { createSignal } from "aided-core";
import { createEffect } from "aided-core";
```

**Namespace import**:

```typescript
import * as Aided from "aided-core";
Aided.createSignal(0);
```

### Type Imports

**Type-only imports**:

```typescript
import type { SignalGetter, SignalSetter } from "aided-core";

const mySignal: SignalGetter<number> = () => 42;
```

**Mixed imports**:

```typescript
import type { SignalGetter } from "aided-core";
import { createSignal } from "aided-core";

const [value, setValue] = createSignal(0);
```

## Versioning

### API Stability

- All exports from index.ts are stable
- Internal modules may change without notice
- Use index.ts for all imports

### Breaking Changes

- Will be documented in changelog
- Major version increment
- May include: API changes, type changes, exports added/removed

## Migration Guide

### From other libraries

- Aided's API is inspired by SolidJS, Preact, and React
- Similar patterns to other libraries
- Key differences: manual cleanup, owner-based reactivity

### Recommended patterns

- Always use index.ts for imports
- Don't import internal modules directly
- Use provided types for TypeScript
- Follow Aided's reactivity patterns

## Test Coverage

Expected: 100% coverage for all exported functions and types
