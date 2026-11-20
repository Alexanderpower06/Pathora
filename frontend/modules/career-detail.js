import { careerTabs } from './career-tabs.js';
import { el, action, heading, panel, link, notice } from './dom.js';
import { chooseCareer, saveCareer } from './explore-actions.js';
import { preparationPath, studentGuidance, list } from './career-path.js';

function section(title, id, text) {
  const node = panel(title, text);
  node.id = id;
  return node;
}
function sourcesPanel(career, controls) {
  const sources = section('Sources and review', 'career-sources', career.methodology);
  if (career.sourceNote) sources.append(el('p', career.sourceNote));
  const due = new Date().toISOString().slice(0, 10) > career.review.dueOn;
  sources.append(
    el(
      'p',
      `${due ? 'Review due' : 'Sources reviewed'} ${career.reviewedOn} · Next review ${career.review.dueOn}`,
      due ? 'callout' : 'fine-print',
    ),
    el('p', career.review.curriculumStatus, 'fine-print'),
  );
  for (const source of career.sources)
    sources.append(
      link(`${source.title} ↗`, source.url),
      el(
        'p',
        `${source.scope} · ${source.period} · ${source.status} · ${source.reviewedOn}`,
        'fine-print',
      ),
    );
  sources.append(
    el(
      'p',
      'Salary figures are US national occupation medians across experience levels, not internship pay or expected starting offers. Outlook is an occupational projection, not an individual employment probability.',
      'fine-print',
    ),
  );
  if (!controls.guest) {
    const form = el('form', undefined, 'career-feedback');
    const label = el('label', 'Is something inaccurate, missing, or outdated?');
    const input = el('textarea');
    input.maxLength = 1000;
    input.required = true;
    label.append(input);
    const button = el('button', 'Send content feedback', 'button secondary');
    button.type = 'submit';
    const status = el('p');
    status.setAttribute('role', 'status');
    form.append(label, button, status);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      try {
        await controls.api.event({ careerId: career.id, action: 'report', message: input.value });
        status.textContent = 'Saved for content review. This is not a live support channel.';
        input.value = '';
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    sources.append(form);
  }
  return sources;
}
function startingPoint(career, state) {
  const block = section(
    'Your starting point',
    'career-start',
    'A comparison with your reported skills. Career choice is yours.',
  );
  const reported = career.skills.filter((skill) =>
    state.profile.existingSkills.some((existing) => existing.toLowerCase() === skill.toLowerCase()),
  );
  block.append(
    el('h3', 'Reported in your profile'),
    list(
      reported.length
        ? reported
        : ['No exact starter-skill matches recorded. This does not mean you lack the skills.'],
    ),
    el('h3', 'Areas to explore'),
    list(career.skills.filter((skill) => !reported.includes(skill))),
  );
  const why = el('details');
  why.append(
    el('summary', 'Why am I seeing this?'),
    el(
      'p',
      'The rule compares exact skill names, ignoring capitalization, against this career’s authored starter skills. Coursework, synonyms, and demonstrated proficiency are not inferred. Evidence on a completed milestone stays self-reported; it is not automatically applied to every skill. Update your profile from the workspace header to correct it.',
    ),
  );
  block.append(why);
  return block;
}
function focusPanel(career, controls) {
  const block = section(
    'What should I focus on first?',
    'career-focus',
    'Start with a small foundation you cannot yet demonstrate. Tools depend on the specialization and actual role.',
  );
  let selected = controls.exploreState.specializations[career.id] ?? career.specializations[0];
  const label = el('label', 'Specialization to explore');
  const select = el('select');
  for (const name of career.specializations) {
    const option = el('option', name);
    option.value = name;
    select.append(option);
  }
  select.value = selected;
  label.append(select);
  block.append(
    label,
    el(
      'p',
      career.id === 'software'
        ? 'This changes the focus guidance below. The software project is a backend example; choose a project that fits your specialization. It does not change your saved Build curriculum.'
        : 'Use this focus as a starting point and check the actual responsibilities of your target role.',
      'fine-print',
    ),
  );
  const content = el('div');
  const update = () => {
    selected = select.value;
    controls.exploreState.specializations[career.id] = selected;
    const specific =
      career.id === 'software'
        ? {
            Backend: 'One backend language, SQL, HTTP APIs, and tests.',
            Frontend: 'HTML, CSS, JavaScript, accessibility, and browser testing.',
            'Full-stack':
              'A small frontend and API joined by a clear contract; keep scope limited.',
            Mobile: 'One mobile platform, its UI conventions, local state, and testing.',
            Systems: 'Memory, processes, a suitable systems language, and debugging.',
          }[selected]
        : career.technologies.join(', ');
    content.replaceChildren();
    for (const [title, text] of [
      [
        'Core foundations · Focus now',
        career.milestones
          .slice(0, 3)
          .map((item) => item.title)
          .join(' · '),
      ],
      ['Role-specific · Next', specific],
      [
        'Optional / later',
        'Add deployment scale, more frameworks, or additional languages when a project or target posting gives you a reason.',
      ],
      [
        'Depends on the employer',
        'No current posting sample has been analyzed. Check actual required and preferred qualifications before treating a tool as necessary.',
      ],
    ])
      content.append(el('h3', title), el('p', text));
  };
  select.addEventListener('change', update);
  update();
  block.append(content);
  return block;
}
function experimentPanel(career, controls) {
  const block = section('Try this career', 'career-experiment', career.experiment.title);
  block.append(
    el(
      'p',
      `Estimated practice effort: ${career.experiment.minutes} minutes; adjust to your starting point.`,
    ),
    el('p', career.experiment.prerequisites),
    el('p', `Tools: ${career.experiment.tools.join(', ')}`),
    list(career.experiment.steps, true),
    el('h3', 'What to produce'),
    el('p', career.experiment.deliverable),
  );
  for (const resource of career.experiment.resources)
    block.append(link(`${resource.title} ↗`, resource.url));
  const start = action(
    'Start Career Experiment',
    async () => {
      if (controls.guest) {
        window.location.assign('/signup?start=1');
        return;
      }
      start.disabled = true;
      try {
        await controls.api.save('pathboard', 'PATCH', {
          careerId: career.id,
          action: 'start-experiment',
        });
        controls.changeView('pathboard');
      } catch (error) {
        notice(error.message, true);
        start.disabled = false;
      }
    },
    'button secondary',
  );
  block.append(
    start,
    el(
      'p',
      'Your Pathboard stores progress and reflections: what you enjoyed, what was difficult, and whether you want to explore further. No career is chosen automatically.',
      'fine-print',
    ),
  );
  return block;
}
export function careerDetailPage(career, state, controls) {
  const root = el('div', undefined, 'career-detail-page');
  root.append(
    action('← All careers', () => controls.openCareer(null), 'text-button'),
    heading(career.name, career.description, career.field),
  );
  const actions = el('div', undefined, 'career-actionbar');
  actions.append(saveCareer(career, state, controls), chooseCareer(career, state, controls));
  root.append(actions);
  const overview = section('What you’ll actually do', 'career-overview', career.environment);
  overview.append(
    list(career.work),
    el('h3', 'Typical education'),
    el('p', career.education),
    el('h3', 'Entry-level search titles to investigate'),
    list(career.entryTitles),
    el(
      'p',
      'These are possible search terms, not a guarantee that a role is entry-level. Read each posting’s experience and eligibility criteria.',
      'fine-print',
    ),
  );
  if (career.pay)
    overview.append(
      el('h3', 'Salary and outlook'),
      el(
        'p',
        `$${career.pay.toLocaleString('en-US')} US median annual pay · May 2025 · ${career.payOccupation}`,
      ),
      el('p', career.outlook),
      el(
        'p',
        'All experience levels. This is not a starting-salary estimate. See the dated BLS source below.',
        'fine-print',
      ),
    );

  const employers = section(
    'What employers commonly look for',
    'career-employers',
    career.hiringSignals.detail,
  );
  employers.append(
    el('h3', 'Technical preparation'),
    list(career.skills),
    el('h3', 'Practical experience'),
    el(
      'p',
      'Use projects, coursework, internships, relevant work, or equivalent examples to explain what you can do. An internship is one possible experience, not a requirement imposed by Pathora.',
    ),
    el('h3', 'Professional skills'),
    el(
      'p',
      'Practice communication, teamwork, problem solving, and documentation through work you can explain.',
    ),
    el('h3', 'Education and certifications'),
    el('p', career.education),
    el('p', career.certifications),
    el(
      'p',
      'Requirements are employer-specific. No frequency, trend, or preferred/required classification is inferred from a live sample.',
      'fine-print',
    ),
  );

  const tabs = careerTabs(career, controls.exploreState, [
    [
      'overview',
      'Overview',
      [overview, section('Career reality check', 'career-reality', career.challenge)],
    ],
    ['path', 'Your path', [preparationPath(career, state, controls), studentGuidance()]],
    [
      'skills',
      'Skills & fit',
      [
        focusPanel(career, controls),
        ...(state.profile ? [startingPoint(career, state)] : []),
        employers,
      ],
    ],
    ['experiment', 'Try this career', [experimentPanel(career, controls)]],
    ['sources', 'Sources', [sourcesPanel(career, controls)]],
  ]);
  const next = el('div', undefined, 'career-next-choices');
  next.append(
    el('h3', 'Where would you like to start?'),
    el('p', 'You do not need to choose a Path to learn about the work.', 'muted'),
    action('Show me the preparation path →', () => tabs.activate('path', true), 'button secondary'),
    action('Try a small activity →', () => tabs.activate('experiment', true), 'text-button'),
  );
  overview.append(next);
  root.append(
    tabs.root,
    el(
      'p',
      'You can explore, save, and compare before choosing. Changing your Path keeps your previous evidence.',
      'fine-print',
    ),
  );
  return root;
}
// Pathboard continues to use a compact preview rather than another full detail page.
export { careerDetail } from './career-preview.js';
