import { el, action, panel, link, notice } from './dom.js';

export function careerDetail(career, state, { api, changeView }) {
  const details = el('details', undefined, 'career-detail');
  details.append(el('summary', 'Explore Path'));
  const work = panel('What you actually do', career.environment);
  const list = el('ul');
  for (const task of career.work) list.append(el('li', task));
  work.append(list, el('h3', 'Starter skills'));
  for (const skill of career.skills) work.append(el('span', skill, 'chip'));
  work.append(el('p', `Tools to explore: ${career.technologies.join(', ')}`));
  const experiment = panel('Career Experiment', career.experiment.title);
  experiment.append(
    el(
      'p',
      `About ${career.experiment.minutes} minutes. Adjust the activity to your starting point.`,
      'fine-print',
    ),
  );
  const steps = el('ol');
  for (const step of career.experiment.steps) steps.append(el('li', step));
  experiment.append(steps, el('p', `What to produce: ${career.experiment.deliverable}`));
  const start = action('Try this career →', async () => {
    start.disabled = true;
    try {
      await api.save('pathboard', 'PATCH', { careerId: career.id, action: 'start-experiment' });
      changeView('pathboard');
    } catch (error) {
      notice(error.message, true);
      start.disabled = false;
    }
  });
  experiment.append(start);
  const sources = panel('Why does Pathora say this?', career.methodology);
  if (career.sourceNote) sources.append(el('p', career.sourceNote));
  for (const source of career.sources)
    sources.append(
      link(`${source.title} ↗`, source.url),
      el('p', `${source.scope} · Reviewed ${source.reviewedOn}`, 'fine-print'),
    );
  const available = state.catalog.roles.some((role) => role.id === career.id);
  const choose = action(
    state.profile.role === career.id ? 'View my Path →' : 'Choose this Path →',
    async () => {
      choose.disabled = true;
      try {
        await api.save('profile', 'PUT', { ...state.profile, role: career.id });
        changeView('today');
      } catch (error) {
        notice(error.message, true);
        choose.disabled = false;
      }
    },
    'button',
  );
  choose.disabled = !available;
  details.append(
    work,
    experiment,
    sources,
    el(
      'p',
      available
        ? 'Choose what you currently want to work toward. You can Repath later; your previous evidence stays saved.'
        : 'You can explore this career now. Its Build curriculum is still being reviewed.',
      'fine-print',
    ),
    choose,
  );
  return details;
}
