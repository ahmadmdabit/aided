import { h, createSignal, Portal } from 'aided-core';
import { AnimatedFor } from './AnimatedFor';

// --- Types ---
export type NotificationType = 'info' | 'error' | 'success' | 'warning';

export type Notification = {
  id: number;
  message: string;
  type: NotificationType;
  persistent: boolean;
};

export type ToasterOptions = {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  defaultDuration?: number;
};

export type AddNotificationOptions = {
  type?: NotificationType;
  duration?: number; // Overrides default
  persistent?: boolean;
};

// --- Style Injection (with position support) ---
const WIDGET_STYLE_ID = 'aided-notification-toaster-styles';

const widgetCSS = `
  .notification-toaster {
    position: fixed;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  /* Position classes */
  .notification-toaster.top-right { top: 20px; right: 20px; }
  .notification-toaster.top-left { top: 20px; left: 20px; }
  .notification-toaster.bottom-right { bottom: 20px; right: 20px; }
  .notification-toaster.bottom-left { bottom: 20px; left: 20px; }

  .notification {
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    color: white;
    cursor: pointer;
    transition: all 0.5s ease;
    width: 320px;
  }
  .notification.success { background-color: #4CAF50; }
  .notification.warning { background-color: #FF9800; }
  .notification.error { background-color: #f4364fff; }
  .notification.info { background-color: #2196F3; }

  .notification.enter { opacity: 0; transform: translateX(120%); }
  .notification.leave { opacity: 0; transform: scale(0.8); }
  .notification-toaster.top-left .notification.enter,
  .notification-toaster.bottom-left .notification.enter { transform: translateX(-120%); }
`;

function injectNotificationSystemStyles() {
  if (document.getElementById(WIDGET_STYLE_ID)) return;
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

// --- The Headless Factory Function ---
export function createToaster(options: ToasterOptions = {}) {
  const {
    position = 'top-right',
    defaultDuration = 4000,
  } = options;

  let notificationId = 0;
  const [notifications, setNotifications] = createSignal<Notification[]>([]);

  // --- Logic Functions (API) ---
  const add = (message: string, addOptions: AddNotificationOptions = {}) => {
    const id = ++notificationId;
    const persistent = addOptions.persistent ?? false;
    const duration = addOptions.duration ?? defaultDuration;

    const newNotification: Notification = {
      id,
      message,
      type: addOptions.type ?? 'info',
      persistent,
    };

    setNotifications([...notifications(), newNotification]);

    // Only set a timeout for non-persistent notifications
    if (!persistent) {
      setTimeout(() => remove(id), duration);
    }
  };

  const remove = (id: number) => {
    setNotifications(notifications().filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // --- The UI Component ---
  const ToasterComponent = () => {
    // Style injection remains the same, but could also be made dynamic
    injectNotificationSystemStyles();

    return Portal({
      mount: document.body,
      children: h.div(
        { class: `notification-toaster ${position}` },
        AnimatedFor<Notification>({
          each: notifications,
          key: (n) => n.id,
          enterClass: 'enter',
          leaveClass: 'leave',
          animationDuration: 500,
          children: (notification) =>
            h.div(
              {
                class: `notification ${notification().type}`,
                // All notifications are dismissible on click
                onClick: () => remove(notification().id)
              },
              notification().message
            )
        })
      )
    });
  };

  // Return the API and the Component
  return {
    add,
    remove,
    clearAll,
    ToasterComponent,
    notifications // Expose the signal for advanced use cases
  };
}
