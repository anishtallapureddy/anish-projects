// Database setup script — run with: npm run db:setup
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'costseg.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

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
    features TEXT, -- JSON
    renovations TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    classification TEXT, -- JSON
    depreciation TEXT, -- JSON
    tax_rate REAL DEFAULT 0.37,
    discount_rate REAL DEFAULT 0.06,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
  CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
  CREATE INDEX IF NOT EXISTS idx_reports_property ON reports(property_id);
`);

console.log('✅ Database created at', DB_PATH);
db.close();
