import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for Toaster Example
 */
export class ToasterPage extends PlaygroundPage {
  readonly addSuccessButton: Selector;
  readonly addErrorButton: Selector;
  readonly addWarningButton: Selector;
  readonly clearAllButton: Selector;
  readonly toasterContainer: Selector;
  readonly notifications: Selector;

  constructor() {
    super();
    this.addSuccessButton = Selector('[data-testid="add-toast-success"]');
    this.addErrorButton = Selector('[data-testid="add-toast-error"]');
    this.addWarningButton = Selector('[data-testid="add-toast-warning"]');
    this.clearAllButton = Selector('[data-testid="clear-all-toasts"]');
    this.toasterContainer = Selector('.notification-toaster');
    this.notifications = Selector('.notification');
  }

  /**
   * Add a success toast
   */
  async addSuccessToast(): Promise<void> {
    await t.click(this.addSuccessButton);
  }

  /**
   * Add an error toast
   */
  async addErrorToast(): Promise<void> {
    await t.click(this.addErrorButton);
  }

  /**
   * Add a warning toast
   */
  async addWarningToast(): Promise<void> {
    await t.click(this.addWarningButton);
  }

  /**
   * Clear all toasts
   */
  async clearAllToasts(): Promise<void> {
    await t.click(this.clearAllButton);
  }

  /**
   * Get the count of visible notifications
   */
  async getNotificationCount(): Promise<number> {
    return this.notifications.count;
  }

  /**
   * Get text content of a notification by index
   */
  async getNotificationText(index: number): Promise<string> {
    return this.notifications.nth(index).textContent;
  }

  /**
   * Dismiss a notification by clicking it
   */
  async dismissNotification(index: number): Promise<void> {
    const notification = this.notifications.nth(index);
    await t.click(notification);
  }

  /**
   * Wait for a notification to appear
   */
  async waitForNotificationToAppear(timeout: number = 5000): Promise<void> {
    await t.expect(this.notifications.count).gt(0, { timeout });
  }

  /**
   * Wait for all notifications to be dismissed
   */
  async waitForNotificationsToDismiss(timeout: number = 10000): Promise<void> {
    await t.expect(this.notifications.count).eql(0, { timeout });
  }
}
