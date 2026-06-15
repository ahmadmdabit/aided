import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { ToasterPage } from '../../page-objects/examples/ToasterPage';

/**
 * Feature: e2e-testing-testcafe
 * Toaster Example Tests
 * Validates: Requirements 4.11
 */

fixture('Toaster Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Toaster example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Toaster');
  });

test('Navigate to Toaster example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Toaster is active
  const isActive = await sidebar.isExampleActive('Toaster');
  await t.expect(isActive).ok('Toaster example should be active');
});

test('Add success toast', async t => {
  const toaster = new ToasterPage();
  
  // Add toast
  await toaster.addSuccessToast();
  
  // Wait for toast to appear
  await toaster.waitForNotificationToAppear();
  
  // Verify notification count
  const count = await toaster.getNotificationCount();
  await t.expect(count).gt(0, 'At least one notification should be visible');
});

test('Add error toast', async t => {
  const toaster = new ToasterPage();
  
  // Add toast
  await toaster.addErrorToast();
  
  // Wait for toast to appear
  await toaster.waitForNotificationToAppear();
  
  // Verify notification count
  const count = await toaster.getNotificationCount();
  await t.expect(count).gt(0, 'At least one notification should be visible');
});

test('Add warning toast', async t => {
  const toaster = new ToasterPage();
  
  // Add toast
  await toaster.addWarningToast();
  
  // Wait for toast to appear
  await toaster.waitForNotificationToAppear();
  
  // Verify notification count
  const count = await toaster.getNotificationCount();
  await t.expect(count).gt(0, 'At least one notification should be visible');
});

test('Toast contains correct text', async t => {
  const toaster = new ToasterPage();
  
  // Add success toast
  await toaster.addSuccessToast();
  await toaster.waitForNotificationToAppear();
  
  // Get notification text
  const text = await toaster.getNotificationText(0);
  await t.expect(text).contains('logged in', 'Notification should contain success message');
});

test('Multiple toasts can be added', async t => {
  const toaster = new ToasterPage();
  
  // Add first toast
  await toaster.addSuccessToast();
  await toaster.waitForNotificationToAppear();
  
  let count = await toaster.getNotificationCount();
  await t.expect(count).eql(1, 'Should have 1 notification');
  
  // Add second toast
  await toaster.addErrorToast();
  
  // Wait a moment for the second notification
  await t.wait(500);
  
  count = await toaster.getNotificationCount();
  await t.expect(count).eql(2, 'Should have 2 notifications');
});

test('Clear all toasts', async t => {
  const toaster = new ToasterPage();
  
  // Add multiple toasts
  await toaster.addSuccessToast();
  await toaster.waitForNotificationToAppear();
  await toaster.addErrorToast();
  
  let count = await toaster.getNotificationCount();
  await t.expect(count).gt(0, 'Should have notifications');
  
  // Clear all
  await toaster.clearAllToasts();
  
  // Wait a moment
  await t.wait(500);
  
  count = await toaster.getNotificationCount();
  await t.expect(count).eql(0, 'All notifications should be cleared');
});

test('Toasts auto-dismiss after timeout', async t => {
  const toaster = new ToasterPage();
  
  // Add toast
  await toaster.addSuccessToast();
  await toaster.waitForNotificationToAppear();
  
  // Verify notification is visible
  let count = await toaster.getNotificationCount();
  await t.expect(count).gt(0, 'Notification should be visible');
  
  // Wait for auto-dismiss (typically 5 seconds)
  await toaster.waitForNotificationsToDismiss(10000);
  
  // Verify all notifications are gone
  count = await toaster.getNotificationCount();
  await t.expect(count).eql(0, 'All notifications should be dismissed');
});
