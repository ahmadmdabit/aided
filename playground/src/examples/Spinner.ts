import { h } from "aided-core";
import { CodeSnippet } from '../components/CodeSnippet';

const spinnerCode = `.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border-left-color: rgba(255, 117, 25, 1);
  animation: spin 1s ease infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

const Spinner = () => h.div({ class: 'spinner' });`;

const WIDGET_STYLE_ID = 'aided-spinner-styles';

const widgetCSS = `
  /* ... all previous styles ... */
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border-left-color: rgba(255, 117, 25, 1);
    animation: spin 1s ease infinite;
    margin: 0 auto; /* Center the spinner */
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function injectSpinnerStyles() {
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

// --- UI Helper: Spinner Component ---
export const Spinner = () => {
  injectSpinnerStyles();
  return h.div(
    h.div({ class: 'spinner', 'data-testid': 'spinner' }),
    CodeSnippet({ code: spinnerCode, language: 'css' })
  );
}
