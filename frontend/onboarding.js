import { $, el, action } from './modules/dom.js';
import { authRequest, requireSession } from './modules/session.js';
import { screenHeading, renderStep } from './modules/onboarding-views.js';
import { collect } from './modules/onboarding-fields.js';
let state,
  account,
  busy = false;
async function request(path = '', method = 'GET', data) {
  const response = await fetch('/api/student/onboarding' + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Pathora-Account': account.id },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response.json();
  if (response.status === 401) {
    window.location.replace('/login');
    throw new Error('Sign in again to continue.');
  }
  if (!response.ok) throw new Error(result.error || 'Unable to save this step. Try again.');
  return result;
}
function error(message) {
  const node = $('#setup-error');
  if (node) {
    node.textContent = message;
    node.hidden = false;
    node.focus();
  } else $('#save-status').textContent = message;
}
let draftTimer;
let draftQueue = Promise.resolve();
function saveDraft() {
  clearTimeout(draftTimer);
  const form = $('#setup-form');
  if (!state || state.step > 5 || !form) return draftQueue;
  const payload = { step: state.step, stage: state.stage, answers: collect(form, state) };
  draftQueue = draftQueue.catch(() => {}).then(() => request('/draft', 'PUT', payload));
  return draftQueue;
}
async function update(path, method, data) {
  if (busy) return;
  busy = true;
  for (const button of $('#onboarding-view').querySelectorAll('button')) button.disabled = true;
  $('#save-status').textContent = 'Saving…';
  try {
    await saveDraft();
    state = await request(path, method, data);
    render();
  } catch (failure) {
    error(failure.message);
    $('#save-status').textContent = 'Not saved — try again';
  } finally {
    busy = false;
    for (const button of $('#onboarding-view').querySelectorAll('button')) button.disabled = false;
  }
}
function back() {
  if (state.step === 3 && state.stage !== 'goal') {
    const target = { interests: 'goal', quiz: 'interests', matches: 'quiz' }[state.stage];
    return update('/finder', 'PUT', { stage: 'back', target });
  }
  return update('', 'PATCH', { step: state.step - 1 });
}
function render() {
  if (state.completed) {
    window.location.replace('/workspace');
    return;
  }
  const step = Math.min(5, state.step);
  $('#step-label').textContent = state.step === 6 ? 'Five steps complete' : `Step ${step} of 5`;
  $('#save-status').textContent = state.demo
    ? 'Demo · saved until restart'
    : 'Saved to your account';
  $('#step-progress').replaceChildren(
    ...['Situation', 'Education', 'Career goal', 'Skills', 'Experience'].map((title, index) => {
      const li = el(
        'li',
        title,
        index + 1 < state.step ? 'done' : index + 1 === state.step ? 'active' : '',
      );
      if (index + 1 === state.step) li.setAttribute('aria-current', 'step');
      return li;
    }),
  );
  const form = el('form', undefined, 'setup-card');
  form.id = 'setup-form';
  form.noValidate = true;
  const scheduleDraft = () => {
    for (const input of form.querySelectorAll('[aria-invalid]')) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    $('#save-status').textContent = 'Unsaved changes…';
    clearTimeout(draftTimer);
    draftTimer = setTimeout(
      () =>
        saveDraft()
          .then(() => {
            $('#save-status').textContent = state.demo
              ? 'Demo · saved until restart'
              : 'Saved to your account';
          })
          .catch((failure) => {
            $('#save-status').textContent = 'Not saved';
            error(failure.message);
          }),
      500,
    );
  };
  form.addEventListener('input', scheduleDraft);
  form.addEventListener('change', scheduleDraft);
  renderStep(state, form, { finder: (stage) => update('/finder', 'PUT', { stage }) });
  const message = el('p', undefined, 'form-error');
  message.id = 'setup-error';
  message.hidden = true;
  message.tabIndex = -1;
  message.setAttribute('role', 'alert');
  form.append(message);
  const controls = el('div', undefined, 'setup-actions');
  if (state.step > 1) controls.append(action('← Back', back, 'button secondary'));
  else controls.append(el('span'));
  const next = el(
    'button',
    state.step === 6
      ? 'View my Pathora →'
      : state.step === 5
        ? 'See my path →'
        : state.step === 3 && state.stage === 'quiz'
          ? 'See career matches →'
          : 'Continue →',
    'button',
  );
  next.type = 'submit';
  controls.append(next);
  form.append(controls);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.step === 6) return update('/complete', 'POST', {});
    const answers = collect(form, state);
    const invalid = form.querySelector('input:invalid, select:invalid, textarea:invalid');
    if (invalid) {
      const label =
        invalid.closest('fieldset')?.querySelector('legend')?.textContent ??
        document.querySelector(`label[for="${invalid.id}"]`)?.textContent ??
        'required information';
      invalid.setAttribute('aria-invalid', 'true');
      invalid.setAttribute('aria-describedby', 'setup-error');
      error(`Please complete ${label.toLowerCase()}.`);
      return;
    }
    if (state.step === 3 && ['interests', 'quiz'].includes(state.stage))
      return update('/finder', 'PUT', { stage: state.stage, answers });
    if (state.step === 5 && !answers.experienceKinds.length) {
      error('Choose an experience option, including None Yet if you’re starting out.');
      return;
    }
    if (state.step === 3 && !answers.role) {
      error('Open a career and select it to continue.');
      return;
    }
    return update('/step', 'PUT', { step: state.step, answers });
  });
  $('#onboarding-view').replaceChildren(screenHeading(state), form);
  $('#onboarding-content').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
$('#onboarding-signout').addEventListener('click', async () => {
  try {
    await saveDraft();
    await authRequest('logout', {});
    window.location.assign('/login');
  } catch (failure) {
    error(failure.message);
  }
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});
async function connect() {
  try {
    account = await requireSession();
    if (!account) return;
    state = await request();
    render();
  } catch (failure) {
    $('#onboarding-view').replaceChildren(
      el('h1', 'Let’s reconnect your setup.'),
      el('p', failure.message),
      action('Try again', connect),
    );
    $('#save-status').textContent = 'Not connected';
  }
}
connect();
