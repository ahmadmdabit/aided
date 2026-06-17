# Fragment.ts

**Purpose**: Groups multiple children without adding extra DOM elements.

## API

```typescript
Fragment({ children: Node[] }): DocumentFragment
```

## Usage

```typescript
// Simple usage
Fragment({
  children: [h.p("First"), h.p("Second")],
});

// With conditional children
Fragment({
  children: [
    h.p("Always shown"),
    showCondition() ? h.p("Conditionally shown") : null,
    h.p("Always shown too"),
  ],
});

// For component return values
function MyComponent() {
  return Fragment({
    children: [h.h1("Title"), h.p("Paragraph")],
  });
}
```

## Key Concepts

- **DocumentFragment**: Groups nodes without wrapper element
- **No wrapper element**: Children rendered directly to parent
- **Static structure**: No reactive behavior
- **Return type**: DocumentFragment for DOM insertion

## Implementation Notes

### Fragment Implementation

```typescript
export function Fragment(props: { children: Node[] }): DocumentFragment {
  const fragment = document.createDocumentFragment();

  props.children.forEach((child) => {
    if (child !== null && child !== undefined) {
      fragment.appendChild(child);
    }
  });

  return fragment;
}
```

**Implementation details**:

- Creates `document.createDocumentFragment()`
- Appends children to fragment
- Returns fragment for DOM insertion
- Filters null/undefined children

**Why DocumentFragment?**

- Lightweight container for multiple nodes
- Not rendered in DOM (invisible wrapper)
- All children appear as siblings when appended

### Use Cases

**Multiple siblings from component**:

```typescript
function ListHeader() {
  return Fragment({
    children: [h.h1("Title"), h.p("Subtitle")],
  });
}

// Renders: <h1>Title</h1><p>Subtitle</p>
// Not: <div><h1>Title</h1><p>Subtitle</p></div>
```

**Conditional children**:

```typescript
Fragment({
  children: [h.p("Always shown"), condition() ? h.p("Optional") : null],
});

// If condition false: <p>Always shown</p>
// If condition true: <p>Always shown</p><p>Optional</p>
```

**List rendering helper**:

```typescript
function ListItem({ item, index }) {
  return Fragment({
    children: [h.li(item.text), index < items.length - 1 ? h.hr() : null],
  });
}
```

### Comparison with Other Patterns

**vs. Wrapper div**:

```typescript
// With wrapper div
function MyComponent() {
  return h.div({}, [h.h1("Title"), h.p("Content")]);
}
// Renders: <div><h1>Title</h1><p>Content</p></div>

// With Fragment
function MyComponent() {
  return Fragment({
    children: [h.h1("Title"), h.p("Content")],
  });
}
// Renders: <h1>Title</h1><p>Content</p>
```

**vs. Array return**:

```typescript
// In some libraries, can return array
function MyComponent() {
  return [h.h1("Title"), h.p("Content")];
}

// In Aided, use Fragment for explicit grouping
```

**vs. For component**:

```typescript
// For component: dynamic list
For({ each: items, children: (item) => h.li(item()) });

// Fragment: static group
Fragment({ children: [h.h1("Title"), h.p("Content")] });
```

### Limitations

**No reactive children**:

```typescript
// WON'T WORK - Fragment doesn't track signals
Fragment({
  children: [count()], // Not reactive
});

// DO THIS instead
For({ each: () => [count()], children: (item) => h.p(item()) });
```

**No lifecycle management**:

- Fragment is static
- No createRoot for children
- No automatic cleanup
- Use For/Show for dynamic content

## Security

### No Security Concerns

- Simple DOM grouping
- No user input processed
- No code execution

## Performance Considerations

### Overhead

- Minimal: One DocumentFragment creation
- Direct appendChild operations
- No reactivity overhead

### Memory Usage

- One DocumentFragment per Fragment instance
- Children stored in fragment
- No additional data structures

## Edge Cases

**Empty children**:

```typescript
Fragment({ children: [] }); // Empty DocumentFragment
```

**All null/undefined children**:

```typescript
Fragment({
  children: [null, undefined, null],
}); // Empty DocumentFragment
```

**Mixed children**:

```typescript
Fragment({
  children: [
    h.p("Text"),
    null,
    h.div("Div"),
    undefined,
    document.createTextNode("Node"),
  ],
}); // All valid children appended
```

**Single child**:

```typescript
Fragment({ children: [h.p("Single")] });
// Works, but may be overkill for single element
```

**Nested Fragment**:

```typescript
Fragment({
  children: [Fragment({ children: [h.p("Nested")] })],
});
// Nested fragment's children are appended directly
```

## Test Coverage

Expected: 100% coverage for Fragment creation with various child types
