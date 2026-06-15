/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fixture, test, ClientFunction, Selector } from 'testcafe';

/**
 * Feature: aided-core-security-performance-fixes
 * Security Tests for bindAttr Event Handler Validation
 * Validates: Requirements 1.1, 1.3
 * 
 * These tests verify that bindAttr() rejects event handler attributes (onclick, onchange, etc.)
 * and only accepts valid attributes like data-*, aria-*, class, id, etc.
 */

// Helper to run a test function from the test page
const runTest = ClientFunction((testName: string) => {
  const testFn = (window as any).testBindAttr?.[testName];
  if (!testFn) {
    return { error: `Test function ${testName} not found` };
  }
  return testFn();
});

// Helper to run all tests
const runAllTests = ClientFunction(() => {
  return (window as any).testBindAttr?.runAllTests?.();
});

fixture('bindAttr Security')
  .page('http://localhost:5173/test-pages/bind-attr/');

/**
 * Test 1: bindAttr rejects onclick event handler attribute
 * Validates: Requirement 1.1 - Event handler rejection
 */
test('bindAttr rejects onclick event handler attribute', async t => {
  const result = await runTest('testEventHandlerRejection');
  
  // The test function is called with 'onclick' parameter
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testEventHandlerRejection('onclick');
  })();
  
  await t.expect(testResult.success).ok('bindAttr should have thrown an error');
  await t.expect(testResult.error).contains('Cannot bind event handler attribute');
});

/**
 * Test 2: bindAttr rejects onchange event handler attribute
 * Validates: Requirement 1.1 - Event handler rejection
 */
test('bindAttr rejects onchange event handler attribute', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testEventHandlerRejection('onchange');
  })();
  
  await t.expect(testResult.success).ok('bindAttr should have thrown an error');
  await t.expect(testResult.error).contains('Cannot bind event handler attribute');
});

/**
 * Test 3: bindAttr rejects oninput event handler attribute
 * Validates: Requirement 1.1 - Event handler rejection
 */
test('bindAttr rejects oninput event handler attribute', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testEventHandlerRejection('oninput');
  })();
  
  await t.expect(testResult.success).ok('bindAttr should have thrown an error');
  await t.expect(testResult.error).contains('Cannot bind event handler attribute');
});

/**
 * Test 4: bindAttr rejects onsubmit event handler attribute
 * Validates: Requirement 1.1 - Event handler rejection
 */
test('bindAttr rejects onsubmit event handler attribute', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testEventHandlerRejection('onsubmit');
  })();
  
  await t.expect(testResult.success).ok('bindAttr should have thrown an error');
  await t.expect(testResult.error).contains('Cannot bind event handler attribute');
});

/**
 * Test 5: bindAttr accepts data-* attributes with reactive values
 * Validates: Requirement 1.2 - Valid attribute binding
 */
test('bindAttr accepts data-* attributes with reactive values', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testValidAttributeBinding('data-testid', 'test-value');
  })();
  
  await t.expect(testResult.success).ok('Should accept data-* attributes');
  await t.expect(testResult.attr).eql('test-value');
});

/**
 * Test 6: bindAttr accepts aria-* attributes with reactive values
 * Validates: Requirement 1.2 - Valid attribute binding
 */
test('bindAttr accepts aria-* attributes with reactive values', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testValidAttributeBinding('aria-disabled', 'true');
  })();
  
  await t.expect(testResult.success).ok('Should accept aria-* attributes');
  await t.expect(testResult.attr).eql('true');
});

/**
 * Test 7: bindAttr accepts class attribute with reactive values
 * Validates: Requirement 1.2 - Valid attribute binding
 */
test('bindAttr accepts class attribute with reactive values', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testValidAttributeBinding('class', 'active');
  })();
  
  await t.expect(testResult.success).ok('Should accept class attribute');
  await t.expect(testResult.attr).eql('active');
});

/**
 * Test 8: bindAttr accepts id attribute with reactive values
 * Validates: Requirement 1.2 - Valid attribute binding
 */
test('bindAttr accepts id attribute with reactive values', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testValidAttributeBinding('id', 'my-element');
  })();
  
  await t.expect(testResult.success).ok('Should accept id attribute');
  await t.expect(testResult.attr).eql('my-element');
});

/**
 * Test 9: bindAttr rejects event handler attributes case-insensitively
 * Validates: Requirement 1.1 - Case-insensitive validation
 */
test('bindAttr rejects event handler attributes case-insensitively', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testCaseInsensitiveRejection();
  })();
  
  await t.expect(testResult.success).ok('bindAttr should reject all case variations');
});

/**
 * Test 10: bindAttr error message is descriptive
 * Validates: Requirement 1.3 - Error message quality
 */
test('bindAttr error message is descriptive', async t => {
  const testResult = await ClientFunction(() => {
    return (window as any).testBindAttr.testErrorMessageDescriptiveness();
  })();
  
  await t.expect(testResult.success).ok('Error message should be descriptive');
  await t.expect(testResult.error).contains('Cannot bind event handler attribute');
  await t.expect(testResult.error).contains('onclick');
  await t.expect(testResult.error).contains('addEventListener');
});
