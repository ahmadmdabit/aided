import { describe, it, expect, vi } from 'vitest';
import { createRoot, createSignal } from './index';
import { h } from './h';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Aided Hyperscript Helper (h)', () => {
  it('should create a simple HTML element', () => {
    const el = h.div();
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.tagName).toBe('DIV');
  });

  it('should create an element with a single string child', () => {
    const el = h.p('Hello, world!');
    expect(el.tagName).toBe('P');
    expect(el.textContent).toBe('Hello, world!');
  });

  it('should create an element with multiple string and number children', () => {
    const el = h.div('Count: ', 123, '!');
    expect(el.textContent).toBe('Count: 123!');
  });

  it('should set static attributes from an object', () => {
    const el = h.a({
      href: 'https://example.com',
      id: 'my-link',
      'data-test': 'test-value',
    });
    expect(el.tagName).toBe('A');
    expect(el.id).toBe('my-link');
    expect(el.getAttribute('href')).toBe('https://example.com');
    expect(el.getAttribute('data-test')).toBe('test-value');
  });

  it('should handle nested h calls', () => {
    const el = h.div(
      h.h1('Title'),
      h.p('This is a paragraph.')
    );
    expect(el.innerHTML).toBe('<h1>Title</h1><p>This is a paragraph.</p>');
  });

  it('should handle an array of children', () => {
    const items = ['one', 'two', 'three'];
    const el = h.ul(
      items.map(item => h.li(item))
    );
    expect(el.innerHTML).toBe('<li>one</li><li>two</li><li>three</li>');
  });

  it('should attach an event handler', () => {
    const handleClick = vi.fn();
    const button = h.button({ onClick: handleClick }, 'Click Me');

    createRoot(() => {
      // Event binding needs a root to clean up
      document.body.appendChild(button);
    });

    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe('Reactivity Integration', () => {
    it('should bind a signal to a text node', async () => {
      const [count, setCount] = createSignal(0);

      // THE FIX: Perform the test inside the root where `el` is guaranteed to exist.
      createRoot(() => {
        const el = h.p('Count: ', count);
        document.body.appendChild(el);

        // Initial state assertion
        expect(el.textContent).toBe('Count: 0');

        // Asynchronous update assertion
        setCount(5);
        tick().then(() => {
          expect(el.textContent).toBe('Count: 5');
        });
      });
    });

    // NEW TEST: Cover the null/undefined branch in processChild
    it('should handle null and undefined signal values as children', async () => {
      const [content, setContent] = createSignal<string | null | undefined>('Hello');
      let el: HTMLElement;

      createRoot(() => {
        el = h.p(content);
        document.body.appendChild(el);
      });

      // Initial state
      expect(el!.textContent).toBe('Hello');

      // Test null value
      setContent(null);
      await tick();
      expect(el!.textContent).toBe(''); // Should render an empty string

      // Test undefined value
      setContent('World');
      await tick();
      expect(el!.textContent).toBe('World'); // Back to a string
      setContent(undefined);
      await tick();
      expect(el!.textContent).toBe(''); // Should also render an empty string
    });

    it('should work with multiple reactive children', async () => {
      const [name, setName] = createSignal('Aided');
      const [version, setVersion] = createSignal(1);

      createRoot(() => {
        const el = h.div(name, ' v', version);
        document.body.appendChild(el);

        expect(el.textContent).toBe('Aided v1');

        setName('AidedJS');
        setVersion(2);
        tick().then(() => {
          expect(el.textContent).toBe('AidedJS v2');
        });
      });
    });

    it('should handle reactive children inside nested structures', async () => {
      const [text, setText] = createSignal('initial');

      createRoot(() => {
        const el = h.div(
          h.p('Static text'),
          h.span(text)
        );
        document.body.appendChild(el);

        expect(el.innerHTML).toBe('<p>Static text</p><span>initial</span>');

        setText('updated');
        tick().then(() => {
          expect(el.innerHTML).toBe('<p>Static text</p><span>updated</span>');
        });
      });
    });
  });

  // NEW TEST: Cover the `ref` attribute
  it('should handle the ref attribute', () => {
    let elementRef: HTMLElement | undefined;
    const refCallback = (el: HTMLElement) => {
      elementRef = el;
    };

    const el = h.div({ ref: refCallback });

    // The ref callback should be called with the created element
    expect(elementRef).toBeInstanceOf(HTMLDivElement);
    expect(elementRef).toBe(el);
  });

  // NEW TEST: Cover reactive attributes
  it('should handle reactive attributes', async () => {
    const [id, setId] = createSignal('initial-id');
    let el: HTMLElement;

    createRoot(() => {
      el = h.div({ id: id }); // Pass the signal directly as the attribute value
      document.body.appendChild(el);
    });

    // Check initial state
    expect(el!.id).toBe('initial-id');

    // Update the signal and check the DOM
    setId('updated-id');
    await tick();
    expect(el!.id).toBe('updated-id');
  });

  // NEW TEST: Cover the `classList` attribute
  it('should handle the classList attribute reactively', async () => {
    const [isActive, setIsActive] = createSignal(true);
    let el: HTMLElement;

    createRoot(() => {
      el = h.div({
        classList: {
          active: isActive,
          static: () => true,
        },
      });
      document.body.appendChild(el);
    });

    expect(el!.classList.contains('active')).toBe(true);
    expect(el!.classList.contains('static')).toBe(true);

    setIsActive(false);
    await tick();
    expect(el!.classList.contains('active')).toBe(false);
  });

  // NEW TEST: Cover the `style` attribute with a reactive object
  it('should handle a reactive style object', async () => {
    const [color, setColor] = createSignal('red');
    let el: HTMLElement;

    createRoot(() => {
      el = h.div({
        style: {
          color: color,
          fontSize: '16px', // Mix of static and reactive
        },
      });
      document.body.appendChild(el);
    });

    expect(el!.style.color).toBe('red');
    expect(el!.style.fontSize).toBe('16px');

    setColor('blue');
    await tick();
    expect(el!.style.color).toBe('blue');
  });

  // NEW TEST: Cover the `style` attribute with a static object
  it('should handle a static style object', () => {
    const el = h.div({
      style: {
        color: 'green',
        fontWeight: 'bold',
      },
    });

    expect(el.style.color).toBe('green');
    expect(el.style.fontWeight).toBe('bold');
  });

  // NEW TEST: Cover the `style` attribute with a static string
  it('should handle a static style string', () => {
    const el = h.div({
      style: 'color: purple; font-size: 20px;',
    });

    expect(el.style.color).toBe('purple');
    expect(el.style.fontSize).toBe('20px');
  });

  it('should handle a mix of attributes and children correctly', () => {
    const el = h.div(
      { id: 'container' },
      h.h1('Title'),
      'Some text',
      h.p('A paragraph')
    );

    expect(el.id).toBe('container');
    expect(el.innerHTML).toBe('<h1>Title</h1>Some text<p>A paragraph</p>');
  });
});
