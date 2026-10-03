import { field, choices } from './onboarding-fields.js';
import { $, el, submit } from './dom.js';

export function preserveSelections(suggested, selected) {
  return [...new Set([...suggested, ...selected])];
}

export function profileSkillOptions(catalog, roleId, selected) {
  const role = catalog.roles.find((item) => item.id === roleId);
  const careerSkills = role?.categories
    ? Object.values(role.categories).flat()
    : (role?.skills ?? []);
  return preserveSelections(
    [...(catalog.commonSkills ?? catalog.skills), ...careerSkills],
    selected,
  );
}

export function setupProfile({ getState, api, onSaved }) {
  const form = $('#profile-form');
  const chosen = (name) => new FormData(form).getAll(name);
  function updateSuggestions(
    interests = chosen('interests'),
    skills = chosen('existingSkills'),
    savedLevels,
  ) {
    const catalog = getState().catalog;
    const levels =
      savedLevels ??
      Object.fromEntries(
        skills.map((skill) => [
          skill,
          form.elements.namedItem(`level-${skill}`)?.value ??
            getState().profile?.skillLevels?.[skill],
        ]),
      );
    options(
      '#interest-options',
      preserveSelections(catalog.commonInterests ?? catalog.interests, interests),
      'interests',
      interests,
    );
    options(
      '#skill-options',
      profileSkillOptions(catalog, form.elements.role.value, skills),
      'existingSkills',
      skills,
      levels,
    );
    $('#interest-context').textContent =
      'Choose what you enjoy. These suggestions are the same for every major.';
    $('#skill-context').textContent =
      'Choose transferable skills and skills relevant to your goal. Previously selected skills stay available.';
  }
  function options(container, values, name, selected, levelsForOptions = {}) {
    const nodes = values.map((value) => {
      const label = el('label', undefined, 'check-option');
      const checkbox = el('input');
      checkbox.type = 'checkbox';
      checkbox.name = name;
      checkbox.value = value;
      checkbox.checked = selected.includes(value);
      label.append(checkbox, el('span', value));
      if (name === 'existingSkills') {
        const level = field(
          `${value} level (optional)`,
          `level-${value}`,
          levelsForOptions[value],
          { options: ['Beginner', 'Intermediate', 'Advanced'] },
        );
        level.hidden = !checkbox.checked;
        checkbox.addEventListener('change', () => {
          level.hidden = !checkbox.checked;
        });
        const wrapper = el('div', undefined, 'skill-item');
        wrapper.append(label, level);
        return wrapper;
      }
      return label;
    });
    $(container).replaceChildren(...nodes);
  }
  function open() {
    const state = getState();
    if (!state) return;
    form.reset();
    const profile = state.profile;
    $('#profile-education').replaceChildren(
      field('Current situation', 'situation', profile?.situation ?? 'College Student', {
        options: [
          'High School Student',
          'College Student',
          'Recent Graduate',
          'Working Professional',
          'Changing Careers',
          'Just Exploring',
        ],
        required: true,
      }),
      field('Degree level (optional)', 'degree', profile?.degree, {
        options: ['Associate', 'Bachelor’s', 'Master’s', 'Doctorate', 'Certificate', 'Other'],
      }),
      field('School / university (optional)', 'school', profile?.school),
    );
    $('#profile-experience').replaceChildren(
      choices(
        [
          'Personal Projects',
          'School Projects',
          'Internship',
          'Part-Time Job',
          'Full-Time Job',
          'Volunteer Experience',
          'Certifications',
          'None Yet',
        ],
        'experienceKinds',
        profile?.experienceKinds ?? [],
      ),
    );
    form.elements.role.replaceChildren(
      ...[
        ['undecided', 'I’m exploring'],
        ...state.catalog.roles.map((role) => [role.id, role.name]),
      ].map(([value, text]) => {
        const option = el('option', text);
        option.value = value;
        return option;
      }),
    );
    if (profile) {
      for (const [name, value] of Object.entries(profile)) {
        const input = form.elements.namedItem(name);
        if (input && !Array.isArray(value)) input.value = value;
      }
      form.elements.additionalInterests.value = (profile.additionalInterests ?? []).join(', ');
      form.elements.additionalSkills.value = (profile.additionalSkills ?? []).join(', ');
    }
    if (!profile) {
      const target = new Date();
      target.setDate(target.getDate() + 56);
      form.elements.targetDate.value = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      form.elements.graduation.value = `${new Date().getFullYear() + 2}-05`;
    }
    if (state.catalog.majorOptions) {
      const majors = [...new Set(state.catalog.majorOptions.flatMap((group) => group.majors))];
      $('#majors').replaceChildren(...majors.map((major) => el('option', major)));
    }
    updateRequirements();
    updateSuggestions(
      profile?.interests ?? [],
      profile?.existingSkills ?? [],
      profile?.skillLevels ?? {},
    );
    $('#profile-error').hidden = true;
    $('#profile-dialog').showModal();
  }
  function updateRequirements() {
    form.elements.graduation.required = ['College Student', 'High School Student'].includes(
      form.elements.situation.value,
    );
    form.elements.major.required = form.elements.situation.value === 'College Student';
  }
  $('#change-career-goal').addEventListener('click', () => form.elements.role.focus());
  form.elements.role.addEventListener('change', () => updateSuggestions());
  form.addEventListener('change', (event) => {
    if (event.target.name === 'situation') updateRequirements();
    if (event.target.name === 'experienceKinds' && event.target.checked)
      for (const input of form.querySelectorAll('[name=experienceKinds]'))
        if (
          input !== event.target &&
          (input.value === 'None Yet' || event.target.value === 'None Yet')
        )
          input.checked = false;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit(form, '#profile-error', async () => {
      if (!getState().catalog.commonInterests)
        throw new Error(
          'Restart Pathora to load and save the updated profile options. Your existing plan is still saved.',
        );
      const data = Object.fromEntries(new FormData(form));
      data.weeklyHours = Number(data.weeklyHours);
      data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      data.interests = new FormData(form).getAll('interests');
      data.existingSkills = new FormData(form).getAll('existingSkills');
      data.experienceKinds = new FormData(form).getAll('experienceKinds');
      data.skillLevels = Object.fromEntries(
        data.existingSkills
          .map((skill) => [skill, form.elements.namedItem(`level-${skill}`)?.value])
          .filter(([, level]) => level),
      );
      for (const name of ['additionalInterests', 'additionalSkills'])
        data[name] = data[name]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
      await api.save('profile', 'PUT', data);
      $('#profile-dialog').close();
      onSaved(data.role === 'undecided' ? 'direction' : 'today');
    });
  });
  return { open };
}
