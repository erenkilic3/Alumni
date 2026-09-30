const express = (() => {
  try {
    return require('express');
  } catch (e) {
    return require('./server/node_modules/express');
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET metodu ile çalışan bağımsız "homepage"
app.get('/homepage', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Homepage</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #1e293b;
      padding: 2.5rem;
      border-radius: 14px;
      border: 1px solid #334155;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    h1 {
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    h2 {
      color: #94a3b8;
      font-size: 1.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    p {
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 1.05rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Homepage</h1>
    <h2>About</h2>
    <p>Alumni Tracking System: Üniversiteler ve mezunlar arasındaki bağı güçlendiren, mezunların kariyer gelişimlerini takip eden, mentorluk ve iş olanakları sağlayan bir platformdur.</p>
  </div>
</body>
</html>`);
});

// Health Check Endpoint
const handleHealth = (req, res) => {
  res.json({
    status: 'ok',
    message: 'healthy',
    online: true,
    timestamp: new Date().toISOString(),
    service: 'alumni-homepage',
    environment: process.env.NODE_ENV || 'development',
    serverVersion: '1.0.0'
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// ==========================================================================
// In-Memory Users Module (Database Kullanılmadan / RAM Store)
// ==========================================================================
let inMemoryUsers = [
  {
    id: "1",
    name: "Eren Kılıç",
    email: "eren@alumni.edu",
    role: "ADMIN",
    department: "Software Engineering",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "2",
    name: "Ayşe Yılmaz",
    email: "ayse.yilmaz@google.com",
    role: "ALUMNI",
    department: "Computer Engineering",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "3",
    name: "Burak Demir",
    email: "burak.demir@peak.com",
    role: "STUDENT",
    department: "Industrial Engineering",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "4",
    name: "Mehmet Öz",
    email: "mehmet@tesla.com",
    role: "ALUMNI",
    department: "Electrical Engineering",
    createdAt: "2026-09-30T06:46:36.548Z"
  },
  {
    id: "5",
    name: "Fatma Kaya",
    email: "fatma@alumni.edu",
    role: "STUDENT",
    department: "Architecture",
    createdAt: "2026-09-30T06:47:18.171Z"
  },
  {
    id: "6",
    name: "hakan tosun",
    email: "hakatosun@student.com",
    role: "STUDENT",
    department: "doctor",
    createdAt: "2026-09-30T07:11:12.528Z"
  },
  {
    id: "7",
    name: "memet raşit famoushand",
    email: "memetk3@student.com",
    role: "STUDENT",
    department: "barber",
    createdAt: "2026-09-30T07:12:05.575Z"
  }
];

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderUsersPage = (users, message = null, error = null) => {
  const usersRows = users.map(u => `
    <tr>
      <td><span class="user-id">#${escapeHtml(u.id)}</span></td>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${(u.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <div class="user-name">${escapeHtml(u.name)}</div>
            <div class="user-dept">${escapeHtml(u.department || 'Belirtilmedi')}</div>
          </div>
        </div>
      </td>
      <td><span class="user-email">${escapeHtml(u.email)}</span></td>
      <td>
        <span class="role-badge role-${(u.role || 'STUDENT').toLowerCase()}">${escapeHtml(u.role || 'STUDENT')}</span>
      </td>
      <td class="text-muted">${new Date(u.createdAt).toLocaleString('tr-TR')}</td>
      <td>
        <button type="button" class="btn-action" onclick="editUser('${escapeHtml(u.id)}', '${escapeHtml(u.name)}', '${escapeHtml(u.email)}', '${escapeHtml(u.role)}', '${escapeHtml(u.department || '')}')" title="PUT/PATCH ile Güncelle">✏️ Düzenle</button>
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

    ${message ? `<div class="alert alert-success">✅ ${escapeHtml(message)}</div>` : ''}
    ${error ? `<div class="alert alert-danger">⚠️ ${escapeHtml(error)}</div>` : ''}
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
          <a href="/api/users?format=json" class="btn-link" target="_blank">
            <span>{ } JSON Görüntüle</span>
          </a>
          <a href="/api/health" class="btn-link" target="_blank">
            <span>🩺 Health Check</span>
          </a>
          <a href="/homepage" class="btn-link">
            <span>🏠 Homepage</span>
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
};

// Users Handlers
const handleGetUsers = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    req.query.format !== 'json' &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return res.send(renderUsersPage(inMemoryUsers));
  }

  // Default for API clients, curl, Postman, test suites: JSON
  res.json({
    count: inMemoryUsers.length,
    users: inMemoryUsers
  });
};

const handleCreateUser = (req, res) => {
  const { name, email, role, department } = req.body || {};
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json');

  if (!name || !email) {
    if (isBrowserHtml) {
      return res.status(400).send(renderUsersPage(inMemoryUsers, null, 'Ad (name) ve e-posta (email) alanları zorunludur.'));
    }
    return res.status(400).json({
      success: false,
      error: 'name ve email alanları zorunludur.'
    });
  }

  const newUser = {
    id: (inMemoryUsers.length + 1).toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: (role || 'STUDENT').toUpperCase(),
    department: department ? department.trim() : 'Belirtilmedi',
    createdAt: new Date().toISOString()
  };

  inMemoryUsers.unshift(newUser);

  if (isBrowserHtml) {
    return res.status(201).send(renderUsersPage(inMemoryUsers, `Kullanıcı "${newUser.name}" başarıyla eklendi!`));
  }

  return res.status(201).json({
    success: true,
    message: 'Kullanıcı veritabanı olmadan (in-memory) başarıyla oluşturuldu.',
    user: newUser,
    totalUsers: inMemoryUsers.length
  });
};

app.get('/api/users', handleGetUsers);
app.get('/users', handleGetUsers);
app.post('/api/users', handleCreateUser);
app.post('/users', handleCreateUser);

// Single User Handlers (GET, PUT, PATCH)
const handleGetUserById = (req, res) => {
  const userId = req.params.id;
  const user = inMemoryUsers.find(u => u.id === userId.toString());

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `Kullanıcı bulunamadı (ID: ${userId})`
    });
  }

  res.json({
    success: true,
    user
  });
};

const handleUpdateUser = (req, res) => {
  const userId = req.params.id;
  const userIndex = inMemoryUsers.findIndex(u => u.id === userId.toString());

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Kullanıcı bulunamadı (ID: ${userId})`
    });
  }

  const existing = inMemoryUsers[userIndex];
  const { name, email, role, department } = req.body || {};

  // For PUT requests: if neither name nor email is provided
  if (req.method === 'PUT' && (!name || !email)) {
    return res.status(400).json({
      success: false,
      error: 'PUT isteğinde "name" ve "email" alanları zorunludur.'
    });
  }

  const updatedUser = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    email: email !== undefined ? email.trim().toLowerCase() : existing.email,
    role: role !== undefined ? role.toUpperCase() : existing.role,
    department: department !== undefined ? department.trim() : existing.department,
    updatedAt: new Date().toISOString()
  };

  inMemoryUsers[userIndex] = updatedUser;

  res.json({
    success: true,
    message: `Kullanıcı #${userId} (${req.method}) metoduyla başarıyla güncellendi.`,
    method: req.method,
    user: updatedUser
  });
};

// Single User endpoints (PUT, PATCH, GET)
app.get('/api/user/:id', handleGetUserById);
app.get('/api/users/:id', handleGetUserById);
app.get('/user/:id', handleGetUserById);
app.get('/users/:id', handleGetUserById);

app.put('/api/user/:id', handleUpdateUser);
app.patch('/api/user/:id', handleUpdateUser);
app.put('/api/users/:id', handleUpdateUser);
app.patch('/api/users/:id', handleUpdateUser);

app.put('/user/:id', handleUpdateUser);
app.patch('/user/:id', handleUpdateUser);
app.put('/users/:id', handleUpdateUser);
app.patch('/users/:id', handleUpdateUser);

// Root endpoint de homepage'e yönlendirir
app.get('/', (req, res) => {
  res.redirect('/homepage');
});

app.listen(PORT, () => {
  console.log(`🚀 Bağımsız Homepage sunucusu localhost üzerinde çalışıyor: http://localhost:${PORT}/homepage`);
});
