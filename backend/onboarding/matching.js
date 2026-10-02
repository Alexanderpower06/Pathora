import { PREFERENCES } from './catalog.js';
export function careerMatches(answers, careers) {
  return careers
    .map((career) => {
      const reasons = [];
      let points = 0;
      for (const preference of PREFERENCES) {
        if (career.affinities.includes(preference)) {
          const rating = answers.quiz?.[preference] ?? 0;
          points += rating;
          if (rating >= 2)
            reasons.push(`You enjoy ${preference.replace('-', ' ')} (+${rating} points).`);
          if (answers.preferences?.includes(preference)) {
            points += 2;
            reasons.push(
              `You selected ${preference.replace('-', ' ')} as an interest (+2 points).`,
            );
          }
        }
      }
      const environment =
        answers.environment === career.environment || answers.environment === 'any';
      if (environment) {
        points += 2;
        reasons.push('Your work environment preference aligns (+2 points).');
      }
      // Two career affinities, each rated 0–3 and with 0–2 interest points, plus 2 environment points.
      return {
        ...career,
        score: Math.round((points / 12) * 100),
        reasons: reasons.length
          ? reasons
          : ['No preferences align yet. Explore the work before deciding.'],
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function skillMatch(skills, career) {
  const have = career.skills.filter((skill) => skills.includes(skill));
  return {
    have,
    gaps: career.skills.filter((skill) => !skills.includes(skill)),
    total: career.skills.length,
    percent: Math.round((have.length / career.skills.length) * 100),
  };
}
