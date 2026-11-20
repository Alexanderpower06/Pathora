import { el, action, heading, panel, empty, notice } from './dom.js';
import { careerDetailPage } from './career-detail.js';
import { recordExplore } from './explore-actions.js';
import { startingPoints, activeFilters, comparisonTray } from './explore-guidance.js';
import { exploreCard } from './explore-card.js';
import { FILTERS, filterOptions, filterCareers } from './explore-search.js';

export function renderExplore(state, controls) {
  const options = controls.exploreState;
  options.compareIds ??= [];
  const selected = state.explorationCareers.find((career) => career.id === options.career);
  if (selected) return careerDetailPage(selected, state, controls);
  const root = el('div', undefined, 'explore-page');
  root.append(
    heading(
      'Explore Your Future',
      'Find a direction worth trying. Compare the work, try a small activity, and choose your next step.',
      'Discover · Understand · Try',
    ),
  );
  const intro = el('div', undefined, 'explore-intro');
  intro.append(
    el('span', `${state.explorationCareers.length} researched directions`, 'chip'),
    el('span', 'Your choice. No match score.', 'muted'),
  );
  if (!controls.guest)
    intro.append(
      action(
        `Pathboard · ${state.pathboard.saved.length} saved`,
        () => controls.changeView('pathboard'),
        'text-button',
      ),
    );
  root.append(
    intro,
    startingPoints(options, (field) => {
      options.filters.field = field;
      update();
    }),
  );
  const searchPanel = panel();
  searchPanel.classList.add('explore-search');
  const label = el('label', 'Find a career');
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Search careers, job titles, or skills...';
  search.value = options.query ?? '';
  label.append(search);
  searchPanel.append(label);
  const filterDisclosure = el('details', undefined, 'explore-filter-disclosure');
  filterDisclosure.open = false;
  const filterSummary = el('summary', 'Filters · 6 options');
  const filters = el('div', undefined, 'explore-filters');
  for (const [key, title] of FILTERS) {
    const wrapper = el('label', title);
    const select = el('select');
    const any = el('option', 'All');
    any.value = '';
    select.append(any);
    for (const value of filterOptions(state.explorationCareers, key)) {
      const item = el('option', value);
      item.value = value;
      select.append(item);
    }
    select.dataset.filterKey = key;
    select.value = options.filters[key] ?? '';
    select.addEventListener('change', () => {
      options.filters[key] = select.value;
      update();
    });
    wrapper.append(select);
    filters.append(wrapper);
  }
  filterDisclosure.append(filterSummary, filters);
  searchPanel.append(
    filterDisclosure,
    action(
      'Clear search and filters',
      () => {
        options.query = '';
        options.filters = {};
        options.savedOnly = false;
        search.value = '';
        savedOnly.checked = false;
        update();
      },
      'text-button',
    ),
  );
  const savedLabel = el('label', undefined, 'explore-saved-toggle');
  const savedOnly = el('input');
  savedOnly.type = 'checkbox';
  savedOnly.checked = Boolean(options.savedOnly);
  savedLabel.append(savedOnly, el('span', 'Saved careers only'));
  savedOnly.addEventListener('change', () => {
    options.savedOnly = savedOnly.checked;
    update();
  });
  searchPanel.append(savedLabel);
  const chips = el('div');
  const tray = el('div');
  const count = el('p', '', 'muted');
  count.id = 'explore-result-count';
  count.tabIndex = -1;
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  const grid = el('div', undefined, 'explore-grid');
  function update() {
    options.query = search.value;
    for (const button of root.querySelectorAll('[data-career-field]'))
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.careerField === (options.filters.field ?? '')),
      );
    for (const select of filters.querySelectorAll('select'))
      select.value = options.filters[select.dataset.filterKey] ?? '';
    const active = Object.values(options.filters).filter(Boolean).length;
    filterSummary.textContent = active ? `Filters · ${active} active` : 'Filters · 6 options';
    const careers = filterCareers(state.explorationCareers, options.query, options.filters).filter(
      (career) => !options.savedOnly || state.pathboard.saved.includes(career.id),
    );
    chips.replaceChildren(
      activeFilters(options, (key) => {
        delete options.filters[key];
        update();
        count.focus({ preventScroll: true });
      }),
    );
    tray.replaceChildren(comparisonTray(state.explorationCareers, options, controls));
    count.textContent = `${careers.length} ${careers.length === 1 ? 'career' : 'careers'} found`;
    grid.replaceChildren();
    for (const career of careers)
      grid.append(
        exploreCard(career, state, controls, (id) => {
          if (options.compareIds.includes(id))
            options.compareIds = options.compareIds.filter((value) => value !== id);
          else if (options.compareIds.length < 3) options.compareIds.push(id);
          else {
            notice('Compare up to three careers at a time. Remove one to add another.');
            return;
          }
          update();
          grid.querySelector(`[data-compare-career="${id}"]`)?.focus({ preventScroll: true });
        }),
      );
    if (!careers.length)
      grid.append(
        empty(
          options.savedOnly && !state.pathboard.saved.length
            ? 'No saved careers yet.'
            : 'No careers match those filters.',
          options.savedOnly
            ? 'Turn off Saved careers only to browse directions and save something you want to revisit.'
            : 'Try a broader keyword or clear one of the filters. Your degree does not restrict your choices.',
        ),
      );
  }
  search.addEventListener('input', update);
  search.addEventListener('change', () => {
    if (state.explorationCareers[0]) recordExplore(controls, null, 'search');
  });
  root.append(searchPanel, chips, count, tray, grid);
  update();
  return root;
}
