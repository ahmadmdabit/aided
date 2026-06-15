import { Selector, t } from 'testcafe';

/**
 * Page Object for Sidebar Navigation
 * Encapsulates all interactions with the sidebar navigation component
 */
export class SidebarNav {
  readonly sidebar: Selector;
  readonly logo: Selector;
  readonly title: Selector;
  readonly navButtons: Selector;

  constructor() {
    this.sidebar = Selector('.sidebar');
    this.logo = Selector('img[alt="Aided Logo"]');
    this.title = Selector('h2').withText('Aided Playground');
    this.navButtons = Selector('[data-testid^="nav-button-"]');
  }

  /**
   * Click on an example in the sidebar
   */
  async clickExample(exampleName: string): Promise<void> {
    const button = Selector(`[data-testid="nav-button-${exampleName}"]`);
    await t.click(button);
  }

  /**
   * Get the currently active example name
   */
  async getActiveExample(): Promise<string> {
    const activeButton = Selector('[data-testid^="nav-button-"].active');
    const testId = await activeButton.getAttribute('data-testid');
    return (testId || '').replace('nav-button-', '');
  }

  /**
   * Check if a specific example is active
   */
  async isExampleActive(exampleName: string): Promise<boolean> {
    const button = Selector(`[data-testid="nav-button-${exampleName}"]`);
    return button.hasClass('active');
  }

  /**
   * Get all example names from the sidebar
   */
  async getAllExampleNames(): Promise<string[]> {
    const buttons = Selector('[data-testid^="nav-button-"]');
    const count = await buttons.count;
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const testId = await buttons.nth(i).getAttribute('data-testid');
      names.push((testId || '').replace('nav-button-', ''));
    }

    return names;
  }

  /**
   * Verify that the logo is visible
   */
  async verifyLogoVisible(): Promise<boolean> {
    return this.logo.visible;
  }

  /**
   * Verify that the title has the expected text
   */
  async verifyTitleText(expectedText: string): Promise<boolean> {
    const titleText = await this.title.textContent;
    return (titleText || '').includes(expectedText);
  }
}
