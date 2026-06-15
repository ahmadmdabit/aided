import { h } from '../h';
import { For } from './For';
import { createVirtualizer } from './virtualizer';
import type { SignalGetter, Attribute } from '../types';

/**
 * Props for configuring the VirtualFor scroll container element.
 * Allows customization of the container's appearance and attributes.
 */
interface VirtualForContainerProps {
  /** CSS class name(s) for the scroll container */
  className?: string;
  /** Inline styles for the scroll container */
  style?: Record<string, string | SignalGetter<string>>;
  /** Custom attributes to apply to the container (e.g., data-testid, aria-label) */
  attributes?: Attribute[];
}

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
  /** Optional placeholder element to show while scrolling or for empty slots */
  placeholder?: HTMLElement;
  /** Number of extra items to render outside visible area (default: 5) */
  overscan?: number;
  /** Optional configuration for the scroll container element */
  containerProps?: VirtualForContainerProps;
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
 * // Simple usage
 * const virtualList = VirtualFor({
 *   each: items,
 *   itemHeight: 50,
 *   children: (item, index) => h.div({}, `${index}: ${item.text}`)
 * });
 *
 * // With placeholder for loading states
 * const loadingPlaceholder = h.div({ 
 *   style: { height: '50px', background: '#f0f0f0' } 
 * }, 'Loading...');
 *
 * const listWithPlaceholder = VirtualFor({
 *   each: items,
 *   itemHeight: 50,
 *   placeholder: loadingPlaceholder,
 *   children: (item, index) => h.div({}, `${index}: ${item.text}`)
 * });
 *
 * // With container customization
 * const customList = VirtualFor({
 *   each: items,
 *   itemHeight: 50,
 *   overscan: 3,
 *   containerProps: {
 *     className: 'my-scroller',
 *     style: { height: '400px' },
 *     attributes: [
 *       { name: 'data-testid', value: 'virtual-list' },
 *       { name: 'aria-label', value: 'Virtualized item list' }
 *     ]
 *   },
 *   children: (item, index) => h.div({}, `${index}: ${item.text}`)
 * });
 * ```
 */
export function VirtualFor<T>(props: VirtualForProps<T>): HTMLElement {
  const { each, children, itemHeight, overscan, containerProps, placeholder } = props;

  const virtualizer = createVirtualizer({
    items: each,
    itemHeight,
    overscan,
  });

  // Extract container props with defaults
  const className = containerProps?.className;
  const customStyle = containerProps?.style || {};
  const customAttributes = containerProps?.attributes || [];

  // Filter out dangerous attributes that could break functionality
  const safeAttributes = customAttributes.filter(
    (attr) => !['ref', 'role', 'style', 'class', 'className'].includes(attr.name)
  );

  // Build container attributes object
  const containerAttrs: Record<string, unknown> = {
    ref: virtualizer.setContainer,
    class: className,
    role: 'list',
    style: {
      overflow: 'auto',
      height: '100%',
      ...customStyle,
    },
  };

  // Apply safe custom attributes
  safeAttributes.forEach((attr) => {
    containerAttrs[attr.name] = attr.value;
  });

  const container = h.div(containerAttrs);

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
      
      // If placeholder is provided and data is not yet available, show placeholder
      if (placeholder && !it.data) {
        const placeholderClone = placeholder.cloneNode(true) as HTMLElement;
        placeholderClone.style.height = `${itemHeight}px`;
        return placeholderClone;
      }
      
      return children(it.data as T, it.index);
    },
  });

  content.appendChild(renderedItems);
  sizer.appendChild(content);
  container.appendChild(sizer);

  return container;
}
