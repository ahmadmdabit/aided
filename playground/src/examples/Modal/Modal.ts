import { h, Show, Portal, onCleanup } from 'aided-core';

const WIDGET_STYLE_ID = 'aided-modal-styles';

const widgetCSS = `
  /* Styles for the Portaled Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: #585858;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    max-width: 500px;
    width: 90%;
  }
  .modal-close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: 1px solid white;
    padding: .3rem;
    font-size: 1.5rem;
    line-height: .6;
    cursor: pointer;
  }
`;

function injectModalStyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

/**
 * A reusable Modal component.
 *
 * @param {object} props
 * @param {() => boolean} props.when - A signal that controls the modal's visibility.
 * @param {() => void} props.onClose - A function to call when the modal should be closed.
 * @param {HTMLElement | HTMLElement[]} props.children - The content to render inside the modal.
 */
export function Modal(props) {
  injectModalStyles();

  const { when, onClose, children } = props;

  // --- Side Effect for Keyboard Control ---
  // We use a Show component to add/remove the event listener only when the modal is open.
  const EscapeHandler = () => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // onCleanup is crucial for removing the global event listener to prevent memory leaks.
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });

    return null; // This component renders nothing, it's just for the side effect.
  };

  // The main render logic for the modal
  return Show({
    when: when,
    children: () => {
      // --- THE FIX ---
      // Invoke the side-effect component here. Its return value (null) is discarded.
      // Its logic (adding/removing the event listener) is still tied to this
      // Show component's lifecycle via onCleanup.
      EscapeHandler();

      // Now, return the UI structure. The side-effect component is not part of the children array.
      // 1. Portal the entire modal structure to the document.body.
      return Portal({
        mount: document.body,
        children: h.div(
          { 'data-testid': 'modal-overlay', class: 'modal-backdrop', onClick: onClose },
          h.div(
            {
              class: 'modal-content',
              // Stop clicks inside the modal from bubbling up to the backdrop and closing it.
              onClick: (e) => e.stopPropagation()
            },
            h.button({ 'data-testid': 'modal-close-button', class: 'modal-close-btn', onClick: onClose }, '×'),
            children,
          )
        )
      });
    }
  });
}