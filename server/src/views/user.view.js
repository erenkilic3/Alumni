/**
 * UserView
 *
 * View Layer for User presentation.
 * Decoupled from Controllers to maintain clean MVC separation.
 * Generates server-side rendered (SSR) HTML views with modern styling,
 * responsive data tables, interactive forms, and client-side helpers.
 */
class UserView {
  /**
   * Escape HTML special characters to prevent Cross-Site Scripting (XSS)
   * @param {string} str - Raw string
   * @returns {string} Escaped string
   */
  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Render the primary Users Listing view (GET /users)
   * Also houses the User Creation form (POST /users) and summary metrics
   *
   * @param {Array<Object>} users - List of user objects
   * @param {string|null} message - Flash success message
   * @param {string|null} error - Flash error message
   * @returns {string} Full HTML document string
   */
  static renderUsersList(users = [], message = null, error = null) {
    const escape = this.escapeHtml;

    // Metric counters for summary cards
    const totalCount = users.length;
    const adminCount = users.filter(u => (u.role || '').toUpperCase() === 'ADMIN').length;
    const alumniCount = users.filter(u => (u.role || '').toUpperCase() === 'ALUMNI').length;
    const studentCount = users.filter(u => (u.role || '').toUpperCase() === 'STUDENT').length;

    const usersRows = users.map(u => {
      const initial = (u.name || 'U').charAt(0).toUpperCase();
      const role = (u.role || 'STUDENT').toUpperCase();
      const roleClass = `role-${role.toLowerCase()}`;
      const formattedDate = u.createdAt ? new Date(u.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }) : 'N/A';

      return `
        <tr data-user-id="${escape(u.id)}" data-name="${escape(u.name)}" data-email="${escape(u.email)}" data-role="${escape(role)}" data-dept="${escape(u.department || '')}">
          <td><span class="user-id">#${escape(u.id)}</span></td>
          <td>
            <div class="user-cell">
              <div class="user-avatar">${initial}</div>
              <div>
                <div class="user-name">${escape(u.name)}</div>
                <div class="user-dept">${escape(u.department || 'General')}</div>
              </div>
            </div>
          </td>
          <td><span class="user-email">${escape(u.email)}</span></td>
          <td>
            <span class="role-badge ${roleClass}">${escape(role)}</span>
          </td>
          <td class="text-muted">${formattedDate}</td>
          <td>
            <div class="actions-group">
              <button type="button" class="btn-action" onclick="editUser('${escape(u.id)}', '${escape(u.name)}', '${escape(u.email)}', '${escape(role)}', '${escape(u.department || '')}')" title="Edit User">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn-action btn-danger" onclick="deleteUser('${escape(u.id)}', '${escape(u.name)}')" title="Delete User">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Management Dashboard | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0f172a;
      --bg-surface: #1e293b;
      --bg-card: rgba(30, 41, 59, 0.75);
      --border: rgba(255, 255, 255, 0.1);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --accent-dark: #0284c7;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #34d399;
      --danger: #f87171;
      --warning: #fbbf24;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      width: 100%;
      max-width: 1100px;
    }
    
    /* Top Header */
    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      color: var(--accent);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.85rem;
      letter-spacing: 0.02em;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff 20%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .subtitle code {
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent);
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      font-size: 0.9em;
    }

    /* Metric Cards Bar */
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 768px) {
      .metrics-bar { grid-template-columns: repeat(2, 1fr); }
    }
    .metric-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      border-color: rgba(56, 189, 248, 0.4);
    }
    .metric-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: #fff;
    }
    .metric-card.primary .metric-value { color: var(--accent); }
    .metric-card.admin .metric-value { color: var(--danger); }
    .metric-card.alumni .metric-value { color: var(--success); }
    .metric-card.student .metric-value { color: #818cf8; }

    /* Flash Alerts */
    .alert {
      padding: 0.9rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: var(--success);
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: var(--danger);
    }

    /* Main Grid Layout */
    .main-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.75rem;
      align-items: start;
    }
    @media (max-width: 960px) {
      .main-grid { grid-template-columns: 1fr; }
    }

    /* Glass Cards */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .route-badge {
      font-family: monospace;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.25);
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 1.15rem;
    }
    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #cbd5e1;
      margin-bottom: 0.4rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    input:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    button.btn-submit {
      width: 100%;
      padding: 0.85rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
    }
    button.btn-submit:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-1px);
    }
    button.btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Search & Filter Bar */
    .search-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .search-input-wrap {
      flex: 1;
      position: relative;
    }
    .search-input-wrap input {
      padding-left: 2.25rem;
    }
    .search-icon {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    /* Users Table */
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th {
      text-align: left;
      padding: 0.75rem 0.6rem;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.75rem;
      border-bottom: 1px solid #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 0.85rem 0.6rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(51, 65, 85, 0.2);
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      flex-shrink: 0;
    }
    .user-name {
      font-weight: 600;
      color: #f8fafc;
    }
    .user-dept {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .user-id {
      color: var(--text-muted);
      font-family: monospace;
      font-size: 0.85rem;
    }
    .user-email {
      color: #cbd5e1;
    }
    .role-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .role-admin {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .role-alumni {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .role-student {
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .text-muted {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    /* Action Buttons */
    .actions-group {
      display: flex;
      gap: 0.4rem;
    }
    .btn-action {
      padding: 0.35rem 0.7rem;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #1e293b;
      color: var(--accent);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-action:hover {
      background: var(--accent);
      color: #0f172a;
      border-color: var(--accent);
    }
    .btn-danger {
      border-color: rgba(239, 68, 68, 0.35);
      color: var(--danger);
    }
    .btn-danger:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }

    /* Bottom Navigation / Links Bar */
    .links-bar {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .btn-link {
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      background: #1e293b;
      border: 1px solid #334155;
      color: var(--accent);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-link:hover {
      background: #334155;
      color: white;
      border-color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="badge-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        <span>MVC View Layer • In-Memory Store</span>
      </div>
      <h1>User Management Dashboard</h1>
      <p class="subtitle">
        Powered by <code>GET /users</code> for listing and <code>POST /users</code> for creating users via server-side rendered views.
      </p>
    </header>

    <!-- Metrics Bar -->
    <section class="metrics-bar">
      <div class="metric-card primary">
        <span class="metric-label">Total Users</span>
        <span class="metric-value" id="metricTotal">${totalCount}</span>
      </div>
      <div class="metric-card admin">
        <span class="metric-label">Administrators</span>
        <span class="metric-value">${adminCount}</span>
      </div>
      <div class="metric-card alumni">
        <span class="metric-label">Alumni</span>
        <span class="metric-value">${alumniCount}</span>
      </div>
      <div class="metric-card student">
        <span class="metric-label">Students</span>
        <span class="metric-value">${studentCount}</span>
      </div>
    </section>

    <!-- Flash & Live Alerts -->
    ${message ? `<div class="alert alert-success"><span>✅</span><span>${escape(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${escape(error)}</span></div>` : ''}
    <div id="liveAlert"></div>

    <!-- Main Grid: Form + Users List Table -->
    <div class="main-grid">
      <!-- Create User Card (POST /users) -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            <span>Add New User</span>
          </div>
          <span class="route-badge">POST /users</span>
        </div>

        <form id="userForm" action="/users" method="POST">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" name="name" placeholder="e.g. John Doe" required autofocus autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" placeholder="e.g. john@alumni.edu" required autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role">
              <option value="STUDENT">Student</option>
              <option value="ALUMNI" selected>Alumni</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="form-group">
            <label for="department">Department / Specialty</label>
            <input type="text" id="department" name="department" placeholder="e.g. Computer Science" autocomplete="off" />
          </div>

          <button type="submit" class="btn-submit" id="submitBtn">
            <span>Register User</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </section>

      <!-- Users Listing Table Card (GET /users) -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Registered Users</span>
          </div>
          <span class="route-badge">GET /users</span>
        </div>

        <!-- Filter / Search -->
        <div class="search-bar">
          <div class="search-input-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="searchInput" placeholder="Search by name, email, or department..." autocomplete="off" />
          </div>
          <select id="roleFilter" style="width: 140px;">
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ALUMNI">Alumni</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="userTableBody">
              ${usersRows}
            </tbody>
          </table>
        </div>

        <!-- Links Footer -->
        <div class="links-bar">
          <a href="/api/swagger" class="btn-link" target="_blank">
            <span>📖 Swagger Docs</span>
          </a>
          <a href="/api/users" class="btn-link" target="_blank">
            <span>{ } REST API JSON</span>
          </a>
          <a href="/api/health" class="btn-link" target="_blank">
            <span>🩺 Health Check</span>
          </a>
          <a href="/" class="btn-link">
            <span>🏠 Home</span>
          </a>
        </div>
      </section>
    </div>
  </div>

  <script>
    const form = document.getElementById('userForm');
    const tableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const liveAlert = document.getElementById('liveAlert');

    // Live filtering by search query & role
    function filterTable() {
      const query = (searchInput.value || '').toLowerCase();
      const role = roleFilter.value;
      const rows = tableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const name = (row.getAttribute('data-name') || '').toLowerCase();
        const email = (row.getAttribute('data-email') || '').toLowerCase();
        const dept = (row.getAttribute('data-dept') || '').toLowerCase();
        const userRole = row.getAttribute('data-role') || '';

        const matchesQuery = !query || name.includes(query) || email.includes(query) || dept.includes(query);
        const matchesRole = role === 'ALL' || userRole === role;

        row.style.display = (matchesQuery && matchesRole) ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', filterTable);
    roleFilter.addEventListener('change', filterTable);

    // Edit User modal / prompt handler
    window.editUser = async (id, currentName, currentEmail, currentRole, currentDept) => {
      const newName = prompt('Update Full Name (PUT/PATCH):', currentName);
      if (newName === null) return;
      const newEmail = prompt('Update Email Address (PUT/PATCH):', currentEmail);
      if (newEmail === null) return;
      const newRole = prompt('Update Role (STUDENT, ALUMNI, ADMIN):', currentRole);
      if (newRole === null) return;
      const newDept = prompt('Update Department / Specialty:', currentDept);
      if (newDept === null) return;

      try {
        const res = await fetch('/api/user/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: newName,
            email: newEmail,
            role: newRole,
            department: newDept
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          liveAlert.innerHTML = '<div class=\"alert alert-success\"><span>✅</span><span>User #' + id + ' successfully updated!</span></div>';
          setTimeout(() => location.reload(), 500);
        } else {
          liveAlert.innerHTML = '<div class=\"alert alert-danger\"><span>⚠️</span><span>' + (data.error || 'Update failed') + '</span></div>';
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    };

    // Delete User handler
    window.deleteUser = async (id, name) => {
      if (!confirm('Are you sure you want to delete \"' + name + '\"? (DELETE /users/' + id + ')')) {
        return;
      }

      try {
        const res = await fetch('/api/users/' + id, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          liveAlert.innerHTML = '<div class=\"alert alert-success\"><span>🗑️</span><span>' + data.message + '</span></div>';
          setTimeout(() => location.reload(), 500);
        } else {
          liveAlert.innerHTML = '<div class=\"alert alert-danger\"><span>⚠️</span><span>' + (data.error || 'Delete failed') + '</span></div>';
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    };

    // Intercept form submit for smooth AJAX update with automatic fallback
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;

      const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        role: document.getElementById('role').value,
        department: document.getElementById('department').value.trim()
      };

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          liveAlert.innerHTML = '<div class=\"alert alert-success\"><span>✅</span><span>User registered successfully: <strong>' + data.user.name + '</strong></span></div>';
          form.reset();
          setTimeout(() => location.reload(), 500);
        } else {
          liveAlert.innerHTML = '<div class=\"alert alert-danger\"><span>⚠️</span><span>' + (data.error || 'Failed to register user') + '</span></div>';
          submitBtn.disabled = false;
        }
      } catch (err) {
        // Fallback to standard form submission
        form.submit();
      }
    });
  </script>
</body>
</html>`;
  }
}

module.exports = UserView;
