module.exports = `
  :root {
    color-scheme: light;
    --bg-primary: #ffffff;
    --bg-surface: #f7f8f7;
    --bg-card: #ffffff;
    --border: #e6e8e7;
    --accent: #007b62;
    --accent-glow: rgba(0, 212, 164, 0.14);
    --accent-dark: #00b48a;
    --text-main: #111412;
    --text-muted: #68706c;
    --success: #007b62;
    --danger: #b83e3e;
    --warning: #8c5a0a;
    --purple: #52667d;
  }

  html {
    min-width: 320px;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--text-main);
    background: #fff;
  }

  body {
    min-width: 320px;
    padding: 28px clamp(16px, 4vw, 48px);
    color: var(--text-main);
    background: #fff;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  .container {
    width: min(1200px, 100%);
    max-width: 1200px;
  }

  .container-narrow {
    width: min(680px, 100%);
  }

  .top-nav {
    width: min(1200px, 100%);
    gap: 18px;
    padding: 12px 0 18px;
    margin-bottom: 42px;
    border: 0;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    background: #fff;
    backdrop-filter: none;
  }

  .nav-brand {
    gap: 10px;
    color: var(--text-main);
    font-size: 15px;
    letter-spacing: -0.035em;
    white-space: nowrap;
  }

  .brand-mark {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    background: #111412;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .metric-card.admin .metric-value,
  .metric-card.urgent .metric-value {
    color: #a63232;
  }

  .metric-card.alumni .metric-value,
  .metric-card.career .metric-value {
    color: var(--accent);
  }

  .metric-card.student .metric-value,
  .metric-card.event .metric-value {
    color: var(--text-main);
  }

  .brand-subtitle {
    margin-left: 5px;
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
  }

  .nav-links {
    gap: 3px;
  }

  .nav-link {
    position: relative;
    padding: 9px 10px;
    border: 0;
    border-radius: 0;
    color: var(--text-muted);
    font-size: 12px;
    transition: color 160ms ease;
  }

  .nav-link:hover {
    color: var(--text-main);
    background: transparent;
  }

  .nav-link.active {
    border: 0;
    color: var(--text-main);
    background: transparent;
  }

  .nav-link.active::after {
    position: absolute;
    right: 10px;
    bottom: -19px;
    left: 10px;
    height: 2px;
    background: #00b98d;
    content: "";
  }

  .db-status-badge {
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 550;
  }

  .db-status-badge.connected {
    border: 1px solid #cceee4;
    color: #007b62;
    background: #f1fbf7;
  }

  .db-status-badge.fallback {
    border: 1px solid #eadfca;
    color: #79500d;
    background: #fffaf0;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    box-shadow: none;
  }

  .dashboard-header,
  .header-bar {
    margin-bottom: 28px;
  }

  .page-title,
  .dashboard-header h1 {
    color: var(--text-main);
    background: none;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: clamp(26px, 3vw, 34px);
    font-weight: 600;
    letter-spacing: -0.045em;
    line-height: 1.15;
    -webkit-text-fill-color: currentColor;
  }

  .page-subtitle,
  .subtitle {
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.65;
  }

  .metrics-bar,
  .stats-grid {
    gap: 0;
    margin-bottom: 28px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: #fff;
  }

  .metric-card,
  .stat-card {
    min-width: 0;
    padding: 15px 18px;
    border: 0;
    border-right: 1px solid var(--border);
    border-radius: 0;
    background: #fff;
    box-shadow: none;
    transition: none;
  }

  .metric-card:last-child,
  .stat-card:last-child {
    border-right: 0;
  }

  .metric-card:hover {
    transform: none;
    box-shadow: none;
  }

  .metric-label,
  .stat-label {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
  }

  .metric-value,
  .stat-value {
    color: var(--text-main);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 23px;
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .main-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 22px;
  }

  .main-grid > * {
    min-width: 0;
  }

  .card,
  .glass-card,
  .announcement-content-box {
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    box-shadow: none;
    backdrop-filter: none;
  }

  .card,
  .glass-card {
    min-width: 0;
    max-width: 100%;
    padding: 22px;
  }

  .card-header {
    flex-wrap: wrap;
    min-width: 0;
    border-bottom-color: var(--border);
  }

  .card-title {
    color: var(--text-main);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  .route-badge,
  .badge-pill {
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text-muted);
    background: var(--bg-surface);
  }

  .route-badge {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .alert {
    border-radius: 6px;
    box-shadow: none;
  }

  .form-label {
    color: #383f3b;
    font-size: 12px;
    font-weight: 550;
  }

  label {
    color: #383f3b;
  }

  .form-control,
  .search-input-wrap input,
  input,
  select,
  textarea {
    min-height: 40px;
    border: 1px solid #dfe3e1;
    border-radius: 6px;
    color: var(--text-main);
    background: #fff;
    font: inherit;
    box-shadow: none;
  }

  .form-control:focus,
  .search-input-wrap input:focus,
  input:focus,
  select:focus,
  textarea:focus {
    border-color: #00a981;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(0, 185, 141, 0.12);
  }

  input[type="checkbox"] {
    min-height: auto;
    accent-color: #007b62;
  }

  .btn,
  .btn-action,
  .btn-link,
  .btn-submit,
  button.btn-submit {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid #dfe3e1;
    border-radius: 999px;
    color: #272c29;
    background: #fff;
    box-shadow: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 550;
    transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
  }

  .btn:hover,
  .btn-action:hover,
  .btn-link:hover,
  .btn-submit:hover,
  button.btn-submit:hover {
    transform: none;
    border-color: #b9c3be;
    color: #111412;
    background: #f7f8f7;
    box-shadow: none;
  }

  .btn-primary {
    border-color: #111412;
    color: #fff;
    background: #111412;
  }

  .btn-submit,
  button.btn-submit {
    border-color: #111412;
    color: #fff;
    background: #111412;
    background-image: none;
    box-shadow: none;
  }

  .btn-submit:hover,
  button.btn-submit:hover {
    border-color: #333936;
    color: #fff;
    background: #333936;
    background-image: none;
    box-shadow: none;
  }

  .btn-submit:disabled,
  button.btn-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .btn-primary:hover {
    border-color: #333936;
    color: #fff;
    background: #333936;
  }

  .btn-secondary,
  .btn-outline {
    border-color: #dfe3e1;
    color: #272c29;
    background: #fff;
  }

  .btn-secondary:hover,
  .btn-outline:hover {
    border-color: #b9c3be;
    color: #111412;
    background: #f7f8f7;
  }

  .btn-danger,
  .btn-action.btn-danger {
    border-color: #f0d7d7;
    color: #a63232;
    background: #fff;
  }

  .btn-danger:hover,
  .btn-action.btn-danger:hover {
    border-color: #e7bcbc;
    color: #922b2b;
    background: #fff5f5;
  }

  .table-container,
  .table-responsive {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: #fff;
  }

  table {
    width: 100%;
    min-width: 620px;
    border-collapse: collapse;
    background: #fff;
  }

  th {
    padding: 11px 13px;
    border-bottom: 1px solid var(--border);
    color: var(--text-muted);
    background: #fafbfa;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.045em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td {
    padding: 12px 13px;
    border-bottom: 1px solid #eef0ef;
    color: #303633;
    font-size: 12px;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: #fafbfa;
  }

  .user-avatar,
  .alumni-avatar {
    border-radius: 50%;
    color: #006d56;
    background: #e8f7f2;
  }

  .user-name,
  .alumni-name,
  .announcement-title a {
    color: var(--text-main);
    font-weight: 550;
  }

  .user-name a,
  .announcement-title a {
    color: var(--text-main);
  }

  .user-name a:hover,
  .announcement-title a:hover {
    color: var(--accent);
  }

  .user-id,
  .user-email,
  .user-dept,
  .text-muted,
  .announcement-meta {
    color: var(--text-muted);
  }

  .role-badge,
  .badge,
  .skill-tag,
  .flat-tag {
    padding: 4px 8px;
    border: 1px solid #e3e7e5;
    border-radius: 999px;
    color: #49514d;
    background: #f7f8f7;
    font-size: 10px;
    font-weight: 550;
  }

  .role-admin,
  .badge-event,
  .badge-mentor {
    border-color: #d5ece4;
    color: #006e56;
    background: #f1faf6;
  }

  .role-alumni,
  .badge-career,
  .badge-dept {
    border-color: #dfe7ed;
    color: #40596c;
    background: #f5f8fa;
  }

  .role-student,
  .badge-academic,
  .badge-general {
    border-color: #e3e7e5;
    color: #535b56;
    background: #f7f8f7;
  }

  .priority-urgent,
  .priority-high {
    color: #a63232;
    background: #fff5f5;
  }

  .priority-normal {
    color: #4f5953;
    background: #f7f8f7;
  }

  .pin-badge {
    padding: 3px 7px;
    border: 1px solid #d5ece4;
    border-radius: 999px;
    color: #006e56;
    background: #f1faf6;
    font-size: 9px;
    font-weight: 600;
  }

  .profile-meta-grid {
    gap: 0;
    border-top: 1px solid var(--border);
  }

  .meta-item {
    padding: 14px 0;
    border: 0;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    background: transparent;
  }

  .meta-title {
    color: var(--text-muted);
  }

  .meta-val {
    color: var(--text-main);
  }

  .announcement-content-box {
    padding: 18px;
    color: #343a36;
    line-height: 1.7;
  }

  .breadcrumb-nav,
  .breadcrumb-nav a {
    color: var(--text-muted);
  }

  .breadcrumb-nav a:hover {
    color: var(--accent);
  }

  .links-bar {
    gap: 8px;
  }

  :focus-visible {
    outline: 2px solid #00a981;
    outline-offset: 2px;
  }

  @media (max-width: 900px) {
    .main-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .top-nav {
      align-items: flex-start;
    }

    .nav-links {
      flex: 1 1 100%;
      order: 3;
      overflow: visible;
      flex-wrap: wrap;
      padding-bottom: 0;
    }

    .nav-link {
      flex: 0 0 auto;
      padding-inline: 8px;
      white-space: nowrap;
    }

    .nav-link.active::after {
      bottom: -3px;
    }

    .metrics-bar,
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    body {
      padding: 18px 14px 28px;
    }

    .top-nav {
      margin-bottom: 28px;
      gap: 8px 12px;
    }

    .db-status-badge {
      font-size: 9px;
    }

    .metric-card,
    .stat-card {
      padding: 12px;
      border-bottom: 1px solid var(--border);
    }

    .metric-card:nth-child(2n),
    .stat-card:nth-child(2n) {
      border-right: 0;
    }

    .metric-card:last-child,
    .stat-card:last-child {
      border-bottom: 0;
    }

    .card,
    .glass-card {
      padding: 16px;
    }

    .profile-meta-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .form-actions,
    .links-bar {
      justify-content: flex-start;
    }
  }
`;
