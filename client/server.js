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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend client running on http://localhost:${PORT}`);
});
