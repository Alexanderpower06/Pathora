export function scheduleWeek(tasks, weeklyHours, urgent = false) {
  const applicationOrder = ['explore', 'compare-postings', 'resume', 'review', 'apply'];
  const ordered = urgent
    ? tasks.toSorted((a, b) => {
        const rank = (task) => {
          const index = applicationOrder.indexOf(task.id);
          return index < 0 ? applicationOrder.length : index;
        };
        return rank(a) - rank(b);
      })
    : tasks;
  const satisfied = new Set(tasks.filter((task) => task.status === 'done').map((task) => task.id));
  let remaining = weeklyHours;
  const weekly = [];
  for (const task of ordered) {
    if (
      task.status === 'done' ||
      task.hours > remaining ||
      !task.dependencies.every((id) => satisfied.has(id))
    )
      continue;
    weekly.push(task.id);
    remaining -= task.hours;
    // A blocked prerequisite is a help-seeking step, not permission to skip it.
    if (task.status !== 'blocked') satisfied.add(task.id);
  }
  return { weekly, plannedHours: weeklyHours - remaining };
}
