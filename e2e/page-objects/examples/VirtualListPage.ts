import { Selector, t, ClientFunction } from 'testcafe';
import { PlaygroundPage } from '../base/PlaygroundPage';

/**
 * Page Object for VirtualList Example
 */
export class VirtualListPage extends PlaygroundPage {
  readonly virtualList: Selector;
  readonly virtualItems: Selector;
  
  // Dataset size buttons
  readonly emptyButton: Selector;
  readonly size100Button: Selector;
  readonly size10kButton: Selector;
  readonly size100kButton: Selector;
  
  // Mutation buttons
  readonly addItemButton: Selector;
  readonly removeItemButton: Selector;
  readonly swapButton: Selector;
  
  // Parameter inputs
  readonly itemHeightInput: Selector;
  readonly overscanInput: Selector;
  
  // Scroll-to-index controls
  readonly scrollIndexInput: Selector;
  readonly scrollGoButton: Selector;
  
  // Stats display
  readonly statsDisplay: Selector;

  constructor() {
    super();
    this.virtualList = Selector('[data-testid="virtual-list"]');
    this.virtualItems = Selector('[data-testid^="virtual-item-"]');
    
    // Dataset size buttons - using text content
    this.emptyButton = Selector('button').withText('Empty');
    this.size100Button = Selector('button').withText('100');
    this.size10kButton = Selector('button').withText('10k');
    this.size100kButton = Selector('button').withText('100k');
    
    // Mutation buttons
    this.addItemButton = Selector('button').withText('Add 1');
    this.removeItemButton = Selector('button').withText('Remove 1');
    this.swapButton = Selector('button').withText('Swap middle pair');
    
    // Parameter inputs - using preceding label text
    this.itemHeightInput = Selector('label').withText('Item height (px)').nextSibling('input');
    this.overscanInput = Selector('label').withText('Overscan').nextSibling('input');
    
    // Scroll-to-index controls
    this.scrollIndexInput = Selector('label').withText('Scroll to index').nextSibling('input');
    this.scrollGoButton = Selector('button').withText('Go');
    
    // Stats display
    this.statsDisplay = Selector('.stats');
  }

  /**
   * Get the count of visible virtual items in the DOM
   */
  async getVisibleItemCount(): Promise<number> {
    return this.virtualItems.count;
  }

  /**
   * Get text content of a visible item by index
   */
  async getVisibleItemText(index: number): Promise<string> {
    return this.virtualItems.nth(index).textContent;
  }

  /**
   * Get the first visible item text
   */
  async getFirstVisibleItemText(): Promise<string> {
    return this.virtualItems.nth(0).textContent;
  }

  /**
   * Get the last visible item text
   */
  async getLastVisibleItemText(): Promise<string> {
    const count = await this.getVisibleItemCount();
    return this.virtualItems.nth(count - 1).textContent;
  }

  /**
   * Scroll to a specific position using ClientFunction with direct scrollTop assignment
   */
  async scrollToPosition(position: number): Promise<void> {
    // First ensure the element exists
    await t.expect(this.virtualList.exists).ok('Virtual list should exist before scrolling');
    
    const scrollTo = ClientFunction((targetPosition: number) => {
      const scroller = document.querySelector('[data-testid="virtual-list"]') as HTMLElement;
      if (!scroller) {
        return { success: false, error: 'Element not found' };
      }
      
      const before = {
        scrollTop: scroller.scrollTop,
        scrollHeight: scroller.scrollHeight,
        clientHeight: scroller.clientHeight,
        overflow: window.getComputedStyle(scroller).overflow,
        overflowY: window.getComputedStyle(scroller).overflowY
      };
      
      scroller.scrollTop = targetPosition;
      
      const after = {
        scrollTop: scroller.scrollTop
      };
      
      return { success: true, before, after };
    });
    
    const result = await scrollTo(position);
    console.log('Scroll result:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      throw new Error(`Failed to scroll: ${result.error}`);
    }
    
    // Wait for virtualization to update
    await t.wait(500);
  }

  /**
   * Get current scroll position using ClientFunction
   */
  async getScrollPosition(): Promise<number> {
    const getScrollTop = ClientFunction(() => {
      const scroller = document.querySelector('[data-testid="virtual-list"]') as HTMLElement;
      return scroller ? scroller.scrollTop : 0;
    });
    
    return getScrollTop();
  }

  /**
   * Verify that virtualization is working (visible items < total items)
   */
  async verifyVirtualization(): Promise<boolean> {
    const visibleCount = await this.getVisibleItemCount();
    // If virtualization is working, visible items should be significantly less than total
    // For a 100k item list, we should see only a few dozen items rendered
    return visibleCount < 100;
  }

  /**
   * Get the height of a single item
   */
  async getItemHeight(): Promise<number> {
    const item = this.virtualItems.nth(0);
    const height = await item.getStyleProperty('height');
    return parseInt(height, 10);
  }
  
  /**
   * Click dataset size button
   */
  async setDatasetSize(size: 'empty' | '100' | '10k' | '100k'): Promise<void> {
    const buttonMap = {
      'empty': this.emptyButton,
      '100': this.size100Button,
      '10k': this.size10kButton,
      '100k': this.size100kButton
    };
    
    await t.click(buttonMap[size]);
    await t.wait(300); // Wait for data generation and rendering
  }
  
  /**
   * Add one item to the list
   */
  async addItem(): Promise<void> {
    await t.click(this.addItemButton);
    await t.wait(200);
  }
  
  /**
   * Remove one item from the list
   */
  async removeItem(): Promise<void> {
    await t.click(this.removeItemButton);
    await t.wait(200);
  }
  
  /**
   * Swap middle pair of items
   */
  async swapMiddlePair(): Promise<void> {
    await t.click(this.swapButton);
    await t.wait(200);
  }
  
  /**
   * Set item height parameter
   */
  async setItemHeight(height: number): Promise<void> {
    await t
      .selectText(this.itemHeightInput)
      .typeText(this.itemHeightInput, height.toString(), { replace: true })
      .pressKey('tab'); // Trigger blur/change
    await t.wait(200);
  }
  
  /**
   * Set overscan parameter
   */
  async setOverscan(overscan: number): Promise<void> {
    await t
      .selectText(this.overscanInput)
      .typeText(this.overscanInput, overscan.toString(), { replace: true })
      .pressKey('tab');
    await t.wait(200);
  }
  
  /**
   * Scroll to specific index using the scroll-to-index control
   */
  async scrollToIndexControl(index: number): Promise<void> {
    await t
      .selectText(this.scrollIndexInput)
      .typeText(this.scrollIndexInput, index.toString(), { replace: true })
      .click(this.scrollGoButton);
    await t.wait(500); // Wait for scroll animation
  }
  
  /**
   * Get stats text
   */
  async getStatsText(): Promise<string> {
    return this.statsDisplay.textContent;
  }
  
  /**
   * Parse stats to get individual values
   */
  async getStats(): Promise<{ items: number; itemHeight: number; overscan: number }> {
    const statsText = await this.getStatsText();
    
    // Parse "Items: 100000 | ItemHeight: 30 | Overscan: 5"
    const itemsMatch = statsText.match(/Items:\s*(\d+)/);
    const heightMatch = statsText.match(/ItemHeight:\s*(\d+)/);
    const overscanMatch = statsText.match(/Overscan:\s*(\d+)/);
    
    return {
      items: itemsMatch ? parseInt(itemsMatch[1], 10) : 0,
      itemHeight: heightMatch ? parseInt(heightMatch[1], 10) : 0,
      overscan: overscanMatch ? parseInt(overscanMatch[1], 10) : 0
    };
  }
}
