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

  it('should apply safe custom attributes from containerProps', () => {
    const [items] = createSignal([{ id: 1, text: 'Item 1' }]);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        containerProps: {
          attributes: [
            { name: 'data-testid', value: 'virtual-list' },
            { name: 'aria-label', value: 'Virtualized list' },
          ],
        },
        children: (item) => {
          const el = document.createElement('div');
          el.textContent = item.text;
          return el;
        },
      });
      root.appendChild(list);
    });

    const container = root.querySelector('[role="list"]') as HTMLElement;
    expect(container?.getAttribute('data-testid')).toBe('virtual-list');
    expect(container?.getAttribute('aria-label')).toBe('Virtualized list');
  });

  it('should filter out dangerous attributes from containerProps', () => {
    const [items] = createSignal([{ id: 1, text: 'Item 1' }]);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        containerProps: {
          attributes: [
            { name: 'data-testid', value: 'safe-attribute' },
            { name: 'ref', value: 'should-be-filtered' },
            { name: 'role', value: 'should-be-filtered' },
            { name: 'style', value: 'should-be-filtered' },
            { name: 'class', value: 'should-be-filtered' },
            { name: 'className', value: 'should-be-filtered' },
          ],
        },
        children: (item) => {
          const el = document.createElement('div');
          el.textContent = item.text;
          return el;
        },
      });
      root.appendChild(list);
    });

    const container = root.querySelector('[role="list"]') as HTMLElement;
    
    // Safe attribute should be applied
    expect(container?.getAttribute('data-testid')).toBe('safe-attribute');
    
    // Role should still be 'list' (not overridden by dangerous attribute)
    expect(container?.getAttribute('role')).toBe('list');
    
    // Dangerous attributes should NOT be applied
    expect(container?.getAttribute('ref')).toBeNull();
  });

  it('should apply className and style from containerProps', () => {
    const [items] = createSignal([{ id: 1, text: 'Item 1' }]);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items,
        itemHeight: 30,
        containerProps: {
          className: 'custom-class',
          style: { backgroundColor: 'red' },
        },
        children: (item) => {
          const el = document.createElement('div');
          el.textContent = item.text;
          return el;
        },
      });
      root.appendChild(list);
    });

    const container = root.querySelector('[role="list"]') as HTMLElement;
    expect(container?.classList.contains('custom-class')).toBe(true);
    expect(container?.style.backgroundColor).toBe('red');
  });

  it('should render placeholder for empty/undefined data slots when placeholder is provided', async () => {
    // Create a placeholder element
    const placeholderEl = document.createElement('div');
    placeholderEl.className = 'placeholder-item';
    placeholderEl.textContent = 'Loading...';
    placeholderEl.style.backgroundColor = 'lightgray';

    // Create a sparse array with undefined values to trigger placeholder rendering
    const sparseArray: Array<{ id: number; text: string } | undefined> = [
      { id: 1, text: 'Item 1' },
      undefined, // This will trigger placeholder
      { id: 3, text: 'Item 3' },
      undefined, // This will trigger placeholder
      { id: 5, text: 'Item 5' },
    ];
    
    const [items] = createSignal(sparseArray);

    disposeRoot = createRoot(() => {
      const list = VirtualFor({
        each: items as any,
        itemHeight: 50,
        placeholder: placeholderEl,
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

    // Verify placeholders are rendered for undefined slots
    const placeholders = root.querySelectorAll('.placeholder-item');
    expect(placeholders.length).toBeGreaterThan(0);
    
    // Verify placeholder has correct height
    const firstPlaceholder = placeholders[0] as HTMLElement;
    expect(firstPlaceholder.style.height).toBe('50px');
    
    // Verify placeholder content is cloned
    expect(firstPlaceholder.textContent).toBe('Loading...');
    expect(firstPlaceholder.style.backgroundColor).toBe('lightgray');
    
    // Verify real items are also rendered
    const realItems = root.querySelectorAll('.virtual-item');
    expect(realItems.length).toBeGreaterThan(0);
  });
});
