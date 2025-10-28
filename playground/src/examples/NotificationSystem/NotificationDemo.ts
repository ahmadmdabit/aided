import { h } from 'aided-core';
import { NotificationSystem, addNotification } from './NotificationSystem';

export function NotificationDemo() {
  return h.div(
    h.h1('Animated Notifications'),
    h.p('Click the buttons to add notifications with enter/leave animations.'),
    h.div(
      h.button({ onClick: () => addNotification('Success! Your action was completed.') }, 'Add Info Notification'),
      h.button({ onClick: () => addNotification('Error: Could not save data.', 'error') }, 'Add Error Notification')
    ),
    // Mount the notification system. It will render into the portal.
    NotificationSystem()
  );
}
