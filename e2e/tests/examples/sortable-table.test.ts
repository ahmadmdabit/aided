import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { SortableUserTablePage } from '../../page-objects/examples/SortableUserTablePage';

/**
 * Feature: e2e-testing-testcafe
 * SortableUserTable Example Tests
 * Validates: Requirements 4.8
 */

fixture('SortableUserTable Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Sortable User Table example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Sortable User Table');
  });

test('Navigate to SortableUserTable example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Sortable User Table is active
  const isActive = await sidebar.isExampleActive('Sortable User Table');
  await t.expect(isActive).ok('Sortable User Table example should be active');
});

test('Table is visible and contains rows', async t => {
  const table = new SortableUserTablePage();
  
  // Verify table exists
  await t.expect(table.table.exists).ok('Table should exist');
  
  // Verify rows exist
  const rowCount = await table.getRowCount();
  await t.expect(rowCount).gt(0, 'Table should contain rows');
});

test('Sort by name column in ascending order', async t => {
  const table = new SortableUserTablePage();
  
  // Click name header twice to ensure ascending order
  // First click toggles from asc to desc, second click toggles back to asc
  await table.clickColumnHeader('name');
  await table.clickColumnHeader('name');
  
  // Verify header is active
  const isActive = await table.isHeaderActive('name');
  await t.expect(isActive).ok('Name header should be active');
  
  // Verify sort order is ascending
  const isSorted = await table.verifySortOrderAscending('name');
  await t.expect(isSorted).ok('Names should be sorted in ascending order');
});

test('Sort by name column in descending order', async t => {
  const table = new SortableUserTablePage();
  
  // Click name header once to sort descending
  // Initial state is asc, so one click toggles to desc
  await table.clickColumnHeader('name');
  
  // Verify sort order is descending
  const isSorted = await table.verifySortOrderDescending('name');
  await t.expect(isSorted).ok('Names should be sorted in descending order');
});

test('Sort by age column in ascending order', async t => {
  const table = new SortableUserTablePage();
  
  // Click age header to sort
  await table.clickColumnHeader('age');
  
  // Verify header is active
  const isActive = await table.isHeaderActive('age');
  await t.expect(isActive).ok('Age header should be active');
  
  // Verify sort order is ascending
  const isSorted = await table.verifySortOrderAscending('age');
  await t.expect(isSorted).ok('Ages should be sorted in ascending order');
});

test('Sort by age column in descending order', async t => {
  const table = new SortableUserTablePage();
  
  // Click age header twice to sort descending
  await table.clickColumnHeader('age');
  await table.clickColumnHeader('age');
  
  // Verify sort order is descending
  const isSorted = await table.verifySortOrderDescending('age');
  await t.expect(isSorted).ok('Ages should be sorted in descending order');
});

test('Switch sorting between columns', async t => {
  const table = new SortableUserTablePage();
  
  // Sort by name
  await table.clickColumnHeader('name');
  let isNameActive = await table.isHeaderActive('name');
  await t.expect(isNameActive).ok('Name header should be active');
  
  // Switch to age
  await table.clickColumnHeader('age');
  isNameActive = await table.isHeaderActive('name');
  const isAgeActive = await table.isHeaderActive('age');
  
  await t.expect(isNameActive).notOk('Name header should not be active');
  await t.expect(isAgeActive).ok('Age header should be active');
});

test('Table maintains correct row count after sorting', async t => {
  const table = new SortableUserTablePage();
  
  // Get initial row count
  const initialCount = await table.getRowCount();
  
  // Sort by name
  await table.clickColumnHeader('name');
  let count = await table.getRowCount();
  await t.expect(count).eql(initialCount, 'Row count should remain the same after sorting by name');
  
  // Sort by age
  await table.clickColumnHeader('age');
  count = await table.getRowCount();
  await t.expect(count).eql(initialCount, 'Row count should remain the same after sorting by age');
});
