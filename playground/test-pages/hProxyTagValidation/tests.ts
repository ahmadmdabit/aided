/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * E2E Test Utilities for h Proxy Tag Validation
 * 
 * This test page validates that the h proxy correctly:
 * 1. Blocks dangerous tags (script, constructor, prototype)
 * 2. Validates tag names against regex: /^[a-zA-Z][a-zA-Z0-9-]*$/
 * 3. Allows valid HTML/SVG tags
 * 4. Allows custom elements with hyphens
 * 5. Throws descriptive errors for violations
 * 
 * Feature: aided-core-security-performance-fixes
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { h } from 'aided-core';

// Expose library functions globally for e2e tests
(window as any).AidedTest = {
  h,
};

// Create a test container
const testContainer = document.getElementById('test-container') || document.createElement('div');
testContainer.id = 'test-container';
if (!document.body.contains(testContainer)) {
  document.body.appendChild(testContainer);
}

// Create a results display area
const resultsDiv = document.createElement('div');
resultsDiv.id = 'test-results';
resultsDiv.style.cssText = 'padding: 20px; font-family: monospace; white-space: pre-wrap;';
testContainer.appendChild(resultsDiv);

// Expose test functions globally
(window as any).testHProxy = {
  /**
   * Test that h proxy rejects a specific tag
   */
  testTagRejection: (tagName: string) => {
    try {
      (h as any)[tagName]();
      return { success: false, error: 'No error thrown' };
    } catch (error: any) {
      return { success: true, error: error.message };
    }
  },

  /**
   * Test that h proxy accepts a specific tag
   */
  testTagAcceptance: (tagName: string) => {
    try {
      const element = (h as any)[tagName]();
      return { 
        success: true, 
        tagName: element.tagName.toLowerCase(),
        element: element 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Test dangerous tags are blocked
   */
  testDangerousTagsBlocked: () => {
    const dangerousTags = ['script', 'constructor', 'prototype'];
    
    for (const tag of dangerousTags) {
      try {
        (h as any)[tag]();
        return { success: false, error: `${tag} was not blocked` };
      } catch (error: any) {
        if (!error.message.includes('Security:') || !error.message.includes('not allowed')) {
          return { success: false, error: `Wrong error for ${tag}: ${error.message}` };
        }
      }
    }
    
    return { success: true };
  },

  /**
   * Test valid tags are accepted
   */
  testValidTagsAccepted: () => {
    const validTags = ['div', 'span', 'p', 'button', 'h1', 'h2', 'svg', 'circle'];
    
    for (const tag of validTags) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test custom elements with hyphens are accepted
   */
  testCustomElementsAccepted: () => {
    const customTags = ['my-component', 'my-element', 'custom-widget', 'app-root'];
    
    for (const tag of customTags) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test invalid tags are rejected
   */
  testInvalidTagsRejected: () => {
    const invalidTags = [
      '1div',      // starts with number
      '2span',     // starts with number
      'div@test',  // contains @
      'span#id',   // contains #
      '',          // empty string
      'div test',  // contains space
      'div.test',  // contains dot
      'div/test',  // contains slash
      'div\\test', // contains backslash
      'div_test',  // contains underscore
      '-div',      // starts with hyphen
      'div™',      // contains unicode symbol
      'div©',      // contains unicode symbol
    ];
    
    // Valid edge cases that should be accepted
    const validEdgeCases = [
      'div-',      // ends with hyphen (valid per regex)
      'div--test', // consecutive hyphens (valid per regex)
    ];
    
    // Test invalid tags are rejected
    for (const tag of invalidTags) {
      try {
        (h as any)[tag]();
        return { success: false, error: `${tag} was not rejected` };
      } catch (error: any) {
        if (!error.message.includes('Invalid tag name') && !error.message.includes('Security:')) {
          return { success: false, error: `Wrong error for ${tag}: ${error.message}` };
        }
      }
    }
    
    // Test valid edge cases are accepted
    for (const tag of validEdgeCases) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} should be accepted but was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test case sensitivity of blocked properties
   */
  testCaseSensitivityBlocked: () => {
    const blockedVariations = [
      'script', 'Script', 'SCRIPT', 'sCrIpT',
      'constructor', 'Constructor', 'CONSTRUCTOR',
      'prototype', 'Prototype', 'PROTOTYPE'
    ];
    
    for (const tag of blockedVariations) {
      try {
        const element = (h as any)[tag]();
        // Only exact lowercase matches should be blocked
        if (tag === 'script' || tag === 'constructor' || tag === 'prototype') {
          return { success: false, error: `${tag} was not blocked` };
        }
        // Other case variations should be allowed (they're valid tag names)
        if (element.tagName.toLowerCase() !== tag.toLowerCase()) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        // Only exact lowercase should throw security error
        if (tag === 'script' || tag === 'constructor' || tag === 'prototype') {
          if (!error.message.includes('Security:')) {
            return { success: false, error: `Wrong error for ${tag}: ${error.message}` };
          }
        } else {
          // Case variations should not be blocked
          return { success: false, error: `${tag} should be allowed but was rejected: ${error.message}` };
        }
      }
    }
    
    return { success: true };
  },

  /**
   * Test edge cases with numbers in tag names
   */
  testNumbersInTagNames: () => {
    const validWithNumbers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div123', 'a1b2c3', 'test999'];
    
    for (const tag of validWithNumbers) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} should be accepted but was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test complex hyphenated custom elements
   */
  testComplexHyphenatedElements: () => {
    const complexTags = [
      'my-custom-component',
      'app-ui-button',
      'x-y-z-element',
      'a-b-c-d-e-f-g',
      'web-component-v2',
      'my-component-123'
    ];
    
    for (const tag of complexTags) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} should be accepted but was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test single letter tags
   */
  testSingleLetterTags: () => {
    const singleLetterTags = ['a', 'b', 'i', 'p', 's', 'u'];
    
    for (const tag of singleLetterTags) {
      try {
        const element = (h as any)[tag]();
        if (element.tagName.toLowerCase() !== tag) {
          return { success: false, error: `Tag name mismatch for ${tag}` };
        }
      } catch (error: any) {
        return { success: false, error: `${tag} should be accepted but was rejected: ${error.message}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test very long tag names
   */
  testVeryLongTagNames: () => {
    // Test a reasonably long custom element name
    const longTag = 'my-very-long-custom-element-name-that-is-still-valid';
    
    try {
      const element = (h as any)[longTag]();
      if (element.tagName.toLowerCase() !== longTag) {
        return { success: false, error: `Tag name mismatch for ${longTag}` };
      }
    } catch (error: any) {
      return { success: false, error: `Long tag should be accepted but was rejected: ${error.message}` };
    }
    
    return { success: true };
  },

  /**
   * Test hyperscript with complex children scenarios
   */
  testComplexChildren: () => {
    try {
      // Test with flat arrays
      const div2 = h.div(['a', 'b', 'c', 'd']);
      if (div2.textContent !== 'abcd') {
        return { success: false, error: `Flat array: expected 'abcd', got '${div2.textContent}'` };
      }
      
      // Test with mixed types
      const div3 = h.div('text', 123, true as any, h.span('nested'));
      const expectedText = 'text123truenested';
      if (div3.textContent !== expectedText) {
        return { success: false, error: `Mixed types: expected '${expectedText}', got '${div3.textContent}'` };
      }
      
      // Test with null/undefined children - they get converted to text nodes
      const div1 = h.div(null as any, undefined as any, 'text');
      const expectedCount = 3;
      if (div1.childNodes.length !== expectedCount) {
        return { success: false, error: `null/undefined: expected ${expectedCount} nodes, got ${div1.childNodes.length}` };
      }
      
      // Verify the text content of null/undefined nodes
      const node0Text = div1.childNodes[0].textContent;
      const node1Text = div1.childNodes[1].textContent;
      if (node0Text !== 'null') {
        return { success: false, error: `null child: expected 'null', got '${node0Text}'` };
      }
      if (node1Text !== 'undefined') {
        return { success: false, error: `undefined child: expected 'undefined', got '${node1Text}'` };
      }
      
      // Test with empty array
      const div4 = h.div([]);
      if (div4.childNodes.length !== 0) {
        return { success: false, error: `Empty array: expected 0 nodes, got ${div4.childNodes.length}` };
      }
      
      // Test with array containing Node elements
      const div5 = h.div([h.span('a'), h.span('b')]);
      if (div5.children.length !== 2 || div5.textContent !== 'ab') {
        return { success: false, error: `Array of nodes: expected 2 children with text 'ab', got ${div5.children.length} children with text '${div5.textContent}'` };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: `Exception: ${error.message}` };
    }
  },

  /**
   * Test hyperscript with complex attributes
   */
  testComplexAttributes: () => {
    try {
      // Test with empty string attribute
      const div1 = h.div({ 'data-test': '' });
      if (div1.getAttribute('data-test') !== '') {
        return { success: false, error: 'Empty string attribute not handled correctly' };
      }
      
      // Test with multiple attributes
      const div2 = h.div({
        id: 'test',
        class: 'my-class',
        'data-value': '123',
        'aria-label': 'Test'
      });
      if (div2.id !== 'test' || div2.className !== 'my-class') {
        return { success: false, error: 'Multiple attributes not handled correctly' };
      }
      
      // Test with numeric attribute values
      const div3 = h.div({ 'data-count': 42 as any });
      if (div3.getAttribute('data-count') !== '42') {
        return { success: false, error: 'Numeric attribute values not converted to string' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Test ref callback functionality
   */
  testRefCallback: () => {
    try {
      let refElement: HTMLElement | null = null;
      const div = h.div({ ref: (el: HTMLElement) => { refElement = el; } }, 'content');
      
      if (refElement !== div) {
        return { success: false, error: 'ref callback not called with correct element' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Test error messages are descriptive
   */
  testErrorMessagesDescriptive: () => {
    // Test dangerous tag error
    try {
      (h as any).script();
      return { success: false, error: 'script tag was not rejected' };
    } catch (error: any) {
      const msg = error.message;
      if (!msg.includes('Security:') || !msg.includes('script') || !msg.includes('not allowed')) {
        return { success: false, error: `Dangerous tag error not descriptive: ${msg}` };
      }
    }
    
    // Test invalid tag error
    try {
      (h as any)['1div']();
      return { success: false, error: '1div was not rejected' };
    } catch (error: any) {
      const msg = error.message;
      if (!msg.includes('Invalid tag name') || !msg.includes('1div') || !msg.includes('start with a letter')) {
        return { success: false, error: `Invalid tag error not descriptive: ${msg}` };
      }
    }
    
    return { success: true };
  },

  /**
   * Test created elements are functional
   */
  testCreatedElementsFunctional: () => {
    try {
      const div = h.div({ id: 'test-div', class: 'test-class' }, 'Hello World');
      
      if (div.id !== 'test-div') {
        return { success: false, error: 'id attribute not set' };
      }
      if (div.className !== 'test-class') {
        return { success: false, error: 'class attribute not set' };
      }
      if (div.textContent !== 'Hello World') {
        return { success: false, error: 'text content not set' };
      }
      if (div.tagName.toLowerCase() !== 'div') {
        return { success: false, error: 'tag name incorrect' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Test backward compatibility
   */
  testBackwardCompatibility: () => {
    try {
      const container = h.div(
        h.h1('Title'),
        h.p('Paragraph'),
        h.button({ id: 'btn' }, 'Click me')
      );
      
      if (container.children.length !== 3) {
        return { success: false, error: `Expected 3 children, got ${container.children.length}` };
      }
      if (container.children[0].tagName.toLowerCase() !== 'h1') {
        return { success: false, error: 'First child is not h1' };
      }
      if (container.children[2].tagName.toLowerCase() !== 'button') {
        return { success: false, error: 'Last child is not button' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests and display results
   */
  runAllTests: () => {
    const results: any[] = [];
    
    // Test 1: Dangerous tags blocked
    results.push({
      name: 'h proxy blocks dangerous tags',
      result: (window as any).testHProxy.testDangerousTagsBlocked()
    });
    
    // Test 2: Valid tags accepted
    results.push({
      name: 'h proxy accepts valid tags',
      result: (window as any).testHProxy.testValidTagsAccepted()
    });
    
    // Test 3: Custom elements accepted
    results.push({
      name: 'h proxy accepts custom elements',
      result: (window as any).testHProxy.testCustomElementsAccepted()
    });
    
    // Test 4: Invalid tags rejected
    results.push({
      name: 'h proxy rejects invalid tags',
      result: (window as any).testHProxy.testInvalidTagsRejected()
    });
    
    // Test 5: Error messages descriptive
    results.push({
      name: 'h proxy error messages are descriptive',
      result: (window as any).testHProxy.testErrorMessagesDescriptive()
    });
    
    // Test 6: Created elements functional
    results.push({
      name: 'h proxy created elements are functional',
      result: (window as any).testHProxy.testCreatedElementsFunctional()
    });
    
    // Test 7: Backward compatibility
    results.push({
      name: 'h proxy maintains backward compatibility',
      result: (window as any).testHProxy.testBackwardCompatibility()
    });
    
    // Test 8: Case sensitivity of blocked properties
    results.push({
      name: 'h proxy case sensitivity for blocked properties',
      result: (window as any).testHProxy.testCaseSensitivityBlocked()
    });
    
    // Test 9: Numbers in tag names
    results.push({
      name: 'h proxy accepts numbers in tag names',
      result: (window as any).testHProxy.testNumbersInTagNames()
    });
    
    // Test 10: Complex hyphenated elements
    results.push({
      name: 'h proxy accepts complex hyphenated elements',
      result: (window as any).testHProxy.testComplexHyphenatedElements()
    });
    
    // Test 11: Single letter tags
    results.push({
      name: 'h proxy accepts single letter tags',
      result: (window as any).testHProxy.testSingleLetterTags()
    });
    
    // Test 12: Very long tag names
    results.push({
      name: 'h proxy accepts very long tag names',
      result: (window as any).testHProxy.testVeryLongTagNames()
    });
    
    // Test 13: Complex children scenarios
    results.push({
      name: 'h proxy handles complex children',
      result: (window as any).testHProxy.testComplexChildren()
    });
    
    // Test 14: Complex attributes
    results.push({
      name: 'h proxy handles complex attributes',
      result: (window as any).testHProxy.testComplexAttributes()
    });
    
    // Test 15: ref callback functionality
    results.push({
      name: 'h proxy ref callback works',
      result: (window as any).testHProxy.testRefCallback()
    });
    
    // Display results
    const resultsDiv = document.getElementById('test-results');
    if (resultsDiv) {
      let html = '<h2>h Proxy Tag Validation Tests</h2>\n';
      let passCount = 0;
      let failCount = 0;
      
      for (const test of results) {
        const passed = test.result.success;
        if (passed) passCount++;
        else failCount++;
        
        html += `\n${passed ? '✓' : '✗'} ${test.name}\n`;
        if (!passed) {
          html += `  Error: ${test.result.error}\n`;
        }
      }
      
      html += `\n\nSummary: ${passCount} passed, ${failCount} failed\n`;
      resultsDiv.innerHTML = `<pre>${html}</pre>`;
    }
    
    return results;
  }
};

// Run tests on page load
window.addEventListener('load', () => {
  (window as any).testHProxy.runAllTests();
});

console.log('Test page loaded. Run window.testHProxy.runAllTests() to execute tests.');
