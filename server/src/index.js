const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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
    name: "Ayşe Yılmaz",
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
    name: "Burak Demir",
    graduationYear: 2019,
    department: "Industrial Engineering",
    company: "Amazon",
    role: "Lead Product Manager",
    location: "London, UK",
    industry: "E-Commerce",
    skills: ["Product Strategy", "Agile", "Data Analytics", "UX"],
    linkedin: "https://linkedin.com/in/example",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Passionate about building customer-centric products. Mentor for tech career transitions."
  },
  {
    id: "3",
    name: "Zeynep Kaya",
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

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgresConnected: isDbConnected,
    environment: process.env.NODE_ENV || 'development',
    serverVersion: '1.0.0'
  });
});

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
