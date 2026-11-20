import { el, action } from './dom.js';

// Native buttons with the WAI-ARIA tabs keyboard pattern; panels preserve form state.
export function careerTabs(career, options, sections) {
  options.detailTabs ??= {};
  const root = el('div', undefined, 'career-tabs');
  const tabs = el('div', undefined, 'career-section-nav');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Career sections');
  const panels = el('div');
  const buttons = [];
  const blocks = [];
  let active = sections.some(([id]) => id === options.detailTabs[career.id])
    ? options.detailTabs[career.id]
    : sections[0][0];
  function activate(id, focus = false) {
    active = id;
    options.detailTabs[career.id] = id;
    sections.forEach(([key], index) => {
      const selected = key === id;
      buttons[index].setAttribute('aria-selected', String(selected));
      buttons[index].tabIndex = selected ? 0 : -1;
      blocks[index].hidden = !selected;
    });
    if (focus) {
      buttons[sections.findIndex(([key]) => key === id)].focus({ preventScroll: true });
      tabs.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  for (const [id, title, content] of sections) {
    const button = action(title, () => activate(id, true), 'career-tab');
    button.id = `career-tab-${career.id}-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `career-panel-${career.id}-${id}`);
    const block = el('section', undefined, 'career-tab-panel');
    block.id = `career-panel-${career.id}-${id}`;
    block.setAttribute('role', 'tabpanel');
    block.setAttribute('aria-labelledby', button.id);
    block.tabIndex = 0;
    block.append(...content);
    buttons.push(button);
    blocks.push(block);
    tabs.append(button);
    panels.append(block);
    button.addEventListener('keydown', (event) => {
      const index = buttons.indexOf(button);
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % sections.length;
      else if (event.key === 'ArrowLeft') target = (index - 1 + sections.length) % sections.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = sections.length - 1;
      if (target !== undefined) {
        event.preventDefault();
        activate(sections[target][0], true);
      }
    });
  }
  root.append(tabs, panels);
  activate(active);
  return { root, activate };
}
