# VirtualFor.ts

**Purpose**: Renders large lists efficiently by virtualizing off-screen items, only rendering visible items plus an overscan buffer.

## API

```typescript
VirtualFor<T>({
  each: SignalGetter<T[]>,
  itemHeight: number,
  children: (item: T, index: number) => HTMLElement,
  placeholder?: HTMLElement,
  overscan?: number,
  containerProps?: VirtualForContainerProps
}): HTMLElement
```

## Usage

```typescript
const [items] = createSignal(
  Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` })),
);

// Simple usage
const virtualList = VirtualFor({
  each: items,
  itemHeight: 50,
  children: (item, index) => h.div({}, `${index}: ${item.text}`),
});

// With placeholder for loading states
const loadingPlaceholder = h.div(
  {
    style: { height: "50px", background: "#f0f0f0" },
  },
  "Loading...",
);

const listWithPlaceholder = VirtualFor({
  each: items,
  itemHeight: 50,
  placeholder: loadingPlaceholder,
  children: (item, index) => h.div({}, `${index}: ${item.text}`),
});

// With container customization
const customList = VirtualFor({
  each: items,
  itemHeight: 50,
  overscan: 3,
  containerProps: {
    className: "my-scroller",
    style: { height: "400px" },
    attributes: [
      { name: "data-testid", value: "virtual-list" },
      { name: "aria-label", value: "Virtualized item list" },
    ],
  },
  children: (item, index) => h.div({}, `${index}: ${item.text}`),
});
```

## Key Concepts

- **Virtualization Only Renders Visible Items**: Only items in visible window + overscan buffer
- **Headless Architecture**: `createVirtualizer` provides logic, VirtualFor handles rendering
- **Three-Layer DOM Structure**: Container (scroll) → Sizer (total height) → Content (transformed)
- **Placeholder Support**: Optional placeholder for sparse arrays or loading states
- **Container Customization**: Custom className, style, and attributes for scroll container

## Implementation Notes

### Virtualization Architecture

VirtualFor uses a headless virtualization pattern:

1. **createVirtualizer** provides reactive state:
   - `visibleItems`: Memo of items to render
   - `totalHeight`: Memo of full list height
   - `visibleState`: Memo of scroll window (startIndex, endIndex, scrollOffset)
   - `setContainer`: Callback to attach scroll listener

2. **DOM Structure**:

   ```html
   <div class="virtual-container" ref="setContainer">
     <div style="position: relative; height: 5000px;">
       <!-- Sizer -->
       <div style="position: absolute; transform: translate3d(0, 0px, 0);">
         <!-- Content -->
         <!-- Visible items rendered here -->
       </div>
     </div>
   </div>
   ```

3. **Three-Layer Pattern**:
   - **Container**: Scrollable element with `overflow: auto`
   - **Sizer**: Sets total height so scrollbar reflects full list
   - **Content**: Translated vertically to show correct window

### Placeholder Handling

**Purpose**: Shows temporary content while scrolling or for sparse arrays.

```typescript
const renderedItems = For({
  each: virtualizer.visibleItems,
  key: (item) => item.index,
  children: (itemSignal) => {
    const it = itemSignal();

    // If placeholder is provided and data is not yet available, show placeholder
    if (placeholder && !it.data) {
      const placeholderClone = placeholder.cloneNode(true) as HTMLElement;
      placeholderClone.style.height = `${itemHeight}px`;
      return placeholderClone;
    }

    return children(it.data as T, it.index);
  },
});
```

**When placeholder appears**:

- Sparse arrays: Items not yet loaded
- Fast scrolling: Items temporarily undefined during window shifts
- Loading states: Placeholder shows while data loads

**Clone behavior**:

- `cloneNode(true)` copies entire subtree
- Height style applied to match item height
- Each slot gets its own clone (no shared DOM)

### Container Attribute Sanitization

**Dangerous attributes filtered**:

```typescript
const safeAttributes = customAttributes.filter(
  (attr) => !["ref", "role", "style", "class", "className"].includes(attr.name),
);
```

**Why filter**:

- `ref`: Conflicts with virtualizer's `setContainer`
- `role`: Set explicitly to 'list' for accessibility
- `style`: Managed by virtualization (overflow, transform)
- `class`/`className`: Set via containerProps.className

### Overscan Behavior

**Default**: 5 items above/below visible window

**Purpose**:

- Prevents scrolling white space
- Allows smooth scrolling without flicker
- Pre-renders items user might see next

**Tuning**:

- Small lists (<100 items): Overscan doesn't matter much
- Large lists (1000+ items): Higher overscan = smoother scroll
- Mobile devices: Consider lower overscan for memory

### Performance Optimizations

**Array Reuse** (from createVirtualizer):

```typescript
let reused: VirtualItem<T>[] = [];
let lastCount = 0;

const visibleItems = createMemo<VirtualItem<T>[]>(() => {
  const count = vs.endIndex - vs.startIndex + 1;
  if (count !== lastCount) {
    reused = new Array(count);
    lastCount = count;
  }
  // ... fill reused array ...
  return reused;
});
```

**RAF-throttled scroll handling**:

```typescript
const onScroll = () => {
  if (rafId == null) {
    rafId = requestAnimationFrame(flushScroll);
  }
};
```

**Passive event listeners**:

```typescript
el.addEventListener("scroll", onScroll, { passive: true });
```

**ResizeObserver for container height**:

```typescript
const resizeObserver = new ResizeObserver((entries) => {
  if (entries[0]) {
    setContainerHeight(entries[0].contentRect.height);
  }
});
```

### Cleanup

```typescript
onCleanup(() => {
  if (rafId != null) cancelAnimationFrame(rafId);
  el.removeEventListener("scroll", onScroll as EventListener);
  resizeObserver.disconnect();
});
```

Cleans up:

- Animation frame
- Scroll event listener
- ResizeObserver

## Security

No specific security concerns. The component only manipulates DOM for virtualization.

### Potential Pitfalls

- **Height miscalculation**: If itemHeight doesn't match actual rendered height, scrolling will be wrong
- **Placeholder timing**: Placeholder shows when item.data is null/undefined, which may not be desired in all cases
- **Container dimensions**: Container must have fixed height or max-height for scrolling to work
- **Overscan too low**: Causes white space during fast scrolling
- **Overscan too high**: Renders unnecessary items, hurting performance

## Performance Considerations

- **Virtualization reduces DOM nodes**: Only renders visible + overscan
- **Array reuse minimizes GC**: Prevents allocations on each scroll
- **RAF throttling**: Limits scroll handlers to ~60fps
- **Passive listeners**: Improves scroll performance
- **CSS containment**: `contain: layout` hints browser optimization
- **willChange**: Hints browser to promote to own layer

### Benchmark Guidelines

- **100 items**: VirtualFor may not help much, overhead may outweigh benefits
- **500+ items**: VirtualFor shows clear performance benefits
- **10000+ items**: VirtualFor essential for responsive UI

## Edge Cases

- **Empty list**: Shows nothing (no container items)
- **All items fit**: VirtualFor still works, just renders all items
- **Dynamic item height**: Will cause scrolling issues (fixed height required)
- **Very small container**: May show 0 items if height < itemHeight
- **Invalid overscan**: Negative values treated as 0

## Test Coverage

- **100% coverage** (statements, branches, functions, lines)
- Tests include: initial render, scroll updates, resize handling, containerProps, placeholder rendering for sparse arrays
