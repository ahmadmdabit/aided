# error.ts

**Purpose**: Custom error class for library-specific errors and development-mode-only warnings.

## API

### AidedError

```typescript
class AidedError extends Error {
  constructor(message: string, public readonly code?: string)
}
```

### devWarning

```typescript
devWarning(condition: boolean, message: string): void
```

## Usage

```typescript
// Throw custom error
try {
  throw new AidedError("Invalid state", "INVALID_STATE");
} catch (err) {
  if (err instanceof AidedError) {
    console.log(err.code); // 'INVALID_STATE'
  }
}

// Development warning
devWarning(hasOwner(), "Effect created outside reactive root");
// Logs: "[Aided Warning] Effect created outside reactive root"

// No-op in production
// Bundlers replace process.env.NODE_ENV with "production"
// Warning code is stripped during build
```

## Key Concepts

- **AidedError**: Custom error class allowing filtering of Aided-specific errors
- **devWarning**: Development-only warnings that are tree-shaken in production
- **Error codes**: Optional programmatic error identification
- **Console prefix**: All warnings prefixed with `[Aided Warning]`

## Implementation Notes

### AidedError Design

**Why custom error class?**

- Distinguishes Aided errors from user errors
- Enables error handling: `if (err instanceof AidedError)`
- Optional error codes for programmatic handling

**Implementation**:

```typescript
export class AidedError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AidedError";
  }
}
```

**Usage patterns**:

```typescript
// With error code
throw new AidedError("Invalid signal value", "INVALID_SIGNAL");

// Without error code
throw new AidedError("Signal not found");

// Check in error handler
function handleError(err: unknown) {
  if (err instanceof AidedError) {
    console.error(`Aided error [${err.code}]: ${err.message}`);
  } else {
    console.error("Unknown error:", err);
  }
}
```

### devWarning Implementation

**Production stripping**:

```typescript
export function devWarning(condition: boolean, message: string): void {
  if (process.env.NODE_ENV !== "production") {
    if (condition) return;
    console.warn(`[Aided Warning] ${message}`);
  }
}
```

**Bundler transformation**:

- Vite/webpack replace `process.env.NODE_ENV` at build time
- In production: `devWarning` body becomes `if ("production" !== "production") { ... }`
- Dead code elimination removes the entire block
- Zero runtime overhead in production

**Warning logic**:

- `condition` is the "ok" condition (warning shown if false)
- This matches `assert` convention: `devWarning(shouldNotHappen, "message")`
- Example: `devWarning(hasOwner(), 'Must be in reactive root')` → warn if !hasOwner()

### Warning Examples

**Reactive scope warning**:

```typescript
devWarning(
  hasOwner(),
  "createEffect was called outside of a reactive scope. The effect will not be automatically cleaned up.",
);
```

**Missing key warning (in For component)**:

```typescript
devWarning(
  !!key || !newItems.some((item) => typeof item !== "object" || item === null),
  "The `For` component is being used with an array of primitives without a `key` prop. This can lead to inefficient re-rendering. Please provide a `key` function.",
);
```

**Dangerous tag usage**:

```typescript
devWarning(
  false,
  `Using h.dangerous.${dangerousProp}() bypasses security filters. Ensure all attributes and children are strictly sanitized.`,
);
```

### Security Considerations

**No sensitive data in warnings**:

- Warnings may be logged in development
- Never include user data, secrets, or PII in warning messages
- Use generic messages: "Invalid input" not "Invalid input: [user data]"

**Production safety**:

- All warnings stripped in production
- No information leakage possible
- No performance impact in production

### Testing Strategy

**Development mode only**:

- Warnings only appear in dev builds
- Test with `NODE_ENV=development`
- Production tests verify warnings don't appear

**Integration with testing frameworks**:

```typescript
// Spy on console.warn
const warnSpy = jest.spyOn(console, "warn").mockImplementation();

// Trigger warning
devWarning(false, "Test warning");

// Verify warning
expect(warnSpy).toHaveBeenCalledWith("[Aided Warning] Test warning");
```

## Performance Considerations

### Zero Overhead in Production

- Tree-shaken away by bundlers
- No function call overhead
- No string concatenation in production

### Development Overhead

- Single function call per warning
- Conditional check before console.log
- Negligible impact on development experience

## Edge Cases

**Warning when condition is true**:

```typescript
devWarning(true, "This will never show");
// No warning logged
```

**Warning when condition is false**:

```typescript
devWarning(false, "This will always show");
// Warning logged every time
```

**Undefined condition**:

```typescript
devWarning(undefined, "Warning shown"); // falsy
// Warning logged
```

## Test Coverage

Expected: 100% coverage for devWarning function
