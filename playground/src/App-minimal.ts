import { h, createSignal, createMemo, For } from 'aided-core';
import { examples } from './examples';

type ExampleName = keyof typeof examples;

export function App() {
  const exampleNames = Object.keys(examples) as ExampleName[];
  const [activeTab, setActiveTab] = createSignal<ExampleName>(exampleNames[0]);

  // --- THE FIX ---
  // Instead of a memo that returns a component, create a memo that returns
  // an array containing only the key of the active component.
  const activeTabAsArray = createMemo(() => [activeTab()]);

  const Sidebar = () => h.aside(
    { class: 'sidebar' },
    h.div({
      style: {
        'display': 'flex',
        'flex-direction': 'row',
        'justify-content': 'space-around',
        'align-items': 'center'
      }
    },
      h.a({
        href: '#',
        target: '_blank',
      },
        h.img({
          src: '/assets/aided.png',
          width: 48,
          alt: 'Aided Logo',
        })),
      h.h2({ style: { marginBottom: 0 }},'Aided Demos')
    ),
    h.nav(
      exampleNames.map(name =>
        h.button(
          {
            onClick: () => setActiveTab(name),
            classList: { active: () => activeTab() === name }
          },
          name
        )
      )
    )
  );

  return h.div(
    { class: 'playground-layout' },
    Sidebar(),
    h.main(
      { class: 'content' },
      // Use the `For` component to manage the lifecycle.
      For({
        each: activeTabAsArray,
        key: (name) => name, // The key is the tab name ('Virtual List', etc.)
        children: (nameSignal) => {
          // Look up the component function based on the current name
          const ComponentToRender = examples[nameSignal()];
          // Execute it. `For` will manage its lifecycle correctly.
          return ComponentToRender();
        }
      })
    )
  );
}
