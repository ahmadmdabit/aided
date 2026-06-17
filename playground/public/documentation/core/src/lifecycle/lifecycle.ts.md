# lifecycle.ts

**Purpose**: Manages reactive ownership and automatic memory cleanup through owner scopes and cleanup registration.

## API

### createRoot

```typescript
createRoot(fn: (dispose: Disposer) => void): Disposer
```

Creates ownership scope for automatic resource management.

### onCleanup

```typescript
onCleanup(fn: Disposer): void
```

Registers cleanup function for current scope.

### provide

```typescript
provide<T>(context: Context<T>, value: T): void
```

Provides context value in current scope.

### inject

```typescript
inject<T>(context: Context<T>): T | undefined
```

Retrieves context value from hierarchy.

### hasOwner

```typescript
hasOwner(): boolean
```

Checks if called within reactive scope.

## Usage

```typescript
// Create reactive root
const dispose = createRoot(() => {
  const [count] = createSignal(0);

  createEffect(() => {
    console.log("Count:", count());
  });

  // Manual cleanup
  setTimeout(() => {
    dispose(); // Cleans up all effects and resources
  }, 1000);
});

// Context management
createRoot(() => {
  provide(ThemeContext, { primary: "red" });

  const theme = inject(ThemeContext); // { primary: 'red' }
});
```

## Key Concepts

- **Owner Tree**: Tracks parent-child relationships between scopes
- **Cleanup Queue**: Cleanups run in reverse order on disposal
- **Context Storage**: Values stored in owner's contexts Map
- **Automatic Cleanup**: Resources automatically cleaned up on scope disposal
- **Dev Warnings**: Warnings for operations outside reactive scopes

## Implementation Notes

### Owner Structure

```typescript
type Owner = {
  parent: Owner | null;
  cleanups: Disposer[];
  contexts?: Map<symbol, any>;
} | null;

let currentOwner: Owner = null;
```

**Properties**:

- **parent**: References parent scope for context lookup
- **cleanups**: Array of cleanup functions to run on disposal
- **contexts**: Map of context symbol to value

### createRoot Implementation

```typescript
export function createRoot(fn: (dispose: Disposer) => void): Disposer {
  const parentOwner = currentOwner;
  const root: Owner = {
    parent: parentOwner,
    cleanups: [],
  };

  const dispose = () => {
    // Set the owner to this root during cleanup
    const prevOwner = currentOwner;
    currentOwner = root;
    try {
      // Run cleanups in reverse order
      for (let i = root.cleanups.length - 1; i >= 0; i--) {
        root.cleanups[i]();
      }
      root.cleanups = [];
    } finally {
      currentOwner = prevOwner;
    }
  };

  // Set the current owner for function execution
  currentOwner = root;
  try {
    fn(dispose);
  } finally {
    currentOwner = parentOwner;
  }

  return dispose;
}
```

**Why set owner during cleanup**:

- Ensures nested cleanups register in correct scope
- Maintains owner hierarchy during cleanup
- Prevents leaks from nested cleanup registration

**Reverse order cleanup**:

- Dependencies cleaned up before dependents
- Effects that read signals cleaned up before signals
- Prevents accessing disposed resources

### onCleanup Implementation

```typescript
export function onCleanup(fn: Disposer): void {
  devWarning(
    !!currentOwner,
    "onCleanup() was called outside of a reactive scope. The cleanup function will not be registered.",
  );

  if (currentOwner) {
    currentOwner.cleanups.push(fn);
  }
}
```

**Dev warning**:

- Alerts when cleanup not registered
- Prevents silent failures
- Only runs in development mode

### Context Management

**provide**:

```typescript
export function provide<T>(context: Context<T>, value: T): void {
  devWarning(
    !!currentOwner,
    "provide() was called outside of a reactive scope.",
  );
  if (!currentOwner) return;

  if (!currentOwner.contexts) {
    currentOwner.contexts = new Map();
  }
  currentOwner.contexts.set(context.id, value);
}
```

**inject**:

```typescript
export function inject<T>(context: Context<T>): T | undefined {
  let owner = currentOwner;
  while (owner) {
    if (owner.contexts?.has(context.id)) {
      return owner.contexts.get(context.id);
    }
    owner = owner.parent;
  }
  return context.defaultValue;
}
```

**Lookup algorithm**:

1. Start at current owner
2. Check if contexts has context id
3. If found, return value
4. If not, move to parent
5. Repeat until found or no parent
6. Return defaultValue if no provider

### hasOwner Implementation

```typescript
export function hasOwner(): boolean {
  return !!currentOwner;
}
```

**Use cases**:

- Check before creating reactive primitives
- Warning conditions
- Conditional logic

### Cleanup Flow

**Complete lifecycle**:

1. `createRoot` sets currentOwner
2. Reactive primitives register with currentOwner
3. Effects add to cleanups array
4. `onCleanup` adds to cleanups array
5. `dispose` runs cleanups in reverse order
6. Owner restored to parent

**Example**:

```typescript
createRoot(() => {
  // Scope 1
  onCleanup(() => console.log("Scope 1 cleanup"));

  createRoot(() => {
    // Scope 2
    onCleanup(() => console.log("Scope 2 cleanup"));

    createEffect(() => {
      // Effect registered with Scope 2
    });

    // Scope 2 disposes first
  });

  // Scope 1 disposes second
});
```

**Cleanup order**: Scope 2 effects, Scope 2 cleanup, Scope 1 effects, Scope 1 cleanup

## Security

### No Security Concerns

- Pure JavaScript logic
- No DOM interaction
- No user input processing

## Performance Considerations

### Memory Usage

- Per owner: cleanups array + contexts Map (optional)
- Cleanups grow with registered cleanups
- Contexts only if contexts used

### Performance Characteristics

- createRoot: O(1) setup, O(n) cleanup where n = cleanups
- onCleanup: O(1) push
- inject: O(d) where d = depth of owner hierarchy

### Optimization Opportunities

- WeakMap for contexts (if many small scopes)
- Array pooling for cleanups (if scopes created/destroyed frequently)
- Cache parent lookups (if contexts frequently accessed)

## Edge Cases

**Nested cleanups**:

```typescript
createRoot(() => {
  onCleanup(() => {
    onCleanup(() => console.log("Nested cleanup"));
  });
});
// Inner cleanup registered with outer scope
```

**Cleanup that throws**:

```typescript
createRoot(() => {
  onCleanup(() => {
    throw new Error("Oops");
  });
});
// Error thrown, other cleanups still run
```

**Cleanup after owner disposed**:

```typescript
const dispose = createRoot(() => {
  const cleanup = onCleanup(() => console.log("Cleanup"));
  dispose();
  cleanup(); // Error - owner already disposed
});
```

**No current owner**:

```typescript
onCleanup(() => console.log("No owner"));
// Warning logged, cleanup not registered
```

**Context lookup with no provider**:

```typescript
const value = inject(MyContext);
// Returns defaultValue if provided, undefined otherwise
```

## Test Coverage

Expected: 100% coverage for createRoot, onCleanup, provide, inject, hasOwner, cleanup order
