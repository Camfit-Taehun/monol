const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.MONOL_DB_PATH || path.join(__dirname, '../../data/monol.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  -- Teams
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Users
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team_id TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  -- Plugins registry
  CREATE TABLE IF NOT EXISTS plugins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Events (generic, for all plugins)
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    team_id TEXT,
    plugin_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id)
  );

  -- Sessions (monol-logs specific, but useful for stats)
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT,
    topic TEXT,
    message_count INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    summary TEXT,
    todos JSON,
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  -- Rules (monol-rulebook specific)
  CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT,
    name TEXT NOT NULL,
    category TEXT,
    severity TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  -- Plugin installations (monol-scout specific)
  CREATE TABLE IF NOT EXISTS plugin_installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    team_id TEXT,
    plugin_name TEXT NOT NULL,
    plugin_version TEXT,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  -- Create indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_events_team ON events(team_id);
  CREATE INDEX IF NOT EXISTS idx_events_plugin ON events(plugin_id);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_team ON sessions(team_id);
`);

// Insert default plugins
const insertPlugin = db.prepare(`
  INSERT OR IGNORE INTO plugins (id, name, description)
  VALUES (?, ?, ?)
`);

insertPlugin.run('monol-logs', 'Session Logs', 'Claude Code session management and visualization');
insertPlugin.run('monol-rulebook', 'Rulebook', 'Team coding rules and guidelines');
insertPlugin.run('monol-scout', 'Plugin Scout', 'Plugin marketplace and recommendations');
insertPlugin.run('monol-channels', 'Channels', 'Team communication and collaboration');
insertPlugin.run('monol-x', 'Monol Core', 'Worktree, session, context, and workflow management');

module.exports = db;
