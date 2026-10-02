import { ROLES } from './catalog.js';

export function recommendRoles(profile) {
  return Object.values(ROLES)
    .map((role) => {
      const matchedSkills = role.skills.filter((skill) => profile.existingSkills.includes(skill));
      const interested = profile.interests.includes(role.interest);
      const reasons = [];
      if (interested) reasons.push(`You chose “${role.interest}”.`);
      if (matchedSkills.length)
        reasons.push(`You report experience with ${matchedSkills.join(', ')}.`);
      if (!reasons.length)
        reasons.push('An option to explore; your answers do not yet show a strong connection.');
      return {
        ...role,
        reasons,
        missingSkills: role.skills.filter((skill) => !matchedSkills.includes(skill)),
        score: (interested ? 3 : 0) + matchedSkills.length,
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
