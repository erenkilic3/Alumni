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
// User Controllers (Web & API Controllers for User Management)
// ==========================================================================
const { UserController, ApiUserController } = require('./controllers');

// Content-negotiating handler for /api/users
const handleGetUsers = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    req.query.format !== 'json' &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return UserController.index(req, res);
  }
  return ApiUserController.getAll(req, res);
};

const handleCreateUser = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return UserController.create(req, res);
  }
  return ApiUserController.create(req, res);
};

// Web User Routes (HTML UI)
app.get('/users', UserController.index);
app.post('/users', UserController.create);
app.get('/users/:id', UserController.show);
app.put('/users/:id', UserController.update);
app.patch('/users/:id', UserController.update);
app.delete('/users/:id', UserController.delete);

// REST API User Routes (JSON)
app.get('/api/users', handleGetUsers);
app.post('/api/users', handleCreateUser);
app.get('/api/users/count', ApiUserController.count);

app.get('/api/user/:id', ApiUserController.getById);
app.get('/api/users/:id', ApiUserController.getById);
app.get('/user/:id', ApiUserController.getById);

app.put('/api/user/:id', ApiUserController.update);
app.patch('/api/user/:id', ApiUserController.update);
app.put('/api/users/:id', ApiUserController.update);
app.patch('/api/users/:id', ApiUserController.update);
app.put('/user/:id', ApiUserController.update);
app.patch('/user/:id', ApiUserController.update);

app.delete('/api/users/:id', ApiUserController.delete);
app.delete('/api/user/:id', ApiUserController.delete);
app.delete('/user/:id', ApiUserController.delete);

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
