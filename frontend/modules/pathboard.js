import { el, action, heading, panel, empty, notice } from './dom.js';
import { careerDetail } from './career-detail.js';

const questions = {
  interests: 'What interests me?',
  concerns: 'What concerns me?',
  heard: 'What have I heard?',
  verify: 'What do I want to verify?',
  enjoyed: 'What did I enjoy?',
  disliked: 'What did I dislike?',
  difficult: 'What was difficult?',
  improve: 'What would I want to become better at?',
  professional: 'Would I want to do similar work professionally?',
};
function reflectionForm(career, entry, api) {
  const form = el('form', undefined, 'reflection-form');
  const fields = el('fieldset');
  fields.append(el('legend', `Your reflection on ${career.name}`));
  for (const [key, question] of Object.entries(questions)) {
    const label = el('label', question);
    const input = el('textarea');
    input.name = key;
    input.maxLength = 1000;
    input.rows = 2;
    input.value = entry.reflection?.[key] ?? '';
    label.append(input);
    fields.append(label);
  }
  const label = el('label', 'Would I explore this further?');
  const select = el('select');
  select.name = 'exploreFurther';
  for (const text of ['', 'Yes', 'Maybe', 'No']) {
    const option = el('option', text || 'Choose an answer');
    option.value = text;
    select.append(option);
  }
  select.value = entry.reflection?.exploreFurther ?? '';
  label.append(select);
  fields.append(label);
  const evidenceLabel = el('label', 'What did you make or try?');
  const evidence = el('textarea');
  evidence.name = 'evidence';
  evidence.maxLength = 2000;
  evidence.rows = 3;
  evidence.value = entry.experiment?.evidence ?? '';
  evidenceLabel.append(evidence);
  fields.append(evidenceLabel);
  fields.append(
    el(
      'p',
      'To finish an experiment, describe your work, answer the five experience questions, and choose Yes, Maybe, or No. This records your reflection; it does not certify a skill.',
      'fine-print',
    ),
  );
  const error = el('p', '', 'error');
  error.hidden = true;
  error.setAttribute('role', 'alert');
  const save = el('button', 'Save reflection', 'button secondary');
  save.type = 'submit';
  save.value = 'reflect';
  const complete = el('button', 'Finish experiment', 'button');
  complete.type = 'submit';
  complete.value = 'complete-experiment';
  fields.append(save, complete, error);
  form.append(fields);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    fields.disabled = true;
    error.hidden = true;
    try {
      await api.save('pathboard', 'PATCH', {
        careerId: career.id,
        action: event.submitter.value,
        reflection: data,
        evidence: data.evidence,
      });
      notice('Saved to your private Pathboard.');
    } catch (failure) {
      error.textContent = failure.message;
      error.hidden = false;
    } finally {
      fields.disabled = false;
    }
  });
  return form;
}
function comparison(careers) {
  const panelNode = panel(
    'Compare your directions',
    'Read the differences and add your own observations below. There is no best-career score.',
  );
  const wrapper = el('div', undefined, 'comparison-scroll');
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Career comparison, scroll horizontally on small screens');
  const table = el('table', undefined, 'career-comparison');
  table.append(el('caption', 'Your saved career options'));
  const head = el('thead');
  const header = el('tr');
  const first = el('th', 'Compare');
  first.scope = 'col';
  header.append(first);
  for (const career of careers) {
    const cell = el('th', career.name);
    cell.scope = 'col';
    header.append(cell);
  }
  head.append(header);
  table.append(head);
  const body = el('tbody');
  for (const [label, key] of [
    ['Typical work', 'work'],
    ['Focus', 'focus'],
    ['Work environment', 'environment'],
    ['Starter skills', 'skills'],
    ['Tools to explore', 'technologies'],
  ]) {
    const row = el('tr');
    const title = el('th', label);
    title.scope = 'row';
    row.append(title);
    for (const career of careers)
      row.append(el('td', Array.isArray(career[key]) ? career[key].join(' · ') : career[key]));
    body.append(row);
  }
  table.append(body);
  wrapper.append(table);
  panelNode.append(wrapper);
  return panelNode;
}
export function renderPathboard(state, controls) {
  const root = el('div');
  root.append(
    heading(
      'My Pathboard',
      'Keep options, experiments, and reflections together. Saving a career does not change your active Path.',
      'Pathboard',
    ),
  );
  const careers = state.explorationCareers.filter((career) =>
    state.pathboard.saved.includes(career.id),
  );
  if (!careers.length) {
    const card = empty(
      'Start with two directions.',
      'Add a career from Explore, try the work, and record what you learn.',
    );
    card.append(action('Explore careers →', () => controls.changeView('explore'), 'button'));
    root.append(card);
    return root;
  }
  if (careers.length >= 2) root.append(comparison(careers));
  for (const career of careers) {
    const entry = state.pathboard.entries[career.id] ?? {};
    const card = panel(career.name, career.description);
    card.append(
      el(
        'p',
        `Experiment: ${entry.experiment?.status === 'completed' ? 'Completed' : entry.experiment?.status === 'in-progress' ? 'In progress' : 'Not started'}`,
        'chip',
      ),
    );
    card.append(careerDetail(career, state, controls));
    const reflection = el('details');
    reflection.append(
      el('summary', 'Reflect and record your experiment'),
      reflectionForm(career, entry, controls.api),
    );
    const remove = action(
      'Remove from board',
      async () => {
        remove.disabled = true;
        try {
          await controls.api.save('pathboard', 'PATCH', { careerId: career.id, action: 'unsave' });
        } catch (error) {
          notice(error.message, true);
          remove.disabled = false;
        }
      },
      'text-button',
    );
    card.append(
      reflection,
      el('p', 'Removing an option keeps its reflections for when you add it again.', 'fine-print'),
      remove,
    );
    root.append(card);
  }
  return root;
}
