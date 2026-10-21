// ==========================================================================
// Alumni Tracking System - Frontend Client Logic
// ==========================================================================

const API_BASE_URL = 'http://localhost:5001/api';

// Fallback seed data in case API server is starting up
const fallbackAlumni = [
  {
    id: "1",
    name: "Hakan Tosun",
    graduationYear: 2021,
    department: "Computer Engineering",
    company: "Google",
    role: "Senior Software Engineer",
    location: "Zurich, Switzerland",
    industry: "Technology",
    skills: ["Go", "Kubernetes", "Distributed Systems", "Cloud"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Graduated with honors in 2021. Open for student mentorship in cloud infrastructure."
  },
  {
    id: "2",
    name: "Mehmet Raşid FamousHand",
    graduationYear: 2019,
    department: "Industrial Engineering",
    company: "Amazon",
    role: "Lead Product Manager",
    location: "Çorum",
    industry: "E-Commerce",
    skills: ["Product Strategy", "Agile", "Data Analytics", "UX"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Passionate about building customer-centric products. Mentor for tech career transitions."
  },
  {
    id: "3",
    name: "Erenk3",
    graduationYear: 2023,
    department: "Software Engineering",
    company: "Spotify",
    role: "Full Stack Engineer",
    location: "Stockholm, Sweden",
    industry: "Streaming & Media",
    skills: ["TypeScript", "Node.js", "React", "PostgreSQL"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    bio: "Building audio discovery features. Alumni representative for Nordic region."
  },
  {
    id: "4",
    name: "Emre Çelik",
    graduationYear: 2018,
    department: "Electrical & Electronics Engineering",
    company: "Tesla",
    role: "Autopilot Firmware Engineer",
    location: "Berlin, Germany",
    industry: "Automotive & AI",
    skills: ["C++", "Embedded Systems", "Robotics", "Computer Vision"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Working on automotive autonomy. Happy to connect with junior engineers."
  },
  {
    id: "5",
    name: "Selin Öztürk",
    graduationYear: 2022,
    department: "Business Administration",
    company: "McKinsey & Company",
    role: "Associate Consultant",
    location: "Istanbul, Turkey",
    industry: "Management Consulting",
    skills: ["Financial Modeling", "Corporate Strategy", "Market Research"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    bio: "Consulting for energy and sustainability sectors."
  }
];

const fallbackJobs = [
  {
    id: "job-1",
    title: "Junior Backend Developer (Node.js / PostgreSQL)",
    company: "Peak Tech",
    location: "Remote / Istanbul",
    type: "Full-Time",
    description: "We are seeking a junior backend engineer to join our high-growth platform team working on scalable REST APIs and PostgreSQL databases.",
    requirements: ["Node.js", "PostgreSQL", "Express", "Docker", "Git"],
    salaryRange: "$40,000 - $55,000",
    contactEmail: "careers@peaktech.example.com",
    postedBy: "Burak Demir",
    status: "ACTIVE",
    deadline: "2026-10-15"
  },
  {
    id: "job-2",
    title: "Data Science Intern",
    company: "FinAnalytica",
    location: "Hybrid (Ankara)",
    type: "Internship",
    description: "Join our financial analytics lab to assist senior data scientists in predictive modeling, statistical reporting, and dashboard creation.",
    requirements: ["Python", "Pandas", "SQL", "Data Visualization", "Machine Learning Basics"],
    salaryRange: "Paid Internship",
    contactEmail: "interns@finanalytica.example.com",
    postedBy: "Selin Öztürk",
    status: "ACTIVE",
    deadline: "2026-11-01"
  }
];

const fallbackApplications = [
  {
    id: "app-1",
    jobId: "job-1",
    userId: "3",
    applicantName: "Burak Demir",
    applicantEmail: "burak.demir@peak.com",
    resumeUrl: "https://storage.alumni.edu/resumes/burak_demir_cv.pdf",
    coverLetter: "I have 2 years of experience with Node.js and PostgreSQL. Excited to apply for the Junior Backend role.",
    status: "REVIEWING",
    createdAt: "2026-10-10T12:00:00.000Z"
  },
  {
    id: "app-2",
    jobId: "job-2",
    userId: "5",
    applicantName: "Fatma Kaya",
    applicantEmail: "fatma@alumni.edu",
    resumeUrl: "https://storage.alumni.edu/resumes/fatma_kaya_portfolio.pdf",
    coverLetter: "Eager to contribute to predictive data models and statistical research dashboards.",
    status: "PENDING",
    createdAt: "2026-10-12T14:30:00.000Z"
  }
];

let alumniData = [...fallbackAlumni];
let jobsData = [...fallbackJobs];
let applicationsData = [...fallbackApplications];
let activeTab = 'directory';

// ==========================================================================
// Theme Management (Dark / Light Mode)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('alumni_theme') || 'dark';
  applyTheme(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('alumni_theme', theme);
  const themeLabel = document.getElementById('themeLabel');
  const footerIndicator = document.querySelector('.theme-indicator');
  
  if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  if (footerIndicator) footerIndicator.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
}

// ==========================================================================
// Health & Backend API Sync
// ==========================================================================
async function checkBackendHealth() {
  const backendPill = document.getElementById('backendStatusPill');
  const dbPill = document.getElementById('dbStatusPill');

  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      backendPill.innerHTML = `
        <span class="status-dot active"></span>
        <span class="status-text">Node.js API: Connected</span>
      `;
      if (data.postgresConnected) {
        dbPill.innerHTML = `
          <span class="status-dot active"></span>
          <span class="status-text">PostgreSQL: Connected</span>
        `;
      } else {
        dbPill.innerHTML = `
          <span class="status-dot"></span>
          <span class="status-text">PostgreSQL: Container Ready</span>
        `;
      }
      return true;
    }
  } catch (err) {
    backendPill.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-text">Node.js API: Local Offline</span>
    `;
  }
  return false;
}

// ==========================================================================
// Fetch Alumni Data
// ==========================================================================
async function loadAlumni() {
  try {
    const res = await fetch(`${API_BASE_URL}/alumni`);
    if (res.ok) {
      const data = await res.json();
      if (data.alumni && data.alumni.length > 0) {
        alumniData = data.alumni;
      }
    }
  } catch (e) {
    console.warn('Backend API not responding yet, showing interactive local state.');
  }
  renderAlumni();
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('metricTotalAlumni').textContent = stats.totalAlumni.toLocaleString();
      document.getElementById('metricEmploymentRate').textContent = stats.employmentRate;
      document.getElementById('metricMentors').textContent = stats.activeMentors;
      document.getElementById('metricPartners').textContent = stats.partnerCompanies;
    }
  } catch (e) {}
}

// ==========================================================================
// Job Board & Applications Management
// ==========================================================================
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        jobsData = data.jobs;
      } else if (Array.isArray(data)) {
        jobsData = data;
      }
    }
  } catch (e) {
    console.warn('Backend API not responding for jobs, using local store.');
  }
  updateJobDropdowns();
  renderJobs();
}

function updateJobDropdowns() {
  const appJobFilter = document.getElementById('appJobSelectFilter');
  const appFormJobSelect = document.getElementById('appFormJobSelect');

  if (appJobFilter) {
    const currentVal = appJobFilter.value;
    appJobFilter.innerHTML = '<option value="All">All Jobs</option>' +
      jobsData.map(j => `<option value="${j.id}">${j.title} (${j.company})</option>`).join('');
    if (currentVal) appJobFilter.value = currentVal;
  }

  if (appFormJobSelect) {
    appFormJobSelect.innerHTML = jobsData.map(j =>
      `<option value="${j.id}">${j.title} — ${j.company} [${j.type}]</option>`
    ).join('');
  }
}

function getFilteredJobs() {
  const search = (document.getElementById('jobSearchInput')?.value || '').trim().toLowerCase();
  const type = document.getElementById('jobTypeFilter')?.value || 'All';
  const status = document.getElementById('jobStatusFilter')?.value || 'All';

  return jobsData.filter(j => {
    const matchesSearch = !search ||
      j.title.toLowerCase().includes(search) ||
      j.company.toLowerCase().includes(search) ||
      (j.description && j.description.toLowerCase().includes(search)) ||
      (Array.isArray(j.requirements) && j.requirements.some(r => r.toLowerCase().includes(search)));

    const matchesType = type === 'All' || j.type.toLowerCase() === type.toLowerCase();
    const matchesStatus = status === 'All' || j.status.toUpperCase() === status.toUpperCase();

    return matchesSearch && matchesType && matchesStatus;
  });
}

function renderJobs() {
  const jobsList = document.getElementById('jobsList');
  const counter = document.getElementById('jobsCount');
  if (!jobsList) return;

  const filtered = getFilteredJobs();
  if (counter) counter.textContent = `Showing ${filtered.length} of ${jobsData.length} career opportunities`;

  if (filtered.length === 0) {
    jobsList.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-color);">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">💼</div>
        <h3 style="font-family: var(--font-heading); margin-bottom: 4px;">No job postings found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your keyword search or employment type filter.</p>
      </div>
    `;
    return;
  }

  jobsList.innerHTML = filtered.map(job => {
    const reqs = Array.isArray(job.requirements) ? job.requirements : [];
    const statusClass = (job.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'status-active' : 'status-closed';

    return `
      <div class="job-card" data-job-id="${job.id}">
        <div class="job-card-header">
          <div class="job-title-group">
            <h3>${job.title}</h3>
            <div class="job-company-badge">
              <span>🏢</span> ${job.company}
            </div>
          </div>
          <div class="job-badges">
            <span class="type-pill">${job.type || 'Full-Time'}</span>
            <span class="status-pill-badge ${statusClass}">${job.status || 'ACTIVE'}</span>
          </div>
        </div>

        <div class="job-meta-grid">
          <span class="job-meta-item">📍 ${job.location || 'Remote'}</span>
          ${job.salaryRange ? `<span class="job-meta-item">💰 ${job.salaryRange}</span>` : ''}
          ${job.deadline ? `<span class="job-meta-item">📅 Deadline: ${job.deadline}</span>` : ''}
          ${job.contactEmail ? `<span class="job-meta-item">✉️ ${job.contactEmail}</span>` : ''}
        </div>

        <p class="job-description">${job.description || 'Join our engineering network team.'}</p>

        ${reqs.length ? `
          <div class="job-requirements-list">
            ${reqs.map(r => `<span class="req-tag">${r}</span>`).join('')}
          </div>
        ` : ''}

        <div class="job-card-footer">
          <div class="job-poster-info">
            👤 Posted by: <strong>${job.postedBy || 'Alumni Career Network'}</strong>
          </div>
          <div class="job-card-actions">
            <button class="btn btn-outline btn-sm" onclick="window.openJobAppsModal('${job.id}')">
              <span>👥 View Applicants</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.openApplyModal('${job.id}')">
              <span>✍️ Apply Now</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// Applications Hub Engine
// --------------------------------------------------------------------------
async function loadApplications() {
  try {
    const res = await fetch(`${API_BASE_URL}/applications`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.applications)) {
        applicationsData = data.applications;
      } else if (Array.isArray(data)) {
        applicationsData = data;
      }
    }
  } catch (e) {
    console.warn('Backend API not responding for applications, using local store.');
  }
  renderApplications();
}

function getFilteredApplications() {
  const search = (document.getElementById('appSearchInput')?.value || '').trim().toLowerCase();
  const status = document.getElementById('appStatusFilter')?.value || 'All';
  const jobId = document.getElementById('appJobSelectFilter')?.value || 'All';

  return applicationsData.filter(app => {
    const matchesSearch = !search ||
      app.applicantName.toLowerCase().includes(search) ||
      app.applicantEmail.toLowerCase().includes(search) ||
      (app.coverLetter && app.coverLetter.toLowerCase().includes(search));

    const matchesStatus = status === 'All' || app.status.toUpperCase() === status.toUpperCase();
    const matchesJob = jobId === 'All' || String(app.jobId) === String(jobId);

    return matchesSearch && matchesStatus && matchesJob;
  });
}

function renderApplications() {
  const list = document.getElementById('applicationsList');
  const counter = document.getElementById('applicationsCount');
  if (!list) return;

  const filtered = getFilteredApplications();
  if (counter) counter.textContent = `Showing ${filtered.length} of ${applicationsData.length} candidate applications`;

  if (filtered.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-color);">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">📄</div>
        <h3 style="font-family: var(--font-heading); margin-bottom: 4px;">No applications found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">No candidate submissions match your current filters.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(app => {
    const job = jobsData.find(j => String(j.id) === String(app.jobId));
    const jobTitle = job ? `${job.title} (${job.company})` : `Job #${app.jobId}`;
    const statusKey = (app.status || 'PENDING').toLowerCase();

    return `
      <div class="application-card" data-app-id="${app.id}">
        <div class="app-card-header">
          <div class="applicant-info">
            <h4>${app.applicantName}</h4>
            <div class="applicant-email">
              <span>✉️</span> ${app.applicantEmail} • <span style="color: var(--text-muted);">Candidate #${app.userId}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="app-target-job">💼 ${jobTitle}</span>
            <span class="app-status-badge status-badge-${statusKey}">
              ● ${app.status}
            </span>
          </div>
        </div>

        ${app.coverLetter ? `
          <div class="app-cover-letter">
            "${app.coverLetter}"
          </div>
        ` : ''}

        <div class="app-card-footer">
          <div class="app-links">
            ${app.resumeUrl ? `
              <a href="${app.resumeUrl}" target="_blank" rel="noopener noreferrer" class="resume-btn-link">
                <span>📄 View Candidate Resume</span> ↗
              </a>
            ` : '<span style="color: var(--text-muted);">No resume link attached</span>'}
            <span style="color: var(--border-color);">|</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Submitted: ${new Date(app.createdAt).toLocaleDateString()}</span>
          </div>

          <div class="app-action-buttons">
            <span style="font-size: 0.78rem; color: var(--text-muted); margin-right: 4px;">Set Status:</span>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'REVIEWING')" title="Mark as Reviewing">Reviewing</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'SHORTLISTED')" title="Shortlist Candidate">Shortlist</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'ACCEPTED')" title="Accept Candidate" style="color: var(--success);">Accept</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'REJECTED')" title="Reject Candidate" style="color: #ef4444;">Reject</button>
            <button class="btn-tag btn-tag-danger" onclick="window.deleteApp('${app.id}')" title="Delete Application">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// Window Application Actions
// --------------------------------------------------------------------------
window.openApplyModal = function(jobId = null) {
  const modal = document.getElementById('applyModalOverlay');
  const targetInput = document.getElementById('appTargetJobId');
  const jobSelectGroup = document.getElementById('appJobSelectGroup');
  const jobSelect = document.getElementById('appFormJobSelect');
  const title = document.getElementById('applyModalTitle');
  const subtitle = document.getElementById('applyModalSubtitle');

  updateJobDropdowns();

  if (jobId) {
    const job = jobsData.find(j => String(j.id) === String(jobId));
    targetInput.value = jobId;
    if (jobSelect) jobSelect.value = jobId;
    if (job) {
      title.textContent = `Apply for: ${job.title}`;
      subtitle.textContent = `Hiring at ${job.company} • ${job.location || 'Remote'}`;
    }
  } else {
    targetInput.value = '';
    title.textContent = 'Submit Job Application';
    subtitle.textContent = 'Choose an active opening and submit your qualifications';
  }

  modal.classList.add('open');
};

window.openJobAppsModal = async function(jobId) {
  const modal = document.getElementById('viewJobAppsModalOverlay');
  const title = document.getElementById('jobAppsModalJobTitle');
  const sub = document.getElementById('jobAppsModalJobSub');
  const container = document.getElementById('jobSpecificAppsList');

  const job = jobsData.find(j => String(j.id) === String(jobId));
  const jobName = job ? `${job.title} (${job.company})` : `Job #${jobId}`;
  title.textContent = `Applicants for: ${jobName}`;

  container.innerHTML = '<div style="text-align: center; padding: 24px;">Loading candidate applications...</div>';
  modal.classList.add('open');

  try {
    let jobApps = [];
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`);
    if (res.ok) {
      const data = await res.json();
      jobApps = data.applications || [];
    } else {
      jobApps = applicationsData.filter(a => String(a.jobId) === String(jobId));
    }

    sub.textContent = `${jobApps.length} candidate application(s) received for this role`;

    if (jobApps.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 16px;">
          <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
          <h4>No applications received yet</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Be the first candidate to apply for this career opening!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = jobApps.map(app => `
      <div class="candidate-item-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
          <div>
            <h4 style="font-size: 1.05rem; font-weight: 700;">${app.applicantName}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted);">✉️ ${app.applicantEmail} • User #${app.userId}</div>
          </div>
          <span class="app-status-badge status-badge-${(app.status || 'PENDING').toLowerCase()}">
            ● ${app.status}
          </span>
        </div>

        ${app.coverLetter ? `
          <div style="font-size: 0.88rem; color: var(--text-secondary); background: var(--bg-card); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--accent-primary);">
            "${app.coverLetter}"
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px;">
          ${app.resumeUrl ? `<a href="${app.resumeUrl}" target="_blank" class="resume-btn-link" style="font-size: 0.84rem;">📄 View Resume ↗</a>` : '<span style="font-size: 0.8rem; color: var(--text-muted);">No CV link</span>'}
          <div class="app-action-buttons">
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'REVIEWING')">Review</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'SHORTLISTED')">Shortlist</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'ACCEPTED')" style="color: var(--success);">Accept</button>
            <button class="btn-tag" onclick="window.updateAppStatus('${app.id}', 'REJECTED')" style="color: #ef4444;">Reject</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: #ef4444; padding: 20px;">Failed to load job applications: ${err.message}</div>`;
  }
};

window.updateAppStatus = async function(appId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const data = await res.json();
      const updated = data.application;
      const idx = applicationsData.findIndex(a => String(a.id) === String(appId));
      if (idx !== -1) applicationsData[idx] = updated;
    } else {
      const idx = applicationsData.findIndex(a => String(a.id) === String(appId));
      if (idx !== -1) applicationsData[idx].status = newStatus;
    }
  } catch (err) {
    const idx = applicationsData.findIndex(a => String(a.id) === String(appId));
    if (idx !== -1) applicationsData[idx].status = newStatus;
  }
  renderApplications();
  alert(`Application status updated to: ${newStatus}`);
};

window.deleteApp = async function(appId) {
  if (!confirm('Are you sure you want to withdraw/delete this application?')) return;
  try {
    await fetch(`${API_BASE_URL}/applications/${appId}`, { method: 'DELETE' });
  } catch (e) {}
  applicationsData = applicationsData.filter(a => String(a.id) !== String(appId));
  renderApplications();
};

// ==========================================================================
// Filtering & Rendering
// ==========================================================================
function getFilteredAlumni() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const dept = document.getElementById('deptFilter').value;
  const year = document.getElementById('yearFilter').value;
  const mentorOnly = document.getElementById('mentorFilter').checked;

  return alumniData.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search) ||
      item.company.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      item.department.toLowerCase().includes(search) ||
      (item.skills && item.skills.some(s => s.toLowerCase().includes(search)));

    const matchesDept = dept === 'All' || item.department === dept;
    const matchesYear = year === 'All' || item.graduationYear.toString() === year;
    const matchesMentor = !mentorOnly || item.isMentor;

    return matchesSearch && matchesDept && matchesYear && matchesMentor;
  });
}

function renderAlumni() {
  const grid = document.getElementById('alumniGrid');
  const counter = document.getElementById('resultsCount');
  const filtered = getFilteredAlumni();

  counter.textContent = `Showing ${filtered.length} of ${alumniData.length} alumni profiles`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-color);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">No alumni found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your search terms or filter criteria.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="alumni-card">
      <div class="card-top">
        <div class="avatar-wrapper">
          <img class="alumni-avatar" src="${item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}" alt="${item.name}">
          ${item.isMentor ? '<span class="mentor-badge-mini" title="Verified Student Mentor">★</span>' : ''}
        </div>
        <div class="card-info">
          <div class="name-row">
            <h3 class="alumni-name">${item.name}</h3>
            <span class="grad-pill">Class of '${item.graduationYear.toString().slice(-2)}</span>
          </div>
          <div class="alumni-role">${item.role}</div>
          <div class="alumni-company">
            <span>🏢</span> ${item.company} • <span style="color: var(--text-muted);">${item.department}</span>
          </div>
        </div>
      </div>

      <p class="alumni-bio">${item.bio || 'Alumni network member.'}</p>

      <div class="skills-list">
        ${(item.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>

      <div class="card-footer">
        <div class="location-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${item.location || 'Remote'}</span>
        </div>
        <button class="btn-connect" onclick="connectWithAlumni('${item.name}')">
          ${item.isMentor ? 'Request Mentorship' : 'Connect'}
        </button>
      </div>
    </div>
  `).join('');
}

window.connectWithAlumni = function(name) {
  alert(`Connection request sent to ${name}! They will receive an email and notification.`);
};

// ==========================================================================
// Event Listeners & UI Binding
// ==========================================================================
function setupEventListeners() {
  // Search input & clear
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    renderAlumni();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderAlumni();
  });

  // Dropdowns & Checkboxes
  document.getElementById('deptFilter').addEventListener('change', renderAlumni);
  document.getElementById('yearFilter').addEventListener('change', renderAlumni);
  document.getElementById('mentorFilter').addEventListener('change', renderAlumni);

  // Job Filter Listeners
  const jobSearchInput = document.getElementById('jobSearchInput');
  const clearJobSearchBtn = document.getElementById('clearJobSearchBtn');
  if (jobSearchInput) {
    jobSearchInput.addEventListener('input', () => {
      if (clearJobSearchBtn) clearJobSearchBtn.style.display = jobSearchInput.value.length > 0 ? 'block' : 'none';
      renderJobs();
    });
  }
  if (clearJobSearchBtn) {
    clearJobSearchBtn.addEventListener('click', () => {
      if (jobSearchInput) jobSearchInput.value = '';
      clearJobSearchBtn.style.display = 'none';
      renderJobs();
    });
  }
  document.getElementById('jobTypeFilter')?.addEventListener('change', renderJobs);
  document.getElementById('jobStatusFilter')?.addEventListener('change', renderJobs);

  // Application Filter Listeners
  const appSearchInput = document.getElementById('appSearchInput');
  const clearAppSearchBtn = document.getElementById('clearAppSearchBtn');
  if (appSearchInput) {
    appSearchInput.addEventListener('input', () => {
      if (clearAppSearchBtn) clearAppSearchBtn.style.display = appSearchInput.value.length > 0 ? 'block' : 'none';
      renderApplications();
    });
  }
  if (clearAppSearchBtn) {
    clearAppSearchBtn.addEventListener('click', () => {
      if (appSearchInput) appSearchInput.value = '';
      clearAppSearchBtn.style.display = 'none';
      renderApplications();
    });
  }
  document.getElementById('appStatusFilter')?.addEventListener('change', renderApplications);
  document.getElementById('appJobSelectFilter')?.addEventListener('change', renderApplications);

  // Tabs switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      if (btn.dataset.tab === 'jobs') loadJobs();
      if (btn.dataset.tab === 'applications') loadApplications();
    });
  });

  // Alumni Modal Handlers
  const modal = document.getElementById('addModalOverlay');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');

  const openModal = () => modal?.classList.add('open');
  const closeModal = () => modal?.classList.remove('open');

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Post Job Modal Handlers
  const jobModal = document.getElementById('addJobModalOverlay');
  const openJobBtn = document.getElementById('openAddJobModalBtn');
  const closeJobBtn = document.getElementById('closeJobModalBtn');
  const cancelJobBtn = document.getElementById('cancelJobModalBtn');

  const openJobModal = () => jobModal?.classList.add('open');
  const closeJobModal = () => jobModal?.classList.remove('open');

  openJobBtn?.addEventListener('click', openJobModal);
  closeJobBtn?.addEventListener('click', closeJobModal);
  cancelJobBtn?.addEventListener('click', closeJobModal);
  jobModal?.addEventListener('click', (e) => {
    if (e.target === jobModal) closeJobModal();
  });

  // Apply Modal Handlers
  const applyModal = document.getElementById('applyModalOverlay');
  const openApplyBtn = document.getElementById('openDirectApplyModalBtn');
  const closeApplyBtn = document.getElementById('closeApplyModalBtn');
  const cancelApplyBtn = document.getElementById('cancelApplyModalBtn');

  openApplyBtn?.addEventListener('click', () => window.openApplyModal());
  closeApplyBtn?.addEventListener('click', () => applyModal?.classList.remove('open'));
  cancelApplyBtn?.addEventListener('click', () => applyModal?.classList.remove('open'));
  applyModal?.addEventListener('click', (e) => {
    if (e.target === applyModal) applyModal?.classList.remove('open');
  });

  // View Applicants Modal Handlers
  const jobAppsModal = document.getElementById('viewJobAppsModalOverlay');
  const closeJobAppsBtn = document.getElementById('closeJobAppsModalBtn');
  const closeJobAppsFooterBtn = document.getElementById('closeJobAppsFooterBtn');

  closeJobAppsBtn?.addEventListener('click', () => jobAppsModal?.classList.remove('open'));
  closeJobAppsFooterBtn?.addEventListener('click', () => jobAppsModal?.classList.remove('open'));
  jobAppsModal?.addEventListener('click', (e) => {
    if (e.target === jobAppsModal) jobAppsModal?.classList.remove('open');
  });

  // Alumni Form Submission
  const form = document.getElementById('alumniForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newProfile = {
      name: document.getElementById('formName').value.trim(),
      graduationYear: parseInt(document.getElementById('formYear').value, 10),
      department: document.getElementById('formDept').value,
      company: document.getElementById('formCompany').value.trim() || 'Independent',
      role: document.getElementById('formRole').value.trim() || 'Alumni Specialist',
      location: document.getElementById('formLocation').value.trim() || 'Global',
      skills: document.getElementById('formSkills').value.split(',').map(s => s.trim()).filter(Boolean),
      bio: document.getElementById('formBio').value.trim(),
      isMentor: document.getElementById('formIsMentor').checked,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };

    try {
      const res = await fetch(`${API_BASE_URL}/alumni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      if (res.ok) {
        const saved = await res.json();
        alumniData.unshift(saved.profile);
      } else {
        alumniData.unshift({ id: Date.now().toString(), ...newProfile });
      }
    } catch (err) {
      alumniData.unshift({ id: Date.now().toString(), ...newProfile });
    }

    form.reset();
    closeModal();
    renderAlumni();
    alert(`🎉 Successfully registered ${newProfile.name} in the Alumni Network!`);
  });

  // Job Form Submission
  const jobForm = document.getElementById('jobForm');
  jobForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newJob = {
      title: document.getElementById('jobFormTitle').value.trim(),
      company: document.getElementById('jobFormCompany').value.trim(),
      location: document.getElementById('jobFormLocation').value.trim() || 'Remote',
      type: document.getElementById('jobFormType').value,
      salaryRange: document.getElementById('jobFormSalary').value.trim(),
      contactEmail: document.getElementById('jobFormEmail').value.trim(),
      postedBy: document.getElementById('jobFormPostedBy').value.trim() || 'Alumni Career Network',
      deadline: document.getElementById('jobFormDeadline').value || null,
      requirements: document.getElementById('jobFormRequirements').value.split(',').map(s => s.trim()).filter(Boolean),
      description: document.getElementById('jobFormDescription').value.trim(),
      status: 'ACTIVE'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        const saved = await res.json();
        jobsData.unshift(saved.job);
      } else {
        jobsData.unshift({ id: `job-${Date.now()}`, ...newJob });
      }
    } catch (err) {
      jobsData.unshift({ id: `job-${Date.now()}`, ...newJob });
    }

    jobForm.reset();
    closeJobModal();
    updateJobDropdowns();
    renderJobs();
    alert(`🎉 Job opportunity "${newJob.title}" published successfully!`);
  });

  // Application Form Submission
  const applicationForm = document.getElementById('applicationForm');
  applicationForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const explicitJobId = document.getElementById('appTargetJobId').value;
    const selectedJobId = document.getElementById('appFormJobSelect').value;
    const finalJobId = explicitJobId || selectedJobId || 'job-1';

    const newApp = {
      jobId: finalJobId,
      applicantName: document.getElementById('appFormName').value.trim(),
      applicantEmail: document.getElementById('appFormEmail').value.trim(),
      userId: document.getElementById('appFormUserId').value,
      resumeUrl: document.getElementById('appFormResume').value.trim(),
      coverLetter: document.getElementById('appFormCoverLetter').value.trim(),
      status: 'PENDING'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
      if (res.ok) {
        const saved = await res.json();
        applicationsData.unshift(saved.application);
      } else {
        applicationsData.unshift({ id: `app-${Date.now()}`, createdAt: new Date().toISOString(), ...newApp });
      }
    } catch (err) {
      applicationsData.unshift({ id: `app-${Date.now()}`, createdAt: new Date().toISOString(), ...newApp });
    }

    applicationForm.reset();
    document.getElementById('appTargetJobId').value = '';
    applyModal?.classList.remove('open');
    renderApplications();
    alert(`🎉 Application successfully submitted for ${newApp.applicantName}!`);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadAlumni();
  loadJobs();
  loadApplications();
  loadStats();
  checkBackendHealth();
  setInterval(checkBackendHealth, 10000);
});
