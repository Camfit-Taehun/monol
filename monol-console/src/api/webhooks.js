const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);
const router = express.Router();

// 플러그인-레포 매핑
const REPO_PLUGIN_MAP = {
  'monol-plugin-scout': 'scout',
  'monol-channels': 'channels',
  'monol-x': 'x',
  'monol-logs': 'logs',
  'monol-rulebook': 'rulebook'
};

// 플러그인 경로 매핑
const PLUGIN_PATHS = {
  'scout': path.resolve(__dirname, '../../../monol-plugin-scout'),
  'channels': path.resolve(__dirname, '../../../monol-channels'),
  'x': path.resolve(__dirname, '../../../monol-x'),
  'logs': path.resolve(__dirname, '../../../monol-logs'),
  'rulebook': path.resolve(__dirname, '../../../monol-rulebook')
};

// WebSocket 클라이언트 저장 (server.js에서 주입)
let wsClients = new Set();

// WebSocket 클라이언트 설정
function setWsClients(clients) {
  wsClients = clients;
}

// 브라우저에 알림 전송
function notifyBrowsers(event, data) {
  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wsClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
  console.log(`[WebSocket] Notified ${wsClients.size} clients: ${event}`);
}

// GitHub 웹훅 시크릿 검증
function verifyGitHubSignature(req, secret) {
  if (!secret) return true; // 시크릿 미설정 시 스킵

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * POST /api/webhooks/github
 * GitHub 웹훅 수신 및 처리
 */
router.post('/github', async (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  // 시크릿 검증
  if (secret && !verifyGitHubSignature(req, secret)) {
    console.warn('[Webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const { repository, ref, pusher } = req.body;

  // push 이벤트만 처리
  if (event !== 'push') {
    console.log(`[Webhook] Ignoring event: ${event}`);
    return res.json({ ok: true, ignored: true, reason: `Event type: ${event}` });
  }

  // main/master 브랜치만 처리
  const branch = ref?.replace('refs/heads/', '');
  if (!['main', 'master'].includes(branch)) {
    console.log(`[Webhook] Ignoring branch: ${branch}`);
    return res.json({ ok: true, ignored: true, reason: `Branch: ${branch}` });
  }

  const repoName = repository?.name;
  const pluginId = REPO_PLUGIN_MAP[repoName];

  if (!pluginId) {
    console.log(`[Webhook] Unknown repository: ${repoName}`);
    return res.json({ ok: true, ignored: true, reason: `Unknown repo: ${repoName}` });
  }

  const pluginPath = PLUGIN_PATHS[pluginId];

  console.log(`[Webhook] Processing push to ${repoName} (${branch}) by ${pusher?.name}`);

  try {
    // git pull 실행
    console.log(`[Webhook] Running git pull in ${pluginPath}`);
    const { stdout, stderr } = await execAsync(`git -C "${pluginPath}" pull origin ${branch}`);

    console.log(`[Webhook] git pull output: ${stdout}`);
    if (stderr) console.warn(`[Webhook] git pull stderr: ${stderr}`);

    // 플러그인 캐시 무효화
    const pluginsRouter = require('./plugins');
    if (pluginsRouter.reloadPlugin) {
      pluginsRouter.reloadPlugin(pluginId);
    }

    // 브라우저에 알림
    notifyBrowsers('plugin-updated', {
      pluginId,
      repoName,
      branch,
      pusher: pusher?.name,
      message: `${repoName} updated`
    });

    res.json({
      ok: true,
      plugin: pluginId,
      branch,
      output: stdout.trim()
    });

  } catch (error) {
    console.error(`[Webhook] Error updating ${pluginId}:`, error.message);

    notifyBrowsers('plugin-update-failed', {
      pluginId,
      repoName,
      error: error.message
    });

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * POST /api/webhooks/reload/:pluginId
 * 수동 플러그인 리로드
 */
router.post('/reload/:pluginId', async (req, res) => {
  const { pluginId } = req.params;
  const pluginPath = PLUGIN_PATHS[pluginId];

  if (!pluginPath) {
    return res.status(404).json({ error: `Unknown plugin: ${pluginId}` });
  }

  try {
    // git pull (선택적)
    if (req.query.pull !== 'false') {
      console.log(`[Reload] Running git pull for ${pluginId}`);
      await execAsync(`git -C "${pluginPath}" pull`);
    }

    // 플러그인 캐시 무효화
    const pluginsRouter = require('./plugins');
    if (pluginsRouter.reloadPlugin) {
      pluginsRouter.reloadPlugin(pluginId);
    }

    // 브라우저에 알림
    notifyBrowsers('plugin-updated', {
      pluginId,
      manual: true,
      message: `${pluginId} reloaded`
    });

    res.json({ ok: true, plugin: pluginId });

  } catch (error) {
    console.error(`[Reload] Error:`, error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/webhooks/status
 * 웹훅 상태 확인
 */
router.get('/status', (req, res) => {
  res.json({
    ok: true,
    plugins: Object.keys(PLUGIN_PATHS),
    repos: Object.keys(REPO_PLUGIN_MAP),
    wsClients: wsClients.size,
    secretConfigured: !!process.env.GITHUB_WEBHOOK_SECRET
  });
});

module.exports = router;
module.exports.setWsClients = setWsClients;
module.exports.notifyBrowsers = notifyBrowsers;
