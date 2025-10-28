/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from 'aided-core';
import { createToaster } from '../NotificationSystem/createToaster';

const toaster = createToaster({
  position: 'top-right',
  defaultDuration: 2000,
});

export function SettingsTab() {
  return h.div(
    h.h3('Application Settings'),
    h.div(
      h.input({
        type: 'checkbox',
        id: 'notifications',
        onChange: (e: any) => toaster.add(`Email notifications has been ${(e.target.checked ? 'enabled' : 'disabled')}.`, { type: 'success' })
      }),
      h.label({ for: 'notifications' }, ' Enable email notifications')
    ),

    toaster.ToasterComponent(),
  );
}
