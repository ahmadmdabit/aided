/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, createSignal, createMemo, For } from 'aided-core';
import { examples } from './examples';
import { exampleMetadata } from './examples/metadata';

type ExampleName = keyof typeof examples;

export function App() {
  const exampleNames = Object.keys(examples) as ExampleName[];
  const [activeTab, setActiveTab] = createSignal<ExampleName>(exampleNames[0]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory] = createSignal<'All' | 'Basics' | 'Reactivity' | 'Forms' | 'Lists' | 'UI Components' | 'Apps' | 'Context' | 'Async' | 'Performance'>('All');
  const [selectedDifficulty] = createSignal<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

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
      h.h2({ style: { marginBottom: 0 }},'Aided Playground')
    ),

    // Simple search input
    h.div(
      { class: 'search-input-container' },
      h.span({ class: 'search-icon' }, '🔍'),
      h.input({
        type: 'text',
        class: 'search-input',
        placeholder: '',
        value: searchQuery(),
        onInput: (e: any) => setSearchQuery(e.target.value)
      })
    ),

    // Examples List - Simple version
    h.nav(
      ...filteredExamples().map(name => {
        const metadata = exampleMetadata[name];
        if (!metadata) return null;

        return h.button(
          {
            classList: {
              'example-card': true,
              'active': activeTab() === name
            },
            onClick: () => setActiveTab(name)
          },
          h.div(
            { class: 'example-card-header' },
            h.h3({ class: 'example-card-title' }, metadata.title),
            h.div(
              { class: 'example-card-meta' },
              h.span(
                {
                  class: `difficulty-badge difficulty-${metadata.difficulty}`
                },
                `${metadata.difficulty} • ${metadata.estimatedTime}`
              )
            )
          ),
          h.p({ class: 'example-card-description' }, metadata.description),
          h.div(
            { class: 'example-card-tags' },
            ...metadata.tags.slice(0, 3).map(tag =>
              h.span({ class: 'tag' }, `#${tag}`)
            )
          )
        );
      }).filter(Boolean)
    )
  );

  // Active tab as array for For component
  const activeTabAsArray = createMemo(() => [activeTab()]);

  return h.div(
    { class: 'playground-layout' },
    Sidebar(),
    h.main(
      { class: 'content' },
      For({
        each: activeTabAsArray,
        key: (name) => name,
        children: (nameSignal) => {
          const ComponentToRender = examples[nameSignal() as ExampleName];
          return ComponentToRender();
        }
      })
    )
  );
}
