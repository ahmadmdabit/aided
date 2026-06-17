### **Aided Hyperscript Helper: Common Usage Examples**

The `h` helper is a proxy that provides a function for every HTML tag (e.g., `h.div`, `h.p`, `h.button`). These functions can be called with an optional attributes object followed by any number of children.

#### **Setup**

All examples assume you have the necessary functions imported:

```javascript
import { h, createSignal, render, Model } from "aided-core";
```

#### **Core Characteristics**

- **Render-Once Execution**: Components execute once to set up reactive structures. They do not re-render as state updates.
- **Direct Node Swapping**: Instead of computing virtual trees, dynamic text, elements, and attributes use fine-grained signals bound to surgically updated DOM nodes.
- **Array Support**: Passing an array of elements or children is natively supported (e.g. `h.div([childA, childB])`).
- **Null & Undefined Safety**: `null` or `undefined` values passed as reactive children or signal getters safely resolve to an empty string `""` on updates.

---

### 1. Basic Element Creation

The simplest use case is creating an element with static text content.

**Concept:** Create a paragraph with a string child.

```javascript
// Children can be passed as separate arguments
const greeting = h.p("Hello, ", "Aided!");

// Expected HTML: <p>Hello, Aided!</p>
render(() => greeting, document.body);
```

---

### 2. Static Attributes and Properties

Pass an object as the first argument to set attributes like `id`, `class`, `href`, etc.

**Concept:** Create a link with an `id` and `href`, and a disabled button.

```javascript
const link = h.a(
  {
    id: "my-link",
    href: "https://github.com/ahmadmdabit/aided",
    target: "_blank",
  },
  "Aided Repository",
);

const button = h.button(
  {
    class: "btn btn-primary", // Use 'class' for static classes
    disabled: true,
  },
  "Cannot Click",
);

// Expected HTML:
// <a id="my-link" href="..." target="_blank">Aided Repository</a>
// <button class="btn btn-primary" disabled>Cannot Click</button>
```

---

### 3. Reactive Children (Text Nodes)

This is a core feature of Aided's reactivity. When you pass a signal as a child, Aided creates a text node that automatically updates when the signal's value changes, without re-rendering the parent element.

**Concept:** A counter that updates its text content on a button click.

```javascript
const [count, setCount] = createSignal(0);

const counterDisplay = h.div(
  h.strong("Count: "),
  count, // Pass the signal directly as a child
);

const incrementButton = h.button(
  { onClick: () => setCount(count() + 1) },
  "Increment",
);

// When the button is clicked, only the text node representing `count` is updated.
// The <div> and <strong> elements are never touched again.
```

---

### 4. Reactive Attributes

Just like children, attributes can be made reactive by passing a signal as their value.

**Concept:** An input field whose `placeholder` text changes based on a signal.

```javascript
const [placeholderText, setPlaceholderText] =
  createSignal("Enter your name...");

const input = h.input({
  type: "text",
  placeholder: placeholderText, // The placeholder attribute is now reactive
});

// Later, if you call...
// setPlaceholderText('Name is required!');
// ...the input's placeholder will update automatically.
```

---

### 5. Event Handling

Event handlers are passed as properties in the attributes object, using camelCase names like `onClick` and `onInput`. They are automatically cleaned up when the component is disposed.

**Concept:** A button that logs to the console and an input that updates a signal.

```javascript
const [text, setText] = createSignal("");

const logButton = h.button(
  { onClick: () => console.log("Button was clicked!") },
  "Log Message",
);

const textInput = h.input({
  // The event object is passed to the handler
  onInput: (event) => setText(event.currentTarget.value),
});
```

---

### 6. Reactive Styling (`style` property)

The `style` property is special and can be used in three ways.

**a) Static Style String (Simple)**

```javascript
const styledDiv = h.div(
  {
    style: "color: blue; font-size: 20px;",
  },
  "Styled with a string",
);
```

**b) Static Style Object (Recommended for static styles)**

```javascript
const styledDiv = h.div(
  {
    style: {
      color: "green",
      fontWeight: "bold",
      backgroundColor: "#f0f0f0",
    },
  },
  "Styled with an object",
);
```

**c) Reactive Style Object (Powerful)**
Pass signals as values in the style object to make individual CSS properties reactive.

```javascript
const [color, setColor] = createSignal("red");
const [fontSize, setFontSize] = createSignal(16);

// Note: Aided optimizes this at build-time. It only initiates the reactive
// bindStyle effect if at least one style property in the object is a signal/function.
// Static objects bypass reactivity and use fast native Object.assign.
const reactiveStyledDiv = h.div(
  {
    style: {
      color: color, // This property will update when the signal changes
      fontSize: () => `${fontSize()}px`, // You can also use a function/memo
      transition: "color 0.3s ease",
    },
  },
  "My style is reactive!",
);

// If you call setColor('purple'), only the `color` style property changes.
```

---

### 7. Reactive CSS Classes (`classList` property)

The `classList` property is a special helper for toggling classes based on boolean signals.

**Concept:** A component whose appearance changes based on `isActive` and `hasError` states.

```javascript
const [isActive, setIsActive] = createSignal(true);
const [hasError, setHasError] = createSignal(false);

const statusBox = h.div(
  {
    classList: {
      active: isActive, // The 'active' class is present when isActive() is true
      error: hasError, // The 'error' class is present when hasError() is true
      "box-style": true, // Static classes can be included with a `true` value
    },
  },
  "Status",
);

// If you call setIsActive(false) and setHasError(true),
// the element's class will become "error box-style".
```

---

### 8. The `ref` Attribute

The `ref` attribute provides a way to get a direct reference to the underlying DOM element after it has been created. This is useful for imperative actions like focusing an input or integrating with third-party libraries.

**Concept:** Automatically focus an input field when it's rendered.

```javascript
let inputElement; // Variable to hold the DOM element

const autoFocusInput = h.input({
  type: "text",
  ref: (el) => {
    // This callback runs as soon as the element is created
    inputElement = el;
    el.focus();
  },
});
```

---

### 9. Two-Way Binding with `Model`

The `Model` helper, used with `ref`, provides convenient two-way binding for form elements.

**Concept:** An input field that both displays and updates a signal.

```javascript
const [name, setName] = createSignal("Aided");

const nameInput = h.input({
  type: "text",
  // Model takes the element and a [getter, setter] tuple
  ref: (el) => Model(el, [name, setName]),
});

const displayName = h.p("Hello, ", name, "!");

// Now, typing in the input updates the `name` signal, which updates the <p>.
// Calling setName('New Name') will update the value of the input field.
```

---

### 10. Security Safeguards & Tag Constraints

Version 1.2.0 introduces several runtime rules to eliminate Cross-Site Scripting (XSS), prototype pollution, and malicious inline bindings.

#### **a) Rejection of Inline Event Attributes**

Attributes starting with `"on"` (case-insensitive) passed to generic attributes will trigger a `Security` error. Inline attributes like `"onclick"`, `"onload"`, or `"onerror"` must be declared either as function callbacks inside the attribute parameters (e.g., `onClick: handler`) or registered directly via `addEventListener`:

```javascript
// ❌ Throws an Aided Security Error
const badButton = h.button({ onclick: "alert('xss')" });

// ✅ Allowed: Declarative function callbacks
const goodButton = h.button({ onClick: () => alert("safe") });
```

#### **b) Tag Name Validation Constraints**

All tag names queried through the `h` proxy must start with an alphabetical character and only contain alphanumeric characters or hyphens (`/^[a-zA-Z][a-zA-Z0-9-]*$/`). This blocks invalid, dynamic, or dangerous elements:

```javascript
// ❌ Throws a "Invalid tag name" Error
h["1div"]();
h["div@test"]();
h[""]();
```

#### **c) Blocked Structural Keywords**

Accessing `"script"`, `"constructor"`, or `"prototype"` on the `h` proxy is explicitly blocked to prevent element injection and prototype modifications:

```javascript
// ❌ Throws a "Security: Cannot create tag..." Error
h.script();
h.constructor();
h.prototype();

// ✅ Allowed standard or custom elements
h.div();
h.span();
h["my-custom-element"]();
```
