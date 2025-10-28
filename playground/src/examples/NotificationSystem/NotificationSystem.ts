import { h, createSignal, Portal } from 'aided-core';
import { AnimatedFor } from './AnimatedFor';

// --- Define the type for a notification ---
type Notification = {
  id: number;
  message: string;
  type: 'info' | 'error';
};

let notificationId = 0;

// --- State Management (can be in a separate file) ---
const [notifications, setNotifications] = createSignal<Notification[]>([]);

export function addNotification(message: string, type: 'info' | 'error' = 'info', duration = 3000) {
  const id = ++notificationId;
  
  // 1. Get the current value by calling the getter.
  const currentNotifications = notifications();
  
  // 2. Create the new array.
  const newNotifications = [...currentNotifications, { id, message, type }];
  
  // 3. Set the new value.
  setNotifications(newNotifications);

  // Set a timeout to automatically remove it later
  setTimeout(() => removeNotification(id), duration);
}

export function removeNotification(id: number) {
  // You can do this in one line, which is very common.
  setNotifications(notifications().filter(n => n.id !== id));
}


const WIDGET_STYLE_ID = 'aided-notification-system-styles';

const widgetCSS = `
  .notification-toaster {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .notification {
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    color: white;
    cursor: pointer;
    transition: transform 600ms ease, opacity 600ms ease;
  }
  .notification.info { background-color: #2196F3; }
  .notification.error { background-color: #f4365f; }

  /* --- Animation Classes --- */

  /* 1. Initial state for entering elements */
  .notification.enter {
    opacity: 0;
    transform: translateX(100%);
  }

  /* 2. Final state for leaving elements */
  .notification.leave {
    opacity: 0;
    transform: translateX(100%);
  }
`;


function injectNotificationSystemStyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

// --- The UI Component ---
export function NotificationSystem() {
  injectNotificationSystemStyles();
  
  return Portal({
    mount: document.body,
    children: h.div(
      { class: 'notification-toaster' },
      AnimatedFor({
        each: notifications,
        key: (n) => n.id,
        enterClass: 'enter',
        leaveClass: 'leave',
        animationDuration: 600, // Must match the CSS animation duration
        children: (notification) =>
          h.div(
            {
              class: `notification ${notification().type}`,
              // Allow manual dismissal by clicking
              onClick: () => removeNotification(notification().id)
            },
            notification().message
          )
      })
    )
  });
}
