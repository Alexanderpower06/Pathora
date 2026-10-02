import { $, el, submit } from './modules/dom.js';
import { authRequest } from './modules/session.js';

const registering = window.location.pathname === '/signup';
const start = registering || new URLSearchParams(window.location.search).get('start') === '1';
const suffix = start ? '?start=1' : '';
const form = $('#auth-form');
$('#login-link').href = '/login' + suffix;
$('#signup-link').href = '/signup' + suffix;
$(registering ? '#signup-link' : '#login-link').setAttribute('aria-current', 'page');
document.title = `Pathora — ${registering ? 'Create account' : 'Sign in'}`;
$('#auth-title').textContent = registering ? 'Your next step starts here.' : 'Welcome back.';
$('#auth-description').textContent = registering
  ? 'Create an account to build and save your internship plan.'
  : 'Sign in to pick up your plan.';
$('#auth-submit').textContent = registering ? 'Create account →' : 'Sign in →';
$('#password').autocomplete = registering ? 'new-password' : 'current-password';
$('#password').minLength = registering ? 15 : 1;
$('#password-help').textContent = registering
  ? 'Use 15 to 128 characters. A phrase of several words works well.'
  : 'Use the password you created for Pathora.';
$('#confirm-field').hidden = !registering;
form.elements.confirmation.required = registering;
const alternate = el(
  'a',
  registering ? 'Already have an account? Sign in' : 'New to Pathora? Create an account',
);
alternate.href = (registering ? '/login' : '/signup') + suffix;
$('#auth-alternate').append(alternate);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  submit(form, '#auth-error', async () => {
    const { email, password, confirmation } = Object.fromEntries(new FormData(form));
    if (registering && password !== confirmation)
      throw new Error('Your passwords don’t match. Try again.');
    await authRequest(registering ? 'register' : 'login', { email, password });
    form.reset();
    window.location.assign('/onboarding');
  });
});
