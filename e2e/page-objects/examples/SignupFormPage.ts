import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for SignupForm Example
 */
export class SignupFormPage extends PlaygroundPage {
  readonly nameInput: Selector;
  readonly emailInput: Selector;
  readonly passwordInput: Selector;
  readonly submitButton: Selector;
  readonly errorMessages: Selector;
  readonly successMessage: Selector;

  constructor() {
    super();
    this.nameInput = Selector('input[id="name"]');
    this.emailInput = Selector('[data-testid="signup-email-input"]');
    this.passwordInput = Selector('[data-testid="signup-password-input"]');
    this.submitButton = Selector('[data-testid="signup-submit-button"]');
    this.errorMessages = Selector('[data-testid$="-error"]');
    this.successMessage = Selector('.success-message');
  }

  /**
   * Fill in the name field
   */
  async fillName(name: string): Promise<void> {
    await t.typeText(this.nameInput, name);
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string): Promise<void> {
    await t.typeText(this.emailInput, email);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string): Promise<void> {
    await t.typeText(this.passwordInput, password);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await t.click(this.submitButton);
  }

  /**
   * Submit the form and handle the native alert dialog
   */
  async submitFormWithAlert(): Promise<void> {
    // Set up handler for the native alert dialog
    await t.setNativeDialogHandler(() => true);
    
    // Submit the form
    await t.click(this.submitButton);
  }

  /**
   * Get error message for a specific field
   */
  async getErrorMessage(field: string): Promise<string> {
    const errorSelector = Selector(`[data-testid="${field}-error"]`);
    return errorSelector.textContent;
  }

  /**
   * Check if a field has an error message
   */
  async hasErrorMessage(field: string): Promise<boolean> {
    const errorSelector = Selector(`[data-testid="${field}-error"]`);
    return errorSelector.exists;
  }

  /**
   * Check if the form is valid (submit button is enabled)
   */
  async isFormValid(): Promise<boolean> {
    return !(await this.submitButton.hasAttribute('disabled'));
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await t.selectText(this.emailInput).pressKey('delete');
    await t.selectText(this.passwordInput).pressKey('delete');
  }
}
