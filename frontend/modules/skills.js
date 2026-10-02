import { el, heading, panel, action } from './dom.js';
export function renderSkills(state, openProfile) {
  const root = el('div');
  root.append(
    heading(
      'Build on what you know.',
      'Your selected skills are self-reported. Match counts compare them with our defined starter requirements.',
      'My skills',
    ),
  );
  if (state.skillMatch) {
    const card = panel(
      'Current core skill match',
      `${state.skillMatch.have.length} of ${state.skillMatch.total} core skills · ${state.skillMatch.percent}%`,
    );
    const progress = el('progress');
    progress.max = 100;
    progress.value = state.skillMatch.percent;
    progress.setAttribute('aria-label', 'Core skill match');
    card.append(
      progress,
      el('p', 'This is a skill comparison, not a hiring probability.', 'fine-print'),
    );
    root.append(card);
  }
  const columns = el('div', undefined, 'two-grid');
  const have = panel('Skills you have');
  for (const skill of state.profile.existingSkills)
    have.append(
      el(
        'p',
        `${skill}${state.profile.skillLevels?.[skill] ? ` · ${state.profile.skillLevels[skill]} (self-reported)` : ''}`,
      ),
    );
  for (const skill of state.profile.additionalSkills ?? []) have.append(el('p', skill));
  if (!state.profile.existingSkills.length && !state.profile.additionalSkills?.length)
    have.append(el('p', 'Your first skill starts with practice.'));
  const gaps = panel('Skills to develop');
  for (const skill of state.gaps) gaps.append(el('span', skill, 'chip'));
  if (!state.gaps.length)
    gaps.append(
      el(
        'p',
        state.selectedRole
          ? 'Build evidence for the skills you have reported.'
          : 'Choose a career goal to compare its requirements.',
      ),
    );
  columns.append(have, gaps);
  root.append(columns, action('Update my skills →', openProfile, 'button'));
  return root;
}
