const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const eventsRouter = require('./src/api/events');
const statsRouter = require('./src/api/stats');
const pluginsRouter = require('./src/api/plugins');
const webhooksRouter = require('./src/api/webhooks');

const app = express();
const PORT = process.env.PORT || 3001;

// HTTP 서버 생성 (WebSocket용)
const server = http.createServer(app);

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`[WebSocket] Client connected (total: ${wsClients.size})`);

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`[WebSocket] Client disconnected (total: ${wsClients.size})`);
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err.message);
    wsClients.delete(ws);
  });

  // 연결 확인 메시지
  ws.send(JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() }));
});

// WebSocket 클라이언트를 웹훅 라우터에 주입
webhooksRouter.setWsClients(wsClients);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/webhooks', webhooksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   monol-console v1.0.0                      ║
║                                            ║
║   Dashboard: http://localhost:${PORT}          ║
║   API:       http://localhost:${PORT}/api      ║
║   WebSocket: ws://localhost:${PORT}/ws         ║
║   Webhook:   POST /api/webhooks/github     ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});
