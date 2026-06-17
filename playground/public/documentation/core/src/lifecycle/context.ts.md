# context.ts

**Purpose**: Creates context objects for dependency injection throughout the component tree.

## API

```typescript
createContext<T>(defaultValue?: T): Context<T>
```

## Usage

```typescript
// Create context with default value
const ThemeContext = createContext<Theme>({
  primary: "blue",
  secondary: "gray",
});

// Provide value in a scope
createRoot(() => {
  provide(ThemeContext, { primary: "red" });

  // Consume value
  const theme = inject(ThemeContext); // { primary: 'red' }
});

// Outside provider, get default
const theme = inject(ThemeContext); // { primary: 'blue', secondary: 'gray' }
```

## Key Concepts

- **Dependency Injection**: Share data without prop drilling
- **Symbol-based ID**: Unique identifier for type safety
- **Default Value**: Fallback when no provider found
- **Hierarchy-aware**: Looks up owner tree for providers

## Implementation Notes

### createContext Implementation

```typescript
export function createContext<T>(defaultValue?: T): Context<T> {
  return {
    id: Symbol("context"),
    defaultValue,
  };
}
```

**Symbol usage**:

- Creates unique context ID
- Cannot be forged or duplicated
- Type-safe context identification

**Why Symbol**:

- Perfect for unique identifiers
- Not accessible via normal object properties
- No collision risk

### Context Interface

```typescript
export interface Context<T> {
  readonly id: symbol;
  readonly defaultValue?: T;
}
```

**Properties**:

- **id**: Unique symbol for context matching
- **defaultValue**: Fallback value if no provider

### Context Usage Pattern

**Full example**:

```typescript
// 1. Create context
interface Theme {
  primary: string;
  secondary: string;
}
const ThemeContext = createContext<Theme>({
  primary: "blue",
  secondary: "gray",
});

// 2. Provide value
createRoot(() => {
  provide(ThemeContext, { primary: "red", secondary: "darkred" });

  // 3. Consume in children
  createEffect(() => {
    const theme = inject(ThemeContext);
    console.log(theme.primary); // 'red'
  });
});

// 4. Outside provider, get default
const theme = inject(ThemeContext); // { primary: 'blue', secondary: 'gray' }
```

**Component example**:

```typescript
const ThemeContext = createContext<Theme>({ primary: "blue" });

function App() {
  return createRoot(() => {
    provide(ThemeContext, { primary: "red" });
    return h.div({}, h(ThemedButton));
  });
}

function ThemedButton() {
  const theme = inject(ThemeContext);
  return h.button({ style: { backgroundColor: theme.primary } }, "Themed");
}
```

### Context Inheritance

**Inheritance behavior**:

```typescript
createRoot(() => {
  provide(ThemeContext, { primary: "red" });

  createRoot(() => {
    const theme = inject(ThemeContext); // Inherits 'red'
  });
});
```

**Override behavior**:

```typescript
createRoot(() => {
  provide(ThemeContext, { primary: "red" });

  createRoot(() => {
    provide(ThemeContext, { primary: "green" }); // Override

    const theme = inject(ThemeContext); // 'green'
  });
});
```

### Type Safety

**Generic typing**:

```typescript
const ThemeContext = createContext<Theme>({ primary: "blue" });

// Type inferred from generic
const theme = inject(ThemeContext); // Theme | undefined
```

**Optional default**:

```typescript
// No default
const Context = createContext<string | undefined>(undefined);

// With default
const Context = createContext<string>("default");
```

## Security

### No Security Concerns

- Symbol-based isolation
- No string-based context names
- No user input processing

### Potential Pitfalls

**Context collision**:

```typescript
// Different contexts, same name - still unique
const ContextA = createContext("value");
const ContextB = createContext("value");

// Different symbols even with same default
inject(ContextA) !== inject(ContextB);
```

**Type mismatches**:

```typescript
// Wrong type provided
const Context = createContext<string>("string");
provide(Context, 123 as any); // Runtime error

// Better: use proper types
const Context = createContext<number>(0);
```

## Performance Considerations

### Context Lookup

- O(n) where n = depth of owner hierarchy
- Map lookup per owner: O(1)
- Typically shallow hierarchy (low n)

### Memory Usage

- Per context: Symbol + optional default value
- Per owner with contexts: Map allocation
- Context values stored once per provider

## Edge Cases

**No provider for context**:

```typescript
const Context = createContext<string>("default");
const value = inject(Context); // 'default'
```

**Provider with undefined**:

```typescript
const Context = createContext<string | undefined>(undefined);
provide(Context, undefined);
const value = inject(Context); // undefined (explicitly provided)
```

**Multiple contexts**:

```typescript
const ThemeContext = createContext<Theme>({ primary: "blue" });
const UserContext = createContext<User | null>(null);

// Both can be used independently
const theme = inject(ThemeContext);
const user = inject(UserContext);
```

**Symbol exposure**:

```typescript
// Context.id is public but unique
const themeContext = createContext<Theme>({});

// Can't create matching context without symbol
const fakeContext = { id: Symbol("context"), defaultValue: {} };
inject(fakeContext); // Won't match themeContext
```

## Test Coverage

Expected: 100% coverage for createContext, context lookup, inheritance, override
