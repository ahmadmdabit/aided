/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fixture, test, ClientFunction } from 'testcafe';

/**
 * Feature: aided-core-security-performance-fixes
 * Security Tests for h Proxy Tag Validation
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * These tests verify that the h proxy:
 * 1. Blocks dangerous tags (script, constructor, prototype)
 * 2. Validates tag names against regex: /^[a-zA-Z][a-zA-Z0-9-]*$/
 * 3. Allows valid HTML/SVG tags
 * 4. Allows custom elements with hyphens
 * 5. Throws descriptive errors for violations
 */

// Helper to run a test function from the test page
const runTest = ClientFunction((testName: string) => {
  const testFn = (window as any).testHProxy?.[testName];
  if (!testFn) {
    return { error: `Test function ${testName} not found` };
  }
  return testFn();
});

fixture('h Proxy Tag Validation')
  .page('http://localhost:5173/test-pages/hProxyTagValidation/');

/**
 * Test 1: h proxy rejects script tag creation
 * Validates: Requirement 2.1 - Dangerous tag blocking
 */
test('h proxy rejects script tag creation', async t => {
  const result = await runTest('testTagRejection');
  const scriptResult = await ClientFunction(() => {
    return (window as any).testHProxy.testTagRejection('script');
  })();
  
  await t.expect(scriptResult.success).ok('script tag should be rejected');
  await t.expect(scriptResult.error).contains('Security: Cannot create \'script\' element');
  await t.expect(scriptResult.error).contains('This tag is not allowed');
});

/**
 * Test 2: h proxy rejects constructor property access
 * Validates: Requirement 2.2 - Dangerous property blocking
 */
test('h proxy rejects constructor property access', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testTagRejection('constructor');
  })();
  
  await t.expect(result.success).ok('constructor should be rejected');
  await t.expect(result.error).contains('Security: Cannot create \'constructor\' element');
  await t.expect(result.error).contains('This tag is not allowed');
});

/**
 * Test 3: h proxy rejects prototype property access
 * Validates: Requirement 2.2 - Dangerous property blocking
 */
test('h proxy rejects prototype property access', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testTagRejection('prototype');
  })();
  
  await t.expect(result.success).ok('prototype should be rejected');
  await t.expect(result.error).contains('Security: Cannot create \'prototype\' element');
  await t.expect(result.error).contains('This tag is not allowed');
});

/**
 * Test 4: h proxy allows standard HTML tags
 * Validates: Requirement 2.3 - Valid tag creation
 */
test('h proxy allows standard HTML tags', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testValidTagsAccepted();
  })();
  
  await t.expect(result.success).ok('Valid tags should be accepted');
});

/**
 * Test 5: h proxy allows custom elements with hyphens
 * Validates: Requirement 2.5 - Custom element support
 */
test('h proxy allows custom elements with hyphens', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testCustomElementsAccepted();
  })();
  
  await t.expect(result.success).ok('Custom elements should be accepted');
});

/**
 * Test 6: h proxy rejects invalid tag names
 * Validates: Requirement 2.4 - Invalid tag rejection
 */
test('h proxy rejects invalid tag names', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testInvalidTagsRejected();
  })();
  
  await t.expect(result.success).ok('Invalid tags should be rejected');
});

/**
 * Test 7: h proxy error messages are descriptive
 * Validates: Requirement 2.1, 2.2, 2.4 - Error message quality
 */
test('h proxy error messages are descriptive', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testErrorMessagesDescriptive();
  })();
  
  await t.expect(result.success).ok('Error messages should be descriptive');
});

/**
 * Test 8: h proxy created elements are functional
 * Validates: Requirement 2.3 - Created elements work correctly
 */
test('h proxy created elements are functional', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testCreatedElementsFunctional();
  })();
  
  await t.expect(result.success).ok('Created elements should be functional');
});

/**
 * Test 9: h proxy maintains backward compatibility
 * Validates: Requirement 2.3 - Backward compatibility
 */
test('h proxy maintains backward compatibility with existing code', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testBackwardCompatibility();
  })();
  
  await t.expect(result.success).ok('Backward compatibility should be maintained');
});

/**
 * Test 10: h proxy case sensitivity for blocked properties
 * Validates: Requirement 2.1, 2.2 - Case sensitivity of security blocking
 */
test('h proxy handles case sensitivity for blocked properties correctly', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testCaseSensitivityBlocked();
  })();
  
  await t.expect(result.success).ok('Case sensitivity should be handled correctly');
});

/**
 * Test 11: h proxy accepts numbers in tag names
 * Validates: Requirement 2.3, 2.4 - Valid tag name patterns with numbers
 */
test('h proxy accepts numbers in tag names after first character', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testNumbersInTagNames();
  })();
  
  await t.expect(result.success).ok('Numbers in tag names should be accepted');
});

/**
 * Test 12: h proxy accepts complex hyphenated elements
 * Validates: Requirement 2.5 - Complex custom element names
 */
test('h proxy accepts complex hyphenated custom elements', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testComplexHyphenatedElements();
  })();
  
  await t.expect(result.success).ok('Complex hyphenated elements should be accepted');
});

/**
 * Test 13: h proxy accepts single letter tags
 * Validates: Requirement 2.3 - Minimal valid tag names
 */
test('h proxy accepts single letter tags', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testSingleLetterTags();
  })();
  
  await t.expect(result.success).ok('Single letter tags should be accepted');
});

/**
 * Test 14: h proxy accepts very long tag names
 * Validates: Requirement 2.3, 2.5 - Long custom element names
 */
test('h proxy accepts very long tag names', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testVeryLongTagNames();
  })();
  
  await t.expect(result.success).ok('Very long tag names should be accepted');
});

/**
 * Test 15: h proxy handles complex children scenarios
 * Validates: Requirement 2.3 - Complex child handling
 */
test('h proxy handles complex children scenarios correctly', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testComplexChildren();
  })();
  
  if (!result.success) {
    console.log('Complex children test failed:', result.error);
  }
  
  await t.expect(result.success).ok(`Complex children should be handled correctly. Error: ${result.error || 'unknown'}`);
});

/**
 * Test 16: h proxy handles complex attributes
 * Validates: Requirement 2.3 - Complex attribute handling
 */
test('h proxy handles complex attributes correctly', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testComplexAttributes();
  })();
  
  await t.expect(result.success).ok('Complex attributes should be handled correctly');
});

/**
 * Test 17: h proxy ref callback functionality
 * Validates: Requirement 2.3 - ref callback support
 */
test('h proxy ref callback works correctly', async t => {
  const result = await ClientFunction(() => {
    return (window as any).testHProxy.testRefCallback();
  })();
  
  await t.expect(result.success).ok('ref callback should work correctly');
});
