import { el, action, link } from './dom.js';
import { field, choices, group } from './onboarding-fields.js';
const preferenceNames = {
  people: 'Working with people',
  technology: 'Working with technology',
  numbers: 'Working with numbers',
  creativity: 'Creative work',
  'problem-solving': 'Solving problems',
  leadership: 'Leading and organizing',
};
const titles = [
  'Where are you right now?',
  'Tell us about your education',
  'Where do you want to go?',
  'What skills do you already have?',
  'What have you done so far?',
];
const descriptions = [
  'Tell us where you are in your journey. We’ll turn your starting point into a practical plan.',
  'A few details help put your plan in context. Your major does not limit your career choices.',
  'Choose the career you’re currently working toward. It’s a direction to try, and you can change it later.',
  'Select the skills you currently have. You can update these later. No skills are selected automatically.',
  'Coursework, personal projects and volunteering count. Starting without experience is completely okay.',
];
export function screenHeading(state) {
  let title = titles[state.step - 1],
    description = descriptions[state.step - 1];
  if (state.step === 3 && state.stage !== 'goal') {
    const branch = {
      interests: [
        'What interests you?',
        'Start with what you enjoy, then choose the kind of work you’d like to explore.',
      ],
      quiz: [
        'What kind of work feels like you?',
        'Six short questions help compare your preferences with our defined career categories.',
      ],
      matches: [
        'A few directions to explore.',
        'Open a career to learn more before choosing. These scores measure preference alignment, not ability or hiring chances.',
      ],
    };
    [title, description] = branch[state.stage];
  }
  if (state.step === 6) {
    title = 'Your Pathora is ready.';
    description =
      'You have a direction, a clear starting point, and a first step. You can change your plan as you learn.';
  }
  const heading = el('div', undefined, 'setup-heading');
  if (state.step === 1) heading.append(el('p', 'Welcome to Pathora', 'task-meta'));
  heading.append(el('h1', title), el('p', description));
  return heading;
}
function education(state, form) {
  const { answers: a, catalog: c } = state;
  const college = a.situation === 'College Student',
    student = college || a.situation === 'High School Student';
  const grid = el('div', undefined, 'form-grid');
  if (a.situation !== 'High School Student')
    grid.append(
      field(`Degree level${college ? '' : ' (optional)'}`, 'degree', a.degree, {
        options: c.degrees,
        required: college,
      }),
    );
  grid.append(
    field(`Major / field of study${college ? '' : ' (optional)'}`, 'major', a.major, {
      required: college,
      list: 'setup-majors',
    }),
  );
  const list = el('datalist');
  list.id = 'setup-majors';
  for (const major of [...new Set(c.majors)]) list.append(el('option', major));
  if (student || a.situation === 'Recent Graduate')
    grid.append(
      field(
        `${student ? 'Expected graduation' : 'Graduation'}${student ? '' : ' (optional)'}`,
        'graduation',
        a.graduation,
        { type: 'month', required: student },
      ),
    );
  grid.append(field('School / university (optional)', 'school', a.school));
  form.append(grid, list);
  if (!student)
    form.append(el('p', 'No degree is required to start exploring a career.', 'setup-tip'));
}
function goal(state, form, helpers) {
  const search = field('Search careers', 'careerSearch', '', { type: 'search' });
  form.append(search);
  const selector = choices(
    state.catalog.careers.map((career) => [career.id, career.name]),
    'role',
    [state.answers.role],
    true,
  );
  form.append(group('Your career goal', selector));
  search.querySelector('input').addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase().trim();
    for (const label of selector.children)
      label.hidden = !label.textContent.toLowerCase().includes(term);
  });
  const preview = el('div', undefined, 'career-preview');
  const show = () => {
    const selected = form.querySelector('[name=role]:checked')?.value;
    const career = state.catalog.careers.find((item) => item.id === selected);
    preview.hidden = !career;
    if (career)
      preview.replaceChildren(
        el('h3', career.name),
        el('p', career.description),
        el('p', career.stretch),
        link('Explore this career ↗', career.source.url),
      );
  };
  selector.addEventListener('change', show);
  show();
  form.append(preview);
  const help = el('div', undefined, 'career-help');
  help.append(
    el('p', 'Not sure yet? That’s a good place to start.'),
    action('Help me find a career →', () => helpers.finder('start')),
  );
  form.append(help);
}
function interests(state, form) {
  const a = state.answers,
    c = state.catalog;
  form.append(
    group('Things you enjoy (optional)', choices(c.interests, 'interests', a.interests ?? [])),
    group(
      'Work you’d like to explore',
      choices(
        c.preferences.map((key) => [key, preferenceNames[key]]),
        'preferences',
        a.preferences ?? [],
      ),
    ),
    field('Preferred work environment', 'environment', a.environment, {
      required: true,
      options: [
        ['desk', 'Desk / computer-based'],
        ['field', 'Active / in the community'],
        ['mixed', 'A mix of both'],
        ['any', 'Open to any environment'],
      ],
    }),
  );
}
function quiz(state, form) {
  for (const key of state.catalog.preferences)
    form.append(
      field(
        `How much do you enjoy ${preferenceNames[key].toLowerCase()}?`,
        `quiz-${key}`,
        state.answers.quiz?.[key]?.toString(),
        {
          required: true,
          options: [
            ['0', 'Not interested'],
            ['1', 'A little interested'],
            ['2', 'Interested'],
            ['3', 'Very interested'],
          ],
        },
      ),
    );
  form.append(
    el(
      'p',
      'Scoring: each career has two work interests. Each matching interest adds 2 points, each quiz rating adds 0–3 points, and an aligned environment adds 2. Score = points / 12 × 100. Ties use career ID order.',
      'setup-tip',
    ),
  );
}
function matches(state, form) {
  for (const career of state.matches) {
    const card = el('details', undefined, 'match-card');
    const summary = el('summary', career.name);
    summary.append(el('span', `${career.score}% alignment`));
    card.append(summary, el('p', career.description));
    const reasons = el('ul');
    for (const reason of career.reasons) reasons.append(el('li', reason));
    card.append(
      reasons,
      el('p', `Core skills: ${career.skills.join(', ')}`),
      el('p', career.stretch),
      link('Explore career details ↗', career.source.url),
      choices([[career.id, `Choose ${career.name}`]], 'role', [state.answers.role], true),
    );
    form.append(card);
  }
  form.addEventListener('change', (event) => {
    if (event.target.name === 'role')
      for (const card of form.querySelectorAll('details'))
        if (card.contains(event.target)) card.open = true;
  });
}
function skills(state, form) {
  const career = state.catalog.careers.find((item) => item.id === state.answers.role);
  const categories = { ...career.categories };
  const previous = (state.answers.existingSkills ?? []).filter(
    (skill) => !Object.values(categories).flat().includes(skill),
  );
  if (previous.length) categories['Previously selected skills'] = previous;
  for (const [category, values] of Object.entries(categories)) {
    const grid = el('div', undefined, 'skill-list');
    for (const skill of values) {
      const item = el('div', undefined, 'skill-item');
      const choice = choices([skill], 'existingSkills', state.answers.existingSkills ?? []);
      item.append(choice);
      const level = field(
        `${skill} level (optional)`,
        `level-${skill}`,
        state.answers.skillLevels?.[skill],
        { options: state.catalog.levels },
      );
      level.hidden = !choice.querySelector('input').checked;
      choice.addEventListener('change', () => {
        level.hidden = !choice.querySelector('input').checked;
      });
      item.append(level);
      grid.append(item);
    }
    form.append(group(category, grid));
  }
  form.append(
    el(
      'p',
      'These are self-reported skills. Levels describe your confidence; they do not verify proficiency. You can continue with no skills selected.',
      'setup-tip',
    ),
  );
}
function experience(state, form) {
  const grid = choices(
    state.catalog.experiences,
    'experienceKinds',
    state.answers.experienceKinds ?? [],
  );
  grid.addEventListener('change', (event) => {
    if (!event.target.checked) return;
    for (const input of grid.querySelectorAll('input'))
      if (
        input !== event.target &&
        (event.target.value === 'None Yet' || input.value === 'None Yet')
      )
        input.checked = false;
  });
  form.append(
    group('Experience you can build on', grid),
    el(
      'p',
      'None yet? We’ll start with an approachable first milestone. Detailed job history is not needed.',
      'setup-tip',
    ),
    field('What should we call you? (optional)', 'name', state.answers.name, { maxLength: 80 }),
  );
}
function payoff(state, form) {
  const { career, skills } = state.summary;
  const grid = el('div', undefined, 'payoff-grid');
  for (const [label, value] of [
    ['Your goal', career.name],
    ['Current skill match', `${skills.percent}%`],
    ['Core skills identified', `${skills.have.length} of ${skills.total}`],
    ['Roadmap milestones', `0 of ${career.milestones.length} complete`],
  ]) {
    const card = el('div');
    card.append(el('small', label), el('strong', value));
    grid.append(card);
  }
  form.append(grid);
  const progress = el('progress', `${skills.percent}%`, 'skill-progress');
  progress.max = 100;
  progress.value = skills.percent;
  progress.setAttribute('aria-label', 'Current skill match');
  form.append(
    progress,
    el(
      'p',
      'Skill match = selected core skills ÷ defined core requirements. It does not predict employment or verify mastery.',
      'setup-tip',
    ),
  );
  form.append(
    group(
      'Skills you have',
      el('p', skills.have.join(', ') || 'Your first skill starts with practice.'),
    ),
    group(
      'Skills to develop',
      el('p', skills.gaps.join(', ') || 'Build evidence for your reported skills.'),
    ),
  );
  const first = el('div', undefined, 'setup-first');
  first.append(
    el('small', 'Recommended first step'),
    el('h3', career.milestones[0].title),
    el(
      'p',
      'Start with one focused hour. Your dashboard turns each milestone into a place to record practice and evidence.',
    ),
  );
  form.append(first);
}
export function renderStep(state, form, helpers) {
  if (state.step === 1)
    form.append(
      group(
        'Your current situation',
        choices(state.catalog.situations, 'situation', [state.answers.situation], true),
      ),
    );
  if (state.step === 2) education(state, form);
  if (state.step === 3)
    ({
      goal: () => goal(state, form, helpers),
      interests: () => interests(state, form),
      quiz: () => quiz(state, form),
      matches: () => matches(state, form),
    })[state.stage]();
  if (state.step === 4) skills(state, form);
  if (state.step === 5) experience(state, form);
  if (state.step === 6) payoff(state, form);
}
