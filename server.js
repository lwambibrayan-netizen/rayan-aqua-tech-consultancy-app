const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new sqlite3.Database(path.join(DATA_DIR, 'workspace.sqlite'));
const prod = process.env.NODE_ENV === 'production';
const appOrigin = process.env.APP_ORIGIN || '';

const run = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function (e) { e ? reject(e) : resolve(this); }));
const get = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (e, row) => e ? reject(e) : resolve(row)));
const all = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (e, rows) => e ? reject(e) : resolve(rows)));

async function init() {
  await run('PRAGMA foreign_keys = ON');
  await run('PRAGMA journal_mode = WAL');
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, state_json TEXT NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE TABLE IF NOT EXISTS memberships (
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('Admin','Engineer','Reviewer','Project lead')),
    PRIMARY KEY(workspace_id,user_id)
  )`);
  await run('CREATE INDEX IF NOT EXISTS memberships_user_idx ON memberships(user_id)');
}

app.disable('x-powered-by');
if (prod) app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '12mb' }));
app.use(session({
  name: 'rat.sid',
  secret: process.env.SESSION_SECRET || (!prod ? 'local-development-secret-change-this-before-deploying' : require('node:crypto').randomBytes(48).toString('hex')),
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: DATA_DIR, concurrentDB: true }),
  cookie: { httpOnly: true, secure: prod, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many authentication attempts. Try again later.' } });
const emailOk = v => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const roleOk = v => ['Admin', 'Engineer', 'Reviewer', 'Project lead'].includes(v);

async function membership(req, res, admin = false) {
  if (!req.session.userId) { res.status(401).json({ error: 'Sign in required.' }); return null; }
  const row = await get(`SELECT m.workspace_id AS workspaceId,m.role,u.email,u.name
    FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.user_id=? ORDER BY m.workspace_id LIMIT 1`, [req.session.userId]);
  if (!row) { res.status(403).json({ error: 'No workspace membership is available.' }); return null; }
  if (admin && row.role !== 'Admin') { res.status(403).json({ error: 'Workspace admin access required.' }); return null; }
  return row;
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, epanetConfigured: Boolean(process.env.EPANET_SERVICE_URL), qgisConfigured: Boolean(process.env.QGIS_SERVICE_URL) });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password, workspaceName } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !emailOk(email) || typeof password !== 'string' || password.length < 12 || password.length > 200) {
    return res.status(400).json({ error: 'Provide your name, a valid email, and a password of at least 12 characters.' });
  }
  try {
    const user = await run('INSERT INTO users(email,name,password_hash) VALUES(?,?,?)', [email.trim().toLowerCase(), name.trim(), await bcrypt.hash(password, 12)]);
    const initial = { theme: 'light', projects: [], team: [{ id: user.lastID, name: name.trim(), email: email.trim().toLowerCase(), role: 'Admin' }], boq: [], contingency: 10, tax: 5, nodes: [], pipes: [], report: '', geography: { layers: [] }, drawingLines: [] };
    const workspace = await run('INSERT INTO workspaces(name,state_json) VALUES(?,?)', [(String(workspaceName || '').trim() || `${name.trim()}'s workspace`).slice(0, 120), JSON.stringify(initial)]);
    await run('INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,?)', [workspace.lastID, user.lastID, 'Admin']);
    req.session.userId = user.lastID;
    res.status(201).json({ user: { id: user.lastID, name: name.trim(), email: email.trim().toLowerCase(), role: 'Admin' } });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'An account with that email already exists. Sign in instead.' });
    console.error('Registration failed', e); res.status(500).json({ error: 'Account could not be created.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!emailOk(email) || typeof password !== 'string' || password.length > 200) return res.status(400).json({ error: 'Enter a valid email and password.' });
  const user = await get('SELECT id,email,name,password_hash FROM users WHERE email=? COLLATE NOCASE', [email.trim()]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Could not start a secure session.' });
    req.session.userId = user.id;
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Sign in required.' });
  const row = await get(`SELECT u.id,u.name,u.email,m.role,w.name AS workspaceName
    FROM users u JOIN memberships m ON m.user_id=u.id JOIN workspaces w ON w.id=m.workspace_id WHERE u.id=? ORDER BY w.id LIMIT 1`, [req.session.userId]);
  if (!row) return res.status(401).json({ error: 'Workspace membership is missing.' });
  res.json({ user: { id: row.id, name: row.name, email: row.email, role: row.role }, workspace: row.workspaceName });
});
app.post('/api/auth/logout', (req, res) => req.session.destroy(() => { res.clearCookie('rat.sid', { httpOnly: true, secure: prod, sameSite: 'lax' }); res.status(204).end(); }));

app.get('/api/workspace/state', async (req, res) => {
  const m = await membership(req, res); if (!m) return;
  const workspace = await get('SELECT state_json,version FROM workspaces WHERE id=?', [m.workspaceId]);
  const state = JSON.parse(workspace.state_json || '{}');
  const members = await all(`SELECT u.id,u.name,u.email,m.role FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=? ORDER BY u.name`, [m.workspaceId]);
  state.team = members;
  res.json({ state, version: workspace.version, workspace: { id: m.workspaceId, role: m.role } });
});

app.put('/api/workspace/state', async (req, res) => {
  const m = await membership(req, res); if (!m) return;
  const state = req.body?.state;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Buffer.byteLength(JSON.stringify(state)) > 10 * 1024 * 1024) return res.status(400).json({ error: 'Workspace data must be a JSON object under 10 MB.' });
  const current = await get('SELECT version FROM workspaces WHERE id=?', [m.workspaceId]);
  if (req.body.version !== undefined && Number(req.body.version) !== current.version) return res.status(409).json({ error: 'Workspace changed in another session. Reload the latest version before saving.', version: current.version });
  delete state.team;
  const result = await run('UPDATE workspaces SET state_json=?,version=version+1 WHERE id=? AND version=?', [JSON.stringify(state), m.workspaceId, current.version]);
  if (!result.changes) return res.status(409).json({ error: 'Workspace changed in another session. Reload before saving.' });
  res.json({ version: current.version + 1 });
});

app.get('/api/team', async (req, res) => {
  const m = await membership(req, res); if (!m) return;
  res.json(await all(`SELECT u.id,u.name,u.email,m.role FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=? ORDER BY u.name`, [m.workspaceId]));
});
app.post('/api/team/invite', async (req, res) => {
  const m = await membership(req, res, true); if (!m) return;
  const { email, role } = req.body || {};
  if (!emailOk(email) || !roleOk(role) || email.toLowerCase() === m.email.toLowerCase()) return res.status(400).json({ error: 'Provide a valid registered email and supported role.' });
  const user = await get('SELECT id,email,name FROM users WHERE email=? COLLATE NOCASE', [email.trim()]);
  if (!user) return res.status(404).json({ error: 'That person needs to create an account before you can add them to this workspace.' });
  try { await run('INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,?)', [m.workspaceId, user.id, role]); }
  catch (e) { if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'That user is already a workspace member.' }); throw e; }
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role });
});

async function serviceProxy(req, res, base, pathName) {
  if (!base) return res.status(503).json({ error: `${pathName === '/simulate' ? 'EPANET' : 'QGIS'} service is not configured. Set its service URL on the server.` });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.SERVICE_TIMEOUT_MS || 120000));
  try {
    const response = await fetch(new URL(pathName, base.endsWith('/') ? base : `${base}/`), {
      method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.SERVICE_TOKEN ? { authorization: `Bearer ${process.env.SERVICE_TOKEN}` } : {}) },
      body: JSON.stringify(req.body), signal: controller.signal
    });
    const body = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(body);
  } catch (e) {
    const timeoutError = e.name === 'AbortError';
    res.status(timeoutError ? 504 : 502).json({ error: timeoutError ? 'Engineering service timed out.' : 'Engineering service is unavailable.' });
  } finally { clearTimeout(timeout); }
}
app.post('/api/simulations', async (req, res) => {
  if (!await membership(req, res)) return;
  if (typeof req.body?.inp !== 'string' || req.body.inp.length > 8 * 1024 * 1024) return res.status(400).json({ error: 'Submit a valid EPANET INP network file under 8 MB.' });
  return serviceProxy(req, res, process.env.EPANET_SERVICE_URL, '/simulate');
});
app.post('/api/gis/run', async (req, res) => {
  if (!await membership(req, res)) return;
  if (typeof req.body?.algorithm !== 'string' || !req.body.geojson) return res.status(400).json({ error: 'A QGIS algorithm and input GeoJSON are required.' });
  return serviceProxy(req, res, process.env.QGIS_SERVICE_URL, '/run');
});

app.use(express.static(path.join(__dirname), { etag: true, maxAge: prod ? '1h' : 0, index: 'index.html' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

init().then(() => app.listen(PORT, () => console.log(`Rayan Aqua Tech server listening on ${PORT}`))).catch(e => { console.error('Database initialization failed', e); process.exit(1); });
