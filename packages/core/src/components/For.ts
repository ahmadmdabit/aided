import { createEffect } from '../primitives/effect';
import { createRoot, onCleanup } from '../lifecycle/lifecycle';
import { createSignal } from '../primitives/signal';
import { devWarning } from '../error';
import { longestIncreasingSubsequence } from '../internal/lis'; // Import the LIS helper
import type { Disposer, SignalGetter, SignalSetter } from '../types';

type ForProps<T> = {
  each: SignalGetter<T[]>;
  // The children function must return a Node
  children: (item: SignalGetter<T>, index: SignalGetter<number>) => Node;
  // UPDATE THIS LINE: Add the index parameter
  key?: (item: T, index: number) => string | number;
};

type MappedItem<T> = {
  node: Node;
  disposer: Disposer;
  setSignal: SignalSetter<T>;
  setIndex: SignalSetter<number>;
};

export function For<T>(props: ForProps<T>): Node {
  const { each, children, key } = props; // Destructure the new key prop
  const container = document.createDocumentFragment();
  // The endMarker is a stable anchor node in the DOM.
  const endMarker = document.createTextNode('');
  container.appendChild(endMarker);

  // The map now uses `any` for the key, as it can be the item or a string/number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mappedItems = new Map<any, MappedItem<T>>();

  createEffect(() => {
    const newItems = each();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMappedItems = new Map<any, MappedItem<T>>();
    const parent = endMarker.parentNode!;

    // Dev-mode warning if `key` is missing for primitive arrays
    devWarning(
      !!key || !newItems.some(item => typeof item !== 'object' || item === null),
      'The `For` component is being used with an array of primitives without a `key` prop. This can lead to inefficient re-rendering. Please provide a `key` function.'
    );

    // Pass 1: Create new items and update existing ones
    for (let i = 0; i < newItems.length; i++) {
      const itemData = newItems[i];
      const itemKey = key ? key(itemData, i) : itemData;
      let mappedItem = mappedItems.get(itemKey);

      if (!mappedItem) {
        // Item is new, create it within its own lifecycle root.

        // Item is new. Define placeholders for the values we'll create.
        let node: Node;
        let setSignal: SignalSetter<T>;
        let setIndex: SignalSetter<number>;

        // Create a root to manage the lifecycle of this new item.
        // It populates our placeholder variables.
        const disposer = createRoot(() => {
          const [itemSignal, setItemSignal] = createSignal(itemData);
          const [indexSignal, setIndexSignal] = createSignal(i);

          setSignal = setItemSignal;
          setIndex = setIndexSignal;
          node = children(itemSignal, indexSignal);

          // When this item's root is disposed, remove its node from the DOM.
          onCleanup(() => {
            // Check if the node is an Element before calling remove()
            if (node instanceof Element) {
              node.remove();
            } else if (node.parentNode) {
              // Fallback for Text nodes or other node types
              node.parentNode.removeChild(node);
            }
          });
        });

        // Now, construct the MappedItem object with the populated values.
        mappedItem = {
          node: node!, // Add '!' to assert that `node` is not undefined
          disposer: disposer,
          setSignal: setSignal!, // Add '!' to assert that `setSignal` is not undefined
          setIndex: setIndex!, // Add '!' to assert that `setIndex` is not undefined
        };
      } else {
        // Item already exists, update its data and index signals.
        mappedItem.setSignal(itemData);
        mappedItem.setIndex(i);
      }
      newMappedItems.set(itemKey, mappedItem);
    }

    // Pass 2: Remove old items
    for (const [itemKey, item] of mappedItems.entries()) {
      if (!newMappedItems.has(itemKey)) {
        item.disposer(); // This triggers onCleanup which removes the node
      }
    }

    // --- THE UPGRADE: LIS-based Reconciliation ---
    // Pass 3: Perform efficient DOM moves
    if (newItems.length > 0) {
      const oldMap = new Map(Array.from(mappedItems.values()).map((item, i) => [item.node, i]));
      const newNodes = newItems.map((item, i) => newMappedItems.get(key ? key(item, i) : item)!.node);
      
      const seq = newNodes.map(node => oldMap.get(node));
      const lis = longestIncreasingSubsequence(seq.map(i => i === undefined ? -1 : i));

      let cur = lis.length - 1;
      let next: Node | null = endMarker;

      for (let i = newNodes.length - 1; i >= 0; i--) {
        const node = newNodes[i];
        if (seq[i] === undefined) {
          // It's a new node, insert it.
          parent.insertBefore(node, next);
        } else if (cur < 0 || i !== lis[cur]) {
          // It's a moved node.
          parent.insertBefore(node, next);
        } else {
          // It's a stable node.
          cur--;
        }
        next = node;
      }
    }

    // Update the master map for the next run.
    mappedItems = newMappedItems;
  });

  return container;
}
