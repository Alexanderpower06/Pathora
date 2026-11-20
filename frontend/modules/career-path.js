import { el, action, panel, link } from './dom.js';
import { recordExplore } from './explore-actions.js';

export function list(items, ordered = false) {
  const node = el(ordered ? 'ol' : 'ul');
  for (const item of items) node.append(el('li', item));
  return node;
}
export function milestoneView(milestone, career, state, controls) {
  const details = el('details', undefined, 'preparation-milestone');
  details.append(el('summary', milestone.title));
  details.addEventListener('toggle', () => {
    if (details.open) recordExplore(controls, career.id, 'milestone');
  });
  details.append(
    el('p', milestone.what),
    el('h4', 'Why it matters'),
    el('p', milestone.why),
    el('h4', 'When to learn it'),
    el('p', milestone.when),
    el('h4', 'Before starting'),
    el('p', milestone.prerequisiteNote),
    el('h4', 'Specific tasks'),
    list(milestone.tasks, true),
    el('h4', 'Evidence of completion'),
    el('p', milestone.evidence),
  );
  for (const source of milestone.resources) {
    const resource = link(`${source.title} ↗`, source.url);
    resource.addEventListener('click', () => recordExplore(controls, career.id, 'resource'));
    details.append(resource);
  }
  details.append(
    el('p', `Next: ${milestone.next}`),
    el('p', `${milestone.scope} Reviewed ${milestone.reviewedOn}.`, 'fine-print'),
  );
  if (state.profile?.role === career.id && controls.openTask) {
    const task = state.tasks.find((item) => item.id === milestone.id);
    if (task)
      details.append(
        action(
          task.status === 'done' ? 'View evidence in My Path' : 'Open milestone / Add evidence',
          () => controls.openTask(task),
          'button secondary',
        ),
      );
  } else
    details.append(
      el(
        'p',
        'Choose this Path below to work on its milestones in Build. You can explore without choosing.',
        'fine-print',
      ),
    );
  return details;
}
export function preparationPath(career, state, controls) {
  const root = panel(
    'Your Path to This Career',
    'A flexible preparation sequence. Start where your experience supports you, and apply to suitable opportunities while you continue learning. These stages are not hiring guarantees.',
  );
  root.id = 'career-path';
  const stages = [
    [
      'Understand the career',
      'Read the work, entry-title examples, and occupational sources. Write down one assumption you want to test before choosing.',
      [],
    ],
    [
      'Build your foundation',
      'Practice a small outcome, check it, and explain your choices. Equivalent coursework or experience can give you a starting point.',
      career.milestones.slice(0, 4),
    ],
    [
      'Learn role-specific technologies',
      'Choose tools for the work you want to do. Employer requirements vary; learning every framework is not the goal.',
      career.milestones.slice(4, 5),
    ],
    ['Build a relevant project', career.project.description, career.milestones.slice(5, 6)],
    [
      'Gain experience',
      'Choose useful opportunities, not a checklist of obligations: a student team, research project, campus technology job, open-source contribution, or internship can provide practice and feedback. Check the actual responsibilities and eligibility.',
      [],
    ],
    [
      'Prepare for applications',
      'Show your contribution, explain tradeoffs, seek resume feedback, and practice technical and behavioral conversations.',
      career.milestones.slice(6, 7),
    ],
    [
      'Apply and improve',
      'Required and preferred qualifications are different. Review actual postings, apply when eligible, track outcomes, and use feedback to adjust your next action.',
      career.milestones.slice(7),
    ],
  ];
  stages.forEach(([title, description, milestones], index) => {
    const stage = el('details', undefined, 'path-stage');
    stage.open = index === 1;
    stage.append(el('summary', `Stage ${index + 1} — ${title}`), el('p', description));
    for (const milestone of milestones)
      stage.append(milestoneView(milestone, career, state, controls));
    if (index === 3)
      stage.append(
        el('p', `Difficulty: ${career.project.difficulty}`),
        el('h3', 'Example features'),
        list(career.project.features),
        el('h3', 'Portfolio presentation'),
        el('p', career.project.presentation),
      );
    root.append(stage);
  });
  return root;
}
export function studentGuidance() {
  const block = panel(
    'What should I do during college?',
    'Choose the situation that describes your preparation, not your academic year. These are flexible suggestions.',
  );
  for (const [title, text] of [
    [
      'Early exploration',
      'Compare two kinds of work, try small experiments, and bring your questions to a professor or career adviser.',
    ],
    [
      'Developing skills',
      'Use relevant coursework to practice foundations. Build one small result you can explain before adding more tools.',
    ],
    [
      'Preparing for internships',
      'Match project evidence to actual postings, get resume feedback, and apply to opportunities whose criteria you meet.',
    ],
    [
      'Approaching graduation',
      'Review current target roles and eligibility, improve weak evidence, practice interviews, and keep applying while you learn.',
    ],
  ]) {
    const details = el('details');
    details.append(el('summary', title), el('p', text));
    block.append(details);
  }
  return block;
}
