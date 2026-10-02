import { el, action, heading, panel, link, notice } from './dom.js';

export function renderDirection(state, { api, changeView }) {
  const root = el('div');
  root.append(
    heading(
      'Choose a direction to try.',
      'Suggestions use your selected interests and reported skills. They are starting points, not predictions of fit.',
      'Your direction',
    ),
  );
  const grid = el('div', undefined, 'role-grid');
  for (const role of state.recommendations) {
    const card = panel(role.name, role.description);
    if (role.id === state.profile.role)
      card.prepend(el('span', 'Your current direction', 'chip selected'));
    const reasons = el('div', undefined, 'role-reasons');
    reasons.append(el('h3', 'Why this appeared'));
    for (const reason of role.reasons) reasons.append(el('p', reason));
    card.append(reasons, el('h3', 'Starter skills'));
    for (const skill of role.skills) card.append(el('span', skill, 'chip'));
    card.append(
      el('p', role.stretch, 'fine-print'),
      link('Explore the learning guide ↗', role.source.url),
    );
    const choose = action(
      role.id === state.profile.role ? 'View my plan →' : 'Try this direction →',
      async () => {
        choose.disabled = true;
        try {
          await api.save('profile', 'PUT', { ...state.profile, role: role.id });
          changeView('today');
        } catch (error) {
          notice(error.message, true);
        } finally {
          choose.disabled = false;
        }
      },
      'button secondary',
    );
    card.append(choose);
    grid.append(card);
  }
  root.append(grid);
  const details = panel(
    'How suggestions work',
    state.selectedRole?.categories
      ? 'These are predefined careers you can explore. Changing your goal updates requirements and the roadmap, while retaining skills and past progress. The onboarding career finder uses a separate, explained preference score.'
      : 'An interest match contributes three points. Each overlapping reported starter skill contributes one point. Ties are ordered consistently. Major does not restrict which direction you may try.',
  );
  details.append(
    el(
      'p',
      `Starter content reviewed ${state.catalog.reviewedOn}. These learning guides are not live internship requirements. Always check individual postings.`,
      'fine-print',
    ),
  );
  root.append(details);
  return root;
}
