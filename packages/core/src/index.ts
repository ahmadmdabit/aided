// Core Reactivity Primitives
export { createSignal } from './primitives/signal';
export { createEffect } from './primitives/effect';
export { createMemo } from './primitives/memo';
export { createResource } from './primitives/resource';
export { longestIncreasingSubsequenceAsync } from './primitives/lisAsync'; // Add this

// NEW: Configuration
export { configureLIS } from './internal/lis';

// Lifecycle & Context
export { createRoot, onCleanup, hasOwner, provide, inject as useContext } from './lifecycle/lifecycle';
export { createContext } from './lifecycle/context';

// DOM
export { render } from './dom/render';
export { bindText, bindAttr, bindEvent, bindClassList, bindStyle, Model } from './dom/bindings';
export { scopeQuery } from './dom/query';

// Components (Control Flow)
export { Show } from './components/Show';
export { For } from './components/For';
export { VirtualFor } from './components/VirtualFor';
export { createVirtualizer } from './components/virtualizer';
export { Fragment } from './components/Fragment';
export { Portal } from './components/Portal';

export { h } from './h';


// Errors
export { AidedError } from './error';

// Types
export * from './types'; // Export all types
