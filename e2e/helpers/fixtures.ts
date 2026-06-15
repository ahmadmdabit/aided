import { fixture } from 'testcafe';

/**
 * Base fixture for all playground tests
 * Provides common setup and teardown for each test
 */
export const playgroundFixture = fixture('Aided Playground')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    await t.expect(document.querySelector('.sidebar')).ok();
  })
  .afterEach(async t => {
    // Clean up after each test
    // Clear any local storage if needed
    await t.eval(() => {
      localStorage.clear();
    });
  });

/**
 * Fixture for Counter example tests
 */
export const counterFixture = fixture('Counter Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for sidebar to load
    await t.expect(document.querySelector('.sidebar')).ok();
    // Navigate to Counter example by clicking the nav button
    const counterButton = document.querySelector('[data-testid="nav-button-Counter"]');
    if (counterButton) {
      await t.click(counterButton);
    }
  });

/**
 * Fixture for TodoList example tests
 */
export const todoListFixture = fixture('TodoList Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for sidebar to load
    await t.expect(document.querySelector('.sidebar')).ok();
    // Navigate to TodoList example
    const todoButton = document.querySelector('[data-testid="nav-button-Todo List"]');
    if (todoButton) {
      await t.click(todoButton);
    }
  });

/**
 * Fixture for Modal example tests
 */
export const modalFixture = fixture('Modal Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for sidebar to load
    await t.expect(document.querySelector('.sidebar')).ok();
    // Navigate to Modal example
    const modalButton = document.querySelector('[data-testid="nav-button-Modal"]');
    if (modalButton) {
      await t.click(modalButton);
    }
  });

/**
 * Fixture for SignupForm example tests
 */
export const signupFormFixture = fixture('SignupForm Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for sidebar to load
    await t.expect(document.querySelector('.sidebar')).ok();
    // Navigate to SignupForm example
    const signupButton = document.querySelector('[data-testid="nav-button-Signup Form"]');
    if (signupButton) {
      await t.click(signupButton);
    }
  });

/**
 * Fixture for ThemeSwitcher example tests
 */
export const themeSwitcherFixture = fixture('ThemeSwitcher Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for sidebar to load
    await t.expect(document.querySelector('.sidebar')).ok();
    // Navigate to ThemeSwitcher example
    const themeButton = document.querySelector('[data-testid="nav-button-Theme Switcher"]');
    if (themeButton) {
      await t.click(themeButton);
    }
  });
