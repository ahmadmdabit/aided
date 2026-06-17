import { h } from 'aided-core';
import { createToaster } from './createToaster';
import { CodeSnippet } from '../../components/CodeSnippet';

const toasterDemoCode = `const toaster = createToaster({
  position: 'bottom-right',
  defaultDuration: 5000,
});

return h.div(
  h.button({
    onClick: () => toaster.add('Success!', { type: 'success' })
  }, 'Add Success'),
  h.button({
    onClick: () => toaster.add('Error!', { type: 'error', persistent: true })
  }, 'Add Error'),
  h.button({ onClick: toaster.clearAll }, 'Clear All'),
  toaster.ToasterComponent()
);`;

// 1. Create a toaster instance. You can configure it here.
const toaster = createToaster({
  position: 'bottom-right',
  defaultDuration: 5000,
});

// You could even create a second, separate toaster instance!
const topLeftToaster = createToaster({ position: 'top-left' });

export function ToasterDemo() {
  return h.div(
    h.h1('Reusable Notification System'),
    h.p('Click the buttons to add different types of notifications.'),
    h.div(
      h.h3('Bottom-Right Toaster'),
      h.button({
        onClick: () => toaster.add('User logged in successfully.', { type: 'success' }),
        'data-testid': 'add-toast-success'
      }, 'Add Success'),
      
      h.button({
        onClick: () => toaster.add('This is a persistent error message. Click to dismiss.', { type: 'error', persistent: true }),
        'data-testid': 'add-toast-error'
      }, 'Add Persistent Error'),

      h.button({ 
        onClick: toaster.clearAll,
        'data-testid': 'clear-all-toasts'
      }, 'Clear All')
    ),
    h.div(
      h.h3('Top-Left Toaster'),
      h.button({
        onClick: () => topLeftToaster.add('Your session is about to expire.', { type: 'warning' }),
        'data-testid': 'add-toast-warning'
      }, 'Add Warning')
    ),

    // 2. Mount the UI component for each instance.
    toaster.ToasterComponent(),
    topLeftToaster.ToasterComponent(),
    CodeSnippet({ code: toasterDemoCode })
  );
}
