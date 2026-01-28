# monol-server

Central server for monol plugins - logs, rulebook, scout, and more.

## Features

- **Unified Dashboard**: View all team activity in one place
- **Real-time Stats**: Sessions, rules, plugin usage
- **Activity Heatmap**: See when your team is most active
- **User Contributions**: Track who's doing what
- **Plugin Agnostic**: Works with any monol plugin

## Quick Start

```bash
# Install dependencies
npm install

# Seed demo data (optional)
node scripts/seed-demo.js

# Start server
npm start

# Open dashboard
open http://localhost:3000
```

## API Endpoints

### Events

```
POST /api/events          # Send event from plugin
GET  /api/events          # Query events (with filters)
```

**Event Payload:**
```json
{
  "user": "alice",
  "team": "myteam",
  "plugin": "monol-logs",
  "type": "session_saved",
  "data": {
    "sessionId": "abc123",
    "topic": "feature-x",
    "messageCount": 42
  }
}
```

### Stats

```
GET /api/stats/overview   # Overall statistics
GET /api/stats/users      # Per-user statistics
GET /api/stats/activity   # Activity over time
GET /api/stats/heatmap    # Activity heatmap data
GET /api/stats/sessions   # Session list
GET /api/stats/rules      # Rules list
GET /api/stats/plugins    # Plugin usage
```

**Query Parameters:**
- `team` - Filter by team ID
- `user` - Filter by user ID
- `days` - Number of days to look back (default: 30)

## Plugin Integration

### Using the sync client

```javascript
const sync = require('./src/client/sync');

// Configure once
sync.configure({
  serverUrl: 'http://your-server:3000',
  user: 'alice',
  team: 'myteam',
  plugin: 'monol-logs'
});

// Send events
sync.send('session_saved', {
  sessionId: 'abc123',
  topic: 'feature-x',
  messageCount: 42
});

// Or use convenience methods
sync.events.sessionSaved({ ... });
sync.events.ruleAdded({ ... });
sync.events.pluginInstalled({ ... });
```

### Environment Variables

```bash
MONOL_SERVER_URL=http://localhost:3000
MONOL_USER=alice
MONOL_TEAM=myteam
PORT=3000
MONOL_DB_PATH=./data/monol.db
```

## Event Types

### monol-logs
- `session_saved` - Session saved/exported
- `session_resumed` - Session resumed

### monol-rulebook
- `rule_added` - New rule created
- `rule_updated` - Rule modified
- `rule_deleted` - Rule removed

### monol-scout
- `plugin_installed` - Plugin installed
- `plugin_uninstalled` - Plugin removed
- `plugin_searched` - Search performed

## Database

Uses SQLite for simplicity. Data stored in `data/monol.db`.

Tables:
- `teams` - Team information
- `users` - User profiles
- `events` - All plugin events
- `sessions` - Session details (monol-logs)
- `rules` - Rule definitions (monol-rulebook)
- `plugin_installations` - Installed plugins (monol-scout)

## Deployment

```bash
# Production
PORT=3000 node server.js

# With PM2
pm2 start server.js --name monol-server

# Docker (create your own Dockerfile)
docker build -t monol-server .
docker run -p 3000:3000 -v ./data:/app/data monol-server
```

## License

MIT
