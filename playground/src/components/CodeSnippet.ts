import { h } from 'aided-core';
import Prism from 'prismjs';
import { injectStyles } from '../utils/dom';
import snippetStyles from './CodeSnippet.css?inline';

const STYLE_ID = 'code-snippet-styles';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  expanded?: boolean;
  showLanguage?: boolean;
}

export function CodeSnippet({
  code,
  language = 'javascript',
  title = '💻 Toggle Code Snippet',
  expanded = false,
  showLanguage = true,
}: CodeSnippetProps): HTMLElement {
  injectStyles(STYLE_ID, snippetStyles);

  const handleCopy = (e: MouseEvent) => {
    navigator.clipboard.writeText(code);
    const btn = e.currentTarget as HTMLElement;
    btn.textContent = '✔️ Copied!';
    btn.style.borderColor = 'var(--accent)';
    setTimeout(() => {
      btn.textContent = '📋 Copy';
      btn.style.borderColor = '';
    }, 1500);
  };

  const handleMouseEnter = (e: MouseEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleMouseLeave = (e: MouseEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '0.7';
  };

  return h.details(
    {
      class: 'code-snippet-wrapper',
      ...(expanded ? { open: true } : {}),
    },
    h.summary({ class: 'code-snippet-summary' }, title),
    h.div(
      { class: 'code-snippet-box' },
      h.div(
        { class: 'code-snippet-toolbar' },
        h.button(
          {
            class: 'code-snippet-copy-btn',
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: handleCopy,
          },
          '📋 Copy'
        ),
        showLanguage
          ? h.button(
            { class: 'code-snippet-language-btn' },
            language
          )
          : null
      ),
      h.pre(
        { class: 'code-snippet-pre code-preview u-scroll' },
        h.code({
          class: `language-${language}`,
          ref: (el: HTMLElement) => {
            el.innerHTML = Prism.highlight(
              code,
              Prism.languages[language] || Prism.languages.javascript,
              language
            );
          },
        })
      )
    )
  );
}
