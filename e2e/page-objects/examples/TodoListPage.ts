import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for TodoList Example
 */
export class TodoListPage extends PlaygroundPage {
  readonly taskInput: Selector;
  readonly addButton: Selector;
  readonly taskList: Selector;
  readonly taskItems: Selector;
  readonly taskCheckboxes: Selector;
  readonly deleteButtons: Selector;
  readonly taskCount: Selector;
  readonly infoPanelClose: Selector;

  constructor() {
    super();
    this.taskInput = Selector('[data-testid="task-input"]');
    this.addButton = Selector('[data-testid="add-task-button"]');
    this.taskList = Selector('.todo-app ul');
    this.taskItems = Selector('.todo-app li');
    this.taskCheckboxes = Selector('.todo-app input[type="checkbox"]');
    this.deleteButtons = Selector('.todo-app .destroy');
    this.taskCount = Selector('.todo-app footer strong');
    this.infoPanelClose = Selector('.info-panel-close');
  }

  /**
   * Close the info panel if it's visible
   */
  async closeInfoPanel(): Promise<void> {
    const closeButton = this.infoPanelClose;
    if (await closeButton.exists) {
      await t.click(closeButton);
    }
  }

  /**
   * Add a new task
   */
  async addTask(taskText: string): Promise<void> {
    // Close info panel if it's obstructing the input
    await this.closeInfoPanel();
    
    await t.typeText(this.taskInput, taskText);
    await t.click(this.addButton);
  }

  /**
   * Get the total number of tasks (including completed ones)
   * [FIX] Use taskItems.count instead of parsing textContent
   */
  async getTaskCount(): Promise<number> {
    // [FIX] Count actual task elements instead of parsing text
    return this.taskItems.count;
  }

  /**
   * Get the number of remaining (incomplete) tasks
   * [NEW] Separate method for remaining count
   */
  async getRemainingTaskCount(): Promise<number> {
    const countText = await this.taskCount.textContent;
    // Extract just the number from the text (e.g., "2 items left" -> 2)
    const match = countText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Complete a task by index
   */
  async completeTask(index: number): Promise<void> {
    const checkbox = this.taskCheckboxes.nth(index);
    await t.click(checkbox);
    // Wait for the DOM to update
    await t.wait(100);
  }

  /**
   * Delete a task by index
   */
  async deleteTask(index: number): Promise<void> {
    const deleteButton = this.deleteButtons.nth(index);
    await t.click(deleteButton);
  }

  /**
   * Get task text by index
   */
  async getTaskText(index: number): Promise<string> {
    const taskItem = this.taskItems.nth(index);
    const span = taskItem.find('span');
    return span.textContent;
  }

  /**
   * Check if a task is completed by index
   */
  async isTaskCompleted(index: number): Promise<boolean> {
    const taskItem = this.taskItems.nth(index);
    const checkbox = taskItem.find('input[type="checkbox"]');
    return checkbox.checked;
  }

  /**
   * Get all task texts
   */
  async getAllTasks(): Promise<string[]> {
    const count = await this.taskItems.count;
    const tasks: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this.getTaskText(i);
      tasks.push(text);
    }

    return tasks;
  }
}
