import { createSignal, h, Model } from 'aided-core';

export function ProfileTab() {
  const [username, setUsername] = createSignal('AidedUser');

  return h.div(
    h.h3('User Profile'),
    h.p('Here you can edit your profile information.'),
    h.label('Username: '),
    h.input({
      type: 'text',
      ref: (el: HTMLInputElement) => Model(el, [username, setUsername])
    }),
    h.span('You have typed: ', username),
  );
}
