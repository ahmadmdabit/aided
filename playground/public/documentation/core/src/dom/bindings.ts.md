# bindings.ts

**Purpose**: Provides reactive DOM binding utilities that connect signals to DOM elements, enabling automatic UI updates when state changes.

## Exports

### `bindText(element, signal)`

Binds a signal to element's `textContent`. Updates automatically when signal changes.

### `bindAttr(element, attributeName, signal)`

Binds a signal to an element attribute. Removes attribute when value is null/undefined/false.

### `bindEvent(element, eventName, handler)`

Attaches type-safe event listener with automatic cleanup on disposal.

### `bindClassList(element, classMap)`

Reactively toggles CSS classes based on boolean signals or static values.

### `bindStyle(element, styleMap)`

Reactively updates individual CSS style properties from signals or static values.

### `Model(element, [getter, setter])`

Creates two-way binding between form inputs and signals.

## API Details

### bindText

```typescript
bindText<T>(element: Node, signal: SignalGetter<T>): void
```

Converts signal value to string using `String(value)` for non-null/undefined values.

### bindAttr

```typescript
bindAttr<T>(element: Element, attributeName: string, signal: SignalGetter<T>): void
```

### bindEvent

```typescript
bindEvent<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void
): void
```

### bindClassList

```typescript
type ClassListMap = { [key: string]: SignalGetter<boolean> };
bindClassList(element: Element, classMap: ClassListMap): void
```

### bindStyle

```typescript
type StyleMap = { [K in keyof CSSProperties]: SignalGetter<CSSProperties[K]> };
bindStyle(element: HTMLElement, styleMap: Partial<StyleMap>): void
```

### Model

```typescript
Model<T>(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, signal: [SignalGetter<T>, SignalSetter<T>]): void
```

## Usage Example

```typescript
const [text, setText] = createSignal("Hello");
const [active, setActive] = createSignal(true);
const [count, setCount] = createSignal(0);
const div = document.createElement("div");

bindText(div, text);
bindClassList(div, { active });
bindEvent(div, "click", () => setText("Clicked!"));
bindStyle(div, { color: () => (count() > 5 ? "red" : "blue") });
```

## Key Concepts

- All bindings use `createEffect` for automatic reactivity
- Event listeners auto-cleanup via `onCleanup` to prevent memory leaks
- Static values bypass effect creation for better performance
- Type-safe event handling with HTMLElementEventMap
- Reactive attributes track dependencies and re-run effects when signals change

## Implementation Notes

### The Fix: bindStyle Undefined Value Handling

**The Problem**:

```typescript
// BEFORE: Could throw "Cannot read properties of undefined"
for (const propName in styleMap) {
  const key = propName as keyof StyleMap;
  const valueOrSignal = styleMap[key]; // Might be undefined!

  if (typeof valueOrSignal === "function") {
    // ERROR: Calling undefined() throws!
    const value = valueOrSignal();
  }
}
```

When `styleMap` has properties set to `undefined`:

```typescript
bindStyle(element, {
  color: "red",
  fontSize: undefined, // Property exists but value is undefined
  backgroundColor: () => "blue",
});
```

The `for...in` loop iterates over all enumerable properties, including those with `undefined` values. Attempting to call `undefined()` throws an error.

**The Fix**:

```typescript
// THE FIX for the 'undefined' error:
// Ensure the valueOrSignal actually exists.
if (valueOrSignal) {
  if (typeof valueOrSignal === "function") {
    createEffect(() => {
      const value = valueOrSignal();
      (element.style as Record<string, any>)[key] = value ?? "";
    });
  } else {
    (element.style as Record<string, any>)[key] = valueOrSignal;
  }
}
```

The `if (valueOrSignal)` guard:

- Filters out `undefined` values
- Filters out `null` values
- Allows falsy style values like `0` or `''` to be applied
- Prevents type errors when property exists but value is undefined

### Security: URL Protocol Sanitization

**URL Attributes**:

```typescript
export const URL_ATTRS = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "xlink:href",
  "srcdoc",
  "poster",
]);
```

**Dangerous Protocol Pattern**:

```typescript
export const DANGEROUS_PROTOCOL = /^\s*(javascript|vbscript|data):/i;
```

**Validation in bindAttr**:

```typescript
const isUrlAttr = URL_ATTRS.has(lowerAttr);
const strValue = String(value);

if (isUrlAttr && DANGEROUS_PROTOCOL.test(strValue)) {
  throw new Error(
    `Security: Dangerous protocol detected in '${attributeName}' attribute. ` +
      `Executable protocols like 'javascript:', 'vbscript:', and 'data:' are blocked.`,
  );
}
```

This prevents XSS attacks like:

```html
<!-- These would be blocked -->
<a href="javascript:alert('XSS')">Click</a>
<img src="data:text/html,<script>alert('XSS')</script>" />
```

### Security: Event Handler Blocking

Event handler attributes (onclick, onchange, etc.) are rejected by `bindAttr`:

```typescript
if (lowerAttr.startsWith("on")) {
  throw new Error(
    `Security: Cannot bind event handler attribute '${attributeName}'. ` +
      `Use addEventListener() instead.`,
  );
}
```

This ensures:

- All event handlers go through `bindEvent` with error handling
- Consistent error handling across all event listeners
- Prevents accidental use of HTML event attributes
- Type-safe event handling via HTMLElementEventMap

### bindStyle Type Safety

```typescript
type StyleMap = { [K in keyof CSSProperties]: SignalGetter<CSSProperties[K]> };
```

The `keyof CSSProperties` ensures only valid CSS properties are accepted:

- `color`, `fontSize`, `backgroundColor`, etc.
- Not: `colorz`, `font-size` (should use camelCase)

Type assertion for dynamic access:

```typescript
(element.style as Record<string, any>)[key] = value ?? "";
```

This tells TypeScript that the style object accepts arbitrary string keys, which is necessary because we're accessing properties dynamically.

### Model Input Type Handling

```typescript
if (
  element instanceof HTMLInputElement &&
  (element.type === "checkbox" || element.type === "radio")
) {
  element.checked = !!value;
  (set as SignalSetter<boolean>)(element.checked);
} else {
  element.value = String(value ?? "");
  (set as SignalSetter<string>)(element.value);
}
```

The Model function handles:

- **Text inputs**: `value` property
- **Checkboxes/Radios**: `checked` property
- **Select elements**: `value` property
- **Textareas**: `value` property

### Cursor Position Optimization

```typescript
if (element.value !== String(value ?? "")) {
  element.value = String(value ?? "");
}
```

This prevents resetting the cursor position when the value hasn't changed, improving UX for user editing.

## Security Features (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)

### URL Protocol Validation (bindAttr)

- Blocks `javascript:`, `vbscript:`, `data:` protocols
- Only applies to URL-sensitive attributes (href, src, action, etc.)
- Throws descriptive error with attribute name

### Event Handler Blocking (bindAttr)

- Rejects attributes starting with 'on'
- Forces use of `bindEvent` with error handling
- Prevents HTML event handler attributes

### Static Attribute Validation (h.ts)

- Same validation applied in hyperscript for static attributes
- Prevents dangerous protocols in inline attributes

## Performance Considerations

- Static values in bindClassList bypass effect creation
- bindStyle uses Object.keys for safe iteration
- bindEvent wraps handler in try-catch for error isolation
- All bindings use createEffect for dependency tracking

## Edge Cases

- Null/undefined signal values: Converted to empty string for textContent
- False boolean values: Attribute removed, class removed
- Empty string values: Attribute set to empty string
- Function vs static values: Functions create effects, static values set once
- Invalid CSS properties: Browser handles (bindStyle allows all CSSProperties keys)
