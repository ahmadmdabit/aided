import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for Modal Example
 */
export class ModalPage extends PlaygroundPage {
  readonly openModalButton: Selector;
  readonly modal: Selector;
  readonly modalOverlay: Selector;
  readonly modalContent: Selector;
  readonly closeButton: Selector;

  constructor() {
    super();
    this.openModalButton = Selector('[data-testid="modal-open-button"]');
    this.modalOverlay = Selector('[data-testid="modal-overlay"]');
    this.modal = Selector('.modal-content');
    this.modalContent = Selector('.modal-content');
    this.closeButton = Selector('[data-testid="modal-close-button"]');
  }

  /**
   * Open the modal by clicking the button
   */
  async openModal(): Promise<void> {
    await t.click(this.openModalButton);
  }

  /**
   * Close the modal by clicking the close button
   */
  async closeModal(): Promise<void> {
    await t.click(this.closeButton);
  }

  /**
   * Close the modal by clicking the overlay
   */
  async closeModalViaOverlay(): Promise<void> {
    // Wait for the overlay to be visible before clicking
    await t.expect(this.modalOverlay.visible).ok();
    // Click on the overlay (not the modal content)
    // The overlay is the backdrop, so we click on it directly
    await t.click(this.modalOverlay, { offsetX: 10, offsetY: 10 });
    // Wait for the modal to close
    await t.wait(100);
  }

  /**
   * Check if the modal is visible
   */
  async isModalVisible(): Promise<boolean> {
    return this.modal.visible;
  }

  /**
   * Get the modal content text
   */
  async getModalContent(): Promise<string> {
    return this.modalContent.textContent;
  }
}
