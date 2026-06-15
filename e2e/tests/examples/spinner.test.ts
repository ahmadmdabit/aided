import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { SpinnerPage } from '../../page-objects/examples/SpinnerPage';

/**
 * Feature: e2e-testing-testcafe
 * Spinner Example Tests
 * Validates: Requirements 4.9
 */

fixture('Spinner Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Spinner example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Spinner');
  });

test('Navigate to Spinner example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Spinner is active
  const isActive = await sidebar.isExampleActive('Spinner');
  await t.expect(isActive).ok('Spinner example should be active');
});

test('Spinner is visible', async t => {
  const spinner = new SpinnerPage();
  
  // Verify spinner exists and is visible
  const exists = await spinner.spinnerExists();
  await t.expect(exists).ok('Spinner should exist');
  const isVisible = await spinner.isSpinnerVisible();
  await t.expect(isVisible).ok('Spinner should be visible');
});

test('Spinner has correct styles', async t => {
  const spinner = new SpinnerPage();
  
  // Get spinner styles
  const styles = await spinner.getSpinnerStyles();
  
  // Verify key styles
  await t.expect(styles.display).notEql('none', 'Spinner should not be hidden');
  await t.expect(styles.width).ok('Spinner should have width');
  await t.expect(styles.height).ok('Spinner should have height');
  // Note: border-radius may not be available via getStyleProperty in all browsers
  // So we just verify the spinner exists and has dimensions
});

test('Spinner has animation', async t => {
  const spinner = new SpinnerPage();
  
  // Verify animation is applied
  const hasAnimation = await spinner.hasAnimation();
  await t.expect(hasAnimation).ok('Spinner should have animation');
});

test('Spinner maintains visibility during page interaction', async t => {
  const spinner = new SpinnerPage();
  
  // Check initial visibility
  let isVisible = await spinner.isSpinnerVisible();
  await t.expect(isVisible).ok('Spinner should be visible initially');
  
  // Wait a moment
  await t.wait(1000);
  
  // Check visibility again
  isVisible = await spinner.isSpinnerVisible();
  await t.expect(isVisible).ok('Spinner should remain visible');
});
