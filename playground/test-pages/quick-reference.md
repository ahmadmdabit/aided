# Test Pages Quick Reference

## 🚀 Create New Test Page (5 Minutes)

```bash
# 1. Copy template
cd playground/test-pages
cp -r _TEMPLATE my-feature

# 2. Replace in all files:
[FEATURE_NAME]         → My Feature
[feature-name]         → my-feature
[FEATURE_CAMEL_CASE]   → MyFeature
[TYPE]                 → security|performance|functionality
[DESCRIPTION]          → Brief description
[SPEC_NAME]            → spec-directory-name
[REQ_IDS]              → 1.1, 1.2, 1.3

# 3. Implement tests in tests.ts

# 4. Create e2e test
cp _TEMPLATE/e2e-test-template.ts ../../e2e/tests/category/my-feature.test.ts

# 5. Test
yarn dev
# Visit: http://localhost:5173/test-pages/my-feature/
yarn test:e2e:chrome -f "My Feature"

# 6. Update index.html with new test card
```

## 📁 Structure

```
test-pages/
├── index.html              # Landing page
├── README.md               # Full docs
├── _TEMPLATE/              # Copy this
│   ├── index.html
│   ├── tests.ts
│   └── e2e-test-template.ts
└── [feature-name]/         # Your test
    ├── index.html
    └── tests.ts
```

## 🎯 Decision Tree

```
Public API?
├─ NO  → Test page only
└─ YES → Common use?
    ├─ YES → Example + test page
    └─ NO  → Educational?
        ├─ YES → Advanced example + test page
        └─ NO  → Test page only
```

## 📝 Test Function Pattern

```typescript
(window as any).testMyFeature = {
  testCase1: (param?: any) => {
    try {
      // Test logic
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  runAllTests: () => {
    const results = [];
    results.push({
      name: 'Test 1',
      result: (window as any).testMyFeature.testCase1()
    });
    // Display results...
    return results;
  }
};
```

## 🧪 E2E Test Pattern

```typescript
import { fixture, test, ClientFunction } from 'testcafe';

fixture('My Feature')
  .page('http://localhost:5173/test-pages/my-feature/');

test('Test case 1', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testMyFeature.testCase1();
  })();
  
  await t.expect(result.success).ok('Should pass');
});
```

## 🎨 Badge Types

```html
<span class="badge badge-security">SECURITY</span>
<span class="badge badge-performance">PERFORMANCE</span>
<span class="badge badge-functionality">FUNCTIONALITY</span>
```

## 🔗 URLs

- **Landing**: `http://localhost:5173/test-pages/`
- **Test Page**: `http://localhost:5173/test-pages/[feature-name]/`

## ✅ Checklist

- [ ] Copy `_TEMPLATE/` to `[feature-name]/`
- [ ] Replace all placeholders
- [ ] Implement test functions in `tests.ts`
- [ ] Create e2e test in `e2e/tests/[category]/`
- [ ] Test locally at `/test-pages/[feature-name]/`
- [ ] Run e2e: `yarn test:e2e:chrome -f "[Feature Name]"`
- [ ] Add test card to `index.html`
- [ ] Update `README.md` with new entry

## 📚 Documentation

- **Full Guide**: `README.md`
- **Step-by-Step**: `_TEMPLATE/CREATE_NEW_TEST_PAGE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **This Card**: `QUICK_REFERENCE.md`

## 💡 Tips

- Keep test functions simple and focused
- Return clear `{ success, error }` objects
- Auto-run tests on page load
- Display results in readable format
- Link to spec requirements in comments
- Use descriptive test names

## 🎯 Example: bindAttr

See `bind-attr/` for a complete working example of the pattern.
