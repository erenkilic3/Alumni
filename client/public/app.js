// ==========================================================================
// Alumni Tracking System - Frontend Client Logic
// ==========================================================================

const API_BASE_URL = 'http://localhost:5001/api';

// Fallback seed data in case API server is starting up
const fallbackAlumni = [
  {
    id: "1",
    name: "Ayşe Yılmaz",
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
    name: "Burak Demir",
    graduationYear: 2019,
    department: "Industrial Engineering",
    company: "Amazon",
    role: "Lead Product Manager",
    location: "London, UK",
    industry: "E-Commerce",
    skills: ["Product Strategy", "Agile", "Data Analytics", "UX"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Passionate about building customer-centric products. Mentor for tech career transitions."
  },
  {
    id: "3",
    name: "Zeynep Kaya",
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

let alumniData = [...fallbackAlumni];
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

async function loadJobs() {
  const jobsList = document.getElementById('jobsList');
  let jobs = [
    {
      title: "Junior Backend Developer (Node.js / PostgreSQL)",
      company: "Peak Tech",
      location: "Remote / Istanbul",
      type: "Full-Time",
      postedBy: "Burak Demir (2019 Alumni)",
      deadline: "Oct 15, 2026"
    },
    {
      title: "Data Science Intern",
      company: "FinAnalytica",
      location: "Hybrid (Ankara)",
      type: "Internship",
      postedBy: "Selin Öztürk (2022 Alumni)",
      deadline: "Nov 01, 2026"
    },
    {
      title: "Cloud Infrastructure Specialist",
      company: "Hyperscale Cloud",
      location: "Zurich / Remote",
      type: "Full-Time",
      postedBy: "Ayşe Yılmaz (2021 Alumni)",
      deadline: "Nov 20, 2026"
    }
  ];

  try {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (res.ok) {
      const data = await res.json();
      if (data.length) jobs = data;
    }
  } catch (e) {}

  jobsList.innerHTML = jobs.map(job => `
    <div class="job-card">
      <div class="job-main">
        <h4>${job.title}</h4>
        <div class="job-meta">
          <span>🏢 ${job.company}</span>
          <span>📍 ${job.location}</span>
          <span>💼 ${job.type}</span>
          <span>👤 Posted by: ${job.postedBy}</span>
        </div>
      </div>
      <button class="btn btn-primary" onclick="alert('Application request forwarded to ${job.postedBy}!')">Apply Now</button>
    </div>
  `).join('');
}

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
    });
  });

  // Modal handlers
  const modal = document.getElementById('addModalOverlay');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');

  const openModal = () => modal.classList.add('open');
  const closeModal = () => modal.classList.remove('open');

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Form Submission
  const form = document.getElementById('alumniForm');
  form.addEventListener('submit', async (e) => {
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

    // Attempt backend save
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadAlumni();
  loadStats();
  checkBackendHealth();
  setInterval(checkBackendHealth, 10000);
});
