import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

sqlite3.verbose();

export async function createDb() {
  const db = await open({
    filename: './server/database.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    currency TEXT,
    locale TEXT,
    theme TEXT,
    created_at TEXT
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    type TEXT,
    currency TEXT,
    opening_balance REAL,
    current_balance REAL,
    created_at TEXT,
    updated_at TEXT
  )`);

  return db;
}
