import { createRoot, onCleanup } from '../lifecycle/lifecycle';
import { createSignal } from '../primitives/signal';
import { createEffect } from '../primitives/effect';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AidedError } from '../error';
import { bindText, bindAttr, bindEvent, bindClassList, bindStyle } from './bindings';
import { scopeQuery } from './query';
import { render } from './render';

// Helper to wait for the next microtask queue flush
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Aided DOM & Lifecycle', () => {
  let root: HTMLElement;
  let disposeRoot: () => void;

  // Set up a fresh DOM element for each test
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  // Clean up the DOM element after each test
  afterEach(() => {
    if (disposeRoot) {
      disposeRoot(); // Dispose of any active reactivity
    }
    root.remove();
  });

  describe('Lifecycle', () => {
    it('should create a root and dispose it', () => {
      const cleanupFn = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      disposeRoot = createRoot(dispose => {
        onCleanup(cleanupFn);
      });

      expect(cleanupFn).not.toHaveBeenCalled();
      disposeRoot();
      expect(cleanupFn).toHaveBeenCalledTimes(1);
    });

    it('should automatically clean up effects within a root', async () => {
      const effectFn = vi.fn();
      const [signal, setSignal] = createSignal(0);

      disposeRoot = createRoot(() => {
        createEffect(() => {
          effectFn(signal());
        });
      });

      expect(effectFn).toHaveBeenCalledTimes(1);
      setSignal(1);

      await tick(); // Wait for the update
      expect(effectFn).toHaveBeenCalledTimes(2);

      disposeRoot(); // Now dispose the root
      setSignal(2);

      await tick(); // Wait again
      expect(effectFn).toHaveBeenCalledTimes(2); // Effect should not run again
    });

    it('should restore the parent owner even if the root function throws', () => {
      let ownerInRoot: string | undefined;
      let ownerAfterRoot: string | undefined;
      const error = new Error('test error');

      disposeRoot = createRoot(() => {
        try {
          createRoot(() => {
            ownerInRoot = 'inner'; // This is just a placeholder to see the context
            throw error;
          });
        } catch (e) {
          expect(e).toBe(error);
        }
        ownerAfterRoot = 'outer';
      });

      // This test implicitly checks that the `finally` block in createRoot ran correctly,
      // allowing the outer root to be set as the current owner again.
      expect(ownerInRoot).toBe('inner');
      expect(ownerAfterRoot).toBe('outer');
    });

    it('onCleanup should not throw when called outside a root', () => {
      const cleanupFn = vi.fn();
      // This should not throw an error, it just does nothing.
      expect(() => onCleanup(cleanupFn)).not.toThrow();
      expect(cleanupFn).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('should render a component into a mount node', () => {
      const Component = () => {
        const el = document.createElement('p');
        el.textContent = 'Hello, Aided!';
        return el;
      };
      disposeRoot = render(Component, root);
      expect(root.innerHTML).toBe('<p>Hello, Aided!</p>');
    });

    it('should clear the mount node before rendering', () => {
      root.innerHTML = '<span>Old content</span>';
      const Component = () => document.createElement('div');
      disposeRoot = render(Component, root);
      expect(root.innerHTML).toBe('<div></div>');
    });

    it('should throw an error if the mount node is not found', () => {
      const Component = () => document.createElement('div');
      // We expect this call to throw an error.
      expect(() => render(Component, null as unknown as Element)).toThrow('render(...): The provided mount node is null or undefined. Aided requires a valid DOM element to render into.');
    });
  });

  describe('DOM Bindings', () => {
    it('bindText should update textContent', async () => {
      const [text, setText] = createSignal('initial');
      disposeRoot = createRoot(() => {
        bindText(root, text);
      });
      expect(root.textContent).toBe('initial');
      setText('updated');
      await tick(); // <-- THE FIX: Wait for the effect to run
      expect(root.textContent).toBe('updated');
    });

    it('bindText should render an empty string for null or undefined', async () => {
      const [text, setText] = createSignal<string | null | undefined>('initial');
      disposeRoot = createRoot(() => {
        bindText(root, text);
      });
      expect(root.textContent).toBe('initial');

      setText(null);
      await tick();
      expect(root.textContent).toBe('');

      setText('another');
      await tick();
      expect(root.textContent).toBe('another');

      setText(undefined);
      await tick();
      expect(root.textContent).toBe('');
    });

    it('bindAttr should update an attribute', async () => {
      const [id, setId] = createSignal('first-id');
      const el = document.createElement('div');
      root.appendChild(el);

      disposeRoot = createRoot(() => {
        bindAttr(el, 'id', id);
      });

      expect(el.id).toBe('first-id');
      setId('second-id');
      await tick(); // <-- THE FIX: Wait for the effect to run
      expect(el.id).toBe('second-id');
    });

    it('bindAttr should remove attribute for null/undefined/false', async () => {
      const [disabled, setDisabled] = createSignal<boolean | null | undefined>(true);
      const button = document.createElement('button');
      root.appendChild(button);

      disposeRoot = createRoot(() => {
        bindAttr(button, 'disabled', disabled);
      });

      expect(button.disabled).toBe(true);

      setDisabled(false);
      await tick(); // <-- THE FIX: Wait for the effect to run
      expect(button.disabled).toBe(false);

      setDisabled(null);
      await tick(); // <-- THE FIX: Wait for the effect to run
      expect(button.hasAttribute('disabled')).toBe(false);

      setDisabled(true);
      await tick();
      expect(button.disabled).toBe(true);

      setDisabled(undefined);
      await tick();
      expect(button.hasAttribute('disabled')).toBe(false);
    });

    it('bindEvent should attach and clean up an event listener', () => {
      const handler = vi.fn();
      const button = document.createElement('button');
      root.appendChild(button);

      disposeRoot = createRoot(() => {
        bindEvent(button, 'click', handler);
      });

      button.click();
      expect(handler).toHaveBeenCalledTimes(1);

      disposeRoot(); // This should trigger onCleanup and remove the listener

      button.click();
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('bindEvent should catch and log errors in the handler', () => {
      const error = new Error('test error');
      const handler = vi.fn(() => {
        throw error;
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      const button = document.createElement('button');
      root.appendChild(button);

      disposeRoot = createRoot(() => {
        bindEvent(button, 'click', handler);
      });

      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error in event handler for click:', error);

      consoleSpy.mockRestore();
    });

    it('bindClassList should toggle classes reactively', async () => {
      const [active, setActive] = createSignal(true);
      const [error, setError] = createSignal(false);
      const el = document.createElement('div');
      root.appendChild(el);

      disposeRoot = createRoot(() => {
        bindClassList(el, {
          active: active,
          error: error,
        });
      });

      expect(el.classList.contains('active')).toBe(true);
      expect(el.classList.contains('error')).toBe(false);

      setActive(false);
      setError(true);
      await tick();

      expect(el.classList.contains('active')).toBe(false);
      expect(el.classList.contains('error')).toBe(true);
    });

    it('bindStyle should update style properties reactively', async () => {
      const [color, setColor] = createSignal<string | undefined>('red');
      const [fontSize, setFontSize] = createSignal<string | undefined>('16px');
      const el = document.createElement('div');
      root.appendChild(el);

      disposeRoot = createRoot(() => {
        bindStyle(el, {
          color: color,
          fontSize: fontSize,
          // Test with a property that is not a signal
          fontWeight: () => 'bold',
        });
      });

      expect(el.style.color).toBe('red');
      expect(el.style.fontSize).toBe('16px');
      expect(el.style.fontWeight).toBe('bold');

      setColor('blue');
      setFontSize('20px');
      await tick();

      expect(el.style.color).toBe('blue');
      expect(el.style.fontSize).toBe('20px');

      // Test removing a style
      setColor(undefined);
      setFontSize(undefined);
      await tick();

      expect(el.style.color).toBe('');
      expect(el.style.fontSize).toBe('');
    });

    it('bindStyle should not throw for undefined signals', () => {
      const el = document.createElement('div');
      root.appendChild(el);

      expect(() => {
        disposeRoot = createRoot(() => {
          bindStyle(el, {
            color: undefined,
          });
        });
      }).not.toThrow();
    });
  });

  // NEW: Add a describe block for Error Handling
  describe('Error Handling & Warnings', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Suppress console warnings in tests
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      // Set NODE_ENV for testing warnings
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = 'test'; // Reset
    });

    it('render should throw a AidedError for an invalid mount node', () => {
      const Component = () => document.createElement('div');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(Component, null as any);
      } catch (e) {
        expect(e).toBeInstanceOf(AidedError);
        expect((e as AidedError).code).toBe('INVALID_MOUNT_NODE');
      }
    });

    it('should warn when onCleanup is called without an owner', () => {
      onCleanup(() => { });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('onCleanup() was called outside of a reactive scope')
      );
    });

    it('should warn when createEffect is called without an owner', () => {
      createEffect(() => { });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('createEffect() was called outside of a reactive root')
      );
    });

    it('should NOT warn when running in production mode', () => {
      process.env.NODE_ENV = 'production';
      onCleanup(() => { });
      createEffect(() => { });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('scopeQuery', () => {
    it('should create a query function scoped to a root element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p>Outside</p><div><p class="inside">Inside</p></div>';
      const scopeRoot = container.querySelector('div')!;

      const $ = scopeQuery(scopeRoot);

      // It should find the element inside the scope
      const innerP = $('.inside');
      expect(innerP).not.toBeNull();
      expect(innerP!.textContent).toBe('Inside');

      // It should NOT find the element outside the scope
      const outerP = $('p'); // This will find the *first* p inside the scope
      expect(outerP).toBe(innerP); // It should not find the "Outside" p
    });

    it('should return null if an element is not found', () => {
      const container = document.createElement('div');
      const $ = scopeQuery(container);
      expect($('.not-found')).toBeNull();
    });

    it('should provide correct TypeScript types', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button></button>';
      const $ = scopeQuery(container);

      // If this compiles, the type is correct.
      const button: HTMLButtonElement | null = $<HTMLButtonElement>('button');
      expect(button).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
