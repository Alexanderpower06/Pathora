import { $, el, heading, panel, action, link, submit, notice, empty } from './dom.js';

export function setupApplications({ api, getState }) {
  let editingId = null;
  const form = $('#application-form');
  function open(application) {
    form.reset();
    form.elements.role.replaceChildren(
      ...getState().catalog.roles.map((role) => {
        const option = el('option', role.name);
        option.value = role.id;
        return option;
      }),
    );
    editingId = application?.id ?? null;
    $('#application-title').textContent = application
      ? 'Update this opportunity'
      : 'Track an internship';
    if (application) {
      for (const [name, value] of Object.entries(application)) {
        const input = form.elements.namedItem(name);
        if (input) input.value = value;
      }
    }
    if (!application && getState().profile.role !== 'undecided')
      form.elements.role.value = getState().profile.role;
    $('#application-error').hidden = true;
    $('#application-dialog').showModal();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit(form, '#application-error', async () => {
      await api.save(
        editingId ? 'applications/' + editingId : 'applications',
        editingId ? 'PUT' : 'POST',
        Object.fromEntries(new FormData(form)),
      );
      $('#application-dialog').close();
    });
  });
  function render(state) {
    const root = el('div');
    root.append(
      heading(
        'Keep opportunities moving.',
        'Save postings, track applications, and turn feedback into a next action. Entries are added by you; Pathora does not submit applications.',
        'Applications',
      ),
      action('Add an opportunity +', () => open(), 'button'),
    );
    if (!state.applications.length)
      root.append(
        empty(
          'Your first opportunity starts here.',
          'Check your campus career portal or an employer’s own website. Confirm eligibility, location, and deadlines before applying.',
        ),
      );
    for (const application of state.applications) {
      const card = panel(application.company, application.title);
      card.prepend(el('span', application.status, 'status-badge'));
      const role = state.catalog.roles.find((role) => role.id === application.role);
      card.append(el('p', role?.name ?? application.role, 'task-meta'));
      if (application.deadline) card.append(el('p', `Deadline: ${application.deadline}`, 'muted'));
      if (application.followUp) card.append(el('p', `Follow up: ${application.followUp}`, 'muted'));
      if (application.notes) card.append(el('p', application.notes));
      if (application.link) card.append(link('Open posting ↗', application.link));
      if (state.reminders.some((item) => item.id === application.id))
        card.append(
          el(
            'p',
            'A saved date is due or has passed. Check the posting or update your follow-up.',
            'callout',
          ),
        );
      const controls = el('div', undefined, 'row-actions');
      controls.append(action('Update opportunity', () => open(application)));
      const remove = action(
        'Remove',
        async () => {
          if (!window.confirm(`Remove the saved ${application.company} opportunity?`)) return;
          remove.disabled = true;
          try {
            await api.save('applications/' + application.id, 'DELETE');
          } catch (error) {
            notice(error.message, true);
            remove.disabled = false;
          }
        },
        'text-button danger',
      );
      controls.append(remove);
      card.append(controls);
      root.append(card);
    }
    return root;
  }
  return { render };
}
