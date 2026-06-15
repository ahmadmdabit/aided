import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { ExampleContainer } from '../../page-objects/components/ExampleContainer';

/**
 * Feature: e2e-testing-testcafe
 * Navigation Tests
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.7
 */

fixture('Sidebar Navigation')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
  });

test('Default Home example displays on load', async t => {
  const sidebar = new SidebarNav();
  const container = new ExampleContainer();

  // Verify the Home example is active by default
  const isHomeActive = await sidebar.isExampleActive('Home');
  await t.expect(isHomeActive).ok('Home example should be active by default');

  // Verify the main content is visible
  const isLoaded = await container.isExampleLoaded();
  await t.expect(isLoaded).ok('Main content should be loaded');
});

test('Clicking navigation button loads corresponding example', async t => {
  const sidebar = new SidebarNav();
  const container = new ExampleContainer();

  // Click on Counter example
  await sidebar.clickExample('Counter');

  // Verify Counter is now active
  const isCounterActive = await sidebar.isExampleActive('Counter');
  await t.expect(isCounterActive).ok('Counter example should be active after clicking');

  // Verify the example is loaded
  const isLoaded = await container.isExampleLoaded();
  await t.expect(isLoaded).ok('Counter example should be loaded');
});

test('Active CSS class is applied to active navigation button', async t => {
  const sidebar = new SidebarNav();

  // Click on TodoList example
  await sidebar.clickExample('Todo List');

  // Verify the active class is applied
  const isTodoActive = await sidebar.isExampleActive('Todo List');
  await t.expect(isTodoActive).ok('Todo List button should have active class');

  // Click on Modal example
  await sidebar.clickExample('Modal');

  // Verify Modal is now active and TodoList is not
  const isModalActive = await sidebar.isExampleActive('Modal');
  const isTodoStillActive = await sidebar.isExampleActive('Todo List');

  await t.expect(isModalActive).ok('Modal button should have active class');
  await t.expect(isTodoStillActive).notOk('Todo List button should not have active class');
});

test('Sidebar state is preserved during navigation', async t => {
  const sidebar = new SidebarNav();

  // Get all example names
  const allExamples = await sidebar.getAllExampleNames();
  await t.expect(allExamples.length).gt(0, 'Should have at least one example');

  // Navigate through several examples
  for (const example of allExamples.slice(0, 3)) {
    await sidebar.clickExample(example);
    const isActive = await sidebar.isExampleActive(example);
    await t.expect(isActive).ok(`${example} should be active after clicking`);
  }

  // Verify sidebar is still visible and functional
  const sidebarVisible = await sidebar.verifyLogoVisible();
  await t.expect(sidebarVisible).ok('Sidebar should still be visible');
});

test('All example names appear in sidebar', async t => {
  const sidebar = new SidebarNav();

  // Get all example names
  const allExamples = await sidebar.getAllExampleNames();

  // Verify we have examples
  await t.expect(allExamples.length).gt(0, 'Should have at least one example');

  // Verify some expected examples are present
  const expectedExamples = ['Home', 'Counter', 'Todo List', 'Modal'];
  for (const example of expectedExamples) {
    const isPresent = allExamples.includes(example);
    await t.expect(isPresent).ok(`${example} should be in the sidebar`);
  }
});

test('Logo and title are visible in sidebar', async t => {
  const sidebar = new SidebarNav();

  // Verify logo is visible
  const logoVisible = await sidebar.verifyLogoVisible();
  await t.expect(logoVisible).ok('Logo should be visible');

  // Verify title text
  const titleCorrect = await sidebar.verifyTitleText('Aided Playground');
  await t.expect(titleCorrect).ok('Title should contain "Aided Playground"');
});
