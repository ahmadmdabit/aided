/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, createSignal, Model, For } from 'aided-core';
import { CodeSnippet } from '../components/CodeSnippet';
// import { autofocus } from '../utils/dom';

const WIDGET_STYLE_ID = 'aided-home-examples-styles';

const widgetCSS = `
  /* ========================================
    CARD COMPONENT
    ======================================== */

  .card {
    background: var(--bg-panel);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 18px;
  }

  /* Card header */
  .card > header {
    padding: var(--gap-4) var(--gap-4) var(--gap-3);
    background-color: var(--border-color-light);
  }

  .card > header h2 {
    margin: 0;
    font-size: var(--font-size-h3);
    color: var(--text-primary);
  }

  /* Card sections */
  .card > section {
    padding: var(--gap-4);
  }

  /* Optional: Compact card */
  .card--compact > header {
    padding: var(--gap-3) var(--gap-3) var(--gap-2);
  }

  .card--compact > section {
    padding: var(--gap-3);
  }
`;

function injectHomeExamplesStyles() {
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

function exampleWrapper(title: string, description: string | null, codeSnippet: string | null, addStyle: boolean, ...examples: HTMLElement[]) {
  const [examplesSignal] = createSignal(examples);
  const classList: { 'card': boolean } | any = {};

  if (addStyle)
    classList['card'] = true;

  return h.article({
    classList,
  },
    h.header(
      h.h2(title),
      description ? h.p({ style: `margin: var(--gap-1) 0 ${(addStyle ? '0' : 'var(--gap-5)')}; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.4;` }, description) : null,
      codeSnippet ? CodeSnippet({ code: codeSnippet }) : ''
    ),
    For({
      each: examplesSignal, // Pass only the getter, not the tuple
      children: (example) => h.section(example)
    })
  );
}

export function Home() {
  injectHomeExamplesStyles();

  // Example 01:
  // Children can be passed as separate arguments
  const greeting = h.p('Hello, ', 'Aided!');
  // Expected HTML: <p>Hello, Aided!</p>
  const example01 = exampleWrapper(
    'Example 01: Passing Static Children',
    'Demonstrates creating an element and passing static text arguments using the proxy h helper.',
    `const greeting = h.p('Hello, ', 'Aided!');`,
    true,
    greeting
  );
  // ............................................


  // Example 02:
  const link = h.a({
    id: 'my-link',
    href: 'https://github.com/ahmadmdabit/aided',
    target: '_blank'
  }, 'Aided Repository');

  const button = h.button({
    class: 'btn btn-primary', // Use 'class' for static classes
    disabled: true,
    onClick: () => console.log('It should not click')
  }, 'Cannot Click');
  // Expected HTML:
  // <a id="my-link" href="..." target="_blank">Aided Repository</a>
  // <button class="btn btn-primary" disabled>Cannot Click</button>
  const example02 = exampleWrapper(
    'Example 02: Static Attributes & Properties',
    'Shows how static attributes (href, target, id) and properties (class, disabled) are bound to elements.',
    `const link = h.a({
  id: 'my-link',
  href: 'https://github.com/ahmadmdabit/aided',
  target: '_blank'
}, 'Aided Repository');

const button = h.button({
  class: 'btn btn-primary', // Use 'class' for static classes
  disabled: true,
  onClick: () => console.log('It should not click')
}, 'Cannot Click');
// Expected HTML:
// <a id="my-link" href="..." target="_blank">Aided Repository</a>
// <button class="btn btn-primary" disabled>Cannot Click</button>`,
    true,
    link,
    button
  );
  // ............................................


  // Example 03:
  const [count, setCount] = createSignal(0);

  const counterDisplay = h.div(
    h.strong('Count: '),
    count // Pass the signal directly as a child
  );

  const incrementButton = h.button(
    { onClick: () => setCount(count() + 1) },
    'Increment'
  );

  // When the button is clicked, only the text node representing `count` is updated.
  // The <div> and <strong> elements are never touched again.
  const example03 = exampleWrapper(
    'Example 03: Fine-Grained Text Reactivity',
    'By passing the "count" signal getter directly as a child, only the local text node re-runs when the count is updated.',
    `const [count, setCount] = createSignal(0);

const counterDisplay = h.div(
  h.strong('Count: '),
  count // Pass the signal directly as a child
);

const incrementButton = h.button(
  { onClick: () => setCount(count() + 1) },
  'Increment'
);
// When the button is clicked, only the text node representing \`count\` is updated.
// The <div> and <strong> elements are never touched again.`,
    true,
    counterDisplay,
    incrementButton
  );
  // ............................................


  // Example 04:
  const [placeholderText, setPlaceholderText] = createSignal('Enter your name...');

  const input = h.input({
    type: 'text',
    placeholder: placeholderText // The placeholder attribute is now reactive
  });

  // Later, if you call...
  // setPlaceholderText('Name is required!');
  // ...the input's placeholder will update automatically.

  const inputPlaceholderButton = h.button(
    { onClick: () => setPlaceholderText('Name is required!') },
    'Update the placeholder'
  );

  const example04 = exampleWrapper(
    'Example 04: Reactive Attributes',
    'Shows how attributes (like "placeholder") seamlessly track signal changes and update without any Virtual DOM overhead.',
    `const [placeholderText, setPlaceholderText] = createSignal('Enter your name...');

const input = h.input({
  type: 'text',
  placeholder: placeholderText // The placeholder attribute is now reactive
});

// Later, if you call...
// setPlaceholderText('Name is required!');
// ...the input's placeholder will update automatically.

const inputPlaceholderButton = h.button(
  { onClick: () => setPlaceholderText('Name is required!') },
  'Update the placeholder'
);`,
    true,
    input,
    inputPlaceholderButton
  );
  // ............................................


  // Example 05:
  const [text, setText] = createSignal('');

  const textSpan = h.div('Output', h.span(':', text));

  const logButton = h.button(
    { onClick: () => console.log('Button was clicked!') },
    'Log Message'
  );

  const textInput = h.input({
    // The event object is passed to the handler
    onInput: (event: any) => setText(event.currentTarget.value)
  });
  const example05 = exampleWrapper(
    'Example 05: Event Binding & User Input',
    'Demonstrates registering inline event listeners (onClick, onInput) and handling raw pointer and input streams.',
    `const [text, setText] = createSignal('');

const textSpan = h.div('Output', h.span(':', text));

const logButton = h.button(
  { onClick: () => console.log('Button was clicked!') },
  'Log Message'
);

const textInput = h.input({
  // The event object is passed to the handler
  onInput: (event: any) => setText(event.currentTarget.value)
});`,
    true,
    textSpan,
    logButton,
    textInput
  );
  // ............................................


  // Example 06:
  const styledDiv = h.div({
    style: 'color: blue; font-size: 20px;'
  }, 'Styled with a string');
  const styledDiv2 = h.div({
    style: {
      color: 'green',
      fontWeight: 'bold',
      backgroundColor: '#f0f0f0'
    }
  }, 'Styled with an object');
  const colors = [
    'black',
    'green',
    'orange',
    'gray',
    'lightcoral',
    'indianred',
    'blue',
    'yellow',
    'purple',
    'pink',
    'brown',
    'white'
  ];
  const [color, setColor] = createSignal('White');
  const [fontSize, setFontSize] = createSignal(16);

  const reactiveStyledDiv = h.div({
    style: {
      color: color, // This property will update when the signal changes
      fontSize: () => `${fontSize()}px`, // You can also use a function/memo
      transition: 'color 0.3s ease'
    }
  }, 'My style is reactive!');

  // If you call setColor('purple'), only the `color` style property changes.
  const colorButton = h.button(
    {
      onClick: () => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setColor(randomColor);
        const randomFontSize = Math.floor(Math.random() * 21) + 10;
        setFontSize(randomFontSize);
      }
    },
    'Change Styles'
  );
  const example06 = exampleWrapper(
    'Example 06: Styling Patterns',
    'Presents static string styles, static style objects, and high-performance reactive style bindings (using signals and inline function getters).',
    `const styledDiv = h.div({
  style: 'color: blue; font-size: 20px;'
}, 'Styled with a string');
const styledDiv2 = h.div({
  style: {
    color: 'green',
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0'
  }
}, 'Styled with an object');
const colors = [
  'black',
  'green',
  'orange',
  'gray',
  'lightcoral',
  'indianred',
  'blue',
  'yellow',
  'purple',
  'pink',
  'brown',
  'white'
];
const [color, setColor] = createSignal('White');
const [fontSize, setFontSize] = createSignal(16);

const reactiveStyledDiv = h.div({
  style: {
    color: color, // This property will update when the signal changes
    fontSize: () => \`\${fontSize()}px\`, // You can also use a function/memo
    transition: 'color 0.3s ease'
  }
}, 'My style is reactive!');

// If you call setColor('purple'), only the \`color\` style property changes.
const colorButton = h.button(
  {
    onClick: () => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setColor(randomColor);
      const randomFontSize = Math.floor(Math.random() * 21) + 10;
      setFontSize(randomFontSize);
    }
  },
  'Change Styles'
);`,
    true,
    styledDiv,
    styledDiv2,
    reactiveStyledDiv,
    colorButton
  );
  // ............................................


  // Example 07:
  const [isActive, setIsActive] = createSignal(true);
  const [hasError, setHasError] = createSignal(false);

  const statusBox = h.div({
    classList: {
      'text-success': isActive,   // The 'text-success' class is present when isActive() is true
      'text-error': hasError,    // The 'text-error' class is present when hasError() is true
      'box-style': () => true   // Static classes can be included with a `true` value
    }
  }, 'Status');

  // If you call setIsActive(false) and setHasError(true),
  // the element's class will become "error box-style".
  const toggleButton = h.button({
    onClick: () => {
      setIsActive(!isActive());
      setHasError(!hasError());
    }
  }, 'Toggle');
  const example07 = exampleWrapper(
    'Example 07: Class Toggle Management (classList)',
    'Showcases Aided’s custom classList attribute helper to toggle CSS classes dynamically based on signal values.',
    `const [isActive, setIsActive] = createSignal(true);
const [hasError, setHasError] = createSignal(false);

const statusBox = h.div({
  classList: {
    'text-success': isActive,   // The 'text-success' class is present when isActive() is true
    'text-error': hasError,    // The 'text-error' class is present when hasError() is true
    'box-style': () => true   // Static classes can be included with a \`true\` value
  }
}, 'Status');

// If you call setIsActive(false) and setHasError(true),
// the element's class will become "error box-style".
const toggleButton = h.button({
  onClick: () => {
    setIsActive(!isActive());
    setHasError(!hasError());
  }
}, 'Toggle');`,
    true,
    statusBox,
    toggleButton
  );
  // ............................................


  // Example 08:
  let inputElement; // Variable to hold the DOM element

  const autoFocusInput = h.input({
    type: 'text',
    ref: (el: any) => {
      // This callback runs as soon as the element is created
      inputElement = el;
      // Schedule the focus call to run after the current JS task is finished.
      // By then, the element will be in the DOM.
      // autofocus(inputElement); // Disabled for better playground UX 
    }
  });

  const focusButton = h.button({
    onClick: () => {
      console.log('Ref:', inputElement!);
      inputElement!.focus();
    }
  }, 'Focus');
  const example08 = exampleWrapper(
    'Example 08: Direct Element References (ref)',
    'Illustrates how to gain direct access to standard DOM nodes using the "ref" callback callback right as they are generated.',
    `let inputElement; // Variable to hold the DOM element

const autoFocusInput = h.input({
  type: 'text',
  ref: (el: any) => {
    // This callback runs as soon as the element is created
    inputElement = el;
    // Schedule the focus call to run after the current JS task is finished.
    // By then, the element will be in the DOM.
    // autofocus(inputElement); // Disabled for better playground UX 
  }
});

const focusButton = h.button({
  onClick: () => {
    console.log('Ref:', inputElement!);
    inputElement!.focus();
  }
}, 'Focus');`,
    true,
    autoFocusInput,
    focusButton
  );
  // ............................................


  // Example 09:
  const [name, setName] = createSignal('Aided');

  const nameInput = h.input({
    type: 'text',
    // Model takes the element and a [getter, setter] tuple
    ref: (el: HTMLInputElement) => Model(el, [name, setName])
  });

  const displayName = h.p('Hello, ', name, '!');
  // Now, typing in the input updates the `name` signal, which updates the <p>.
  // Calling setName('New Name') will update the value of the input field.
  const example09 = exampleWrapper(
    'Example 09: Two-Way Bidirectional Binding (Model)',
    'Uses Aided’s "Model" utility helper inside a ref to bind input values and signals together on a two-way sync loop.',
    `const [name, setName] = createSignal('Aided');

const nameInput = h.input({
  type: 'text',
  // Model takes the element and a [getter, setter] tuple
  ref: (el: HTMLInputElement) => Model(el, [name, setName])
});

const displayName = h.p('Hello, ', name, '!');
// Now, typing in the input updates the \`name\` signal, which updates the <p>.
// Calling setName('New Name') will update the value of the input field.`,
    true,
    nameInput,
    displayName
  );
  // ............................................

  return exampleWrapper(
    'Core Hyperscript API Features',
    'An interactive tour demonstrating key syntax patterns, reactivity bindings, and structural helpers used to build applications in Aided.',
    null,
    false,
    example01,
    example02,
    example03,
    example04,
    example05,
    example06,
    example07,
    example08,
    example09
  );
}
