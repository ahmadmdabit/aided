import { marked } from "marked";
import DOMPurify from "dompurify";
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';

// Markdown renderer ........................................

// Configure marked
marked.setOptions({
  async: false,
  breaks: true,           // GFM line breaks
  gfm: true,              // GitHub Flavored Markdown
});

// Configure marked with a custom PrismJS code-fence renderer
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = lang || "plaintext";
      if (language && Prism.languages[language]) {
        try {
          const highlighted = Prism.highlight(text, Prism.languages[language], language);
          return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
        } catch (e) {
          // Fallback on formatting error
          console.warn('Highlight error:', e);
        }
      }
      // Sanitized fallback for plain code
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `<pre class="language-plaintext"><code class="language-plaintext">${escapedText}</code></pre>`;
    }
  }
});

/**
 * Render Markdown to sanitized HTML
 * @param {string} md - Markdown string
 * @returns {string} Sanitized HTML
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";

  // Parse markdown to HTML
  const rawHtml = marked.parse(String(md)) as string;
  
  // Sanitize with DOMPurify - allow only safe tags/attributes
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "em", "b", "i", "u", "s", "sub", "sup",
      "code", "pre", "blockquote",
      "ul", "ol", "li",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",     // For table-wrap div, etc.
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt",
      "style",           // For table alignment
      "data-lang",       // For code blocks
      "class",           // For any utility classes
    ],
    ADD_ATTR: ["target", "rel"],  // Ensure these are allowed on links
    FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });

  return cleanHtml;
}
// ........................................
