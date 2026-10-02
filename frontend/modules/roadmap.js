import { el, heading, panel, link } from './dom.js';
import { taskCard } from './dashboard.js';

export function renderRoadmap(state, openTask) {
  const root = el('div');
  root.append(
    heading(
      'A path you can work through.',
      'Learn, build, ask for feedback, and apply alongside one another. The plan only uses prerequisites where a task needs earlier work.',
      'Your roadmap',
    ),
  );
  const overview = panel('The starter plan');
  overview.append(
    el(
      'p',
      `${state.completedCount} of ${state.tasks.length} steps completed. About ${state.estimatedWeeks} weeks of estimated task effort remain at your current time budget.`,
      'muted',
    ),
    el(
      'p',
      'This is an effort estimate, not a deadline or a promise of an internship. Your weekly plan updates when you complete a step or change your availability.',
      'fine-print',
    ),
  );
  root.append(overview);
  for (const task of state.tasks) {
    const card = taskCard(task, openTask);
    if (task.status !== 'todo')
      card.prepend(
        el(
          'span',
          task.status === 'done' ? 'Completed' : 'Needs help',
          'status-badge ' + task.status,
        ),
      );
    root.append(card);
  }
  const sources = panel(
    'Sources and scope',
    'Requirements vary by internship. Use the posting-comparison step to check eligibility and employer-specific requirements.',
  );
  for (const source of [
    ...state.catalog.sources,
    ...(state.selectedRole ? [state.selectedRole.source] : []),
  ])
    sources.append(link(source.title + ' ↗', source.url));
  sources.append(
    el(
      'p',
      `Reviewed ${state.catalog.reviewedOn}. Recommendations are curated starter guidance; they are not generated from live postings.`,
      'fine-print',
    ),
  );
  root.append(sources);
  return root;
}
