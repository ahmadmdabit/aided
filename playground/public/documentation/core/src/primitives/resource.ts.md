# resource.ts

**Purpose**: Handles asynchronous data fetching with reactive loading, error, and data state management.

## API

```typescript
createResource<S, T, E = unknown>(
  source: SignalGetter<S>,
  fetcher: (source: S, info?: FetcherInfo) => T | Promise<T>,
  options?: ReactiveOptions
): Resource<T, E>

interface Resource<T, E = unknown> extends Memo<T | undefined> {
  readonly loading: Memo<boolean>;
  readonly error: Memo<E | undefined>;
}

interface FetcherInfo {
  signal: AbortSignal;
}
```

## Usage

```typescript
const [userId, setUserId] = createSignal(1);

const userResource = createResource(userId, async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Access reactive states
console.log(userResource.loading()); // true while fetching
console.log(userResource.error()); // Error object if fetch failed
console.log(userResource()); // User data when available

// Change source triggers automatic re-fetch
setUserId(2); // Automatically fetches user with ID 2

// Handle different states
createEffect(() => {
  if (userResource.loading()) {
    showLoadingSpinner();
  } else if (userResource.error()) {
    showError(userResource.error());
  } else {
    displayUser(userResource());
  }
});
```

## Key Concepts

- **Reactive States**: Separate loading, error, and data states
- **Automatic Refetching**: Re-fetches when source signal changes
- **AbortController Integration**: Cancels pending requests on refetch/dispose
- **Async-Aware**: Handles both synchronous and asynchronous fetchers
- **Type-Safe Errors**: Generic error type parameter

## Implementation Notes

### Resource Implementation

```typescript
export function createResource<S, T, E = unknown>(
  source: SignalGetter<S>,
  fetcher: Fetcher<S, T>,
  options?: ReactiveOptions,
): Resource<T, E> {
  const [data, setData] = createSignal<T | undefined>(undefined, options);
  const [loading, setLoading] = createSignal<boolean>(true);
  const [error, setError] = createSignal<E | undefined>(undefined);

  createEffect(() => {
    const sourceValue = source();
    setLoading(true);
    setError(undefined);

    const controller = new AbortController();

    // Abort the fetch if the effect re-runs or the reactive scope is disposed
    onCleanup(() => {
      controller.abort();
    });

    const executeFetch = async () => {
      try {
        const result = await fetcher(sourceValue, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e as E);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    executeFetch();
  }, options);

  // The main return value is a memo of the data
  const resourceMemo = createMemo(() => data(), options);

  // Attach the loading and error states as memos
  (resourceMemo as any).loading = createMemo(() => loading());
  (resourceMemo as any).error = createMemo(() => error());

  return resourceMemo as Resource<T, E>;
}
```

### State Management

**Three independent signals**:

1. **data**: Holds fetched data or undefined
2. **loading**: Boolean indicating fetch in progress
3. **error**: Error object if last fetch failed

**Resource as Memo**:

- Returns memo of data
- Extends `Memo<T | undefined>`
- Provides loading/error as properties

### AbortController Integration

**Request cancellation**:

```typescript
const controller = new AbortController();

// Cleanup on disposal
onCleanup(() => {
  controller.abort();
});

// Pass signal to fetcher
fetcher(sourceValue, { signal: controller.signal });
```

**Abort handling**:

```typescript
try {
  const result = await fetcher(sourceValue, { signal: controller.signal });
  if (!controller.signal.aborted) {
    setData(result);
  }
} catch (e) {
  if (!controller.signal.aborted) {
    setError(e as E);
  }
}
```

**Why check aborted flag?**

- Fetch may complete after controller aborted
- Don't update state if request cancelled
- Prevents race conditions

### Loading State

**Initial state**: `true`

- Resource is loading when created
- Set to `false` in finally block

**State transitions**:

```
[initial] -> loading: true, data: undefined, error: undefined
[fetch starts] -> loading: true
[fetch succeeds] -> loading: false, data: T, error: undefined
[fetch fails] -> loading: false, data: undefined, error: E
```

### Error State

**Error handling**:

```typescript
try {
  const result = await fetcher(sourceValue, { signal: controller.signal });
  setData(result);
} catch (e) {
  setError(e as E);
}
```

**Error types**:

- Network errors (fetch throws TypeError)
- HTTP errors (response.ok === false)
- Custom errors (throw new Error())
- Any error from async function

### Source Dependency

**Reactive source**:

```typescript
createEffect(() => {
  const sourceValue = source(); // Tracks source signal

  setLoading(true);
  setError(undefined);

  // ... fetch logic ...
});
```

**What triggers refetch**:

- Source signal value changes
- Effect re-runs
- New fetch starts
- Previous fetch aborted

**Example**:

```typescript
const [userId, setUserId] = createSignal(1);

const userResource = createResource(userId, fetchUser);

setUserId(2); // Triggers effect re-run, fetches user 2
setUserId(3); // Aborts user 2 fetch, fetches user 3
```

### Type Safety

**Generic parameters**:

- **S**: Source signal type
- **T**: Data type
- **E**: Error type (default: `unknown`)

**Default unknown**:

```typescript
// Error is unknown, must be checked before use
const resource = createResource(source, fetcher);

if (resource.error()) {
  const err: unknown = resource.error();
  // Must narrow type before use
  if (err instanceof Error) {
    console.log(err.message);
  }
}
```

**Typed errors**:

```typescript
interface FetchError {
  status: number;
  message: string;
}

const resource = createResource(source, fetcher, options);

if (resource.error()) {
  const err: FetchError = resource.error()!;
  console.log(`Error ${err.status}: ${err.message}`);
}
```

### Cleanup Behavior

**When effect cleanup runs**:

1. AbortController.abort() called
2. Pending fetch rejected with AbortError
3. Catch block checks signal.aborted
4. If aborted, error not set
5. If not aborted, error set

**When resource scope disposed**:

- Effect disposer called
- Effect cleanup runs
- AbortController.abort() called

## Security

### No Direct Security Concerns

- Fetcher function is user-provided
- No user input directly processed
- AbortController prevents stale data updates

### Potential Pitfalls

**Don't assume fetcher is safe**:

- Fetcher may throw or return sensitive data
- Handle errors appropriately
- Validate fetched data before use

## Performance Considerations

### Overhead

- Three signals + one effect per resource
- AbortController allocation per fetch
- Minimal beyond signal + effect overhead

### Optimization Opportunities

**Cancel duplicate requests**:

```typescript
// Don't fetch if same source value
if (lastSource === sourceValue) return;
```

**Debounce rapid changes**:

```typescript
// Debounce source changes
const debouncedSource = createMemo(() => {
  // Implement debounce logic
});
```

## Edge Cases

**Empty source**:

```typescript
const [value, setValue] = createSignal(null);

createResource(value, fetcher);
// Effect runs with null, fetcher receives null
```

**Throwing fetcher**:

```typescript
createResource(source, () => {
  throw new Error("Failed");
});
// Error captured, resource.error() set, loading: false
```

**Async fetcher**:

```typescript
createResource(source, async (id) => {
  await delay(1000);
  return fetchData();
});
// Works fine - async/await supported
```

**Sync fetcher**:

```typescript
createResource(source, (id) => {
  return computeData(id);
});
// Works fine - synchronous return supported
```

**Source never changes**:

```typescript
createResource(createSignal(1), fetcher);
// Effect runs once, never re-runs
```

## Test Coverage

Expected: 100% coverage for resource creation, loading states, error handling, abort, cleanup
