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
  await page.getByRole('button', { name: 'Your evidence', exact: true }).click();
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
