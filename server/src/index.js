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
// Route Modules (User Web Routes & ApiUser REST API Routes)
// ==========================================================================
const { userRoutes, apiUserRoutes } = require('./routes');

// Mount Web UI User routes (/users, /users/:id)
app.use(userRoutes);

// Mount REST API User routes (/api/users, /api/user/:id, /api/users/count, etc.)
app.use(apiUserRoutes);

// ==========================================================================
// Swagger / OpenAPI 3.0 Documentation Module
// ==========================================================================
const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Alumni Tracking System REST API",
    version: "1.0.0",
    description: "Alumni Sphere - Alumni Tracking and Networking System RESTful API Documentation (Swagger / OpenAPI 3.0)",
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
    { name: "Swagger", description: "API documentation and OpenAPI schema endpoints" },
    { name: "Health", description: "System and database health check" },
    { name: "ApiUser", description: "REST API JSON endpoints for in-memory user CRUD operations (ApiUserController)" },
    { name: "User", description: "Web UI and SSR endpoints for user dashboard management (UserController)" },
    { name: "Alumni", description: "Alumni directory and search endpoints" },
    { name: "Jobs", description: "Career opportunities and job postings" },
    { name: "Stats", description: "Platform overview and alumni statistics" },
    { name: "Calculator", description: "Utility arithmetic and legacy helper endpoints" }
  ],
  paths: {
    "/api/swagger": {
      get: {
        tags: ["Swagger"],
        summary: "Swagger UI and OpenAPI Specification",
        description: "Serves interactive Swagger UI HTML in the browser, or returns raw OpenAPI 3.0 JSON specification when requested with ?format=json or Accept: application/json.",
        parameters: [
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["json"] },
            description: "Pass 'json' to directly retrieve the JSON schema"
          }
        ],
        responses: {
          "200": {
            description: "Swagger UI HTML or OpenAPI 3.0 JSON schema"
          }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check system health status",
        description: "Returns API server status and database connectivity in JSON format.",
        responses: {
          "200": {
            description: "Health status response",
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
        tags: ["ApiUser"],
        summary: "List all users (JSON with browser fallback)",
        description: "Retrieves all users stored in memory. Supports optional query parameters for role, department, and search keywords.",
        parameters: [
          {
            name: "role",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"] },
            description: "Filter users by role"
          },
          {
            name: "department",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter users by academic department"
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search keyword matching name or email"
          },
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["json"] },
            description: "Force JSON output format"
          }
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
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
        tags: ["ApiUser"],
        summary: "Create a new user (JSON API)",
        description: "Adds a new user to the in-memory data store without requiring a database connection.",
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
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User successfully created (in-memory, no database)." },
                    user: { $ref: "#/components/schemas/User" },
                    totalUsers: { type: "integer", example: 6 }
                  }
                }
              }
            }
          },
          "400": {
            description: "Name or email field missing, or email already registered"
          }
        }
      }
    },
    "/api/users/count": {
      get: {
        tags: ["ApiUser"],
        summary: "Get total user count",
        description: "Returns the total number of registered users currently stored in memory.",
        responses: {
          "200": {
            description: "Total user count",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 5 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/user/{id}": {
      get: {
        tags: ["ApiUser"],
        summary: "Get user by ID",
        description: "Retrieves a single user by their unique identifier.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        responses: {
          "200": {
            description: "User found",
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
          "404": { description: "User not found" }
        }
      },
      put: {
        tags: ["ApiUser"],
        summary: "Update user completely (PUT)",
        description: "Updates all attributes of a user (name and email are required).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
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
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User #1 updated successfully." },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "400": { description: "Missing required fields" },
          "404": { description: "User not found" }
        }
      },
      patch: {
        tags: ["ApiUser"],
        summary: "Partially update user (PATCH)",
        description: "Updates only the supplied fields of an existing user.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
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
          "200": {
            description: "User partially updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User #1 updated successfully." },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "404": { description: "User not found" }
        }
      },
      delete: {
        tags: ["ApiUser"],
        summary: "Delete user by ID (DELETE)",
        description: "Removes a user from the in-memory data store.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID to delete" }
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User #1 deleted successfully." },
                    deletedUser: { $ref: "#/components/schemas/User" },
                    remainingUsers: { type: "integer", example: 4 }
                  }
                }
              }
            }
          },
          "404": { description: "User not found" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["ApiUser"],
        summary: "Get user by ID (Plural route alias)",
        description: "Alias for GET /api/user/{id}.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        responses: {
          "200": {
            description: "User found",
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
          "404": { description: "User not found" }
        }
      },
      put: {
        tags: ["ApiUser"],
        summary: "Update user completely (Plural route alias)",
        description: "Alias for PUT /api/user/{id}.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
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
          "200": { description: "User updated successfully" },
          "400": { description: "Missing required fields" },
          "404": { description: "User not found" }
        }
      },
      patch: {
        tags: ["ApiUser"],
        summary: "Partially update user (Plural route alias)",
        description: "Alias for PATCH /api/user/{id}.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
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
          "200": { description: "User partially updated" },
          "404": { description: "User not found" }
        }
      },
      delete: {
        tags: ["ApiUser"],
        summary: "Delete user by ID (Plural route alias)",
        description: "Alias for DELETE /api/user/{id}.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID to delete" }
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User #1 deleted successfully." },
                    deletedUser: { $ref: "#/components/schemas/User" },
                    remainingUsers: { type: "integer", example: 4 }
                  }
                }
              }
            }
          },
          "404": { description: "User not found" }
        }
      }
    },
    "/users": {
      get: {
        tags: ["User"],
        summary: "Render User Management Dashboard (Web UI)",
        description: "Server-side rendered HTML dashboard for viewing, searching, and managing users with interactive forms (handled by UserController.index & UserView.renderUsersList).",
        responses: {
          "200": {
            description: "HTML user dashboard page",
            content: {
              "text/html": {
                schema: { type: "string" }
              }
            }
          }
        }
      },
      post: {
        tags: ["User"],
        summary: "Process Web Form User Registration (Web UI)",
        description: "Processes standard URL-encoded form data or JSON submitted from the web dashboard and redirects to /users with status message (handled by UserController.create).",
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        responses: {
          "200": { description: "HTML page re-rendered with new user" },
          "302": { description: "Redirect to /users upon successful creation" },
          "400": { description: "Validation error (missing name or email)" }
        }
      }
    },
    "/users/new": {
      get: {
        tags: ["User"],
        summary: "Render Create User Form (Web UI)",
        description: "Renders the dedicated server-side HTML form for registering a new user (handled by UserController.new & UserView.renderCreateForm).",
        responses: {
          "200": {
            description: "HTML create user form page",
            content: { "text/html": { schema: { type: "string" } } }
          }
        }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["User"],
        summary: "Display User Detail View (Web UI)",
        description: "Renders single user profile details page (handled by UserController.show & UserView.renderUserDetails).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        responses: {
          "200": {
            description: "HTML profile view or JSON user details",
            content: {
              "text/html": { schema: { type: "string" } }
            }
          },
          "404": { description: "User not found" }
        }
      },
      put: {
        tags: ["User"],
        summary: "Update User (Web UI / Form Action)",
        description: "Processes user update request (handled by UserController.update).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } },
            "application/x-www-form-urlencoded": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } }
          }
        },
        responses: {
          "200": { description: "User updated successfully" },
          "404": { description: "User not found" }
        }
      },
      post: {
        tags: ["User"],
        summary: "Update User via HTML Form (Web UI)",
        description: "Processes user update form submission (handled by UserController.update).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } },
            "application/json": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } }
          }
        },
        responses: {
          "200": { description: "User updated successfully" },
          "404": { description: "User not found" }
        }
      },
      patch: {
        tags: ["User"],
        summary: "Partially Update User (Web UI)",
        description: "Processes partial user update (handled by UserController.update).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PatchUserRequest" } }
          }
        },
        responses: {
          "200": { description: "User updated successfully" },
          "404": { description: "User not found" }
        }
      },
      delete: {
        tags: ["User"],
        summary: "Delete User (Web UI Action)",
        description: "Removes user and returns updated HTML view or JSON confirmation (handled by UserController.delete).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" }
        ],
        responses: {
          "200": { description: "User deleted successfully" },
          "404": { description: "User not found" }
        }
      }
    },
    "/users/{id}/edit": {
      get: {
        tags: ["User"],
        summary: "Render Edit User Form (Web UI)",
        description: "Renders the dedicated server-side HTML form prefilled with user data for editing (handled by UserController.edit & UserView.renderEditForm).",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID to edit" }
        ],
        responses: {
          "200": {
            description: "HTML edit user form page",
            content: { "text/html": { schema: { type: "string" } } }
          },
          "404": { description: "User not found" }
        }
      }
    },
    "/api/alumni": {
      get: {
        tags: ["Alumni"],
        summary: "Filter and list alumni profiles",
        description: "Search and filter alumni profiles by keyword, academic department, graduation year, or mentorship status.",
        parameters: [
          { name: "search", in: "query", required: false, schema: { type: "string" }, description: "Name, company, role, or skill search query" },
          { name: "department", in: "query", required: false, schema: { type: "string" }, description: "Academic department filter" },
          { name: "year", in: "query", required: false, schema: { type: "string" }, description: "Graduation year" },
          { name: "mentorOnly", in: "query", required: false, schema: { type: "boolean" }, description: "Filter mentors only" }
        ],
        responses: {
          "200": { description: "List of filtered alumni" }
        }
      },
      post: {
        tags: ["Alumni"],
        summary: "Create a new alumni profile",
        description: "Adds a new alumni profile to the system.",
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
                  bio: { type: "string", example: "Consulting alumni open for networking." },
                  isMentor: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Alumni profile created successfully" }
        }
      }
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Platform statistics",
        description: "Returns platform overview metrics including alumni count, employment rate, active mentors, and industry distribution.",
        responses: {
          "200": { description: "Alumni and employment statistics" }
        }
      }
    },
    "/api/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "Career and internship opportunities",
        description: "Returns active job and internship openings for alumni and students.",
        responses: {
          "200": { description: "List of jobs and internships" }
        }
      }
    },
    "/sum": {
      get: {
        tags: ["Calculator"],
        summary: "Sum two numbers (query parameters)",
        description: "Calculates the sum of number1 and number2 query parameters, returning either JSON or an interactive HTML calculator.",
        parameters: [
          { name: "number1", in: "query", required: false, schema: { type: "number" }, example: 5 },
          { name: "number2", in: "query", required: false, schema: { type: "number" }, example: 10 }
        ],
        responses: {
          "200": { description: "Sum result or calculation form" }
        }
      }
    },
    "/homepage": {
      get: {
        tags: ["Calculator"],
        summary: "Standalone homepage and about page",
        description: "Renders the standalone HTML home and information page.",
        responses: {
          "200": { description: "Homepage HTML document" }
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
          department: { type: "string", example: "Computer Engineering" }
        }
      },
      UpdateUserRequest: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Ahmet Yılmaz Updated" },
          email: { type: "string", example: "ahmet.updated@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"], example: "ALUMNI" },
          department: { type: "string", example: "Software Engineering" }
        }
      },
      PatchUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ahmet Yılmaz" },
          email: { type: "string", example: "ahmet@alumni.edu" },
          role: { type: "string", enum: ["ADMIN", "ALUMNI", "STUDENT"] },
          department: { type: "string", example: "Data Science" }
        }
      }
    }
  }
};

const renderSwaggerUI = (spec) => `<!DOCTYPE html>
<html lang="en">
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
      <a href="/users">👥 User Dashboard (/users)</a>
      <a href="/api/health" target="_blank">🩺 Health Check</a>
      <a href="/">🏠 Home</a>
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
