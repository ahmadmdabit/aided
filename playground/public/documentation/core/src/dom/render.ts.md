# render.ts

**Purpose**: Provides the main entry point for rendering Aided components into the DOM with automatic lifecycle management.

## Exports

### `render(component, mountNode)`

Renders a component into a DOM node with automatic lifecycle management.

**Parameters**:

- `component: () => Element` - Function that returns a DOM element
- `mountNode: Element` - DOM node to mount the component into

**Returns**:

- `Disposer` - Function to unmount and clean up all resources

**Throws**:

- `AidedError` with code 'INVALID_MOUNT_NODE' if mountNode is null/undefined

## Usage Example

```typescript
const App = () => {
  const [count, setCount] = createSignal(0);

  return h.div(
    {},
    h.button({ onClick: () => setCount(count() + 1) }, `Count: ${count()}`),
    h.p({}, "Hello, Aided!"),
  );
};

const dispose = render(App, document.getElementById("app")!);

// Later, to unmount:
dispose();

// Or cleanup when component unmounts
const root = document.getElementById("app")!;
root.addEventListener("beforeunload", () => {
  dispose();
});
```

## Key Concepts

- **Lifecycle Management**: Establishes root reactive context via `createRoot`
- **Automatic Cleanup**: Returns disposer to clean up all resources
- **Mount Node Validation**: Validates mount node before rendering
- **Clean Slate**: Clears mount node before appending
- **Error Handling**: Throws AidedError for invalid mount node

## Implementation Notes

### Implementation

```typescript
export function render(component: () => Element, mountNode: Element): Disposer {
  if (!mountNode) {
    throw new AidedError(
      "render(...): The provided mount node is null or undefined. Aided requires a valid DOM element to render into.",
      "INVALID_MOUNT_NODE",
    );
  }

  const dispose = createRoot((disposeRoot) => {
    const appElement = component();
    mountNode.innerHTML = ""; // Clear the mount node
    mountNode.appendChild(appElement);
  });

  return dispose;
}
```

**Steps**:

1. Validate mountNode is provided
2. Create reactive root via `createRoot`
3. Execute component function to get element
4. Clear mount node (innerHTML = '')
5. Append component element
6. Return disposer for cleanup

### Mount Node Validation

**Error handling**:

```typescript
if (!mountNode) {
  throw new AidedError(
    "render(...): The provided mount node is null or undefined. Aided requires a valid DOM element to render into.",
    "INVALID_MOUNT_NODE",
  );
}
```

**Why validate**:

- Prevents cryptic errors from trying to render to null
- Clear error message helps debugging
- Error code allows programmatic handling

**Common mistakes**:

```typescript
// Wrong: element doesn't exist
render(App, document.getElementById("app")); // Returns null if not found

// Right: ensure element exists
const app = document.getElementById("app");
if (app) {
  render(App, app);
}
```

### Mount Node Clearing

**Why clear innerHTML**:

```typescript
mountNode.innerHTML = "";
```

**Benefits**:

- Ensures clean slate for new render
- Removes previous component's DOM nodes
- Prevents accumulating old content
- Consistent starting state

**Example**:

```typescript
// First render
render(App1, container); // App1 rendered

// Second render
render(App2, container); // App1 removed, App2 rendered
// container.innerHTML was cleared before App2 appended
```

### Reactive Root Integration

**createRoot lifecycle**:

```typescript
createRoot((disposeRoot) => {
  const appElement = component();
  mountNode.innerHTML = "";
  mountNode.appendChild(appElement);
});
```

**What createRoot provides**:

- Owner scope for all reactive primitives
- Automatic cleanup of effects, memos, resources
- Context storage for dependency injection
- Proper scope hierarchy

**Disposer usage**:

```typescript
const dispose = render(App, container);

// Unmount later
dispose();

// All effects, memos, resources cleaned up
// All context values released
// All event listeners removed
```

### Component Pattern

**Typical component**:

```typescript
const App = () => {
  // Create state
  const [count, setCount] = createSignal(0);

  // Create effects
  createEffect(() => {
    console.log("Count:", count());
  });

  // Return DOM element
  return h.div(
    {},
    h.button({ onClick: () => setCount(count() + 1) }, `Count: ${count()}`),
    h.p({}, "Hello!"),
  );
};

// Component is a function that returns Element
// Must be pure (no side effects)
// Must return single root element
```

**Component with context**:

```typescript
const ThemeContext = createContext({ primary: "blue" });

const App = () => {
  provide(ThemeContext, { primary: "red" });

  return h.div({}, h(ThemedComponent));
};

function ThemedComponent() {
  const theme = inject(ThemeContext);
  return h.div({ style: { color: theme.primary } }, "Themed");
}
```

### Unmounting Behavior

**What cleanup does**:

1. Calls all cleanup functions registered with `onCleanup`
2. Disposes all effects
3. Releases all resources
4. Removes component from DOM

**Example**:

```typescript
const dispose = render(App, container);

// Inside App, effects are created
createEffect(() => {
  console.log("Effect running");
});

// Event listeners attached
const btn = container.querySelector("button");
btn.addEventListener("click", handler);

// When dispose is called
dispose();

// All effects cleaned up
// All event listeners removed
// Component element removed from DOM
```

### Error Handling

**Invalid mount node**:

```typescript
render(App, null); // Throws AidedError with code 'INVALID_MOUNT_NODE'
```

**Component throws**:

```typescript
const BrokenApp = () => {
  throw new Error("Oops");
};

render(BrokenApp, container); // Error propagates
// Mount node cleared, no element appended
```

**Component returns null**:

```typescript
const EmptyApp = () => null;

render(EmptyApp, container); // Mount node cleared
// container.innerHTML === '' after render
```

## Security

### No Security Concerns

- Simple DOM manipulation
- Standard pattern for SPA frameworks
- No user input directly processed

### Potential Pitfalls

**XSS if component renders user input**:

```typescript
// Component must sanitize user input
const App = () => {
  const [input, setInput] = createSignal("");
  return h.div({}, input()); // Not safe for user input!
};

// Proper: sanitize first
const safeApp = () => {
  const [input, setInput] = createSignal("");
  return h.div({}, escapeHtml(input()));
};
```

## Performance Considerations

### Overhead

- One createRoot call per render
- Mount node clear: O(n) where n = child nodes
- Component execution: O(1) for typical components

### Optimization Opportunities

- Re-render optimization (avoid re-rendering same content)
- Virtual DOM alternative for very complex components
- Lazy component loading

### Best Practices

- Render once, update via signals
- Use reactive primitives instead of re-rendering
- Clean up when component unmounted
- Validate mount node before rendering

## Edge Cases

**Empty mount node**:

```typescript
const container = document.createElement("div");
render(App, container); // Renders into detached element
// Element not in DOM, but component rendered
```

**Multiple renders**:

```typescript
render(App1, container);
render(App2, container); // App1 unmounted, App2 rendered
// dispose() from first render still works
```

**Mount node removed**:

```typescript
const dispose = render(App, container);
container.remove(); // Mount node removed from DOM
dispose(); // Still works, cleanup runs
```

**Synchronous component**:

```typescript
const App = () => h.div({}, "Sync");
render(App, container); // Synchronous render
```

**Async component**:

```typescript
const App = async () => {
  const data = await fetchData();
  return h.div({}, data);
};
// Won't work - render expects synchronous function
```

## Test Coverage

Expected: 100% coverage for render with valid/invalid mount nodes, component types, cleanup
