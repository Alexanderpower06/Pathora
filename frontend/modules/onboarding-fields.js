import { el } from './dom.js';
export function field(
  label,
  name,
  value = '',
  { type = 'text', required = false, options, list, maxLength = 150 } = {},
) {
  const wrapper = el('div', undefined, 'field');
  const caption = el('label', label);
  const input = el(options ? 'select' : 'input');
  input.name = name;
  input.id = `setup-${encodeURIComponent(name)}`;
  caption.htmlFor = input.id;
  if (options) {
    for (const [key, text] of [
      ['', 'Choose an option'],
      ...options.map((item) => (Array.isArray(item) ? item : [item, item])),
    ]) {
      const option = el('option', text);
      option.value = key;
      input.append(option);
    }
  } else {
    input.type = type;
    input.maxLength = maxLength;
    if (list) input.setAttribute('list', list);
  }
  input.value = value;
  input.required = required;
  wrapper.append(caption, input);
  return wrapper;
}
export function choices(values, name, selected = [], radio = false) {
  const grid = el('div', undefined, 'choice-grid');
  for (const item of values) {
    const [value, title] = Array.isArray(item) ? item : [item, item];
    const label = el('label', undefined, 'choice');
    const input = el('input');
    input.type = radio ? 'radio' : 'checkbox';
    input.name = name;
    input.value = value;
    input.checked = selected.includes(value);
    if (radio) input.required = true;
    label.append(input, el('span', title));
    grid.append(label);
  }
  return grid;
}
export function group(title, contents) {
  const fieldset = el('fieldset');
  fieldset.append(el('legend', title), contents);
  return fieldset;
}
export function collect(form, state) {
  const data = new FormData(form);
  const answers = Object.fromEntries(data);
  if (state.step === 3 && state.stage === 'interests') {
    answers.interests = data.getAll('interests');
    answers.preferences = data.getAll('preferences');
  }
  if (state.step === 3 && state.stage === 'quiz') {
    answers.quiz = Object.fromEntries(
      state.catalog.preferences.map((key) => [
        key,
        data.get(`quiz-${key}`) === '' ? undefined : Number(data.get(`quiz-${key}`)),
      ]),
    );
  }
  if (state.step === 4) {
    answers.existingSkills = data.getAll('existingSkills');
    answers.skillLevels = Object.fromEntries(
      answers.existingSkills
        .map((skill) => [skill, data.get(`level-${skill}`)])
        .filter(([, level]) => level),
    );
  }
  if (state.step === 5) {
    answers.experienceKinds = data.getAll('experienceKinds');
    answers.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return answers;
}
