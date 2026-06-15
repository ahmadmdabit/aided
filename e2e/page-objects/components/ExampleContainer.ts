import { Selector, t } from 'testcafe';

/**
 * Page Object for Example Container
 * Encapsulates interactions with the main content area where examples are rendered
 */
export class ExampleContainer {
  readonly mainContent: Selector;
  readonly infoPanel: Selector;

  constructor() {
    this.mainContent = Selector('.content');
    this.infoPanel = Selector('.info-panel');
  }

  /**
   * Verify that an example is loaded
   */
  async isExampleLoaded(): Promise<boolean> {
    return this.mainContent.exists;
  }

  /**
   * Check for JavaScript errors in the console
   * This is a basic check - in a real scenario, you might want to capture console errors
   */
  async hasJavaScriptErrors(): Promise<boolean> {
    // Check if there are any error messages in the page
    const errorElements = Selector('[role="alert"]').withText('Error');
    return errorElements.exists;
  }

  /**
   * Wait for the example to be fully rendered
   */
  async waitForExampleToLoad(timeout: number = 10000): Promise<void> {
    await t.expect(this.mainContent.exists).ok({ timeout });
  }

  /**
   * Get the text content of the main content area
   */
  async getMainContentText(): Promise<string> {
    return this.mainContent.textContent;
  }

  /**
   * Check if info panel is visible
   */
  async isInfoPanelVisible(): Promise<boolean> {
    return this.infoPanel.visible;
  }
}
