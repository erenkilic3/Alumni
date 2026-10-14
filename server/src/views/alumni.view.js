/**
 * AlumniView
 *
 * View Layer for Alumni Profile Presentation.
 * Decoupled from Controllers to maintain clean MVC separation.
 * Generates server-side rendered (SSR) HTML views with glassmorphism design:
 * - READ ALL:  renderAlumniList()    (GET /alumni)
 * - READ ONE:  renderAlumniDetails() (GET /alumni/:id)
 * - CREATE:    renderCreateForm()    (GET /alumni/new)
 * - UPDATE:    renderEditForm()      (GET /alumni/:id/edit)
 */

const db = require('../db');

class AlumniView {
  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static getCommonStyles() {
    return `
    :root {
      --bg-primary: #0b1120;
      --bg-surface: #1e293b;
      --bg-card: rgba(30, 41, 59, 0.7);
      --border: rgba(255, 255, 255, 0.1);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --accent-dark: #0284c7;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #34d399;
      --success-bg: rgba(52, 211, 153, 0.15);
      --danger: #f87171;
      --warning: #fbbf24;
      --purple: #c084fc;
      --purple-bg: rgba(192, 132, 252, 0.15);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1120 100%);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      width: 100%;
      max-width: 1200px;
    }
    .container-narrow {
      max-width: 680px;
    }
    
    /* Global Navigation Bar */
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.85rem 1.5rem;
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 2rem;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-main);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .nav-link {
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .nav-link:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-link.active {
      color: var(--accent);
      background: var(--accent-glow);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    /* Database Connection Badge */
    .db-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .db-status-badge.connected {
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .db-status-badge.fallback {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    /* Header & Action Bar */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .page-subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--accent);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #041226;
      box-shadow: 0 4px 15px var(--accent-glow);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(56, 189, 248, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .btn-danger {
      background: rgba(248, 113, 113, 0.15);
      color: var(--danger);
      border: 1px solid rgba(248, 113, 113, 0.3);
    }
    .btn-danger:hover {
      background: var(--danger);
      color: white;
    }
    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 6px;
    }

    /* Alerts */
    .alert {
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .alert-success {
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: #34d399;
    }
    .alert-danger {
      background: rgba(248, 113, 113, 0.12);
      border: 1px solid rgba(248, 113, 113, 0.3);
      color: #f87171;
    }

    /* Cards / Tables */
    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    th {
      padding: 1rem 1.25rem;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.4);
    }
    td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .alumni-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent);
    }
    .alumni-name {
      font-weight: 600;
      color: var(--text-main);
    }
    .alumni-role {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-mentor {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .badge-dept {
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      max-width: 250px;
    }
    .skill-tag {
      background: rgba(255, 255, 255, 0.06);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.72rem;
      color: #cbd5e1;
    }

    /* Forms */
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: var(--accent);
    }
    `;
  }

  static renderTopNav(activeSection = 'alumni') {
    const isConnected = db.isDbConnected;
    return `
    <nav class="top-nav">
      <a href="/alumni" class="nav-brand">
        <span style="font-size: 1.4rem;">🎓</span>
        <span>AlumniSphere <span style="color: var(--accent); font-weight: 400;">CRUD Hub</span></span>
      </a>
      <div class="nav-links">
        <a href="/users" class="nav-link ${activeSection === 'users' ? 'active' : ''}">
          <span>👥</span> Users
        </a>
        <a href="/announcements" class="nav-link ${activeSection === 'announcements' ? 'active' : ''}">
          <span>📢</span> Announcements
        </a>
        <a href="/alumni" class="nav-link ${activeSection === 'alumni' ? 'active' : ''}">
          <span>🎓</span> Alumni Directory
        </a>
        <a href="/api/swagger" class="nav-link" target="_blank">
          <span>⚡</span> Swagger Docs
        </a>
        <a href="http://localhost:3000" class="nav-link" target="_blank">
          <span>🏠</span> Client App (:3000)
        </a>
      </div>
      <div>
        ${isConnected ? `
          <div class="db-status-badge connected" title="PostgreSQL 16 active on port 5432 with volume persistence (pgdata)">
            <span class="status-dot"></span>
            <span>PostgreSQL Connected</span>
          </div>
        ` : `
          <div class="db-status-badge fallback" title="Operating with resilient in-memory data store">
            <span class="status-dot"></span>
            <span>In-Memory Fallback</span>
          </div>
        `}
      </div>
    </nav>
    `;
  }

  /**
   * 1. READ ALL: Alumni List Dashboard
   */
  static renderAlumniList(alumni = [], message = null, error = null) {
    const totalCount = alumni.length;
    const mentorCount = alumni.filter(a => a.isMentor).length;
    const companiesCount = new Set(alumni.map(a => a.company).filter(Boolean)).size;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alumni Profiles CRUD Dashboard | AlumniSphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container">
    ${this.renderTopNav('alumni')}

    ${message ? `<div class="alert alert-success"><span>✓</span><span>${this.escapeHtml(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${this.escapeHtml(error)}</span></div>` : ''}

    <div class="header-bar">
      <div>
        <h1 class="page-title">Alumni Profiles Management</h1>
        <p class="page-subtitle">Persistent PostgreSQL relational data store for graduates, companies, and mentors</p>
      </div>
      <div>
        <a href="/alumni/new" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Alumni
        </a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Alumni in DB</span>
        <span class="stat-value">${totalCount}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Active Mentors</span>
        <span class="stat-value" style="color: var(--success);">${mentorCount}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Companies Represented</span>
        <span class="stat-value" style="color: var(--purple);">${companiesCount}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Storage Engine</span>
        <span class="stat-value" style="font-size: 1.2rem; color: #34d399; margin-top: 0.3rem;">
          ${db.isDbConnected ? 'PostgreSQL (pgdata)' : 'Memory Cache'}
        </span>
      </div>
    </div>

    <div class="glass-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Alumni Member</th>
              <th>Class & Department</th>
              <th>Company & Role</th>
              <th>Skills & Tags</th>
              <th>Location</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${alumni.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  No alumni records found in the database. <a href="/alumni/new" style="color: var(--accent);">Create the first record</a> or run <code>npm run seed</code>.
                </td>
              </tr>
            ` : alumni.map(item => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${this.escapeHtml(item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}" alt="${this.escapeHtml(item.name)}" class="alumni-avatar">
                    <div>
                      <div class="alumni-name">${this.escapeHtml(item.name)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">ID: #${this.escapeHtml(item.id)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge badge-dept">${this.escapeHtml(item.department)}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Class of ${this.escapeHtml(item.graduationYear)}</div>
                </td>
                <td>
                  <div style="font-weight: 600;">${this.escapeHtml(item.company)}</div>
                  <div class="alumni-role">${this.escapeHtml(item.role)}</div>
                </td>
                <td>
                  <div class="skills-list">
                    ${(item.skills || []).slice(0, 3).map(s => `<span class="skill-tag">${this.escapeHtml(s)}</span>`).join('')}
                    ${(item.skills || []).length > 3 ? `<span class="skill-tag">+${item.skills.length - 3}</span>` : ''}
                  </div>
                </td>
                <td>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">${this.escapeHtml(item.location || 'Remote')}</span>
                </td>
                <td>
                  ${item.isMentor ? `
                    <span class="badge badge-mentor">⭐ Mentor</span>
                  ` : `
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Alumni</span>
                  `}
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 0.4rem;">
                    <a href="/alumni/${item.id}" class="btn btn-secondary btn-sm" title="View Profile">View</a>
                    <a href="/alumni/${item.id}/edit" class="btn btn-secondary btn-sm" title="Edit Profile">Edit</a>
                    <form method="POST" action="/alumni/${item.id}/delete" style="display: inline;" onsubmit="return confirm('Delete ${this.escapeHtml(item.name)} from database?');">
                      <button type="submit" class="btn btn-danger btn-sm" title="Delete from DB">Del</button>
                    </form>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 2. READ ONE: Alumni Profile Details
   */
  static renderAlumniDetails(alumni, message = null, error = null) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(alumni.name)} | Alumni Profile</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    ${this.renderTopNav('alumni')}

    ${message ? `<div class="alert alert-success"><span>✓</span><span>${this.escapeHtml(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${this.escapeHtml(error)}</span></div>` : ''}

    <div style="margin-bottom: 1.5rem;">
      <a href="/alumni" style="color: var(--accent); text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.3rem;">
        ← Back to Alumni Directory
      </a>
    </div>

    <div class="glass-card" style="padding: 2rem;">
      <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem;">
        <img src="${this.escapeHtml(alumni.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}" alt="${this.escapeHtml(alumni.name)}" style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid var(--accent); object-fit: cover;">
        <div>
          <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 700;">${this.escapeHtml(alumni.name)}</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">${this.escapeHtml(alumni.role)} @ <strong style="color: var(--text-main);">${this.escapeHtml(alumni.company)}</strong></p>
          <div style="margin-top: 0.4rem; display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-dept">${this.escapeHtml(alumni.department)} (${this.escapeHtml(alumni.graduationYear)})</span>
            ${alumni.isMentor ? '<span class="badge badge-mentor">⭐ Active Mentor</span>' : ''}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem; background: rgba(15, 23, 42, 0.4); padding: 1.25rem; border-radius: 10px; border: 1px solid var(--border);">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">Biography & Career Overview</h4>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #cbd5e1;">${this.escapeHtml(alumni.bio || 'No biography provided.')}</p>
      </div>

      <div class="form-row" style="margin-bottom: 1.5rem;">
        <div>
          <span class="form-label">Industry</span>
          <p style="font-weight: 600;">${this.escapeHtml(alumni.industry || 'Technology')}</p>
        </div>
        <div>
          <span class="form-label">Location</span>
          <p style="font-weight: 600;">${this.escapeHtml(alumni.location || 'Remote')}</p>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <span class="form-label">Skills & Expertise</span>
        <div class="skills-list" style="max-width: 100%; margin-top: 0.4rem;">
          ${(alumni.skills || []).map(s => `<span class="skill-tag" style="font-size: 0.85rem; padding: 0.3rem 0.6rem;">${this.escapeHtml(s)}</span>`).join('')}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1.5rem;">
        <a href="/alumni" class="btn btn-secondary">Back to List</a>
        <div style="display: flex; gap: 0.5rem;">
          <a href="/alumni/${alumni.id}/edit" class="btn btn-primary">Edit Profile</a>
          <form method="POST" action="/alumni/${alumni.id}/delete" onsubmit="return confirm('Are you sure you want to delete this profile?');">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 3. CREATE FORM
   */
  static renderCreateForm(formData = {}, message = null, error = null) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add New Alumni Profile | AlumniSphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    ${this.renderTopNav('alumni')}

    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${this.escapeHtml(error)}</span></div>` : ''}

    <div class="glass-card" style="padding: 2rem;">
      <h1 class="page-title" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Add New Alumni Profile</h1>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.5rem;">Creates a persistent record in PostgreSQL <code>alumni</code> table</p>

      <form method="POST" action="/alumni">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-control" required placeholder="e.g. Caner Koç" value="${this.escapeHtml(formData.name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Graduation Year *</label>
            <input type="number" name="graduationYear" class="form-control" required min="1970" max="2030" placeholder="e.g. 2022" value="${this.escapeHtml(formData.graduationYear || '2023')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Academic Department *</label>
          <select name="department" class="form-control" required>
            <option value="Computer Engineering" ${formData.department === 'Computer Engineering' ? 'selected' : ''}>Computer Engineering</option>
            <option value="Software Engineering" ${formData.department === 'Software Engineering' || !formData.department ? 'selected' : ''}>Software Engineering</option>
            <option value="Industrial Engineering" ${formData.department === 'Industrial Engineering' ? 'selected' : ''}>Industrial Engineering</option>
            <option value="Electrical & Electronics Engineering" ${formData.department === 'Electrical & Electronics Engineering' ? 'selected' : ''}>Electrical & Electronics Engineering</option>
            <option value="Architecture" ${formData.department === 'Architecture' ? 'selected' : ''}>Architecture</option>
            <option value="Business Administration" ${formData.department === 'Business Administration' ? 'selected' : ''}>Business Administration</option>
            <option value="Data Science & AI" ${formData.department === 'Data Science & AI' ? 'selected' : ''}>Data Science & AI</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company / Institution</label>
            <input type="text" name="company" class="form-control" placeholder="e.g. Google, Tesla, Freelance" value="${this.escapeHtml(formData.company || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Job Title / Role</label>
            <input type="text" name="role" class="form-control" placeholder="e.g. Senior Software Engineer" value="${this.escapeHtml(formData.role || '')}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location (City, Country)</label>
            <input type="text" name="location" class="form-control" placeholder="e.g. Zurich, Switzerland" value="${this.escapeHtml(formData.location || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Industry</label>
            <input type="text" name="industry" class="form-control" placeholder="e.g. Technology, FinTech" value="${this.escapeHtml(formData.industry || 'Technology')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Skills (Comma-separated)</label>
          <input type="text" name="skills" class="form-control" placeholder="e.g. TypeScript, React, PostgreSQL, Docker" value="${this.escapeHtml(Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || ''))}">
        </div>

        <div class="form-group">
          <label class="form-label">Avatar URL</label>
          <input type="url" name="avatar" class="form-control" placeholder="https://..." value="${this.escapeHtml(formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}">
        </div>

        <div class="form-group">
          <label class="form-label">Biography & Intro</label>
          <textarea name="bio" class="form-control" rows="3" placeholder="Brief summary of professional journey...">${this.escapeHtml(formData.bio || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="isMentor" value="true" ${formData.isMentor ? 'checked' : ''}>
            <span>Available to serve as a Student Mentor ⭐</span>
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
          <a href="/alumni" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary">Save to PostgreSQL Database</button>
        </div>
      </form>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 4. EDIT FORM
   */
  static renderEditForm(alumni, message = null, error = null) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Profile: ${this.escapeHtml(alumni.name)} | AlumniSphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    ${this.renderTopNav('alumni')}

    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${this.escapeHtml(error)}</span></div>` : ''}

    <div class="glass-card" style="padding: 2rem;">
      <h1 class="page-title" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Edit Alumni Profile</h1>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.5rem;">Updating record #${this.escapeHtml(alumni.id)} in PostgreSQL <code>alumni</code> table</p>

      <form method="POST" action="/alumni/${alumni.id}">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-control" required value="${this.escapeHtml(alumni.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">Graduation Year *</label>
            <input type="number" name="graduationYear" class="form-control" required min="1970" max="2030" value="${this.escapeHtml(alumni.graduationYear)}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Academic Department *</label>
          <select name="department" class="form-control" required>
            <option value="Computer Engineering" ${alumni.department === 'Computer Engineering' ? 'selected' : ''}>Computer Engineering</option>
            <option value="Software Engineering" ${alumni.department === 'Software Engineering' ? 'selected' : ''}>Software Engineering</option>
            <option value="Industrial Engineering" ${alumni.department === 'Industrial Engineering' ? 'selected' : ''}>Industrial Engineering</option>
            <option value="Electrical & Electronics Engineering" ${alumni.department === 'Electrical & Electronics Engineering' ? 'selected' : ''}>Electrical & Electronics Engineering</option>
            <option value="Architecture" ${alumni.department === 'Architecture' ? 'selected' : ''}>Architecture</option>
            <option value="Business Administration" ${alumni.department === 'Business Administration' ? 'selected' : ''}>Business Administration</option>
            <option value="Data Science & AI" ${alumni.department === 'Data Science & AI' ? 'selected' : ''}>Data Science & AI</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company / Institution</label>
            <input type="text" name="company" class="form-control" value="${this.escapeHtml(alumni.company || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Job Title / Role</label>
            <input type="text" name="role" class="form-control" value="${this.escapeHtml(alumni.role || '')}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location (City, Country)</label>
            <input type="text" name="location" class="form-control" value="${this.escapeHtml(alumni.location || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Industry</label>
            <input type="text" name="industry" class="form-control" value="${this.escapeHtml(alumni.industry || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Skills (Comma-separated)</label>
          <input type="text" name="skills" class="form-control" value="${this.escapeHtml(Array.isArray(alumni.skills) ? alumni.skills.join(', ') : (alumni.skills || ''))}">
        </div>

        <div class="form-group">
          <label class="form-label">Avatar URL</label>
          <input type="url" name="avatar" class="form-control" value="${this.escapeHtml(alumni.avatar || '')}">
        </div>

        <div class="form-group">
          <label class="form-label">Biography & Intro</label>
          <textarea name="bio" class="form-control" rows="3">${this.escapeHtml(alumni.bio || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="isMentor" value="true" ${alumni.isMentor ? 'checked' : ''}>
            <span>Available to serve as a Student Mentor ⭐</span>
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
          <a href="/alumni/${alumni.id}" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary">Update in PostgreSQL Database</button>
        </div>
      </form>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = AlumniView;
