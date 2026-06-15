import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { TodoListPage } from '../../page-objects/examples/TodoListPage';
import { generateRandomTask } from '../../helpers/test-utils';

/**
 * Feature: e2e-testing-testcafe
 * TodoList Example Tests
 * Validates: Requirements 4.2, 5.3
 */

fixture('TodoList Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to TodoList example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Todo List');
  });

test('Navigate to TodoList example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify TodoList is active
  const isActive = await sidebar.isExampleActive('Todo List');
  await t.expect(isActive).ok('TodoList example should be active');
});

test('Add a single task', async t => {
  const todo = new TodoListPage();
  
  // Get initial task count
  const initialCount = await todo.getTaskCount();
  
  // Add a new task
  const taskText = 'Test task';
  await todo.addTask(taskText);
  
  // Verify task was added
  const newCount = await todo.getTaskCount();
  await t.expect(newCount).eql(initialCount + 1, 'Task count should increase by 1');
  
  // Verify the task text is in the list
  const tasks = await todo.getAllTasks();
  const taskExists = tasks.some(t => t.includes(taskText));
  await t.expect(taskExists).ok('New task should be in the list');
});

test('Complete a task', async t => {
  const todo = new TodoListPage();
  
  // Add a task
  await todo.addTask('Task to complete');
  
  // Get the last task (the one we just added)
  const tasks = await todo.getAllTasks();
  const lastIndex = tasks.length - 1;
  
  // Complete the task
  await todo.completeTask(lastIndex);
  
  // Verify the task is marked as completed
  const isCompleted = await todo.isTaskCompleted(lastIndex);
  await t.expect(isCompleted).ok('Task should be marked as completed');
});

test('Delete a task', async t => {
  const todo = new TodoListPage();
  
  // Get initial task count
  const initialCount = await todo.getTaskCount();
  
  // Add a task
  await todo.addTask('Task to delete');
  
  // Verify task was added
  let currentCount = await todo.getTaskCount();
  await t.expect(currentCount).eql(initialCount + 1);
  
  // Delete the last task
  const tasks = await todo.getAllTasks();
  const lastIndex = tasks.length - 1;
  await todo.deleteTask(lastIndex);
  
  // Verify task was deleted
  currentCount = await todo.getTaskCount();
  await t.expect(currentCount).eql(initialCount, 'Task count should return to initial');
});

test('Task count updates when tasks are added', async t => {
  const todo = new TodoListPage();
  
  // Get initial count
  const initialCount = await todo.getTaskCount();
  
  // Add multiple tasks
  const tasksToAdd = [
    generateRandomTask(),
    generateRandomTask(),
    generateRandomTask()
  ];
  
  for (const taskText of tasksToAdd) {
    await todo.addTask(taskText);
  }
  
  // Verify count increased
  const finalCount = await todo.getTaskCount();
  await t.expect(finalCount).eql(initialCount + tasksToAdd.length, 'Task count should increase by number of added tasks');
});

test('Task count updates when tasks are completed', async t => {
  const todo = new TodoListPage();
  
  // Add a task
  await todo.addTask('Task to complete');
  
  // Get count before completing
  const countBefore = await todo.getRemainingTaskCount();
  
  // Complete the last task
  const tasks = await todo.getAllTasks();
  const lastIndex = tasks.length - 1;
  await todo.completeTask(lastIndex);
  
  // Verify count decreased (completed tasks don't count)
  const countAfter = await todo.getRemainingTaskCount();
  await t.expect(countAfter).eql(countBefore - 1, 'Remaining count should decrease when task is completed');
});

test('Multiple operations on tasks', async t => {
  const todo = new TodoListPage();
  
  // Add multiple tasks
  const task1 = 'First task';
  const task2 = 'Second task';
  const task3 = 'Third task';
  
  await todo.addTask(task1);
  await todo.addTask(task2);
  await todo.addTask(task3);
  
  // Get all tasks
  let tasks = await todo.getAllTasks();
  const initialLength = tasks.length;
  await t.expect(initialLength).gte(3, 'Should have at least 3 tasks');
  
  // Complete the last task (one of the newly added ones)
  await todo.completeTask(initialLength - 1);
  
  // Delete the second-to-last task
  await todo.deleteTask(initialLength - 2);
  
  // Verify the operations worked
  tasks = await todo.getAllTasks();
  const isLastCompleted = await todo.isTaskCompleted(tasks.length - 1);
  await t.expect(isLastCompleted).ok('Last task should be completed');
});
