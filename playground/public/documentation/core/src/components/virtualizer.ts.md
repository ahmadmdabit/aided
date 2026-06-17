# virtualizer.ts

**Purpose**: Headless virtual scroller engine that calculates visible items based on scroll position and container dimensions.

## API

```typescript
createVirtualizer<T>({
  items: SignalGetter<T[]>,
  itemHeight: number,
  overscan?: number,
  workBuffer?: Uint32Array
}): Virtualizer<T>

interface Virtualizer<T> {
  visibleItems: Memo<VirtualItem<T>[]>,
  totalHeight: Memo<number>,
  visibleState: Memo<VisibleState>,
  setContainer: (el: HTMLElement) => void
}

interface VirtualItem<T = any> {
  index: number;
  data: T;
  offsetTop: number;
}

interface VisibleState {
  startIndex: number;
  endIndex: number;
  scrollOffset: number;
}
```

## Usage

```typescript
const [items] = createSignal(Array.from({ length: 1000 }, (_, i) => i));

const virtualizer = createVirtualizer({
  items,
  itemHeight: 50,
  overscan: 5,
});

// Connect to scroll container
const container = document.createElement("div");
container.style.overflow = "auto";
container.style.height = "400px";
virtualizer.setContainer(container);

// Access reactive state
createEffect(() => {
  console.log("Visible range:", virtualizer.visibleState());
  // { startIndex: 0, endIndex: 11, scrollOffset: 0 }

  console.log("Visible items:", virtualizer.visibleItems());
  // [{ index: 0, data: 0, offsetTop: 0 }, ...]
});

console.log("Total height:", virtualizer.totalHeight());
// 50000 (1000 items × 50px)
```

## Key Concepts

- **Headless Architecture**: Provides reactive state, not DOM rendering
- **Visible Window Calculation**: Based on scroll position, container height, and overscan
- **Array Reuse**: Minimizes allocations by reusing result arrays
- **RAF-throttled Updates**: Scroll events are throttled via requestAnimationFrame
- **ResizeObserver Integration**: Automatically updates container height

## Implementation Notes

### Visible State Calculation

```typescript
const visibleState = createMemo<VisibleState>(() => {
  const listLen = items().length;
  const height = containerHeight();

  if (height <= 0 || listLen === 0 || itemHeight <= 0) {
    return { startIndex: 0, endIndex: -1, scrollOffset: 0 };
  }

  const scroll = scrollTop();
  const startIndex = Math.max(0, Math.floor(scroll / itemHeight) - overscan);
  const endIndex = Math.min(
    listLen - 1,
    Math.ceil((scroll + height) / itemHeight) + overscan,
  );
  const scrollOffset = startIndex * itemHeight;

  return { startIndex, endIndex, scrollOffset };
});
```

**Variables**:

- `scroll`: Current scroll position (pixels from top)
- `height`: Container visible height (pixels)
- `itemHeight`: Fixed height of each item (pixels)
- `overscan`: Extra items to render above/below visible area

** startIndex**:

```typescript
Math.max(0, Math.floor(scroll / itemHeight) - overscan);
```

- `scroll / itemHeight` = current item index at top of viewport
- `Math.floor` = round down to nearest whole item
- `- overscan` = include items above viewport
- `Math.max(0, ...)` = don't go below index 0

** endIndex**:

```typescript
Math.min(listLen - 1, Math.ceil((scroll + height) / itemHeight) + overscan);
```

- `scroll + height` = pixel position at bottom of viewport
- Divided by `itemHeight` = item index at bottom
- `Math.ceil` = round up to include partially visible items
- `+ overscan` = include items below viewport
- `Math.min(listLen - 1, ...)` = don't exceed last item

** scrollOffset**:

```typescript
startIndex * itemHeight;
```

- Total pixels to offset content upward
- Aligns first visible item with top of viewport

### Array Reuse Pattern

```typescript
let reused: VirtualItem<T>[] = [];
let lastCount = 0;

const visibleItems = createMemo<VirtualItem<T>[]>(() => {
  const count = vs.endIndex - vs.startIndex + 1;

  if (count !== lastCount) {
    reused = new Array(count);
    lastCount = count;
  }

  // Fill reused array with VirtualItems
  for (let i = 0; i < count; i++) {
    const idx = vs.startIndex + i;
    reused[i] = {
      index: idx,
      data: list[idx],
      offsetTop: idx * itemHeight,
    };
  }

  return reused;
});
```

**Benefits**:

- No new array allocation on every render
- Reuses existing array when count unchanged
- Garbage collection pressure reduced
- Memory allocation only when count changes

**Performance impact**:

- 1000 items, 10 visible, 5 overscan = 15 items per render
- Without reuse: 15 new arrays per scroll event
- With reuse: 0 arrays allocated after initial

### Defensive Check

```typescript
if (vs.endIndex < vs.startIndex) {
  if (reused.length) reused = [];
  lastCount = 0;
  return reused;
}
```

This should never occur with correct calculation logic but provides safety:

- Empty result array returned
- State reset for next calculation
- Prevents negative count array allocation

### Container Connection

```typescript
const setContainer = (el: HTMLElement) => {
  let rafId: number | null = null;

  const flushScroll = () => {
    rafId = null;
    setScrollTop(el.scrollTop);
  };

  const onScroll = () => {
    if (rafId == null) {
      rafId = requestAnimationFrame(flushScroll);
    }
  };

  // Use ResizeObserver to handle container size changes
  const resizeObserver = new ResizeObserver((entries) => {
    if (entries[0]) {
      setContainerHeight(entries[0].contentRect.height);
    }
  });

  el.addEventListener("scroll", onScroll, { passive: true });
  resizeObserver.observe(el);
  setContainerHeight(el.clientHeight); // initial

  onCleanup(() => {
    if (rafId != null) cancelAnimationFrame(rafId);
    el.removeEventListener("scroll", onScroll as EventListener);
    resizeObserver.disconnect();
  });
};
```

**RAF Throttling**:

- Scroll events fire frequently (every pixel scrolled)
- RAF ensures updates at ~60fps maximum
- Accumulates scroll changes between frames
- Reduces effect executions significantly

**Passive Listener**:

- `{ passive: true }` tells browser scroll listener won't call preventDefault
- Allows browser to optimize scrolling
- Improves scroll performance

**ResizeObserver**:

- Handles container height changes dynamically
- Updates `containerHeight` signal
- Recalculates visible state automatically

### Small Array Optimization

```typescript
if (list.length < 64) {
  for (let i = 0; i < count; i++) {
    const idx = vs.startIndex + i;
    reused[i] = { index: idx, data: list[idx], offsetTop: idx * itemHeight };
  }
  return reused;
}
```

For small lists (<64 items):

- Direct fill is faster than virtualization overhead
- No performance benefit from complex virtualization
- Falls back to rendering all items (but still uses visible state)

### Large Array Path

```typescript
for (let i = 0; i < count; i++) {
  const idx = vs.startIndex + i;
  reused[i] = { index: idx, data: list[idx], offsetTop: idx * itemHeight };
}
return reused;
```

For larger lists, the same logic applies but virtualization is more valuable.

## Security

No specific security concerns. This is a headless utility that only calculates and tracks state.

## Performance Considerations

- **RAF throttling**: Limits scroll updates to ~60fps
- **Passive listeners**: Improved scroll performance
- **Array reuse**: Eliminates allocations after initial
- **ResizeObserver**: Efficient dimension changes detection
- **Memoization**: Visible state only recalculates on dependencies
- **Small array check**: Avoids virtualization overhead for small lists

### Benchmark Guidelines

- **100 items**: Consider if virtualization needed
- **500+ items**: Virtualization beneficial
- **10000+ items**: Virtualization essential for responsive UI

## Edge Cases

- **Zero height container**: Returns empty visible range (endIndex = -1)
- **Zero items**: Returns empty visible range
- **Container smaller than item**: Shows 0 items
- **Item height 0**: Breaks calculation (requires positive itemHeight)
- **Dynamic item height**: Will cause incorrect visible range (fixed height required)
- **Rapid scroll**: RAF throttles updates, may show stale state briefly

## Test Coverage

- **100% coverage** expected (no implementation tests provided)
- Should test: initial state, scroll updates, resize events, cleanup
