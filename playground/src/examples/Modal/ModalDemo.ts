import { h, createSignal } from 'aided-core';
import { Modal } from './Modal';

const WIDGET_STYLE_ID = 'aided-modal-demo-styles';

const widgetCSS = `
  body { font-family: sans-serif; }
  .app-container { padding: 2rem; background-color: #585858ff; border-radius: 8px; }
`;

function injectModalDemoStyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

export function ModalDemo() {
  injectModalDemoStyles();

  // 1. State to control the modal's visibility.
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return h.div(
    { class: 'app-container' },
    h.h1('Aided Portal Example'),
    h.p('This is the main application content. The modal will render outside of this container.'),
    h.button({ onClick: openModal }, 'Open Modal'),

    // 2. Use the Modal component here.
    // It's logically a child of this div, but it will render elsewhere.
    Modal({
      when: isModalOpen,
      onClose: closeModal,
      children: [
        h.h2('Modal Title', { style: 'text-align: center;' }),
        h.p('This content is rendered in a portal at the end of document.body.'),
        h.p('You can press the Escape key or click the backdrop to close it.'),
        h.button({ onClick: closeModal }, 'Close From Inside')
      ]
    })
  );
}
