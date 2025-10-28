# Aided

<p align="center">
  <a href="https://www.npmjs.com/package/aided-core"><img src="https://img.shields.io/npm/v/aided-core.svg" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/aided-core"><img src="https://img.shields.io/bundlephobia/minzip/aided-core.svg" alt="bundle size"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/aided-core.svg" alt="license"></a>
  <a href="https://github.com/ahmadmdabit/aided/actions/workflows/ci.yml"><img src="https://github.com/ahmadmdabit/aided/actions/workflows/ci.yml/badge.svg" alt="build status"></a>
  <a href="https://ahmadmdabit.github.io/aided/"><img src="https://img.shields.io/badge/coverage-report-green.svg" alt="coverage report"></a>
</p>

<p align="center">
  <a href="#" target="_blank">
    <img src="public/aided.png" width="200" alt="Aided Logo">
  </a>
</p>

Aided is a minimal JavaScript library for building user interfaces with fine-grained reactivity. It updates the DOM directly without using a Virtual DOM, focusing on performance, simplicity, and an excellent developer experience.

## Core Principles

1.  **Fine-Grained Reactivity:** A system of reactive primitives (`signals`, `effects`, `memos`) ensures that when state changes, only the specific code that depends on it is re-executed.
2.  **Direct DOM Manipulation:** Instead of computing and diffing virtual trees, Aided's effects are bound directly to DOM nodes, enabling precise, surgical updates.
3.  **Render-Once Components:** Components are plain JavaScript functions that execute once to create a DOM tree and set up reactive bindings. They do not re-render.
4.  **Automatic Memory Management:** An ownership graph, managed via `createRoot`, tracks all nested reactive scopes and automatically cleans them up to prevent memory leaks.
5.  **Headless Logic:** Complex UI logic (like virtualization) is separated into headless, framework-agnostic utilities, promoting reusability and clean component architecture.

## Installation

```bash
yarn add aided-core
# or
npm install aided-core
```

## Getting Started

Aided uses a **hyperscript** function, `h`, for a declarative and readable way to create DOM elements. It feels like JSX, but it's just plain JavaScript functions.

**index.html**
```html
<div id="app"></div>
<script type="module" src="./main.js"></script>
```

**main.js**
```javascript
import { render, createSignal, h } from 'aided-core';

function Counter() {
  const [count, setCount] = createSignal(0);

  // Use the `h` helper to build your UI
  return h.button(
    {
      // Event handlers are passed as props
      onClick: () => setCount(count() + 1)
    },
    // Reactive children are automatically updated
    'Count: ', count
  );
}

// Mount the component to the DOM
render(Counter, document.getElementById('app'));
```

## Interactive Playground

Explore Aided's capabilities with our comprehensive **interactive playground** located in the `playground/` directory. The playground includes:

- **Live Examples**: Interactive demos of all major features including signals, effects, memos, and components
- **Real-World Patterns**: Complete implementations of common UI patterns like forms, modals, notifications, and virtualized lists
- **Component Showcase**: Working examples of all structural components (`For`, `Show`, `VirtualFor`, etc.)
- **Advanced Patterns**: Demonstrations of complex reactivity patterns including context, portals, and state isolation

To run the playground:
```bash
cd playground
yarn install
yarn dev
```

The playground serves as both a learning resource and a testing ground for new features, showcasing best practices and real-world usage patterns.

## API Reference

### Core Primitives

#### `createSignal<T>(initialValue: T, options?: ReactiveOptions): [SignalGetter<T>, SignalSetter<T>]`

Creates a reactive state container. Returns a tuple containing a getter and a setter.

#### `createEffect(fn: () => void, options?: ReactiveOptions): Disposer`

Creates a reactive scope that automatically re-runs when its dependencies change.

#### `createMemo<T>(fn: () => T, options?: ReactiveOptions): Memo<T>`

Creates a derived, read-only signal that caches its value.

#### `untrack<T>(fn: () => T): T`
**New in v1.1.0** - Executes a function without tracking its dependencies, preventing the current reactive scope from re-running when signals inside the function change.

Useful for:
- Creating component instances that maintain independent state
- Performing side effects without triggering reactive updates
- Breaking unwanted dependency chains

```javascript
const [count, setCount] = createSignal(0);

// This effect normally re-runs when count changes
createEffect(() => {
  console.log('Count:', count());
});

// This won't trigger the effect
untrack(() => {
  console.log('Silent read:', count()); // Not tracked
});
```

#### `createResource<S, T>(source: SignalGetter<S>, fetcher: Fetcher<S, T>): Resource<T>`

Creates a signal for managing asynchronous data, complete with reactive `.loading` and `.error` states.

#### `createResource<S, T>(source: SignalGetter<S>, fetcher: Fetcher<S, T>): Resource<T>`

Creates a signal for managing asynchronous data, complete with reactive `.loading` and `.error` states.

#### `longestIncreasingSubsequenceAsync(array: Int32Array): Promise<number[]>`

High-performance async implementation of the longest increasing subsequence algorithm for large arrays, using Web Workers for non-blocking computation.

#### `configureLIS(options: { smallArrayThreshold: number }): void`

Configures the threshold for switching between fast and optimized LIS algorithms.

#### `AidedError`

Custom error class for better debugging of reactive issues.

### Lifecycle & Context

#### `createRoot(fn: (dispose: Disposer) => void): Disposer`

Creates a top-level ownership scope for automatic memory management.

#### `onCleanup(fn: Disposer): void`

Registers a cleanup function to run when the current reactive scope is disposed. Essential for cleaning up event listeners, timers, and other resources.

```javascript
createEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);

  onCleanup(() => {
    clearInterval(timer); // Clean up when effect re-runs or scope ends
  });
});
```

#### `createContext<T>(defaultValue?: T): Context<T>`

Creates a context object for providing data throughout a component tree.

#### `provide<T>(context: Context<T>, value: T): void`

Provides a value for a context within the current scope.

#### `useContext<T>(context: Context<T>): T | undefined`

Consumes a value from the nearest context provider.

### Rendering & DOM

#### `render(component: () => Element, mountNode: Element): Disposer`

The main entry point for an application. It mounts a component into a DOM node within a new reactive root.

#### `h` (Hyperscript)

The `h` helper is the primary way to build UI in Aided. It's a proxy that provides a function for every HTML tag (e.g., `h.div`, `h.a`).

```javascript
import { h, createSignal } from 'aided-core';

const [name, setName] = createSignal('World');
const [isActive, setIsActive] = createSignal(true);

const element = h.div(
  // Attributes and event handlers go in an object
  {
    id: 'container',
    classList: { active: isActive, static: true },
    style: { color: () => isActive() ? 'blue' : 'grey' },
    onClick: () => console.log('Clicked!'),
  },
  // Children follow the attributes
  'Hello, ', name
);
```

-   **Reactive Children:** Passing a signal (`name`) as a child automatically creates a reactive text node.
-   **Reactive Attributes:** Passing a signal as an attribute value (`id: myId`) creates a reactive binding.
-   **Special Properties:** `h` has special handling for `classList`, `style`, `ref`, and event handlers (`onClick`, `onInput`, etc.).

#### `Model` (Two-Way Binding)

The `Model` helper provides two-way binding for form inputs. It's used with the `ref` property in the `h` helper.

```javascript
const nameSignal = createSignal('');
const input = h.input({
  ref: (el) => Model(el, nameSignal)
});
```

### Structural Components

#### `Show(props: { when, children, fallback? }): Node`

Conditionally renders `children` if `when()` is truthy, otherwise renders `fallback`.

```javascript
Show({
  when: isLoggedIn,
  fallback: () => h.p('Please log in.'),
  children: () => h.p('Welcome!'),
});
```

#### `For(props: { each, key?, children }): Node`

Efficiently renders a list of items using a keyed reconciliation algorithm.

```javascript
const [items] = createSignal(['a', 'b']);
const list = h.ul(
  For({
    each: items,
    key: (item) => item,
    children: (item) => h.li(item)
  })
);
```

#### `createVirtualizer<T>(options): Virtualizer<T>`

Creates a headless, high-performance engine for virtualizing large lists. It contains all the state and logic for calculating the visible window of items, which can then be used by a rendering component.

-   `options.items`: A signal containing the full list of data.
-   `options.itemHeight`: The fixed height of each item in pixels.
-   `options.overscan`: The number of extra items to render on either side of the visible area.

Returns a `Virtualizer` object with reactive properties:
-   `.visibleItems`: A memoized array of the items that should be rendered.
-   `.totalHeight`: A memoized total height of the scrollable area.
-   `.visibleState`: A memoized object containing `{ startIndex, endIndex, scrollOffset }`.
-   `.setContainer`: A function to pass the scrollable container element to the virtualizer.

#### `VirtualFor<T>(props): HTMLElement`

An efficient, high-performance component for rendering virtualized lists. It renders only the items currently visible in the scrollable area, making it suitable for lists with thousands or millions of rows.

```javascript
const [items] = createSignal(Array.from({ length: 100000 }, (_, i) => `Item ${i}`));

const list = VirtualFor({
  each: items,
  itemHeight: 30, // Each row is 30px high
  overscan: 5,    // Render 5 extra items above/below the viewport
  children: (item, index) => h.div({ class: 'row' }, `${index}: ${item}`)
});
```

-   `each`: A signal containing the array of items.
-   `itemHeight`: The fixed height of each item in pixels.
-   `children`: A function that receives the item and its `index` and returns a DOM node.
-   `overscan?`: The number of extra items to render on either side.
-   `class?`, `style?`: Optional class and style attributes for the scroll container.
-   `placeholder?`: An optional element to show when the `each` array is empty.

#### `Fragment(props: { children: Node[] }): DocumentFragment`

Groups multiple children without adding a wrapper element to the DOM.

#### `Portal(props: { mount: Element, children: Node }): Comment`

Renders `children` into a different DOM `mount` node.

## Performance & Trade-offs

Aided achieves exceptional performance through:

- **Direct DOM Manipulation**: No Virtual DOM diffing - effects bind directly to DOM nodes
- **Fine-Grained Updates**: Only code dependent on changed state re-executes
- **Surgical Reconciliation**: The `For` component uses an optimized LIS algorithm for minimal DOM operations
- **Virtual Scrolling**: `VirtualFor` renders only visible items for millions of rows

**Bundle Size**: 4.67kb minified + gzipped
**Memory**: Automatic cleanup prevents leaks through ownership graph
**Runtime**: Zero dependencies, pure JavaScript execution

The trade-off is that it does not use JSX, instead opting for a hyperscript function (`h`) for UI creation. The keyed reconciliation in `For` is highly efficient for lists with stable keys. For extremely large datasets, the `VirtualFor` component provides best-in-class rendering performance.

## Contributing

Contributions are welcome! Please open an issue to discuss your ideas before submitting a pull request. See the [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started.

## Acknowledgements

The architecture and API of Aided are heavily inspired by the excellent work of [SolidJS](https://www.solidjs.com/) and its fine-grained reactivity model.

## License

[MIT](./LICENSE)
