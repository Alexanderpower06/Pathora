import test from 'node:test';
import assert from 'node:assert/strict';
import { COMMON_INTERESTS, COMMON_SKILLS } from '../internships/catalog.js';
import { preserveSelections } from '../../frontend/modules/profile.js';
import { validateStudent } from '../internships/validation.js';
import { createStudentService } from '../internships/service.js';
import { memoryStudentRepository } from '../testing/memory-student-repository.js';

const student = {
  name: 'Example',
  major: 'Psychology',
  graduation: '2028-05',
  weeklyHours: 5,
  targetDate: '2027-02-01',
  role: 'undecided',
  interests: ['Human behavior'],
  existingSkills: ['Active listening', 'Research methods'],
  additionalInterests: ['Peer mentoring'],
  additionalSkills: ['Debate facilitation'],
};
test('everyone gets 15 distinct common interests and 15 distinct transferable skills', () => {
  assert.equal(COMMON_INTERESTS.length, 15);
  assert.equal(new Set(COMMON_INTERESTS).size, 15);
  assert.equal(COMMON_SKILLS.length, 15);
  assert.equal(new Set(COMMON_SKILLS).size, 15);
  for (const value of ['Fitness', 'Sports', 'Reading and writing'])
    assert.ok(COMMON_INTERESTS.includes(value));
  for (const value of ['Critical thinking', 'Time management', 'Teamwork', 'Digital literacy'])
    assert.ok(COMMON_SKILLS.includes(value));
});
test('changing majors does not change suggestions or erase common answers', async () => {
  const service = createStudentService(memoryStudentRepository());
  for (const major of ['Computer Science', 'Psychology', 'Nursing', 'Undeclared']) {
    await service.saveProfile({
      ...student,
      major,
      interests: ['Fitness', 'Reading and writing'],
      existingSkills: ['Time management', 'Digital literacy'],
    });
    const saved = await service.state();
    assert.deepEqual(saved.catalog.commonInterests, COMMON_INTERESTS);
    assert.deepEqual(saved.catalog.commonSkills, COMMON_SKILLS);
    assert.deepEqual(saved.profile.interests, ['Fitness', 'Reading and writing']);
    assert.deepEqual(saved.profile.existingSkills, ['Time management', 'Digital literacy']);
  }
});
test('previous selections remain available without duplicates or automatic selections', () => {
  const selected = ['Python', 'Critical thinking'];
  const choices = preserveSelections(COMMON_SKILLS, selected);
  assert.ok(choices.includes('Python'));
  assert.equal(choices.filter((item) => item === 'Critical thinking').length, 1);
  assert.deepEqual(selected, ['Python', 'Critical thinking']);
});
test('previous major-specific and custom answers save and reopen without claiming verified skills', async () => {
  const service = createStudentService(memoryStudentRepository());
  await service.saveProfile(student);
  const saved = await service.state();
  assert.deepEqual(saved.profile.interests, ['Human behavior']);
  assert.deepEqual(saved.profile.existingSkills, ['Active listening', 'Research methods']);
  assert.deepEqual(saved.profile.additionalSkills, ['Debate facilitation']);
  assert.ok(saved.recognizedExperience.some((line) => line.includes('Debate facilitation')));
  assert.equal(saved.completion, 0);
  assert.equal(saved.catalog.majorOptions.length, 11);
});
test('custom answers are bounded and unknown predefined answers are rejected', () => {
  assert.throws(() => validateStudent({ ...student, interests: ['Invented predefined value'] }));
  for (const additionalSkills of [
    null,
    'Not an array',
    Array(6).fill('Skill'),
    [''],
    ['a'.repeat(81)],
  ])
    assert.throws(() => validateStudent({ ...student, additionalSkills }));
  const validated = validateStudent({
    ...student,
    additionalSkills: ['  Facilitation  ', 'Facilitation'],
  });
  assert.deepEqual(validated.additionalSkills, ['Facilitation']);
});

test('profile editing offers core skills for both retained and new careers', async () => {
  const { profileSkillOptions } = await import('../../frontend/modules/profile.js');
  const { CAREERS } = await import('../onboarding/catalog.js');
  const { publicCatalog } = await import('../internships/catalog.js');
  const catalog = publicCatalog();
  catalog.roles.push(...CAREERS);
  for (const role of catalog.roles) {
    const options = profileSkillOptions(catalog, role.id, ['Previously saved skill']);
    assert.ok(role.skills.every((skill) => options.includes(skill)));
    assert.ok(options.includes('Critical thinking'));
    assert.ok(options.includes('Previously saved skill'));
    assert.equal(options.length, new Set(options).size);
  }
});
