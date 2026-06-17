import { h } from 'aided-core';
import { NotificationSystem, addNotification } from './NotificationSystem';
import { CodeSnippet } from '../../components/CodeSnippet';

const notificationDemoCode = `// Global notification state
const [notifications, setNotifications] = createSignal([]);

function addNotification(message, type = 'info') {
  const id = Date.now();
  setNotifications([...notifications(), { id, message, type }]);
  setTimeout(() => {
    setNotifications(notifications().filter(n => n.id !== id));
  }, 5000);
}

// In your component:
return h.div(
  h.button({
    onClick: () => addNotification('Success!', 'info')
  }, 'Add Notification'),
  NotificationSystem()
);`;

export function NotificationDemo() {
  return h.div(
    h.h1('Animated Notifications'),
    h.p('Click the buttons to add notifications with enter/leave animations.'),
    h.div(
      h.button({
        onClick: () => addNotification('Success! Your action was completed.'),
        'data-testid': 'notification-trigger-success'
      }, 'Add Info Notification'),
      h.button({
        onClick: () => addNotification('Error: Could not save data.', 'error'),
        'data-testid': 'notification-trigger-error'
      }, 'Add Error Notification')
    ),
    // Mount the notification system. It will render into the portal.
    NotificationSystem(),
    CodeSnippet({ code: notificationDemoCode })
  );
}
