/**
 * Performance Profiling Hooks for Aided.
 * Provides zero-overhead (when disabled) tracking of effect execution times.
 */

export interface ProfilerReport {
  effectExecutions: number;
  totalTimeMs: number;
  averageTimeMs: number;
  maxTimeMs: number;
  effects: Record<string, { count: number; totalTimeMs: number }>;
}

let isProfiling = false;
let totalExecutions = 0;
let totalTime = 0;
let maxTime = 0;
const effectStats = new Map<string, { count: number; totalTime: number }>();

/**
 * Enables or disables the reactive effect profiler.
 * When disabled, profiling overhead is reduced to a single boolean check.
 */
export function enableProfiler(enable: boolean = true): void {
  isProfiling = enable;
  if (!enable) {
    // Reset stats when disabled to keep memory clean
    totalExecutions = 0;
    totalTime = 0;
    maxTime = 0;
    effectStats.clear();
  }
}

export function isProfilerEnabled(): boolean {
  return isProfiling;
}

export function recordEffectExecution(name: string, durationMs: number): void {
  if (!isProfiling) return;
  totalExecutions++;
  totalTime += durationMs;
  if (durationMs > maxTime) maxTime = durationMs;

  const stats = effectStats.get(name) || { count: 0, totalTime: 0 };
  stats.count++;
  stats.totalTime += durationMs;
  effectStats.set(name, stats);
}

/**
 * Generates a snapshot report of all tracked effect executions.
 */
export function getProfilerReport(): ProfilerReport {
  const effects: Record<string, { count: number; totalTimeMs: number }> = {};
  effectStats.forEach((stats, name) => {
    effects[name] = { count: stats.count, totalTimeMs: stats.totalTime };
  });

  return {
    effectExecutions: totalExecutions,
    totalTimeMs: totalTime,
    averageTimeMs: totalExecutions > 0 ? totalTime / totalExecutions : 0,
    maxTimeMs: maxTime,
    effects
  };
}
