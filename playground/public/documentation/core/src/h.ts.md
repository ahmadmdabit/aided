# h.ts

**Purpose**: Hyperscript helper for creating DOM elements with reactive capabilities, including comprehensive security validation for tag names and dangerous attribute handling.

## API

```typescript
h.tagName(
  attributes?: Record<string, any>,
  ...children: Child[]
): HTMLElement

// Secure namespace for dangerous tags (explicit opt-in)
h.dangerous.tagName(
  attributes?: Record<string, any>,
  ...children: Child[]
): HTMLElement
```

## Usage

```typescript
import { h, createSignal } from "aided-core";

const [count, setCount] = createSignal(0);
const [color, setColor] = createSignal("blue");

// Create reactive elements
const button = h.button(
  {
    onClick: () => setCount(count() + 1),
    class: "btn",
    classList: { active: () => count() > 5 },
    style: { color: () => (count() > 5 ? "red" : "blue") },
  },
  "Count: ",
  count, // Reactive child
);

// Use with signals for dynamic attributes
const link = h.a(
  {
    href: () => `/user/${userId()}`,
    classList: { highlight: () => isActive() },
  },
  "User Profile",
);

// Secure navigation
const safeUrl = h.a({ href: "https://example.com" }, "Safe Link");
const unsafeUrl = h.a({ href: "javascript:alert(1)" }); // Throws error
```

## Key Concepts

- **Proxy-based tag methods**: One method per HTML tag via Proxy get trap
- **Reactive attributes**: Signals automatically tracked and updated
- **Reactive children**: Children signals update DOM when value changes
- **Special attribute handling**: classList, style, ref, events
- **Security validation**: Blocks dangerous tags, validates tag names
- **Opt-in dangerous namespace**: h.dangerous.\* for explicit bypass (use with caution)

## Security Features

### Tag Name Validation

**Pattern**: `/^[a-zA-Z][a-zA-Z0-9-]*$/`

Valid: `div`, `span`, `my-component`, `custom-element`, `SVGTag`
Invalid: `1tag`, `tag-name`, `tag.name`, `tag name`, `tag!`

**Enforced in**:

- Standard namespace (h.tagName)
- Dangerous namespace (h.dangerous.tagName)

### Dangerous Tags Block

**Standard namespace blocks**:

```typescript
const DANGEROUS_TAGS = new Set([
  "script",
  "iframe",
  "base",
  "meta",
  "link",
  "object",
  "embed",
]);
```

These tags pose security risks:

- **script**: Executes JavaScript
- **iframe**: Can load arbitrary content, clickjacking
- **base**: Changes base URL for all relative links
- **meta**: Can set security headers, refresh pages
- **link**: Can load external resources, stylesheets
- **object/embed**: Can load plugins, execute code

**Error message**:

```typescript
throw new Error(
  `Security: Cannot create '${prop}' element. ` +
    `This tag is blocked by default. Use h.dangerous.${prop}() if you explicitly need it and have sanitized the inputs.`,
);
```

### Opt-in Dangerous Namespace

```typescript
if (prop === "dangerous") {
  return new Proxy(
    {},
    {
      get(_, dangerousProp: string | symbol) {
        if (STRICTLY_BLOCKED.has(dangerousProp)) {
          throw new Error(`Security: Cannot access '${dangerousProp}'.`);
        }
        if (
          DANGEROUS_TAGS.has(dangerousProp) ||
          VALID_TAG_PATTERN.test(dangerousProp)
        ) {
          devWarning(
            false,
            `Using h.dangerous.${dangerousProp}() bypasses security filters. Ensure all attributes and children are strictly sanitized.`,
          );
          return hyperscript(dangerousProp);
        }
        throw new Error(`Invalid tag name '${dangerousProp}'.`);
      },
    },
  );
}
```

**Use cases for dangerous namespace**:

- Trusted dynamic content (sandboxed, sanitized)
- Developer tools, debug components
- Advanced use cases with proper input validation

**Warning**: The dangerous namespace bypasses tag blocking but still validates:

- Tag name format (VALID_TAG_PATTERN)
- Prototype pollution attempts (STRICTLY_BLOCKED)
- User must sanitize all attributes and children

### Prototype Pollution Protection

```typescript
const STRICTLY_BLOCKED = new Set(["constructor", "prototype", "__proto__"]);
```

**Blocks**:

- Access to built-in object methods that could enable prototype pollution
- Attempts to access `__proto__` or `constructor` properties

**Error**:

```typescript
throw new Error(`Security: Cannot access '${prop}'.`);
```

### URL Protocol Sanitization

**Dangerous protocols**: `javascript:`, `vbscript:`, `data:` (executable)

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

export const DANGEROUS_PROTOCOL = /^\s*(javascript|vbscript|data):/i;
```

**Validation locations**:

1. `bindAttr()` - For reactive attributes
2. `h()` hyperscript - For static attributes

**Error message**:

```typescript
throw new Error(
  `Security: Dangerous protocol detected in '${attributeName}' attribute. ` +
    `Executable protocols like 'javascript:', 'vbscript:', and 'data:' are blocked.`,
);
```

### Event Handler Blocking

**Attributes starting with 'on' are rejected**:

```typescript
if (lowerAttr.startsWith("on")) {
  throw new Error(
    `Security: Cannot bind event handler attribute '${attributeName}'. ` +
      `Use addEventListener() instead.`,
  );
}
```

**Why**: Forces use of `bindEvent()` which provides:

- Type-safe event handling
- Error handling wrapper
- Automatic cleanup
- Consistent behavior

## Implementation Notes

### processChild Function

Handles both static and reactive children:

**Static nodes** (Node, string, number):

```typescript
if (child instanceof Node) {
  return child;
}
return document.createTextNode(String(child));
```

**Reactive functions** (signals, memos):

```typescript
if (typeof child === "function") {
  // Create initial node synchronously
  const initialValue = (child as SignalGetter<any>)();
  let currentRenderedNode: Node;

  // a. Create initial node based on first value
  if (initialValue instanceof Node) {
    currentRenderedNode = initialValue;
  } else {
    const textValue = String(initialValue ?? "");
    currentRenderedNode = document.createTextNode(textValue);
  }

  // b. Create effect for subsequent updates only
  createEffect(() => {
    const value = (child as SignalGetter<any>)();
    // Replace node or update text content
  });

  return currentRenderedNode;
}
```

**Synchronous initial render**:

- First value processed immediately
- Node created before effect runs
- No flash of wrong content
- Effect only handles updates

### Hyperscript Function

```typescript
function hyperscript(tag: string) {
  return (...args: any[]): HTMLElement => {
    const el = document.createElement(tag);
    let ref: ((el: Element) => void) | undefined;

    for (const arg of args) {
      if (Array.isArray(arg)) {
        arg.forEach((child) => el.appendChild(processChild(child)));
      } else if (
        typeof arg === "object" &&
        arg !== null &&
        !(arg instanceof Node)
      ) {
        // Process attributes
        for (const key in arg) {
          if (key === "ref") {
            ref = value;
          } else if (key.startsWith("on")) {
            const eventName = key.substring(2).toLowerCase();
            bindEvent(el, eventName, value);
          } else if (key === "classList") {
            bindClassList(el, value);
          } else if (key === "style") {
            bindStyle(el, value);
          } else {
            // Normal attribute
            if (typeof value === "function") {
              bindAttr(el, key, value);
            } else {
              // Static attribute with URL protocol validation
            }
          }
        }
      } else {
        el.appendChild(processChild(arg as Child));
      }
    }

    if (ref) {
      ref(el);
    }
    return el;
  };
}
```

### Special Attribute Handling

**ref callback**:

```typescript
if (key === "ref") {
  ref = value;
  continue; // Don't process as normal attribute
}
// ... after element creation ...
if (ref) {
  ref(el);
}
```

**classList**:

```typescript
if (key === "classList") {
  bindClassList(el, value);
}
```

**style**:

```typescript
if (key === "style") {
  if (typeof value === "object") {
    const isReactive = Object.values(value).some(
      (v) => typeof v === "function",
    );
    if (isReactive) {
      bindStyle(el, value);
    } else {
      Object.assign(el.style, value);
    }
  } else {
    el.setAttribute("style", value);
  }
}
```

**Event handlers**:

```typescript
if (key.startsWith("on")) {
  const eventName = key.substring(2).toLowerCase();
  bindEvent(el, eventName, value);
}
```

### Proxy Get Trap

**Step-by-step validation**:

1. **Opt-in dangerous namespace**:
   - If prop === 'dangerous', return proxy with tag blocking bypass
   - Still validates tag format and blocks prototype pollution

2. **Block prototype escapes**:
   - If prop in STRICTLY_BLOCKED, throw error

3. **Block dangerous tags**:
   - If prop in DANGEROUS_TAGS, throw error with guidance to use dangerous namespace

4. **Validate tag format**:
   - If !VALID_TAG_PATTERN.test(prop), throw error

5. **Return hyperscript function**:
   - Create element with validated tag name

## Performance Considerations

### Proxy Overhead

- Minimal: JavaScript engines optimize Proxy well
- Only one proxy per h object, not per call
- No overhead on element creation itself

### Reactive Children

- First render: Synchronous, no effect
- Updates: One effect per reactive child
- Effects only run when signal changes

### Attribute Handling

- Static attributes: Set once, no effect
- Reactive attributes: One effect per attribute
- Efficient: Only updates changed attributes

## Edge Cases

**Invalid tag names**:

- `h.1div()` → Error (starts with number)
- `h.my-tag()` → Error (hyphen in middle, use h.myTag or custom element)
- `h.myTag()` → Works (custom element with camelCase)

**Prototype pollution**:

- `h.__proto__` → Error
- `h.constructor` → Error
- `h.prototype` → Error

**Dangerous tags**:

- `h.script()` → Error
- `h.dangerous.script()` → Warning + works (bypass, use carefully)

**URL protocols**:

- `h.a({ href: 'https://example.com' })` → Works
- `h.a({ href: 'javascript:alert(1)' })` → Error
- `h.a({ href: 'data:text/plain,hello' })` → Error

**Event handlers**:

- `h.button({ onclick: () => {} })` → Error (use onClick)
- `h.button({ onClick: () => {} })` → Works (reactive event)

## Test Coverage

Expected: 100% coverage for all paths including security validations
