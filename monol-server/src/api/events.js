const express = require('express');
const router = express.Router();
const db = require('../db');

// Prepared statements
const insertEvent = db.prepare(`
  INSERT INTO events (user_id, team_id, plugin_id, event_type, data)
  VALUES (?, ?, ?, ?, ?)
`);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, team_id)
  VALUES (?, ?, ?)
`);

const updateUserActivity = db.prepare(`
  UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?
`);

const insertTeam = db.prepare(`
  INSERT OR IGNORE INTO teams (id, name)
  VALUES (?, ?)
`);

const getEvents = db.prepare(`
  SELECT e.*, u.name as user_name, p.name as plugin_name
  FROM events e
  LEFT JOIN users u ON e.user_id = u.id
  LEFT JOIN plugins p ON e.plugin_id = p.id
  WHERE (? IS NULL OR e.team_id = ?)
    AND (? IS NULL OR e.user_id = ?)
    AND (? IS NULL OR e.plugin_id = ?)
    AND (? IS NULL OR e.event_type = ?)
  ORDER BY e.created_at DESC
  LIMIT ?
`);

/**
 * POST /api/events
 * Receive events from plugins
 */
router.post('/', (req, res) => {
  try {
    const { user, team, plugin, type, data } = req.body;

    if (!user || !plugin || !type) {
      return res.status(400).json({
        error: 'Missing required fields: user, plugin, type'
      });
    }

    // Ensure team exists
    if (team) {
      insertTeam.run(team, team);
    }

    // Ensure user exists
    insertUser.run(user, user, team || null);
    updateUserActivity.run(user);

    // Insert event
    const result = insertEvent.run(
      user,
      team || null,
      plugin,
      type,
      data ? JSON.stringify(data) : null
    );

    // Handle plugin-specific data
    handlePluginEvent(plugin, type, { user, team, data });

    res.json({
      success: true,
      eventId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error inserting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/events
 * Query events with filters
 */
router.get('/', (req, res) => {
  try {
    const { team, user, plugin, type, limit = 100 } = req.query;

    const events = getEvents.all(
      team || null, team || null,
      user || null, user || null,
      plugin || null, plugin || null,
      type || null, type || null,
      Math.min(parseInt(limit), 1000)
    );

    // Parse JSON data
    events.forEach(e => {
      if (e.data) {
        try {
          e.data = JSON.parse(e.data);
        } catch {}
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle plugin-specific event processing
 */
function handlePluginEvent(plugin, type, { user, team, data }) {
  switch (plugin) {
    case 'monol-logs':
      handleLogsEvent(type, { user, team, data });
      break;
    case 'monol-rulebook':
      handleRulebookEvent(type, { user, team, data });
      break;
    case 'monol-scout':
      handleScoutEvent(type, { user, team, data });
      break;
    case 'monol-channels':
      handleChannelsEvent(type, { user, team, data });
      break;
    case 'monol-x':
      handleMonolXEvent(type, { user, team, data });
      break;
  }
}

// monol-logs specific handlers
const insertSession = db.prepare(`
  INSERT OR REPLACE INTO sessions (id, user_id, team_id, topic, message_count, duration_ms, summary, todos, started_at, ended_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function handleLogsEvent(type, { user, team, data }) {
  if (type === 'session_saved' && data) {
    insertSession.run(
      data.sessionId,
      user,
      team || null,
      data.topic || null,
      data.messageCount || 0,
      data.durationMs || 0,
      data.summary || null,
      data.todos ? JSON.stringify(data.todos) : null,
      data.startedAt || null,
      data.endedAt || null
    );
  }
}

// monol-rulebook specific handlers
const insertRule = db.prepare(`
  INSERT OR REPLACE INTO rules (id, user_id, team_id, name, category, severity, content)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

function handleRulebookEvent(type, { user, team, data }) {
  if (type === 'rule_added' && data) {
    insertRule.run(
      data.id || `${user}-${Date.now()}`,
      user,
      team || null,
      data.name,
      data.category || null,
      data.severity || 'warning',
      data.content || null
    );
  }
}

// monol-scout specific handlers
const insertPluginInstall = db.prepare(`
  INSERT INTO plugin_installations (user_id, team_id, plugin_name, plugin_version)
  VALUES (?, ?, ?, ?)
`);

function handleScoutEvent(type, { user, team, data }) {
  if (type === 'plugin_installed' && data) {
    insertPluginInstall.run(
      user,
      team || null,
      data.pluginName,
      data.version || null
    );
  }
}

// monol-channels specific handlers
function handleChannelsEvent(type, { user, team, data }) {
  // 채널 이벤트는 현재 events 테이블에만 저장
  // 필요시 channels, messages 테이블 추가 가능
  console.log(`[channels] ${type} from ${user}:`, data);
}

// monol-x specific handlers
function handleMonolXEvent(type, { user, team, data }) {
  // monol-x 이벤트는 현재 events 테이블에만 저장
  // 필요시 evaluations, pipelines 테이블 추가 가능
  console.log(`[monol-x] ${type} from ${user}:`, data);
}

module.exports = router;
