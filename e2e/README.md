# E2E Testing with TestCafe

This directory contains end-to-end (E2E) tests for the Aided playground using TestCafe. These tests validate the complete user experience in real browsers, complementing the unit tests in the main test suite.

## Overview

E2E tests verify that:
- Navigation between examples works correctly
- Interactive examples function as expected
- Reactive state updates occur immediately
- The UI renders without JavaScript errors
- Cross-browser compatibility is maintained

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Yarn 4.x
- Chrome and Firefox browsers (for local testing)

### Installation

Dependencies are already installed as part of the main project setup:

```bash
yarn install
```

### Running Tests

#### All Tests (Both Browsers)
```bash
yarn test:e2e
```

#### Chrome Only
```bash
yarn test:e2e:chrome
```

#### Firefox Only
```bash
yarn test:e2e:firefox
```

#### Headed Mode (See Browser)
```bash
yarn test:e2e:headed
```

#### Debug Mode
```bash
yarn test:e2e:debug
```

#### Specific Test File
```bash
yarn testcafe chrome:headless e2e/tests/examples/counter.test.ts
```

#### Specific Test
```bash
yarn testcafe chrome:headless e2e/tests/examples/counter.test.ts -t "Counter increments on button click"
```

## Project Structure

```
e2e/
├── page-objects/           # Page Object Model implementations
│   ├── base/
│   │   └── PlaygroundPage.ts       # Base class for all page objects
│   ├── components/
│   │   ├── SidebarNav.ts           # Sidebar navigation interactions
│   │   └── ExampleContainer.ts     # Main content area interactions
│   └── examples/
│       ├── CounterPage.ts          # Counter example page object
│       ├── TodoListPage.ts         # TodoList example page object
│       ├── ModalPage.ts            # Modal example page object
│       ├── SignupFormPage.ts       # SignupForm example page object
│       └── ThemeSwitcherPage.ts    # ThemeSwitcher example page object
├── tests/                  # Test files organized by feature
│   ├── navigation/
│   │   └── sidebar-navigation.test.ts
│   ├── examples/
│   │   ├── counter.test.ts
│   │   ├── todo-list.test.ts
│   │   ├── modal.test.ts
│   │   ├── signup-form.test.ts
│   │   └── theme-switcher.test.ts
│   └── reactivity/
│       └── signal-updates.test.ts
├── helpers/                # Shared utilities
│   ├── test-utils.ts       # Helper functions and generators
│   └── fixtures.ts         # Test fixtures and setup
├── screenshots/            # Screenshots captured on test failures
├── reports/                # Test reports (JSON format)
├── .testcaferc.json        # TestCafe configuration
└── README.md               # This file
```

## Writing Tests

### Page Object Pattern

Tests use the Page Object Model pattern to encapsulate UI interactions. This makes tests more maintainable and readable.

#### Example: Creating a Page Object

```typescript
import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

export class MyExamplePage extends PlaygroundPage {
  readonly myButton: Selector;
  readonly myDisplay: Selector;

  constructor() {
    super();
    this.myButton = Selector('[data-testid="my-button"]');
    this.myDisplay = Selector('[data-testid="my-display"]');
  }

  async clickButton(): Promise<void> {
    await t.click(this.myButton);
  }

  async getDisplayText(): Promise<string> {
    return this.myDisplay.textContent;
  }
}
```

#### Example: Writing a Test

```typescript
import { fixture, test } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { MyExamplePage } from '../../page-objects/examples/MyExamplePage';

const myFixture = fixture('My Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    const sidebar = new SidebarNav();
    await sidebar.clickExample('My Example');
  });

myFixture('Button click updates display', async t => {
  const page = new MyExamplePage();
  
  // Get initial text
  let text = await page.getDisplayText();
  await t.expect(text).eql('Initial');
  
  // Click button
  await page.clickButton();
  
  // Verify text changed
  text = await page.getDisplayText();
  await t.expect(text).eql('Updated');
});
```

### Test Organization

- **Navigation tests**: Verify sidebar navigation and example switching
- **Example tests**: Test specific example functionality
- **Reactivity tests**: Verify signal updates and reactive behavior

### Naming Conventions

- Test files: `kebab-case.test.ts` (e.g., `counter.test.ts`)
- Page Objects: `PascalCase.ts` (e.g., `CounterPage.ts`)
- Test names: Descriptive, starting with verb (e.g., "Counter increments on button click")

## Test Utilities

### Random Data Generators

```typescript
import { generateRandomString, generateRandomEmail, generateRandomTask } from '../../helpers/test-utils';

const randomString = generateRandomString(10);
const randomEmail = generateRandomEmail();
const randomTask = generateRandomTask();
```

### Assertion Helpers

```typescript
import { expectElementVisible, expectElementHasText } from '../../helpers/test-utils';

await expectElementVisible(selector, 'Element should be visible');
await expectElementHasText(selector, 'Expected text', 'Element should contain text');
```

### Retry Logic

```typescript
import { retryOperation } from '../../helpers/test-utils';

const result = await retryOperation(
  async () => {
    // Operation that might fail
    return await someAsyncOperation();
  },
  3,  // max retries
  1000  // delay in ms
);
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests fail with timeout errors

**Solutions**:
1. Ensure dev server is running: `yarn dev`
2. Check network connectivity
3. Increase timeout in `.testcaferc.json`:
   ```json
   {
     "selectorTimeout": 15000,
     "assertionTimeout": 10000
   }
   ```

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:
1. Use TestCafe's smart waiting (automatic)
2. Avoid arbitrary `sleep()` calls
3. Use proper selectors with `data-testid` attributes
4. Enable quarantine mode in `.testcaferc.json`:
   ```json
   {
     "quarantineMode": true
   }
   ```

### Selector Not Found

**Problem**: "Selector does not match any element"

**Solutions**:
1. Verify the element exists in the DOM
2. Check the selector is correct
3. Use `data-testid` attributes for stable selectors
4. Increase `selectorTimeout` in configuration

### Browser Launch Errors

**Problem**: "Failed to launch browser"

**Solutions**:
1. Ensure Chrome/Firefox are installed
2. For CI environments, use headless mode with safe options:
   ```json
   {
     "browsers": [
       "chrome:headless --no-sandbox --disable-dev-shm-usage",
       "firefox:headless"
     ]
   }
   ```

## CI/CD Integration

Tests run automatically on:
- Push to `main` branch
- Pull requests to `main` branch

### Workflow

1. Unit tests run first (fast feedback)
2. If unit tests pass, E2E tests run
3. Tests run in parallel across Chrome and Firefox
4. Screenshots are uploaded on failure
5. Workflow fails if any tests fail (prevents merging)

### Viewing Results

- Check GitHub Actions tab in the repository
- Download artifacts (screenshots, reports) from failed runs
- View test reports in `e2e/reports/` directory

## Best Practices

### Adding Testability to Components

When components need to be tested in E2E tests, they must expose `data-testid` attributes for stable element selection.

#### Pattern 1: Simple Components

For simple components, add `data-testid` directly to elements:

```typescript
export function Counter() {
  const [count, setCount] = createSignal(0);
  
  return h.div(
    h.button({
      'data-testid': 'counter-button',
      onClick: () => setCount(count() + 1)
    }, 'Increment'),
    h.span({
      'data-testid': 'count-display'
    }, count)
  );
}
```

#### Pattern 2: Components with Container Props

For components that accept container customization (like `VirtualFor`), use a structured `containerProps` API with an `attributes` array:

**Problem**: Dash-style props (`'data-testid': 'value'`) don't work well with TypeScript interfaces and violate naming conventions.

**Solution**: Use an `attributes` array with a generic `Attribute` type:

```typescript
// In types.ts
export interface Attribute {
  name: string;
  value: string | number | boolean;
}

// In component
interface ComponentContainerProps {
  className?: string;
  style?: Record<string, string | SignalGetter<string>>;
  attributes?: Attribute[];
}

interface ComponentProps {
  // ... other props
  containerProps?: ComponentContainerProps;
}

export function Component(props: ComponentProps) {
  const { containerProps } = props;
  
  // Extract and apply attributes
  const customAttributes = containerProps?.attributes || [];
  
  // Filter dangerous attributes that could break functionality
  const safeAttributes = customAttributes.filter(
    (attr) => !['ref', 'role', 'style', 'class', 'className'].includes(attr.name)
  );
  
  const containerAttrs: Record<string, unknown> = {
    ref: someRef,
    role: 'list',
    class: containerProps?.className,
    style: containerProps?.style,
  };
  
  // Apply custom attributes
  safeAttributes.forEach((attr) => {
    containerAttrs[attr.name] = attr.value;
  });
  
  return h.div(containerAttrs, /* children */);
}
```

**Usage in Playground**:

```typescript
const list = VirtualFor({
  each: items,
  itemHeight: 30,
  containerProps: {
    className: 'scroller',
    style: { height: '100%' },
    attributes: [
      { name: 'data-testid', value: 'virtual-list' },
      { name: 'aria-label', value: 'Virtualized list' }
    ]
  },
  children: (item, index) => h.div({
    'data-testid': `virtual-item-${item.id}`
  }, `${index}: ${item.text}`)
});
```

**Benefits**:
- ✅ Type-safe: No dash-style properties in TypeScript interfaces
- ✅ Flexible: Supports any custom attribute
- ✅ Safe: Filters dangerous attributes that could break functionality
- ✅ Consistent: Follows camelCase naming conventions
- ✅ Testable: Easy to add `data-testid` for E2E tests

**Example**: VirtualFor component was refactored with this pattern in January 2026, fixing E2E test failures and improving testability.

### Selectors

1. **Prefer `data-testid`**: Most stable and maintainable
   ```typescript
   Selector('[data-testid="counter-button"]')
   ```

2. **Use semantic attributes**: When `data-testid` not available
   ```typescript
   Selector('button[type="submit"]')
   ```

3. **Avoid brittle selectors**: Don't rely on structure
   ```typescript
   // Bad
   Selector('div > div > button:nth-child(2)')
   
   // Good
   Selector('[data-testid="my-button"]')
   ```

### Waiting

1. **Use TestCafe's smart waiting**: Automatic for most operations
2. **Avoid arbitrary delays**: Don't use `sleep()` or `setTimeout()`
3. **Wait for specific conditions**: Use `.expect()` with appropriate timeouts

### Test Isolation

1. **Each test should be independent**: Can run in any order
2. **Clean up after tests**: Use `afterEach` hooks
3. **Don't rely on test order**: Tests should not depend on previous tests

### Performance

1. **Keep tests focused**: Test one thing per test
2. **Reuse page objects**: Don't duplicate selectors
3. **Use fixtures**: Share common setup across tests
4. **Avoid unnecessary waits**: Only wait when needed

## Adding New Tests

### Step 1: Create Page Object

Create a new file in `e2e/page-objects/examples/`:

```typescript
import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

export class MyNewExamplePage extends PlaygroundPage {
  // Add selectors and methods
}
```

### Step 2: Create Test File

Create a new file in `e2e/tests/examples/`:

```typescript
import { fixture, test } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { MyNewExamplePage } from '../../page-objects/examples/MyNewExamplePage';

const myFixture = fixture('My New Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    const sidebar = new SidebarNav();
    await sidebar.clickExample('My New Example');
  });

myFixture('Test description', async t => {
  // Test implementation
});
```

### Step 3: Run Tests

```bash
yarn test:e2e
```

## Performance Targets

- Individual test: < 10 seconds
- Example test suite: < 30 seconds
- Full test suite: < 5 minutes
- CI execution: < 5 minutes (including server startup)

## Resources

- [TestCafe Documentation](https://testcafe.io/documentation/402635/getting-started)
- [Page Object Model Pattern](https://testcafe.io/documentation/402635/guides/advanced-guides/page-object-model)
- [TestCafe Selectors](https://testcafe.io/documentation/402635/reference/test-api/selector)
- [TestCafe Assertions](https://testcafe.io/documentation/402635/reference/test-api/testcontroller/expect)

## Contributing

When adding new tests:

1. Follow the existing patterns and conventions
2. Use `data-testid` attributes for selectors
3. Write descriptive test names
4. Include comments for complex logic
5. Ensure tests pass locally before pushing
6. Keep tests focused and independent

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review existing tests for examples
3. Check TestCafe documentation
4. Open an issue in the repository
