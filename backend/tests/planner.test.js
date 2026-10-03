import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStudent,
  validateTaskUpdate,
  validateStudentApplication,
} from '../internships/validation.js';
import { buildStudentState, emptyStudentDocument } from '../internships/planner.js';
import { recommendRoles } from '../internships/matching.js';
import { createStudentService } from '../internships/service.js';
import { memoryStudentRepository } from '../testing/memory-student-repository.js';

export const student = {
  name: 'Alex',
  major: 'Computer Science',
  graduation: '2028-05',
  weeklyHours: 5,
  targetDate: '2027-02-01',
  role: 'frontend',
  interests: ['Building websites'],
  existingSkills: ['HTML and CSS'],
  courses: 'A group web project',
  experience: 'Campus library job',
};
function state(profile = student, progress = {}) {
  return buildStudentState(
    { ...emptyStudentDocument(), profile, progress },
    new Date('2026-10-01T12:00:00Z'),
  );
}
test('role recommendations explain interest and skill overlap without excluding other majors', () => {
  const matches = recommendRoles({ ...student, major: 'History' });
  assert.equal(matches[0].id, 'frontend');
  assert.ok(matches[0].reasons.some((reason) => reason.includes('Building websites')));
  assert.ok(matches[0].reasons.some((reason) => reason.includes('HTML and CSS')));
  assert.equal(matches.length, 3);
});
test('weekly plan stays within budget, supports parallel applications, and honors dependencies', () => {
  for (const hours of [1, 2, 5, 10, 20]) {
    const current = state({ ...student, weeklyHours: hours });
    assert.ok(current.plannedHours <= hours);
    const scheduled = new Set();
    for (const id of current.weekly) {
      const task = current.tasks.find((task) => task.id === id);
      assert.ok(task.dependencies.every((dependency) => scheduled.has(dependency)));
      scheduled.add(id);
    }
    assert.ok(current.weekly.length > 0);
  }
  assert.ok(state().weekly.includes('apply'));
  assert.ok(!state().weekly.includes('project-publish'));
});
test('reported skills change the task and gaps, without certifying completion', () => {
  const beginner = state({ ...student, existingSkills: [] });
  const experienced = state();
  assert.notEqual(
    beginner.tasks.find((task) => task.id === 'foundation').title,
    experienced.tasks.find((task) => task.id === 'foundation').title,
  );
  assert.ok(!experienced.gaps.includes('HTML and CSS'));
  assert.equal(experienced.completion, 0);
  assert.ok(experienced.recognizedExperience.some((item) => item.includes('Campus library job')));
});
test('undecided students get exploration and deadline guidance', () => {
  const current = state({ ...student, role: 'undecided', targetDate: '2026-09-30' });
  assert.equal(current.next.id, 'explore');
  assert.equal(current.selectedRole, null);
  assert.ok(current.warnings.some((warning) => warning.includes('passed')));
});
test('blocked prerequisites do not unlock dependent tasks', () => {
  const current = state(student, {
    frontend: { resume: { status: 'blocked', evidence: 'Need help with my examples', link: '' } },
  });
  assert.ok(current.weekly.includes('resume'));
  assert.ok(!current.weekly.includes('review'));
  assert.ok(!current.weekly.includes('apply'));
});
test('validation rejects inherited keys, unsafe links, impossible dates, invalid budgets and missing evidence', () => {
  for (const role of ['__proto__', 'constructor', 'toString'])
    assert.throws(() => validateStudent({ ...student, role }));
  for (const weeklyHours of [0, 21, 1.5, '5'])
    assert.throws(() => validateStudent({ ...student, weeklyHours }));
  assert.throws(() => validateStudent({ ...student, targetDate: '2027-02-30' }));
  assert.throws(() => validateTaskUpdate({ status: 'done', evidence: '', link: '' }));
  assert.throws(() =>
    validateTaskUpdate({
      status: 'done',
      evidence: 'Completed my exercise',
      link: 'javascript:alert(1)',
    }),
  );
  assert.throws(() =>
    validateStudentApplication({
      company: 'A',
      title: 'Intern',
      role: 'constructor',
      status: 'Saved',
    }),
  );
});
test('role changes preserve progress and stale task saves are rejected atomically', async () => {
  const service = createStudentService(memoryStudentRepository());
  await service.saveProfile(student);
  await service.updateTask('resume', {
    role: 'frontend',
    status: 'done',
    evidence: 'Wrote a resume using my class project',
    link: '',
  });
  await service.saveProfile({ ...student, role: 'backend' });
  await assert.rejects(
    service.updateTask('resume', {
      role: 'frontend',
      status: 'done',
      evidence: 'A stale resume update',
      link: '',
    }),
    { status: 409 },
  );
  assert.equal((await service.state()).completedCount, 0);
  await service.saveProfile(student);
  assert.equal((await service.state()).completedCount, 1);
});

test('application roles must be strings; malformed updates leave stored data unchanged', async () => {
  const service = createStudentService(memoryStudentRepository());
  await service.saveProfile(student);
  const application = { company: 'Example', title: 'Intern', role: 'frontend', status: 'Saved' };
  const added = await service.addApplication(application);
  for (const role of [['frontend'], { toString: () => 'frontend' }, null, 42]) {
    assert.throws(() => validateStudentApplication({ ...application, role }), { status: 400 });
    await assert.rejects(service.addApplication({ ...application, role }), { status: 400 });
    await assert.rejects(
      service.updateApplication(added.applications[0].id, { ...application, role }),
      { status: 400 },
    );
  }
  assert.deepEqual((await service.state()).applications, added.applications);
});

test('application deadlines stop prompting after applying; due follow-ups still appear', () => {
  const document = {
    profile: student,
    progress: {},
    applications: [
      { id: 'saved', status: 'Saved', deadline: '2026-09-30', followUp: '' },
      { id: 'applied', status: 'Applied', deadline: '2026-09-30', followUp: '2026-10-05' },
      { id: 'interview', status: 'Interviewing', deadline: '2026-09-30', followUp: '2026-10-01' },
      { id: 'closed', status: 'Rejected', deadline: '2026-09-30', followUp: '2026-10-01' },
    ],
  };
  assert.deepEqual(
    buildStudentState(document, new Date('2026-10-01T12:00:00Z')).reminders.map((item) => item.id),
    ['saved', 'interview'],
  );
});
test('concurrent updates preserve tasks and applications; invalid updates do not leak partial writes', async () => {
  const service = createStudentService(memoryStudentRepository());
  await service.saveProfile(student);
  await Promise.all([
    service.updateTask('resume', {
      role: 'frontend',
      status: 'done',
      evidence: 'Wrote my resume with two examples',
      link: '',
    }),
    service.updateTask('compare-postings', {
      role: 'frontend',
      status: 'done',
      evidence: 'Compared three current internship postings',
      link: '',
    }),
    service.addApplication({
      company: 'Example',
      title: 'Intern',
      role: 'frontend',
      status: 'Saved',
      notes: '',
    }),
  ]);
  assert.equal((await service.state()).completedCount, 2);
  assert.equal((await service.state()).applications.length, 1);
  await assert.rejects(
    service.updateTask('unknown', {
      role: 'frontend',
      status: 'done',
      evidence: 'This task does not exist',
      link: '',
    }),
    { status: 404 },
  );
  assert.equal((await service.state()).completedCount, 2);
});

test('near application targets move applying ahead of extra learning', () => {
  const ordinary = state({ ...student, weeklyHours: 3 });
  const urgent = state({ ...student, weeklyHours: 3, targetDate: '2026-10-10' });
  assert.ok(urgent.weekly.includes('review'));
  assert.ok(!urgent.weekly.includes('foundation'));
  assert.ok(ordinary.weekly.includes('foundation'));
});
test('a one-hour budget can reach every unfinished project task', () => {
  const completed = {};
  for (const task of state().tasks)
    if (!task.id.startsWith('project-'))
      completed[task.id] = { status: 'done', evidence: 'Completed example work', link: '' };
  let current = state({ ...student, weeklyHours: 1 }, { frontend: completed });
  for (const id of [
    'project-outline',
    'project-build',
    'project-finish',
    'project-check',
    'project-publish',
  ]) {
    assert.ok(current.weekly.includes(id));
    completed[id] = { status: 'done', evidence: 'Completed this small project step', link: '' };
    current = state({ ...student, weeklyHours: 1 }, { frontend: completed });
  }
});
test('recording an applied opportunity documents the applying step', async () => {
  const service = createStudentService(memoryStudentRepository());
  await service.saveProfile(student);
  await service.addApplication({
    company: 'Example',
    title: 'Frontend intern',
    role: 'frontend',
    status: 'Applied',
    notes: '',
  });
  const current = await service.state();
  assert.equal(current.tasks.find((task) => task.id === 'apply').status, 'done');
  assert.ok(current.evidence.some((item) => item.evidence.includes('self-reported')));
});

test('follow-up dates use the student time zone rather than the server calendar day', () => {
  const document = {
    profile: { ...student, timeZone: 'America/New_York' },
    progress: {},
    applications: [
      { id: 'example', role: 'frontend', status: 'Applied', followUp: '2026-10-02', deadline: '' },
    ],
  };
  const now = new Date('2026-10-02T00:30:00Z');
  assert.equal(buildStudentState(document, now).reminders.length, 0);
  document.profile.timeZone = 'UTC';
  assert.equal(buildStudentState(document, now).reminders.length, 1);
});
