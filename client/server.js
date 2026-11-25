const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'healthy',
    online: true,
    service: 'alumni-client',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverVersion: '1.0.0'
  });
});

// Swagger documentation route redirect
app.get(['/api/swagger', '/swagger', '/api/docs'], (req, res) => {
  const backendPort = process.env.BACKEND_PORT || 5001;
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(`http://localhost:${backendPort}/api/swagger${queryString}`);
});

// Dedicated Register & Login page routes
app.get(['/register', '/register.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get(['/profile', '/profile.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get(['/student', '/student.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

app.get(['/alumni-portal', '/alumni-portal.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'alumni-portal.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend client running on http://localhost:${PORT}`);
});
