import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for Notification Example
 */
export class NotificationPage extends PlaygroundPage {
  readonly triggerSuccessButton: Selector;
  readonly triggerErrorButton: Selector;
  readonly notificationContainer: Selector;
  readonly notifications: Selector;

  constructor() {
    super();
    this.triggerSuccessButton = Selector('[data-testid="notification-trigger-success"]');
    this.triggerErrorButton = Selector('[data-testid="notification-trigger-error"]');
    this.notificationContainer = Selector('.notification-container');
    this.notifications = Selector('.notification');
  }

  /**
   * Trigger a success notification
   */
  async triggerSuccessNotification(): Promise<void> {
    await t.click(this.triggerSuccessButton);
  }

  /**
   * Trigger an error notification
   */
  async triggerErrorNotification(): Promise<void> {
    await t.click(this.triggerErrorButton);
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
   * Check if a notification is visible
   */
  async isNotificationVisible(index: number): Promise<boolean> {
    return this.notifications.nth(index).visible;
  }

  /**
   * Wait for a notification to be added
   */
  async waitForNotificationToAppear(timeout: number = 5000): Promise<void> {
    await t.expect(this.notifications.count).gt(0, { timeout });
  }

  /**
   * Wait for notifications to be dismissed
   */
  async waitForNotificationsToDismiss(timeout: number = 10000): Promise<void> {
    await t.expect(this.notifications.count).eql(0, { timeout });
  }
}
