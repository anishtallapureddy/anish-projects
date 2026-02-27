import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'costseg.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Auto-create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        plan TEXT DEFAULT 'free',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        address TEXT,
        purchase_price REAL NOT NULL,
        land_value REAL,
        building_type TEXT NOT NULL,
        year_built INTEGER,
        acquisition_date TEXT NOT NULL,
        square_footage REAL,
        number_of_units INTEGER DEFAULT 1,
        features TEXT,
        renovations TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        classification TEXT,
        depreciation TEXT,
        tax_rate REAL DEFAULT 0.37,
        discount_rate REAL DEFAULT 0.06,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (property_id) REFERENCES properties(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }
  return db;
}
