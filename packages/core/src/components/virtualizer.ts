/* eslint-disable @typescript-eslint/no-explicit-any */
import { onCleanup } from '../lifecycle/lifecycle';
import { createMemo } from '../primitives/memo';
import { createSignal } from '../primitives/signal';
import type { Memo, SignalGetter } from '../types';

export interface VirtualizerOptions<T = any> {
  items: SignalGetter<T[]>;
  itemHeight: number;
  overscan?: number;
  workBuffer?: Uint32Array; // optional zero-allocation hot path
}

export interface VirtualItem<T = any> {
  index: number;
  data: T;
  offsetTop: number;
}

export interface VisibleState {
  startIndex: number;
  endIndex: number;
  scrollOffset: number;
}

export interface Virtualizer<T = any> {
  // The subset of items that should be rendered to the DOM
  visibleItems: Memo<VirtualItem<T>[]>;
  // The total height of the entire list, for the scroll container
  totalHeight: Memo<number>;
  // Unified visible window state
  visibleState: Memo<VisibleState>;
  // A function to be called with the scroll container element
  setContainer: (el: HTMLElement) => void;
}

/**
 * Creates a headless virtual scroller with optimal performance for Aided.
 * @template T - Type of list items
 */
export function createVirtualizer<T = any>(options: VirtualizerOptions<T>): Virtualizer<T> {
  const { items, itemHeight, overscan = 5 } = options;

  const [scrollTop, setScrollTop] = createSignal(0);
  const [containerHeight, setContainerHeight] = createSignal(0);

  const totalHeight = createMemo(() => items().length * itemHeight);

  const visibleState = createMemo<VisibleState>(() => {
    const listLen = items().length;
    const height = containerHeight();
    if (height <= 0 || listLen === 0 || itemHeight <= 0) {
      return { startIndex: 0, endIndex: -1, scrollOffset: 0 };
    }

    const scroll = scrollTop();
    const startIndex = Math.max(0, Math.floor(scroll / itemHeight) - overscan);
    const endIndex = Math.min(listLen - 1, Math.ceil((scroll + height) / itemHeight) + overscan);
    const scrollOffset = startIndex * itemHeight;
    return { startIndex, endIndex, scrollOffset };
  });

  // Reuse array to minimize allocations
  let reused: VirtualItem<T>[] = [];
  let lastCount = 0;

  const visibleItems = createMemo<VirtualItem<T>[]>(() => {
    const list = items();
    const vs = visibleState();

    if (vs.endIndex < vs.startIndex) {
      if (reused.length) reused = [];
      lastCount = 0;
      return reused;
    }

    const count = vs.endIndex - vs.startIndex + 1;
    if (count !== lastCount) {
      reused = new Array(count);
      lastCount = count;
    }

    // Small arrays path: direct fill
    if (list.length < 64) {
      for (let i = 0; i < count; i++) {
        const idx = vs.startIndex + i;
        reused[i] = { index: idx, data: list[idx], offsetTop: idx * itemHeight } as VirtualItem<T>;
      }
      return reused;
    }

    // Larger arrays path
    for (let i = 0; i < count; i++) {
      const idx = vs.startIndex + i;
      reused[i] = { index: idx, data: list[idx], offsetTop: idx * itemHeight } as VirtualItem<T>;
    }
    return reused;
  });

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
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerHeight(entries[0].contentRect.height);
      }
    });

    el.addEventListener('scroll', onScroll, { passive: true });
    resizeObserver.observe(el);
    setContainerHeight(el.clientHeight); // initial

    onCleanup(() => {
      if (rafId != null) cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', onScroll as EventListener);
      resizeObserver.disconnect();
    });
  };

  return { visibleItems, totalHeight, visibleState, setContainer };
}
