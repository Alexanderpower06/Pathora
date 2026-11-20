import { action, notice } from './dom.js';
export function saveCareer(career, state, controls) {
  const saved = state.pathboard?.saved.includes(career.id);
  const button = action(saved ? 'Saved ✓' : 'Save to Pathboard', async () => {
    if (controls.guest) {
      window.location.assign('/signup?start=1');
      return;
    }
    button.disabled = true;
    try {
      await controls.api.save('pathboard', 'PATCH', {
        careerId: career.id,
        action: saved ? 'unsave' : 'save',
      });
      notice(
        saved
          ? `${career.name} removed from saved careers. Your reflections are kept.`
          : `${career.name} saved to Pathboard. Keep exploring or compare another direction.`,
      );
      (
        document.querySelector(`[data-save-career="${career.id}"]`) ??
        document.querySelector('#explore-result-count')
      )?.focus({ preventScroll: true });
    } catch (error) {
      notice(error.message, true);
      button.disabled = false;
    }
  });
  button.dataset.saveCareer = career.id;
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', saved ? `Unsave ${career.name}` : 'Save to Pathboard');
  return button;
}
export function chooseCareer(career, state, controls) {
  const selected = state.profile?.role === career.id;
  const button = action(
    selected ? 'Continue Building Your Path →' : 'Choose This Path →',
    async () => {
      if (controls.guest) {
        window.location.assign('/signup?start=1');
        return;
      }
      button.disabled = true;
      try {
        if (!selected)
          await controls.api.save('profile', 'PUT', { ...state.profile, role: career.id });
        controls.changeView('roadmap');
      } catch (error) {
        notice(error.message, true);
        button.disabled = false;
      }
    },
    'button',
  );
  if (!controls.guest) button.disabled = !state.catalog.roles.some((role) => role.id === career.id);
  return button;
}
export function recordExplore(controls, careerId, actionName) {
  if (controls.guest) return;
  // View events never trigger a full workspace re-render or discard an in-progress form.
  controls.api.event({ careerId, action: actionName }).catch(() => {});
}
