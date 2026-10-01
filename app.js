const dialog=document.querySelector('#builder'),form=document.querySelector('#profile'),formView=document.querySelector('#form-view'),resultView=document.querySelector('#result-view');
const paths={
'Software Engineer':[['Find your direction','Choose an area to explore: web, mobile, or backend development. Write down one problem you want to solve.'],['Build your foundations','Practice a programming language, Git, data structures, and debugging through small exercises.'],['Make something real','Build and document a useful application. Publish the code and explain your design decisions.'],['Get hands-on experience','Contribute to a community project or look for internships that match your skills. Practice collaborating and reviewing code.'],['Take the next leap','Prepare a focused résumé, practice technical interviews, and track applications for entry-level engineering roles.']],
'Data Analyst':[['Find your direction','Explore the industries and questions you want to investigate with data.'],['Build your foundations','Practice spreadsheets, SQL, statistics, and clear data visualization.'],['Make something real','Analyze a public dataset. Build a dashboard and explain three actionable findings.'],['Get hands-on experience','Work on an analysis project for a student organization or explore analytics internships.'],['Take the next leap','Create a concise portfolio, practice SQL interview questions, and apply for junior analyst roles.']],
'UX Designer':[['Find your direction','Explore digital products you care about and identify an experience you could improve.'],['Build your foundations','Learn user research, interaction design, accessibility, and prototyping.'],['Make something real','Research a user problem and create a prototype. Document your decisions in a case study.'],['Get hands-on experience','Test your work with users and collaborate on a community project or design internship.'],['Take the next leap','Refine your portfolio, practice presenting your process, and apply for junior design roles.']]};
function openBuilder(career){if(career)document.querySelector('#career-select').value=career;formView.hidden=false;resultView.hidden=true;dialog.showModal();}
document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>openBuilder()));
document.querySelectorAll('[data-career]').forEach(b=>b.addEventListener('click',()=>{openBuilder(b.dataset.career);renderRoadmap({career:b.dataset.career});}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function renderRoadmap(profile){formView.hidden=true;resultView.hidden=false;document.querySelector('#result-title').textContent='Your path to '+profile.career;document.querySelector('#result-description').textContent=profile.major?`${profile.education} · ${profile.major}. ${profile.skills.trim()?'Build on your existing skills: '+profile.skills+'.':'Start with the foundations and grow from there.'}`:'Explore these five milestones, then edit your profile to make this path yours.';const container=document.querySelector('#result-steps');container.replaceChildren();paths[profile.career].forEach(([title,description],index)=>{const label=document.createElement('label');label.className='milestone';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.setAttribute('aria-label','Mark '+title+' complete');const content=document.createElement('div'),heading=document.createElement('b'),p=document.createElement('p');heading.textContent=(index+1)+'. '+title;p.textContent=description;content.append(heading,p);label.append(checkbox,content);container.append(label);checkbox.addEventListener('change',updateProgress);});updateProgress();}
function updateProgress(){const n=document.querySelectorAll('#result-steps input:checked').length;document.querySelector('#result-count').textContent=n+' of 5 milestones complete';document.querySelector('#result-bar').value=n;}
form.addEventListener('submit',e=>{e.preventDefault();renderRoadmap(Object.fromEntries(new FormData(form)));});document.querySelector('#edit-profile').addEventListener('click',()=>{formView.hidden=false;resultView.hidden=true;});

// The example dashboard keeps its interactions separate from the profile builder.
const workspaceDialog = document.querySelector('#workspace-dialog');
const workspaceTitle = document.querySelector('#workspace-title');
const workspaceBody = document.querySelector('#workspace-body');
const dashboardState = { projectTasks: [false, false, false], interviewPracticed: false, applications: [] };
const projectTasks = ['Finish the responsive React application', 'Publish the project and write a clear README', 'Add the live project and code to your portfolio'];
function showDashboardSection(section) {
  workspaceTitle.textContent = section;
  workspaceBody.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'workspace-intro';
  workspaceBody.append(intro);
  if (section === 'Career Roadmap') {
    intro.textContent = 'Your example path to Software Engineer. Focus on one milestone at a time.';
    const projectDone = dashboardState.projectTasks.every(Boolean);
    const stages = [
      ['Find your direction', 'Software Engineer is your example career goal.', true],
      ['Build your foundations', 'Programming basics and Git foundations are complete in this example.', true],
      ['Complete your React portfolio project', 'Build, publish, and document an application you can show.', projectDone],
      ['Prepare for technical interviews', 'Practice explaining your project and work through a coding exercise.', dashboardState.interviewPracticed],
      ['Apply for your next opportunity', 'Submit your first application and record it in your tracker.', dashboardState.applications.length > 0]
    ];
    stages.forEach(([title, description, done], i) => {
      const row = document.createElement('div'); row.className = 'detail-row' + (done ? ' complete' : '');
      const number = document.createElement('span'); number.className = 'detail-number'; number.textContent = done ? '✓' : String(i + 1);
      const content = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = title;
      const text = document.createElement('p'); text.textContent = description; content.append(heading, text);
      if (!done && i >= 2) { const button = document.createElement('button'); button.className = 'button secondary'; button.textContent = i === 2 ? 'Continue project' : i === 3 ? 'Mark practice complete' : 'Track an application'; button.addEventListener('click', () => { if (i === 3) { dashboardState.interviewPracticed = true; updateDashboard(); showDashboardSection('Career Roadmap'); } else showDashboardSection(i === 2 ? 'Projects' : 'Applications'); }); content.append(button); }
      row.append(number, content); workspaceBody.append(row);
    });
  } else if (section === 'Projects') {
    intro.textContent = 'React portfolio project — your current focus. Check off each deliverable when it is ready.';
    projectTasks.forEach((text, i) => { const label = document.createElement('label'); label.className = 'project-check'; const input = document.createElement('input'); input.type = 'checkbox'; input.checked = dashboardState.projectTasks[i]; const span = document.createElement('span'); span.textContent = text; input.addEventListener('change', () => { dashboardState.projectTasks[i] = input.checked; updateDashboard(); }); label.append(input, span); workspaceBody.append(label); });
  } else if (section === 'Skills') {
    intro.textContent = 'A practical skill plan for the example Software Engineer goal.';
    [['JavaScript & Git', 'Foundation focus: functions, arrays, version control, and debugging.'], ['React', 'Current focus: components, state, forms, and routing. Apply these in your portfolio project.'], ['Testing & accessibility', 'Next focus: test important user flows and make your application usable with a keyboard.']].forEach(([title, text]) => addDetail(title, text));
  } else if (section === 'Applications') {
    intro.textContent = 'Record applications you have submitted. This tracker keeps entries while the page is open.';
    if (!dashboardState.applications.length) { const empty = document.createElement('p'); empty.className = 'detail-empty'; empty.textContent = 'No applications yet. When you apply for a role, add it here to keep your next follow-up in sight.'; workspaceBody.append(empty); }
    dashboardState.applications.forEach(application => { const record = document.createElement('div'); record.className = 'application-record'; const title = document.createElement('b'); title.textContent = application.role; const text = document.createElement('p'); text.textContent = application.company + ' · Applied'; record.append(title, text); workspaceBody.append(record); });
    const applicationForm = document.createElement('form'); applicationForm.className = 'application-form';
    for (const [name, title, placeholder] of [['company', 'Company', 'Company name'], ['role', 'Role', 'Role you applied for']]) { const label = document.createElement('label'); label.textContent = title; const input = document.createElement('input'); input.name = name; input.required = true; input.placeholder = placeholder; input.maxLength = 120; label.append(input); applicationForm.append(label); }
    const submit = document.createElement('button'); submit.className = 'button'; submit.type = 'submit'; submit.textContent = 'Add application'; applicationForm.append(submit);
    applicationForm.addEventListener('submit', event => { event.preventDefault(); const values = Object.fromEntries(new FormData(applicationForm)); if (!values.company.trim() || !values.role.trim()) return; dashboardState.applications.push({company: values.company.trim(), role: values.role.trim()}); updateDashboard(); showDashboardSection('Applications'); }); workspaceBody.append(applicationForm);
  } else if (section === 'Goals') {
    intro.textContent = 'A clear destination helps you choose your next step.';
    addDetail('Software Engineer', 'Build the skills, portfolio, and interview practice needed to start applying for entry-level software engineering roles.');
    addDetail('Your current priority', 'Finish the React portfolio project before moving to interview preparation.');
    addDetail('Readiness snapshot', 'The displayed 67% readiness and category percentages are illustrative sample values, not a calculated assessment.');
  } else if (section === 'Achievements') {
    intro.textContent = 'Celebrate completed milestones in your example journey.';
    const achievements = [['Direction defined', 'You have a clear example career goal.'], ['Foundations built', 'Your sample journey starts with programming and Git foundations completed.']];
    if (dashboardState.projectTasks.every(Boolean)) achievements.push(['Portfolio project completed', 'All three React project deliverables are checked off.']);
    if (dashboardState.interviewPracticed) achievements.push(['Interview practice completed', 'You marked your interview preparation milestone complete.']);
    if (dashboardState.applications.length) achievements.push(['First application tracked', 'Your next opportunity is in motion.']);
    achievements.forEach(([title, text]) => { const row = document.createElement('div'); row.className = 'achievement-item'; const icon = document.createElement('span'); icon.textContent = '✧'; const content = document.createElement('div'); const heading = document.createElement('b'); heading.textContent = title; const paragraph = document.createElement('p'); paragraph.textContent = text; content.append(heading, paragraph); row.append(icon, content); workspaceBody.append(row); });
  }
  if (!workspaceDialog.open) workspaceDialog.showModal();
}
function addDetail(title, text) { const row = document.createElement('div'); row.className = 'detail-row'; const content = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = title; const paragraph = document.createElement('p'); paragraph.textContent = text; content.append(heading, paragraph); row.append(content); workspaceBody.append(row); }
function updateDashboard() {
  const projectDone = dashboardState.projectTasks.every(Boolean);
  const count = 2 + Number(projectDone) + Number(dashboardState.interviewPracticed) + Number(dashboardState.applications.length > 0);
  document.querySelector('#dash-roadmap-count').textContent = count + ' of 5 milestones complete';
  document.querySelector('#dash-achievements-count').textContent = count + ' milestones reached';
  document.querySelector('#dash-project-status').textContent = 'React portfolio · ' + (projectDone ? 'Complete' : 'In progress');
  document.querySelector('#dash-application-count').textContent = dashboardState.applications.length ? dashboardState.applications.length + ' application' + (dashboardState.applications.length === 1 ? '' : 's') + ' tracked' : 'No applications yet';
  const heading = document.querySelector('#next-heading'), description = document.querySelector('#next-description');
  if (!projectDone) { heading.textContent = 'Complete your React portfolio project'; description.textContent = 'Turn what you’ve learned into something you can show. Finish your project, publish it, and add it to your portfolio.'; }
  else if (!dashboardState.interviewPracticed) { heading.textContent = 'Prepare for your technical interviews'; description.textContent = 'Practice walking through your project decisions, then work through a coding exercise.'; }
  else if (!dashboardState.applications.length) { heading.textContent = 'Apply for your next opportunity'; description.textContent = 'Find a role that matches your skills, submit your application, and add it to your tracker.'; }
  else { heading.textContent = 'Keep your applications moving'; description.textContent = 'Review your applications and plan your next follow-up. Keep practicing as you explore new opportunities.'; }
  document.querySelector('#next-milestone').textContent = count === 5 ? '5 of 5 milestones complete' : 'Milestone ' + (!projectDone ? 3 : !dashboardState.interviewPracticed ? 4 : 5) + ' of 5';
  document.querySelector('.next-priority').textContent = !projectDone ? 'PROJECTS' : !dashboardState.interviewPracticed ? 'INTERVIEW PREP' : 'APPLICATIONS';
}
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => showDashboardSection(button.dataset.section)));
document.querySelector('#continue-roadmap').addEventListener('click', () => showDashboardSection('Career Roadmap'));
document.querySelector('#close-workspace').addEventListener('click', () => workspaceDialog.close());
workspaceDialog.addEventListener('click', event => { if (event.target !== workspaceDialog) return; const rect = workspaceDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) workspaceDialog.close(); });
function switchMainView(dashboard) { document.querySelector('#dashboard-view').hidden = !dashboard; document.querySelector('#landing-view').hidden = dashboard; window.scrollTo(0, 0); }
document.querySelector('#show-landing').addEventListener('click', () => switchMainView(false));
document.querySelector('#show-dashboard').addEventListener('click', () => switchMainView(true));
