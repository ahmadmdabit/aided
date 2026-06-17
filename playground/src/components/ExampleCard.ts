import { h } from 'aided-core';
import { ExampleMetadata } from '../examples/metadata';
import { injectStyles } from '../utils/dom';

const STYLE_ID = 'example-card-styles';

const cardStyles = `
  .example-card {
    display: block;
    width: 100%;
    padding: var(--gap-3) var(--gap-4);
    margin-bottom: var(--gap-2);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .example-card:hover {
    background: var(--bg-button-hover);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .example-card.active {
    background: var(--accent);
    color: var(--bg-surface);
    border-color: var(--accent);
  }

  .example-card.active:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  .example-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--gap-2);
  }

  .example-card-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    margin: 0;
    color: inherit;
  }

  .example-card-meta {
    display: flex;
    align-items: center;
    gap: var(--gap-2);
    font-size: var(--font-size-xs);
    opacity: 0.8;
  }

  .difficulty-badge {
    padding: 0.125em 0.5em;
    border-radius: var(--radius-sm);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--status-success-bg);
    color: var(--status-success-text);
  }

  .time-estimate {
    color: var(--text-muted);
  }

  .example-card.active .time-estimate {
    color: var(--bg-input);
  }

  .example-card-description {
    font-size: var(--font-size-sm);
    line-height: 1.4;
    margin-bottom: var(--gap-2);
    color: inherit;
    opacity: 0.9;
  }

  .example-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-1);
  }

  .tag {
    padding: 0.125em 0.375em;
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  .example-card.active .tag {
    color: var(--bg-input);
  }

  .example-card-concepts {
    margin-top: var(--gap-2);
    padding-top: var(--gap-2);
    font-size: var(--font-size-xs);
    opacity: 0.7;
  }

  .example-card.active .example-card-concepts {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .concepts-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-1);
    margin-top: var(--gap-1);
  }

  .concept-item {
    color: var(--text-muted);
    padding: 0.125em 0.25em;
    border-radius: var(--radius-sm);
    font-family: ui-monospace, monospace;
    font-size: 0.75em;
  }

  .example-card.active .concept-item {
    color: var(--bg-input);
  }
`;

// function getDifficultyIcon(difficulty: string) {
//   switch (difficulty) {
//     case 'beginner': return '⭐';
//     case 'intermediate': return '⭐⭐';
//     case 'advanced': return '⭐⭐⭐';
//     default: return '⭐';
//   }
// }

export function ExampleCard({
  name,
  metadata,
  isActive,
  onClick
}: {
  name: string;
  metadata: ExampleMetadata;
  isActive: boolean | (() => boolean);
  onClick: () => void;
}) {
  injectStyles(STYLE_ID, cardStyles);

  console.log('ExampleCard: ', name);

  const classList = {
    'example-card': true,
    'active': typeof isActive === 'function' ? isActive : () => isActive
  };

  return h.a(
    {
      'data-testid': `nav-button-${name}`,
      classList,
      onClick,
      type: 'button'
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
          `${metadata.difficulty}` // ${getDifficultyIcon(metadata.difficulty)}
        ),
        h.span({ class: 'time-estimate' }, metadata.estimatedTime)
      )
    ),
    h.p({ class: 'example-card-description' }, metadata.description),
    h.div(
      { class: 'example-card-tags' },
      ...metadata.tags.slice(0, 3).map(tag =>
        h.span({ class: 'tag' }, `#${tag}`)
      )
    ),
    h.div(
      { class: 'example-card-concepts' },
      h.small('Key concepts:'),
      h.div(
        { class: 'concepts-list' },
        ...metadata.concepts.slice(0, 4).map(concept =>
          h.div({ class: 'concept-item' }, concept)
        )
      )
    )
  );
}
