import { icon, photo } from '../../shared/presentation.ts';
import { header, footer } from '../../page/layout.ts';
import { required } from '../../shared/dom.ts';

export function createAuthView(app: HTMLElement, bindInfoLinks: () => void) {
  function authPage(mode: string): void {
    const signup = mode === 'signup';
    app.innerHTML = `${header(0, true)}<main id="main-content" class="auth-main" tabindex="-1"><section class="auth-layout" aria-labelledby="auth-title">
    <aside class="auth-story"><div class="auth-story-image">${photo(830, 98, 842, 271, false, true)}</div><div class="auth-story-copy"><p class="eyebrow">A LITTLE MORE THOUGHTFUL</p><h2>Good things.<br/>Everyday moments.</h2><p>A home that feels like you. A workspace that inspires you. Find the little things that make a difference.</p><span class="auth-story-signature">Thoughtfully yours, <span>ShopBoard.</span></span></div></aside>
    <div class="auth-panel"><div class="auth-form-wrap"><a href="#home" class="auth-back">← Back to the collection</a><p class="eyebrow">${signup ? 'MAKE YOURSELF AT HOME' : 'YOUR EVERYDAY, REVISITED'}</p><h1 id="auth-title">${signup ? 'A good place to begin.' : 'Welcome back.'}</h1><p class="auth-intro">${signup ? 'Create an account for a more considered everyday.' : 'A few favorite things are waiting for you.'}</p>
    <nav class="auth-tabs" aria-label="Account access"><a href="#login" ${!signup ? 'aria-current="page"' : ''}>Log in</a><a href="#signup" ${signup ? 'aria-current="page"' : ''}>Sign up</a></nav>
    <form class="auth-form">${signup ? '<div class="form-group"><label for="full-name">Full name</label><input id="full-name" name="name" type="text" autocomplete="name" minlength="2" placeholder="Alex Morgan" required/></div>' : ''}
    <div class="form-group"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required/></div>
    <div class="form-group"><label for="auth-password">Password</label><div class="password-field"><input id="auth-password" name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" ${signup ? 'minlength="8" aria-describedby="password-hint"' : ''} placeholder="${signup ? 'Create a password' : 'Enter your password'}" required/><button type="button" class="password-toggle icon-button" aria-label="Show password" aria-pressed="false">${icon('eye')}</button></div>${signup ? '<p id="password-hint" class="field-hint">Use at least 8 characters.</p>' : ''}</div>
    ${signup ? '<div class="form-group"><label for="confirm-password">Confirm password</label><input id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" placeholder="Re-enter your password" required/></div>' : '<button type="button" class="forgot-password text-button" data-info="Password reset">Forgot your password?</button>'}
    <button type="submit" class="button button-green auth-submit">${signup ? 'Create your account' : 'Log in'} ${icon('arrow')}</button><p class="auth-status" role="status" hidden></p>
    <p class="auth-demo-note">Account access is coming soon. This preview does not save or send your details.</p></form>
    <p class="auth-switch">${signup ? 'Already feel at home here?' : 'New to ShopBoard?'} <a href="#${signup ? 'login' : 'signup'}">${signup ? 'Log in' : 'Create an account'} →</a></p></div></div></section></main>${footer(true)}`;
    const password = required<HTMLInputElement>(app, '#auth-password');
    const confirm = app.querySelector<HTMLInputElement>('#confirm-password');
    const passwordToggle = required<HTMLButtonElement>(app, '.password-toggle');
    passwordToggle.addEventListener('click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      passwordToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      passwordToggle.setAttribute('aria-pressed', String(show));
    });
    if (confirm) {
      const validate = () =>
        confirm.setCustomValidity(
          confirm.value && confirm.value !== password.value ? 'Your passwords do not match.' : '',
        );
      confirm.addEventListener('input', validate);
      password.addEventListener('input', validate);
    }
    required<HTMLFormElement>(app, '.auth-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const status = required<HTMLElement>(app, '.auth-status');
      status.hidden = false;
      status.textContent = `${signup ? 'Your signup form is ready.' : 'Your login form is ready.'} Account ${signup ? 'creation' : 'sign-in'} will be available when the authentication service is connected. No details have been sent or saved.`;
    });
    bindInfoLinks();
  }
  return { render: authPage };
}
