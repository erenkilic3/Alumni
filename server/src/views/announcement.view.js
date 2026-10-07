/**
 * AnnouncementView
 *
 * View Layer for Announcement presentation and management.
 * Provides rich, interactive server-side rendered (SSR) HTML views for:
 * - READ ALL & MANAGE: renderAnnouncementsList() (GET /announcements)
 * - READ ONE:          renderAnnouncementDetails() (GET /announcements/:id)
 * - CREATE FORM:       renderCreateForm() (GET /announcements/new)
 * - EDIT FORM:         renderEditForm() (GET /announcements/:id/edit)
 */
class AnnouncementView {
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
   * Shared CSS Stylesheet for Announcement views
   */
  static getCommonStyles() {
    return `
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
      --purple: #c084fc;
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
    .container-narrow {
      max-width: 680px;
    }

    /* Breadcrumbs */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .breadcrumb-nav a {
      color: var(--accent);
      text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb-nav a:hover {
      color: #fff;
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
      max-width: 640px;
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
    .metric-card.event .metric-value { color: var(--purple); }
    .metric-card.career .metric-value { color: var(--success); }
    .metric-card.urgent .metric-value { color: var(--danger); }

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
      grid-template-columns: 380px 1fr;
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
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
    }
    textarea {
      resize: vertical;
      min-height: 100px;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #cbd5e1;
      margin-top: 0.5rem;
    }
    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .form-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
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
    .btn-secondary {
      padding: 0.85rem 1.25rem;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #fff;
    }

    /* Search & Filter Bar */
    .search-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .search-input-wrap {
      flex: 1;
      min-width: 200px;
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

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-event {
      background: rgba(192, 132, 252, 0.15);
      color: var(--purple);
      border: 1px solid rgba(192, 132, 252, 0.3);
    }
    .badge-career {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-academic {
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .badge-general {
      background: rgba(148, 163, 184, 0.15);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .priority-urgent {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .priority-high {
      background: rgba(251, 191, 36, 0.15);
      color: var(--warning);
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .priority-normal {
      background: rgba(100, 116, 139, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(100, 116, 139, 0.3);
    }
    .pin-badge {
      color: #fbbf24;
      font-size: 0.9rem;
      margin-right: 0.25rem;
    }

    /* Table */
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
    .announcement-title {
      font-weight: 600;
      color: #f8fafc;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
    }
    .announcement-title a {
      color: #f8fafc;
      text-decoration: none;
      transition: color 0.2s;
    }
    .announcement-title a:hover {
      color: var(--accent);
    }
    .announcement-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Action Buttons */
    .actions-group {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .btn-action {
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #1e293b;
      color: var(--accent);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
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

    /* Detail View Content */
    .announcement-content-box {
      background: rgba(15, 23, 42, 0.6);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 1.05rem;
      line-height: 1.7;
      color: #e2e8f0;
      margin: 1.5rem 0;
      white-space: pre-line;
    }

    /* Links Bar */
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
    `;
  }

  /**
   * 1. READ ALL & MANAGEMENT DASHBOARD: (GET /announcements)
   */
  static renderAnnouncementsList(announcements = [], message = null, error = null) {
    const escape = this.escapeHtml;

    const totalCount = announcements.length;
    const activeCount = announcements.filter(a => a.status === 'ACTIVE').length;
    const urgentCount = announcements.filter(a => a.priority === 'URGENT' || a.priority === 'HIGH').length;
    const eventCount = announcements.filter(a => a.category === 'EVENT').length;

    const rows = announcements.map(a => {
      const catClass = `badge-${(a.category || 'general').toLowerCase()}`;
      const prioClass = `priority-${(a.priority || 'normal').toLowerCase()}`;
      const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A';

      return `
        <tr data-id="${escape(a.id)}" data-title="${escape(a.title)}" data-content="${escape(a.content)}" data-category="${escape(a.category)}" data-priority="${escape(a.priority)}" data-author="${escape(a.author)}">
          <td><span style="font-family:monospace; color:var(--text-muted);">#${escape(a.id)}</span></td>
          <td>
            <div class="announcement-title">
              ${a.isPinned ? '<span class="pin-badge" title="Pinned Announcement">📌</span>' : ''}
              <a href="/announcements/${escape(a.id)}" title="Read Announcement">${escape(a.title)}</a>
            </div>
            <div class="announcement-meta">By ${escape(a.author)} • ${dateStr}</div>
          </td>
          <td><span class="badge ${catClass}">${escape(a.category)}</span></td>
          <td><span class="badge ${prioClass}">${escape(a.priority)}</span></td>
          <td>
            <div class="actions-group">
              <a href="/announcements/${escape(a.id)}" class="btn-action" title="View Full Announcement">
                <span>View</span>
              </a>
              <a href="/announcements/${escape(a.id)}/edit" class="btn-action" title="Edit Announcement">
                <span>Edit</span>
              </a>
              <form action="/announcements/${escape(a.id)}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete announcement #${escape(a.id)}?');">
                <button type="submit" class="btn-action btn-danger" title="Delete Announcement">
                  <span>Delete</span>
                </button>
              </form>
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
  <title>Announcement Management Interface | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container">
    <header class="dashboard-header">
      <div class="badge-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span>Announcement Management Interface • MVC</span>
      </div>
      <h1>Announcements & Campus Bulletins</h1>
      <p class="subtitle">
        Manage university events, career fairs, and academic notices with complete CRUD operations.
      </p>
    </header>

    <section class="metrics-bar">
      <div class="metric-card primary">
        <span class="metric-label">Total Bulletins</span>
        <span class="metric-value">${totalCount}</span>
      </div>
      <div class="metric-card event">
        <span class="metric-label">Events</span>
        <span class="metric-value">${eventCount}</span>
      </div>
      <div class="metric-card urgent">
        <span class="metric-label">Urgent / High Priority</span>
        <span class="metric-value">${urgentCount}</span>
      </div>
      <div class="metric-card career">
        <span class="metric-label">Active Notices</span>
        <span class="metric-value">${activeCount}</span>
      </div>
    </section>

    ${message ? `<div class="alert alert-success"><span>✅</span><span>${escape(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${escape(error)}</span></div>` : ''}

    <div class="main-grid">
      <!-- Create Announcement Card (POST /announcements) -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Publish Announcement</span>
          </div>
          <span class="route-badge">POST /announcements</span>
        </div>

        <form action="/announcements" method="POST">
          <div class="form-group">
            <label for="title">Headline / Title *</label>
            <input type="text" id="title" name="title" placeholder="e.g. Annual Alumni Meetup 2026" required autofocus autocomplete="off" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category</label>
              <select id="category" name="category">
                <option value="GENERAL">General</option>
                <option value="EVENT">Event</option>
                <option value="CAREER">Career</option>
                <option value="ACADEMIC">Academic</option>
              </select>
            </div>
            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" name="priority">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="author">Author / Department</label>
            <input type="text" id="author" name="author" placeholder="e.g. Alumni Relations Office" />
          </div>

          <div class="form-group">
            <label for="content">Announcement Content *</label>
            <textarea id="content" name="content" placeholder="Write announcement details here..." required></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="isPinned" name="isPinned" value="true" />
              <span>📌 Pin this announcement to top of list</span>
            </label>
          </div>

          <button type="submit" class="btn-submit">
            <span>Publish Announcement</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </section>

      <!-- Announcements Listing Table (GET /announcements) -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Bulletins & Notices</span>
          </div>
          <span class="route-badge">GET /announcements</span>
        </div>

        <div class="search-bar">
          <div class="search-input-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="searchInput" placeholder="Search announcements..." autocomplete="off" />
          </div>
          <select id="catFilter" style="width: 140px;">
            <option value="ALL">All Categories</option>
            <option value="EVENT">Event</option>
            <option value="CAREER">Career</option>
            <option value="ACADEMIC">Academic</option>
            <option value="GENERAL">General</option>
          </select>
          <select id="prioFilter" style="width: 130px;">
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Announcement</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="announcementsTableBody">
              ${rows}
            </tbody>
          </table>
        </div>

        <div class="links-bar">
          <a href="/announcements/new" class="btn-link">
            <span>➕ Dedicated Form</span>
          </a>
          <a href="/users" class="btn-link">
            <span>👥 User Dashboard</span>
          </a>
          <a href="/api/swagger" class="btn-link" target="_blank">
            <span>📖 Swagger Docs</span>
          </a>
          <a href="/api/announcements" class="btn-link" target="_blank">
            <span>{ } REST API JSON</span>
          </a>
          <a href="/" class="btn-link">
            <span>🏠 Home</span>
          </a>
        </div>
      </section>
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const catFilter = document.getElementById('catFilter');
    const prioFilter = document.getElementById('prioFilter');
    const tableBody = document.getElementById('announcementsTableBody');

    function filterTable() {
      const q = (searchInput.value || '').toLowerCase();
      const cat = catFilter.value;
      const prio = prioFilter.value;
      const rows = tableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const title = (row.getAttribute('data-title') || '').toLowerCase();
        const content = (row.getAttribute('data-content') || '').toLowerCase();
        const author = (row.getAttribute('data-author') || '').toLowerCase();
        const rowCat = row.getAttribute('data-category') || '';
        const rowPrio = row.getAttribute('data-priority') || '';

        const matchesQuery = !q || title.includes(q) || content.includes(q) || author.includes(q);
        const matchesCat = cat === 'ALL' || rowCat === cat;
        const matchesPrio = prio === 'ALL' || rowPrio === prio;

        row.style.display = (matchesQuery && matchesCat && matchesPrio) ? '' : 'none';
      });
    }

    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (catFilter) catFilter.addEventListener('change', filterTable);
    if (prioFilter) prioFilter.addEventListener('change', filterTable);
  </script>
</body>
</html>`;
  }

  /**
   * 2. READ ONE: Single Announcement Details View (GET /announcements/:id)
   */
  static renderAnnouncementDetails(announcement, message = null, error = null) {
    const escape = this.escapeHtml;
    const catClass = `badge-${(announcement.category || 'general').toLowerCase()}`;
    const prioClass = `priority-${(announcement.priority || 'normal').toLowerCase()}`;
    const dateStr = announcement.createdAt ? new Date(announcement.createdAt).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    }) : 'N/A';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(announcement.title)} | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    <nav class="breadcrumb-nav">
      <a href="/announcements">← Back to Announcements</a>
      <span>/</span>
      <span>Bulletin #${escape(announcement.id)}</span>
    </nav>

    ${message ? `<div class="alert alert-success"><span>✅</span><span>${escape(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${escape(error)}</span></div>` : ''}

    <div class="card">
      <div class="card-header">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${announcement.isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
          <span class="badge ${catClass}">${escape(announcement.category)}</span>
          <span class="badge ${prioClass}">${escape(announcement.priority)}</span>
        </div>
        <span class="route-badge">GET /announcements/:id</span>
      </div>

      <h2 style="font-family:'Outfit',sans-serif; font-size:1.85rem; margin-bottom:0.75rem; color:#fff;">
        ${escape(announcement.title)}
      </h2>

      <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1.5rem;">
        Published by <strong>${escape(announcement.author)}</strong> • ${dateStr}
      </p>

      <div class="announcement-content-box">
        ${escape(announcement.content)}
      </div>

      <div class="form-actions">
        <a href="/announcements/${escape(announcement.id)}/edit" class="btn-submit" style="text-decoration:none;">
          <span>✏️ Edit Announcement</span>
        </a>
        <form action="/announcements/${escape(announcement.id)}/delete" method="POST" style="flex:1;" onsubmit="return confirm('Are you sure you want to delete this announcement?');">
          <button type="submit" class="btn-secondary" style="width:100%; border-color:rgba(239,68,68,0.4); color:var(--danger);">
            <span>🗑️ Delete</span>
          </button>
        </form>
      </div>

      <div class="links-bar" style="justify-content:center; margin-top:1.5rem;">
        <a href="/announcements" class="btn-link"><span>📢 All Announcements</span></a>
        <a href="/api/announcement/${escape(announcement.id)}" class="btn-link" target="_blank"><span>{ } REST API JSON</span></a>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 3. CREATE FORM: Dedicated Add Announcement View (GET /announcements/new)
   */
  static renderCreateForm(formData = {}, message = null, error = null) {
    const escape = this.escapeHtml;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Announcement | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    <nav class="breadcrumb-nav">
      <a href="/announcements">← Back to Announcements</a>
      <span>/</span>
      <span>Publish Bulletin</span>
    </nav>

    ${message ? `<div class="alert alert-success"><span>✅</span><span>${escape(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${escape(error)}</span></div>` : ''}

    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Create Announcement</span>
        </div>
        <span class="route-badge">GET /announcements/new</span>
      </div>

      <form action="/announcements" method="POST">
        <div class="form-group">
          <label for="title">Headline / Title *</label>
          <input type="text" id="title" name="title" value="${escape(formData.title || '')}" placeholder="e.g. Annual Alumni Meetup 2026" required autofocus autocomplete="off" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category">
              <option value="GENERAL" ${formData.category === 'GENERAL' ? 'selected' : ''}>General</option>
              <option value="EVENT" ${formData.category === 'EVENT' ? 'selected' : ''}>Event</option>
              <option value="CAREER" ${formData.category === 'CAREER' ? 'selected' : ''}>Career</option>
              <option value="ACADEMIC" ${formData.category === 'ACADEMIC' ? 'selected' : ''}>Academic</option>
            </select>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" name="priority">
              <option value="NORMAL" ${formData.priority === 'NORMAL' ? 'selected' : ''}>Normal</option>
              <option value="HIGH" ${formData.priority === 'HIGH' ? 'selected' : ''}>High</option>
              <option value="URGENT" ${formData.priority === 'URGENT' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="author">Author / Office</label>
          <input type="text" id="author" name="author" value="${escape(formData.author || '')}" placeholder="e.g. Alumni Relations Office" />
        </div>

        <div class="form-group">
          <label for="content">Announcement Content *</label>
          <textarea id="content" name="content" placeholder="Full announcement text..." required>${escape(formData.content || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="isPinned" name="isPinned" value="true" ${formData.isPinned ? 'checked' : ''} />
            <span>📌 Pin this announcement to top of list</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">
            <span>Publish Announcement</span>
          </button>
          <a href="/announcements" class="btn-secondary">
            <span>Cancel</span>
          </a>
        </div>
      </form>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 4. UPDATE FORM: Dedicated Edit Announcement View (GET /announcements/:id/edit)
   */
  static renderEditForm(announcement, message = null, error = null) {
    const escape = this.escapeHtml;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Bulletin #${escape(announcement.id)} | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${this.getCommonStyles()}</style>
</head>
<body>
  <div class="container container-narrow">
    <nav class="breadcrumb-nav">
      <a href="/announcements">← Back to Announcements</a>
      <span>/</span>
      <a href="/announcements/${escape(announcement.id)}">Bulletin #${escape(announcement.id)}</a>
      <span>/</span>
      <span>Edit</span>
    </nav>

    ${message ? `<div class="alert alert-success"><span>✅</span><span>${escape(message)}</span></div>` : ''}
    ${error ? `<div class="alert alert-danger"><span>⚠️</span><span>${escape(error)}</span></div>` : ''}

    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Edit Bulletin #${escape(announcement.id)}</span>
        </div>
        <span class="route-badge">GET /announcements/:id/edit</span>
      </div>

      <form action="/announcements/${escape(announcement.id)}" method="POST">
        <div class="form-group">
          <label for="title">Headline / Title *</label>
          <input type="text" id="title" name="title" value="${escape(announcement.title)}" required autofocus autocomplete="off" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category">
              <option value="GENERAL" ${announcement.category === 'GENERAL' ? 'selected' : ''}>General</option>
              <option value="EVENT" ${announcement.category === 'EVENT' ? 'selected' : ''}>Event</option>
              <option value="CAREER" ${announcement.category === 'CAREER' ? 'selected' : ''}>Career</option>
              <option value="ACADEMIC" ${announcement.category === 'ACADEMIC' ? 'selected' : ''}>Academic</option>
            </select>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" name="priority">
              <option value="NORMAL" ${announcement.priority === 'NORMAL' ? 'selected' : ''}>Normal</option>
              <option value="HIGH" ${announcement.priority === 'HIGH' ? 'selected' : ''}>High</option>
              <option value="URGENT" ${announcement.priority === 'URGENT' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="author">Author / Office</label>
          <input type="text" id="author" name="author" value="${escape(announcement.author)}" />
        </div>

        <div class="form-group">
          <label for="content">Announcement Content *</label>
          <textarea id="content" name="content" required>${escape(announcement.content)}</textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="isPinned" name="isPinned" value="true" ${announcement.isPinned ? 'checked' : ''} />
            <span>📌 Pin this announcement to top of list</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">
            <span>Save Changes</span>
          </button>
          <a href="/announcements/${escape(announcement.id)}" class="btn-secondary">
            <span>Cancel</span>
          </a>
        </div>
      </form>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = AnnouncementView;
