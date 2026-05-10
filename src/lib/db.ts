// Direct SQLite database access using better-sqlite3
// Bypasses Prisma adapter compatibility issues with v7 in dev environments

import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require("better-sqlite3");

const DB_PATH = path.resolve(process.cwd(), "prisma", "dev.db");

export interface DbUser {
  id: string;
  name: string | null;
  email: string;
  password: string;
  birthInfo: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

function getDb() {
  const db = new Database(DB_PATH);

  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      birthInfo TEXT,
      locale TEXT NOT NULL DEFAULT 'zh',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS LifeEvent (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      year INTEGER NOT NULL,
      age INTEGER,
      category TEXT NOT NULL DEFAULT 'general',
      nodeType TEXT NOT NULL DEFAULT 'milestone',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS DreamEntry (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      interpretation TEXT,
      emotion TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS DiaryEntry (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      prediction TEXT NOT NULL,
      event TEXT,
      accuracy TEXT,
      type TEXT NOT NULL DEFAULT 'daily',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export const db = {
  user: {
    findUnique: (email: string): DbUser | null => {
      const database = getDb();
      const stmt = database.prepare("SELECT * FROM User WHERE email = ?");
      return (stmt.get(email) as DbUser) ?? null;
    },
    findById: (id: string): DbUser | null => {
      const database = getDb();
      const stmt = database.prepare("SELECT * FROM User WHERE id = ?");
      return (stmt.get(id) as DbUser) ?? null;
    },
    create: (data: { id: string; name?: string; email: string; password: string }): DbUser => {
      const database = getDb();
      const stmt = database.prepare(
        "INSERT INTO User (id, name, email, password, locale, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'zh', datetime('now'), datetime('now'))"
      );
      stmt.run(data.id, data.name ?? null, data.email, data.password);
      return db.user.findById(data.id)!;
    },
  },
};
