import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { NotificationPage } from '../../page-objects/examples/NotificationPage';

/**
 * Feature: e2e-testing-testcafe
 * Notification Example Tests
 * Validates: Requirements 4.10
 */

fixture('Notification Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Notification example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Notification');
  });

test('Navigate to Notification example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Notification is active
  const isActive = await sidebar.isExampleActive('Notification');
  await t.expect(isActive).ok('Notification example should be active');
});

test('Trigger success notification', async t => {
  const notification = new NotificationPage();
  
  // Trigger notification
  await notification.triggerSuccessNotification();
  
  // Wait for notification to appear
  await notification.waitForNotificationToAppear();
  
  // Verify notification count
  const count = await notification.getNotificationCount();
  await t.expect(count).gt(0, 'At least one notification should be visible');
});

test('Trigger error notification', async t => {
  const notification = new NotificationPage();
  
  // Trigger notification
  await notification.triggerErrorNotification();
  
  // Wait for notification to appear
  await notification.waitForNotificationToAppear();
  
  // Verify notification count
  const count = await notification.getNotificationCount();
  await t.expect(count).gt(0, 'At least one notification should be visible');
});

test('Notification contains correct text', async t => {
  const notification = new NotificationPage();
  
  // Trigger success notification
  await notification.triggerSuccessNotification();
  await notification.waitForNotificationToAppear();
  
  // Get notification text
  const text = await notification.getNotificationText(0);
  await t.expect(text).contains('Success', 'Notification should contain success message');
});

test('Multiple notifications can be triggered', async t => {
  const notification = new NotificationPage();
  
  // Trigger first notification
  await notification.triggerSuccessNotification();
  await notification.waitForNotificationToAppear();
  
  let count = await notification.getNotificationCount();
  await t.expect(count).eql(1, 'Should have 1 notification');
  
  // Trigger second notification
  await notification.triggerErrorNotification();
  
  // Wait a moment for the second notification
  await t.wait(500);
  
  count = await notification.getNotificationCount();
  await t.expect(count).eql(2, 'Should have 2 notifications');
});

test('Notifications auto-dismiss after timeout', async t => {
  const notification = new NotificationPage();
  
  // Trigger notification
  await notification.triggerSuccessNotification();
  await notification.waitForNotificationToAppear();
  
  // Verify notification is visible
  let count = await notification.getNotificationCount();
  await t.expect(count).gt(0, 'Notification should be visible');
  
  // Wait for auto-dismiss (typically 5 seconds)
  await notification.waitForNotificationsToDismiss(10000);
  
  // Verify all notifications are gone
  count = await notification.getNotificationCount();
  await t.expect(count).eql(0, 'All notifications should be dismissed');
});
