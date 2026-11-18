/**
 * HomepageView
 *
 * Server-side rendered (SSR) presentation layer for GET /homepage.
 * Uses AlumniSphere's Mintlify-inspired design system.
 */

class HomepageView {
  /**
   * Escape HTML to prevent XSS in view rendering
   * @param {string} str
   * @returns {string}
   */
  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Compute 1-2 uppercase initials for portrait fallbacks
   * @param {string} name
   * @returns {string}
   */
  static getInitials(name) {
    if (!name) return 'AS';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Render the Homepage HTML Document
   * @param {Object} [options]
   * @param {Object} [options.stats]
   * @param {Object|null} [options.featuredMentor]
   * @param {Array} [options.recentAlumni]
   * @param {Array} [options.recentJobs]
   * @param {Array} [options.recentAnnouncements]
   * @returns {string} Complete HTML document
   */
  static renderHomepage({
    stats = {},
    featuredMentor = null,
    recentAlumni = [],
    recentJobs = [],
    recentAnnouncements = []
  } = {}) {
    const totalAlumni = Number(stats.totalAlumni ?? 0);
    const mentorsAvailable = Number(stats.mentorsAvailable ?? 0);
    const activeJobs = Number(stats.activeJobs ?? 0);
    const totalAnnouncements = Number(stats.totalAnnouncements ?? 0);

    const mentorName = featuredMentor?.name || 'Good things travel both ways.';
    const mentorRole = featuredMentor
      ? `${featuredMentor.role || 'Alumnus'}${featuredMentor.company ? ` at ${featuredMentor.company}` : ''}`
      : 'Meet alumni ready to share what they have learned across industries.';
    const mentorMeta = featuredMentor
      ? `Class of ${featuredMentor.graduationYear || '—'} · ${featuredMentor.department || 'Alumni Network'}`
      : 'Peer mentorship · Alumni community';
    const mentorAvatar = featuredMentor?.avatar ? this.escapeHtml(featuredMentor.avatar) : '';
    const mentorInitials = this.escapeHtml(this.getInitials(featuredMentor?.name || 'Alumni Sphere'));

    const alumniRowsHtml = recentAlumni.length
      ? recentAlumni.slice(0, 4).map((person) => {
          const initials = this.escapeHtml(this.getInitials(person.name));
          const skills = Array.isArray(person.skills) ? person.skills.slice(0, 3) : [];
          return `
          <div class="ledger-row">
            <div class="person-cell">
              <div class="avatar-circle" data-initials="${initials}">
                ${person.avatar ? `<img src="${this.escapeHtml(person.avatar)}" alt="${this.escapeHtml(person.name)}" loading="lazy" onerror="this.remove()">` : ''}
              </div>
              <div class="person-meta">
                <strong>${this.escapeHtml(person.name)}</strong>
                <span>Class of ${this.escapeHtml(person.graduationYear || '—')} · ${this.escapeHtml(person.department || 'University')}</span>
              </div>
            </div>
            <div class="role-cell">
              <strong>${this.escapeHtml(person.role || 'Alumni Member')}</strong>
              <span>${this.escapeHtml(person.company || 'Independent')}${person.location ? ` · ${this.escapeHtml(person.location)}` : ''}</span>
            </div>
            <div class="tags-cell">
              ${skills.map((s) => `<span class="flat-tag">${this.escapeHtml(s)}</span>`).join('')}
            </div>
            <div class="action-cell">
              ${person.isMentor ? '<span class="mentor-note">Open to mentor</span>' : '<span class="muted-note">Member</span>'}
            </div>
          </div>`;
        }).join('')
      : `<div class="empty-row">No alumni records loaded yet. <a href="/alumni/new" class="inline-link">Add the first profile →</a></div>`;

    const jobsListHtml = recentJobs.length
      ? recentJobs.slice(0, 4).map((job) => `
        <li class="dispatch-item">
          <div class="dispatch-head">
            <strong>${this.escapeHtml(job.title)}</strong>
            <span class="mono-meta">${this.escapeHtml(job.type || 'Full-Time')}</span>
          </div>
          <div class="dispatch-sub">
            ${this.escapeHtml(job.company || 'Partner Organization')}${job.location ? ` · ${this.escapeHtml(job.location)}` : ''}
          </div>
        </li>`).join('')
      : `<li class="dispatch-item"><span class="dispatch-sub">No active job postings right now.</span></li>`;

    const announcementsListHtml = recentAnnouncements.length
      ? recentAnnouncements.slice(0, 4).map((item) => `
        <li class="dispatch-item">
          <div class="dispatch-head">
            <a href="/announcements/${this.escapeHtml(item.id)}" class="dispatch-link">${this.escapeHtml(item.title)}</a>
            <span class="mono-meta">${this.escapeHtml(item.category || 'GENERAL')}</span>
          </div>
          <div class="dispatch-sub">
            ${this.escapeHtml(item.author || 'Alumni Office')}${item.priority && item.priority !== 'NORMAL' ? ` · ${this.escapeHtml(item.priority)}` : ''}
          </div>
        </li>`).join('')
      : `<li class="dispatch-item"><span class="dispatch-sub">No announcements published yet.</span></li>`;

    return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AlumniSphere — Homepage</title>
  <meta name="description" content="Connections that outlast graduation. A lasting connection between graduates, students, and the opportunities that move them forward.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: light;
      --paper: #ffffff;
      --surface: #ffffff;
      --surface-raised: #ffffff;
      --surface-tint: #f4f6f5;
      --ink: #111412;
      --ink-soft: #4b544f;
      --muted: #69716c;
      --line: #e6e8e7;
      --line-strong: #cfd5d2;
      --green: #007b62;
      --green-hover: #00634f;
      --green-wash: #e8f7f2;
      --clay: #65746d;
      --clay-wash: #f1f5f3;
      --success: #007b62;
      --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, monospace;
      --ease: 180ms ease;
    }

    :root[data-theme="dark"] {
      color-scheme: dark;
      --paper: #0e0f0f;
      --surface: #141615;
      --surface-raised: #191c1a;
      --surface-tint: #202421;
      --ink: #f4f6f5;
      --ink-soft: #d0d5d2;
      --muted: #9ba39e;
      --line: #2a2e2c;
      --line-strong: #414845;
      --green: #00d4a4;
      --green-hover: #4adfbd;
      --green-wash: #15362f;
      --clay: #9ba8a2;
      --clay-wash: #242a27;
      --success: #58d8b8;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      min-width: 320px;
      min-height: 100vh;
      background: var(--paper);
      color: var(--ink);
      font: 400 15px/1.6 var(--font-body);
      -webkit-font-smoothing: antialiased;
      transition: background-color var(--ease), color var(--ease);
    }

    a { color: inherit; text-decoration: none; }
    button { font: inherit; color: inherit; }
    img { display: block; max-width: 100%; }

    .container,
    .nav-container {
      width: min(1200px, calc(100% - 64px));
      margin-inline: auto;
    }

    /* Sticky restrained navbar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--paper);
      border-bottom: 1px solid var(--line);
    }

    .nav-container {
      min-height: 78px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      flex: 0 0 auto;
    }

    .brand-logo {
      width: 39px;
      height: 39px;
      display: grid;
      place-items: center;
      background: var(--green);
      color: var(--surface);
    }

    .brand-title {
      display: block;
      font-size: 17px;
      font-weight: 650;
      letter-spacing: -0.04em;
      line-height: 1.2;
    }

    .brand-title .highlight { color: var(--green); }

    .brand-subtitle {
      display: block;
      margin-top: 2px;
      color: var(--muted);
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.13em;
    }

    .primary-nav {
      display: flex;
      align-items: stretch;
      align-self: stretch;
      gap: 6px;
    }

    .nav-link {
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 3px 12px 0;
      color: var(--muted);
      font-size: 13px;
      font-weight: 550;
      transition: color var(--ease);
    }

    .nav-link::after {
      content: "";
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: -1px;
      height: 2px;
      background: transparent;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--green);
    }

    .nav-link.active::after {
      background: var(--green);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .theme-toggle-btn {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 10px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: var(--ink-soft);
      cursor: pointer;
      font-size: 12px;
      transition: border-color var(--ease), color var(--ease);
    }

    .theme-toggle-btn:hover {
      border-color: var(--line);
      color: var(--green);
    }

    [data-theme="light"] .moon-icon,
    [data-theme="dark"] .sun-icon {
      display: none;
    }

    .btn {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--ease), border-color var(--ease), color var(--ease), transform var(--ease);
    }

    .btn:hover { transform: translateY(-1px); }

    .btn-primary {
      background: var(--green);
      border-color: var(--green);
      color: var(--surface-raised);
    }

    .btn-primary:hover {
      background: var(--green-hover);
      border-color: var(--green-hover);
    }

    .btn-outline {
      background: transparent;
      border-color: var(--line-strong);
      color: var(--ink);
    }

    .btn-outline:hover {
      border-color: var(--green);
      color: var(--green);
    }

    /* Editorial Hero */
    .hero-section {
      padding: 64px 0 0;
      border-bottom: 1px solid var(--line);
    }

    .hero-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 0.74fr);
      align-items: center;
      gap: clamp(36px, 7vw, 100px);
      padding-bottom: 60px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 22px;
      color: var(--green);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.14em;
    }

    .hero-badge-mark {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--clay);
    }

    .hero-badge-year {
      padding-left: 12px;
      border-left: 1px solid var(--line-strong);
      color: var(--muted);
      font-size: 9px;
      letter-spacing: 0.1em;
    }

    .hero-title {
      margin: 0;
      font: 400 clamp(42px, 5.5vw, 72px)/1.01 var(--font-display);
      letter-spacing: -0.04em;
    }

    .hero-title em {
      color: var(--green);
      font-style: italic;
    }

    .hero-subtitle {
      max-width: 500px;
      margin: 22px 0 28px;
      color: var(--ink-soft);
      font-size: 15px;
      line-height: 1.75;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .text-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 0 5px;
      border-bottom: 1px solid var(--green);
      color: var(--green);
      font-size: 12px;
      font-weight: 650;
    }

    .text-link span { transition: transform var(--ease); }
    .text-link:hover span { transform: translateX(3px); }

    /* Spotlight Feature Panel */
    .mentor-feature {
      min-height: 248px;
      display: grid;
      grid-template-columns: 39% 1fr;
      border: 1px solid var(--line);
      background: var(--surface);
    }

    .mentor-feature-image {
      position: relative;
      min-height: 248px;
      overflow: hidden;
      background: var(--surface-tint);
    }

    .mentor-feature-image::after {
      content: attr(data-initials);
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--green);
      font: 500 38px/1 var(--font-display);
    }

    .mentor-feature-image img {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      min-height: 248px;
      object-fit: cover;
      filter: saturate(0.84);
    }

    .mentor-feature-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: 26px 24px;
    }

    .section-kicker {
      color: var(--clay);
      font-size: 9px;
      font-weight: 650;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .mentor-feature-content h2 {
      margin: 12px 0 8px;
      font: 400 26px/1.08 var(--font-display);
      letter-spacing: -0.025em;
    }

    .mentor-feature-content p {
      margin: 0;
      color: var(--ink-soft);
      font-size: 13px;
      line-height: 1.55;
    }

    .mentor-feature-meta {
      margin: 10px 0 18px;
      color: var(--muted);
      font: 500 11px/1.4 var(--font-mono);
    }

    /* Ruled 4-column Metrics Strip */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--line);
    }

    .metric-card {
      min-height: 92px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      padding: 12px 24px;
      border-right: 1px solid var(--line);
    }

    .metric-card:first-child { padding-left: 0; }
    .metric-card:last-child { border-right: 0; }

    .metric-label {
      color: var(--muted);
      font-size: 11px;
    }

    .metric-number {
      color: var(--ink);
      font: 500 26px/1.15 var(--font-display);
      letter-spacing: -0.025em;
    }

    /* Main Content Sections */
    .main-content {
      padding: 64px 0 84px;
    }

    .section-block {
      margin-bottom: 64px;
    }

    .section-header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .section-intro h2 {
      margin: 8px 0 6px;
      font: 400 clamp(28px, 3.5vw, 38px)/1.1 var(--font-display);
      letter-spacing: -0.03em;
    }

    .section-intro p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    /* Ruled People Index Ledger */
    .ledger-list {
      border-top: 1px solid var(--line-strong);
    }

    .ledger-row {
      display: grid;
      grid-template-columns: minmax(200px, 1.1fr) minmax(190px, 1fr) minmax(150px, 0.85fr) auto;
      align-items: center;
      gap: 20px;
      padding: 18px 8px;
      border-bottom: 1px solid var(--line);
      transition: background-color var(--ease);
    }

    .ledger-row:hover {
      background: var(--surface);
    }

    .person-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .avatar-circle {
      position: relative;
      width: 44px;
      height: 44px;
      flex: 0 0 auto;
      border-radius: 50%;
      overflow: hidden;
      background: var(--surface-tint);
    }

    .avatar-circle::after {
      content: attr(data-initials);
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--green);
      font: 500 14px/1 var(--font-display);
    }

    .avatar-circle img {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .person-meta strong,
    .role-cell strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
    }

    .person-meta span,
    .role-cell span {
      display: block;
      font-size: 11px;
      color: var(--muted);
    }

    .tags-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .flat-tag {
      padding: 3px 7px;
      border: 1px solid var(--line);
      color: var(--ink-soft);
      font-size: 10px;
      line-height: 1.3;
    }

    .mentor-note {
      color: var(--green);
      font-size: 11px;
      font-weight: 600;
    }

    .muted-note {
      color: var(--muted);
      font-size: 11px;
    }

    .empty-row {
      padding: 24px 0;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 13px;
    }

    .inline-link {
      color: var(--green);
      text-decoration: underline;
    }

    /* Two-column Dispatches Split */
    .split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      padding-top: 8px;
    }

    .dispatch-panel {
      border-top: 1px solid var(--line-strong);
      padding-top: 20px;
    }

    .dispatch-panel-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .dispatch-panel-head h3 {
      margin: 6px 0 0;
      font: 400 24px/1.15 var(--font-display);
      letter-spacing: -0.02em;
    }

    .dispatch-list {
      list-style: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid var(--line);
    }

    .dispatch-item {
      padding: 14px 0;
      border-bottom: 1px solid var(--line);
    }

    .dispatch-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .dispatch-head strong,
    .dispatch-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
    }

    .dispatch-link:hover {
      color: var(--green);
      text-decoration: underline;
    }

    .mono-meta {
      flex: 0 0 auto;
      color: var(--clay);
      font: 500 10px/1.2 var(--font-mono);
      letter-spacing: 0.04em;
    }

    .dispatch-sub {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
    }

    /* Management Routes Strip */
    .routes-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .route-item {
      padding: 18px 20px;
      border-right: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: background-color var(--ease);
    }

    .route-item:first-child { padding-left: 0; }
    .route-item:last-child { border-right: 0; }
    .route-item:hover { background: var(--surface); }

    .route-item strong {
      font-size: 13px;
      font-weight: 600;
      color: var(--green);
    }

    .route-item span {
      font-size: 11px;
      color: var(--muted);
    }

    /* Footer */
    .footer {
      border-top: 1px solid var(--line);
      padding: 28px 0;
      color: var(--muted);
      font-size: 12px;
    }

    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .footer-left {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .footer-left strong {
      color: var(--ink);
      font-size: 13px;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 18px;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    .footer-links a:hover { color: var(--green); }

    @media (max-width: 960px) {
      .nav-container {
        flex-wrap: wrap;
        padding: 14px 0;
      }
      .primary-nav {
        order: 3;
        flex: 1 1 100%;
        min-width: 0;
        min-height: 42px;
        overflow-x: auto;
      }
      .nav-link {
        flex: 0 0 auto;
        white-space: nowrap;
      }
      .hero-layout > * { min-width: 0; }
      .hero-layout { grid-template-columns: 1fr; padding-bottom: 42px; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .metric-card:nth-child(2n) { border-right: 0; }
      .metric-card { border-bottom: 1px solid var(--line); }
      .ledger-row { grid-template-columns: 1fr 1fr; }
      .split-grid { grid-template-columns: 1fr; gap: 36px; }
      .routes-strip { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 680px) {
      .container, .nav-container { width: calc(100% - 36px); }
      .nav-container {
        min-height: 0;
        flex-wrap: wrap;
        padding: 14px 0 0;
      }
      .primary-nav {
        order: 3;
        display: flex;
        flex: 1 1 100%;
        min-width: 0;
        min-height: 0;
        flex-wrap: wrap;
        gap: 0 4px;
        overflow: visible;
      }
      .nav-link {
        flex: 0 0 auto;
        padding: 8px;
        white-space: nowrap;
      }
      .nav-right {
        gap: 6px;
      }
      .nav-right .btn {
        min-height: 34px;
        padding-inline: 10px;
        font-size: 10px;
      }
      .hero-title { font-size: clamp(30px, 9.5vw, 38px); }
      .mentor-feature { grid-template-columns: 1fr; }
      .mentor-feature-image { min-height: 200px; }
      .metrics-grid, .ledger-row, .routes-strip { grid-template-columns: 1fr; }
      .metric-card, .route-item { padding-left: 0; border-right: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; scroll-behavior: auto !important; }
    }
  </style>
</head>
<body>
  <header class="navbar">
    <div class="nav-container">
      <a class="brand" href="/homepage" aria-label="AlumniSphere Homepage">
        <div class="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div>
          <span class="brand-title">Alumni<span class="highlight">Sphere</span></span>
          <span class="brand-subtitle">ALUMNI NETWORK</span>
        </div>
      </a>

      <nav class="primary-nav" aria-label="Primary navigation">
        <a href="/homepage" class="nav-link active" aria-current="page">Homepage</a>
        <a href="/alumni" class="nav-link">Alumni</a>
        <a href="/announcements" class="nav-link">Announcements</a>
        <a href="/users" class="nav-link">Users</a>
        <a href="/api/swagger" class="nav-link">API</a>
      </nav>

      <div class="nav-right">
        <button id="themeToggleBtn" class="theme-toggle-btn" type="button" aria-label="Toggle theme">
          <svg class="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span id="themeLabel">Dark</span>
        </button>
        <a href="http://localhost:3000" class="btn btn-primary">Open Directory</a>
      </div>
    </div>
  </header>

  <section class="hero-section">
    <div class="container hero-layout">
      <div>
        <div class="hero-badge">
          <span class="hero-badge-mark"></span>
          <span>THE ALUMNI NETWORK</span>
          <span class="hero-badge-year">BEYOND CAMPUS</span>
        </div>
        <h1 class="hero-title">Beyond commencement,<br><em>the story carries on.</em></h1>
        <p class="hero-subtitle">
          A lasting connection between graduates, students, and the opportunities that move them forward.
          Explore career trajectories, connect with mentors, and follow campus dispatches.
        </p>
        <div class="hero-actions">
          <a href="http://localhost:3000" class="btn btn-primary">Open Web Directory</a>
          <a href="/alumni" class="text-link">Browse alumni records <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <aside class="mentor-feature" aria-labelledby="spotlightHeading">
        <div class="mentor-feature-image" data-initials="${mentorInitials}">
          ${mentorAvatar ? `<img src="${mentorAvatar}" alt="${this.escapeHtml(mentorName)}" loading="lazy" onerror="this.remove()">` : ''}
        </div>
        <div class="mentor-feature-content">
          <span class="section-kicker">A NOTE FROM THE NETWORK</span>
          <h2 id="spotlightHeading">${this.escapeHtml(mentorName)}</h2>
          <p>${this.escapeHtml(mentorRole)}</p>
          <div class="mentor-feature-meta">${this.escapeHtml(mentorMeta)}</div>
          <a href="/alumni" class="text-link">Meet mentors <span aria-hidden="true">↗</span></a>
        </div>
      </aside>
    </div>

    <div class="container metrics-grid" aria-label="Network metrics">
      <div class="metric-card">
        <span class="metric-label">In the network</span>
        <strong class="metric-number">${totalAlumni}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Open to mentoring</span>
        <strong class="metric-number">${mentorsAvailable}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Active opportunities</span>
        <strong class="metric-number">${activeJobs}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">Campus announcements</span>
        <strong class="metric-number">${totalAnnouncements}</strong>
      </div>
    </div>
  </section>

  <main class="container main-content">
    <section class="section-block" aria-labelledby="peopleHeading">
      <div class="section-header-row">
        <div class="section-intro">
          <span class="section-kicker">THE PEOPLE INDEX</span>
          <h2 id="peopleHeading">Graduates across industries.</h2>
          <p>Look up classmates, explore career paths, and find alumni open to advising students.</p>
        </div>
        <a href="/alumni/new" class="btn btn-outline">Register profile</a>
      </div>

      <div class="ledger-list">
        ${alumniRowsHtml}
      </div>
    </section>

    <section class="section-block split-grid" aria-label="Opportunities and Campus Dispatches">
      <div class="dispatch-panel">
        <div class="dispatch-panel-head">
          <div>
            <span class="section-kicker">OPPORTUNITIES, SHARED</span>
            <h3>Recent career openings</h3>
          </div>
          <a href="/api/jobs" class="text-link">JSON feed <span>↗</span></a>
        </div>
        <ul class="dispatch-list">
          ${jobsListHtml}
        </ul>
      </div>

      <div class="dispatch-panel">
        <div class="dispatch-panel-head">
          <div>
            <span class="section-kicker">FROM CAMPUS</span>
            <h3>Latest announcements</h3>
          </div>
          <a href="/announcements" class="text-link">All bulletins <span>→</span></a>
        </div>
        <ul class="dispatch-list">
          ${announcementsListHtml}
        </ul>
      </div>
    </section>

    <section aria-label="Platform routes">
      <div class="section-header-row">
        <div class="section-intro">
          <span class="section-kicker">ADMINISTRATION & API</span>
          <h2>Management surfaces</h2>
        </div>
      </div>
      <div class="routes-strip">
        <a href="/alumni" class="route-item">
          <strong>Alumni Records ↗</strong>
          <span>Server-rendered graduate directory</span>
        </a>
        <a href="/announcements" class="route-item">
          <strong>Announcements ↗</strong>
          <span>Campus events & bulletins CRUD</span>
        </a>
        <a href="/users" class="route-item">
          <strong>User Accounts ↗</strong>
          <span>Admin, alumni & student accounts</span>
        </a>
        <a href="/api/swagger" class="route-item">
          <strong>Swagger / OpenAPI ↗</strong>
          <span>Interactive REST API specification</span>
        </a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-left">
        <strong>AlumniSphere</strong>
        <span>Connections that outlast graduation.</span>
      </div>
      <div class="footer-links">
        <a href="/api/health">health</a>
        <a href="/api/stats">stats</a>
        <a href="/api/swagger">swagger</a>
        <a href="/404">404 view</a>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      const root = document.documentElement;
      const toggleBtn = document.getElementById('themeToggleBtn');
      const themeLabel = document.getElementById('themeLabel');

      function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('alumni_theme', theme);
        themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
      }

      const saved = localStorage.getItem('alumni_theme') || 'light';
      applyTheme(saved);

      toggleBtn.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    })();
  </script>
</body>
</html>`;
  }
}

module.exports = HomepageView;
