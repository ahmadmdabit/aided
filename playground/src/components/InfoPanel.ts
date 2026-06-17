/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, Show, createSignal, onCleanup } from 'aided-core';
import type { SignalGetter } from 'aided-core';
import { ExampleMetadata } from '../examples/metadata';
import { injectStyles } from '../utils/dom';

const STYLE_ID = 'info-panel-styles';

const panelStyles = `
  .info-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: 80vh;
    background: var(--bg-panel);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    overflow: hidden;
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease;
  }

  .info-panel.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .info-panel-header {
    padding: var(--gap-4);
    background: var(--bg-sidebar);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: grab;
    user-select: none;
  }

  .info-panel-header:active {
    cursor: grabbing;
  }

  .info-panel.collapsed {
    max-height: 60px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .info-panel.collapsed .info-panel-content {
    display: none !important;
  }

  .info-panel-title {
    font-size: var(--font-size-h3);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .info-panel-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0 var(--gap-1) var(--gap-2);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    line-height: .6;
    margin: 0;
  }

  .info-panel-close:hover {
    background: var(--bg-button);
    color: var(--text-primary);
  }

  .info-panel-content {
    padding: var(--gap-4);
    max-height: calc(80vh - 80px);
    overflow-y: auto;
  }

  .info-panel-description {
    font-size: var(--font-size-base);
    line-height: 1.5;
    color: var(--text-secondary);
    margin-bottom: var(--gap-4);
  }

  .info-panel-section {
    margin-bottom: var(--gap-4);
  }

  .info-panel-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--gap-2);
    display: flex;
    align-items: center;
    gap: var(--gap-1);
  }

  .difficulty-badge {
    padding: 0.125em 0.5em;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
    background: var(--status-success-bg);
    color: var(--status-success-text);
  }

  .time-badge {
    background: var(--bg-input);
    color: var(--text-secondary);
    padding: 0.125em 0.5em;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
  }

  .concepts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-1);
  }

  .concept-item {
    color: var(--text-secondary);
    padding: var(--gap-1) var(--gap-2);
    border-radius: var(--radius-sm);
    font-family: ui-monospace, monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }

  .objectives-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .objective-item {
    padding: var(--gap-1) 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: flex-start;
    gap: var(--gap-2);
  }

  .objective-item:last-child {
    border-bottom: none;
  }

  .objective-bullet {
    color: var(--accent);
    font-weight: bold;
    flex-shrink: 0;
  }

  .related-examples {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-1);
  }

  .related-example {
    background: var(--bg-button);
    color: var(--text-secondary);
    padding: var(--gap-1) var(--gap-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    text-decoration: none;
    border: 1px solid var(--border-color-light);
    transition: all 0.2s ease;
  }

  .related-example:hover {
    background: var(--bg-button-hover);
    border-color: var(--accent);
    color: var(--accent);
  }

  .code-preview {
    background: var(--bg-input);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    padding: var(--gap-3);
    font-family: ui-monospace, monospace;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    overflow-x: auto;
    white-space: pre;
    margin-top: var(--gap-2);
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-1);
  }

  .tag-item {
    color: var(--text-muted);
    padding: 0.125em 0.5em;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
  }

  @media (max-width: 768px) {
    .info-panel {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      max-height: 100vh;
      border-radius: 0;
      transform: translateX(100%);
    }

    .info-panel.visible {
      transform: translateX(0);
    }
  }
`;

function makeDraggable(panelEl: HTMLElement, headerEl: HTMLElement) {
  let startX = 0, startY = 0, currentX = 0, currentY = 0;

  const onPointerDown = (clientX: number, clientY: number) => {
    const rect = panelEl.getBoundingClientRect();
    startX = clientX;
    startY = clientY;
    currentX = rect.left;
    currentY = rect.top;

    panelEl.style.transition = 'none';
    panelEl.style.right = 'auto';
    panelEl.style.left = `${currentX}px`;
    panelEl.style.top = `${currentY}px`;
  };

  // Mouse events
  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    panelEl.style.left = `${currentX + (e.clientX - startX)}px`;
    panelEl.style.top = `${currentY + (e.clientY - startY)}px`;
  };

  const onMouseUp = () => {
    panelEl.style.transition = '';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // Touch events (for mobile/tablet support)
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    panelEl.style.left = `${currentX + (e.touches[0].clientX - startX)}px`;
    panelEl.style.top = `${currentY + (e.touches[0].clientY - startY)}px`;
  };

  const onTouchEnd = () => {
    panelEl.style.transition = '';
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  headerEl.addEventListener('mousedown', onMouseDown);
  headerEl.addEventListener('touchstart', onTouchStart, { passive: true });

  onCleanup(() => {
    headerEl.removeEventListener('mousedown', onMouseDown);
    headerEl.removeEventListener('touchstart', onTouchStart);
    onMouseUp();
    onTouchEnd();
  });
}

export function InfoPanel({
  metadata,
  isVisible,
  onClose
}: {
  metadata: SignalGetter<ExampleMetadata | null>;
  isVisible: SignalGetter<boolean>;
  onClose: () => void;
}) {
  injectStyles(STYLE_ID, panelStyles);

  const [isCollapsed, setIsCollapsed] = createSignal(false);

  let panelRef: HTMLElement | undefined;
  let headerRef: HTMLElement | undefined;

  const setupDrag = () => {
    if (panelRef && headerRef) {
      makeDraggable(panelRef, headerRef);
    }
  };

  return Show({
    when: () => metadata() !== null && isVisible(),
    children: () => {
      const meta = metadata()!;

      return h.div(
        {
          classList: {
            'info-panel': true,
            'visible': isVisible,
            'collapsed': isCollapsed
          },
          ref: (el: HTMLElement) => {
            panelRef = el;
            setupDrag();
          }
        },
        h.div(
          {
            class: 'info-panel-header',
            ref: (el: HTMLElement) => {
              headerRef = el;
              setupDrag();
            }
          },
          h.h2({ class: 'info-panel-title' }, meta.title),
          h.div(
            { style: { display: 'flex', gap: 'var(--gap-2)', alignItems: 'center' } },
            h.button(
              {
                style: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', margin: 0, padding: '0 4px' },
                onClick: () => setIsCollapsed(!isCollapsed())
              },
              () => isCollapsed() ? '✚' : '═'
            ),
            h.button(
              {
                class: 'info-panel-close',
                onClick: onClose,
                'aria-label': 'Close info panel'
              },
              '×'
            )
          )
        ),
        h.div(
          { class: 'info-panel-content u-scroll hover-scrollbar hover-scrollbar' }, // invisible-scrollbar

          // Description
          h.p({ class: 'info-panel-description' }, meta.description),

          // Meta info
          h.div(
            { class: 'info-panel-section' },
            h.div({ class: 'section-title' }, 'Details'),
            h.div(
              {
                style: {
                  display: 'flex',
                  gap: 'var(--gap-2)',
                  marginBottom: 'var(--gap-2)',
                  flexDirection: 'row-reverse',
                }
              },
              h.span(
                { class: `difficulty-badge difficulty-${meta.difficulty}` },
                `${meta.difficulty} • ${meta.estimatedTime}`
              )
            ),
            h.div(
              { class: 'tags-list' },
              ...meta.tags.map(tag => h.span({ class: 'tag-item' }, `#${tag}`))
            )
          ),

          // Key Concepts
          h.div(
            { class: 'info-panel-section' },
            h.div({ class: 'section-title' }, 'Key Concepts'),
            h.div(
              { class: 'concepts-grid' },
              ...meta.concepts.map(concept =>
                h.div({ class: 'concept-item' }, concept)
              )
            )
          ),

          // Learning Objectives
          h.div(
            { class: 'info-panel-section' },
            h.div({ class: 'section-title' }, 'Learning Objectives'),
            h.ul(
              { class: 'objectives-list' },
              ...meta.learningObjectives.map(objective =>
                h.li(
                  { class: 'objective-item' },
                  h.span({ class: 'objective-bullet' }, '▢'),
                  objective
                )
              )
            )
          ),

          // Code Snippet
          meta.codeSnippet ? h.div(
            { class: 'info-panel-section' },
            h.div({ class: 'section-title' }, 'Code Example'),
            h.pre({ class: 'code-preview u-scroll' }, meta.codeSnippet) // invisible-scrollbar
          ) : '',

          // Related Examples
          meta.relatedExamples.length > 0 && h.div(
            { class: 'info-panel-section' },
            h.div({ class: 'section-title' }, 'Related Examples'),
            h.div(
              { class: 'related-examples' },
              ...meta.relatedExamples.map(example =>
                h.a(
                  { class: 'related-example', href: '#', onClick: (e: any) => e.preventDefault() },
                  example
                )
              )
            )
          )
        )
      );
    }
  });
}
