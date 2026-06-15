# Test Pages Directory

This directory contains dedicated test pages for e2e testing of internal APIs, security boundaries, and edge cases that are not suitable for user-facing playground examples.

## Purpose

Test pages serve a different purpose than playground examples:

- **Test Pages**: Developer/QA-facing utilities for automated e2e testing
- **Playground Examples**: User-facing interactive demonstrations for learning

## When to Create a Test Page

Use this decision tree:

```
Is the API public?
├─ NO → Create test page (not user-facing)
└─ YES → Is it commonly used by end users?
    ├─ YES → Create both example + test page
    └─ NO → Does it demonstrate important concepts?
        ├─ YES → Create "Advanced" example + test page
        └─ NO → Create test page only
```

## Directory Structure

```
/test-pages
  /[feature-name]           # One directory per feature/API being tested
    index.html              # Test page entry point
    tests.ts                # Test utilities and functions
    README.md               # Optional: Feature-specific documentation
```

## Creating a New Test Page

### 1. Create Feature Directory

```bash
mkdir playground/test-pages/[feature-name]
```

### 2. Create `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Feature Name] Tests - Aided Test Suite</title>
  <style>
    /* Copy styles from bind-attr/index.html */
  </style>
</head>
<body>
  <div class="test-header">
    <h1>[Feature Name] Tests <span class="badge badge-[type]">[TYPE]</span></h1>
    <p>Description and requirements reference</p>
  </div>
  <div id="test-container"></div>
  <script type="module" src="./tests.ts"></script>
</body>
</html>
```

Badge types:
- `badge-security` - Security-related tests (red)
- `badge-performance` - Performance tests (blue)
- `badge-functionality` - Functional tests (green)

### 3. Create `tests.ts`

```typescript
/**
 * E2E Test Utilities for [Feature Name]
 * 
 * Description of what this test page validates
 * 
 * Feature: [spec-name]
 * Requirements: [requirement IDs]
 */

import { /* needed exports */ } from 'aided-core';

// Expose APIs globally for e2e tests
(window as any).AidedTest = {
  // Export what's needed for testing
};

// Create test container
const testContainer = document.getElementById('test-container')!;
const resultsDiv = document.createElement('div');
resultsDiv.id = 'test-results';
testContainer.appendChild(resultsDiv);

// Expose test functions globally
(window as any).test[FeatureName] = {
  testCase1: () => {
    // Test implementation
    return { success: boolean, error?: string };
  },
  
  runAllTests: () => {
    // Run all tests and display results
  }
};

// Auto-run on page load
window.addEventListener('load', () => {
  (window as any).test[FeatureName].runAllTests();
});
```

### 4. Create E2E Test File

```typescript
// e2e/tests/[category]/[feature].test.ts
import { fixture, test, ClientFunction } from 'testcafe';

fixture('[Feature Name]')
  .page('http://localhost:5173/test-pages/[feature-name]/');

test('Test case 1', async t => {
  const result = await ClientFunction(() => {
    return (window as any).test[FeatureName].testCase1();
  })();
  
  await t.expect(result.success).ok('Test should pass');
});
```

### 5. Update E2E Test Configuration

The test page will be automatically served by Vite at:
```
http://localhost:5173/test-pages/[feature-name]/
```

## Existing Test Pages

### bind-attr
- **Purpose**: Test bindAttr() security validation
- **Feature**: aided-core-security-performance-fixes
- **Requirements**: 1.1, 1.3
- **Tests**: Event handler rejection, valid attribute acceptance
- **URL**: `http://localhost:5173/test-pages/bind-attr/`

## Best Practices

1. **Isolation**: Each test page should be self-contained
2. **Documentation**: Include clear comments about what's being tested
3. **Naming**: Use kebab-case for directory names
4. **Global Exposure**: Only expose what's necessary for testing
5. **Auto-run**: Tests should run automatically on page load
6. **Results Display**: Show clear pass/fail status in the UI
7. **Requirements Traceability**: Link to spec requirements in comments

## Running Tests

### Manual Testing
Navigate to: `http://localhost:5173/test-pages/[feature-name]/`

### Automated E2E Testing
```bash
yarn test:e2e:chrome -f "[Feature Name]"
```

## Future Test Pages

When adding new security or internal API tests, follow this pattern:

1. Create directory: `test-pages/[feature-name]/`
2. Copy and adapt `bind-attr/index.html` and `bind-attr/tests.ts`
3. Create e2e test file in `e2e/tests/[category]/`
4. Update this README with the new test page details

## Notes

- Test pages are NOT part of the user-facing playground
- They are NOT included in the main App navigation
- They are designed for automated testing, not user education
- For user-facing examples, use `playground/src/examples/`
