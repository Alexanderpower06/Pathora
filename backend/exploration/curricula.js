import { RESOURCES } from './resources.js';
// Authored practice curricula, not a job-posting sample or a certification standard.
// Preserve the existing eight Build IDs so recorded progress never moves to another task.
export const CURRICULA = {
  software: [
    [
      'Programming fundamentals',
      'Express a small problem as a program before adding frameworks.',
      'Write functions with inputs and return values.|Handle invalid inputs.|Explain a loop and a collection.',
      'python',
      'A runnable program with three test cases.',
    ],
    [
      'Git and version control',
      'Track changes and make your work reproducible.',
      'Initialize a practice repository.|Make three focused commits.|Create a branch and merge a change.',
      'git',
      'A repository with meaningful history and setup instructions.',
    ],
    [
      'Data structures and algorithms',
      'Choose a representation and explain its tradeoffs.',
      'Implement a list-based task queue.|Compare lookup in a list and a dictionary.|Explain runtime for two operations.',
      'python',
      'Code, tests, and a written explanation of your choices.',
    ],
    [
      'SQL fundamentals',
      'Store and retrieve related application data.',
      'Create two related tables.|Use SELECT, WHERE, ORDER BY, JOIN, and GROUP BY.|Test an invalid relationship.',
      'sql',
      'A SQL script and expected query results.',
    ],
    [
      'Build and test an API',
      'Connect a program to a documented interface.',
      'Define create, read, update, and delete operations.|Validate input and return meaningful errors.|Write success and failure tests.',
      'web',
      'A documented local API with tests and a relational database.',
    ],
  ],
  cybersecurity: [
    [
      'Networking fundamentals',
      'Understand the system you are investigating.',
      'Diagram a fictional network.|Explain IP addresses, DNS, and ports.|Trace a sample connection.',
      'network',
      'A network diagram and explanations of its components.',
    ],
    [
      'Linux practice',
      'Read files, permissions, and processes in a controlled environment.',
      'Navigate a disposable practice folder.|Inspect permissions without changing system files.|Describe a process and a log file.',
      'linux',
      'A command journal using only your own practice files.',
    ],
    [
      'Security fundamentals',
      'Separate observations, risks, and assumptions.',
      'Describe a fictional asset and threat.|Identify an access-control risk.|Propose a safeguard and its limitation.',
      'security',
      'A short threat and safeguard note.',
    ],
    [
      'Analyze sample logs',
      'Turn observations into an investigation someone can reproduce.',
      'Create fictional login events.|Identify a pattern of failures.|Record alternative explanations and missing context.',
      'python',
      'A sample log and an investigation note.',
    ],
    [
      'Practice incident response',
      'Communicate a bounded response without experimenting on other systems.',
      'Use a fictional alert.|Write triage and escalation steps.|Describe what evidence to preserve and why.',
      'security',
      'A tabletop response checklist with assumptions clearly labeled.',
    ],
  ],
  'data-analyst': [
    [
      'Spreadsheet analysis',
      'Answer a question before choosing a visualization.',
      'Create a practice dataset.|Check blanks and duplicates.|Calculate summaries and verify two values manually.',
      'data',
      'A checked spreadsheet with a data dictionary.',
    ],
    [
      'SQL queries',
      'Retrieve and combine data reproducibly.',
      'Write SELECT and WHERE queries.|Join two practice tables.|Group results and check row counts.',
      'sql',
      'SQL queries, expected results, and a row-count check.',
    ],
    [
      'Statistics fundamentals',
      'Explain what a summary does and does not establish.',
      'Compare mean and median.|Investigate an outlier.|Explain why correlation alone is not causation.',
      'data',
      'A short analysis with an uncertainty and limitations section.',
    ],
    [
      'Clean a dataset',
      'Make data preparation explicit and repeatable.',
      'Define missing-value rules.|Apply consistent types.|Log transformations and compare before/after counts.',
      'data',
      'A reproducible cleaning script or documented spreadsheet steps.',
    ],
    [
      'Build an analysis dashboard',
      'Communicate a useful finding and its limits.',
      'Choose a question and audience.|Build two relevant charts.|Check labels, units, and an alternative interpretation.',
      'data',
      'A dashboard with source notes and a short findings memo.',
    ],
  ],
  'data-scientist': [
    [
      'Python for data',
      'Make analysis reproducible.',
      'Load a practice dataset.|Inspect types and missing values.|Write reusable preparation functions.',
      'data',
      'A notebook that reruns from a clean start.',
    ],
    [
      'Statistics and baselines',
      'Establish what a model must improve on.',
      'Choose a measurable question.|Describe the target and sample.|Calculate a simple baseline.',
      'data',
      'A baseline and explanation of the evaluation metric.',
    ],
    [
      'Train and test separation',
      'Prevent evaluation from reusing information it should not have.',
      'Split training and test data.|Fit transformations on training data only.|Explain a possible leakage source.',
      'science',
      'Code showing the split and a leakage check.',
    ],
    [
      'Model evaluation',
      'Evaluate errors as well as a headline metric.',
      'Train one simple model.|Compare against the baseline.|Inspect errors and subgroup limitations without making unsupported claims.',
      'science',
      'A held-out evaluation and error analysis.',
    ],
    [
      'Reproducible modeling pipeline',
      'Connect preparation, fitting, and evaluation consistently.',
      'Use a pipeline.|Document dependencies and a seed.|Rerun the evaluation and record limitations.',
      'science',
      'A runnable pipeline and model report.',
    ],
  ],
  cloud: [
    [
      'Linux fundamentals',
      'Understand the environment your application runs in.',
      'Navigate files and permissions in a local practice folder.|Inspect a process.|Read application logs.',
      'linux',
      'A command journal and startup notes.',
    ],
    [
      'Networking practice',
      'Understand how a request reaches a service.',
      'Diagram client, service, and database.|Explain ports and name resolution.|Document a connection failure.',
      'network',
      'A connection diagram and troubleshooting checklist.',
    ],
    [
      'Version control and scripting',
      'Make setup repeatable.',
      'Version a practice configuration.|Write a startup script.|Document inputs and failure behavior.',
      'git',
      'A versioned setup script with usage instructions.',
    ],
    [
      'Run a local application',
      'Verify a service works before using a paid cloud environment.',
      'Run a small local service.|Check a health response.|Restart and verify it again.',
      'containers',
      'A reproducible local deployment with a health check.',
    ],
    [
      'Observe logs and failures',
      'Practice diagnosis and recovery.',
      'Trigger one safe local failure.|Find the relevant log.|Restore the service and document verification.',
      'cloud',
      'A failure and recovery runbook.',
    ],
  ],
  devops: [
    [
      'Git workflow',
      'Make delivery changes reviewable.',
      'Create a branch.|Make a focused change.|Review a diff and merge it.',
      'git',
      'A repository showing a small reviewed change.',
    ],
    [
      'Scripting and exit codes',
      'Automate a check with clear success and failure behavior.',
      'Write a script that runs a test.|Return a failing exit code for a failed check.|Document invocation.',
      'python',
      'A check script and examples of success and failure.',
    ],
    [
      'Automated tests',
      'Give the delivery workflow a meaningful check.',
      'Test a normal input.|Test a boundary input.|Test invalid input and explain what remains untested.',
      'testing',
      'A test suite and test-scope note.',
    ],
    [
      'Continuous integration',
      'Run a reproducible check when code changes.',
      'Create a GitHub Actions workflow in a practice repository.|Run tests on a push.|Investigate a deliberately failing change.',
      'ci',
      'A workflow and documented pass/fail runs without secrets.',
    ],
    [
      'Containerized delivery',
      'Separate a repeatable application environment from machine setup.',
      'Build a local container.|Document configuration.|Verify startup and shutdown.',
      'containers',
      'A container setup and local verification checklist.',
    ],
  ],
  systems: [
    [
      'Operating system fundamentals',
      'Understand files, users, and processes before administering systems.',
      'Inspect your local practice environment.|Explain user permissions.|Document a process and its logs.',
      'linux',
      'An environment inventory using non-sensitive practice data.',
    ],
    [
      'Networking basics',
      'Diagnose a connection systematically.',
      'Explain IP, DNS, and gateway concepts.|Draw a fictional connection.|Write a sequence of diagnostic questions.',
      'network',
      'A connection diagram and diagnosis checklist.',
    ],
    [
      'Access control practice',
      'Explain who should be able to do what.',
      'Define fictional users and roles.|Create an access matrix.|Describe how you would review access.',
      'linux',
      'An access matrix and review note.',
    ],
    [
      'Diagnose a simulated issue',
      'Practice a reproducible support process.',
      'Write a fictional support ticket.|Separate symptoms and causes.|Document verification after a proposed fix.',
      'network',
      'A support record with diagnosis and verification.',
    ],
    [
      'Backup and restore practice',
      'A backup is useful when recovery has been checked.',
      'Back up disposable files.|Restore to a separate practice folder.|Compare restored contents.',
      'linux',
      'A recovery checklist and verification results.',
    ],
  ],
  network: [
    [
      'Networking fundamentals',
      'Explain how devices communicate.',
      'Diagram devices and links.|Describe switching and routing.|Trace a fictional packet.',
      'network',
      'A labeled network diagram and packet trace.',
    ],
    [
      'IP addressing practice',
      'Plan addresses without conflicting assignments.',
      'Design a small fictional address plan.|Identify a gateway.|Explain one incorrect address scenario.',
      'network',
      'An address plan with a troubleshooting example.',
    ],
    [
      'Name resolution and services',
      'Separate a DNS problem from a connection problem.',
      'Explain a name lookup.|List service ports in a fictional system.|Write a diagnostic checklist.',
      'network',
      'A service map and diagnosis notes.',
    ],
    [
      'Network troubleshooting',
      'Use observations to narrow the cause.',
      'Model a disconnected link or wrong gateway in a diagram or simulator.|Record symptoms.|Verify the corrected model.',
      'network',
      'A before/after diagram and verification record.',
    ],
    [
      'Secure network changes',
      'Make a change understandable and recoverable.',
      'Describe a fictional segmentation rule.|Record its intended effect.|Write verification and rollback steps.',
      'network',
      'A change plan and rollback checklist.',
    ],
  ],
  database: [
    [
      'Relational modeling',
      'Represent relationships and constraints explicitly.',
      'Model books and loans.|Identify keys.|Explain a required relationship.',
      'sql',
      'A schema diagram and table definitions.',
    ],
    [
      'SQL fundamentals',
      'Query and summarize related data.',
      'Use SELECT, WHERE, and ORDER BY.|Join tables.|Use GROUP BY and verify results.',
      'sql',
      'Queries and checked sample results.',
    ],
    [
      'Transactions and constraints',
      'Keep related changes consistent.',
      'Add a constraint.|Run a transaction in a practice database.|Show a rollback on failure.',
      'sql',
      'A script demonstrating consistency and rollback.',
    ],
    [
      'Query investigation',
      'Measure before changing a query.',
      'Create a practice dataset.|Inspect a query plan.|Explain one index tradeoff.',
      'sql',
      'Before/after plans and a limitations note.',
    ],
    [
      'Backup and restore',
      'Practice recovery using only disposable data.',
      'Export a practice database.|Restore into a separate database.|Verify tables and row counts.',
      'sql',
      'A tested backup and recovery procedure.',
    ],
  ],
  qa: [
    [
      'Test design fundamentals',
      'Connect expected behavior to observable results.',
      'Write acceptance criteria for a local app.|Cover normal, boundary, and invalid inputs.|Explain one risk.',
      'testing',
      'A test plan mapped to expected behavior.',
    ],
    [
      'Reproducible bug reports',
      'Help another person verify the problem.',
      'Describe environment and inputs.|Write reproduction steps.|Separate expected and actual behavior.',
      'testing',
      'A complete bug report using a practice app.',
    ],
    [
      'Programming for tests',
      'Express repeatable checks in code.',
      'Write a test function.|Set up disposable test data.|Clean up and explain an assertion.',
      'python',
      'A small repeatable test suite.',
    ],
    [
      'Automated regression tests',
      'Check behavior that should remain stable.',
      'Automate three meaningful cases.|Cause a failure deliberately.|Explain what the test does not cover.',
      'testing',
      'Passing and failing test output with scope notes.',
    ],
    [
      'API test strategy',
      'Test interfaces as well as successful examples.',
      'Test one API operation.|Test invalid data.|Document authentication and authorization cases you would need.',
      'web',
      'An API test plan and a small runnable check.',
    ],
  ],
};
export const PROJECTS = {
  software: [
    'REST API project',
    'Build a study-task API with create, read, update, and delete operations.',
    ['Input validation and useful errors', 'Relational persistence', 'Success and failure tests'],
  ],
  cybersecurity: [
    'Defensive investigation case study',
    'Investigate a fictional alert using only synthetic logs.',
    ['Timeline of observations', 'Alternative explanations', 'Response and escalation checklist'],
  ],
  'data-analyst': [
    'Analysis case study',
    'Use a small licensed or synthetic dataset to answer a practical question.',
    ['Reproducible cleaning', 'SQL summaries and charts', 'Findings and limitations memo'],
  ],
  'data-scientist': [
    'Baseline-to-model case study',
    'Compare a simple model with a baseline on held-out data.',
    ['Leakage checks', 'Reproducible evaluation', 'Error and limitations analysis'],
  ],
  cloud: [
    'Local deployment runbook',
    'Run a small application and practice recovering it locally.',
    ['Repeatable startup', 'Health check and logs', 'Failure diagnosis and recovery'],
  ],
  devops: [
    'Delivery pipeline project',
    'Build a tested workflow for a disposable application.',
    ['Automated test gate', 'Containerized local run', 'Failure investigation notes'],
  ],
  systems: [
    'Support and recovery case study',
    'Document a fictional support issue and a tested recovery.',
    ['Access and system inventory', 'Troubleshooting record', 'Verified backup restoration'],
  ],
  network: [
    'Small network design',
    'Design and test a small fictional network in a diagram or simulator.',
    ['Address and service plan', 'Failure scenario', 'Verification and rollback notes'],
  ],
  database: [
    'Database-backed library',
    'Design, query, and recover a small library database.',
    ['Keys and constraints', 'Queries and transactions', 'Tested recovery script'],
  ],
  qa: [
    'Software test portfolio',
    'Test a small application against explicit expected behavior.',
    ['Risk-based test plan', 'Reproducible bug reports', 'Automated regression cases'],
  ],
};
const PREREQUISITES = {
  software: [[], [], [0], [], [0, 3], [4]],
  cybersecurity: [[], [], [0, 1], [0, 1], [2, 3], [4]],
  'data-analyst': [[], [], [], [0], [0, 2, 3], [4]],
  'data-scientist': [[], [], [0, 1], [2], [2, 3], [4]],
  cloud: [[], [], [0], [0, 1, 2], [3], [4]],
  devops: [[], [], [1], [0, 2], [1], [3, 4]],
  systems: [[], [], [0], [0, 1], [0], [3, 4]],
  network: [[], [0], [0, 1], [0, 1, 2], [0, 1], [3, 4]],
  database: [[], [0], [0, 1], [1], [0, 1], [4]],
  qa: [[], [0], [], [0, 2], [0, 2], [3, 4]],
};
export function buildPreparation(career) {
  const ids = [
    'milestone-one',
    'milestone-two',
    'milestone-three',
    'milestone-four',
    'milestone-five',
    'milestone-six',
    'milestone-seven',
    'apply',
  ];
  const rows = [...CURRICULA[career.id]];
  const project = PROJECTS[career.id];
  rows.push([
    project[0],
    project[1],
    project[2].join('|'),
    CURRICULA[career.id][4][3],
    'A runnable or reproducible artifact, README, checks, and a note explaining your contribution and limitations.',
  ]);
  rows.push([
    'Prepare and explain your work',
    'Make your preparation understandable to a reviewer.',
    'Write a relevant resume using concrete examples.|Prepare a two-minute project explanation.|Practice a technical question and a teamwork example.',
    CURRICULA[career.id][0][3],
    'A resume draft, project presentation, and notes from feedback.',
  ]);
  rows.push([
    'Apply and improve',
    'Use appropriate opportunities and actual feedback to guide further preparation.',
    'Compare three internship or entry-level postings for eligibility and required versus preferred qualifications.|Apply when you meet the posting’s actual criteria; you do not have to finish this curriculum.|Track the application and revise one next action based on feedback.',
    CURRICULA[career.id][0][3],
    'A self-reported application record and one feedback-driven improvement.',
  ]);
  return rows.map(([title, why, tasks, resource, evidence], index) => ({
    id: ids[index],
    title,
    what: `${title}: ${tasks.split('|')[0]}`,
    why,
    tasks: tasks.split('|'),
    evidence,
    when:
      index < 4
        ? 'Foundation: work here when this knowledge is new or needs practice.'
        : index === 4
          ? 'After a small foundation exercise; choose tools for your target role.'
          : index === 5
            ? 'After you can demonstrate the relevant foundations.'
            : 'Alongside learning and projects; application timing follows each posting.',
    prerequisites: (PREREQUISITES[career.id][index] ?? []).map((position) => ids[position]),
    prerequisiteNote: (PREREQUISITES[career.id][index] ?? []).length
      ? 'Practice ' +
        PREREQUISITES[career.id][index]
          .map((position) => rows[position][0].toLowerCase())
          .join(' and ') +
        ' first, or bring equivalent prior work.'
      : 'No earlier milestone is required. Use your current experience.',
    next: rows[index + 1]?.[0] ?? 'Review feedback and choose the next useful action.',
    resources: [RESOURCES[resource]],
    reviewedOn: career.reviewedOn,
    category: index === 5 ? 'Project' : index >= 6 ? 'Applications' : 'Skills',
    hours: 1,
    scope:
      'Pathora-authored practice guidance. Evidence is self-reported and is not proof of mastery.',
  }));
}
