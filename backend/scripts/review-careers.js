import { EXPLORATION_CAREERS, reviewStatus } from '../exploration/catalog.js';
let failed = false;
for (const career of EXPLORATION_CAREERS) {
  const errors = [];
  if (!career.sources.length) errors.push('No sources');
  for (const source of career.sources) {
    if (!source.reviewedOn || !source.period || !source.scope)
      errors.push('Incomplete source metadata');
    try {
      if (new URL(source.url).protocol !== 'https:') errors.push('Non-HTTPS source');
    } catch {
      errors.push('Invalid source URL');
    }
  }
  const ids = new Set(career.milestones.map((item) => item.id));
  for (const milestone of career.milestones)
    if (
      milestone.prerequisites.some((id) => !ids.has(id)) ||
      !milestone.evidence ||
      !milestone.tasks.length
    )
      errors.push('Incomplete milestone');
  if (errors.length) failed = true;
  console.log(
    `${career.name}: ${errors.length ? errors.join('; ') : reviewStatus(career)} · ${career.reviewedOn} · next review ${career.review.dueOn}`,
  );
}
process.exitCode = failed ? 1 : 0;
