import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from '../lifecycle/lifecycle';
import { createSignal } from '../primitives/signal';
import { createEffect } from '../primitives/effect';
import { enableProfiler, getProfilerReport } from './profiler';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Aided Profiler', () => {
  beforeEach(() => {
    enableProfiler(false); // Reset state
  });

  it('should not track effects when disabled', async () => {
    const [sig, setSig] = createSignal(0);
    createRoot(() => {
      createEffect(() => sig(), { name: 'TestEffect' });
    });

    setSig(1);
    await tick();

    const report = getProfilerReport();
    expect(report.effectExecutions).toBe(0);
  });

  it('should track effect executions and timings when enabled', async () => {
    enableProfiler(true);
    const [sig, setSig] = createSignal(0);

    createRoot(() => {
      createEffect(() => sig(), { name: 'TrackedEffect' });
    });

    setSig(1);
    await tick();

    const report = getProfilerReport();
    expect(report.effectExecutions).toBe(2); // Initial run + 1 update
    expect(report.effects['TrackedEffect']).toBeDefined();
    expect(report.effects['TrackedEffect'].count).toBe(2);
    expect(report.totalTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should clear stats when disabled', async () => {
    enableProfiler(true);
    const [sig] = createSignal(0);
    createRoot(() => createEffect(() => sig(), { name: 'ClearTest' }));

    expect(getProfilerReport().effectExecutions).toBe(1);

    enableProfiler(false);
    expect(getProfilerReport().effectExecutions).toBe(0);
    expect(getProfilerReport().effects).toEqual({});
  });

  it('should track unnamed effects as "anonymous" and cover multiple execution branches', async () => {
    enableProfiler(true);
    const [sig, setSig] = createSignal(0);

    createRoot(() => {
      // Create an effect WITHOUT a name to hit the 'anonymous' fallback branch in effect.ts
      createEffect(() => sig());
    });

    // Trigger a second execution to ensure:
    // 1. durationMs <= maxTime branch is hit in profiler.ts
    // 2. effectStats.get(name) returns an existing object (truthy branch) in profiler.ts
    setSig(1);
    await tick();

    const report = getProfilerReport();
    expect(report.effects['anonymous']).toBeDefined();
    expect(report.effects['anonymous'].count).toBe(2);
  });
});
