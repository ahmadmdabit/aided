import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { CounterPage } from '../../page-objects/examples/CounterPage';

/**
 * Feature: e2e-testing-testcafe
 * Counter Example Tests
 * Validates: Requirements 4.1, 4.7, 5.1
 */

fixture('Counter Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Counter example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Counter');
  });

test('Navigate to Counter example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Counter is active
  const isActive = await sidebar.isExampleActive('Counter');
  await t.expect(isActive).ok('Counter example should be active');
});

test('Counter button is visible', async t => {
  const counter = new CounterPage();
  
  // Verify the button exists and is visible
  await t.expect(counter.counterButton.exists).ok('Counter button should exist');
  await t.expect(counter.counterButton.visible).ok('Counter button should be visible');
});

test('Initial count is 0', async t => {
  const counter = new CounterPage();
  
  // Get the initial count
  const count = await counter.getCount();
  await t.expect(count).eql(0, 'Initial count should be 0');
});

test('Counter increments on button click', async t => {
  const counter = new CounterPage();
  
  // Click the button once
  await counter.clickCounter();
  
  // Verify count is 1
  let count = await counter.getCount();
  await t.expect(count).eql(1, 'Count should be 1 after one click');
  
  // Click again
  await counter.clickCounter();
  
  // Verify count is 2
  count = await counter.getCount();
  await t.expect(count).eql(2, 'Count should be 2 after two clicks');
});

test('Counter increments correctly for multiple clicks', async t => {
  const counter = new CounterPage();
  
  // Click multiple times and verify count increases
  const clickCounts = [1, 2, 3, 4, 5];
  
  for (const expectedCount of clickCounts) {
    await counter.clickCounter();
    const count = await counter.getCount();
    await t.expect(count).eql(expectedCount, `Count should be ${expectedCount} after ${expectedCount} clicks`);
  }
});

test('Count display updates immediately after click', async t => {
  const counter = new CounterPage();
  
  // Get initial count
  let count = await counter.getCount();
  await t.expect(count).eql(0);
  
  // Click and immediately check
  await counter.clickCounter();
  count = await counter.getCount();
  await t.expect(count).eql(1, 'Count should update immediately');
  
  // Click multiple times rapidly
  for (let i = 0; i < 5; i++) {
    await counter.clickCounter();
  }
  
  count = await counter.getCount();
  await t.expect(count).eql(6, 'Count should be 6 after 5 more clicks');
});
