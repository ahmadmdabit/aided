/**
 * Aided Core Library - Public API
 *
 * This module exports the complete public API for the Aided reactive UI library.
 * It provides fine-grained reactivity primitives, DOM manipulation utilities,
 * and structural components for building web applications.
 */

// Core Reactivity Primitives
export { createSignal } from './primitives/signal';
export { createEffect } from './primitives/effect';
export { createMemo } from './primitives/memo';
export { untrack } from './primitives/untrack';
export { createResource } from './primitives/resource';
export type { FetcherInfo } from './primitives/resource';
export { longestIncreasingSubsequenceAsync } from './primitives/lisAsync';

// Configuration & Utilities
export { configureLIS } from './internal/lis';

// Lifecycle & Context Management
export { createRoot, onCleanup, hasOwner, provide, inject, inject as useContext } from './lifecycle/lifecycle';
export { createContext } from './lifecycle/context';

// Performance Profiling
export { enableProfiler, getProfilerReport } from './internal/profiler';
export type { ProfilerReport } from './internal/profiler';

// DOM Manipulation & Rendering
export { render } from './dom/render';
export { bindText, bindAttr, bindEvent, bindClassList, bindStyle, Model } from './dom/bindings';
export { scopeQuery } from './dom/query';

// Structural Components (Control Flow)
export { Show } from './components/Show';
export { For } from './components/For';
export { VirtualFor } from './components/VirtualFor';
export { createVirtualizer } from './components/virtualizer';
export { Fragment } from './components/Fragment';
export { Portal } from './components/Portal';

// Hyperscript Helper
export { h } from './h';

// Error Handling
export { AidedError } from './error';

// Type Definitions
export * from './types';
