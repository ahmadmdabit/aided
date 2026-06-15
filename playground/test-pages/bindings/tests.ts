/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSignal, createRoot, bindText, bindAttr, bindEvent, bindClassList, bindStyle, Model } from 'aided-core';

// Make functions globally available for testing
(window as any).testUtils = {
  createSignal,
  createRoot,
  bindText,
  bindAttr,
  bindEvent,
  bindClassList,
  bindStyle,
  Model
};

interface TestResult {
  success: boolean;
  [key: string]: any;
}

// Helper function to run tests inside createRoot and extract result
// Returns a promise that resolves after effects have run
async function runInRoot<T>(fn: () => T): Promise<T> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const result = fn();
      // Wait for microtasks (effects) to complete, then wait one more tick
      // to ensure all DOM updates have been applied
      Promise.resolve().then(() => {
        setTimeout(() => {
          dispose();
          resolve(result);
        }, 0);
      });
    });
  });
}

// ============================================================================
// BINDTEXT TESTS (5 tests)
// ============================================================================

function testBindTextBasic(): TestResult {
  const [text] = createSignal('Hello');
  const div = document.createElement('div');
  bindText(div, text);
  return {
    success: div.textContent === 'Hello',
    actual: div.textContent
  };
}

async function testBindTextNull(): Promise<TestResult> {
  return runInRoot(() => {
    const [text, setText] = createSignal<any>(null);
    const div = document.createElement('div');
    bindText(div, text);
    const nullResult = div.textContent === '';

    setText(undefined);
    const undefinedResult = div.textContent === '';

    return {
      success: nullResult && undefinedResult,
      nullResult,
      undefinedResult
    };
  });
}

async function testBindTextTypeConversion(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal<any>(42);
      const div = document.createElement('div');
      bindText(div, value);
      const numberResult = div.textContent === '42';

      setValue(true);
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const booleanResult = div.textContent === 'true';
          dispose();
          resolve({
            success: numberResult && booleanResult,
            numberResult,
            booleanResult
          });
        }, 0);
      });
    });
  });
}

async function testBindTextReactive(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [text, setText] = createSignal('Initial');
      const div = document.createElement('div');
      bindText(div, text);

      const initialResult = div.textContent === 'Initial';
      setText('Updated');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const updatedResult = div.textContent === 'Updated';
          dispose();
          resolve({
            success: initialResult && updatedResult,
            initialResult,
            updatedResult
          });
        }, 0);
      });
    });
  });
}

function testBindTextSpecialChars(): TestResult {
  const [text] = createSignal('<script>alert("XSS")</script>');
  const div = document.createElement('div');
  bindText(div, text);

  // Should be text, not HTML
  const hasScriptTag = div.querySelector('script') === null;
  const textContent = div.textContent === '<script>alert("XSS")</script>';

  return {
    success: hasScriptTag && textContent,
    hasScriptTag,
    textContent
  };
}

// ============================================================================
// BINDATTR TESTS (6 tests)
// ============================================================================

async function testBindAttrRemoval(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal<any>('initial');
      const div = document.createElement('div');
      bindAttr(div, 'data-test', value);

      const hasInitial = div.getAttribute('data-test') === 'initial';

      setValue(null);
      
      // Wait for first effect
      Promise.resolve().then(() => setTimeout(() => {
        const removedNull = div.hasAttribute('data-test') === false;

        setValue('back');
        Promise.resolve().then(() => setTimeout(() => {
          setValue(undefined);
          Promise.resolve().then(() => setTimeout(() => {
            const removedUndefined = div.hasAttribute('data-test') === false;

            setValue('back');
            Promise.resolve().then(() => setTimeout(() => {
              setValue(false);
              Promise.resolve().then(() => setTimeout(() => {
                const removedFalse = div.hasAttribute('data-test') === false;
                dispose();
                resolve({
                  success: hasInitial && removedNull && removedUndefined && removedFalse,
                  hasInitial,
                  removedNull,
                  removedUndefined,
                  removedFalse
                });
              }, 0));
            }, 0));
          }, 0));
        }, 0));
      }, 0));
    });
  });
}

function testBindAttrSetting(): TestResult {
  const [value] = createSignal('test-value');
  const div = document.createElement('div');
  bindAttr(div, 'data-test', value);

  return {
    success: div.getAttribute('data-test') === 'test-value',
    actual: div.getAttribute('data-test')
  };
}

async function testBindAttrTypeConversion(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal<any>(42);
      const div = document.createElement('div');
      bindAttr(div, 'data-count', value);

      const numberResult = div.getAttribute('data-count') === '42';

      setValue(true);
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const booleanResult = div.getAttribute('data-count') === 'true';
          dispose();
          resolve({
            success: numberResult && booleanResult,
            numberResult,
            booleanResult
          });
        }, 0);
      });
    });
  });
}

async function testBindAttrReactive(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal('initial');
      const div = document.createElement('div');
      bindAttr(div, 'data-test', value);

      const initialResult = div.getAttribute('data-test') === 'initial';
      setValue('updated');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const updatedResult = div.getAttribute('data-test') === 'updated';
          dispose();
          resolve({
            success: initialResult && updatedResult,
            initialResult,
            updatedResult
          });
        }, 0);
      });
    });
  });
}

function testBindAttrEmptyString(): TestResult {
  const [value] = createSignal('');
  const div = document.createElement('div');
  bindAttr(div, 'data-test', value);

  // Empty string should set attribute, not remove it
  const hasAttribute = div.hasAttribute('data-test');
  const isEmpty = div.getAttribute('data-test') === '';

  return {
    success: hasAttribute && isEmpty,
    hasAttribute,
    isEmpty
  };
}

function testBindAttrSpecialChars(): TestResult {
  const [value] = createSignal('value with "quotes" and <brackets>');
  const div = document.createElement('div');
  bindAttr(div, 'data-test', value);

  return {
    success: div.getAttribute('data-test') === 'value with "quotes" and <brackets>',
    actual: div.getAttribute('data-test')
  };
}

// ============================================================================
// BINDEVENT TESTS (6 tests)
// ============================================================================

async function testBindEventAttachment(): Promise<TestResult> {
  return runInRoot(() => {
    let clicked = false;
    const button = document.createElement('button');

    bindEvent(button, 'click', () => {
      clicked = true;
    });

    button.click();

    return {
      success: clicked,
      clicked
    };
  });
}

async function testBindEventExecution(): Promise<TestResult> {
  return runInRoot(() => {
    let eventObject: any = null;
    const button = document.createElement('button');

    bindEvent(button, 'click', (ev) => {
      eventObject = ev;
    });

    button.click();

    return {
      success: eventObject !== null && eventObject.type === 'click',
      hasEvent: eventObject !== null,
      eventType: eventObject?.type
    };
  });
}

async function testBindEventErrorHandling(): Promise<TestResult> {
  return runInRoot(() => {
    const button = document.createElement('button');
    let errorCaught = false;

    // Mock console.error
    const originalError = console.error;
    console.error = () => {
      errorCaught = true;
    };

    bindEvent(button, 'click', () => {
      throw new Error('Test error');
    });

    button.click();

    console.error = originalError;

    return {
      success: errorCaught,
      errorCaught
    };
  });
}

function testBindEventCleanup(): TestResult {
  let clickCount = 0;
  const button = document.createElement('button');

  const dispose = createRoot((dispose) => {
    bindEvent(button, 'click', () => {
      clickCount++;
    });
    return dispose;
  });

  button.click();
  const beforeDispose = clickCount === 1;

  dispose();
  button.click();
  const afterDispose = clickCount === 1; // Should not increment

  return {
    success: beforeDispose && afterDispose,
    beforeDispose,
    afterDispose,
    clickCount
  };
}

async function testBindEventMultiple(): Promise<TestResult> {
  return runInRoot(() => {
    let clickCount = 0;
    let mouseoverCount = 0;
    const button = document.createElement('button');

    bindEvent(button, 'click', () => {
      clickCount++;
    });
    bindEvent(button, 'mouseover', () => {
      mouseoverCount++;
    });

    button.click();
    button.dispatchEvent(new Event('mouseover'));

    return {
      success: clickCount === 1 && mouseoverCount === 1,
      clickCount,
      mouseoverCount
    };
  });
}

async function testBindEventTypes(): Promise<TestResult> {
  return runInRoot(() => {
    let inputEvent: any = null;
    let changeEvent: any = null;
    const input = document.createElement('input');

    bindEvent(input, 'input', (ev) => {
      inputEvent = ev;
    });
    bindEvent(input, 'change', (ev) => {
      changeEvent = ev;
    });

    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));

    return {
      success: inputEvent?.type === 'input' && changeEvent?.type === 'change',
      inputType: inputEvent?.type,
      changeType: changeEvent?.type
    };
  });
}

// ============================================================================
// BINDCLASSLIST TESTS (6 tests)
// ============================================================================

function testBindClassListStatic(): TestResult {
  const div = document.createElement('div');

  bindClassList(div, {
    active: () => true,
    disabled: () => false
  });

  return {
    success: div.classList.contains('active') && !div.classList.contains('disabled'),
    hasActive: div.classList.contains('active'),
    hasDisabled: div.classList.contains('disabled')
  };
}

async function testBindClassListReactive(): Promise<TestResult> {
  return runInRoot(() => {
    const [isActive] = createSignal(true);
    const [isDisabled] = createSignal(false);
    const div = document.createElement('div');

    bindClassList(div, {
      active: isActive,
      disabled: isDisabled
    });

    return {
      success: div.classList.contains('active') && !div.classList.contains('disabled'),
      hasActive: div.classList.contains('active'),
      hasDisabled: div.classList.contains('disabled')
    };
  });
}

async function testBindClassListUpdates(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [isActive, setActive] = createSignal(false);
      const div = document.createElement('div');

      bindClassList(div, {
        active: isActive
      });

      const initialResult = !div.classList.contains('active');
      setActive(true);
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const updatedResult = div.classList.contains('active');
          dispose();
          resolve({
            success: initialResult && updatedResult,
            initialResult,
            updatedResult
          });
        }, 0);
      });
    });
  });
}

async function testBindClassListMultiple(): Promise<TestResult> {
  return runInRoot(() => {
    const [isActive] = createSignal(true);
    const [isLarge] = createSignal(true);
    const [isDisabled] = createSignal(false);
    const div = document.createElement('div');

    bindClassList(div, {
      active: isActive,
      large: isLarge,
      disabled: isDisabled
    });

    return {
      success:
        div.classList.contains('active') &&
        div.classList.contains('large') &&
        !div.classList.contains('disabled'),
      hasActive: div.classList.contains('active'),
      hasLarge: div.classList.contains('large'),
      hasDisabled: div.classList.contains('disabled')
    };
  });
}

async function testBindClassListCoercion(): Promise<TestResult> {
  return runInRoot(() => {
    const div = document.createElement('div');

    bindClassList(div, {
      truthy1: () => 1 as any,
      truthy2: () => 'yes' as any,
      truthy3: () => [] as any,
      falsy1: () => 0 as any,
      falsy2: () => '' as any,
      falsy3: () => null as any
    });

    return {
      success:
        div.classList.contains('truthy1') &&
        div.classList.contains('truthy2') &&
        div.classList.contains('truthy3') &&
        !div.classList.contains('falsy1') &&
        !div.classList.contains('falsy2') &&
        !div.classList.contains('falsy3'),
      truthy1: div.classList.contains('truthy1'),
      truthy2: div.classList.contains('truthy2'),
      truthy3: div.classList.contains('truthy3'),
      falsy1: div.classList.contains('falsy1'),
      falsy2: div.classList.contains('falsy2'),
      falsy3: div.classList.contains('falsy3')
    };
  });
}

function testBindClassListEmpty(): TestResult {
  const div = document.createElement('div');

  try {
    bindClassList(div, {});
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// BINDSTYLE TESTS (6 tests)
// ============================================================================

function testBindStyleStatic(): TestResult {
  const div = document.createElement('div');

  bindStyle(div, {
    color: () => 'red' as any,
    fontSize: () => '16px' as any
  });

  return {
    success: div.style.color === 'red' && div.style.fontSize === '16px',
    color: div.style.color,
    fontSize: div.style.fontSize
  };
}

async function testBindStyleReactive(): Promise<TestResult> {
  return runInRoot(() => {
    const [color] = createSignal('blue');
    const div = document.createElement('div');

    bindStyle(div, {
      color: color as any
    });

    return {
      success: div.style.color === 'blue',
      color: div.style.color
    };
  });
}

async function testBindStyleUpdates(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [color, setColor] = createSignal('red');
      const div = document.createElement('div');

      bindStyle(div, {
        color: color as any
      });

      const initialResult = div.style.color === 'red';
      setColor('blue');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const updatedResult = div.style.color === 'blue';
          dispose();
          resolve({
            success: initialResult && updatedResult,
            initialResult,
            updatedResult
          });
        }, 0);
      });
    });
  });
}

async function testBindStyleNull(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [color, setColor] = createSignal<any>('red');
      const div = document.createElement('div');

      bindStyle(div, {
        color: color as any
      });

      setColor(null);
      
      // Wait for first effect
      Promise.resolve().then(() => setTimeout(() => {
        const nullResult = div.style.color === '';

        setColor('blue');
        Promise.resolve().then(() => setTimeout(() => {
          setColor(undefined);
          Promise.resolve().then(() => setTimeout(() => {
            const undefinedResult = div.style.color === '';
            dispose();
            resolve({
              success: nullResult && undefinedResult,
              nullResult,
              undefinedResult
            });
          }, 0));
        }, 0));
      }, 0));
    });
  });
}

async function testBindStyleMultiple(): Promise<TestResult> {
  return runInRoot(() => {
    const [color] = createSignal('red');
    const div = document.createElement('div');

    bindStyle(div, {
      color: color as any,
      fontSize: () => '16px' as any,
      backgroundColor: () => 'blue' as any
    });

    return {
      success:
        div.style.color === 'red' &&
        div.style.fontSize === '16px' &&
        div.style.backgroundColor === 'blue',
      color: div.style.color,
      fontSize: div.style.fontSize,
      backgroundColor: div.style.backgroundColor
    };
  });
}

function testBindStyleCamelCase(): TestResult {
  const div = document.createElement('div');

  bindStyle(div, {
    backgroundColor: () => 'red' as any,
    fontSize: () => '16px' as any,
    borderRadius: () => '5px' as any
  });

  return {
    success:
      div.style.backgroundColor === 'red' &&
      div.style.fontSize === '16px' &&
      div.style.borderRadius === '5px',
    backgroundColor: div.style.backgroundColor,
    fontSize: div.style.fontSize,
    borderRadius: div.style.borderRadius
  };
}

// ============================================================================
// MODEL TESTS (7 tests)
// ============================================================================

async function testModelTextInput(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal('initial');
      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'text';

      Model(input, [value, setValue]);

      const initialResult = input.value === 'initial';

      setValue('updated');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const signalToInputResult = input.value === 'updated';

          input.value = 'user input';
          input.dispatchEvent(new Event('input'));
          const inputToSignalResult = value() === 'user input';

          dispose();
          resolve({
            success: initialResult && signalToInputResult && inputToSignalResult,
            initialResult,
            signalToInputResult,
            inputToSignalResult
          });
        }, 0);
      });
    });
  });
}

async function testModelCheckbox(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [checked, setChecked] = createSignal(false);
      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'checkbox';

      Model(input, [checked, setChecked]);

      const initialResult = input.checked === false;

      setChecked(true);
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const signalToInputResult = input.checked === true;

          input.checked = false;
          input.dispatchEvent(new Event('change'));
          const inputToSignalResult = checked() === false;

          dispose();
          resolve({
            success: initialResult && signalToInputResult && inputToSignalResult,
            initialResult,
            signalToInputResult,
            inputToSignalResult
          });
        }, 0);
      });
    });
  });
}

async function testModelRadio(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [checked, setChecked] = createSignal(false);
      const input = document.createElement('input') as HTMLInputElement;
      input.type = 'radio';

      Model(input, [checked, setChecked]);

      const initialResult = input.checked === false;

      setChecked(true);
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const signalToInputResult = input.checked === true;

          input.checked = false;
          input.dispatchEvent(new Event('change'));
          const inputToSignalResult = checked() === false;

          dispose();
          resolve({
            success: initialResult && signalToInputResult && inputToSignalResult,
            initialResult,
            signalToInputResult,
            inputToSignalResult
          });
        }, 0);
      });
    });
  });
}

async function testModelSelect(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal('option1');
      const select = document.createElement('select') as HTMLSelectElement;
      select.innerHTML =
        '<option value="option1">Option 1</option><option value="option2">Option 2</option>';

      Model(select, [value, setValue]);

      const initialResult = select.value === 'option1';

      setValue('option2');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const signalToInputResult = select.value === 'option2';

          select.value = 'option1';
          select.dispatchEvent(new Event('change'));
          const inputToSignalResult = value() === 'option1';

          dispose();
          resolve({
            success: initialResult && signalToInputResult && inputToSignalResult,
            initialResult,
            signalToInputResult,
            inputToSignalResult
          });
        }, 0);
      });
    });
  });
}

async function testModelTextarea(): Promise<TestResult> {
  return new Promise((resolve) => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal('initial');
      const textarea = document.createElement('textarea') as HTMLTextAreaElement;

      Model(textarea, [value, setValue]);

      const initialResult = textarea.value === 'initial';

      setValue('updated');
      
      // Wait for effects to run
      Promise.resolve().then(() => {
        setTimeout(() => {
          const signalToInputResult = textarea.value === 'updated';

          textarea.value = 'user input';
          textarea.dispatchEvent(new Event('input'));
          const inputToSignalResult = value() === 'user input';

          dispose();
          resolve({
            success: initialResult && signalToInputResult && inputToSignalResult,
            initialResult,
            signalToInputResult,
            inputToSignalResult
          });
        }, 0);
      });
    });
  });
}

async function testModelCursorPosition(): Promise<TestResult> {
  return runInRoot(() => {
    const [value, setValue] = createSignal('test');
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'text';
    document.body.appendChild(input);

    Model(input, [value, setValue]);

    input.focus();
    input.setSelectionRange(2, 2); // Cursor at position 2

    setValue('test'); // Same value
    const cursorPosition = input.selectionStart;

    document.body.removeChild(input);

    return {
      success: cursorPosition === 2,
      cursorPosition
    };
  });
}

async function testModelNull(): Promise<TestResult> {
  return runInRoot(() => {
    const [value, setValue] = createSignal<any>(null);
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'text';

    Model(input, [value, setValue]);

    const nullResult = input.value === '';

    setValue(undefined);
    const undefinedResult = input.value === '';

    return {
      success: nullResult && undefinedResult,
      nullResult,
      undefinedResult
    };
  });
}

// ============================================================================
// TEST RUNNER
// ============================================================================

const testGroups = [
  {
    name: 'bindText Tests',
    tests: [
      { name: 'testBindTextBasic', fn: testBindTextBasic },
      { name: 'testBindTextNull', fn: testBindTextNull },
      { name: 'testBindTextTypeConversion', fn: testBindTextTypeConversion },
      { name: 'testBindTextReactive', fn: testBindTextReactive },
      { name: 'testBindTextSpecialChars', fn: testBindTextSpecialChars }
    ]
  },
  {
    name: 'bindAttr Tests',
    tests: [
      { name: 'testBindAttrRemoval', fn: testBindAttrRemoval },
      { name: 'testBindAttrSetting', fn: testBindAttrSetting },
      { name: 'testBindAttrTypeConversion', fn: testBindAttrTypeConversion },
      { name: 'testBindAttrReactive', fn: testBindAttrReactive },
      { name: 'testBindAttrEmptyString', fn: testBindAttrEmptyString },
      { name: 'testBindAttrSpecialChars', fn: testBindAttrSpecialChars }
    ]
  },
  {
    name: 'bindEvent Tests',
    tests: [
      { name: 'testBindEventAttachment', fn: testBindEventAttachment },
      { name: 'testBindEventExecution', fn: testBindEventExecution },
      { name: 'testBindEventErrorHandling', fn: testBindEventErrorHandling },
      { name: 'testBindEventCleanup', fn: testBindEventCleanup },
      { name: 'testBindEventMultiple', fn: testBindEventMultiple },
      { name: 'testBindEventTypes', fn: testBindEventTypes }
    ]
  },
  {
    name: 'bindClassList Tests',
    tests: [
      { name: 'testBindClassListStatic', fn: testBindClassListStatic },
      { name: 'testBindClassListReactive', fn: testBindClassListReactive },
      { name: 'testBindClassListUpdates', fn: testBindClassListUpdates },
      { name: 'testBindClassListMultiple', fn: testBindClassListMultiple },
      { name: 'testBindClassListCoercion', fn: testBindClassListCoercion },
      { name: 'testBindClassListEmpty', fn: testBindClassListEmpty }
    ]
  },
  {
    name: 'bindStyle Tests',
    tests: [
      { name: 'testBindStyleStatic', fn: testBindStyleStatic },
      { name: 'testBindStyleReactive', fn: testBindStyleReactive },
      { name: 'testBindStyleUpdates', fn: testBindStyleUpdates },
      { name: 'testBindStyleNull', fn: testBindStyleNull },
      { name: 'testBindStyleMultiple', fn: testBindStyleMultiple },
      { name: 'testBindStyleCamelCase', fn: testBindStyleCamelCase }
    ]
  },
  {
    name: 'Model Tests',
    tests: [
      { name: 'testModelTextInput', fn: testModelTextInput },
      { name: 'testModelCheckbox', fn: testModelCheckbox },
      { name: 'testModelRadio', fn: testModelRadio },
      { name: 'testModelSelect', fn: testModelSelect },
      { name: 'testModelTextarea', fn: testModelTextarea },
      { name: 'testModelCursorPosition', fn: testModelCursorPosition },
      { name: 'testModelNull', fn: testModelNull }
    ]
  }
];

function runAllTests() {
  const resultsDiv = document.getElementById('results')!;
  const summaryDiv = document.getElementById('summary')!;

  resultsDiv.innerHTML = '<div class="loading"><span class="spinner"></span>Running tests...</div>';
  summaryDiv.style.display = 'none';

  // Run tests asynchronously to allow UI to update
  setTimeout(async () => {
    const results: any[] = [];
    let totalTests = 0;
    let passedTests = 0;

    resultsDiv.innerHTML = '';

    for (const group of testGroups) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'test-group';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'test-group-header';

      const groupResults = [];
      
      for (const test of group.tests) {
        totalTests++;
        try {
          const result = await test.fn();
          if (result.success) {
            passedTests++;
          }
          groupResults.push({
            name: test.name,
            result,
            passed: result.success
          });
        } catch (error: any) {
          groupResults.push({
            name: test.name,
            result: { error: error.message },
            passed: false
          });
        }
      }

      const groupPassed = groupResults.filter((r) => r.passed).length;
      const groupTotal = groupResults.length;

      headerDiv.innerHTML = `
        <span>${group.name}</span>
        <span class="test-group-count">${groupPassed}/${groupTotal} passed</span>
      `;

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'test-items';

      groupResults.forEach((testResult) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `test-item ${testResult.passed ? 'pass' : 'fail'}`;

        const statusSpan = document.createElement('span');
        statusSpan.className = `test-status ${testResult.passed ? 'pass' : 'fail'}`;
        statusSpan.textContent = testResult.passed ? 'PASS' : 'FAIL';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'test-name';
        nameSpan.textContent = testResult.name;

        itemDiv.appendChild(statusSpan);
        itemDiv.appendChild(nameSpan);

        if (!testResult.passed || Object.keys(testResult.result).length > 1) {
          const detailsDiv = document.createElement('div');
          detailsDiv.className = 'test-details';
          detailsDiv.textContent = JSON.stringify(testResult.result, null, 2);
          itemDiv.appendChild(detailsDiv);
        }

        itemsDiv.appendChild(itemDiv);
      });

      groupDiv.appendChild(headerDiv);
      groupDiv.appendChild(itemsDiv);
      resultsDiv.appendChild(groupDiv);

      results.push({
        group: group.name,
        tests: groupResults
      });
    }

    // Display summary
    summaryDiv.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Total Tests:</span>
        <span class="summary-value">${totalTests}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Passed:</span>
        <span class="summary-value pass">${passedTests}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Failed:</span>
        <span class="summary-value ${totalTests - passedTests > 0 ? 'fail' : ''}">${totalTests - passedTests}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Success Rate:</span>
        <span class="summary-value ${passedTests === totalTests ? 'pass' : 'fail'}">${((passedTests / totalTests) * 100).toFixed(1)}%</span>
      </div>
    `;
    summaryDiv.style.display = 'block';
  }, 100);
}

function clearResults() {
  document.getElementById('results')!.innerHTML = '';
  document.getElementById('summary')!.style.display = 'none';
}

// Make test runner functions globally available
(window as any).runAllTests = runAllTests;
(window as any).clearResults = clearResults;

// Export for use in e2e tests
(window as any).testBindings = {
  runAllTests,
  clearResults,
  testGroups
};

export default {
  runAllTests,
  clearResults,
  testGroups
};
