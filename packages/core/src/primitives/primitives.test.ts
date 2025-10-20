import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, createMemo, createRoot } from '../index';

// Helper to wait for the next microtask
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Aided Core Reactivity', () => {
  it('should create a signal, read its value, and set it', () => {
    const [count, setCount] = createSignal(0);
    expect(count()).toBe(0);
    setCount(10);
    expect(count()).toBe(10);
  });

  it('should trigger an effect when a dependency changes', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    // Wrap the effect in a root
    const dispose = createRoot(() => {
      createEffect(effectFn);
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    setCount(5);
    await tick(); // Wait for the microtask queue to flush
    expect(effectFn).toHaveBeenCalledTimes(2);

    setCount(10);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(3);

    // Clean up the root at the end of the test
    dispose();
  });

  it('should not trigger an effect if the value is the same', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    // Wrap the effect in a root
    const dispose = createRoot(() => {
      createEffect(effectFn);
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    setCount(0); // Set to the same value
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(1); // Should not run again

    // Clean up the root at the end of the test
    dispose();
  });

  it('should batch multiple updates into a single effect run', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    // Wrap the effect in a root
    const dispose = createRoot(() => {
      createEffect(effectFn);
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    // These updates should be batched
    setCount(1);
    setCount(2);
    setCount(3);

    await tick();
    expect(effectFn).toHaveBeenCalledTimes(2); // Should only run once more
    expect(count()).toBe(3);

    // Clean up the root at the end of the test
    dispose();
  });

  it('should correctly handle nested effects', async () => {
    const [outerSignal, setOuterSignal] = createSignal(0);
    const [innerSignal, setInnerSignal] = createSignal(0);

    const outerEffectFn = vi.fn();
    const innerEffectFn = vi.fn();

    // Wrap the effect in a root
    const dispose = createRoot(() => {
      createEffect(() => {
        outerEffectFn(outerSignal());
        createEffect(() => {
          innerEffectFn(innerSignal());
        });
      });
    });
    

    expect(outerEffectFn).toHaveBeenCalledTimes(1);
    expect(innerEffectFn).toHaveBeenCalledTimes(1);

    // Update inner signal, only inner effect should run
    setInnerSignal(1);
    await tick();
    expect(outerEffectFn).toHaveBeenCalledTimes(1);
    expect(innerEffectFn).toHaveBeenCalledTimes(2);

    // Update outer signal, both effects should run (outer runs, re-creating inner)
    setOuterSignal(1);
    await tick();
    expect(outerEffectFn).toHaveBeenCalledTimes(2);
    expect(innerEffectFn).toHaveBeenCalledTimes(3);

    // Clean up the root at the end of the test
    dispose();
  });

  it('should dispose an effect and stop reactions', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    const dispose = createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);

    dispose();

    setCount(5);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(1); // Should not run after being disposed
  });

  it('should create a memo that caches its value', async () => {
    const [count, setCount] = createSignal(2);
    const computation = vi.fn(() => count() * 2);
    const doubled = createMemo(computation);

    expect(computation).toHaveBeenCalledTimes(1); // Initial computation

    expect(doubled()).toBe(4);
    expect(doubled()).toBe(4);
    expect(computation).toHaveBeenCalledTimes(1); // Should not re-compute

    setCount(3);
    await tick();
    expect(computation).toHaveBeenCalledTimes(2); // Re-computes on dependency change
    expect(doubled()).toBe(6);
  });

  it('should correctly track conditional dependencies', async () => {
    const [condition, setCondition] = createSignal(true);
    const [dataA, setDataA] = createSignal(1);
    const [dataB, setDataB] = createSignal(10);
    const effectFn = vi.fn(() => {
      if (condition()) {
        dataA();
      } else {
        dataB();
      }
    });

    // Wrap the effect in a root
    const dispose = createRoot(() => {
      createEffect(effectFn);
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    // Only depends on A right now
    setDataB(20);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(1); // Should not run

    setDataA(2);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(2); // Should run

    // Switch the condition
    setCondition(false);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(3);

    // Now only depends on B
    setDataA(3);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(3); // Should not run

    setDataB(30);
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(4); // Should run

    // Clean up the root at the end of the test
    dispose();
  });
});
