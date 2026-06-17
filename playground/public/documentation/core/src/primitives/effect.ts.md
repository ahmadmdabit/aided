# effect.ts

**Purpose**: Creates effects that automatically re-run when their dependencies change, enabling reactive side effects.

## API

```typescript
createEffect(
  fn: () => void,
  options?: ReactiveOptions
): Disposer
```

## Usage

```typescript
const [count, setCount] = createSignal(0);

// Effect runs immediately and re-runs when dependencies change
createEffect(() => {
  console.log("Count:", count());
  document.title = `Count: ${count()}`;
});

// Logs: "Count: 0"
setCount(1); // Logs: "Count: 1"
setCount(2); // Logs: "Count: 2"

// Effects must be created within a reactive root for cleanup
const dispose = createRoot(() => {
  const effectDispose = createEffect(() => {
    // ... effect logic
  });

  // Manual cleanup
  effectDispose();
});

// Or cleanup when root disposes
createRoot(() => {
  createEffect(() => {
    // ... effect logic
  });
  // All effects auto-cleaned when root disposes
});
```

## Key Concepts

- **Automatic Re-execution**: Effect re-runs when any signal it reads changes
- **Dependency Tracking**: Signals read during effect execution become dependencies
- **Manual Cleanup**: Returns disposer function for manual cleanup
- **Owner Integration**: Registered with current owner for automatic cleanup
- **Performance Profiling**: Optional effect execution time tracking

## Implementation Notes

### Effect Structure

```typescript
export function createEffect(
  fn: () => void,
  options?: ReactiveOptions,
): Disposer {
  devWarning(
    hasOwner(),
    "createEffect was called outside of a reactive root. This effect will not be automatically cleaned up.",
  );

  const effect: Subscriber = {
    execute: () => {
      cleanup(effect); // Clean up old dependencies
      effectStack.push(effect); // Push to global stack for tracking

      const profiling = isProfilerEnabled();
      const start = profiling ? performance.now() : 0;

      try {
        fn();
      } finally {
        effectStack.pop(); // Pop from stack

        const duration = profiling ? performance.now() - start : 0;
        recordEffectExecution(effect.name || "anonymous", duration);
      }
    },
    dependencies: new Set(), // Set of subscriber Sets
    name: options?.name,
  };

  effect.execute(); // Run immediately to establish dependencies
  const disposer = () => cleanup(effect);
  onCleanup(disposer); // Register with current owner

  return disposer;
}
```

### Dependency Tracking Flow

**Step-by-step**:

1. Effect's `execute()` is called
2. Effect pushed to `effectStack`
3. Effect runs `fn()`
4. Inside `fn()`, signals are read via `count()`
5. Signal getter checks `effectStack` for current effect
6. If found, adds effect to signal's subscribers
7. Effect also adds signal's subscribers Set to its `dependencies` Set
8. Effect popped from `effectStack`
9. Effect registered with owner via `onCleanup`

**Cleanup**:

- When effect disposes, `cleanup(effect)` is called
- Effect removes itself from all signal subscribers
- All dependency relationships removed

### Cleanup Mechanism

```typescript
function cleanup(effect: Subscriber) {
  effect.dependencies.forEach((subscribersSet) => {
    subscribersSet.delete(effect);
  });
  effect.dependencies.clear();
}
```

**What cleanup does**:

1. Iterates through all subscriber Sets in dependencies
2. Removes effect from each subscriber Set
3. Clears dependencies Set
4. Breaks circular references

**When cleanup runs**:

- Manual disposer call
- Owner scope disposal
- Parent effect disposal

### Performance Profiling

**Enabled via**:

```typescript
import { enableProfiler } from "aided-core";
enableProfiler(true);
```

**Tracking**:

```typescript
const profiling = isProfilerEnabled();
const start = profiling ? performance.now() : 0;

try {
  fn();
} finally {
  const duration = profiling ? performance.now() - start : 0;
  recordEffectExecution(effect.name || "anonymous", duration);
}
```

**When profiling disabled**:

- `performance.now()` not called (zero overhead)
- `recordEffectExecution` returns immediately (single boolean check)

### Effect Execution Order

**First execution**:

- Runs immediately when `createEffect` called
- Establishes initial dependencies
- May trigger other effects if signals change

**Subsequent executions**:

- Triggered by signal updates via flush queue
- Batched with other dirty effects
- Run in no guaranteed order (all at once)

**Important**: Effects don't guarantee execution order relative to each other. Use signals for effect coordination.

### Effect Name

**Development only**:

```typescript
name: options?.name;
```

**Usage**:

- Shows in profiler reports
- Devtools can display meaningful names
- Defaults to 'anonymous'

**Example**:

```typescript
const [count, setCount] = createSignal(0);

createEffect(
  () => {
    console.log("Count:", count());
  },
  { name: "count-logger" },
);

// Profiler shows: { 'count-logger': { count: 5, totalTimeMs: 0.5 } }
```

### Ownership Integration

**Owner registration**:

```typescript
onCleanup(disposer);
```

**Owner cleanup**:

```typescript
export function createRoot(fn: (dispose: Disposer) => void): Disposer {
  const root: Owner = {
    parent: currentOwner,
    cleanups: [],
  };

  // ... run fn ...

  const dispose = () => {
    // Run cleanups in reverse order
    for (let i = root.cleanups.length - 1; i >= 0; i--) {
      root.cleanups[i]();
    }
  };

  return dispose;
}
```

**Benefits**:

- Automatic cleanup on scope disposal
- No manual disposer calls needed in many cases
- Clean separation of concerns

## Security

### No Security Concerns

- Pure JavaScript logic
- No DOM interaction
- No user input processing

## Performance Considerations

### Effect Overhead

- Minimal: Function call + Set operations
- Dependencies tracked once (after first run)
- No overhead on signal updates (just add to dirty set)

### Memory Usage

- Per effect: dependencies Set (grows with signals read)
- Per signal: subscribers Set (grows with effects reading it)
- Circular reference requires GC awareness

### Optimization Opportunities

- Cache cleanup (if effect cleaned up/re-created frequently)
- WeakSet for dependencies (if effects created/destroyed frequently)
- Array instead of Set for small subscriber counts (<5)

## Edge Cases

**Effect with no dependencies**:

```typescript
createEffect(() => {
  console.log("Runs once"); // No signals read
});
// Effect runs once, never re-runs
```

**Effect with conditional dependencies**:

```typescript
const [show, setShow] = createSignal(false);

createEffect(() => {
  if (show()) {
    console.log("Count:", count()); // Depends on show AND count
  }
  console.log("Always runs"); // No dependencies
});

// Changing count doesn't trigger effect if show is false
```

**Effect that throws**:

```typescript
createEffect(() => {
  console.log(count());
  throw new Error("Oops");
});

// Effect still registered as dirty if signal changes
// But error may prevent other logic
```

**Effect with multiple signals**:

```typescript
createEffect(() => {
  console.log(count(), name(), age());
});

// Effect depends on all three signals
// Re-runs when any one changes
```

## Test Coverage

Expected: 100% coverage for effect creation, dependency tracking, cleanup, error handling
