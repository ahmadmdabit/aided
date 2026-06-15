import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { SignupFormPage } from '../../page-objects/examples/SignupFormPage';
import { generateRandomEmail } from '../../helpers/test-utils';

/**
 * Feature: e2e-testing-testcafe
 * SignupForm Example Tests
 * Validates: Requirements 4.4, 5.4
 */

fixture('SignupForm Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to SignupForm example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Signup Form');
  });

test('Navigate to SignupForm example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify SignupForm is active
  const isActive = await sidebar.isExampleActive('Signup Form');
  await t.expect(isActive).ok('SignupForm example should be active');
});

test('Fill valid form data', async t => {
  const form = new SignupFormPage();
  
  // Fill in the form
  const email = generateRandomEmail();
  const password = 'ValidPassword123';
  
  await form.fillEmail(email);
  await form.fillPassword(password);
  
  // Verify form is valid
  const isValid = await form.isFormValid();
  await t.expect(isValid).ok('Form should be valid with correct data');
});

test('Submit form with valid data', async t => {
  const form = new SignupFormPage();
  
  // Fill in valid data
  const email = generateRandomEmail();
  const password = 'ValidPassword123';
  
  await form.fillEmail(email);
  await form.fillPassword(password);
  
  // Submit the form with alert handler
  await form.submitFormWithAlert();
  
  // Verify no error messages appear
  const hasEmailError = await form.hasErrorMessage('email');
  const hasPasswordError = await form.hasErrorMessage('password');
  
  await t.expect(hasEmailError).notOk('Should not have email error');
  await t.expect(hasPasswordError).notOk('Should not have password error');
});

test('Validation error for invalid email', async t => {
  const form = new SignupFormPage();
  
  // Fill in invalid email
  await form.fillEmail('invalid-email');
  await form.fillPassword('ValidPassword123');
  
  // Verify form is invalid
  const isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form should be invalid with invalid email');
  
  // Verify error message appears
  const hasError = await form.hasErrorMessage('email');
  await t.expect(hasError).ok('Should show email error message');
});

test('Validation error for short password', async t => {
  const form = new SignupFormPage();
  
  // Fill in short password
  await form.fillEmail(generateRandomEmail());
  await form.fillPassword('short');
  
  // Verify form is invalid
  const isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form should be invalid with short password');
  
  // Verify error message appears
  const hasError = await form.hasErrorMessage('password');
  await t.expect(hasError).ok('Should show password error message');
});

test('Error messages disappear when input becomes valid', async t => {
  const form = new SignupFormPage();
  
  // Start with invalid email
  await form.fillEmail('invalid');
  let hasError = await form.hasErrorMessage('email');
  await t.expect(hasError).ok('Should show email error initially');
  
  // Clear and enter valid email
  await form.clearForm();
  await form.fillEmail(generateRandomEmail());
  
  // Error should disappear
  hasError = await form.hasErrorMessage('email');
  await t.expect(hasError).notOk('Email error should disappear with valid email');
});

test('Submit button is disabled when form is invalid', async t => {
  const form = new SignupFormPage();
  
  // Form starts empty (invalid)
  let isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form should be invalid when empty');
  
  // Fill with invalid data
  await form.fillEmail('invalid');
  isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form should be invalid with invalid email');
  
  // Fill with valid data
  await form.clearForm();
  await form.fillEmail(generateRandomEmail());
  await form.fillPassword('ValidPassword123');
  
  isValid = await form.isFormValid();
  await t.expect(isValid).ok('Form should be valid with correct data');
});

test('Multiple validation scenarios', async t => {
  const form = new SignupFormPage();
  
  // Test 1: Empty form
  let isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Empty form should be invalid');
  
  // Test 2: Only email
  await form.fillEmail(generateRandomEmail());
  isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form with only email should be invalid');
  
  // Test 3: Email and short password
  await form.fillPassword('short');
  isValid = await form.isFormValid();
  await t.expect(isValid).notOk('Form with short password should be invalid');
  
  // Test 4: Valid form
  await form.clearForm();
  await form.fillEmail(generateRandomEmail());
  await form.fillPassword('ValidPassword123');
  isValid = await form.isFormValid();
  await t.expect(isValid).ok('Form with valid data should be valid');
});
