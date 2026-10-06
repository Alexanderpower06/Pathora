// Occupational summaries are paraphrased from the linked O*NET profiles.
// Experiments and focus notes are Pathora editorial curriculum, not employer requirements.
const reviewedOn = '2026-10-05';
const entries = [
  {
    id: 'software',
    name: 'Software Engineering',
    description: 'Design, build, test, and improve software that solves a user problem.',
    work: [
      'Understand user requirements',
      'Build and debug applications',
      'Test and maintain software',
    ],
    focus: 'Programming, debugging, and explaining technical decisions.',
    environment: 'Computer-based work with collaboration across a development team.',
    skills: ['Programming', 'Git', 'Data structures', 'Databases', 'Testing'],
    technologies: ['A programming language', 'Version control', 'Database tools'],
    sourceCodes: ['15-1252.00'],
    sourceNames: ['Software Developers'],
    experiment: {
      title: 'Build a small study planner',
      minutes: 90,
      steps: [
        'Create a list of study tasks using a language you know.',
        'Add a way to mark a task complete.',
        'Test three cases and explain one design decision.',
      ],
      deliverable: 'A working local program and notes on what you built and tested.',
    },
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Investigate risks and help protect systems and information.',
    work: [
      'Review security risks',
      'Monitor systems and investigate issues',
      'Document safeguards and communicate findings',
    ],
    focus: 'Careful investigation, systems knowledge, and communicating risk.',
    environment: 'Computer-based investigation and coordination with system users and teams.',
    skills: ['Networking', 'Linux', 'Log analysis', 'Access control', 'Documentation'],
    technologies: ['Operating systems', 'Logs', 'Network tools'],
    sourceCodes: ['15-1212.00'],
    sourceNames: ['Information Security Analysts'],
    experiment: {
      title: 'Investigate a fictional login log',
      minutes: 60,
      steps: [
        'Write a local sample of ten fictional login events with times and success or failure.',
        'Look for repeated failures and explain what else you would need to know.',
        'Write a short incident note with one safeguard. Work only with your own fictional data.',
      ],
      deliverable:
        'Your sample log and an explanation distinguishing observations from assumptions.',
    },
  },
  {
    id: 'data-analyst',
    name: 'Data Analytics / Data Science',
    description: 'Analyze data and communicate findings that answer a practical question.',
    work: [
      'Prepare and analyze data',
      'Create charts and check conclusions',
      'Explain results and limitations',
    ],
    focus: 'Data quality, statistics, interpretation, and clear communication.',
    environment: 'Computer-based analysis with stakeholder discussions and presentations.',
    skills: ['Statistics', 'SQL', 'Data cleaning', 'Visualization', 'Communication'],
    technologies: ['Spreadsheets', 'SQL', 'Python or R'],
    sourceCodes: ['15-2051.00'],
    sourceNames: ['Data Scientists'],
    sourceNote:
      'This source describes data scientists. The starter Path emphasizes analytics; analyst and scientist requirements differ by role.',
    experiment: {
      title: 'Answer a question with a small dataset',
      minutes: 60,
      steps: [
        'Create twenty rows of fictional study hours and task completions.',
        'Check missing values and calculate two summaries in a spreadsheet.',
        'Make one chart and describe a finding and a limitation.',
      ],
      deliverable:
        'A spreadsheet or notebook, a chart, and a short explanation. Do not claim causation from this sample.',
    },
  },
  {
    id: 'cloud',
    name: 'Cloud / DevOps',
    description: 'Explore how applications are deployed, operated, and kept reliable.',
    work: [
      'Understand system requirements',
      'Integrate and operate software systems',
      'Monitor performance and document changes',
    ],
    focus: 'Systems thinking, automation, troubleshooting, and reliability.',
    environment: 'Computer-based systems work with development and operations teams.',
    skills: ['Linux', 'Networking', 'Git', 'Scripting', 'Monitoring'],
    technologies: ['Shell tools', 'Containers', 'Deployment tools'],
    sourceCodes: ['15-1299.08', '15-1252.00'],
    sourceNames: ['Computer Systems Engineers/Architects', 'Software Developers'],
    sourceNote:
      'Cloud and DevOps are broad role families. These occupational profiles provide context, not a single universal DevOps requirement list.',
    experiment: {
      title: 'Operate a local application',
      minutes: 90,
      steps: [
        'Run a small application locally using its documented setup.',
        'Stop and restart it, and observe its logs.',
        'Write a repeatable startup checklist and a response to one simulated failure. No paid cloud account is needed.',
      ],
      deliverable: 'A runbook with startup, verification, failure diagnosis, and shutdown steps.',
    },
  },
  {
    id: 'systems',
    name: 'IT / Systems',
    description: 'Configure, maintain, and troubleshoot computer systems and networks.',
    work: [
      'Diagnose system and network problems',
      'Maintain backups and recovery procedures',
      'Support users and document changes',
    ],
    focus: 'Troubleshooting, operating systems, user support, and dependable processes.',
    environment: 'Systems work involving computers, users, and technical teams.',
    skills: ['Networking', 'Operating systems', 'Troubleshooting', 'Backups', 'Communication'],
    technologies: ['Operating-system tools', 'Network diagnostics', 'Backup tools'],
    sourceCodes: ['15-1244.00'],
    sourceNames: ['Network and Computer Systems Administrators'],
    experiment: {
      title: 'Practice a backup and recovery',
      minutes: 60,
      steps: [
        'Create a folder of disposable practice files and copy it to a backup folder.',
        'Change one practice file and restore a separate copy from the backup.',
        'Verify the restored content and write instructions another student could follow.',
      ],
      deliverable:
        'A recovery checklist and verification notes using only disposable practice files.',
    },
  },
];
export const EXPLORATION_CAREERS = entries.map(({ sourceCodes, sourceNames, ...career }) => ({
  ...career,
  reviewedOn,
  sources: sourceCodes.map((code, index) => ({
    title: `O*NET: ${sourceNames[index]}`,
    url: `https://www.onetonline.org/link/summary/${code}`,
    scope: 'Occupational overview, tasks, and work context',
    reviewedOn,
  })),
  methodology:
    'Career summaries use the linked occupational sources. Focus notes, starter skills, and experiments are Pathora curriculum choices. Careers are shown in a fixed order without a fit score. Education, pay, and outlook should be checked in the source for the specific occupation and location.',
}));
export const explorationCareer = (id) => EXPLORATION_CAREERS.find((career) => career.id === id);
