import { renderExplore } from './modules/explore.js';
import { renderPathboard } from './modules/pathboard.js';
import { renderSkills } from './modules/skills.js';
import { $, el, action, notice } from './modules/dom.js';
import { createApi } from './modules/api.js';
import { setupProfile } from './modules/profile.js';
import { renderDashboard, renderEvidence } from './modules/dashboard.js';
import { renderSetup } from './modules/onboarding.js';
import { renderDirection } from './modules/direction.js';
import { renderRoadmap } from './modules/roadmap.js';
import { setupTaskDialog } from './modules/task-dialog.js';
import { setupApplications } from './modules/applications.js';
import { authRequest, requireSession } from './modules/session.js';

let state = null;
let account = null;
let view = 'today';
const api = createApi(
  (next) => {
    state = next;
    render();
  },
  () => account?.id,
);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});
const profile = setupProfile({ getState: () => state, api, onSaved: changeView });
const tasks = setupTaskDialog({ getState: () => state, api });
const applications = setupApplications({ getState: () => state, api });
function changeView(next) {
  view = next;
  notice('');
  render();
  $('#content').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
function render() {
  if (!state) return;
  const content = $('#content');
  $('#connection').textContent = state.demo
    ? 'Demo session · not persistent'
    : 'Saved in your workspace';
  $('#connection').classList.toggle('demo', Boolean(state.demo));
  if (!state.profile) {
    content.replaceChildren(renderSetup(profile.open));
    return;
  }
  const pages = {
    today: () => renderDashboard(state, { openTask: tasks.open, changeView }),
    explore: () => renderExplore(state, { api, changeView }),
    pathboard: () => renderPathboard(state, { api, changeView }),
    direction: () => renderDirection(state, { api, changeView }),
    skills: () => renderSkills(state, profile.open),
    roadmap: () => renderRoadmap(state, tasks.open),
    evidence: () => renderEvidence(state, tasks.open),
    applications: () => applications.render(state),
  };
  content.replaceChildren(pages[view]());
  for (const button of document.querySelectorAll('[data-view]')) {
    if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}
for (const button of document.querySelectorAll('[data-view]'))
  button.addEventListener('click', () => changeView(button.dataset.view));
for (const button of document.querySelectorAll('[data-close]'))
  button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
$('#edit-profile').addEventListener('click', profile.open);
$('#sign-out').addEventListener('click', async () => {
  const button = $('#sign-out');
  button.disabled = true;
  try {
    await authRequest('logout', {});
    window.location.assign('/login');
  } catch (error) {
    notice(error.message, true);
    button.disabled = false;
  }
});
async function connect() {
  try {
    account = await requireSession();
    if (!account) return;
    state = await api.load();
    if (!state.onboardingCompleted) {
      window.location.replace('/onboarding');
      return;
    }
    notice('');
    render();
    if (new URLSearchParams(window.location.search).get('start') === '1') {
      window.history.replaceState(null, '', '/workspace');
      if (!state.profile) profile.open();
    }
  } catch (error) {
    $('#connection').textContent = 'Not connected';
    $('#content').replaceChildren(
      el('h1', 'Let’s reconnect your workspace.'),
      el('p', error.message, 'lead'),
      action('Try again', connect, 'button'),
    );
  }
}
connect();
