import { el, action } from './dom.js';

// These buttons apply explicit filters. They do not rank or assign careers.
export const STARTING_POINTS = [
  ['All directions', ''],
  ['Build useful software', 'Software'],
  ['Understand data', 'Data'],
  ['Protect information', 'Security'],
  ['Keep systems running', 'Infrastructure'],
];
export function startingPoints(options, onChange) {
  const block = el('section', undefined, 'explore-start');
  const title = el('h2', 'What would you like to explore?');
  title.id = 'explore-start-title';
  block.setAttribute('aria-labelledby', title.id);
  block.append(
    title,
    el('p', 'Pick a type of work, or browse everything. You can change your mind.', 'muted'),
  );
  const buttons = el('div', undefined, 'explore-interest-buttons');
  for (const [label, field] of STARTING_POINTS) {
    const button = action(label, () => onChange(field), 'interest-button');
    button.dataset.careerField = field;
    button.setAttribute('aria-pressed', String((options.filters.field ?? '') === field));
    buttons.append(button);
  }
  block.append(buttons);
  return block;
}
export function activeFilters(options, clear) {
  const row = el('div', undefined, 'explore-active-filters');
  row.setAttribute('aria-label', 'Active career filters');
  for (const [key, value] of Object.entries(options.filters)) {
    if (!value) continue;
    const remove = action(`${value} ×`, () => clear(key), 'filter-chip');
    remove.setAttribute('aria-label', `Remove ${value} filter`);
    row.append(remove);
  }
  return row;
}
export function comparisonTray(careers, options, controls) {
  const tray = el('section', undefined, 'explore-compare-tray');
  tray.setAttribute('aria-label', 'Careers selected for comparison');
  const selected = careers.filter((career) => options.compareIds.includes(career.id));
  tray.hidden = !selected.length;
  tray.append(el('strong', `Compare ${selected.length} of 3`));
  const choices = el('div', undefined, 'comparison-picked');
  for (const career of selected)
    choices.append(
      action(
        `${career.name} ×`,
        () => {
          options.compareIds = options.compareIds.filter((id) => id !== career.id);
          controls.refreshExplore();
        },
        'filter-chip',
      ),
    );
  const compare = action(
    'Compare in Pathboard →',
    async () => {
      compare.disabled = true;
      try {
        await controls.api.save('pathboard', 'PATCH', {
          careerId: selected[0].id,
          action: 'compare',
          careerIds: selected.map((career) => career.id),
        });
        controls.changeView('pathboard');
      } catch (error) {
        message.textContent = error.message;
        compare.disabled = false;
      }
    },
    'button small',
  );
  compare.disabled = selected.length < 2;
  const message = el(
    'p',
    selected.length < 2
      ? 'Pick one more career to compare.'
      : 'Your comparison will be saved to Pathboard.',
    'fine-print',
  );
  message.setAttribute('role', 'status');
  tray.append(choices, compare, message);
  return tray;
}
