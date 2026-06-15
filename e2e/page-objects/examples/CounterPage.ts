import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for Counter Example
 */
export class CounterPage extends PlaygroundPage {
  readonly counterButton: Selector;
  readonly countDisplay: Selector;

  constructor() {
    super();
    this.counterButton = Selector('[data-testid="counter-button"]');
    this.countDisplay = Selector('[data-testid="count-display"]');
  }

  /**
   * Click the counter button
   */
  async clickCounter(): Promise<void> {
    await t.click(this.counterButton);
  }

  /**
   * Get the current count value
   */
  async getCount(): Promise<number> {
    const countText = await this.countDisplay.textContent;
    return parseInt(countText, 10);
  }

  /**
   * Click the counter button N times
   */
  async clickCounterNTimes(n: number): Promise<void> {
    for (let i = 0; i < n; i++) {
      await this.clickCounter();
    }
  }

  /**
   * Verify that the count equals the expected value
   */
  async verifyCountEquals(expected: number): Promise<boolean> {
    const count = await this.getCount();
    return count === expected;
  }
}
