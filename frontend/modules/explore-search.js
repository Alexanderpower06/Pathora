// Pure filtering: no ranking, predictions, or network request per keystroke.
export const FILTERS = [
  ['field', 'Career Field'],
  ['interest', 'Interests'],
  ['activity', 'Work Activities'],
  ['education', 'Education'],
  ['experience', 'Experience Level'],
  ['environment', 'Work Environment'],
];
const values = (career) => ({
  field: [career.field],
  interest: career.interests,
  activity: career.activities,
  education: [career.educationFilter],
  experience: career.experienceLevels,
  environment: [career.environmentFilter],
});
export function filterOptions(careers, key) {
  return [...new Set(careers.flatMap((career) => values(career)[key]))].sort();
}
export function filterCareers(careers, query, filters = {}) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return careers.filter((career) => {
    const text = [
      career.name,
      career.description,
      ...career.entryTitles,
      ...career.skills,
      ...career.technologies,
      ...career.work,
      ...career.specializations,
      ...career.milestones.map((milestone) => milestone.title),
    ]
      .join(' ')
      .toLowerCase();
    return (
      terms.every((term) => text.includes(term)) &&
      FILTERS.every(([key]) => !filters[key] || values(career)[key].includes(filters[key]))
    );
  });
}
