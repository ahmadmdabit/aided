import { describe, it, expect, vi } from 'vitest';
import { createRoot, createContext, provide, useContext } from '../index';

describe('Aided Context API', () => {
  it('should provide and inject a value', () => {
    const TestContext = createContext<string>();
    let injectedValue: string | undefined;

    createRoot(() => {
      provide(TestContext, 'hello');
      injectedValue = useContext(TestContext);
    });

    expect(injectedValue).toBe('hello');
  });

  it('should return the default value if no provider is found', () => {
    const TestContext = createContext('default');
    let injectedValue: string | undefined;

    createRoot(() => {
      injectedValue = useContext(TestContext);
    });

    expect(injectedValue).toBe('default');
  });

  it('should return undefined if no provider and no default value', () => {
    const TestContext = createContext<string>();
    let injectedValue: string | undefined;

    createRoot(() => {
      injectedValue = useContext(TestContext);
    });

    expect(injectedValue).toBeUndefined();
  });

  it('should handle nested providers correctly', () => {
    const TestContext = createContext<string>();
    let innerValue: string | undefined;
    let outerValue: string | undefined;

    createRoot(() => {
      provide(TestContext, 'outer');
      createRoot(() => {
        provide(TestContext, 'inner');
        innerValue = useContext(TestContext);
      });
      outerValue = useContext(TestContext);
    });

    expect(innerValue).toBe('inner');
    expect(outerValue).toBe('outer');
  });

  it('should warn when provide is called outside a root', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.NODE_ENV = 'development';
    
    const TestContext = createContext();
    provide(TestContext, 'value');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('provide() was called outside of a reactive scope')
    );

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = 'test';
  });
});
