import { h, createSignal, createMemo, createResource, For } from "aided-core";
import { renderMarkdown } from "../utils/markdown";
import { navigate } from "../router";
import { DocumentNode } from "./types";
import { rootNodes, FlatDocuments, defaultDocumentId } from "./parser";
import { injectStyles } from "../utils/dom";
import { CodeSnippet } from "../components/CodeSnippet";
import documentStyles from "./styles.css?inline";

const StyleId = "documentation-comp-styles";

const LoadingIndicatorStyleId = 'aided-loading-indicator-styles';

const LoadingIndicatorStyles = `
    .loading-indicator {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border-left-color: var(--accent);
      animation: spin 1s ease infinite;
      margin: 0 auto; /* Center the loading-indicator */
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

const LoadingIndicator = () => {
  injectStyles(LoadingIndicatorStyleId, LoadingIndicatorStyles);
  return h.div({ class: 'loading-indicator', 'data-testid': 'loading-indicator' });
}

export function Documentation() {
  injectStyles(StyleId, documentStyles);

  const [activeDocumentId, setActiveDocumentId] = createSignal<string>(defaultDocumentId);

  const activeDocument = createMemo(() => {
    return FlatDocuments.get(activeDocumentId()) || { filename: "README.md", path: "documentation/core/README.md" };
  });

  const documentContent = createResource(
    () => activeDocument().path,
    async (path) => {
      const fetched = await fetch(path);
      if (!fetched.ok) {
        throw new Error(`Could not load document (${fetched.statusText})`);
      }
      return fetched.text();
    }
  );

  // RECURSIVE COMPONENT: Renders nodes as nested list nodes or file cards
  const RenderTree = (nodes: DocumentNode[]): HTMLElement => {
    return h.ul(
      { class: "document-tree" },
      For({
        each: () => nodes,
        key: (node) => node.id,
        children: (nodeSignal) => {
          const node = nodeSignal();
          if (node.type === "directory") {
            return h.li(
              { class: "document-tree-item" },
              h.details(
                { open: true, class: "document-details" },
                h.summary({ class: "document-folder" }, node.title),
                h.div({ class: "document-folder-content" }, RenderTree(node.children || []))
              )
            );
          } else {
            return h.li(
              { class: "document-tree-item" },
              h.button(
                {
                  class: "document-card",
                  classList: { active: () => activeDocumentId() === node.id },
                  onClick: () => setActiveDocumentId(node.id)
                },
                h.h3(`${node.icon} ${node.title}`),
                h.p(`File: ${node.filename}`)
              )
            );
          }
        }
      })
    );
  };

  const Sidebar = () => h.aside(
    { class: "document-sidebar u-scroll hover-scrollbar" },
    h.div({ class: "document-header-brand" },
      h.img({
        src: "/assets/aided.png",
        width: 48,
        alt: "Aided Logo"
      }),
      h.h2({ style: { margin: 0, fontSize: "var(--font-size-h2)" } }, "Aided Documentation")
    ),
    h.div(
      h.button({
        class: "document-card",
        style: {
          backgroundColor: "var(--bg-button)",
          borderColor: "var(--border-color-light)"
        },
        onClick: () => navigate("/")
      }, "🎮 Back to Playground")
    ),
    h.nav(
      { class: "document-nav" },
      RenderTree(rootNodes) // Call the recursive renderer initially with the roots
    )
  );

  const ContentViewer = () => h.main(
    { class: "document-content u-scroll hover-scrollbar" },
    h.div(
      { class: "document-viewer" },
      () => {
        if (documentContent.loading()) {
          return h.div({ class: "document-loading" }, LoadingIndicator);
        }
        if (documentContent.error()) {
          return h.div({ class: "document-error" }, String(documentContent.error()));
        }
        return h.article({
          class: "markdown-body",
          ref: (el: HTMLElement) => {
            el.innerHTML = renderMarkdown(documentContent() || "");

            // Query all newly rendered markdown code blocks and replace with CodeSnippet components
            el.querySelectorAll('pre').forEach((pre) => {
              const code = pre.querySelector('code');
              const textToCopy = code ? code.textContent || '' : '';
              const language = code ? code.className.split('-')[1] || 'plaintext' : 'plaintext';

              const snippet = CodeSnippet({
                code: textToCopy,
                language,
                title: '💻 Toggle Code Snippet',
                expanded: true,
                showLanguage: true,
              });

              pre.replaceWith(snippet);
            });
          }
        });
      }
    )
  );

  return h.div(
    { class: "document-layout" },
    Sidebar(),
    ContentViewer()
  );
}
