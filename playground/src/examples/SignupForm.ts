import { h, createSignal, createMemo, Model, Show } from 'aided-core';
import { CodeSnippet } from '../components/CodeSnippet';

const signupFormCode = `const [email, setEmail] = createSignal('');
const [password, setPassword] = createSignal('');

const emailError = createMemo(() => {
  if (!email()) return 'Email is required.';
  if (!/^\\S+@\\S+\\.\\S+$/.test(email())) return 'Please enter a valid email.';
  return null;
});

const isFormValid = createMemo(() => !emailError() && !passwordError());

return h.form({ onSubmit: handleSubmit, noValidate: true },
  h.input({
    ref: (el: HTMLInputElement) => Model(el, [email, setEmail]),
  }),
  h.button({ type: 'submit', disabled: () => !isFormValid() }, 'Sign Up')
);`;

export const SignupForm = () => {
  // 1. State: One signal for each form field
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  // 2. Derived State: Validation logic in memos
  const emailError = createMemo(() => {
    if (!email()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(email())) return 'Please enter a valid email address.';
    return null; // No error
  });

  const passwordError = createMemo(() => {
    if (!password()) return 'Password is required.';
    if (password().length < 8) return 'Password must be at least 8 characters long.';
    return null; // No error
  });

  // 3. Composed Derived State: Check if the entire form is valid
  const isFormValid = createMemo(() => !emailError() && !passwordError());

  // --- Event Handler ---
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!isFormValid()) return;
    alert(`Form submitted successfully!\nEmail: ${email()}\nPassword: ${password()}`);
  };

  // --- UI ---
  return h.div(
    h.form({ onSubmit: handleSubmit, noValidate: true },
      h.h2('Signup'),
      h.div({ class: 'form-group' },
        h.label({ for: 'email' }, 'Email'),
        h.input({
          'data-testid': 'signup-email-input',
          id: 'email',
          type: 'email',
          ref: (el: HTMLInputElement) => Model(el, [email, setEmail]),
          'aria-invalid': () => !!emailError()
        }),
        // 4. Conditionally show the error message
        Show({
          when: emailError,
          children: () => h.span({ 'data-testid': 'email-error', class: 'text-error' }, emailError)
        })
      ),
      h.div({ class: 'form-group' },
        h.label({ for: 'password' }, 'Password'),
        h.input({
          'data-testid': 'signup-password-input',
          id: 'password',
          type: 'password',
          ref: (el: HTMLInputElement) => Model(el, [password, setPassword]),
          'aria-invalid': () => !!passwordError()
        }),
        Show({
          when: passwordError,
          children: () => h.span({ 'data-testid': 'password-error', class: 'text-error' }, passwordError)
        })
      ),
      h.button({
        'data-testid': 'signup-submit-button',
        type: 'submit',
        // 5. Reactively disable the button when the form is invalid
        disabled: () => !isFormValid()
      }, 'Sign Up')
    ),
    CodeSnippet({ code: signupFormCode })
  );
}
