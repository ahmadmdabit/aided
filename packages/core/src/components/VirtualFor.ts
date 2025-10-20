import { h } from '../h';
import { For } from './For';
import { createVirtualizer } from './virtualizer';
import type { SignalGetter } from '../types';

interface VirtualForProps<T> {
  each: SignalGetter<T[]>;
  itemHeight: number;
  children: (item: T, index: number) => HTMLElement;
  placeholder?: HTMLElement;
  overscan?: number;
  class?: string;
  style?: Record<string, string | SignalGetter<string>>;
}

export function VirtualFor<T>(props: VirtualForProps<T>): HTMLElement {
  const { each, children, itemHeight, overscan, class: className, style } = props; //, placeholder

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
