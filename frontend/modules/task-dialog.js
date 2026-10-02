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
        `${task.category} · Estimated effort: ${task.hours} ${task.hours === 1 ? 'hour' : 'hours'}`,
        'task-meta',
      ),
      el('h3', 'Why this matters'),
      el('p', task.why),
      el('h3', 'What finished looks like'),
      el('p', task.deliverable),
      link(task.resource.title + ' ↗', task.resource.url),
    );
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
