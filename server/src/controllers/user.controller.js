const UserModel = require('../models/user.model');

/**
 * UserController
 *
 * Web/View Controller for User management.
 * Renders server-side HTML views, handles form submissions, and supports
 * interactive in-browser CRUD workflows.
 */
class UserController {
  constructor(model = UserModel) {
    this.model = model;

    // Bind methods for Express route dispatching
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.renderUsersPage = this.renderUsersPage.bind(this);
  }

  /**
   * Helper to escape HTML and prevent XSS injection
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * GET /users or browser GET /api/users
   * READ ALL: Display the interactive user management dashboard
   */
  index(req, res) {
    try {
      const users = this.model.findAll();
      return res.send(this.renderUsersPage(users));
    } catch (err) {
      return res.status(500).send(this.renderUsersPage([], null, 'Error loading users: ' + err.message));
    }
  }

  /**
   * GET /users/:id
   * READ ONE: Display or return single user details
   */
  show(req, res) {
    try {
      const { id } = req.params;
      const user = this.model.findById(id);

      if (!user) {
        return res.status(404).send(this.renderUsersPage(this.model.findAll(), null, `User not found (ID: #${id})`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, user });
      }

      return res.send(this.renderUsersPage([user], `Viewing single user: ${user.name}`));
    } catch (err) {
      return res.status(500).send(this.renderUsersPage(this.model.findAll(), null, err.message));
    }
  }

  /**
   * POST /users or browser form POST /api/users
   * CREATE: Process form submission to add a new user
   */
  create(req, res) {
    const { name, email, role, department } = req.body || {};
    const wantsJson = req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html');

    if (!name || !name.trim() || !email || !email.trim()) {
      const errorMsg = 'Ad (name) ve e-posta (email) alanları zorunludur.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.renderUsersPage(this.model.findAll(), null, errorMsg));
    }

    try {
      const newUser = this.model.create({ name, email, role, department });

      if (wantsJson) {
        return res.status(201).json({
          success: true,
          message: 'Kullanıcı veritabanı olmadan (in-memory) başarıyla oluşturuldu.',
          user: newUser,
          totalUsers: this.model.count()
        });
      }

      return res.status(201).send(
        this.renderUsersPage(this.model.findAll(), `Kullanıcı "${newUser.name}" başarıyla eklendi!`)
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.renderUsersPage(this.model.findAll(), null, err.message));
    }
  }

  /**
   * PUT /users/:id or PATCH /users/:id
   * UPDATE: Process update request (supports inline prompts and API calls)
   */
  update(req, res) {
    const { id } = req.params;
    const { name, email, role, department } = req.body || {};
    const isPartial = req.method === 'PATCH';
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    if (!isPartial && (!name || !email)) {
      const errorMsg = 'PUT isteğinde "name" ve "email" alanları zorunludur.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.renderUsersPage(this.model.findAll(), null, errorMsg));
    }

    try {
      const updatedUser = this.model.update(id, { name, email, role, department }, isPartial);

      if (!updatedUser) {
        const errorMsg = `Kullanıcı bulunamadı (ID: ${id})`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.renderUsersPage(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `Kullanıcı #${id} (${req.method}) metoduyla başarıyla güncellendi.`,
          method: req.method,
          user: updatedUser
        });
      }

      return res.send(this.renderUsersPage(this.model.findAll(), `Kullanıcı #${id} başarıyla güncellendi.`));
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.renderUsersPage(this.model.findAll(), null, err.message));
    }
  }

  /**
   * DELETE /users/:id
   * DELETE: Remove user and render updated interface or return JSON
   */
  delete(req, res) {
    const { id } = req.params;
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    try {
      const deletedUser = this.model.delete(id);

      if (!deletedUser) {
        const errorMsg = `Kullanıcı bulunamadı (ID: ${id})`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.renderUsersPage(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `Kullanıcı #${id} (${deletedUser.name}) başarıyla silindi.`,
          deletedUser,
          remainingUsers: this.model.count()
        });
      }

      return res.send(this.renderUsersPage(this.model.findAll(), `Kullanıcı #${id} (${deletedUser.name}) başarıyla silindi.`));
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      return res.status(500).send(this.renderUsersPage(this.model.findAll(), null, err.message));
    }
  }

  /**
   * Render the complete HTML UI Dashboard for User management
   */
  renderUsersPage(users, message = null, error = null) {
    const escape = this.escapeHtml;
    const usersRows = users.map(u => `
      <tr>
        <td><span class="user-id">#${escape(u.id)}</span></td>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${(u.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div class="user-name">${escape(u.name)}</div>
              <div class="user-dept">${escape(u.department || 'Belirtilmedi')}</div>
            </div>
          </div>
        </td>
        <td><span class="user-email">${escape(u.email)}</span></td>
        <td>
          <span class="role-badge role-${(u.role || 'STUDENT').toLowerCase()}">${escape(u.role || 'STUDENT')}</span>
        </td>
        <td class="text-muted">${new Date(u.createdAt).toLocaleString('tr-TR')}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="btn-action" onclick="editUser('${escape(u.id)}', '${escape(u.name)}', '${escape(u.email)}', '${escape(u.role)}', '${escape(u.department || '')}')" title="PUT/PATCH ile Güncelle">✏️ Düzenle</button>
            <button type="button" class="btn-action btn-danger" onclick="deleteUser('${escape(u.id)}', '${escape(u.name)}')" title="DELETE ile Sil">🗑️ Sil</button>
          </div>
        </td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Users Interface | Alumni Sphere</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0f172a;
      --bg-card: rgba(30, 41, 59, 0.7);
      --border-color: rgba(255, 255, 255, 0.1);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --accent-hover: #0284c7;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
      color: var(--text-primary);
      min-height: 100vh;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      width: 100%;
      max-width: 980px;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      color: var(--accent);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.75rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #e2e8f0;
    }
    .card-title .badge-count {
      background: #334155;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--accent);
    }
    .form-group {
      margin-bottom: 1.1rem;
    }
    label {
      display: block;
      font-size: 0.875rem;
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
    button.btn-submit:active {
      transform: translateY(0);
    }
    .alert {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th {
      text-align: left;
      padding: 0.75rem 0.6rem;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.8rem;
      border-bottom: 1px solid #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 0.85rem 0.6rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(51, 65, 85, 0.25);
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
      color: var(--text-secondary);
    }
    .user-id {
      color: var(--text-secondary);
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
    }
    .role-admin {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .role-alumni {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .role-student {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .text-muted {
      color: var(--text-secondary);
      font-size: 0.8rem;
    }
    .actions-bar {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
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
    }
    .btn-action {
      padding: 0.35rem 0.75rem;
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
      gap: 0.3rem;
    }
    .btn-action:hover {
      background: var(--accent);
      color: #0f172a;
    }
    .btn-danger {
      border-color: rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    .btn-danger:hover {
      background: #ef4444;
      color: white;
    }
    .table-container {
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">💾 Database Kullanılmadan • In-Memory RAM Store</div>
      <h1>👥 Kullanıcı Yönetim Arayüzü</h1>
      <p class="subtitle"><code>POST /api/users</code> ile ekleyin, <code>PUT/PATCH /api/user/{id}</code> ile güncelleyin.</p>
    </div>

    ${message ? `<div class="alert alert-success">✅ ${escape(message)}</div>` : ''}
    ${error ? `<div class="alert alert-danger">⚠️ ${escape(error)}</div>` : ''}
    <div id="liveAlert"></div>

    <div class="grid">
      <!-- Form Section -->
      <div class="card">
        <div class="card-title">
          <span>➕ Yeni Kullanıcı Ekle</span>
          <span style="font-size:0.75rem; color:#38bdf8; font-weight:normal;">POST /api/users</span>
        </div>
        <form id="userForm" action="/api/users" method="POST">
          <div class="form-group">
            <label for="name">Ad Soyad *</label>
            <input type="text" id="name" name="name" placeholder="Örn: Ayşe Yılmaz" required autofocus autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="email">E-posta Adresi *</label>
            <input type="email" id="email" name="email" placeholder="Örn: ayse@alumni.edu" required autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="role">Rol</label>
            <select id="role" name="role">
              <option value="STUDENT">Öğrenci (Student)</option>
              <option value="ALUMNI" selected>Mezun (Alumni)</option>
              <option value="ADMIN">Yönetici (Admin)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="department">Bölüm / Uzmanlık</label>
            <input type="text" id="department" name="department" placeholder="Örn: Bilgisayar Mühendisliği" autocomplete="off" />
          </div>

          <button type="submit" class="btn-submit" id="submitBtn">
            <span>Kaydet & Gönder</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      <!-- Users Table Section -->
      <div class="card">
        <div class="card-title">
          <span>📋 Kayıtlı Kullanıcılar</span>
          <span class="badge-count" id="userCount">${users.length} Kullanıcı</span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kullanıcı</th>
                <th>E-Posta</th>
                <th>Rol</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody id="userTableBody">
              ${usersRows}
            </tbody>
          </table>
        </div>

        <div class="actions-bar">
          <a href="/api/swagger" class="btn-link" target="_blank">
            <span>📖 Swagger Docs</span>
          </a>
          <a href="/api/users?format=json" class="btn-link" target="_blank">
            <span>{ } JSON Görüntüle</span>
          </a>
          <a href="/api/health" class="btn-link" target="_blank">
            <span>🩺 Health Check</span>
          </a>
          <a href="/" class="btn-link">
            <span>🏠 Anasayfa</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('userForm');
    const tableBody = document.getElementById('userTableBody');
    const userCount = document.getElementById('userCount');
    const liveAlert = document.getElementById('liveAlert');

    window.editUser = async (id, currentName, currentEmail, currentRole, currentDept) => {
      const newName = prompt('Yeni Ad Soyad (PUT/PATCH):', currentName);
      if (newName === null) return;
      const newEmail = prompt('Yeni E-posta (PUT/PATCH):', currentEmail);
      if (newEmail === null) return;
      const newRole = prompt('Yeni Rol (STUDENT, ALUMNI, ADMIN):', currentRole);
      if (newRole === null) return;
      const newDept = prompt('Yeni Bölüm / Alan:', currentDept);
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
          liveAlert.innerHTML = '<div class="alert alert-success">✅ Kullanıcı #' + id + ' (PATCH /api/user/' + id + ') başarıyla güncellendi!</div>';
          setTimeout(() => location.reload(), 600);
        } else {
          liveAlert.innerHTML = '<div class="alert alert-danger">⚠️ ' + (data.error || 'Güncelleme hatası') + '</div>';
        }
      } catch (err) {
        alert('Hata: ' + err.message);
      }
    };

    window.deleteUser = async (id, name) => {
      if (!confirm('\"' + name + '\" adlı kullanıcıyı silmek istediğinize emin misiniz? (DELETE /api/users/' + id + ')')) {
        return;
      }

      try {
        const res = await fetch('/api/users/' + id, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          liveAlert.innerHTML = '<div class="alert alert-success">🗑️ ' + data.message + '</div>';
          setTimeout(() => location.reload(), 600);
        } else {
          liveAlert.innerHTML = '<div class="alert alert-danger">⚠️ ' + (data.error || 'Silme hatası') + '</div>';
        }
      } catch (err) {
        alert('Hata: ' + err.message);
      }
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;

      const formData = {
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
          body: JSON.stringify(formData)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          liveAlert.innerHTML = '<div class="alert alert-success">✅ Kullanıcı başarıyla eklendi: <strong>' + (data.user.name || '') + '</strong></div>';
          form.reset();

          const roleClass = 'role-' + (data.user.role || 'student').toLowerCase();
          const initial = (data.user.name || 'U').charAt(0).toUpperCase();
          const tr = document.createElement('tr');
          tr.innerHTML = '<td><span class="user-id">#' + data.user.id + '</span></td>' +
            '<td><div class="user-cell"><div class="user-avatar">' + initial + '</div><div><div class="user-name">' + data.user.name + '</div><div class="user-dept">' + (data.user.department || 'Belirtilmedi') + '</div></div></div></td>' +
            '<td><span class="user-email">' + data.user.email + '</span></td>' +
            '<td><span class="role-badge ' + roleClass + '">' + data.user.role + '</span></td>' +
            '<td class="text-muted">' + new Date(data.user.createdAt).toLocaleString('tr-TR') + '</td>';
          tableBody.prepend(tr);
          const currentCount = parseInt(userCount.textContent, 10) || 0;
          userCount.textContent = (currentCount + 1) + ' Kullanıcı';
        } else {
          liveAlert.innerHTML = '<div class="alert alert-danger">⚠️ ' + (data.error || 'Hata oluştu') + '</div>';
        }
      } catch (err) {
        form.submit();
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
  }
}

// Export singleton instance as default, and class definition
const userController = new UserController();

module.exports = userController;
module.exports.UserController = UserController;
