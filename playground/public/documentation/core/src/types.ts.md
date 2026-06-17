# types.ts

**Purpose**: Core TypeScript type definitions for Aided library, establishing the foundation for reactive primitives.

## Key Types

### Disposer

```typescript
type Disposer = () => void;
```

Function to clean up subscriptions or effects. Returned by reactive primitives to allow manual cleanup.

**Usage**:

```typescript
const dispose = createRoot(() => {
  createEffect(() => {
    console.log("Running effect");
  });
});

// Manual cleanup
dispose();
```

### SignalGetter<T>

```typescript
type SignalGetter<T> = () => T;
```

Read-only signal that tracks dependencies when called within an effect. Returns the current value and subscribes to changes.

**Usage**:

```typescript
const [count, setCount] = createSignal(0);

// Read value
console.log(count()); // 0

// In effect, tracks dependency
createEffect(() => {
  console.log("Count:", count()); // Tracks count as dependency
});
```

### SignalSetter<T>

```typescript
type SignalSetter<T> = (newValue: T) => void;
```

Updates signal value and notifies all dependent effects.

**Usage**:

```typescript
const [count, setCount] = createSignal(0);

// Update value
setCount(count() + 1); // Notifies all dependent effects
```

### Memo<T>

```typescript
type Memo<T> = () => T;
```

Read-only derived signal that re-computes when dependencies change. Automatically caches value until dependencies change.

**Usage**:

```typescript
const [count, setCount] = createSignal(0);

const doubled = createMemo(() => count() * 2);

console.log(doubled()); // 0
setCount(5);
console.log(doubled()); // 10 (re-computed)
```

### Resource<T, E>

```typescript
interface Resource<T, E = unknown> extends Memo<T | undefined> {
  readonly loading: Memo<boolean>;
  readonly error: Memo<E | undefined>;
}
```

Async data with reactive loading and error states.

**Generic parameters**:

- **T**: Type of successfully fetched data
- **E**: Type of error if fetch fails (default: `unknown`)

**Properties**:

- `loading`: Reactive boolean indicating if resource is fetching
- `error`: Reactive error object if last fetch failed
- `()`: Memo containing data or undefined

**Usage**:

```typescript
const userResource = createResource(createSignal(1), (userId) =>
  fetch(`/api/users/${userId}`).then((r) => r.json()),
);

// Access reactive states
console.log(userResource.loading()); // true/false
console.log(userResource.error()); // Error object or undefined
console.log(userResource()); // Data or undefined
```

**Typical usage pattern**:

```typescript
const [userId, setUserId] = createSignal(1);

const userResource = createResource(userId, async (id) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
});

// In component render
createEffect(() => {
  if (userResource.loading()) {
    showSpinner();
  } else if (userResource.error()) {
    showError(userResource.error());
  } else {
    renderUser(userResource());
  }
});
```

### Context<T>

```typescript
interface Context<T> {
  readonly id: symbol;
  readonly defaultValue?: T;
}
```

Dependency injection container for sharing data without prop drilling.

**Properties**:

- **id**: Unique symbol identifier for context type safety
- **defaultValue**: Fallback value if no provider found

**Usage**:

```typescript
// Create context
interface Theme {
  primary: string;
  secondary: string;
}
const ThemeContext = createContext<Theme>({
  primary: "blue",
  secondary: "gray",
});

// Provide value
provide(ThemeContext, { primary: "red", secondary: "darkred" });

// Consume value
const theme = inject(ThemeContext);
```

### Attribute

```typescript
interface Attribute {
  name: string;
  value: string | number | boolean;
}
```

HTML attribute representation for applying custom attributes to DOM elements.

**Usage**:

```typescript
const attrs: Attribute[] = [
  { name: "data-testid", value: "my-component" },
  { name: "aria-label", value: "Accessible label" },
  { name: "data-count", value: 42 },
];

// Apply attributes
attrs.forEach((attr) => {
  element.setAttribute(attr.name, String(attr.value));
});
```

### ReactiveOptions

```typescript
interface ReactiveOptions {
  name?: string;
}
```

Options for reactive primitives, including debug name for development tools.

**Usage**:

```typescript
const [count, setCount] = createSignal(0, { name: "count" });

// In devtools, effect shows as "count" instead of anonymous
createEffect(
  () => {
    console.log("Count:", count());
  },
  { name: "count-reader" },
);
```

## API Details

### createContext

```typescript
function createContext<T>(defaultValue?: T): Context<T>;
```

Creates a new context object with optional default value.

**Example**:

```typescript
interface User {
  id: number;
  name: string;
}
const UserContext = createContext<User | null>(null);

// Later
const user = inject(UserContext);
// If no provider, user === null
```

### provide

```typescript
function provide<T>(context: Context<T>, value: T): void;
```

Provides a value for a context within the current reactive scope.

**Example**:

```typescript
createRoot(() => {
  provide(ThemeContext, { primary: "red" });

  // Children can access this value
  createEffect(() => {
    const theme = inject(ThemeContext);
    console.log(theme.primary); // 'red'
  });
});
```

### inject

```typescript
function inject<T>(context: Context<T>): T | undefined;
```

Retrieves a value from the nearest context provider.

**Returns**: Provided value or context's defaultValue if no provider found

**Example**:

```typescript
const theme = inject(ThemeContext);
if (theme) {
  console.log(theme.primary);
} else {
  console.log("No theme provided");
}
```

## Implementation Notes

### Resource Interface Design

**Why extend Memo<T | undefined>?**

- Resources can be used directly in reactive contexts
- Supports all memo operations (dependency tracking, caching)
- Undefined when not loaded, T when loaded

**Why E generic with default unknown?**

- Allows type-safe error handling
- `unknown` is safe default (must be checked before use)
- Optional for simple error handling

**Example with typed errors**:

```typescript
interface FetchError {
  status: number;
  message: string;
}

const resource = createResource(createSignal(1), async (id) => {
  const response = await fetch(`/api/${id}`);
  if (!response.ok) {
    throw {
      status: response.status,
      message: response.statusText,
    } as FetchError;
  }
  return response.json();
});

// Type-safe error handling
createEffect(() => {
  if (resource.error()) {
    const error: FetchError = resource.error()!;
    console.log(`Error ${error.status}: ${error.message}`);
  }
});
```

### Context ID Symbol

**Why symbol?**

- Unique identifier for type safety
- Cannot be forged or duplicated
- Enables safe context lookup in hierarchy

**Implementation**:

```typescript
function createContext<T>(defaultValue?: T): Context<T> {
  const id = Symbol(`context-${defaultValue}`); // Unique symbol
  return { id, defaultValue };
}
```

### Signal Type Composition

**Read-only vs Read-write**:

```typescript
// Read-only (public API)
type SignalGetter<T> = () => T;

// Write-only (internal)
type SignalSetter<T> = (newValue: T) => void;

// Combined (internal state)
type Signal<T> = [SignalGetter<T>, SignalSetter<T>];
```

**Why separate types?**

- Public API only exposes getter (encapsulation)
- Internal state can update via setter
- Prevents external code from bypassing reactivity

### Memo Implementation

**Automatic dependency tracking**:

```typescript
function createMemo<T>(fn: () => T): Memo<T> {
  let value: T | undefined;
  let dependents: Set<Effect> = new Set();
  let computing = false;

  const memo: Memo<T> = () => {
    // Track dependency if inside effect
    if (computing && currentEffect) {
      dependents.add(currentEffect);
    }

    return value!;
  };

  // Re-compute when dependencies change
  const update = () => {
    if (computing) return;
    computing = true;
    try {
      value = fn();
    } finally {
      computing = false;
    }
    dependents.forEach((effect) => effect());
  };

  return memo;
}
```

## Security

### Type Safety

- All types use generics for compile-time type checking
- No runtime type coercion
- Prevents type-related vulnerabilities

### Context Security

- Symbol-based context IDs prevent collision
- No string-based context names (avoid injection)
- Type-safe value storage

### Resource Security

- Error type is generic (user defines)
- No automatic error handling that could mask issues
- Explicit loading/error states

## Performance Considerations

### Signal Overhead

- Minimal: Single function call to read value
- No property access overhead
- Automatic dependency tracking (one-time setup)

### Memo Caching

- Value cached until dependencies change
- No re-computation on repeated reads
- Dependencies tracked once on first read

### Context Lookup

- O(n) where n = depth of owner hierarchy
- Map-based storage in each owner
- Cached in practice (rarely deep hierarchies)

## Edge Cases

### Signal with undefined

```typescript
const [value, setValue] = createSignal<string | undefined>(undefined);
// value() returns undefined, not an error
```

### Resource with no source signal

```typescript
createResource(
  createSignal(null), // Source never triggers
  (id) => fetch(`/api/${id}`),
);
// Resource never fetches (source is null)
```

### Context with no provider

```typescript
const value = inject(MyContext);
// Returns defaultValue if provided, undefined otherwise
```

### Memo with circular dependencies

```typescript
const a = createMemo(() => b() + 1);
const b = createMemo(() => a() + 1);
// Error: Maximum call stack size exceeded
```

## Test Coverage

Expected: 100% coverage for all type definitions and utility functions
