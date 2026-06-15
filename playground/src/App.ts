import { h, createSignal, createMemo, For } from 'aided-core';
import { examples } from './examples';
import { exampleMetadata } from './examples/metadata';
import { ExampleCard } from './components/ExampleCard';
import { SearchAndFilter } from './components/SearchAndFilter';
import { InfoPanel } from './components/InfoPanel';

type ExampleName = keyof typeof examples;

export function App() {
  const exampleNames = Object.keys(examples) as ExampleName[];
  const [activeTab, setActiveTab] = createSignal<ExampleName>(exampleNames[0]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal<'All' | 'Basics' | 'Reactivity' | 'Forms' | 'Lists' | 'UI Components' | 'Apps' | 'Context' | 'Async' | 'Performance'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = createSignal<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = createSignal(false);

  // --- THE FIX ---
  // Instead of a memo that returns a component, create a memo that returns
  // an array containing only the key of the active component.
  const activeTabAsArray = createMemo(() => [activeTab()]);

  // Filter examples based on search and filters
  const filteredExamples = createMemo(() => {
    return exampleNames.filter(name => {
      const metadata = exampleMetadata[name];
      if (!metadata) return false;

      // Search filter
      const query = searchQuery().toLowerCase();
      const matchesSearch = !query ||
        metadata.title.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(query)) ||
        metadata.concepts.some(concept => concept.toLowerCase().includes(query));

      // Category filter
      const category = selectedCategory();
      const matchesCategory = category === 'All' || metadata.category.includes(category);

      // Difficulty filter
      const difficulty = selectedDifficulty();
      const matchesDifficulty = difficulty === 'all' || metadata.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  });

  const Sidebar = () => h.aside(
    { class: 'sidebar u-scroll hover-scrollbar' }, // invisible-scrollbar
    h.div({
      style: {
        'display': 'flex',
        'flex-direction': 'row',
        'justify-content': 'space-between',
        'align-items': 'center',
        'padding': '0 var(--gap-4)',
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
      h.h2({ style: { marginBottom: 0 }},'Aided Playground')
    ),

    // Search and Filter Component
    SearchAndFilter({
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedDifficulty,
      setSelectedDifficulty,
      totalResults: exampleNames.length,
      filteredCount: () => filteredExamples().length
    }),

    // Examples List
    h.nav(
      For({
        each: filteredExamples,
        key: (name) => name,
        children: (nameSignal) => {
          const name = nameSignal();
          const metadata = exampleMetadata[name];
          if (!metadata) return null;

          return ExampleCard({
            name,
            metadata,
            isActive: () => activeTab() === name,
            onClick: () => {
              setActiveTab(name);
              setShowInfoPanel(true);
            }
          });
        }
      })
    )
  );

  return h.div(
    { class: 'playground-layout' },
    Sidebar(),
    h.main(
      { class: 'content u-scroll hover-scrollbar' }, // invisible-scrollbar
      // Use the `For` component to manage the lifecycle.
      For({
        each: activeTabAsArray,
        key: (name) => name, // The key is the tab name ('Virtual List', etc.)
        children: (nameSignal) => {
          // Look up the component function based on the current name
          const ComponentToRender = examples[nameSignal() as ExampleName];
          // Execute it. `For` will manage its lifecycle correctly.
          return ComponentToRender();
        }
      })
    ),

    // Info Panel
    InfoPanel({
      metadata: () => exampleMetadata[activeTab()],
      isVisible: showInfoPanel,
      onClose: () => setShowInfoPanel(false)
    })
  );
}
