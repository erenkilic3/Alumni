/**
 * NotFoundView
 *
 * Server-side rendered (SSR) presentation layer for the Generic 404 Page.
 * Uses AlumniSphere's Mintlify-inspired design system.
 */

class NotFoundView {
  /**
   * Escape HTML to prevent XSS in view rendering
   * @param {string} str
   * @returns {string}
   */
  static escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Render Generic 404 HTML Page
   * @param {Object} options
   * @param {string} [options.route] - The invalid route that was requested
   * @param {string} [options.method] - The HTTP method used (GET, POST, etc.)
   * @param {string} [options.reason] - Descriptive reason why the 404 occurred
   * @returns {string} Complete HTML document
   */
  static renderNotFoundPage({ route = '', method = 'GET', reason = '' } = {}) {
    const safeRoute = this.escapeHtml(route);
    const safeMethod = this.escapeHtml(method || 'GET');
    const defaultReason = 'Aradığınız sayfa taşınmış, silinmiş veya adı değiştirilmiş olabilir. Lütfen adresi kontrol edin veya aşağıdaki bağlantıları kullanarak devam edin.';
    const safeReason = this.escapeHtml(reason || defaultReason);

    return `<!DOCTYPE html>
<html lang="tr" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — Sayfa Bulunamadı | AlumniSphere</title>
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
      --clay: #65746d;
      --clay-wash: #f1f5f3;
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
      --clay: #9ba8a2;
      --clay-wash: #242a27;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      background: var(--paper);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      transition: background-color var(--ease), color var(--ease);
    }

    a { color: inherit; text-decoration: none; }

    .container {
      width: min(1200px, calc(100% - 64px));
      margin-inline: auto;
    }

    .navbar {
      border-bottom: 1px solid var(--line);
      background: var(--paper);
    }

    .nav-container {
      width: min(1200px, calc(100% - 64px));
      margin-inline: auto;
      min-height: 78px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 11px;
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

    main {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 48px 0;
    }

    .error-frame {
      width: min(720px, 100%);
      margin-inline: auto;
      background: var(--surface);
      border: 1px solid var(--line);
      padding: 48px 40px;
    }

    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--clay);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .kicker-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--clay);
    }

    .error-code {
      font: 400 clamp(64px, 10vw, 96px)/0.95 var(--font-display);
      letter-spacing: -0.04em;
      color: var(--green);
      margin-bottom: 12px;
    }

    .error-title {
      font: 400 clamp(26px, 4vw, 36px)/1.12 var(--font-display);
      letter-spacing: -0.025em;
      color: var(--ink);
      margin-bottom: 20px;
    }

    .route-chip {
      display: inline-block;
      padding: 8px 12px;
      background: var(--surface-tint);
      border: 1px solid var(--line);
      font: 500 12px/1.4 var(--font-mono);
      color: var(--ink-soft);
      margin-bottom: 20px;
      word-break: break-all;
    }

    .route-chip strong {
      color: var(--green);
      margin-right: 8px;
    }

    .reason-box {
      padding: 16px 20px;
      background: var(--surface-raised);
      border: 1px solid var(--line);
      border-left: 3px solid var(--clay);
      margin-bottom: 28px;
    }

    .reason-label {
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--clay);
      margin-bottom: 6px;
    }

    .reason-text {
      font-size: 14px;
      color: var(--ink-soft);
      line-height: 1.65;
    }

    .actions-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding-top: 8px;
    }

    .btn {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--ease), border-color var(--ease), color var(--ease);
    }

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

    .footer-note {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
      font-size: 12px;
      color: var(--muted);
    }

    .footer-note a {
      color: var(--green);
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .container, .nav-container { width: calc(100% - 36px); }
      .error-frame { padding: 32px 22px; }
      .actions-row { flex-direction: column; }
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
    </div>
  </header>

  <main class="container">
    <section class="error-frame" aria-labelledby="errorHeading">
      <div class="kicker">
        <span class="kicker-dot"></span>
        <span>404 Guardian</span>
      </div>

      <div class="error-code">404</div>
      <h1 id="errorHeading" class="error-title">Sayfa veya kaynak bulunamadı.</h1>

      ${safeRoute ? `<div class="route-chip"><strong>${safeMethod}</strong>${safeRoute}</div>` : ''}

      <div class="reason-box">
        <div class="reason-label">Gerekçe / Reason</div>
        <div class="reason-text">${safeReason}</div>
      </div>

      <div class="actions-row">
        <a href="/homepage" class="btn btn-primary">Ana Sayfa (Homepage)</a>
        <a href="/alumni" class="btn btn-outline">Mezunlar</a>
        <a href="/announcements" class="btn btn-outline">Duyurular</a>
        <a href="/users" class="btn btn-outline">Kullanıcılar</a>
        <a href="/api/swagger" class="btn btn-outline">API Docs</a>
      </div>

      <div class="footer-note">
        AlumniSphere &middot; Sorun devam ederse <a href="/api/health">Sistem Sağlık Durumu</a> bağlantısını inceleyin.
      </div>
    </section>
  </main>

  <script>
    (function () {
      const saved = localStorage.getItem('alumni_theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
    })();
  </script>
</body>
</html>`;
  }
}

module.exports = NotFoundView;
