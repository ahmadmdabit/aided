# For.ts

**Purpose**: Efficiently renders lists with reactive updates using keyed reconciliation based on the Longest Increasing Subsequence (LIS) algorithm.

## API

```typescript
For<T>({
  each: SignalGetter<T[]>,
  children: (item: SignalGetter<T>, index: SignalGetter<number>) => Node | null,
  key?: (item: T, index: number) => string | number
}): Node
```

## Usage

```typescript
const [items, setItems] = createSignal([1, 2, 3]);

const list = For({
  each: items,
  key: (item) => item, // Optional: improves performance for non-primitives
  children: (item, index) => h.li(`Item ${item()} at index ${index()}`),
});

// Update items - LIS minimizes DOM operations
setItems([1, 3, 2, 4]); // Only moves/inserts needed nodes
```

## Key Concepts

- **Keyed Reconciliation**: Uses optional key function for stable item identity, falling back to array index
- **LIS Algorithm**: Minimizes DOM operations by identifying stable subsequences during list updates
- **Three-Pass Reconciliation**: Create/update items, remove old items, efficiently move remaining items
- **Null Child Handling**: Components can return null/undefined to conditionally exclude items
- **Reactive Scope Isolation**: Each item gets its own createRoot for automatic cleanup

## Implementation Notes

### Three-Pass Reconciliation Algorithm

1. **Pass 1 - Create/Update Items**:
   - Iterates through new items
   - Creates new items within their own `createRoot` scope
   - Updates existing items by modifying their data/index signals
   - **Null handling**: If `children()` returns null/undefined, the item is skipped and its root is immediately disposed

2. **Pass 2 - Remove Old Items**:
   - Identifies items present in old map but not in new map
   - Calls `disposer()` on each, triggering cleanup effects

3. **Pass 3 - Move Items with LIS**:
   - Uses `longestIncreasingSubsequence()` to identify stable items
   - Inserts new items at correct positions
   - Moves unstable items to new positions
   - Leaves stable items in place (minimal DOM operation)

### Null Child Handling

When `children()` returns null or undefined:

```typescript
// THE FIX: Proper null child handling
if (node == null) {
  disposer();
  continue; // Skip to next item in loop
}
```

**Why this matters**:

- Prevents null references in the mapped items map
- Disposes the root immediately to clean up item/index signals
- Avoids creating empty DOM nodes
- Maintains correct index signals for subsequent items

**Why disposer must be called before continue**:

- The `createRoot` has already been created with item/index signals
- These signals must be disposed to prevent memory leaks
- The `onCleanup` in the root will never run if we don't dispose
- Continuing without disposal leaks signal reactivity and DOM references

### End Marker Pattern

```typescript
const endMarker = document.createTextNode("");
container.appendChild(endMarker);
```

The end marker provides a stable anchor point for all DOM insertions. All insertions use `parent.insertBefore(node, endMarker)` which ensures:

- New items are always inserted before the marker
- Moved items maintain correct relative positions
- No need to track the last inserted node separately

### Dev Warning for Missing Keys

```typescript
devWarning(
  !!key || !newItems.some((item) => typeof item !== "object" || item === null),
  "The `For` component is being used with an array of primitives without a `key` prop. This can lead to inefficient re-rendering. Please provide a `key` function.",
);
```

This warning alerts developers when primitives are used without explicit keys, which forces reconciliation based on array index and can cause:

- Unnecessary re-renders when items are inserted/removed
- State loss in child components
- Incorrect DOM node updates

## Security

No specific security concerns. The component only manipulates DOM nodes and manages reactive scopes.

## Performance Considerations

- **LIS algorithm complexity**: O(n log n) for large arrays, O(n) for small arrays (<64)
- **Zero-allocation path**: `workBuffer` parameter allows reusing Uint32Array in hot paths
- **Adaptive threshold**: Configurable via `configureLIS({ smallArrayThreshold: number })`
- **Signal updates**: Modifying existing items only updates their signals, not re-creating DOM
- **Stable nodes**: Items identified as stable by LIS require no DOM operations

## Edge Cases

- Empty arrays: Returns empty DocumentFragment with end marker
- All items removed: All roots disposed, empty container remains
- Mixed null/undefined children: Properly skipped with cleanup
- Duplicate keys: Last occurrence wins (map behavior)
- Non-primitive items without key: Inefficient index-based reconciliation
