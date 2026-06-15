import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { CounterPage } from '../../page-objects/examples/CounterPage';
import { TodoListPage } from '../../page-objects/examples/TodoListPage';
import { ModalPage } from '../../page-objects/examples/ModalPage';
import { ThemeSwitcherPage } from '../../page-objects/examples/ThemeSwitcherPage';

/**
 * Feature: e2e-testing-testcafe
 * Reactivity Validation Tests
 * Validates: Requirements 5.1, 5.5, 5.6, 5.7, 4.6
 */

fixture('Reactivity Validation')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
  });

test('Signal updates in Counter example', async t => {
  const sidebar = new SidebarNav();
  const counter = new CounterPage();
  
  // Navigate to Counter
  await sidebar.clickExample('Counter');
  
  // Verify initial state
  let count = await counter.getCount();
  await t.expect(count).eql(0, 'Initial count should be 0');
  
  // Click and verify immediate update
  await counter.clickCounter();
  count = await counter.getCount();
  await t.expect(count).eql(1, 'Count should update immediately to 1');
  
  // Click multiple times and verify each update
  for (let i = 2; i <= 5; i++) {
    await counter.clickCounter();
    count = await counter.getCount();
    await t.expect(count).eql(i, `Count should update immediately to ${i}`);
  }
});

test('Derived state in TodoList example', async t => {
  const sidebar = new SidebarNav();
  const todo = new TodoListPage();
  
  // Navigate to TodoList
  await sidebar.clickExample('Todo List');
  
  // Get initial remaining count
  const initialCount = await todo.getRemainingTaskCount();
  
  // Add a task
  await todo.addTask('Test task 1');
  let remainingCount = await todo.getRemainingTaskCount();
  await t.expect(remainingCount).eql(initialCount + 1, 'Remaining count should increase');
  
  // Add another task
  await todo.addTask('Test task 2');
  remainingCount = await todo.getRemainingTaskCount();
  await t.expect(remainingCount).eql(initialCount + 2, 'Remaining count should increase again');
  
  // Complete the last task (should decrease remaining count)
  const tasks = await todo.getAllTasks();
  const lastIndex = tasks.length - 1;
  await todo.completeTask(lastIndex);
  remainingCount = await todo.getRemainingTaskCount();
  await t.expect(remainingCount).eql(initialCount + 1, 'Remaining count should decrease when task completed');
});

test('Conditional rendering in Modal example', async t => {
  const sidebar = new SidebarNav();
  const modal = new ModalPage();
  
  // Navigate to Modal
  await sidebar.clickExample('Modal');
  
  // Verify modal is not visible initially
  let isVisible = await modal.isModalVisible();
  await t.expect(isVisible).notOk('Modal should not be visible initially');
  
  // Open modal
  await modal.openModal();
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be visible after opening');
  
  // Close modal
  await modal.closeModal();
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).notOk('Modal should not be visible after closing');
  
  // Open again
  await modal.openModal();
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be visible again after reopening');
});

test('For component updates in TodoList', async t => {
  const sidebar = new SidebarNav();
  const todo = new TodoListPage();
  
  // Navigate to TodoList
  await sidebar.clickExample('Todo List');
  
  // Get initial tasks
  let tasks = await todo.getAllTasks();
  const initialCount = tasks.length;
  
  // Add a new task
  const newTaskText = 'New reactive task';
  await todo.addTask(newTaskText);
  
  // Verify the new task appears in the list
  tasks = await todo.getAllTasks();
  await t.expect(tasks.length).eql(initialCount + 1, 'Task list should have one more item');
  
  const newTaskExists = tasks.some(t => t.includes(newTaskText));
  await t.expect(newTaskExists).ok('New task should appear in the list immediately');
  
  // Add another task
  const anotherTaskText = 'Another reactive task';
  await todo.addTask(anotherTaskText);
  
  // Verify both new tasks are in the list
  tasks = await todo.getAllTasks();
  await t.expect(tasks.length).eql(initialCount + 2, 'Task list should have two more items');
  
  const anotherTaskExists = tasks.some(t => t.includes(anotherTaskText));
  await t.expect(anotherTaskExists).ok('Second new task should appear in the list immediately');
});

test('Theme reactivity in ThemeSwitcher', async t => {
  const sidebar = new SidebarNav();
  const theme = new ThemeSwitcherPage();
  
  // Navigate to ThemeSwitcher
  await sidebar.clickExample('Theme Switcher');
  
  // Verify initial theme
  let currentTheme = await theme.getCurrentTheme();
  await t.expect(currentTheme).eql('light', 'Initial theme should be light');
  
  // Toggle theme
  await theme.toggleTheme();
  currentTheme = await theme.getCurrentTheme();
  await t.expect(currentTheme).eql('dark', 'Theme should update immediately to dark');
  
  // Toggle back
  await theme.toggleTheme();
  currentTheme = await theme.getCurrentTheme();
  await t.expect(currentTheme).eql('light', 'Theme should update immediately back to light');
  
  // Verify background color changes reactively
  const lightBgColor = await theme.getBackgroundColor();
  
  await theme.toggleTheme();
  const darkBgColor = await theme.getBackgroundColor();
  
  await t.expect(lightBgColor).notEql(darkBgColor, 'Background color should change reactively');
});

test('No JavaScript errors during rendering', async t => {
  const sidebar = new SidebarNav();
  
  // Get all examples
  const allExamples = await sidebar.getAllExampleNames();
  
  // Navigate to each example and verify no errors
  for (const example of allExamples) {
    await sidebar.clickExample(example);
    
    // Check for error elements using Selector (TestCafe way)
    const errorElements = Selector('[role="alert"]');
    await t.expect(errorElements.count).eql(0, `No errors should occur when loading ${example}`);
  }
});

test('Rapid state changes are handled correctly', async t => {
  const sidebar = new SidebarNav();
  const counter = new CounterPage();
  
  // Navigate to Counter
  await sidebar.clickExample('Counter');
  
  // Perform rapid clicks
  for (let i = 0; i < 10; i++) {
    await counter.clickCounter();
  }
  
  // Verify final count is correct
  const count = await counter.getCount();
  await t.expect(count).eql(10, 'Count should be 10 after 10 rapid clicks');
});

test('State consistency across multiple interactions', async t => {
  const sidebar = new SidebarNav();
  const todo = new TodoListPage();
  
  // Navigate to TodoList
  await sidebar.clickExample('Todo List');
  
  // Perform multiple operations
  await todo.addTask('Task 1');
  await todo.addTask('Task 2');
  await todo.addTask('Task 3');
  
  // Get all tasks
  let tasks = await todo.getAllTasks();
  const initialLength = tasks.length;
  await t.expect(initialLength).gte(3, 'Should have at least 3 tasks');
  
  // Complete the last task
  await todo.completeTask(initialLength - 1);
  
  // Delete the second-to-last task
  await todo.deleteTask(initialLength - 2);
  
  // Verify state is consistent
  tasks = await todo.getAllTasks();
  const isLastCompleted = await todo.isTaskCompleted(tasks.length - 1);
  
  await t.expect(isLastCompleted).ok('Last task should be completed');
  await t.expect(tasks.length).gte(1, 'Should still have tasks after operations');
});
