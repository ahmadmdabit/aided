# signal.ts

**Purpose**: Creates reactive state containers that automatically track dependencies and notify subscribers when values change.

## API

```typescript
createSignal<T>(
  value: T,
  options?: ReactiveOptions
): [SignalGetter<T>, SignalSetter<T>]
```

## Usage

```typescript
const [count, setCount] = createSignal(0);

// Reading the signal tracks dependencies
console.log(count()); // 0

// Writing updates the value and notifies dependents
setCount(5);
console.log(count()); // 5

// Equal values don't trigger updates (Object.is)
setCount(5); // No-op - no subscribers notified

// With debug name (development mode)
const [name, setName] = createSignal("John", { name: "userName" });
```

## Key Concepts

- **Automatic Dependency Tracking**: Subscriptions created when getter called inside effects
- **Value-Based Updates**: Only notifies when `Object.is(value, newValue)` returns false
- **Set-Based Subscribers**: Automatic deduplication of effect subscriptions
- **Batched Updates**: All effects notified together via flush queue
- **Debug Names**: Development-only names for easier debugging

## Implementation Notes

### Signal Structure

```typescript
export function createSignal<T>(
  value: T,
  options?: ReactiveOptions,
): [SignalGetter<T>, SignalSetter<T>] {
  const subscribers = new Set<Subscriber>();

  const read: SignalGetter<T> = (): T => {
    const currentEffect = effectStack[effectStack.length - 1];
    if (currentEffect) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }
    return value;
  };

  const write: SignalSetter<T> = (newValue: T) => {
    if (Object.is(value, newValue)) {
      return;
    }
    value = newValue;
    subscribers.forEach((sub) => dirtyEffects.add(sub));
    flushQueue();
  };

  if (process.env.NODE_ENV !== "production" && options?.name) {
    (read as any)._name = options.name;
  }

  return [read, write];
}
```

### Dependency Tracking

**How it works**:

1. Effect calls signal getter: `count()`
2. Getter checks `effectStack` for current effect
3. If found, adds effect to subscribers Set
4. Effect also adds subscribers Set to its dependencies Set

**Circular reference**:

- Signal → subscribers Set
- Effect → dependencies Set (contains subscribers Set)
- Enables efficient cleanup: effect can remove itself from all signals

### Value Change Detection

**Object.is comparison**:

```typescript
if (Object.is(value, newValue)) {
  return; // No change, don't notify
}
```

**Why Object.is?**

- More precise than `!==` for edge cases
- Handles `NaN` correctly (NaN === NaN is false, but Object.is(NaN, NaN) is true)
- Handles `+0` vs `-0` correctly
- Matches JavaScript's concept of "same value"

**Examples**:

```typescript
const [value, setValue] = createSignal(0);

setValue(0); // No update - same value
setValue(NaN); // No update - same NaN
setValue(+0); // No update - same +0
setValue(-0); // No update - same -0 (Object.is(+0, -0) is false but we're checking if equal)

setValue(1); // Update - different value
```

### Subscriber Set

**Why Set instead of Array?**

- Automatic deduplication
- O(1) add/has operations
- No manual filtering needed

**Example**:

```typescript
// Effect reads same signal multiple times
createEffect(() => {
  console.log(count()); // First read
  console.log(count()); // Second read
  // Subscriber added only once to Set
});
```

### Batched Updates

**Flush queue**:

```typescript
const dirtyEffects = new Set<Effect>();

const write: SignalSetter<T> = (newValue: T) => {
  // ... update value ...
  subscribers.forEach((sub) => dirtyEffects.add(sub));
  flushQueue();
};

function flushQueue() {
  // Schedule effects to run after all signals are updated
  requestAnimationFrame(() => {
    dirtyEffects.forEach((effect) => effect.execute());
    dirtyEffects.clear();
  });
}
```

**Benefits**:

- Multiple signal updates in same tick → effects run once
- Prevents redundant re-computations
- Consistent state during effect execution

### Debug Name

**Development only**:

```typescript
if (process.env.NODE_ENV !== "production" && options?.name) {
  (read as any)._name = options.name;
}
```

**Usage**:

- Devtools can show effect names instead of "anonymous"
- Helps identify effects in profiling and debugging
- Stripped in production builds

**Example**:

```typescript
const [count, setCount] = createSignal(0, { name: "count" });
const doubled = createMemo(() => count() * 2, { name: "doubled" });

// In devtools:
// - Effect "doubled" (reads count)
// - Signal "count"
```

### Cleanup

**Effect disposer removes from subscribers**:

```typescript
const disposer = () => {
  cleanup(effect); // Removes effect from all signal subscribers
};

onCleanup(disposer); // Registers with current owner
```

**When cleanup runs**:

- Owner scope disposal (createRoot cleanup)
- Manual disposer call
- Parent effect disposal

## Security

### No Security Concerns

- Pure data structures
- No DOM interaction
- No user input processing

## Performance Considerations

### Signal Overhead

- Minimal: Single function call for get/set
- Set operations: O(1) average
- No property access overhead

### Memory Usage

- Per signal: subscribers Set (grows with subscribers)
- Per effect: dependencies Set (grows with signals read)
- Circular reference requires careful GC handling (handled by JS engine)

### Optimization Opportunities

- Freeze small Sets (if no new subscribers expected)
- WeakMap for subscriber tracking (if signal created/destroyed frequently)
- TypedArrays for small subscriber counts (<10)

## Edge Cases

**Signal with undefined**:

```typescript
const [value, setValue] = createSignal<string | undefined>(undefined);
// Works fine - undefined is valid value
```

**NaN as value**:

```typescript
const [value, setValue] = createSignal(NaN);
setValue(NaN); // No update (Object.is(NaN, NaN) is true)
```

**Same object reference**:

```typescript
const obj = { count: 0 };
const [value, setValue] = createSignal(obj);
setValue(obj); // No update (same reference, Object.is returns true)
```

**Different object with same content**:

```typescript
const [value, setValue] = createSignal({ count: 0 });
setValue({ count: 0 }); // Update (different object, Object.is returns false)
```

**Symbol as value**:

```typescript
const sym = Symbol("test");
const [value, setValue] = createSignal(sym);
setValue(sym); // No update (same symbol)
```

## Test Coverage

Expected: 100% coverage for signal creation, updates, dependency tracking, cleanup
