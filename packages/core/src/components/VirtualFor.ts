import { h } from '../h';
import { For } from './For';
import { createVirtualizer } from './virtualizer';
import type { SignalGetter } from '../types';

/**
 * Props for the VirtualFor component that renders large lists efficiently.
 */
interface VirtualForProps<T> {
  /** Signal containing the array of items to virtualize */
  each: SignalGetter<T[]>;
  /** Fixed height of each item in pixels */
  itemHeight: number;
  /** Function that renders each item, receiving the item data and its index */
  children: (item: T, index: number) => HTMLElement;
  /** Optional placeholder element to show while scrolling */
  placeholder?: HTMLElement;
  /** Number of extra items to render outside visible area (default: 5) */
  overscan?: number;
  /** Optional CSS class for the scroll container */
  class?: string;
  /** Optional styles for the scroll container */
  style?: Record<string, string | SignalGetter<string>>;
}

/**
 * Renders large lists efficiently by only rendering visible items and a small buffer.
 *
 * VirtualFor uses a virtual scroller that calculates which items should be visible
 * based on scroll position and container height. Only visible items plus an overscan
 * buffer are rendered, making it suitable for lists with thousands of items.
 *
 * @param props Configuration object with list data, item height, and render function
 * @returns An HTMLElement containing the virtualized list with scroll container
 *
 * @example
 * ```typescript
 * const [items] = createSignal(Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` })));
 *
 * const virtualList = VirtualFor({
 *   each: items,
 *   itemHeight: 50, // Each item is 50px tall
 *   overscan: 3,    // Render 3 extra items outside visible area
 *   children: (item, index) => h.div({
 *     style: { height: '50px', border: '1px solid #ccc' }
 *   }, `${index}: ${item.text}`)
 * });
 * ```
 */
export function VirtualFor<T>(props: VirtualForProps<T>): HTMLElement {
  const { each, children, itemHeight, overscan, class: className, style } = props;

  const virtualizer = createVirtualizer({
    items: each,
    itemHeight,
    overscan,
  });

  const container = h.div({
    ref: virtualizer.setContainer,
    class: className,
    role: 'list',
    style: {
      overflow: 'auto',
      height: '100%',
      ...style,
    },
  });

  const sizer = h.div({
    style: {
      position: 'relative',
      height: () => `${virtualizer.totalHeight()}px`,
    },
  });

  const content = h.div({
    style: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      willChange: 'transform',
      contain: 'layout',
      transform: () => `translate3d(0, ${virtualizer.visibleState().scrollOffset}px, 0)`,
    },
  });

  const renderedItems = For({
    each: virtualizer.visibleItems,
    key: (item) => item.index,
    children: (itemSignal) => {
      const it = itemSignal();
      return children(it.data as T, it.index);
    },
  });

  content.appendChild(renderedItems);
  sizer.appendChild(content);
  container.appendChild(sizer);

  return container;
}
