# Show.ts

**Purpose**: Conditionally renders content based on a reactive boolean condition, efficiently switching between children and fallback content.

## API

```typescript
Show<T>({
  when: SignalGetter<T>,
  fallback?: () => Node,
  children: () => Node
}): Node
```

## Usage

```typescript
const [isLoggedIn, setLoggedIn] = createSignal(false);

const content = Show({
  when: isLoggedIn,
  fallback: () => h.div("Please log in"),
  children: () => h.div("Welcome back!"),
});

// Shows "Please log in" initially
// Switches to "Welcome back!" when logged in
setLoggedIn(true);
```

## Key Concepts

- **Conditional Rendering**: Shows children when `when()` is truthy, fallback when falsy
- **Separate Reactive Scopes**: Each branch (children/fallback) gets its own createRoot
- **Stable Insertion Point**: Uses end marker for efficient DOM manipulations
- **Explicit DOM Cleanup**: Removes nodes from DOM before creating new branch
- **Memory Management**: Always cleans up previous branch before rendering new one

## Implementation Notes

### The Container Problem

`DocumentFragment` has no `textContent` property. Setting `container.textContent = ''` has no effect and was insufficient for removing content.

**The Fix:**

```typescript
let currentDisposer: Disposer | null = null;

createEffect(() => {
  const condition = !!when();

  // Always clean up the previous state before rendering the new one
  if (currentDisposer) {
    currentDisposer();
    // Removed: container.textContent = ''; (invalid on DocumentFragment)
  }

  const renderer = condition ? children : fallback;
  let branchElement: Node | null = null;

  if (renderer) {
    currentDisposer = createRoot(() => {
      branchElement = renderer();
      // Added: Explicit cleanup to remove the node from DOM on dispose
      onCleanup(() => {
        if (branchElement && branchElement.parentNode) {
          branchElement.parentNode.removeChild(branchElement);
        }
      });
    });
  } else {
    currentDisposer = null;
  }

  // Added: Insert the new branch before the endMarker
  if (branchElement) {
    endMarker.parentNode!.insertBefore(branchElement, endMarker);
  }
});
```

### Why Explicit DOM Removal is Required

When `currentDisposer()` runs, it:

1. Calls all cleanups registered with `onCleanup`
2. The `onCleanup` in the branch's root removes the node from DOM
3. Only then is the DOM actually updated

Without explicit removal in `onCleanup`:

- The branch element exists in the root's scope
- When the root disposes, the element is garbage collected
- But the element may still be in the DOM, causing orphaned nodes
- Memory leaks and unexpected DOM state

### End Marker Usage

The end marker (`document.createTextNode('')`) serves as a stable anchor:

- All insertions use `insertBefore(branchElement, endMarker)`
- No need to track the last inserted node
- Works consistently whether inserting first child or replacing
- Provides predictable insertion behavior

### Fallback Handling

When `fallback` is undefined:

- The `renderer` variable may be undefined
- The branch is not created at all
- `currentDisposer` becomes null
- No content is rendered (not even an empty placeholder)

Example:

```typescript
// Only shows content when condition is true, nothing when false
Show({
  when: isLoggedIn,
  children: () => h.div("Welcome!"),
});
```

### Cleanup Order

The cleanup order ensures:

1. Previous branch's root is disposed (via `currentDisposer()`)
2. All cleanup effects in that root run
3. DOM nodes are removed by the `onCleanup` handlers
4. New branch is created in the now-empty container
5. No duplicate or orphaned nodes exist

## Security

No specific security concerns. The component only conditionally renders DOM nodes.

## Performance Considerations

- Each condition switch disposes one root and creates another
- For frequently toggling conditions, consider using `createMemo` to cache branches
- The end marker pattern minimizes DOM operations during switching
- No unnecessary re-renders of siblings or parent containers

## Edge Cases

- Empty condition: `when()` returns falsy value → renders fallback or nothing
- Switching to undefined fallback: Renders nothing (not even empty node)
- Multiple rapid toggles: Each triggers full cleanup and recreation
- Null/undefined in `when()`: Treated as falsy (shows fallback)
- Children returning null: Creates root with null, which is inserted as null node
