import { h, createSignal, createMemo, For, Model } from 'aided-core';

const WIDGET_STYLE_ID = 'aided-todolist-styles';

const widgetCSS = `
  /* ========================================
    TODO APP STYLES
    ======================================== */

  .todo-app {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--bg-panel);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .todo-app h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: var(--text-secondary);
  }

  /* Form */
  .todo-app form {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .todo-app input[type="text"] {
    flex: 1;
    padding: 0.75em 1em;
    font-family: inherit;
    font-size: var(--font-size-base);
    background: var(--bg-input);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
  }

  .todo-app input[type="text"]:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--shadow-focus);
  }

  .todo-app button[type="submit"] {
    margin: 0;
    padding: 0.75em 1.2em;
    font-weight: 500;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s;
  }

  .todo-app button[type="submit"]:hover {
    background: var(--accent-hover);
  }

  /* Todo List */
  .todo-app ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .todo-app li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-surface);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-2);
    transition: background 0.2s;
  }

  .todo-app li:hover {
    background: var(--bg-button-hover);
  }

  /* Checkbox */
  .todo-app input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-color-light);
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
  }

  .todo-app input[type="checkbox"]::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 2px;
    opacity: 0;
    transition: all 0.2s ease;
  }

  .todo-app input[type="checkbox"]:checked::before {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  .todo-app input[type="checkbox"]:checked {
    border-color: var(--accent);
  }

  /* Completed state */
  .todo-app li.completed span {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  /* Text */
  .todo-app span {
    flex: 1;
    word-break: break-word;
    color: var(--text-primary);
  }

  /* Destroy button */
  .todo-app .destroy {
    margin: 0;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.2em;
    line-height: 1.1;
    cursor: pointer;
    padding: 0.25em 0.5em;
    border-radius: var(--radius-sm);
    transition: color 0.2s, background 0.2s;
  }

  .todo-app .destroy:hover {
    color: #ff5571ff;
    background: rgba(255, 85, 85, 0.1);
  }

  .todo-app .destroy:focus {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  /* Footer */
  .todo-app footer {
    margin-top: var(--space-4);
    padding-top: var(--space-3);
    border-top: 1px solid var(--border-color-light);
    text-align: center;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .todo-app footer strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

function injectTodoListStyles() {
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

// Helper to create a unique ID
let idCounter = 3;
const newId = () => ++idCounter;

export function TodoList() {
  injectTodoListStyles();

  // 1. State: An array of todo objects
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn Aided', completed: true },
    { id: 2, text: 'Build a cool app', completed: false },
    { id: 3, text: 'Publish to NPM', completed: true },
  ]);

  // 2. State: The value of the new todo input field
  const [newTodoText, setNewTodoText] = createSignal('');

  // 3. Derived State: A memo that calculates the number of incomplete todos
  const remainingCount = createMemo(() => {
    return todos().filter(todo => !todo.completed).length;
  });

  // --- Event Handlers ---
  const addTodo = (e: Event) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    const text = newTodoText().trim();
    if (!text) return;

    // Create a new array with the new item
    setTodos([...todos(), { id: newId(), text, completed: false }]);
    setNewTodoText(''); // Clear the input
  };

  const removeTodo = (idToRemove: number) => {
    // Create a new array excluding the item to be removed
    setTodos(todos().filter(todo => todo.id !== idToRemove));
  };

  const toggleTodo = (idToToggle: number) => {
    // Create a new array with the toggled item's status updated
    setTodos(todos().map(todo =>
      todo.id === idToToggle ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // --- UI ---
  return h.div(
    { class: 'todo-app' },
    h.h2('Aided To-Do List'),
    h.form({ onSubmit: addTodo },
      h.input({
        placeholder: 'What needs to be done?',
        ref: (el: HTMLInputElement) => Model(el, [newTodoText, setNewTodoText])
      }),
      h.button({ type: 'submit' }, 'Add Todo')
    ),
    h.ul(
      // 4. Use the For component for efficient list rendering
      For({
        each: todos,
        key: (item) => item.id, // A stable key is crucial for performance
        children: (item) => h.li(
          { classList: { completed: () => item().completed } },
          h.input({
            type: 'checkbox',
            checked: () => item().completed,
            onChange: () => toggleTodo(item().id)
          }),
          h.span(item().text),
          h.button({ class: 'destroy', onClick: () => removeTodo(item().id) }, '×')
        )
      })
    ),
    h.footer(
      h.strong(remainingCount), ' items left'
    )
  );
}
