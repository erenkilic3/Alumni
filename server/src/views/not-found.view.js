/**
 * NotFoundView
 *
 * Server-side rendered (SSR) presentation layer for the Generic 404 Page.
 * Conforms to the project MVC architecture and visual design system.
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
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Sayfa Bulunamadı | AlumniSphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 45%, #090d16 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-x: hidden;
    }
    .background-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(2, 132, 199, 0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0;
      pointer-events: none;
    }
    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 620px;
      text-align: center;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3.5rem 2.5rem;
      box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.7);
      transition: transform 0.3s ease;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .error-code {
      font-family: 'Outfit', sans-serif;
      font-size: 7.5rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      letter-spacing: -0.04em;
    }
    .error-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 1rem;
    }
    .route-chip {
      display: inline-block;
      background: #090d16;
      border: 1px solid #334155;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
      color: #94a3b8;
      margin-bottom: 1.5rem;
      word-break: break-all;
    }
    .route-chip strong {
      color: #38bdf8;
      margin-right: 0.35rem;
    }
    .reason-box {
      background: rgba(15, 23, 42, 0.75);
      border-left: 4px solid #38bdf8;
      border-radius: 0 12px 12px 0;
      padding: 1.1rem 1.35rem;
      text-align: left;
      margin-bottom: 2.25rem;
    }
    .reason-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
      margin-bottom: 0.35rem;
    }
    .reason-text {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.75rem 1.1rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px 0 rgba(2, 132, 199, 0.35);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(2, 132, 199, 0.45);
    }
    .btn-secondary {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #1e293b;
      border-color: #38bdf8;
      color: #ffffff;
      transform: translateY(-2px);
    }
    .footer-note {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 1rem;
    }
    .footer-note a {
      color: #38bdf8;
      text-decoration: none;
    }
    .footer-note a:hover {
      text-decoration: underline;
    }
    @media (max-width: 640px) {
      .card { padding: 2.25rem 1.5rem; }
      .error-code { font-size: 5.5rem; }
      .error-title { font-size: 1.4rem; }
      .actions-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="background-glow"></div>
  <div class="container">
    <div class="card">
      <div class="badge">
        <span class="badge-dot"></span>
        <span>404 Guardian</span>
      </div>

      <div class="error-code">404</div>
      <h1 class="error-title">Sayfa veya Kaynak Bulunamadı</h1>

      ${safeRoute ? `<div class="route-chip"><strong>${safeMethod}</strong>${safeRoute}</div>` : ''}

      <div class="reason-box">
        <div class="reason-label">Gerekçe / Reason</div>
        <div class="reason-text">${safeReason}</div>
      </div>

      <div class="actions-grid">
        <a href="/" class="btn btn-primary">🏠 Ana Sayfa</a>
        <a href="/users" class="btn btn-secondary">👥 Kullanıcılar</a>
        <a href="/announcements" class="btn btn-secondary">📢 Duyurular</a>
        <a href="/api/swagger" class="btn btn-secondary">📖 API Docs</a>
      </div>

      <div class="footer-note">
        AlumniSphere platformu &bull; Sorun devam ederse <a href="/api/health">Sistem Sağlık Durumu</a> sayfasını inceleyin.
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = NotFoundView;

