const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(APPLICATIONS_FILE)) fs.writeFileSync(APPLICATIONS_FILE, '[]', 'utf8');
const announcements = [
  { id: 1, title: 'Welcome to BIG BRAIN ACADEMY', message: 'Learn • Grow • Succeed', date: new Date().toISOString().slice(0, 10) },
  { id: 2, title: 'Admissions enquiries', message: 'Contact the school office for current admission information.', date: new Date().toISOString().slice(0, 10) }
];
function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 100000) { reject(new Error('Request too large')); req.destroy(); } });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}
function clean(value, max = 120) { return String(value ?? '').trim().replace(/[<>]/g, '').slice(0, max); }
function readApplications() { try { return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf8')); } catch { return []; } }
function saveApplications(rows) { fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(rows, null, 2), 'utf8'); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); return res.end(); }
  if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true, service: 'BIG BRAIN ACADEMY API', time: new Date().toISOString() });
  if (url.pathname === '/api/announcements' && req.method === 'GET') return send(res, 200, announcements);
  if (url.pathname === '/api/applications' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const name = clean(body.name, 100), guardian = clean(body.guardian, 100), phone = clean(body.phone, 30), email = clean(body.email, 150), grade = clean(body.grade, 60);
      if (!name || !guardian || !phone || !grade) return send(res, 400, { error: 'Please provide learner name, parent/guardian, phone number, and class/grade.' });
      const rows = readApplications();
      const record = { id: crypto.randomUUID(), name, guardian, phone, email, grade, createdAt: new Date().toISOString(), status: 'received' };
      rows.push(record); saveApplications(rows);
      return send(res, 201, { message: 'Application enquiry received.', reference: record.id });
    } catch (error) { return send(res, error.message === 'Invalid JSON' ? 400 : 413, { error: error.message || 'Could not process request.' }); }
  }
  if (url.pathname.startsWith('/api/')) return send(res, 404, { error: 'API endpoint not found.' });
  let requested = decodeURIComponent(url.pathname); if (requested === '/') requested = '/index.html';
  const safePath = path.resolve(ROOT, '.' + requested);
  if (!safePath.startsWith(ROOT + path.sep) && safePath !== ROOT) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  fs.readFile(safePath, (err, contents) => {
    if (err) return send(res, 404, 'File not found', 'text/plain; charset=utf-8');
    const ext = path.extname(safePath).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
    send(res, 200, contents, types[ext] || 'application/octet-stream');
  });
});
server.listen(PORT, HOST, () => {
  console.log(`BIG BRAIN ACADEMY frontend: http://localhost:${PORT}/`);
  console.log(`API health check:          http://localhost:${PORT}/api/health`);
  console.log(`API announcements:         http://localhost:${PORT}/api/announcements`);
  console.log('Application enquiries are saved in data/applications.json');
});
