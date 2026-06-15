import { Selector } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for Spinner Example
 */
export class SpinnerPage extends PlaygroundPage {
  readonly spinner: Selector;

  constructor() {
    super();
    this.spinner = Selector('[data-testid="spinner"]');
  }

  /**
   * Check if spinner is visible
   */
  async isSpinnerVisible(): Promise<boolean> {
    return this.spinner.visible;
  }

  /**
   * Check if spinner exists in the DOM
   */
  async spinnerExists(): Promise<boolean> {
    return this.spinner.exists;
  }

  /**
   * Get the computed style of the spinner
   */
  async getSpinnerStyles(): Promise<Record<string, string>> {
    const element = this.spinner;
    const styles = {
      display: await element.getStyleProperty('display'),
      width: await element.getStyleProperty('width'),
      height: await element.getStyleProperty('height'),
      borderRadius: await element.getStyleProperty('border-radius'),
      animation: await element.getStyleProperty('animation-name'),
    };
    return styles;
  }

  /**
   * Verify that the spinner has animation
   */
  async hasAnimation(): Promise<boolean> {
    // Try animation-name first
    const animationName = await this.spinner.getStyleProperty('animation-name');
    if (animationName && animationName !== 'none' && animationName.length > 0) {
      return true;
    }
    
    // Fallback: check if animation property exists
    const animation = await this.spinner.getStyleProperty('animation');
    return animation && animation !== 'none' && animation.length > 0;
  }
}
