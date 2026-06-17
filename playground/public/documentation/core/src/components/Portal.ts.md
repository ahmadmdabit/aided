# Portal.ts

**Purpose**: Renders children into a different part of the DOM tree while maintaining reactive scope and cleanup.

## API

```typescript
Portal({
  mount: Element,
  children: Node
}): Comment
```

## Usage

```typescript
// Render a modal into document.body from a deeply nested component
Portal({
  mount: document.body,
  children: h.div({ class: "modal" }, "Modal content"),
});

// Track the placeholder node for positioning
const placeholder = Portal({
  mount: document.getElementById("tooltip-container")!,
  children: h.div({ class: "tooltip" }, "Tooltip text"),
});
// placeholder remains in original tree, children moved to mount
```

## Key Concepts

- **DOM Reparenting**: Moves children from original location to mount target
- **DocumentFragment Handling**: Special tracking for DocumentFragment children
- **Reactive Scope Preservation**: Children retain reactive connections to original root
- **Placeholder Return**: Returns comment node marking original position
- **Automatic Cleanup**: Removes children from mount on scope disposal

## Implementation Notes

### DocumentFragment Child Tracking

**The Problem**:
When a `DocumentFragment` is appended to a parent, it is emptied automatically:

```typescript
const fragment = document.createDocumentFragment();
const child = h.div("Content");
fragment.appendChild(child);

// At this point, fragment.childNodes.length === 0
// The child is now in the fragment's owner document
```

This causes a problem for cleanup because:

- We append the fragment to the mount target
- The fragment becomes empty
- We can't track what was inside anymore
- Cleanup would have nothing to remove

**The Fix**:

```typescript
const nodes =
  children instanceof DocumentFragment
    ? Array.from(children.childNodes)
    : [children];

nodes.forEach((node) => mount.appendChild(node));
```

By extracting child nodes before insertion:

1. We capture the actual DOM nodes in an array
2. These nodes are tracked for cleanup
3. Even if children was a fragment, we know what was inside
4. Cleanup can remove the exact nodes that were moved

### Why This Matters for Security

If we didn't track the nodes explicitly:

```typescript
// WRONG: This would fail on cleanup
mount.appendChild(children); // children is emptied
// What do we clean up? We don't know anymore!
onCleanup(() => {
  // No way to know what was inside the fragment
});
```

### Cleanup Pattern

```typescript
onCleanup(() => {
  nodes.forEach((node) => {
    if (node.parentNode === mount) {
      mount.removeChild(node);
    }
  });
});
```

The `if (node.parentNode === mount)` check ensures:

- Only removes nodes that are actually in the mount target
- Prevents errors if nodes were moved by user code
- Gracefully handles race conditions

### Return Value: Comment Node Placeholder

The comment node returned serves as:

1. **Position Marker**: Remains in original location
2. **Debugging Aid**: Visible in DevTools as `<!--portal-->`
3. **Insertion Reference**: Can be used to find portal location

However, the placeholder is NOT automatically removed. It remains in the DOM to preserve document structure. If the portal is conditionally rendered, the placeholder stays even when children are removed.

### Use Cases

**Modal Windows**:

```typescript
// Deeply nested component renders into body
Portal({
  mount: document.body,
  children: h.div({ class: "modal-overlay" }, modalContent),
});
```

**Toasts/Notifications**:

```typescript
Portal({
  mount: document.getElementById("toast-container")!,
  children: h.div({ class: "toast" }, message),
});
```

**Floating Elements**:

```typescript
Portal({
  mount: document.body,
  children: h.div({ class: "tooltip" }, tooltipContent),
});
```

## Security

No specific security concerns. The component moves DOM nodes but doesn't execute code.

### Potential Pitfalls

- **Mount target validation**: Caller must ensure mount target exists
- **Duplicate children**: Moving same node to multiple portals causes errors
- **Cleanup timing**: Portal cleanup runs when owner scope disposes, not when condition changes

## Performance Considerations

- Direct `appendChild` is optimal for DOM operations
- Node tracking array allocation is minimal (O(n) where n = child count)
- No reactive overhead beyond standard `onCleanup`
- DocumentFragment detection is O(1)

## Edge Cases

- Single Node: Wrapped in `[children]` array
- Multiple children: Each tracked individually
- Null/undefined children: Results in empty nodes array
- Same node in multiple portals: Throws error (node already in new parent)
- Mount target removed: Cleanup attempts removal, throws NotFoundError (handled by if check)
- Portal inside Show: Portal cleanup runs when Show disposes root, not when condition changes
