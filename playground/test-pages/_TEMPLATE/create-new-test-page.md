# Quick Start: Create New Test Page

## Step 1: Copy Template

```bash
# From playground/test-pages directory
cp -r _TEMPLATE [feature-name]
cd [feature-name]
```

## Step 2: Replace Placeholders

In all files, replace these placeholders:

- `[FEATURE_NAME]` → Display name (e.g., "Tag Validation")
- `[feature-name]` → Kebab-case name (e.g., "tag-validation")
- `[FEATURE_CAMEL_CASE]` → CamelCase name (e.g., "TagValidation")
- `[TYPE]` → Badge type: `security`, `performance`, or `functionality`
- `[DESCRIPTION]` → Brief description of what's being tested
- `[SPEC_NAME]` → Spec directory name (e.g., "aided-core-security-performance-fixes")
- `[REQ_IDS]` → Requirement IDs (e.g., "2.1, 2.2, 2.4")
- `[REQ_ID]` → Individual requirement ID (e.g., "2.1")

## Step 3: Implement Tests

### In `tests.ts`:

1. Import needed APIs from 'aided-core'
2. Expose them via `(window as any).AidedTest`
3. Implement test functions in `(window as any).test[FEATURE_CAMEL_CASE]`
4. Each test function should return `{ success: boolean, error?: string }`
5. Add test cases to `runAllTests()`

### In `e2e-test-template.ts`:

1. Rename to match your feature (e.g., `tag-validation.test.ts`)
2. Move to `e2e/tests/[category]/`
3. Implement TestCafe tests that call your test functions
4. Use ClientFunction to execute browser-side code

## Step 4: Test Locally

```bash
# Start dev server
yarn dev

# Navigate to test page
# http://localhost:5173/test-pages/[feature-name]/

# Run e2e tests
yarn test:e2e:chrome -f "[FEATURE_NAME]"
```

**Note**: The `e2e-test-template.ts` file is a template only. Copy it to `e2e/tests/[category]/` 
where testcafe is available as a dev dependency. The `_TEMPLATE/` directory is excluded from 
ESLint to avoid import errors.

## Step 5: Update Documentation

Add entry to `playground/test-pages/README.md` under "Existing Test Pages"

## Example: Creating "Tag Validation" Test Page

```bash
# 1. Copy template
cp -r _TEMPLATE tag-validation
cd tag-validation

# 2. Edit files (replace placeholders)
# - [FEATURE_NAME] → Tag Validation
# - [feature-name] → tag-validation
# - [FEATURE_CAMEL_CASE] → TagValidation
# - [TYPE] → security
# - [DESCRIPTION] → Test h proxy tag name validation
# - [SPEC_NAME] → aided-core-security-performance-fixes
# - [REQ_IDS] → 2.1, 2.2, 2.4

# 3. Implement tests in tests.ts
# 4. Create e2e/tests/security/tag-validation.test.ts
# 5. Test: http://localhost:5173/test-pages/tag-validation/
# 6. Run: yarn test:e2e:chrome -f "Tag Validation"
```

## Tips

- Keep test functions simple and focused
- Return clear success/error objects
- Display results in a readable format
- Auto-run tests on page load
- Link to spec requirements in comments
- Use descriptive test names
