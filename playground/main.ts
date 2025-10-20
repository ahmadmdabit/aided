/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, render, createSignal, VirtualFor } from '@aided/core'; // , createMemo

type Row = { id: number; text: string };

function makeData(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: i, text: `Item ${i}` }));
}

function App() {
  const [size, setSize] = createSignal<number>(100000);
  const [itemHeight, setItemHeight] = createSignal<number>(30);
  const [overscan, setOverscan] = createSignal<number>(5);

  const [items, setItems] = createSignal<Row[]>(makeData(size()));

  const placeholder = h.div({ class: 'placeholder' }, 'No items…');

  // For stats we can infer the window by observing scroll offset and height.
  // Since visibleState is internal to virtualizer, we will compute coarse stats from DOM.
  const [scrollIndex, setScrollIndex] = createSignal<number>(0);

  function applySize(n: number) {
    setSize(n);
    setItems(makeData(n));
  }

  function addItem() {
    const list = items().slice();
    const id = list.length ? list[list.length - 1].id + 1 : 0;
    list.push({ id, text: `Item ${id}` });
    setItems(list);
  }

  function removeItem() {
    const list = items().slice();
    list.pop();
    setItems(list);
  }

  function shuffleFew() {
    const list = items().slice();
    if (list.length > 3) {
      console.log('shuffleFew', JSON.stringify(list));
      const i = Math.floor(list.length / 2);
      const tmp = list[i];
      list[i] = list[i + 1];
      list[i + 1] = tmp;
      console.log('shuffleFew', JSON.stringify(list));
      setItems(list);
      console.log('shuffleFew', JSON.stringify(items()));
    }
  }

  // A container ref to support scroll-to-index
  let containerRef: HTMLElement | null = null;

  function scrollToIndex() {
    const idx = Math.max(0, Math.min(items().length - 1, scrollIndex()));
    if (containerRef) {
      containerRef.scrollTop = idx * itemHeight();
    }
  }

  const controls = h.div(
    { class: 'panel controls' },
    h.h3('VirtualFor Playground'),
    h.label('Dataset'),
    h.div(
      h.button({ onClick: () => applySize(0) }, 'Empty'),
      h.button({ onClick: () => applySize(100) }, '100'),
      h.button({ onClick: () => applySize(10000) }, '10k'),
      h.button({ onClick: () => applySize(100000) }, '100k'),
    ),
    h.label('Mutations'),
    h.div(
      h.button({ onClick: addItem }, 'Add 1'),
      h.button({ onClick: removeItem }, 'Remove 1'),
      h.button({ onClick: shuffleFew }, 'Swap middle pair'),
    ),
    h.label('Item height (px)'),
    h.input({
      type: 'number',
      value: itemHeight,
      min: '1',
      step: '1',
      onInput: (e: any) => setItemHeight(parseInt(e.currentTarget.value || '1', 10) || 1),
    }),
    h.label('Overscan'),
    h.input({
      type: 'number',
      value: overscan,
      min: '0',
      step: '1',
      onInput: (e: any) => setOverscan(Math.max(0, parseInt(e.currentTarget.value || '0', 10) || 0)),
    }),
    h.label('Scroll to index'),
    h.input({
      type: 'number',
      value: scrollIndex,
      min: '0',
      step: '1',
      onInput: (e: any) => setScrollIndex(parseInt(e.currentTarget.value || '0', 10) || 0),
    }),
    h.button({ onClick: scrollToIndex }, 'Go'),
    h.div({ class: 'stats' },
      'Items: ', () => String(items().length), ' | ',
      'ItemHeight: ', () => String(itemHeight()), ' | ',
      'Overscan: ', () => String(overscan()),
    ),
  );

  const list = VirtualFor<Row>({
    each: items,
    itemHeight: itemHeight(),
    overscan: overscan(),
    class: 'scroller',
    style: { height: '100%' },
    placeholder,
    children: (item, index) =>
      h.div({ class: 'row', role: 'listitem', style: { height: () => `${itemHeight()}px` } },
        `${index}: id=${item.id} text=${item.text}`
      ),
  });

  // Hook container ref for scrollToIndex
  // Since VirtualFor returns the container element, we can keep a ref after it's created.
  containerRef = list;

  return h.div(
    { class: 'app' },
    controls,
    list,
  );
}

// --- Render the Component ---
const appRoot = document.getElementById('app');
if (appRoot) {
  // The 'render' function mounts the component and sets up the lifecycle
  const disposeApp = render(App, appRoot);

  // To prove cleanup works, you could add a button to call `disposeApp()`
  // which would unmount the component and stop all reactive updates.

  // Make the variable "used" for the linter
  console.log('Aided app rendered. To unmount, run `window.disposeApp()` in the console.');
  (window as any).disposeApp = disposeApp;
}
