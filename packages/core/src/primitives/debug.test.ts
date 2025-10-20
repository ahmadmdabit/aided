import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal, createEffect, createMemo, hasOwner } from '../index';

describe('Aided Debugging Utilities', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = 'test';
  });

  it('should attach a name to a signal in development', () => {
    const [count] = createSignal(0, { name: 'counter' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((count as any)._name).toBe('counter');
  });

  it('should NOT attach a name to a signal in production', () => {
    process.env.NODE_ENV = 'production';
    const [count] = createSignal(0, { name: 'counter' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((count as any)._name).toBeUndefined();
  });

  it('should include the effect name in development warnings', () => {
    // Ensure we are not in a root for this test
    expect(hasOwner()).toBe(false);

    createEffect(() => {}, { name: 'MyTestEffect' });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('createEffect("MyTestEffect")')
    );
  });

  it('should handle unnamed effects in warnings gracefully', () => {
    expect(hasOwner()).toBe(false);

    createEffect(() => {});

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('createEffect() was called')
    );
  });

  it('should pass the name from createMemo to its underlying signal and effect', () => {
    expect(hasOwner()).toBe(false);

    const memo = createMemo(() => 1, { name: 'MyMemo' });

    // Check the signal name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((memo as any)._name).toBe('MyMemo');

    // Check the effect warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('createEffect("MyMemo")')
    );
  });
});
