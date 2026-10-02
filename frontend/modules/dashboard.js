import { el, action, heading, panel, empty } from './dom.js';

export function taskCard(task, openTask) {
  const card = el('article', undefined, 'task-card');
  const summary = el('div');
  summary.append(
    el(
      'span',
      `${task.category} · ${task.hours} ${task.hours === 1 ? 'hour' : 'hours'}`,
      'task-meta',
    ),
    el('h3', task.title),
    el('p', task.why),
  );
  const button = action(
    task.status === 'blocked'
      ? 'Get unstuck →'
      : task.status === 'done'
        ? 'View evidence'
        : 'Open step →',
    () => openTask(task),
    'text-button',
  );
  card.append(summary, button);
  return card;
}
export function renderDashboard(state, { openTask, changeView }) {
  const root = el('div');
  root.append(
    heading(
      `A manageable next step, ${state.profile.name === 'there' ? 'there' : state.profile.name.split(' ')[0]}.`,
      state.selectedRole
        ? `Working toward a ${state.selectedRole.name.toLowerCase()} opportunity.`
        : 'You’re exploring. Let’s test a direction before choosing one.',
      'This week, at your pace',
    ),
  );
  root.append(
    el(
      'p',
      `Application target: ${state.profile.targetDate} · Graduation: ${state.profile.graduation || 'Not specified'}`,
      'task-meta',
    ),
  );
  for (const warning of state.warnings) root.append(el('p', warning, 'callout'));
  const hero = el('div', undefined, 'hero-grid');
  const next = panel();
  next.classList.add('next-card');
  next.append(el('p', 'Your next action', 'eyebrow'));
  if (state.next)
    next.append(
      el(
        'h2',
        state.next.status === 'blocked' ? `Get help with: ${state.next.title}` : state.next.title,
      ),
      el('p', state.next.why),
      el(
        'p',
        `${state.next.hours} ${state.next.hours === 1 ? 'hour' : 'hours'} · ${state.next.category}`,
        'task-meta',
      ),
      action('Start this step →', () => openTask(state.next), 'button'),
    );
  else
    next.append(
      el('h2', 'You’ve finished this starter plan.'),
      el(
        'p',
        'Review your applications, use feedback, and update your direction or weekly availability.',
      ),
      action('Review applications →', () => changeView('applications')),
    );
  const progress = panel('Your plan, your pace');
  const ring = el('div', undefined, 'completion-ring');
  ring.style.setProperty('--completion', state.completion + '%');
  ring.setAttribute('role', 'img');
  ring.setAttribute('aria-label', `${state.completion}% plan completion`);
  ring.append(el('strong', state.completion + '%'), el('span', 'Plan completion'));
  progress.append(
    ring,
    el('p', `${state.completedCount} of ${state.tasks.length} steps documented`, 'center'),
    el('p', 'This tracks your plan. It does not predict hiring success.', 'fine-print center'),
  );
  hero.append(next, progress);
  root.append(hero);
  const weekly = panel(
    'A realistic week',
    `${state.plannedHours} of your ${state.profile.weeklyHours} available hours planned. Estimates are a starting point; adjust if a task takes longer.`,
  );
  for (const id of state.weekly)
    weekly.append(
      taskCard(
        state.tasks.find((task) => task.id === id),
        openTask,
      ),
    );
  if (!state.weekly.length)
    weekly.append(
      el(
        'p',
        'No unfinished steps in your starter plan. Review your next application or ask for feedback.',
      ),
    );
  root.append(weekly);
  if (state.skillMatch) {
    const skills = panel(
      'Your current skill match',
      `${state.skillMatch.have.length} of ${state.skillMatch.total} defined core skills selected · ${state.skillMatch.percent}%`,
    );
    const bar = el('progress');
    bar.max = 100;
    bar.value = state.skillMatch.percent;
    bar.setAttribute('aria-label', 'Core skill match');
    skills.append(
      bar,
      el(
        'p',
        'This compares self-reported skills with our defined career requirements. It is not a hiring probability.',
        'fine-print',
      ),
    );
    if (state.skillMatch.have.length)
      skills.append(el('p', `Skills you have: ${state.skillMatch.have.join(', ')}`));
    root.append(skills);
  }
  const bottom = el('div', undefined, 'two-grid');
  const have = panel('You’re not starting from zero');
  for (const text of state.recognizedExperience) have.append(el('p', text, 'experience-line'));
  if (!state.recognizedExperience.length)
    have.append(
      el(
        'p',
        'Add class projects, clubs, volunteering, or a campus job to your profile. These can be useful examples.',
        'muted',
      ),
    );
  have.append(action('See your evidence →', () => changeView('evidence'), 'text-button'));
  const gaps = panel(
    'What needs attention',
    'These are skills you haven’t reported yet, not proof that you lack them.',
  );
  if (state.gaps.length) for (const gap of state.gaps) gaps.append(el('span', gap, 'chip'));
  else
    gaps.append(
      el(
        'p',
        state.selectedRole
          ? 'Demonstrate the skills you already reported through concrete work.'
          : 'Compare directions to find a useful starting point.',
        'muted',
      ),
    );
  gaps.append(action('Review your roadmap →', () => changeView('roadmap'), 'text-button'));
  bottom.append(have, gaps);
  root.append(bottom);
  if (state.reminders.length)
    root.append(
      action(
        `${state.reminders.length} application dates need attention →`,
        () => changeView('applications'),
        'button secondary',
      ),
    );
  return root;
}
export function renderEvidence(state, openTask) {
  const root = el('div');
  root.append(
    heading(
      'Make your experience visible.',
      'These are your own notes and links. They are not verified credentials.',
      'Your evidence',
    ),
  );
  const have = panel('Experience you already bring');
  for (const text of state.recognizedExperience) have.append(el('p', text, 'experience-line'));
  if (!state.recognizedExperience.length)
    have.append(el('p', 'Add your coursework and other experience in your profile.', 'muted'));
  root.append(have);
  if (!state.evidence.length)
    root.append(
      empty(
        'Your first example belongs here.',
        'Complete a step and describe what you did, or document work you already completed.',
      ),
    );
  for (const record of state.evidence) {
    const card = panel(record.title, record.evidence);
    card.append(
      action(
        'Review evidence →',
        () => openTask(state.tasks.find((task) => task.id === record.id)),
        'text-button',
      ),
    );
    root.append(card);
  }
  return root;
}
