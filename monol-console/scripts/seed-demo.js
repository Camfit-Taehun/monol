/**
 * Seed demo data for testing
 * Run: node scripts/seed-demo.js
 */

const db = require('../src/db');

const users = ['alice', 'bob', 'carol', 'david'];
const teams = ['team-alpha'];
const topics = [
  'jwt-authentication', 'api-rate-limiting', 'database-indexing',
  'react-modal-component', 'jest-testing-setup', 'stripe-payment',
  'github-actions-ci', 'tailwind-responsive', 'elasticsearch',
  'websocket-notifications', 'redis-caching', 'analytics-dashboard',
  'security-audit', 'openapi-docs', 'docker-optimization'
];

const plugins = ['monol-logs', 'monol-rulebook', 'monol-scout'];
const eventTypes = {
  'monol-logs': ['session_saved', 'session_resumed'],
  'monol-rulebook': ['rule_added', 'rule_updated'],
  'monol-scout': ['plugin_installed', 'plugin_searched']
};

const ruleCategories = ['code', 'workflow', 'security', 'performance'];
const severities = ['error', 'warning', 'info'];
const ruleNames = [
  'no-console-log', 'require-tests', 'max-file-length',
  'use-typescript', 'prefer-const', 'no-any-type',
  'commit-message-format', 'pr-template-required'
];

const installedPlugins = [
  'monol-logs', 'monol-rulebook', 'monol-scout',
  'eslint-plugin', 'prettier', 'jest', 'typescript'
];

// Ensure team exists
const insertTeam = db.prepare('INSERT OR IGNORE INTO teams (id, name) VALUES (?, ?)');
teams.forEach(t => insertTeam.run(t, t));

// Insert users
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name, team_id) VALUES (?, ?, ?)');
users.forEach(u => insertUser.run(u, u, teams[0]));

// Insert events
const insertEvent = db.prepare(`
  INSERT INTO events (user_id, team_id, plugin_id, event_type, data, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Insert sessions
const insertSession = db.prepare(`
  INSERT INTO sessions (id, user_id, team_id, topic, message_count, duration_ms, started_at, ended_at, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Insert rules
const insertRule = db.prepare(`
  INSERT INTO rules (id, user_id, team_id, name, category, severity, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Insert plugin installations
const insertPluginInstall = db.prepare(`
  INSERT INTO plugin_installations (user_id, team_id, plugin_name, installed_at)
  VALUES (?, ?, ?, ?)
`);

console.log('Seeding demo data...');

// Generate events for past 14 days
const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

for (let day = 13; day >= 0; day--) {
  const dayStart = now - (day * dayMs);

  // Random number of events per day (5-20)
  const eventCount = 5 + Math.floor(Math.random() * 16);

  for (let i = 0; i < eventCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const plugin = plugins[Math.floor(Math.random() * plugins.length)];
    const types = eventTypes[plugin];
    const type = types[Math.floor(Math.random() * types.length)];

    // Random time during work hours (9-18)
    const hour = 9 + Math.floor(Math.random() * 9);
    const minute = Math.floor(Math.random() * 60);
    const timestamp = new Date(dayStart + hour * 60 * 60 * 1000 + minute * 60 * 1000);

    let data = {};

    if (plugin === 'monol-logs' && type === 'session_saved') {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const sessionId = `${user}-${timestamp.getTime()}-${Math.random().toString(36).substring(7)}`;
      const messageCount = 20 + Math.floor(Math.random() * 80);
      const durationMs = (30 + Math.floor(Math.random() * 180)) * 60 * 1000;
      const startedAt = new Date(timestamp.getTime() - durationMs);

      data = { sessionId, topic, messageCount, durationMs };

      // Also insert session (ignore if exists)
      try {
        insertSession.run(
          sessionId, user, teams[0], topic, messageCount, durationMs,
          startedAt.toISOString(), timestamp.toISOString(), timestamp.toISOString()
        );
      } catch (e) { /* ignore duplicates */ }
    } else if (plugin === 'monol-rulebook' && type === 'rule_added') {
      const name = ruleNames[Math.floor(Math.random() * ruleNames.length)];
      const category = ruleCategories[Math.floor(Math.random() * ruleCategories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const ruleId = `${user}-${name}-${timestamp.getTime()}-${Math.random().toString(36).substring(7)}`;

      data = { id: ruleId, name, category, severity };

      // Also insert rule (ignore if exists)
      try {
        insertRule.run(ruleId, user, teams[0], name, category, severity, timestamp.toISOString());
      } catch (e) { /* ignore duplicates */ }
    } else if (plugin === 'monol-scout' && type === 'plugin_installed') {
      const pluginName = installedPlugins[Math.floor(Math.random() * installedPlugins.length)];
      data = { pluginName, version: '1.0.0' };

      // Also insert installation
      insertPluginInstall.run(user, teams[0], pluginName, timestamp.toISOString());
    }

    insertEvent.run(
      user, teams[0], plugin, type,
      JSON.stringify(data), timestamp.toISOString()
    );
  }
}

console.log('Demo data seeded successfully!');
console.log(`
Summary:
- Teams: ${teams.length}
- Users: ${users.length}
- Events: ~150+
- Sessions, rules, and plugin installations generated

Start the server with:
  cd monol-server && npm start

Then open http://localhost:3000
`);
