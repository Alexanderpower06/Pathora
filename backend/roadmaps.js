export const careers = {
  'Software Engineer': {
    skills: [
      'JavaScript fundamentals',
      'Git and collaboration',
      'React components and state',
      'Testing and accessibility',
    ],
    project: 'Build your React portfolio project',
    projectTasks: [
      'Build a responsive React application',
      'Publish the app and document the code',
      'Add a live demo and case study to your portfolio',
    ],
    experience: [
      'Collaborate on a community or team project',
      'Request feedback and improve your work',
    ],
    interviews: [
      'Practice a coding problem and explain your approach',
      'Prepare examples of teamwork and problem solving',
      'Practice presenting your portfolio project',
    ],
  },
  'Data Analyst': {
    skills: [
      'Spreadsheets and data cleaning',
      'SQL queries',
      'Statistics fundamentals',
      'Data visualization',
    ],
    project: 'Build your data analysis portfolio project',
    projectTasks: [
      'Analyze a public dataset and document your methods',
      'Create a dashboard with three useful findings',
      'Publish a case study in your portfolio',
    ],
    experience: [
      'Analyze data for a community or team project',
      'Request feedback on your findings',
    ],
    interviews: [
      'Practice a SQL interview question',
      'Explain how you validate data quality',
      'Practice presenting your analysis',
    ],
  },
  'UX Designer': {
    skills: [
      'User research',
      'Interaction design',
      'Accessible design',
      'Prototyping and usability testing',
    ],
    project: 'Build your UX design portfolio case study',
    projectTasks: [
      'Research a user problem and create a prototype',
      'Test the prototype and refine your design',
      'Publish a case study explaining your decisions',
    ],
    experience: [
      'Collaborate on a community or team design project',
      'Request feedback from users and peers',
    ],
    interviews: [
      'Practice presenting your design process',
      'Prepare examples of responding to feedback',
      'Practice a design exercise',
    ],
  },
};
export function emptyProgress() {
  return { skills: [], projects: [], experience: [], interviews: [], applications: [] };
}
export function summarize(profile, progress) {
  const plan = careers[profile.career];
  const categories = Object.fromEntries(
    ['skills', 'projects', 'experience', 'interviews'].map((key) => {
      const items = key === 'projects' ? plan.projectTasks : plan[key];
      return [key, Math.round((progress[key].length / items.length) * 100)];
    }),
  );
  const milestones = [
    Boolean(profile.major),
    categories.skills === 100,
    categories.projects === 100,
    categories.experience === 100 && categories.interviews === 100,
    progress.applications.length > 0,
  ];
  const completed = milestones.filter(Boolean).length;
  const next = !milestones[0]
    ? {
        title: 'Create your career profile',
        section: 'Goals',
        description: 'Tell us where you are and where you want to go.',
      }
    : !milestones[1]
      ? {
          title: 'Build your career foundations',
          section: 'Skills',
          description: 'Start with the first unchecked skill in your learning plan.',
        }
      : !milestones[2]
        ? {
            title: plan.project,
            section: 'Projects',
            description:
              'Turn your skills into a project you can show. Complete the deliverables in your project plan.',
          }
        : categories.experience < 100
          ? {
              title: 'Put your skills into practice',
              section: 'Experience',
              description: 'Collaborate with others and improve your work through feedback.',
            }
          : categories.interviews < 100
            ? {
                title: 'Prepare for your interviews',
                section: 'Interview Prep',
                description: 'Practice explaining your work and solving role-specific problems.',
              }
            : !milestones[4]
              ? {
                  title: 'Apply for your next opportunity',
                  section: 'Applications',
                  description: 'Submit an application and add it to your tracker.',
                }
              : {
                  title: 'Keep your applications moving',
                  section: 'Applications',
                  description: 'Review application statuses and plan your next follow-up.',
                };
  return {
    categories,
    readiness: Math.round(Object.values(categories).reduce((a, b) => a + b, 0) / 4),
    milestones,
    completed,
    next,
    plan,
  };
}
