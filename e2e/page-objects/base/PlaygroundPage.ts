import { Selector, t } from 'testcafe';

/**
 * Base Page Object for the Aided Playground
 * Provides common functionality and selectors for all page objects
 */
export class PlaygroundPage {
  readonly baseUrl: string;
  readonly sidebar: Selector;
  readonly mainContent: Selector;
  readonly logo: Selector;
  readonly title: Selector;

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
    this.sidebar = Selector('.sidebar');
    this.mainContent = Selector('.content');
    this.logo = Selector('img[alt="Aided Logo"]');
    this.title = Selector('h2').withText('Aided Playground');
  }

  /**
   * Navigate to the playground
   */
  async navigateTo(): Promise<void> {
    await t.navigateTo(this.baseUrl);
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad(): Promise<void> {
    await t.expect(this.sidebar.exists).ok('Sidebar should be visible');
    await t.expect(this.mainContent.exists).ok('Main content should be visible');
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(selector: Selector, timeout: number = 10000): Promise<void> {
    await t.expect(selector.exists).ok({ timeout });
  }

  /**
   * Check if an element is visible
   */
  async isElementVisible(selector: Selector): Promise<boolean> {
    return selector.visible;
  }

  /**
   * Get text content of an element
   */
  async getElementText(selector: Selector): Promise<string> {
    return selector.textContent;
  }

  /**
   * Click an element
   */
  async clickElement(selector: Selector): Promise<void> {
    await t.click(selector);
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await t.takeScreenshot(name);
  }
}
