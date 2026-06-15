import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for DynamicTabs Example
 */
export class DynamicTabsPage extends PlaygroundPage {
  readonly tabButtons: Selector;
  readonly tabContent: Selector;

  constructor() {
    super();
    this.tabButtons = Selector('[data-testid^="tab-button-"]');
    this.tabContent = Selector('[data-testid="tab-content"]');
  }

  /**
   * Click a tab by name
   */
  async clickTab(tabName: string): Promise<void> {
    const tabButton = Selector(`[data-testid="tab-button-${tabName}"]`);
    await t.click(tabButton);
  }

  /**
   * Get the active tab name
   */
  async getActiveTabName(): Promise<string> {
    const activeButton = this.tabButtons.filter((node) => {
      const classList = node.getAttribute('class');
      return classList && classList.includes('active');
    });
    const testId = await activeButton.getAttribute('data-testid');
    return testId.replace('tab-button-', '');
  }

  /**
   * Get all tab names
   */
  async getAllTabNames(): Promise<string[]> {
    const count = await this.tabButtons.count;
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const testId = await this.tabButtons.nth(i).getAttribute('data-testid');
      names.push(testId.replace('tab-button-', ''));
    }

    return names;
  }

  /**
   * Check if a tab is active
   */
  async isTabActive(tabName: string): Promise<boolean> {
    const tabButton = Selector(`[data-testid="tab-button-${tabName}"]`);
    const classList = await tabButton.getAttribute('class');
    return classList.includes('active');
  }

  /**
   * Get the content of the active tab
   */
  async getTabContent(): Promise<string> {
    return this.tabContent.textContent;
  }

  /**
   * Verify tab state isolation by checking content changes
   */
  async verifyTabStateIsolation(tabName: string): Promise<boolean> {
    const initialContent = await this.getTabContent();
    await this.clickTab(tabName);
    const newContent = await this.getTabContent();
    return initialContent !== newContent;
  }
}
