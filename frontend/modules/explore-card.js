import { el, action, panel } from './dom.js';
import { saveCareer, recordExplore } from './explore-actions.js';

export function exploreCard(career, state, controls, onCompare) {
  const options = controls.exploreState;
  const card = panel(career.name, career.description);
  card.classList.add('explore-card');
  card.dataset.career = career.id;
  const top = el('div', undefined, 'career-card-meta');
  top.append(el('span', career.field, 'career-field'));
  if (state.profile.role === career.id)
    top.append(el('span', 'Your current Path', 'current-path-badge'));
  card.prepend(top);
  const tasks = el('ul');
  for (const task of career.work.slice(0, 2)) tasks.append(el('li', task));
  card.append(tasks);
  const skills = el('div', undefined, 'career-card-skills');
  for (const skill of career.skills.slice(0, 3)) skills.append(el('span', skill, 'chip'));
  card.append(skills);
  const tryIt = el('div', undefined, 'career-try-preview');
  tryIt.append(
    el('span', 'A small way to try it', 'fine-print'),
    el('strong', career.experiment.title),
    el('span', `About ${career.experiment.minutes} minutes · adjust to your pace`, 'fine-print'),
  );
  card.append(tryIt);
  const facts = el('details', undefined, 'career-quick-facts');
  facts.append(
    el('summary', 'Education, pay & entry roles'),
    el('p', career.education),
    el('p', `Search titles: ${career.entryTitles.join(' · ')}`),
  );
  if (career.pay)
    facts.append(
      el('p', `US median $${career.pay.toLocaleString('en-US')} · May 2025`),
      el(
        'p',
        `${career.payOccupation}. All experience levels; not a starting salary.`,
        'fine-print',
      ),
    );
  else
    facts.append(el('p', 'Comparable salary data not verified for this role title.', 'fine-print'));
  if (career.outlook) facts.append(el('p', career.outlook, 'fine-print'));
  facts.append(el('p', `Reviewed ${career.reviewedOn} · Full sources inside`, 'fine-print'));
  card.append(facts);
  const actions = el('div', undefined, 'career-card-actions');
  actions.append(
    action(
      'Explore Career →',
      () => {
        recordExplore(controls, career.id, 'view');
        controls.openCareer(career.id);
      },
      'button',
    ),
    saveCareer(career, state, controls),
  );
  const compare = action(
    options.compareIds.includes(career.id) ? 'Selected to compare' : 'Compare',
    () => onCompare(career.id),
    'text-button compare-career',
  );
  compare.setAttribute('aria-pressed', String(options.compareIds.includes(career.id)));
  compare.setAttribute('aria-label', `Compare ${career.name}`);
  compare.dataset.compareCareer = career.id;
  actions.append(compare);
  card.append(actions);
  return card;
}
