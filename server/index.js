import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createDb } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'secret';

let db;
createDb().then(database => {
  db = database;
});

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO users (id, email, password, name, currency, locale, theme, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, hashed, name, 'COP', 'es-CO', 'light', now]
    );
    const token = jwt.sign({ id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email, name, currency: 'COP', locale: 'es-CO', theme: 'light', createdAt: now } });
  } catch (err) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, currency: user.currency, locale: user.locale, theme: user.theme, createdAt: user.created_at } });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function mapAccount(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    openingBalance: row.opening_balance,
    currentBalance: row.current_balance,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

app.get('/api/accounts', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM accounts WHERE user_id = ?', [req.userId]);
  res.json(rows.map(mapAccount));
});

app.post('/api/accounts', authMiddleware, async (req, res) => {
  const { name, type, initialBalance } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run(
    'INSERT INTO accounts (id, user_id, name, type, currency, opening_balance, current_balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, name, type, 'COP', initialBalance, initialBalance, now, now]
  );
  const account = await db.get('SELECT * FROM accounts WHERE id = ?', [id]);
  res.json(mapAccount(account));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
