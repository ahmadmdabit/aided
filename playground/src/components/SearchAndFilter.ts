/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, bindAttr, Show } from 'aided-core';
import { categories, difficulties, Category, Difficulty } from '../examples/metadata';
import { Select } from './Select';
import { injectStyles } from '../utils/dom';

const STYLE_ID = 'search-filter-styles';

const searchStyles = `
  .search-filter-container {
    padding: var(--gap-4);
    background: var(--bg-sidebar);
    text-align: right;
  }

  .search-input-container {
    position: relative;
    margin-bottom: var(--gap-3);
  }

  .search-input {
    width: 100%;
    padding: var(--gap-2) var(--gap-2) var(--gap-2) 2.5rem;
    background: var(--bg-input);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--font-size-base);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--shadow-focus);
  }

  .search-icon {
    position: absolute;
    left: var(--gap-2);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    pointer-events: none;
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: flex-end;
    gap: var(--gap-2);
    margin-bottom: var(--gap-3);
  }

  .filter-section:last-child {
    margin-bottom: 0;
  }

  .filter-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: var(--gap-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .select-input {
    width: 100%;
    padding: var(--gap-2);
    background: var(--bg-input);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    text-transform: uppercase;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .select-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--shadow-focus);
  }

  .select-input:hover {
    border-color: var(--accent);
  }

  .clear-filters {
    padding: var(--gap-2);
    background: transparent;
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    cursor: pointer;
    margin-top: var(--gap-2);
    transition: all 0.2s ease;
  }

  .clear-filters:hover {
    background: var(--bg-button);
    color: var(--text-primary);
  }

  .results-count {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    margin-top: var(--gap-2);
    text-align: center;
  }
`;

export function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  totalResults,
  filteredCount
}: {
  searchQuery: () => string;
  setSearchQuery: (query: string) => void;
  selectedCategory: () => Category;
  setSelectedCategory: (category: Category) => void;
  selectedDifficulty: () => Difficulty;
  setSelectedDifficulty: (difficulty: Difficulty) => void;
  totalResults: number;
  filteredCount: () => number;
}) {
  injectStyles(STYLE_ID, searchStyles);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('all');
  };

  return h.div(
    { class: 'search-filter-container' },

    // Search Input
    h.div(
      { class: 'search-input-container' },
      h.input({
        type: 'text',
        class: 'search-input',
        placeholder: '',
        onInput: (e: any) => setSearchQuery(e.target.value),
        ref: (el: HTMLInputElement) => {
          bindAttr(el, 'value', searchQuery);
        }
      })
    ),

    // Category Filter
    h.div(
      { class: 'filter-section' },
      h.label({ class: 'filter-label' }, 'Category'),
      Select({
        options: categories.map(cat => ({ value: cat, label: cat })),
        value: selectedCategory,
        onChange: setSelectedCategory
      })
    ),

    // Difficulty Filter
    h.div(
      { class: 'filter-section' },
      h.label({ class: 'filter-label' }, 'Difficulty'),
      Select({
        options: difficulties.map(diff => ({
          value: diff,
          label: diff === 'all' ? 'All Levels' : diff
        })),
        value: selectedDifficulty,
        onChange: setSelectedDifficulty
      })
    ),

    // Clear Filters
    Show({
      when: () => searchQuery() || selectedCategory() !== 'All' || selectedDifficulty() !== 'all',
      children: () => h.button(
        {
          class: 'clear-filters',
          onClick: clearFilters
        },
        'Clear'
      )
    }),

    // Results Count
    h.div(
      { class: 'results-count' },
      () => filteredCount() === totalResults
        ? `Showing all ${totalResults} examples`
        : `Showing ${filteredCount()} of ${totalResults} examples`
    )
  );
}
