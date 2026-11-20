import { $, el, link, submit } from './dom.js';

export function setupTaskDialog({ api, getState }) {
  let selected;
  let selectedRole;
  const form = $('#task-form');
  function open(task) {
    selected = task;
    selectedRole = getState().profile.role;
    $('#task-title').textContent = task.title;
    const details = $('#task-details');
    details.replaceChildren(
      el(
        'p',
        `${task.category} · First practice budget: ${task.hours} ${task.hours === 1 ? 'hour' : 'hours'}. The full milestone may need more work.`,
        'task-meta',
      ),
      el('h3', 'Why this matters'),
      el('p', task.why),
      el('h3', 'What finished looks like'),
      el('p', task.deliverable),
      link(task.resource.title + ' ↗', task.resource.url),
    );
    const guide = getState()
      .explorationCareers.find((career) => career.id === selectedRole)
      ?.milestones.find((milestone) => milestone.id === task.id);
    if (guide) {
      details.append(el('h3', 'Suggested practice tasks'));
      const list = el('ol');
      for (const item of guide.tasks) list.append(el('li', item));
      details.append(list, el('p', guide.prerequisiteNote));
      for (const resource of guide.resources)
        if (resource.url !== task.resource.url)
          details.append(link(resource.title + ' ↗', resource.url));
      details.append(el('p', 'Next: ' + guide.next, 'fine-print'));
    }
    if (task.status === 'blocked')
      details.append(
        el(
          'p',
          'Make the task smaller, ask a classmate or campus adviser for feedback, or adjust your weekly hours. Record the help you need below.',
          'callout',
        ),
      );
    form.elements.status.value = task.status;
    form.elements.evidence.value = task.evidence;
    form.elements.link.value = task.link;
    $('#task-error').hidden = true;
    $('#task-dialog').showModal();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit(form, '#task-error', async () => {
      await api.save('tasks/' + selected.id, 'PATCH', {
        ...Object.fromEntries(new FormData(form)),
        role: selectedRole,
      });
      $('#task-dialog').close();
    });
  });
  return { open };
}
