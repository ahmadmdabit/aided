# query.ts

**Purpose**: Provides scoped DOM query utilities as a safer alternative to global `document.querySelector`.

## Exports

### `scopeQuery(root)`

Creates a query function scoped to a specific root element.

**Parameters**:

- `root: Element` - The root element to scope queries to

**Returns**:

- `query<T>(selector: string): T | null` - Typed query function

## Usage Example

```typescript
const container = document.getElementById("app");
const query = scopeQuery(container);

const button = query<HTMLButtonElement>(".submit-btn");
const input = query<HTMLInputElement>('input[name="email"]');

// Safer than document.querySelector
// Only searches within container, not entire document
```

## Key Concepts

- **Scoping**: Queries only search within the provided root element
- **Type Safety**: Generic type parameter for compile-time type checking
- **Convenience**: Single function created once, used multiple times
- **Encapsulation**: Each component can have its own query function

## Implementation Notes

### Implementation

```typescript
export function scopeQuery(root: Element) {
  return function query<T extends Element>(selector: string): T | null {
    return root.querySelector<T>(selector);
  };
}
```

**How it works**:

1. `scopeQuery` takes root element as parameter
2. Returns inner function that captures root in closure
3. Inner function delegates to `root.querySelector`
4. Generic type T extends Element for type safety

**Type inference**:

```typescript
// Generic parameter inferred from usage
const button = query<HTMLButtonElement>(".submit-btn");
// button type: HTMLButtonElement | null

// Can use as type assertion
const button = query(".submit-btn") as HTMLButtonElement;
```

### Use Cases

**Component Encapsulation**:

```typescript
function MyComponent() {
  const container = h.div({ class: "my-component" }, [
    h.button({ class: "btn" }, "Click"),
    h.input({ class: "input" }),
  ]);

  // Component can query its own elements
  const query = scopeQuery(container);

  const button = query<HTMLButtonElement>(".btn");
  const input = query<HTMLInputElement>(".input");

  return container;
}
```

**Testing**:

```typescript
function testComponent() {
  const component = MyComponent();
  const query = scopeQuery(component);

  // Test that button exists
  const button = query<HTMLButtonElement>(".btn");
  assert(button !== null);

  // Test that specific element doesn't exist
  const nonExistent = query<HTMLDivElement>(".does-not-exist");
  assert(nonExistent === null);
}
```

**Modal/Dialog Components**:

```typescript
function Modal() {
  const modal = h.div({ class: "modal" }, [
    h.div({ class: "modal-content" }, [
      h.h2({}, "Title"),
      h.p({}, "Content"),
      h.button({ class: "close" }, "×"),
    ]),
  ]);

  const query = scopeQuery(modal);

  // Component manages its own elements
  const closeBtn = query<HTMLButtonElement>(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  return modal;
}
```

**Form Validation**:

```typescript
function Form() {
  const form = h.form({ class: "form" }, [
    h.input({ class: "email", name: "email", type: "email" }),
    h.input({ class: "password", name: "password", type: "password" }),
    h.button({ class: "submit" }, "Submit"),
  ]);

  const query = scopeQuery(form);

  function validate() {
    const email = query<HTMLInputElement>(".email");
    const password = query<HTMLInputElement>(".password");

    if (!email || !password) {
      return false;
    }

    return email.value.includes("@") && password.value.length >= 8;
  }

  return form;
}
```

### Comparison with Global Query

**Global query**:

```typescript
// Searches entire document
const button = document.querySelector(".btn");
// Could match elements from other components
```

**Scoped query**:

```typescript
// Only searches within root
const button = scopeQuery(component)(".btn");
// Only matches elements in this component
```

**Benefits of scoping**:

- No cross-contamination between components
- Predictable query results
- Better encapsulation
- Easier testing

### Type Safety

**Generic parameter**:

```typescript
function query<T extends Element>(selector: string): T | null;
```

**Inferred types**:

```typescript
// Explicit type
const button = query<HTMLButtonElement>(".btn");

// Type assertion
const button = query(".btn") as HTMLButtonElement;

// Both work, explicit type preferred
```

### Error Handling

**Invalid selectors**:

```typescript
const result = scopeQuery(root)("[invalid selector");
// Returns null (standard querySelector behavior)
```

**No matching elements**:

```typescript
const result = scopeQuery(root)(".nonexistent");
// Returns null
```

**Null/undefined root**:

```typescript
scopeQuery(null)(".btn"); // Error: Cannot read properties of null
// Caller must provide valid Element
```

### Performance

**Overhead**:

- Minimal: One closure per scopeQuery call
- query delegation: Direct call to root.querySelector
- No additional processing

**Comparison**:

- Same performance as document.querySelector
- Only difference is the closure capture
- Negligible for typical usage

### Security

### No Security Concerns

- Simple delegation pattern
- No user input directly processed
- Standard DOM API usage

## Edge Cases

**Empty selector**:

```typescript
scopeQuery(root)(""); // Returns root (standard querySelector behavior)
```

**Complex selectors**:

```typescript
scopeQuery(root)('.class > .child[attr="value"]');
// Works like standard querySelector
```

**Multiple calls with same root**:

```typescript
const query = scopeQuery(root);
const el1 = query(".btn");
const el2 = query(".btn"); // Second call is independent
```

**Root removed from DOM**:

```typescript
const query = scopeQuery(root);
root.remove(); // Root no longer in DOM
const el = query(".btn"); // Still works, just returns null
```

**Nested scoping**:

```typescript
const outer = scopeQuery(document.body);
const inner = scopeQuery(outer(".container")!);
// inner only searches within .container
```

## Test Coverage

Expected: 100% coverage for scopeQuery with various selectors and edge cases
