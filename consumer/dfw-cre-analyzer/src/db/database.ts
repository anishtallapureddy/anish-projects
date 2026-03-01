import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '../../data/cre.sqlite');

// Ensure data directory exists
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db: DatabaseType = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    zpid TEXT UNIQUE NOT NULL,
    mls_id TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'TX',
    zip_code TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    property_type TEXT NOT NULL,
    listing_price REAL NOT NULL,
    sqft REAL,
    year_built INTEGER,
    lot_size REAL,
    beds_count INTEGER,
    baths_count REAL,
    description TEXT,

    zestimate_value REAL,
    zestimate_low REAL,
    zestimate_high REAL,
    rent_estimate REAL,
    price_per_sqft REAL,
    comp_avg_ppsf REAL,
    zestimate_confidence TEXT,

    underpricing_score REAL,
    comp_gap_score REAL,
    zestimate_gap_score REAL,
    rent_yield_score REAL,
    investment_flag TEXT,
    score_version INTEGER DEFAULT 1,

    walk_score INTEGER,
    transit_score INTEGER,
    bike_score INTEGER,

    listing_status TEXT NOT NULL,
    days_on_market INTEGER,
    listed_date TEXT,
    enrichment_status TEXT DEFAULT 'PENDING',
    enrichment_error TEXT,
    last_refreshed TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip_code);
  CREATE INDEX IF NOT EXISTS idx_properties_flag ON properties(investment_flag);
  CREATE INDEX IF NOT EXISTS idx_properties_score ON properties(underpricing_score);
  CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(listing_status);

  CREATE TABLE IF NOT EXISTS comps (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    zpid TEXT,
    address TEXT NOT NULL,
    sold_price REAL NOT NULL,
    sold_date TEXT NOT NULL,
    sqft REAL,
    price_per_sqft REAL,
    distance_miles REAL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_comps_property ON comps(property_id);

  CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    date TEXT NOT NULL,
    price REAL NOT NULL,
    event TEXT NOT NULL,
    source TEXT DEFAULT 'ZILLOW',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id);

  CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    filters TEXT NOT NULL,
    alert_active INTEGER DEFAULT 0,
    last_alerted TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_quota_log (
    id TEXT PRIMARY KEY,
    date TEXT DEFAULT (date('now')),
    endpoint TEXT NOT NULL,
    requests INTEGER DEFAULT 1,
    success INTEGER DEFAULT 1,
    latency_ms INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_quota_date ON api_quota_log(date);
`);

export default db;
