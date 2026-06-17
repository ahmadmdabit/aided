# scheduler.ts

**Purpose**: Manages reactive effect scheduling and batching.

## Key Exports

### effectStack
Global stack tracking currently executing effects for dependency tracking.

### dirtyEffects
Set of effects marked for re-execution (automatic deduplication).

### flushQueue
```typescript
flushQueue(): void
```
Schedules microtask to execute all dirty effects.

### cleanup
```typescript
cleanup(effect: Subscriber): void
```
Removes effect from all signal dependency lists.

## Key Concepts
- Batching prevents redundant effect executions
- Microtask scheduling ensures consistent state
- Cleanup prevents memory leaks
- isBatching flag prevents recursive flushes

## Implementation Notes
- Uses queueMicrotask for async scheduling
- Set automatically deduplicates dirty effects
- Cleanup iterates dependencies and removes effect
- Finally block ensures state reset
