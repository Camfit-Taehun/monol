/**
 * monol-sync: Client module for sending events to monol-server
 *
 * Usage in plugins:
 *
 *   const sync = require('monol-sync');
 *
 *   // Configure (once at startup)
 *   sync.configure({
 *     serverUrl: 'http://localhost:3000',
 *     user: 'alice',
 *     team: 'myteam',
 *     plugin: 'monol-logs'
 *   });
 *
 *   // Send events
 *   sync.send('session_saved', {
 *     sessionId: 'abc123',
 *     topic: 'feature-x',
 *     messageCount: 42
 *   });
 */

const https = require('https');
const http = require('http');

let config = {
  serverUrl: process.env.MONOL_SERVER_URL || 'http://localhost:3000',
  user: process.env.MONOL_USER || process.env.USER || 'anonymous',
  team: process.env.MONOL_TEAM || null,
  plugin: 'unknown',
  enabled: true,
  timeout: 5000,
  retries: 2
};

/**
 * Configure the sync client
 */
function configure(options) {
  config = { ...config, ...options };
}

/**
 * Send an event to the server
 */
async function send(type, data = {}) {
  if (!config.enabled) return { success: true, skipped: true };

  const payload = {
    user: config.user,
    team: config.team,
    plugin: config.plugin,
    type,
    data,
    timestamp: new Date().toISOString()
  };

  let lastError;
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const result = await postJSON(`${config.serverUrl}/api/events`, payload);
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < config.retries) {
        await sleep(1000 * (attempt + 1)); // Exponential backoff
      }
    }
  }

  console.error(`[monol-sync] Failed to send event after ${config.retries + 1} attempts:`, lastError.message);
  return { success: false, error: lastError.message };
}

/**
 * Send event without waiting (fire and forget)
 */
function sendAsync(type, data = {}) {
  send(type, data).catch(() => {});
}

/**
 * Helper: POST JSON
 */
function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const body = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: config.timeout
    };

    const req = lib.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error || `HTTP ${res.statusCode}`));
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convenience methods for common events
 */
const events = {
  // monol-logs events
  sessionSaved: (data) => send('session_saved', data),
  sessionResumed: (data) => send('session_resumed', data),

  // monol-rulebook events
  ruleAdded: (data) => send('rule_added', data),
  ruleUpdated: (data) => send('rule_updated', data),
  ruleDeleted: (data) => send('rule_deleted', data),

  // monol-scout events
  pluginInstalled: (data) => send('plugin_installed', data),
  pluginUninstalled: (data) => send('plugin_uninstalled', data),
  pluginSearched: (data) => send('plugin_searched', data)
};

module.exports = {
  configure,
  send,
  sendAsync,
  events,
  // For testing
  _getConfig: () => ({ ...config })
};
