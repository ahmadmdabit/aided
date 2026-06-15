import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { DynamicTabsPage } from '../../page-objects/examples/DynamicTabsPage';

/**
 * Feature: e2e-testing-testcafe
 * DynamicTabs Example Tests
 * Validates: Requirements 4.12
 */

fixture('DynamicTabs Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Dynamic Tabs example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Dynamic Tabs');
  });

test('Navigate to DynamicTabs example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Dynamic Tabs is active
  const isActive = await sidebar.isExampleActive('Dynamic Tabs');
  await t.expect(isActive).ok('Dynamic Tabs example should be active');
});

test('All tabs are present', async t => {
  const tabs = new DynamicTabsPage();
  
  // Get all tab names
  const tabNames = await tabs.getAllTabNames();
  
  // Verify expected tabs exist
  await t.expect(tabNames.length).gt(0, 'Should have at least one tab');
  await t.expect(tabNames).contains('home', 'Should have home tab');
});

test('Home tab is active by default', async t => {
  const tabs = new DynamicTabsPage();
  
  // Verify home tab is active
  const isActive = await tabs.isTabActive('home');
  await t.expect(isActive).ok('Home tab should be active by default');
});

test('Switch to profile tab', async t => {
  const tabs = new DynamicTabsPage();
  
  // Click profile tab
  await tabs.clickTab('profile');
  
  // Verify profile tab is active
  const isActive = await tabs.isTabActive('profile');
  await t.expect(isActive).ok('Profile tab should be active');
  
  // Verify home tab is not active
  const homeActive = await tabs.isTabActive('home');
  await t.expect(homeActive).notOk('Home tab should not be active');
});

test('Switch to settings tab', async t => {
  const tabs = new DynamicTabsPage();
  
  // Click settings tab
  await tabs.clickTab('settings');
  
  // Verify settings tab is active
  const isActive = await tabs.isTabActive('settings');
  await t.expect(isActive).ok('Settings tab should be active');
});

test('Tab content changes when switching tabs', async t => {
  const tabs = new DynamicTabsPage();
  
  // Get home tab content
  const homeContent = await tabs.getTabContent();
  
  // Switch to profile tab
  await tabs.clickTab('profile');
  const profileContent = await tabs.getTabContent();
  
  // Verify content is different
  await t.expect(homeContent).notEql(profileContent, 'Tab content should change when switching tabs');
});

test('Tab state is isolated between tabs', async t => {
  const tabs = new DynamicTabsPage();
  
  // Verify tab state isolation
  const isIsolated = await tabs.verifyTabStateIsolation('profile');
  await t.expect(isIsolated).ok('Tab state should be isolated');
});

test('Can switch between multiple tabs', async t => {
  const tabs = new DynamicTabsPage();
  
  // Get all tab names
  const tabNames = await tabs.getAllTabNames();
  
  // Switch through each tab
  for (const tabName of tabNames) {
    await tabs.clickTab(tabName);
    const isActive = await tabs.isTabActive(tabName);
    await t.expect(isActive).ok(`${tabName} tab should be active`);
  }
});

test('Active tab indicator is updated', async t => {
  const tabs = new DynamicTabsPage();
  
  // Verify home is active
  let activeTab = await tabs.getActiveTabName();
  await t.expect(activeTab).eql('home', 'Home should be active initially');
  
  // Switch to profile
  await tabs.clickTab('profile');
  activeTab = await tabs.getActiveTabName();
  await t.expect(activeTab).eql('profile', 'Profile should be active after click');
  
  // Switch to settings
  await tabs.clickTab('settings');
  activeTab = await tabs.getActiveTabName();
  await t.expect(activeTab).eql('settings', 'Settings should be active after click');
});
