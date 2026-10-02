import { el, heading, action } from './dom.js';

export function renderSetup(openProfile) {
  const root = el('div');
  root.append(
    heading(
      'Let’s build your first plan.',
      'Add your interests, experience, and weekly availability to get a useful starting point.',
      'Your workspace',
    ),
    action('Create my profile →', openProfile, 'button'),
    el('p', 'You can stay undecided and compare directions before choosing.', 'fine-print'),
  );
  return root;
}
