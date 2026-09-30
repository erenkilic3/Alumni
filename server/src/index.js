const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isDbConnected = false;
pool.connect()
  .then(client => {
    isDbConnected = true;
    client.release();
    console.log('✅ Connected to PostgreSQL database successfully');
  })
  .catch(err => {
    isDbConnected = false;
    console.log('ℹ️ PostgreSQL not immediately reachable, using fallback in-memory seed store:', err.message);
  });

// Seed data for live preview
let mockAlumni = [
  {
    id: "1",
    name: "Hakan Tosun",
    graduationYear: 2021,
    department: "Computer Engineering",
    company: "Google",
    role: "Senior Software Engineer",
    location: "Zurich, Switzerland",
    industry: "Technology",
    skills: ["Go", "Kubernetes", "Distributed Systems", "Cloud"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Graduated with honors in 2021. Open for student mentorship in cloud infrastructure."
  },
  {
    id: "2",
    name: "Mehmet Raşid FamousHand",
    graduationYear: 2019,
    department: "Industrial Engineering",
    company: "Amazon",
    role: "Lead Product Manager",
    location: "Çorum",
    industry: "E-Commerce",
    skills: ["Product Strategy", "Agile", "Data Analytics", "UX"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Passionate about building customer-centric products. Mentor for tech career transitions."
  },
  {
    id: "3",
    name: "Erenk3",
    graduationYear: 2023,
    department: "Software Engineering",
    company: "Spotify",
    role: "Full Stack Engineer",
    location: "Stockholm, Sweden",
    industry: "Streaming & Media",
    skills: ["TypeScript", "Node.js", "React", "PostgreSQL"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    bio: "Building audio discovery features. Alumni representative for Nordic region."
  },
  {
    id: "4",
    name: "Emre Çelik",
    graduationYear: 2018,
    department: "Electrical & Electronics Engineering",
    company: "Tesla",
    role: "Autopilot Firmware Engineer",
    location: "Berlin, Germany",
    industry: "Automotive & AI",
    skills: ["C++", "Embedded Systems", "Robotics", "Computer Vision"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Working on automotive autonomy. Happy to connect with junior engineers."
  },
  {
    id: "5",
    name: "Selin Öztürk",
    graduationYear: 2022,
    department: "Business Administration",
    company: "McKinsey & Company",
    role: "Associate Consultant",
    location: "Istanbul, Turkey",
    industry: "Management Consulting",
    skills: ["Financial Modeling", "Corporate Strategy", "Market Research"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    bio: "Consulting for energy and sustainability sectors."
  }
];

const mockJobs = [
  {
    id: "job-1",
    title: "Junior Backend Developer (Node.js / PostgreSQL)",
    company: "Peak Tech",
    location: "Remote / Istanbul",
    type: "Full-Time",
    postedBy: "Burak Demir",
    deadline: "2026-10-15"
  },
  {
    id: "job-2",
    title: "Data Science Intern",
    company: "FinAnalytica",
    location: "Hybrid (Ankara)",
    type: "Internship",
    postedBy: "Selin Öztürk",
    deadline: "2026-11-01"
  }
];

// Sum calculation handler
const handleSum = (req, res) => {
  const n1 = req.params.number1 ?? req.query.number1 ?? req.query.num1 ?? req.query.n1 ?? req.query.a;
  const n2 = req.params.number2 ?? req.query.number2 ?? req.query.num2 ?? req.query.n2 ?? req.query.b;

  if (n1 !== undefined && n2 !== undefined) {
    const num1 = parseFloat(n1);
    const num2 = parseFloat(n2);

    if (isNaN(num1) || isNaN(num2)) {
      return res.status(400).send('Invalid numbers');
    }

    const sum = num1 + num2;
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ number1: num1, number2: num2, sum });
    }
    return res.send(`${sum}`);
  }

  // Interactive form if no parameters provided
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sum Calculator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
    button {
      padding: 0.85rem;
      border-radius: 10px;
      border: none;
      background: #0284c7;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    button:hover {
      background: #0369a1;
    }
    button:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>➕ Toplama (Sum)</h1>
    <p>Toplamak için iki sayı girin:</p>
    <form action="/sum" method="GET">
      <input type="number" step="any" name="number1" placeholder="Birinci sayı (number1)" required autofocus />
      <input type="number" step="any" name="number2" placeholder="İkinci sayı (number2)" required />
      <button type="submit">Topla</button>
    </form>
  </div>
</body>
</html>`);
};

// GET /homepage: Bağımsız, basit "homepage" ve "about" sayfası
const handleHomepage = (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
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
};

// Homepage route
app.get('/homepage', handleHomepage);

// Sum routes
app.get('/sum/:number1/:number2', handleSum);
app.get('/sum', handleSum);

// Root endpoint: Kullanıcıya isim sorar veya sum işlemi yapar
app.get('/', (req, res) => {
  const n1 = req.query.number1 ?? req.query.num1 ?? req.query.n1 ?? req.query.a;
  const n2 = req.query.number2 ?? req.query.num2 ?? req.query.n2 ?? req.query.b;
  if (n1 !== undefined && n2 !== undefined) {
    return handleSum(req, res);
  }

  const name = req.query.name;
  if (name) {
    return res.send(`hello ${name}`);
  }

  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alumni</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
    button {
      padding: 0.85rem;
      border-radius: 10px;
      border: none;
      background: #0284c7;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    button:hover {
      background: #0369a1;
    }
    button:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>👋 Hoş Geldiniz</h1>
    <p>Lütfen isminizi girin:</p>
    <form action="/" method="GET">
      <input type="text" name="name" placeholder="İsminiz..." required autofocus autocomplete="off" />
      <button type="submit">Gönder</button>
    </form>
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
    postgresConnected: isDbConnected,
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
        <div style="display:flex; gap:0.4rem;">
          <button type="button" class="btn-action" onclick="editUser('${escapeHtml(u.id)}', '${escapeHtml(u.name)}', '${escapeHtml(u.email)}', '${escapeHtml(u.role)}', '${escapeHtml(u.department || '')}')" title="PUT/PATCH ile Güncelle">✏️ Düzenle</button>
          <button type="button" class="btn-action btn-danger" onclick="deleteUser('${escapeHtml(u.id)}', '${escapeHtml(u.name)}')" title="DELETE ile Sil">🗑️ Sil</button>
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
      if (!confirm('"' + name + '" adlı kullanıcıyı silmek istediğinize emin misiniz? (DELETE /api/users/' + id + ')')) {
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

const handleDeleteUser = (req, res) => {
  const userId = req.params.id;
  const userIndex = inMemoryUsers.findIndex(u => u.id === userId.toString());

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Kullanıcı bulunamadı (ID: ${userId})`
    });
  }

  const [deletedUser] = inMemoryUsers.splice(userIndex, 1);

  res.json({
    success: true,
    message: `Kullanıcı #${userId} (${deletedUser.name}) başarıyla silindi.`,
    deletedUser,
    remainingUsers: inMemoryUsers.length
  });
};

app.delete('/api/users/:id', handleDeleteUser);
app.delete('/api/user/:id', handleDeleteUser);
app.delete('/users/:id', handleDeleteUser);
app.delete('/user/:id', handleDeleteUser);

// ==========================================================================
// Swagger / OpenAPI 3.0 Documentation Module
// ==========================================================================
const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Alumni Tracking System REST API",
    version: "1.0.0",
    description: "Alumni Sphere - Mezun Takip ve Ağ Sistemi RESTful API Dokümantasyonu (Swagger / OpenAPI)",
    contact: {
      name: "Eren Kılıç",
      url: "https://github.com/erenkilic3/Alumni"
    }
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Development Backend Server (:5001)"
    },
    {
      url: "http://localhost:3000",
      description: "Frontend / Homepage Server (:3000)"
    }
  ],
  tags: [
    { name: "Swagger", description: "API Dokümantasyonu ve Şeması" },
    { name: "Health", description: "Sistem ve Veritabanı Sağlık Kontrolü" },
    { name: "Users", description: "In-Memory Kullanıcı Yönetimi (CRUD)" },
    { name: "Alumni", description: "Mezun Profilleri ve Arama" },
    { name: "Jobs", description: "Kariyer ve İş İlanları" },
    { name: "Stats", description: "Platform İstatistikleri" },
    { name: "Calculator", description: "Toplama ve Yardımcı İşlemler" }
  ],
  paths: {
    "/api/swagger": {
      get: {
        tags: ["Swagger"],
        summary: "Swagger UI ve OpenAPI Belgelendirmesi",
        description: "Tarayıcıda interaktif Swagger UI arayüzünü, API istemcilerinde veya ?format=json ile OpenAPI JSON şemasını sunar.",
        parameters: [
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["json"] },
            description: "JSON şemasını doğrudan almak için 'json' girin"
          }
        ],
        responses: {
          "200": {
            description: "Swagger UI HTML veya OpenAPI 3.0 JSON şeması"
          }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Sistem sağlık durumunu kontrol et",
        description: "API sunucusu ve veritabanı durumunu JSON formatında döndürür.",
        responses: {
          "200": {
            description: "Sağlık durumu yanıtı",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "healthy" },
                    online: { type: "boolean", example: true },
                    timestamp: { type: "string", example: "2026-09-30T10:00:00.000Z" },
                    postgresConnected: { type: "boolean", example: false },
                    environment: { type: "string", example: "development" },
                    serverVersion: { type: "string", example: "1.0.0" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Tüm kullanıcıları listele (In-Memory)",
        description: "Bellekte (RAM) saklanan tüm kullanıcıların listesini döndürür.",
        parameters: [
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["json"] },
            description: "JSON çıktısı için 'json' verilebilir"
          }
        ],
        responses: {
          "200": {
            description: "Kullanıcı listesi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "integer", example: 5 },
                    users: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Yeni kullanıcı ekle (No Database)",
        description: "Belleğe (RAM) veritabanı kullanmadan yeni kullanıcı ekler.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            },
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Kullanıcı oluşturuldu",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Kullanıcı veritabanı olmadan (in-memory) başarıyla oluşturuldu." },
                    user: { $ref: "#/components/schemas/User" },
                    totalUsers: { type: "integer", example: 6 }
                  }
                }
              }
            }
          },
          "400": {
            description: "Ad veya e-posta alanı eksik"
          }
        }
      }
    },
    "/api/user/{id}": {
      get: {
        tags: ["Users"],
        summary: "ID'ye göre kullanıcı getir",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Kullanıcı ID'si" }
        ],
        responses: {
          "200": {
            description: "Kullanıcı bulundu",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "404": { description: "Kullanıcı bulunamadı" }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Kullanıcıyı tamamen güncelle (PUT)",
        description: "Kullanıcı verilerini günceller (name ve email zorunludur).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Kullanıcı ID'si" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Kullanıcı güncellendi" },
          "400": { description: "Eksik zorunlu alanlar" },
          "404": { description: "Kullanıcı bulunamadı" }
        }
      },
      patch: {
        tags: ["Users"],
        summary: "Kullanıcıyı kısmi güncelle (PATCH)",
        description: "Yalnızca gönderilen alanları günceller.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Kullanıcı ID'si" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatchUserRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Kullanıcı güncellendi" },
          "404": { description: "Kullanıcı bulunamadı" }
        }
      }
    },
    "/api/users/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Kullanıcıyı sil (DELETE)",
        description: "Kullanıcıyı in-memory veri deposundan siler.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Silinecek Kullanıcı ID" }
        ],
        responses: {
          "200": {
            description: "Kullanıcı silindi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Kullanıcı #1 başarıyla silindi." },
                    deletedUser: { $ref: "#/components/schemas/User" },
                    remainingUsers: { type: "integer", example: 4 }
                  }
                }
              }
            }
          },
          "404": { description: "Kullanıcı bulunamadı" }
        }
      }
    },
    "/api/alumni": {
      get: {
        tags: ["Alumni"],
        summary: "Mezunları filtrele ve listele",
        parameters: [
          { name: "search", in: "query", required: false, schema: { type: "string" }, description: "İsim, şirket, yetenek arama" },
          { name: "department", in: "query", required: false, schema: { type: "string" }, description: "Bölüm filtresi" },
          { name: "year", in: "query", required: false, schema: { type: "string" }, description: "Mezuniyet yılı" },
          { name: "mentorOnly", in: "query", required: false, schema: { type: "boolean" }, description: "Yalnızca mentor olanlar" }
        ],
        responses: {
          "200": { description: "Mezun listesi" }
        }
      },
      post: {
        tags: ["Alumni"],
        summary: "Yeni mezun profili ekle",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "graduationYear", "department"],
                properties: {
                  name: { type: "string", example: "Selin Öztürk" },
                  graduationYear: { type: "integer", example: 2022 },
                  department: { type: "string", example: "Business Administration" },
                  company: { type: "string", example: "McKinsey & Company" },
                  role: { type: "string", example: "Associate Consultant" },
                  location: { type: "string", example: "Istanbul, Turkey" },
                  industry: { type: "string", example: "Management Consulting" },
                  skills: { type: "array", items: { type: "string" }, example: ["Strategy", "Financial Modeling"] },
                  bio: { type: "string", example: "Danışmanlık sektörü mezunu." },
                  isMentor: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Mezun profili eklendi" }
        }
      }
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Platform istatistikleri",
        responses: {
          "200": { description: "Mezun, istihdam ve sektör oranları" }
        }
      }
    },
    "/api/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "İş ve staj ilanları",
        responses: {
          "200": { description: "İş listesi" }
        }
      }
    },
    "/sum": {
      get: {
        tags: ["Calculator"],
        summary: "İki sayıyı topla (query parametreleri)",
        parameters: [
          { name: "number1", in: "query", required: false, schema: { type: "number" }, example: 5 },
          { name: "number2", in: "query", required: false, schema: { type: "number" }, example: 10 }
        ],
        responses: {
          "200": { description: "Toplam sonucu veya hesaplama formu" }
        }
      }
    },
    "/homepage": {
      get: {
        tags: ["Calculator"],
        summary: "Bağımsız anasayfa ve hakkımızda sayfası",
        responses: {
          "200": { description: "Anasayfa HTML sayfası" }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "1" },
          name: { type: "string", example: "Eren Kılıç" },
          email: { type: "string", example: "eren@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"], example: "ADMIN" },
          department: { type: "string", example: "Software Engineering" },
          createdAt: { type: "string", example: "2026-09-30T09:00:00.000Z" },
          updatedAt: { type: "string", example: "2026-09-30T10:30:00.000Z" }
        }
      },
      CreateUserRequest: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Ahmet Yılmaz" },
          email: { type: "string", example: "ahmet@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"], example: "STUDENT" },
          department: { type: "string", example: "Bilgisayar Mühendisliği" }
        }
      },
      UpdateUserRequest: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Ahmet Yılmaz Güncel" },
          email: { type: "string", example: "ahmet.yeni@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"], example: "ALUMNI" },
          department: { type: "string", example: "Yazılım Mühendisliği" }
        }
      },
      PatchUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ahmet Yılmaz" },
          email: { type: "string", example: "ahmet@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"] },
          department: { type: "string", example: "Veri Bilimi" }
        }
      }
    }
  }
};

const renderSwaggerUI = (spec) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Swagger UI - Alumni API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.17.14/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.17.14/favicon-16x16.png" sizes="16x16" />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .custom-header {
      background: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #f8fafc;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .custom-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .custom-links {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .custom-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      transition: all 0.2s;
    }
    .custom-links a:hover {
      color: white;
      border-color: #38bdf8;
    }
    #swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .swagger-ui {
      filter: invert(88%) hue-rotate(180deg);
    }
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui img { filter: invert(100%) hue-rotate(180deg); }
  </style>
</head>
<body>
  <div class="custom-header">
    <div class="custom-brand">
      <span>📖 AlumniSphere API (OpenAPI / Swagger)</span>
    </div>
    <div class="custom-links">
      <a href="/api/swagger?format=json" target="_blank">{ } OpenAPI JSON</a>
      <a href="/api/users">👥 Users Arayüzü</a>
      <a href="/api/health" target="_blank">🩺 Health Check</a>
      <a href="/">🏠 Anasayfa</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(spec)};
      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;

// Swagger Documentation Handler
const handleSwagger = (req, res) => {
  const isJson = req.query.format === 'json' ||
    req.path.endsWith('.json') ||
    (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'));

  if (isJson) {
    return res.json(swaggerDocument);
  }

  res.send(renderSwaggerUI(swaggerDocument));
};

app.get('/api/swagger', handleSwagger);
app.get('/api/swagger.json', (req, res) => res.json(swaggerDocument));
app.get('/swagger', handleSwagger);
app.get('/swagger.json', (req, res) => res.json(swaggerDocument));
app.get('/api/docs', handleSwagger);

// Statistics Endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalAlumni: mockAlumni.length + 1240,
    employmentRate: '94.8%',
    activeMentors: mockAlumni.filter(a => a.isMentor).length + 180,
    partnerCompanies: 145,
    topIndustries: [
      { name: "Technology & Software", count: 48 },
      { name: "Consulting & Finance", count: 24 },
      { name: "Automotive & Hardware", count: 18 },
      { name: "E-Commerce", count: 10 }
    ]
  });
});

// Alumni List & Filter Endpoint
app.get('/api/alumni', (req, res) => {
  const { search, department, year, mentorOnly } = req.query;
  let results = [...mockAlumni];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (department && department !== 'All') {
    results = results.filter(a => a.department === department);
  }

  if (year && year !== 'All') {
    results = results.filter(a => a.graduationYear.toString() === year.toString());
  }

  if (mentorOnly === 'true') {
    results = results.filter(a => a.isMentor);
  }

  res.json({
    count: results.length,
    alumni: results
  });
});

// Add New Alumni Profile
app.post('/api/alumni', (req, res) => {
  const { name, graduationYear, department, company, role, location, industry, skills, bio, isMentor } = req.body;
  if (!name || !graduationYear || !department) {
    return res.status(400).json({ error: 'Name, graduationYear, and department are required.' });
  }

  const newProfile = {
    id: (mockAlumni.length + 1).toString(),
    name,
    graduationYear: parseInt(graduationYear, 10),
    department,
    company: company || "Freelance / Independent",
    role: role || "Specialist",
    location: location || "Remote",
    industry: industry || "Technology",
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    isMentor: !!isMentor,
    bio: bio || "New alumni profile."
  };

  mockAlumni.unshift(newProfile);
  res.status(201).json({ success: true, profile: newProfile });
});

// Jobs Endpoint
app.get('/api/jobs', (req, res) => {
  res.json(mockJobs);
});

app.listen(PORT, () => {
  console.log(`🚀 Alumni API server listening on http://localhost:${PORT}`);
});
