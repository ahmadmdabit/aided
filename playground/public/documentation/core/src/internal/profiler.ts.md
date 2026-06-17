# profiler.ts

**Purpose**: Provides zero-overhead (when disabled) performance profiling hooks for tracking effect execution times in Aided applications.

## API
```typescript
enableProfiler(enable: boolean = true): void
isProfilerEnabled(): boolean
recordEffectExecution(name: string, durationMs: number): void
getProfilerReport(): ProfilerReport

interface ProfilerReport {
  effectExecutions: number;
  totalTimeMs: number;
  averageTimeMs: number;
  maxTimeMs: number;
  effects: Record<string, { count: number; totalTimeMs: number }>;
}
```

## Usage
```typescript
import { enableProfiler, recordEffectExecution, getProfilerReport } from 'aided-core';

// Enable profiling
enableProfiler(true);

// In your effect wrapper (integration code)
const effectId = 'my-effect';
const startTime = performance.now();

try {
  // ... effect logic ...
} finally {
  const duration = performance.now() - startTime;
  recordEffectExecution(effectId, duration);
}

// Get report
const report = getProfilerReport();
console.log(report);
// {
//   effectExecutions: 150,
//   totalTimeMs: 45.2,
//   averageTimeMs: 0.301,
//   maxTimeMs: 2.1,
//   effects: {
//     'my-effect': { count: 150, totalTimeMs: 45.2 },
//     'another-effect': { count: 50, totalTimeMs: 5.8 }
//   }
// }

// Disable profiling (zero overhead after this)
enableProfiler(false);
```

## Key Concepts
- **Zero Overhead When Disabled**: Single boolean check before any profiling logic
- **Effect-Level Tracking**: Track individual effect execution times by name
- **Aggregated Statistics**: Compute total, average, and max times automatically
- **Per-Effect Breakdown**: Track each effect's contribution separately
- **Memory Clean**: Stats reset when profiling is disabled

## Implementation Notes

### Zero-Overhead Design

**When Disabled**:
```typescript
let isProfiling = false;

export function recordEffectExecution(name: string, durationMs: number): void {
  if (!isProfiling) return; // Single boolean check, optimized away in production
  // ... profiling logic ...
}
```

The `if (!isProfiling) return;` guard:
- Compiles to a single branch in optimized builds
- JavaScript engines treat this as cold path and optimize around it
- In production with profiling disabled, overhead is essentially zero
- No allocations, no map operations, no arithmetic

**When Enabled**:
- Tracks per-effect statistics in a Map
- Accumulates totals across all effects
- Computes derived statistics on report request

### Why No Default Enabled?

Profiling should be opt-in because:
1. **Performance Impact**: Even with optimization, there's measurable overhead
2. **Production Safety**: Should never be enabled in production without reason
3. **Debug Tool**: Intended for development and performance investigations
4. **Memory Growth**: Stats accumulate until disabled

### Report Generation

```typescript
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
```

The report is computed on-demand, not stored:
- No additional memory for pre-computed averages
- Always accurate, based on current stats
- Zero allocation when no effects tracked

### Reset Behavior

```typescript
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
```

Stats reset when disabling:
- Prevents stale data from persisting across profiling sessions
- Keeps memory clean between uses
- Allows fresh profiling without manual cleanup

### Integration Pattern

**Wrapper Effect Function** (Integration code needed in your app):
```typescript
function createTrackedEffect(
  name: string,
  fn: () => void,
  options?: ReactiveOptions
): void {
  const startTime = performance.now();
  
  try {
    createEffect(fn, options);
  } finally {
    const duration = performance.now() - startTime;
    recordEffectExecution(name, duration);
  }
}
```

Or integrate with your existing effect wrapper:
```typescript
function myCreateEffect(fn: () => void, options?: ReactiveOptions) {
  const start = performance.now();
  
  try {
    createEffect(fn, options);
  } finally {
    const duration = performance.now() - start;
    if (isProfilerEnabled()) {
      recordEffectExecution(options?.name || 'unnamed', duration);
    }
  }
}
```

### Performance Characteristics

**Overhead When Enabled**:
- Each effect execution: 1 boolean check + Map operations
- Map get/set: O(1) average case
- Arithmetic: negligible
- Total: ~1-2 microseconds per effect execution

**Memory Usage**:
- Per-effect: ~2 numbers (count, totalTime)
- 100 effects: ~2KB
- 1000 effects: ~20KB
- Negligible compared to typical app memory

### Use Cases

**Identify Slow Effects**:
```typescript
// Enable before performance investigation
enableProfiler(true);

// Run your app normally
// Effects automatically tracked

// Get report to find bottlenecks
const report = getProfilerReport();
const slowEffects = Object.entries(report.effects)
  .filter(([_, stats]) => stats.averageTimeMs > 1) // > 1ms average
  .sort((a, b) => b[1].totalTimeMs - a[1].totalTimeMs);
```

**Benchmark Changes**:
```typescript
// Before optimization
enableProfiler(true);
// ... run workload ...

const before = getProfilerReport();

// Apply optimization
// ... make changes ...

// After optimization
enableProfiler(false); // Reset
enableProfiler(true);
// ... run same workload ...

const after = getProfilerReport();

console.log(
  `Total time: ${before.totalTimeMs.toFixed(2)}ms → ${after.totalTimeMs.toFixed(2)}ms`
);
```

**Continuous Monitoring** (Development Only):
```typescript
// Log periodically during development
setInterval(() => {
  if (isProfilerEnabled()) {
    const report = getProfilerReport();
    console.table(report.effects);
  }
}, 5000);
```

## Security
No security concerns. This is a development-only tool that:
- Does not expose sensitive data
- Does not interact with user input
- Only tracks execution performance metrics

## Performance Considerations
- **Zero overhead when disabled**: Single boolean check
- **Linear memory growth**: Scales with number of tracked effects
- **O(1) per recording**: Map operations are constant time
- **Report computation**: O(n) where n = number of tracked effects
- **Not production-ready**: Should be disabled or tree-shaken in production builds

## Edge Cases
- **Zero effects tracked**: Returns zeros for all statistics
- **Single effect**: Reports accurate stats for that effect only
- **Rapid effect executions**: All recorded, totals accumulate correctly
- **Effect name collisions**: Same name aggregates counts/times (expected behavior)
- **Very long effect names**: No limit, but use concise names for readability
- **Profiling while already enabled**: No-op, stays enabled