import { el, action, heading, panel, notice } from './dom.js';
import { careerDetail } from './career-detail.js';

export function renderExplore(state, controls) {
  const root = el('div');
  root.append(
    heading(
      'Explore before you choose.',
      'Five technology directions. Compare the work, try an experiment, and decide what is worth pursuing. There is no automatic career assignment.',
      'Explore',
    ),
  );
  const grid = el('div', undefined, 'role-grid');
  for (const career of state.explorationCareers) {
    const card = panel(career.name, career.description);
    card.append(el('p', career.focus));
    const saved = state.pathboard.saved.includes(career.id);
    const save = action(saved ? 'Open in Pathboard →' : 'Add to Pathboard', async () => {
      save.disabled = true;
      try {
        if (!saved)
          await controls.api.save('pathboard', 'PATCH', { careerId: career.id, action: 'save' });
        controls.changeView('pathboard');
      } catch (error) {
        notice(error.message, true);
        save.disabled = false;
      }
    });
    card.append(save, careerDetail(career, state, controls));
    grid.append(card);
  }
  root.append(grid);
  return root;
}
