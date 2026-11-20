// Research metadata: occupational scope must remain attached to pay/outlook figures.
export const REVIEWED_ON = '2026-10-20';
const bls = 'https://www.bls.gov/ooh/';
const bachelor =
  'A bachelor’s degree in computing or a related field is typical in the referenced occupation. Individual employers may accept different preparation.';
export const PROFILES = {
  software: {
    field: 'Software',
    interests: ['Building products', 'Solving problems'],
    activities: ['Programming', 'Testing'],
    education: bachelor,
    entryTitles: ['Software engineering intern', 'Junior software developer'],
    specializations: ['Backend', 'Frontend', 'Full-stack', 'Mobile', 'Systems'],
    blsPath: 'computer-and-information-technology/software-developers.htm',
    pay: 135980,
    payOccupation: 'Software developers',
    outlook: '10% growth for the combined software developer and QA/tester group, 2025–2035',
    challenge:
      'Maintenance, tests, and communication are part of the work alongside writing new code.',
  },
  cybersecurity: {
    field: 'Security',
    interests: ['Investigating', 'Protecting systems'],
    activities: ['Investigation', 'Documentation'],
    education:
      'A computing bachelor’s degree and related experience are typical for information security analysts. Some employers prefer professional certification; entry routes vary.',
    entryTitles: ['Security intern', 'SOC analyst trainee'],
    specializations: ['Defensive security'],
    blsPath: 'computer-and-information-technology/information-security-analysts.htm',
    pay: 129180,
    payOccupation: 'Information security analysts',
    outlook: '21% growth, 2025–2035',
    challenge:
      'Security includes monitoring, documentation, and communicating risk. Not every security role is an entry-level role.',
    certifications:
      'Some employers prefer certifications. Check the actual posting before paying for one.',
  },
  'data-analyst': {
    field: 'Data',
    interests: ['Working with data', 'Explaining findings'],
    activities: ['Analysis', 'Visualization'],
    education:
      'Research the individual analyst posting. The linked BI occupation is a reference, not a universal degree requirement for every data analyst role.',
    entryTitles: ['Data analyst intern', 'Junior reporting analyst'],
    specializations: ['Analytics'],
    onetCode: '15-2051.01',
    onetName: 'Business Intelligence Analysts',
    sourceNote:
      'Data Analytics is mapped to Business Intelligence Analysts for work context. Data scientist pay is not presented as analyst pay.',
    challenge:
      'Cleaning data, clarifying the question, and explaining limitations can take as much attention as charts.',
  },
  'data-scientist': {
    field: 'Data',
    interests: ['Working with data', 'Solving problems'],
    activities: ['Analysis', 'Modeling'],
    education:
      'At least a bachelor’s degree in mathematics, statistics, computer science, or a related field is typical. Some employers require or prefer graduate education.',
    entryTitles: ['Data science intern', 'Junior data scientist'],
    specializations: ['Applied data science'],
    onetCode: '15-2051.00',
    onetName: 'Data Scientists',
    blsPath: 'math/data-scientists.htm',
    pay: 120230,
    payOccupation: 'Data scientists',
    outlook: '35% growth, 2025–2035',
    challenge:
      'Model validation, data quality, and uncertainty matter. A high training score does not demonstrate a useful model.',
  },
  cloud: {
    field: 'Infrastructure',
    interests: ['Running systems', 'Solving problems'],
    activities: ['Deployment', 'Troubleshooting'],
    education:
      'Cloud engineering spans several occupations. Check the specific role’s degree and experience requirements; there is no single cloud-engineer degree standard in this catalog.',
    entryTitles: ['Cloud engineering intern', 'Cloud support associate'],
    specializations: ['Cloud operations'],
    challenge:
      'Deployment involves permissions, monitoring, recovery, and cost management. A service running once is not proof of reliability.',
    sourceNote:
      'Cloud engineering is a role family. The systems-engineering source provides context; no salary is inferred for cloud engineers.',
  },
  devops: {
    field: 'Infrastructure',
    interests: ['Running systems', 'Automation'],
    activities: ['Automation', 'Deployment'],
    education:
      'DevOps titles vary across employers. Software and systems preparation can be relevant; review required experience in each posting.',
    entryTitles: ['DevOps intern', 'Build and release trainee'],
    specializations: ['Delivery automation'],
    onetCode: '15-1252.00',
    onetName: 'Software Developers',
    challenge:
      'DevOps includes collaboration, repeatable delivery, and incident learning. Tool lists alone do not describe the work.',
    sourceNote:
      'O*NET lists DevOps among software-developer titles. The broad occupation is not an exact DevOps pay or experience benchmark.',
  },
  systems: {
    field: 'Infrastructure',
    interests: ['Helping people', 'Running systems'],
    activities: ['Troubleshooting', 'Documentation'],
    education: bachelor,
    entryTitles: ['IT support intern', 'Systems support technician'],
    specializations: ['Systems administration'],
    blsPath: 'computer-and-information-technology/network-and-computer-systems-administrators.htm',
    pay: 99130,
    payOccupation: 'Network and computer systems administrators',
    outlook: '4% decline, 2025–2035; replacement openings still occur',
    challenge:
      'Support, backups, and documenting routine changes are meaningful work. Production changes require care and recovery plans.',
  },
  network: {
    field: 'Infrastructure',
    interests: ['Running systems', 'Investigating'],
    activities: ['Troubleshooting', 'Design'],
    education:
      'Network architects typically need a computing-related bachelor’s degree and related work experience. Support or administrator roles may precede architecture roles.',
    entryTitles: ['Networking intern', 'Network support technician'],
    specializations: ['Network operations'],
    onetCode: '15-1241.00',
    onetName: 'Computer Network Architects',
    blsPath: 'computer-and-information-technology/computer-network-architects.htm',
    pay: 134050,
    payOccupation: 'Computer network architects, an experienced occupation',
    outlook: '8% growth for network architects, 2025–2035',
    challenge:
      'Network engineering and network architecture are not interchangeable entry titles. Troubleshooting and supporting an existing network can be useful starting work.',
  },
  database: {
    field: 'Data',
    interests: ['Working with data', 'Running systems'],
    activities: ['Design', 'Troubleshooting'],
    education: bachelor,
    entryTitles: ['Database intern', 'Junior database support analyst'],
    specializations: ['Database operations'],
    onetCode: '15-1242.00',
    onetName: 'Database Administrators',
    blsPath: 'computer-and-information-technology/database-administrators.htm',
    pay: 104620,
    payOccupation: 'Database administrators; database engineering titles vary',
    outlook: '4% growth for the combined database administrator and architect group, 2025–2035',
    challenge:
      'Schema changes, access, recovery, and data correctness matter alongside writing queries.',
  },
  qa: {
    field: 'Software',
    interests: ['Investigating', 'Improving quality'],
    activities: ['Testing', 'Documentation'],
    education: bachelor,
    entryTitles: ['QA intern', 'Junior software tester'],
    specializations: ['Software testing'],
    onetCode: '15-1253.00',
    onetName: 'Software Quality Assurance Analysts and Testers',
    blsPath: 'computer-and-information-technology/software-developers.htm',
    pay: 104300,
    payOccupation: 'Software quality assurance analysts and testers',
    outlook: '10% growth for the combined software developer and QA/tester group, 2025–2035',
    challenge:
      'Testing includes exploratory work, risk assessment, clear bug reports, and communication. Automation is one part of the work.',
  },
};
export function profileSources(profile) {
  const sources = [];
  if (profile.onetCode)
    sources.push({
      title: `O*NET: ${profile.onetName}`,
      url: `https://www.onetonline.org/link/summary/${profile.onetCode}`,
      scope: 'Work, activities, occupational context',
      period: 'O*NET occupational profile; accessed on review date',
      reviewedOn: REVIEWED_ON,
      status: 'reviewed',
    });
  if (profile.blsPath)
    sources.push({
      title: 'BLS Occupational Outlook Handbook',
      url: bls + profile.blsPath,
      scope: 'Education, US pay, and occupational outlook',
      period: 'May 2025 wages; 2025–2035 projections',
      reviewedOn: REVIEWED_ON,
      status: 'reviewed',
    });
  return sources;
}
export const ADDITIONAL = [
  {
    id: 'data-scientist',
    name: 'Data Science',
    description: 'Explore data, evaluate models, and communicate results and uncertainty.',
    work: [
      'Prepare data for analysis',
      'Evaluate statistical or machine-learning models',
      'Explain results and limitations',
    ],
    focus: 'Statistical reasoning and careful evaluation.',
    environment: 'Computer-based analysis with collaboration and presentations.',
    skills: ['Python', 'Statistics', 'Data cleaning', 'Model evaluation', 'Communication'],
    technologies: ['Python', 'pandas', 'scikit-learn'],
    experiment: {
      title: 'Compare a prediction to a simple baseline',
      minutes: 90,
      steps: [
        'Use a small practice dataset from a tutorial.',
        'Split training and test data before fitting a simple model.',
        'Compare the result with a baseline and discuss limitations.',
      ],
      deliverable:
        'A reproducible notebook explaining the split, baseline, evaluation, and one limitation.',
    },
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Make software delivery repeatable and help teams operate it reliably.',
    work: [
      'Automate build and testing steps',
      'Improve delivery workflows',
      'Document operational changes',
    ],
    focus: 'Automation, version control, and repeatable delivery.',
    environment: 'Computer-based collaboration across development and operations.',
    skills: ['Git', 'Scripting', 'Testing', 'Containers', 'Monitoring'],
    technologies: ['Shell', 'GitHub Actions', 'Docker'],
    experiment: {
      title: 'Automate one project check',
      minutes: 90,
      steps: [
        'Use a disposable repository with a small tested program.',
        'Create a workflow that runs the test on a push.',
        'Introduce a failure and document how the workflow identifies it. Do not put credentials in the repository.',
      ],
      deliverable: 'A workflow file and a note showing one passing and one failing run.',
    },
  },
  {
    id: 'network',
    name: 'Network Engineering',
    description: 'Plan and troubleshoot how computer systems communicate.',
    work: [
      'Understand network needs',
      'Design network connections',
      'Document and diagnose connectivity issues',
    ],
    focus: 'Networking fundamentals, diagnosis, and clear diagrams.',
    environment: 'Systems work with users, infrastructure, and technical teams.',
    skills: ['Networking', 'IP addressing', 'Troubleshooting', 'Documentation', 'Security basics'],
    technologies: ['Network simulator', 'Diagnostic tools'],
    experiment: {
      title: 'Diagram a small fictional network',
      minutes: 60,
      steps: [
        'Draw a fictional network with two computers, a switch, and a router.',
        'Label addresses and trace a packet from one device to another.',
        'Describe how you would diagnose a wrong gateway. Use a diagram or local simulator.',
      ],
      deliverable: 'A labeled diagram and a diagnosis checklist.',
    },
  },
  {
    id: 'database',
    name: 'Database Engineering',
    description: 'Organize, protect, query, and recover data in database systems.',
    work: [
      'Design and maintain databases',
      'Manage access and backup procedures',
      'Investigate database performance',
    ],
    focus: 'Data correctness, query design, and recoverability.',
    environment: 'Computer-based systems work with application and data teams.',
    skills: ['SQL', 'Data modeling', 'Transactions', 'Backups', 'Access control'],
    technologies: ['PostgreSQL', 'SQL tools'],
    experiment: {
      title: 'Build a small library database',
      minutes: 90,
      steps: [
        'Create books and loans tables in a local practice database.',
        'Write a join to show current loans.',
        'Export the practice data and explain a recovery procedure.',
      ],
      deliverable: 'SQL scripts, sample output, and a recovery note using fictional data.',
    },
  },
  {
    id: 'qa',
    name: 'Quality Assurance / Software Testing',
    description: 'Investigate software behavior, identify defects, and communicate quality risks.',
    work: [
      'Design test cases',
      'Run exploratory and automated checks',
      'Report reproducible defects',
    ],
    focus: 'Observation, test design, and clear communication.',
    environment: 'Computer-based work with development and product teams.',
    skills: ['Test design', 'Bug reporting', 'Programming', 'Testing', 'Communication'],
    technologies: ['Test runners', 'Issue trackers'],
    experiment: {
      title: 'Test a small local application',
      minutes: 60,
      steps: [
        'Choose a local practice application and define expected behavior.',
        'Write five tests covering normal, boundary, and invalid input.',
        'Create one reproducible bug report or explain why the tests passed.',
      ],
      deliverable:
        'A test plan and a bug report with steps, expected behavior, and actual behavior.',
    },
  },
];
