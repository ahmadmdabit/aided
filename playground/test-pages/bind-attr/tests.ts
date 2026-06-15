/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * E2E Test Utilities for bindAttr Security Validation
 * 
 * This test page validates that bindAttr() correctly rejects event handler
 * attributes (onclick, onchange, etc.) and accepts valid attributes.
 * 
 * Feature: aided-core-security-performance-fixes
 * Requirements: 1.1, 1.3
 */

import { h, createSignal, render, bindAttr } from 'aided-core';

// Expose library functions globally for e2e tests
(window as any).AidedTest = {
  h,
  createSignal,
  render,
  bindAttr,
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
(window as any).testBindAttr = {
  /**
   * Test that bindAttr rejects event handler attributes
   * This directly calls bindAttr with an event handler attribute to trigger the security check
   */
  testEventHandlerRejection: (attributeName: string) => {
    try {
      const element = document.createElement('button');
      const signal = () => 'malicious code';
      // Directly call bindAttr with the event handler attribute
      bindAttr(element, attributeName, signal);
      return { success: false, error: 'No error thrown' };
    } catch (error: any) {
      return { success: true, error: error.message };
    }
  },

  /**
   * Test that bindAttr accepts valid attributes
   */
  testValidAttributeBinding: (attributeName: string, value: string) => {
    try {
      const element = document.createElement('div');
      const signal = () => value;
      // Directly call bindAttr with a valid attribute
      bindAttr(element, attributeName, signal);
      
      // Trigger the effect by reading the attribute
      const attr = element.getAttribute(attributeName);
      return { success: true, attr: attr };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Test case-insensitive rejection
   */
  testCaseInsensitiveRejection: () => {
    const testCases = ['onClick', 'ONCLICK', 'OnClick', 'onCLICK'];
    
    for (const eventAttr of testCases) {
      try {
        const element = document.createElement('button');
        const signal = () => 'malicious';
        bindAttr(element, eventAttr, signal);
        return { success: false, error: `No error thrown for ${eventAttr}` };
      } catch (error: any) {
        if (!error.message.includes('Cannot bind event handler attribute')) {
          return { success: false, error: `Wrong error for ${eventAttr}` };
        }
      }
    }
    
    return { success: true };
  },

  /**
   * Test error message descriptiveness
   */
  testErrorMessageDescriptiveness: () => {
    try {
      const element = document.createElement('button');
      const signal = () => 'malicious';
      bindAttr(element, 'onclick', signal);
      return { success: false, error: 'No error thrown' };
    } catch (error: any) {
      const msg = error.message;
      const hasSecurityKeyword = msg.includes('Security') || msg.includes('Cannot bind event handler');
      const hasAttributeName = msg.includes('onclick');
      const hasAlternative = msg.includes('addEventListener');
      
      return { 
        success: hasSecurityKeyword && hasAttributeName && hasAlternative,
        error: msg,
        checks: {
          hasSecurityKeyword,
          hasAttributeName,
          hasAlternative
        }
      };
    }
  },

  /**
   * Run all tests and display results
   */
  runAllTests: () => {
    const results: any[] = [];
    
    // Test 1: onclick rejection
    results.push({
      name: 'bindAttr rejects onclick',
      result: (window as any).testBindAttr.testEventHandlerRejection('onclick')
    });
    
    // Test 2: onchange rejection
    results.push({
      name: 'bindAttr rejects onchange',
      result: (window as any).testBindAttr.testEventHandlerRejection('onchange')
    });
    
    // Test 3: oninput rejection
    results.push({
      name: 'bindAttr rejects oninput',
      result: (window as any).testBindAttr.testEventHandlerRejection('oninput')
    });
    
    // Test 4: onsubmit rejection
    results.push({
      name: 'bindAttr rejects onsubmit',
      result: (window as any).testBindAttr.testEventHandlerRejection('onsubmit')
    });
    
    // Test 5: data-* acceptance
    results.push({
      name: 'bindAttr accepts data-*',
      result: (window as any).testBindAttr.testValidAttributeBinding('data-testid', 'test-value')
    });
    
    // Test 6: aria-* acceptance
    results.push({
      name: 'bindAttr accepts aria-*',
      result: (window as any).testBindAttr.testValidAttributeBinding('aria-disabled', 'true')
    });
    
    // Test 7: class acceptance
    results.push({
      name: 'bindAttr accepts class',
      result: (window as any).testBindAttr.testValidAttributeBinding('class', 'active')
    });
    
    // Test 8: id acceptance
    results.push({
      name: 'bindAttr accepts id',
      result: (window as any).testBindAttr.testValidAttributeBinding('id', 'my-element')
    });
    
    // Test 9: case-insensitive rejection
    results.push({
      name: 'bindAttr rejects case-insensitive',
      result: (window as any).testBindAttr.testCaseInsensitiveRejection()
    });
    
    // Test 10: error message descriptiveness
    results.push({
      name: 'bindAttr error message is descriptive',
      result: (window as any).testBindAttr.testErrorMessageDescriptiveness()
    });
    
    // Display results
    const resultsDiv = document.getElementById('test-results');
    if (resultsDiv) {
      let html = '<h2>bindAttr Security Tests</h2>\n';
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
  (window as any).testBindAttr.runAllTests();
});

console.log('Test page loaded. Run window.testBindAttr.runAllTests() to execute tests.');
