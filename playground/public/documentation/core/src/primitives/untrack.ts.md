# untrack.ts

**Purpose**: Executes functions without tracking reactive dependencies, temporarily disabling dependency tracking.

## API

```typescript
untrack<T>(fn: () => T): T
```

## Usage

```typescript
const [count, setCount] = createSignal(0);

// Effect with tracked reads
createEffect(() => {
  console.log("Tracked:", count());
  // This effect will re-run when count changes
});

// Effect with untracked writes
createEffect(() => {
  console.log("Tracked:", count());
  untrack(() => {
    setCount(count() + 1); // Reading count here doesn't track it
    // Effect won't re-run from this setCount
  });
});

// Untracked component creation
function createComponent() {
  return untrack(() => {
    const [localCount, setLocalCount] = createSignal(0);
    return h.button(
      { onClick: () => setLocalCount(localCount() + 1) },
      "Click",
    );
  });
}
// Component has its own state, independent of parent
```

## Key Concepts

- **Disables Dependency Tracking**: Signals read inside fn are not tracked as dependencies
- **Preserves Effect Stack**: Saves current stack and restores after execution
- **Return Value Propagation**: Returns fn()'s value to caller
- **Break Dependency Chains**: Useful for creating independent reactive scopes

## Implementation Notes

### Implementation

```typescript
export function untrack<T>(fn: () => T): T {
  // 1. Save the current effect stack to restore later
  const prevStack = [...effectStack];

  // 2. Clear the global tracking stack to disable dependency tracking
  effectStack.length = 0;

  try {
    // 3. Execute the function without any dependency tracking
    return fn();
  } finally {
    // 4. Always restore the previous stack, even if an error occurs
    effectStack.push(...prevStack);
  }
}
```

**Steps**:

1. **Save previous stack**: `[...effectStack]` creates copy of current stack
2. **Clear stack**: `effectStack.length = 0` removes all effects from tracking
3. **Execute function**: fn() runs without any tracking
4. **Restore stack**: `effectStack.push(...prevStack)` restores original state

### Why Clear Stack?

**Dependency tracking works by**:

1. Effect pushed to `effectStack` before execution
2. Signal getter checks `effectStack` for current effect
3. Signal adds current effect to its subscribers
4. Effect adds signal to its dependencies

**When stack is empty**:

- Signal getter finds no current effect
- No subscription created
- No dependency established

### Use Cases

**Creating Component Instances**:

```typescript
function createCounter() {
  return untrack(() => {
    const [count, setCount] = createSignal(0);

    return h.button(
      {
        onClick: () => setCount(count() + 1),
      },
      `Count: ${count()}`,
    );
  });
}

// Each counter has independent state
const counter1 = createCounter();
const counter2 = createCounter();

// Changing one doesn't affect the other
```

**Side Effects Without Updates**:

```typescript
const [data, setData] = createSignal(null);

createEffect(() => {
  const value = data();

  untrack(() => {
    // Write to localStorage without tracking
    localStorage.setItem("lastValue", String(value));

    // Log without tracking
    console.log("Data changed:", value);
  });
});
```

**Breaking Dependency Chains**:

```typescript
const [a, setA] = createSignal(0);
const [b, setB] = createSignal(0);

const c = createMemo(() => {
  // Read a, but don't track
  const aValue = untrack(() => a());

  // Only depend on b
  return b() + aValue;
});

setA(10); // c doesn't re-compute (a not tracked)
setB(5); // c re-computes (b is tracked)
```

### Error Handling

**Finally block ensures restoration**:

```typescript
try {
  return fn();
} finally {
  effectStack.push(...prevStack);
}
```

**Even if fn throws**:

- Stack is restored
- No permanent damage to reactivity
- Error propagates normally

**Example**:

```typescript
try {
  untrack(() => {
    throw new Error("Oops");
  });
} catch (e) {
  // effectStack is restored before catch block
}
```

### Performance Characteristics

**Overhead**:

- Shallow copy of effectStack: O(n) where n = effects in stack
- Usually small (1-5 effects typical)
- Minimal compared to reactivity benefits

**When to use**:

- Component creation
- Side effects that shouldn't trigger updates
- Breaking circular dependencies
- Testing with controlled reactivity

## Security

### No Security Concerns

- Pure JavaScript logic
- No DOM interaction
- No user input processing

## Edge Cases

**Nested untrack calls**:

```typescript
untrack(() => {
  untrack(() => {
    // Still no tracking
  });
});
// Works correctly - stack cleared both times
```

**Untrack with async**:

```typescript
untrack(async () => {
  await fetchData();
  return result;
});
// Works - async functions return Promise
```

**Untrack in effect that disposes**:

```typescript
const dispose = createEffect(() => {
  untrack(() => {
    // Cleanup still works
  });
});

dispose(); // Effect and its untracked code cleaned up
```

**Untrack returns undefined**:

```typescript
const result = untrack(() => {});
// result === undefined
```

**Untrack returns function**:

```typescript
const fn = untrack(() => () => 42);
fn(); // 42
```

## Test Coverage

Expected: 100% coverage for untrack with various return types and nesting
