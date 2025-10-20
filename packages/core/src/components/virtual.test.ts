/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualFor } from './VirtualFor';
import { createSignal } from '../primitives/signal';
import { createRoot } from '../lifecycle/lifecycle';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

// --- Mock for ResizeObserver ---
let mockObserverCallback: (entries: any[]) => void;
const originalResizeObserver = window.ResizeObserver;

class MockResizeObserver {
  constructor(callback: (entries: any[]) => void) {
    mockObserverCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  static trigger(entries: any[]) {
    mockObserverCallback(entries);
  }
}
// ---

describe('VirtualFor Component', () => {
  let root: HTMLElement;
  let disposeRoot: () => void;
  let originalClientHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    root = document.createElement('div');
    root.style.height = '300px';
    document.body.appendChild(root);

    originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 300 });

    // Apply the mock
    window.ResizeObserver = MockResizeObserver as any;
  });

  afterEach(() => {
    if (disposeRoot) disposeRoot();
    root.remove();
    if (originalClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
    }
    // Restore the original
    window.ResizeObserver = originalResizeObserver;
  });

  it('should render only the initial visible items', async () => {
    const largeList = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
    const [items] = createSignal(largeList);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        children: (item) => {
          const el = document.createElement('div');
          el.className = 'virtual-item';
          el.textContent = item.text;
          return el;
        },
      });
      root.appendChild(list);
    });

    await tick();

    const renderedCount = root.querySelectorAll('.virtual-item').length;
    expect(renderedCount).toBeLessThan(30);
    expect(renderedCount).toBeGreaterThan(10);
    expect(root.textContent).toContain('Item 0');
    expect(root.textContent).not.toContain('Item 50');
  });

  it('should update the visible items on scroll', async () => {
    const largeList = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
    const [items] = createSignal(largeList);
    let virtualContainer: HTMLElement;

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        children: (item) => {
          const el = document.createElement('div');
          el.className = 'virtual-item';
          el.textContent = item.text;
          return el;
        },
      });
      virtualContainer = list;
      root.appendChild(list);
    });

    await tick();

    virtualContainer!.scrollTop = 600;
    virtualContainer!.dispatchEvent(new Event('scroll'));
    await tick();

    expect(root.textContent).not.toContain('Item 0');
    expect(root.textContent).toContain('Item 20');
    expect(root.textContent).not.toContain('Item 70');
  });

  it('should update view on container resize', async () => {
    const largeList = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
    const [items] = createSignal(largeList);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        children: (item) => {
          const el = document.createElement('div');
          el.className = 'virtual-item';
          el.textContent = item.text;
          return el;
        },
      });
      root.appendChild(list);
    });

    await tick();
    const initialCount = root.querySelectorAll('.virtual-item').length;
    expect(initialCount).toBeGreaterThan(10); // Initial render check

    // Simulate a resize event making the container smaller
    MockResizeObserver.trigger([{ contentRect: { height: 150 } }]);
    await tick();

    const newRenderedCount = root.querySelectorAll('.virtual-item').length;
    expect(newRenderedCount).toBeLessThan(initialCount);
    expect(newRenderedCount).toBeGreaterThan(5); // 150px / 30px/item = 5 items + overscan
  });
});
