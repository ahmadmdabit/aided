import { Selector, t } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for SortableUserTable Example
 */
export class SortableUserTablePage extends PlaygroundPage {
  readonly table: Selector;
  readonly headerName: Selector;
  readonly headerAge: Selector;
  readonly tableRows: Selector;
  readonly infoPanelClose: Selector;

  constructor() {
    super();
    this.table = Selector('[data-testid="sortable-table"]');
    this.headerName = Selector('[data-testid="table-header-name"]');
    this.headerAge = Selector('[data-testid="table-header-age"]');
    this.tableRows = Selector('[data-testid^="table-row-"]');
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
   * Click a column header to sort
   */
  async clickColumnHeader(column: 'name' | 'age'): Promise<void> {
    // Close info panel if it's obstructing the header
    await this.closeInfoPanel();
    
    const header = column === 'name' ? this.headerName : this.headerAge;
    await t.click(header);
  }

  /**
   * Get all values from a specific column
   */
  async getColumnValues(column: 'name' | 'age'): Promise<string[]> {
    const columnIndex = column === 'name' ? 0 : 1;
    const rows = await this.tableRows.count;
    const values: string[] = [];

    for (let i = 0; i < rows; i++) {
      const row = this.tableRows.nth(i);
      const cells = row.find('td');
      const cellText = await cells.nth(columnIndex).textContent;
      values.push(cellText);
    }

    return values;
  }

  /**
   * Get the row count
   */
  async getRowCount(): Promise<number> {
    return this.tableRows.count;
  }

  /**
   * Verify that a column is sorted in ascending order
   */
  async verifySortOrderAscending(column: 'name' | 'age'): Promise<boolean> {
    const values = await this.getColumnValues(column);
    for (let i = 1; i < values.length; i++) {
      const current = column === 'age' ? parseInt(values[i], 10) : values[i];
      const previous = column === 'age' ? parseInt(values[i - 1], 10) : values[i - 1];
      if (current < previous) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verify that a column is sorted in descending order
   */
  async verifySortOrderDescending(column: 'name' | 'age'): Promise<boolean> {
    const values = await this.getColumnValues(column);
    for (let i = 1; i < values.length; i++) {
      const current = column === 'age' ? parseInt(values[i], 10) : values[i];
      const previous = column === 'age' ? parseInt(values[i - 1], 10) : values[i - 1];
      if (current > previous) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verify that the header has the active class
   */
  async isHeaderActive(column: 'name' | 'age'): Promise<boolean> {
    const header = column === 'name' ? this.headerName : this.headerAge;
    const classList = await header.getAttribute('class');
    return classList?.includes('active') ?? false;
  }
}
