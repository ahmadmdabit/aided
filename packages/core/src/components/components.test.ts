import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSignal,
  createRoot,
  onCleanup,
  createEffect,
  Show,
  For,
} from '../index';

// Helper to wait for the next microtask queue flush
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Aided Control Flow', () => {
  let root: HTMLElement;
  let disposeRoot: () => void;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    if (disposeRoot) {
      disposeRoot();
    }
    root.remove();
  });

  describe('Show Component', () => {
    it('should render children when condition is initially true', () => {
      const [condition] = createSignal(true);
      disposeRoot = createRoot(() => {
        const view = Show({
          when: condition,
          children: () => {
            const el = document.createElement('p');
            el.textContent = 'Visible';
            return el;
          },
        });
        root.appendChild(view);
      });
      expect(root.innerHTML).toBe('<p>Visible</p>');
    });

    it('should render fallback when condition is initially false', () => {
      const [condition] = createSignal(false);
      disposeRoot = createRoot(() => {
        const view = Show({
          when: condition,
          fallback: () => {
            const el = document.createElement('span');
            el.textContent = 'Hidden';
            return el;
          },
          children: () => document.createElement('div'),
        });
        root.appendChild(view);
      });
      expect(root.innerHTML).toBe('<span>Hidden</span>');
    });

    it('should switch from children to fallback when condition changes', async () => {
      const [condition, setCondition] = createSignal(true);
      disposeRoot = createRoot(() => {
        const view = Show({
          when: condition,
          fallback: () => document.createTextNode('Fallback'),
          children: () => document.createTextNode('Children'),
        });
        root.appendChild(view);
      });

      expect(root.textContent).toBe('Children');
      setCondition(false);
      await tick();
      expect(root.textContent).toBe('Fallback');
    });

    it('should switch from fallback to children when condition changes', async () => {
      const [condition, setCondition] = createSignal(false);
      disposeRoot = createRoot(() => {
        const view = Show({
          when: condition,
          fallback: () => document.createTextNode('Fallback'),
          children: () => document.createTextNode('Children'),
        });
        root.appendChild(view);
      });

      expect(root.textContent).toBe('Fallback');
      setCondition(true);
      await tick();
      expect(root.textContent).toBe('Children');
    });

    it('should properly dispose effects within the children branch', async () => {
      const [condition, setCondition] = createSignal(true);
      const effectCleanupFn = vi.fn();
      const effectRunFn = vi.fn();

      disposeRoot = createRoot(() => {
        const view = Show({
          when: condition,
          children: () => {
            createEffect(() => {
              effectRunFn();
              onCleanup(effectCleanupFn);
            });
            return document.createElement('div');
          },
        });
        root.appendChild(view);
      });

      expect(effectRunFn).toHaveBeenCalledTimes(1);
      expect(effectCleanupFn).not.toHaveBeenCalled();

      // Switch to the fallback, which should trigger the cleanup
      setCondition(false);
      await tick();

      expect(effectCleanupFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('For Component', () => {
    it('should render a list of items', () => {
      const [items] = createSignal(['a', 'b', 'c']);
      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          children: (item) => {
            const el = document.createElement('li');
            el.textContent = item();
            return el;
          },
        });
        root.appendChild(list);
      });
      expect(root.innerHTML).toBe('<li>a</li><li>b</li><li>c</li>');
    });

    it('should add items to the end of the list', async () => {
      const [items, setItems] = createSignal(['a', 'b']);
      disposeRoot = createRoot(() => {
        const list = For({
          each: items, children: (item) => {
            const el = document.createElement('li');
            el.textContent = item();
            return el;
          }
        });
        root.appendChild(list);
      });

      expect(root.innerHTML).toBe('<li>a</li><li>b</li>');
      setItems(['a', 'b', 'c']);
      await tick();
      expect(root.innerHTML).toBe('<li>a</li><li>b</li><li>c</li>');
    });

    it('should remove items from the list', async () => {
      const [items, setItems] = createSignal(['a', 'b', 'c']);
      disposeRoot = createRoot(() => {
        const list = For({
          each: items, children: (item) => {
            const el = document.createElement('li');
            el.textContent = item();
            return el;
          }
        });
        root.appendChild(list);
      });

      expect(root.innerHTML).toBe('<li>a</li><li>b</li><li>c</li>');
      setItems(['a', 'c']);
      await tick();
      expect(root.innerHTML).toBe('<li>a</li><li>c</li>');
    });

    it('should re-order items correctly', async () => {
      // Use objects to ensure stable references for keyed logic
      const itemA = { id: 'a' };
      const itemB = { id: 'b' };
      const itemC = { id: 'c' };
      const [items, setItems] = createSignal([itemA, itemB, itemC]);

      // Keep a reference to the original DOM nodes
      const nodes = new Map();
      const listContainer = document.createElement('div'); // Create a container

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          children: (item) => {
            const el = document.createElement('li');
            el.textContent = item().id;
            nodes.set(item().id, el); // Store the node
            return el;
          },
        });
        listContainer.appendChild(list); // Append fragment to container
      });
      root.appendChild(listContainer); // Append container to the test root

      const initialNodes = Array.from(root.querySelectorAll('li'));
      expect(initialNodes[0]).toBe(nodes.get('a'));
      expect(initialNodes[1]).toBe(nodes.get('b'));
      expect(initialNodes[2]).toBe(nodes.get('c'));

      // Re-order the items
      setItems([itemC, itemB, itemA]);
      await tick();

      const reorderedNodes = Array.from(root.querySelectorAll('li'));
      // The DOM nodes themselves should be the same, just re-ordered
      expect(reorderedNodes[0]).toBe(nodes.get('c'));
      expect(reorderedNodes[1]).toBe(nodes.get('b'));
      expect(reorderedNodes[2]).toBe(nodes.get('a'));
      expect(root.querySelectorAll('li').length).toBe(3);
    });

    // NEW TEST: For keyed primitive re-ordering
    it('should correctly re-order a list of primitives when using a key', async () => {
      const [items, setItems] = createSignal(['a', 'b', 'c']);
      const listContainer = document.createElement('div');
      const nodes = new Map();

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          // Provide a stable key based on the item's value
          key: (item) => item,
          children: (itemSignal) => {
            const el = document.createElement('li');
            el.textContent = itemSignal();
            // Store the node by its key for later comparison
            nodes.set(itemSignal(), el);
            return el;
          },
        });
        listContainer.appendChild(list);
      });
      root.appendChild(listContainer);

      expect(root.innerHTML).toBe('<div><li>a</li><li>b</li><li>c</li></div>');

      // Re-order the list
      setItems(['c', 'b', 'a']);
      await tick();

      const reorderedNodes = Array.from(root.querySelectorAll('li'));
      // The original DOM nodes should have been re-ordered, not re-created
      expect(reorderedNodes[0]).toBe(nodes.get('c'));
      expect(reorderedNodes[1]).toBe(nodes.get('b'));
      expect(reorderedNodes[2]).toBe(nodes.get('a'));
    });

    // NEW TEST: For the development-mode warning
    it('should warn when rendering a primitive array without a key', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      process.env.NODE_ENV = 'development';

      const [items] = createSignal(['a', 'b']);
      disposeRoot = createRoot(() => {
        For({
          each: items,
          // No key prop provided
          children: (item) => document.createTextNode(item()),
        });
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('The `For` component is being used with an array of primitives without a `key` prop')
      );

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('should properly dispose effects for removed items', async () => {
      const itemA = { id: 'a' };
      const itemB = { id: 'b' };
      const cleanupFnA = vi.fn();
      const cleanupFnB = vi.fn();

      const [items, setItems] = createSignal([itemA, itemB]);

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          children: (item) => {
            createEffect(() => {
              const id = item().id;
              onCleanup(id === 'a' ? cleanupFnA : cleanupFnB);
            });
            return document.createElement('div');
          },
        });
        root.appendChild(list);
      });

      expect(cleanupFnA).not.toHaveBeenCalled();
      expect(cleanupFnB).not.toHaveBeenCalled();

      // Remove itemA
      setItems([itemB]);
      await tick();

      expect(cleanupFnA).toHaveBeenCalledTimes(1); // Cleanup for A should have run
      expect(cleanupFnB).not.toHaveBeenCalled(); // B is still there
    });

    it('should properly remove Element nodes when items are deleted', async () => {
      const itemA = { id: 'a', text: 'Item A' };
      const itemB = { id: 'b', text: 'Item B' };
      const [items, setItems] = createSignal([itemA, itemB]);

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          children: (item) => {
            const div = document.createElement('div');
            div.textContent = item().text;
            return div;
          },
        });
        root.appendChild(list);
      });

      expect(root.querySelectorAll('div').length).toBe(2);
      setItems([itemB]);
      await tick();
      expect(root.querySelectorAll('div').length).toBe(1);
    });

    it('should properly remove Text nodes when items are deleted', async () => {
      const [items, setItems] = createSignal(['first', 'second', 'third']);

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          children: (item) => document.createTextNode(item()),
        });
        root.appendChild(list);
      });

      expect(root.textContent).toBe('firstsecondthird');
      setItems(['first', 'third']);
      await tick();
      expect(root.textContent).toBe('firstthird');
    });

    it('should correctly re-order a list of primitives when using a key', async () => {
      const [items, setItems] = createSignal(['a', 'b', 'c']);
      const listContainer = document.createElement('div');
      const nodes = new Map();

      disposeRoot = createRoot(() => {
        const list = For({
          each: items,
          // THE FIX: The item itself is the stable key.
          key: (item) => item,
          children: (item) => {
            const el = document.createElement('li');
            el.textContent = item();
            // Store the node by its key for later comparison
            nodes.set(item(), el);
            return el;
          },
        });
        listContainer.appendChild(list);
      });
      root.appendChild(listContainer);

      expect(root.innerHTML).toBe('<div><li>a</li><li>b</li><li>c</li></div>');

      // Re-order the list
      setItems(['c', 'b', 'a']);
      await tick();

      const reorderedNodes = Array.from(root.querySelectorAll('li'));
      // The original DOM nodes should have been re-ordered, not re-created
      expect(reorderedNodes[0]).toBe(nodes.get('c'));
      expect(reorderedNodes[1]).toBe(nodes.get('b'));
      expect(reorderedNodes[2]).toBe(nodes.get('a'));
    });
  });
});
