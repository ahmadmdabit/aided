# memo.ts

**Purpose**: Creates derived, memoized signals that cache computed values and only re-compute when dependencies change.

## API

```typescript
createMemo<T>(
  fn: () => T,
  options?: ReactiveOptions
): Memo<T>
```

## Usage

```typescript
const [firstName, setFirstName] = createSignal("John");
const [lastName, setLastName] = createSignal("Doe");

const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"
setFirstName("Jane"); // Triggers re-computation
console.log(fullName()); // "Jane Doe"

// Memos are lazy - they only compute when read
const expensive = createMemo(() => {
  console.log("Computing...");
  return heavyComputation();
});

// Nothing computed yet
expensive(); // Logs "Computing..." and returns result
expensive(); // Returns cached result (no re-computation)
```

## Key Concepts

- **Memoization**: Computed value cached until dependencies change
- **Lazy Evaluation**: Computation only happens when memo is read
- **Dependency Tracking**: Tracks signals read during computation
- **Read-Only**: Only provides getter, no setter
- **Type**: `Memo<T> = () => T` (function signature)

## Implementation Notes

### Memo Implementation

```typescript
export function createMemo<T>(fn: () => T, options?: ReactiveOptions): Memo<T> {
  // A memo is essentially a signal that is updated by an effect.
  const [memo, setMemo] = createSignal<T | undefined>(undefined, options);

  // This effect tracks the dependencies of the memo function and updates the signal's value.
  createEffect(() => {
    setMemo(fn());
  }, options);

  // The type cast here is safe and intentional.
  // The internal effect runs synchronously upon creation, so the `memo` signal
  // is guaranteed to have a value of type `T` before it's returned to the user.
  // This hides the initial `undefined` state from the public API.
  return memo as Memo<T>;
}
```

### Why Signal + Effect?

**Architecture**:

1. **Signal** holds computed value
2. **Effect** tracks dependencies and updates signal
3. **Memo** returns signal getter (read-only)

**Benefits**:

- Reuses signal's dependency tracking
- Reuses effect's re-execution mechanism
- No custom reactivity logic needed

### Initialization Timing

**Synchronous first computation**:

```typescript
const fullName = createMemo(() => {
  console.log("Computing...");
  return firstName() + " " + lastName();
});

// At this point:
// 1. Signal created with undefined
// 2. Effect runs immediately (synchronous)
// 3. Effect calls fn() → "Computing..." logged
// 4. Effect calls setMemo("John Doe")
// 5. Signal now has value "John Doe"
// 6. Return memo getter

fullName(); // Returns "John Doe", no re-computation
```

**Why this matters**:

- No undefined state visible to caller
- First read returns computed value
- Consistent with other primitives (signals return initial value)

### Type Casting Safety

**Why `as Memo<T>` is safe**:

```typescript
// Internally: [SignalGetter<T | undefined>, SignalSetter<T | undefined>]
// Returned: Memo<T> = () => T

// The effect runs synchronously on creation
// So by the time we return, signal has value T (not undefined)
```

**Type safety**:

- Runtime: Effect guarantees value exists
- Compile-time: Cast hides internal `undefined` state
- User never sees undefined unless they read before first computation (impossible)

### Dependency Tracking

**How it works**:

1. Effect's `execute()` runs
2. Effect pushed to `effectStack`
3. Effect calls `fn()`
4. `fn()` reads signals (e.g., `firstName()`)
5. Signals add effect to their subscribers
6. Effect adds signal subscribers to its dependencies
7. Effect popped from stack
8. Effect registered with owner

**Result**:

- Memo depends on signals read in `fn()`
- When any signal changes, effect re-runs
- Effect calls `setMemo(fn())`, updating memo's value

### Cache Behavior

**Value caching**:

```typescript
const fullName = createMemo(() => {
  console.log("Computing...");
  return firstName() + " " + lastName();
});

fullName(); // Logs "Computing...", returns value
fullName(); // No log, returns cached value

setFirstName("Jane"); // Effect re-runs
fullName(); // Logs "Computing...", returns new value
fullName(); // No log, returns cached value
```

**When cache updates**:

- Only when dependencies change
- Value cached until next dependency change
- No manual caching needed

### Comparison with Regular Signals

**Signal**:

- Manually set with `setValue()`
- Any value can be set (not derived)
- Write access exposed

**Memo**:

- Automatically updated when dependencies change
- Value derived from other signals
- Read-only (no setter)

### Performance Characteristics

**Overhead**:

- One signal + one effect per memo
- Signal storage: O(1)
- Effect tracking: O(n) where n = dependencies
- No additional computation beyond signal + effect

**Benefits**:

- Automatic dependency tracking
- Automatic re-computation
- Value caching
- No manual memoization needed

## Security

### No Security Concerns

- Pure data structures
- No DOM interaction
- No user input processing

## Edge Cases

**Memo with no dependencies**:

```typescript
const constant = createMemo(() => 42);
// Effect runs once, but no dependencies
// Re-runs only if memo disposed and re-created
```

**Memo that throws**:

```typescript
const broken = createMemo(() => {
  throw new Error("Oops");
});

broken(); // Throws error, effect dirty but no value updated
// Next read: Effect re-runs, throws again
```

**Memo with conditional dependencies**:

```typescript
const [show, setShow] = createSignal(false);

const computed = createMemo(() => {
  if (show()) {
    return count() * 2; // Depends on show AND count
  }
  return 0; // No dependencies
});

// Changing count doesn't trigger memo if show is false
```

**Memo with undefined dependencies**:

```typescript
const [value, setValue] = createSignal<string | undefined>(undefined);

const result = createMemo(() => {
  return value()?.toUpperCase(); // May throw if undefined
});

// Handle undefined in memo
const safe = createMemo(() => {
  return value() ? value().toUpperCase() : "";
});
```

**Memo with async computation**:

```typescript
const asyncMemo = createMemo(async () => {
  // Won't work - memo must return T, not Promise<T>
  return await fetchData();
});
// Use createResource for async data instead
```

## Test Coverage

Expected: 100% coverage for memo creation, dependency tracking, caching, error handling
