import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for ThemeSwitcher Example
 */
export class ThemeSwitcherPage extends PlaygroundPage {
  readonly themeToggle: Selector;
  readonly themeContainer: Selector;
  readonly infoPanelClose: Selector;

  constructor() {
    super();
    this.themeToggle = Selector('[data-testid="theme-toggle"]');
    // [FIX] Use data-testid for reliable selection instead of generic class selector
    this.themeContainer = Selector('[data-testid="theme-container"]');
    this.infoPanelClose = Selector('.info-panel-close');
  }

  /**
   * Close the info panel if it's visible
   */
  async closeInfoPanel(): Promise<void> {
    const closeButton = this.infoPanelClose;
    if (await closeButton.exists) {
      await t.click(closeButton);
    }
  }

  /**
   * Toggle the theme
   */
  async toggleTheme(): Promise<void> {
    // Close info panel if it's obstructing the button
    await this.closeInfoPanel();
    
    await t.click(this.themeToggle);
    // [FIX] Wait for reactive update to complete
    await t.wait(100);
  }

  /**
   * Get the current theme
   */
  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const themeClass = await this.themeContainer.getAttribute('class');
    // [FIX] Add null safety with optional chaining
    return (themeClass || '').includes('dark') ? 'dark' : 'light';
  }

  /**
   * Verify that the theme has been applied
   */
  async verifyThemeApplied(theme: 'light' | 'dark'): Promise<boolean> {
    const currentTheme = await this.getCurrentTheme();
    return currentTheme === theme;
  }

  /**
   * Get the background color of the body
   */
  async getBackgroundColor(): Promise<string> {
    return this.themeContainer.getStyleProperty('background-color');
  }

  /**
   * Toggle theme N times
   */
  async toggleThemeNTimes(n: number): Promise<void> {
    for (let i = 0; i < n; i++) {
      await this.toggleTheme();
    }
  }
}
