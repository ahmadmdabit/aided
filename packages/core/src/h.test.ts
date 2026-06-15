import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { h } from './h';
import { createRoot } from './lifecycle/lifecycle';
import { createSignal } from './primitives/signal';
import { createMemo } from './primitives/memo';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Aided Hyperscript Helper (h)', () => {
  let root: HTMLElement;
  let disposeRoot: () => void | undefined;

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

  describe('Static Rendering', () => {
    it('should create a simple HTML element', () => {
      const el = h.div();
      expect(el).toBeInstanceOf(HTMLDivElement);
    });

    it('should create an element with multiple string and number children', () => {
      const el = h.div('Count: ', 123, '!');
      expect(el.textContent).toBe('Count: 123!');
    });

    it('should handle nested h calls', () => {
      const el = h.div(h.h1('Title'), h.p('This is a paragraph.'));
      expect(el.innerHTML).toBe('<h1>Title</h1><p>This is a paragraph.</p>');
    });

    it('should handle an array of children', () => {
      const items = ['one', 'two', 'three'];
      const el = h.ul(items.map(item => h.li(item)));
      expect(el.innerHTML).toBe('<li>one</li><li>two</li><li>three</li>');
    });
  });

  describe('Attributes and Properties', () => {
    it('should set static attributes from an object', () => {
      const el = h.a({
        href: 'https://example.com',
        id: 'my-link',
        'data-test': 'test-value',
      });
      expect(el.id).toBe('my-link');
      expect(el.getAttribute('href')).toBe('https://example.com');
    });

    it('should attach an event handler and clean it up', () => {
      const handleClick = vi.fn();
      let button: HTMLElement;

      disposeRoot = createRoot(() => {
        button = h.button({ onClick: handleClick }, 'Click Me');
        root.appendChild(button);
      });

      button!.click();
      expect(handleClick).toHaveBeenCalledTimes(1);

      disposeRoot();

      button!.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle the ref attribute', () => {
      let elementRef: HTMLElement | undefined;
      const el = h.div({ ref: (e: HTMLElement) => { elementRef = e; } });
      expect(elementRef).toBe(el);
    });

    it('should handle a static style object', () => {
      const el = h.div({ style: { color: 'green' } });
      expect(el.style.color).toBe('green');
    });

    it('should handle a static style string', () => {
      const el = h.div({ style: 'color: purple;' });
      expect(el.style.color).toBe('purple');
    });
  });

  describe('Tag Validation', () => {
    it('should create standard HTML tags', () => {
      const div = h.div();
      const span = h.span();
      const p = h.p();
      const button = h.button();
      
      expect(div).toBeInstanceOf(HTMLDivElement);
      expect(span).toBeInstanceOf(HTMLSpanElement);
      expect(p).toBeInstanceOf(HTMLParagraphElement);
      expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    it('should create custom elements with hyphens', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customElement = (h as any)['my-component']();
      expect(customElement).toBeInstanceOf(HTMLElement);
      expect(customElement.tagName.toLowerCase()).toBe('my-component');
    });

    it('should create SVG tags', () => {
      const svg = h.svg();
      const circle = h.circle();
      const path = h.path();
      
      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(circle.tagName.toLowerCase()).toBe('circle');
      expect(path.tagName.toLowerCase()).toBe('path');
    });

    it('should reject script tag creation', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any).script();
      }).toThrow('Security: Cannot create \'script\' element. This tag is not allowed.');
    });

    it('should reject constructor property access', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any).constructor();
      }).toThrow('Security: Cannot create \'constructor\' element. This tag is not allowed.');
    });

    it('should reject prototype property access', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any).prototype();
      }).toThrow('Security: Cannot create \'prototype\' element. This tag is not allowed.');
    });

    it('should reject tag names starting with numbers', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any)['1div']();
      }).toThrow('Invalid tag name \'1div\'. Tag names must start with a letter and contain only letters, numbers, and hyphens.');
    });

    it('should reject tag names with invalid characters', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any)['div@test']();
      }).toThrow('Invalid tag name \'div@test\'. Tag names must start with a letter and contain only letters, numbers, and hyphens.');
    });

    it('should reject empty tag names', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h as any)['']();
      }).toThrow('Invalid tag name \'\'. Tag names must start with a letter and contain only letters, numbers, and hyphens.');
    });
  });

  describe('Reactivity Integration', () => {
    it('should bind a signal to a text node and update it', async () => {
      const [count, setCount] = createSignal(0);

      disposeRoot = createRoot(() => {
        const el = h.p('Count: ', count);
        root.appendChild(el);
      });

      expect(root.textContent).toBe('Count: 0');

      setCount(5);
      await tick();
      expect(root.textContent).toBe('Count: 5');
    });

    it('should handle null and undefined signal values as children', async () => {
      const [content, setContent] = createSignal<string | null | undefined>('Hello');

      disposeRoot = createRoot(() => {
        const el = h.p(content);
        root.appendChild(el);
      });

      expect(root.textContent).toBe('Hello');

      setContent(null);
      await tick();
      expect(root.textContent).toBe('');

      setContent('World');
      await tick();
      expect(root.textContent).toBe('World');

      setContent(undefined);
      await tick();
      expect(root.textContent).toBe('');
    });

    it('should handle a memo that returns a DOM node and updates it', async () => {
      const [component, setComponent] = createSignal('p');
      const DynamicComponent = createMemo(() => {
        return component() === 'p'
          ? h.p('This is a paragraph')
          : h.span('This is a span');
      });

      disposeRoot = createRoot(() => {
        const el = h.div(DynamicComponent);
        root.appendChild(el);
      });

      expect(root.querySelector('div')!.innerHTML).toBe('<p>This is a paragraph</p>');

      setComponent('span');
      await tick();
      expect(root.querySelector('div')!.innerHTML).toBe('<span>This is a span</span>');
    });

    it('should handle a memo that switches between DOM node and primitive', async () => {
      const [toggle, setToggle] = createSignal(true);
      const DynamicContent = createMemo(() => {
        return toggle() ? h.span('DOM content') : 'Plain text content';
      });

      disposeRoot = createRoot(() => {
        const el = h.div(DynamicContent);
        root.appendChild(el);
      });

      expect(root.querySelector('div')!.innerHTML).toBe('<span>DOM content</span>');

      setToggle(false);
      await tick();
      expect(root.querySelector('div')!.innerHTML).toBe('Plain text content');

      setToggle(true);
      await tick();
      expect(root.querySelector('div')!.innerHTML).toBe('<span>DOM content</span>');
    });

    it('should handle a memo that switches between different primitives', async () => {
      const [value, setValue] = createSignal('initial');
      const DynamicText = createMemo(() => value());

      disposeRoot = createRoot(() => {
        const el = h.div(DynamicText);
        root.appendChild(el);
      });

      expect(root.querySelector('div')!.textContent).toBe('initial');

      setValue('updated');
      await tick();
      expect(root.querySelector('div')!.textContent).toBe('updated');
    });

    it('should handle reactive attributes', async () => {
      const [id, setId] = createSignal('initial-id');

      disposeRoot = createRoot(() => {
        const el = h.div({ id: id });
        root.appendChild(el);
      });

      expect(root.querySelector('div')!.id).toBe('initial-id');

      setId('updated-id');
      await tick();
      expect(root.querySelector('div')!.id).toBe('updated-id');
    });

    it('should handle the classList attribute reactively', async () => {
      const [isActive, setIsActive] = createSignal(true);

      disposeRoot = createRoot(() => {
        const el = h.div({
          classList: {
            active: isActive,
            static: () => true,
          },
        });
        root.appendChild(el);
      });

      const div = root.querySelector('div')!;
      expect(div.classList.contains('active')).toBe(true);
      expect(div.classList.contains('static')).toBe(true);

      setIsActive(false);
      await tick();
      expect(div.classList.contains('active')).toBe(false);
    });

    it('should handle a reactive style object', async () => {
      const [color, setColor] = createSignal('red');

      disposeRoot = createRoot(() => {
        const el = h.div({
          style: {
            color: color,
            fontSize: '16px',
          },
        });
        root.appendChild(el);
      });

      const div = root.querySelector('div')!;
      expect(div.style.color).toBe('red');
      expect(div.style.fontSize).toBe('16px');

      setColor('blue');
      await tick();
      expect(div.style.color).toBe('blue');
    });

    it('should handle a signal that is initially null', async () => {
      // 1. Create a signal whose initial value is null.
      const [content, setContent] = createSignal<string | null>(null);

      disposeRoot = createRoot(() => {
        const el = h.div(content);
        root.appendChild(el);
      });

      // 2. Assert the initial, synchronous render.
      // This assertion forces the code to execute the uncovered branch.
      expect(root.querySelector('div')!.textContent).toBe('');

      // 3. (Optional but good practice) Test that it can be updated.
      setContent('Now it has text');
      await tick();
      expect(root.querySelector('div')!.textContent).toBe('Now it has text');
    });
  });
});
