/**
 * HomepageView
 *
 * Server-side rendered (SSR) presentation layer for the AlumniSphere Homepage.
 * Conforms to the project MVC architecture and visual design system.
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
   * Render the Homepage HTML Document
   * @param {Object} [options]
   * @param {Object} [options.stats]
   * @param {number} [options.stats.totalAlumni]
   * @param {number} [options.stats.mentorsAvailable]
   * @param {number} [options.stats.activeJobs]
   * @param {number} [options.stats.totalAnnouncements]
   * @returns {string} Complete HTML document
   */
  static renderHomepage({ stats = {} } = {}) {
    const totalAlumni = Number(stats.totalAlumni ?? 0);
    const mentorsAvailable = Number(stats.mentorsAvailable ?? 0);
    const activeJobs = Number(stats.activeJobs ?? 0);
    const totalAnnouncements = Number(stats.totalAnnouncements ?? 0);

    return `<!DOCTYPE html>
<html lang="tr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AlumniSphere | Mezun Takip ve Kariyer Ağı</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #090d16;
      --bg-secondary: #0f172a;
      --bg-card: rgba(30, 41, 59, 0.65);
      --bg-card-hover: rgba(30, 41, 59, 0.9);
      --border-color: rgba(148, 163, 184, 0.16);
      --border-hover: rgba(56, 189, 248, 0.45);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent: #38bdf8;
      --accent-2: #818cf8;
      --accent-glow: rgba(56, 189, 248, 0.18);
      --success: #34d399;
      --nav-bg: rgba(9, 13, 22, 0.78);
      --shadow: 0 18px 40px -15px rgba(0, 0, 0, 0.55);
    }

    html[data-theme="light"] {
      --bg-primary: #f8fafc;
      --bg-secondary: #eef2ff;
      --bg-card: rgba(255, 255, 255, 0.85);
      --bg-card-hover: #ffffff;
      --border-color: rgba(15, 23, 42, 0.1);
      --border-hover: rgba(14, 165, 233, 0.45);
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --accent: #0284c7;
      --accent-2: #4f46e5;
      --accent-glow: rgba(2, 132, 199, 0.12);
      --success: #059669;
      --nav-bg: rgba(248, 250, 252, 0.85);
      --shadow: 0 16px 35px -15px rgba(15, 23, 42, 0.14);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 18% 12%, var(--accent-glow) 0%, transparent 42%),
                  radial-gradient(circle at 84% 18%, rgba(129, 140, 248, 0.14) 0%, transparent 40%),
                  linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      transition: background 0.25s ease, color 0.25s ease;
    }

    a { color: inherit; text-decoration: none; }

    .container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Navbar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--nav-bg);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border-color);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      height: 68px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      display: grid;
      place-items: center;
      box-shadow: 0 6px 18px rgba(56, 189, 248, 0.28);
    }

    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      letter-spacing: -0.02em;
    }

    .brand-name span { color: var(--accent); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .nav-link {
      padding: 0.48rem 0.85rem;
      border-radius: 9px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-card);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .theme-btn {
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 0.45rem 0.8rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: border-color 0.2s ease, transform 0.15s ease;
    }

    .theme-btn:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }

    /* Hero */
    .hero {
      padding: 4.25rem 0 2.75rem;
      text-align: center;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.95rem;
      border-radius: 999px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 1.4rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2);
    }

    .hero h1 {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.15rem, 4.6vw, 3.5rem);
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.03em;
      max-width: 820px;
      margin: 0 auto 1.2rem;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      max-width: 660px;
      margin: 0 auto 2rem;
      font-size: 1.08rem;
      color: var(--text-secondary);
    }

    .hero-cta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.78rem 1.4rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .btn:hover { transform: translateY(-2px); }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      box-shadow: 0 10px 25px -8px rgba(56, 189, 248, 0.5);
    }

    .btn-secondary {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .btn-secondary:hover { border-color: var(--border-hover); }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 2.5rem 0 3.25rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.35rem 1.25rem;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
    }

    .stat-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      margin-top: 0.3rem;
      color: var(--text-primary);
    }

    /* Section Header */
    .section-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .section-head h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .section-head p {
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    /* Modules Grid */
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.15rem;
      margin-bottom: 3.5rem;
    }

    .module-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .module-card:hover {
      transform: translateY(-3px);
      border-color: var(--border-hover);
      background: var(--bg-card-hover);
    }

    .module-icon {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      background: var(--accent-glow);
      color: var(--accent);
      display: grid;
      place-items: center;
      font-size: 1.25rem;
    }

    .module-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.12rem;
      font-weight: 700;
    }

    .module-card p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      flex: 1;
    }

    .module-link {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--accent);
      margin-top: 0.3rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* Live Preview Split */
    .preview-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
    }

    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
    }

    .panel-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-title a {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.82rem;
      color: var(--accent);
      font-weight: 600;
    }

    .list-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .list-item {
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: rgba(15, 23, 42, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    html[data-theme="light"] .list-item {
      background: rgba(241, 245, 249, 0.7);
    }

    .item-main strong {
      display: block;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .item-main span {
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .pill {
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: var(--accent-glow);
      color: var(--accent);
      white-space: nowrap;
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border-color);
      padding: 1.75rem 0;
      color: var(--text-muted);
      font-size: 0.88rem;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-links {
      display: flex;
      gap: 1.15rem;
      flex-wrap: wrap;
    }

    .footer-links a:hover { color: var(--accent); }

    @media (max-width: 960px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .modules-grid { grid-template-columns: repeat(2, 1fr); }
      .preview-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .stats-grid { grid-template-columns: 1fr; }
      .modules-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="navbar">
    <div class="container nav-inner">
      <a href="/homepage" class="brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <span class="brand-name">Alumni<span>Sphere</span></span>
      </a>

      <nav class="nav-links" aria-label="Primary Navigation">
        <a href="/alumni" class="nav-link">Mezunlar</a>
        <a href="/announcements" class="nav-link">Duyurular</a>
        <a href="/users" class="nav-link">Kullanıcılar</a>
        <a href="/api/swagger" class="nav-link">Swagger API</a>
      </nav>

      <div class="nav-actions">
        <button id="themeToggle" class="theme-btn" type="button" aria-label="Tema Değiştir">
          <span id="themeIcon">☀️</span>
          <span id="themeText">Açık Tema</span>
        </button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <div class="hero-badge">
        <span class="pulse-dot"></span>
        <span>Alumni Tracking System • Node.js & PostgreSQL</span>
      </div>
      <h1>Üniversite ve Mezunlar Arasındaki <span class="gradient-text">Kariyer ve Mentorluk</span> Köprüsü</h1>
      <p>
        Mezunların kariyer gelişimlerini takip edin, öğrencilerle deneyimli mentorları buluşturun,
        iş ve staj fırsatlarını yönetin ve kurumsal duyuruları tek merkezden paylaşın.
      </p>
      <div class="hero-cta">
        <a href="/alumni" class="btn btn-primary">🎓 Mezun Rehberini Keşfet</a>
        <a href="http://localhost:3000" class="btn btn-secondary">🚀 Web SPA Dashboard</a>
        <a href="/api/swagger" class="btn btn-secondary">📖 API Dokümantasyonu</a>
      </div>
    </section>

    <section class="stats-grid" aria-label="Platform İstatistikleri">
      <div class="stat-card">
        <div class="stat-label">Kayıtlı Mezun</div>
        <div class="stat-value" id="statAlumni">${totalAlumni}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Aktif Mentor</div>
        <div class="stat-value" id="statMentors">${mentorsAvailable}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Kariyer İlanı</div>
        <div class="stat-value" id="statJobs">${activeJobs}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Duyuru & Etkinlik</div>
        <div class="stat-value" id="statAnnouncements">${totalAnnouncements}</div>
      </div>
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>Platform Modülleri</h2>
          <p>MVC mimarisiyle modüler olarak geliştirilen temel yönetim ve keşif ekranları</p>
        </div>
      </div>

      <div class="modules-grid">
        <a href="/alumni" class="module-card">
          <div class="module-icon">🎓</div>
          <h3>Mezun Profilleri (Alumni)</h3>
          <p>Mezuniyet yılı, bölüm, şirket ve yeteneklere göre filtreleme yapın, yeni mezun kaydı oluşturun.</p>
          <span class="module-link">Mezunları Görüntüle →</span>
        </a>

        <a href="/announcements" class="module-card">
          <div class="module-icon">📢</div>
          <h3>Duyuru ve Etkinlikler</h3>
          <p>Kariyer günleri, mezun buluşmaları ve akademik duyuruları öncelik etiketleriyle yayınlayın.</p>
          <span class="module-link">Duyurulara Git →</span>
        </a>

        <a href="/users" class="module-card">
          <div class="module-icon">👥</div>
          <h3>Kullanıcı Yönetimi</h3>
          <p>Admin, mezun ve öğrenci rollerindeki hesapları oluşturun, güncelleyin ve yönetin.</p>
          <span class="module-link">Kullanıcıları Yönet →</span>
        </a>

        <a href="/api/jobs" class="module-card">
          <div class="module-icon">💼</div>
          <h3>İş & Staj İlanları API</h3>
          <p>Mezunlar ve partner şirketler tarafından paylaşılan tam zamanlı ve staj fırsatlarını inceleyin.</p>
          <span class="module-link">/api/jobs JSON →</span>
        </a>

        <a href="/api/swagger" class="module-card">
          <div class="module-icon">📖</div>
          <h3>Swagger / OpenAPI 3.0</h3>
          <p>Tüm REST uç noktalarını tarayıcı üzerinden test edin ve veri şemalarını inceleyin.</p>
          <span class="module-link">Swagger UI Aç →</span>
        </a>

        <a href="/api/health" class="module-card">
          <div class="module-icon">🛡️</div>
          <h3>Guardian & Sistem Sağlığı</h3>
          <p>404/5xx Guardian hata yakalayıcıları, istek loglama ve gerçek zamanlı servis durumu.</p>
          <span class="module-link">Sağlık Durumu →</span>
        </a>
      </div>
    </section>

    <section class="preview-grid" aria-label="Canlı Önizleme">
      <div class="panel">
        <div class="panel-title">
          <span>Öne Çıkan Mezunlar</span>
          <a href="/alumni">Tümünü Gör →</a>
        </div>
        <div class="list-stack" id="alumniPreview">
          <div class="list-item">
            <div class="item-main">
              <strong>Yükleniyor...</strong>
              <span>Mezun verileri API üzerinden alınıyor</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          <span>Son Duyurular</span>
          <a href="/announcements">Tümünü Gör →</a>
        </div>
        <div class="list-stack" id="announcementsPreview">
          <div class="list-item">
            <div class="item-main">
              <strong>Yükleniyor...</strong>
              <span>Duyurular API üzerinden alınıyor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <div>© 2026 AlumniSphere — Alumni Tracking System</div>
      <div class="footer-links">
        <a href="/api/health">Health</a>
        <a href="/api/stats">Stats JSON</a>
        <a href="/api/swagger">Swagger</a>
        <a href="/sum">Calculator</a>
        <a href="/404">404 View</a>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      const root = document.documentElement;
      const toggleBtn = document.getElementById('themeToggle');
      const themeIcon = document.getElementById('themeIcon');
      const themeText = document.getElementById('themeText');

      function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('alumni_homepage_theme', theme);
        if (theme === 'light') {
          themeIcon.textContent = '🌙';
          themeText.textContent = 'Koyu Tema';
        } else {
          themeIcon.textContent = '☀️';
          themeText.textContent = 'Açık Tema';
        }
      }

      const saved = localStorage.getItem('alumni_homepage_theme') || 'dark';
      applyTheme(saved);

      toggleBtn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
      }

      fetch('/api/alumni')
        .then((r) => r.json())
        .then((payload) => {
          const list = Array.isArray(payload) ? payload : (payload.data || payload.alumni || []);
          const container = document.getElementById('alumniPreview');
          if (!list.length) {
            container.innerHTML = '<div class="list-item"><div class="item-main"><strong>Henüz mezun kaydı yok</strong><span>Yeni mezun eklemek için Mezunlar sayfasına gidin</span></div></div>';
            return;
          }
          container.innerHTML = list.slice(0, 4).map((a) => \`
            <div class="list-item">
              <div class="item-main">
                <strong>\${escapeHtml(a.name)}</strong>
                <span>\${escapeHtml(a.role || 'Mezun')} • \${escapeHtml(a.company || 'Bağımsız')} (\${escapeHtml(a.graduationYear || '')})</span>
              </div>
              <span class="pill">\${a.isMentor ? 'Mentor' : escapeHtml(a.department || 'Mezun')}</span>
            </div>
          \`).join('');
        })
        .catch(() => {});

      fetch('/api/announcements')
        .then((r) => r.json())
        .then((payload) => {
          const list = Array.isArray(payload) ? payload : (payload.data || payload.announcements || []);
          const container = document.getElementById('announcementsPreview');
          if (!list.length) {
            container.innerHTML = '<div class="list-item"><div class="item-main"><strong>Duyuru bulunamadı</strong><span>Yeni duyuru eklemek için Duyurular sayfasına gidin</span></div></div>';
            return;
          }
          container.innerHTML = list.slice(0, 4).map((ann) => \`
            <div class="list-item">
              <div class="item-main">
                <strong>\${escapeHtml(ann.title)}</strong>
                <span>\${escapeHtml(ann.author || 'Alumni Staff')}</span>
              </div>
              <span class="pill">\${escapeHtml(ann.category || 'GENERAL')}</span>
            </div>
          \`).join('');
        })
        .catch(() => {});
    })();
  </script>
</body>
</html>`;
  }
}

module.exports = HomepageView;
