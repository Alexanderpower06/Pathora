import { test, expect } from '@playwright/test';
const password = 'Sample student passphrase 123';
async function signup(page, email) {
  await page.goto('/signup');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Where are you right now?', exact: true }),
  ).toBeVisible();
}
async function next(page) {
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
}
async function signin(page, email) {
  await page.goto('/login?start=1');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in →', exact: true }).click();
}
async function createSoftwarePath(page, email) {
  await signup(page, email);
  await page.getByRole('radio', { name: 'Just Exploring', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByLabel('Search careers', { exact: true }).fill('Software');
  await page.getByRole('radio', { name: 'Software Engineer', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByRole('checkbox', { name: 'None Yet', exact: true }).check();
  await page.getByRole('button', { name: 'See my path →', exact: true }).click();
  await page.getByRole('button', { name: 'View my Pathora →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A manageable next step, there.', exact: true }),
  ).toBeVisible();
}

test('student onboarding saves, populates a plan and restores progress on sign-in', async ({
  page,
}) => {
  await signup(page, 'student@example.test');
  await page.getByRole('radio', { name: 'College Student', exact: true }).check();
  await next(page);
  await page.getByLabel('Degree level', { exact: true }).selectOption('Bachelor’s');
  await page.getByLabel('Major / field of study', { exact: true }).fill('Computer Science');
  await page.getByLabel('Expected graduation', { exact: true }).fill('2028-05');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await signin(page, 'student@example.test');
  await expect(
    page.getByRole('heading', { name: 'Tell us about your education', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Major / field of study', { exact: true })).toHaveValue(
    'Computer Science',
  );
  await next(page);
  await page.getByLabel('Search careers', { exact: true }).fill('Software');
  await page.getByRole('radio', { name: 'Software Engineer', exact: true }).check();
  await next(page);
  for (const skill of ['Python', 'JavaScript', 'Git', 'SQL'])
    await page.getByRole('checkbox', { name: skill, exact: true }).check();
  await page.getByLabel('Python level (optional)', { exact: true }).selectOption('Beginner');
  await next(page);
  await page.getByRole('button', { name: 'See my path →', exact: true }).click();
  await expect(page.locator('#setup-error')).toContainText('Choose an experience');
  await page.getByRole('checkbox', { name: 'None Yet', exact: true }).check();
  await page.getByLabel('What should we call you? (optional)', { exact: true }).fill('Alex');
  await page.getByRole('button', { name: 'See my path →', exact: true }).click();
  const skillMatch = page.getByRole('progressbar', { name: 'Current skill match', exact: true });
  await expect(skillMatch).toBeVisible();
  await expect(skillMatch).toHaveAttribute('value', '50');
  await expect(skillMatch).toHaveAttribute('max', '100');
  await page.getByRole('button', { name: 'View my Pathora →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A manageable next step, Alex.', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Start this step →', exact: true }).click();
  await page.getByLabel('Task status', { exact: true }).selectOption('done');
  await page.getByRole('button', { name: 'Save this step', exact: true }).click();
  await expect(page.locator('#task-error')).toContainText('at least 10 characters');
  await page
    .getByLabel('What did you do, or where are you stuck?', { exact: true })
    .fill('Completed a sample Python practice exercise.');
  await page.getByRole('button', { name: 'Save this step', exact: true }).click();
  await page.getByRole('button', { name: 'Applications', exact: true }).click();
  await page.getByRole('button', { name: 'Add an opportunity +', exact: true }).click();
  await page.getByLabel('Company', { exact: true }).fill('Example');
  await page.getByLabel('Position', { exact: true }).fill('Software intern');
  await page.getByLabel('Status', { exact: true }).selectOption('Applied');
  await page.getByRole('button', { name: 'Save opportunity', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Example', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await signin(page, 'student@example.test');
  await expect(
    page.getByRole('heading', { name: 'A manageable next step, Alex.', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#profile-dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Proof of Progress', exact: true }).click();
  await expect(
    page.getByText('Completed a sample Python practice exercise.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Your profile', exact: true }).click();
  await page.getByLabel('Career goal', { exact: true }).selectOption('ux');
  await page.getByRole('button', { name: 'Save profile →', exact: true }).click();
  await page.getByRole('button', { name: 'Your profile', exact: true }).click();
  await page.getByLabel('Career goal', { exact: true }).selectOption('software');
  await page.getByRole('button', { name: 'Save profile →', exact: true }).click();
  await expect(page.getByText('2 of 8 steps documented', { exact: true })).toBeVisible();
});
test('unsure users explore rule-based matches with mobile-friendly controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signup(page, 'explorer@example.test');
  await page.getByRole('radio', { name: 'Just Exploring', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByRole('button', { name: 'Help me find a career →', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Sports', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Working with technology', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Solving problems', exact: true }).check();
  await page.getByLabel('Preferred work environment', { exact: true }).selectOption('desk');
  await next(page);
  for (const [key, value] of [
    ['Working with people', '0'],
    ['Working with technology', '3'],
    ['Working with numbers', '0'],
    ['Creative work', '0'],
    ['Solving problems', '3'],
    ['Leading and organizing', '0'],
  ])
    await page
      .getByLabel(`How much do you enjoy ${key.toLowerCase()}?`, { exact: true })
      .selectOption(value);
  await page.getByRole('button', { name: 'See career matches →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A few directions to explore.', exact: true }),
  ).toBeVisible();
  await page.locator('details').filter({ hasText: 'Software Engineer' }).locator('summary').click();
  await page.getByRole('radio', { name: 'Choose Software Engineer', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByRole('checkbox', { name: 'None Yet', exact: true }).check();
  await page.getByRole('button', { name: 'See my path →', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'View my Pathora →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A manageable next step, there.', exact: true }),
  ).toBeVisible();
});

test('onboarding locks fields and sign-out until the step save finishes', async ({ page }) => {
  await signup(page, 'slow-save@example.test');
  let releaseSave;
  const gate = new Promise((resolve) => {
    releaseSave = resolve;
  });
  await page.route('**/api/student/onboarding/step', async (route) => {
    await gate;
    await route.continue();
  });
  await page.getByRole('radio', { name: 'College Student', exact: true }).check();
  await next(page);
  try {
    await expect(page.getByRole('radio', { name: 'College Student', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Continue →', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeDisabled();
  } finally {
    releaseSave();
  }
  await expect(
    page.getByRole('heading', { name: 'Tell us about your education', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Degree level', { exact: true })).toBeEnabled();
});

test('Pathboard saves experiments without changing a chosen Path and restores them on sign-in', async ({
  page,
}) => {
  await signup(page, 'pathboard@example.test');
  await page.getByRole('radio', { name: 'Just Exploring', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByLabel('Search careers', { exact: true }).fill('Software');
  await page.getByRole('radio', { name: 'Software Engineer', exact: true }).check();
  await next(page);
  await next(page);
  await page.getByRole('checkbox', { name: 'None Yet', exact: true }).check();
  await page.getByRole('button', { name: 'See my path →', exact: true }).click();
  await page.getByRole('button', { name: 'View my Pathora →', exact: true }).click();
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  const software = page
    .locator('section.panel')
    .filter({ has: page.getByRole('heading', { name: 'Software Engineering', exact: true }) });
  await software.getByRole('button', { name: 'Save to Pathboard', exact: true }).click();
  await page.getByRole('button', { name: 'Pathboard', exact: true }).click();
  await page.getByText('Reflect and record your experiment', { exact: true }).click();
  await page.getByRole('button', { name: 'Finish experiment', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Experiment evidence is required');
  for (const [label, value] of [
    ['What did I enjoy?', 'Building a useful program'],
    ['What did I dislike?', 'Repetitive setup'],
    ['What was difficult?', 'Debugging the state'],
    ['What would I want to become better at?', 'Testing and debugging'],
    ['Would I want to do similar work professionally?', 'Maybe, I want another experiment'],
    ['What did you make or try?', 'Built and tested a local study planner.'],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByRole('combobox', { name: 'Would I explore this further?', exact: true })
    .selectOption('Maybe');
  await page.getByRole('button', { name: 'Finish experiment', exact: true }).click();
  await expect(page.getByText('Experiment: Completed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await signin(page, 'pathboard@example.test');
  await page.getByRole('button', { name: 'Pathboard', exact: true }).click();
  await expect(page.getByText('Experiment: Completed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'This week', exact: false }).click();
  await expect(
    page.getByText('Working toward a software engineer opportunity.', { exact: true }),
  ).toBeVisible();
});

test('signed-in users search and filter careers, read a specific preparation milestone, and resume a detail link', async ({
  page,
}) => {
  await createSoftwarePath(page, 'explore-search@example.test');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back.', exact: true })).toBeVisible();
  await page.goto('/explore');
  await expect(page.getByRole('heading', { name: 'Welcome back.', exact: true })).toBeVisible();
  await page.getByLabel('Email address', { exact: true }).fill('explore-search@example.test');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Explore Your Future', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Build useful software', exact: true }).click();
  await expect(page.getByText('2 careers found', { exact: true })).toBeVisible();
  const softwareCard = page.locator('section.panel').filter({
    has: page.getByRole('heading', { name: 'Software Engineering', exact: true }),
  });
  await softwareCard.getByRole('button', { name: 'Save to Pathboard', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Explore Your Future', exact: true }),
  ).toBeVisible();
  await expect(
    softwareCard.getByRole('button', { name: 'Unsave Software Engineering', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Compare Software Engineering', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Compare in Pathboard →', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Compare Quality Assurance / Software Testing', exact: true })
    .click();
  await page.getByRole('button', { name: 'Compare in Pathboard →', exact: true }).click();
  await expect(
    page.getByRole('table', { name: 'Your saved career options', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('columnheader', { name: 'Quality Assurance / Software Testing', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Find a career', exact: true }).fill('SQL');
  await page.locator('.explore-filter-disclosure > summary').click();
  await page.getByRole('combobox', { name: 'Career Field', exact: true }).selectOption('Software');
  await expect(page.getByText('1 career found', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Explore Career →', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Overview', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'Overview', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Your path', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    page.getByRole('heading', { name: 'Your Path to This Career', exact: true }),
  ).toBeVisible();
  await page
    .locator('summary')
    .filter({ hasText: /^SQL fundamentals$/ })
    .click();
  await expect(
    page.getByText('Use SELECT, WHERE, ORDER BY, JOIN, and GROUP BY.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'PostgreSQL tutorial ↗', exact: true }),
  ).toHaveAttribute('href', 'https://www.postgresql.org/docs/current/tutorial.html');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Software Engineering', exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
