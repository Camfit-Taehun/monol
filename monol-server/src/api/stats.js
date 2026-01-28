const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/stats/overview
 * Get overall statistics for a team
 */
router.get('/overview', (req, res) => {
  try {
    const { team, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const teamFilter = team ? 'AND team_id = ?' : '';
    const params = team ? [since, team] : [since];

    // Total users
    const userCount = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM events
      WHERE created_at >= ? ${teamFilter}
    `).get(...params);

    // Total sessions
    const sessionCount = db.prepare(`
      SELECT COUNT(*) as count, SUM(message_count) as messages, SUM(duration_ms) as duration
      FROM sessions
      WHERE created_at >= ? ${teamFilter}
    `).get(...params);

    // Total rules
    const ruleCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM rules
      WHERE created_at >= ? ${teamFilter}
    `).get(...params);

    // Plugin installations
    const pluginCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM plugin_installations
      WHERE installed_at >= ? ${teamFilter}
    `).get(...params);

    // Events by type
    const eventsByType = db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM events
      WHERE created_at >= ? ${teamFilter}
      GROUP BY event_type
      ORDER BY count DESC
    `).all(...params);

    res.json({
      period: { days: parseInt(days), since },
      users: userCount.count,
      sessions: {
        count: sessionCount.count || 0,
        messages: sessionCount.messages || 0,
        totalDurationMs: sessionCount.duration || 0
      },
      rules: ruleCount.count,
      pluginInstallations: pluginCount.count,
      eventsByType
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/users
 * Get per-user statistics
 */
router.get('/users', (req, res) => {
  try {
    const { team, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT
        u.id,
        u.name,
        u.last_active_at,
        COUNT(DISTINCT s.id) as session_count,
        COALESCE(SUM(s.message_count), 0) as message_count,
        COALESCE(SUM(s.duration_ms), 0) as total_duration_ms,
        (SELECT COUNT(*) FROM rules r WHERE r.user_id = u.id AND r.created_at >= ?) as rule_count,
        (SELECT COUNT(*) FROM plugin_installations p WHERE p.user_id = u.id AND p.installed_at >= ?) as plugin_count
      FROM users u
      LEFT JOIN sessions s ON u.id = s.user_id AND s.created_at >= ?
      WHERE 1=1
    `;

    const params = [since, since, since];

    if (team) {
      query += ' AND u.team_id = ?';
      params.push(team);
    }

    query += ' GROUP BY u.id ORDER BY message_count DESC';

    const users = db.prepare(query).all(...params);

    res.json(users);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/activity
 * Get activity over time (for charts)
 */
router.get('/activity', (req, res) => {
  try {
    const { team, user, days = 30, groupBy = 'day' } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'week':
        dateFormat = '%Y-W%W';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    let query = `
      SELECT
        strftime('${dateFormat}', created_at) as period,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as active_users
      FROM events
      WHERE created_at >= ?
    `;

    const params = [since];

    if (team) {
      query += ' AND team_id = ?';
      params.push(team);
    }
    if (user) {
      query += ' AND user_id = ?';
      params.push(user);
    }

    query += ` GROUP BY period ORDER BY period`;

    const activity = db.prepare(query).all(...params);

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/heatmap
 * Get activity heatmap data (day of week x hour)
 */
router.get('/heatmap', (req, res) => {
  try {
    const { team, user, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT
        CAST(strftime('%w', created_at) AS INTEGER) as day_of_week,
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as count
      FROM events
      WHERE created_at >= ?
    `;

    const params = [since];

    if (team) {
      query += ' AND team_id = ?';
      params.push(team);
    }
    if (user) {
      query += ' AND user_id = ?';
      params.push(user);
    }

    query += ' GROUP BY day_of_week, hour';

    const data = db.prepare(query).all(...params);

    // Convert to matrix format
    const matrix = Array(7).fill(null).map(() => Array(24).fill(0));
    data.forEach(({ day_of_week, hour, count }) => {
      matrix[day_of_week][hour] = count;
    });

    res.json({
      matrix,
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      maxValue: Math.max(...data.map(d => d.count), 1)
    });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/plugins
 * Get plugin usage statistics
 */
router.get('/plugins', (req, res) => {
  try {
    const { team, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT
        plugin_id,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as user_count
      FROM events
      WHERE created_at >= ?
    `;

    const params = [since];

    if (team) {
      query += ' AND team_id = ?';
      params.push(team);
    }

    query += ' GROUP BY plugin_id ORDER BY event_count DESC';

    const plugins = db.prepare(query).all(...params);

    // Get installed plugins list
    let installQuery = `
      SELECT plugin_name, COUNT(*) as install_count, COUNT(DISTINCT user_id) as user_count
      FROM plugin_installations
      WHERE installed_at >= ?
    `;

    if (team) {
      installQuery += ' AND team_id = ?';
    }

    installQuery += ' GROUP BY plugin_name ORDER BY install_count DESC';

    const installations = db.prepare(installQuery).all(...params);

    res.json({ usage: plugins, installations });
  } catch (error) {
    console.error('Error fetching plugin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/sessions
 * Get session statistics
 */
router.get('/sessions', (req, res) => {
  try {
    const { team, user, days = 30, limit = 50 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT s.*, u.name as user_name
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.created_at >= ?
    `;

    const params = [since];

    if (team) {
      query += ' AND s.team_id = ?';
      params.push(team);
    }
    if (user) {
      query += ' AND s.user_id = ?';
      params.push(user);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const sessions = db.prepare(query).all(...params);

    // Parse JSON fields
    sessions.forEach(s => {
      if (s.todos) {
        try { s.todos = JSON.parse(s.todos); } catch {}
      }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/rules
 * Get rules statistics
 */
router.get('/rules', (req, res) => {
  try {
    const { team, user, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = `
      SELECT r.*, u.name as user_name
      FROM rules r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.created_at >= ?
    `;

    const params = [since];

    if (team) {
      query += ' AND r.team_id = ?';
      params.push(team);
    }
    if (user) {
      query += ' AND r.user_id = ?';
      params.push(user);
    }

    query += ' ORDER BY r.created_at DESC';

    const rules = db.prepare(query).all(...params);

    // Get category breakdown
    let categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM rules
      WHERE created_at >= ?
    `;

    if (team) {
      categoryQuery += ' AND team_id = ?';
    }

    categoryQuery += ' GROUP BY category';

    const categories = db.prepare(categoryQuery).all(...params);

    res.json({ rules, categories });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
