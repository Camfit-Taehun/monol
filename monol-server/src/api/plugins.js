const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Manifest 캐시 (리로드 시 무효화)
const manifestCache = new Map();

// 플러그인 리로드 함수 (웹훅에서 호출)
function reloadPlugin(pluginId) {
  // 캐시 무효화
  manifestCache.delete(pluginId);
  console.log(`[Plugins] Reloaded plugin: ${pluginId}`);
  return true;
}

// 모든 플러그인 리로드
function reloadAllPlugins() {
  manifestCache.clear();
  console.log('[Plugins] Reloaded all plugins');
  return true;
}

// Plugin registry - 실제 운영에서는 DB나 설정 파일에서 로드
const PLUGIN_REGISTRY = {
  'scout': {
    id: 'monol-plugin-scout',
    basePath: path.resolve(__dirname, '../../../monol-plugin-scout'),
    webPath: 'monol-plugin-scout-pkg/web'
  },
  'channels': {
    id: 'monol-channels',
    basePath: path.resolve(__dirname, '../../../monol-channels'),
    webPath: 'monol-channels-pkg/assets'
  },
  'x': {
    id: 'monol-x',
    basePath: path.resolve(__dirname, '../../../monol-x'),
    webPath: 'dashboard/static'
  },
  'logs': {
    id: 'monol-logs',
    basePath: path.resolve(__dirname, '../../../monol-logs'),
    webPath: 'monol-logs-pkg/assets'
  },
  'rulebook': {
    id: 'monol-rulebook',
    basePath: path.resolve(__dirname, '../../../monol-rulebook'),
    webPath: 'web'
  }
};

/**
 * GET /api/plugins
 * List all available plugins with console support
 */
router.get('/', (req, res) => {
  const plugins = [];

  for (const [key, config] of Object.entries(PLUGIN_REGISTRY)) {
    const manifestPath = path.join(config.basePath, config.webPath, 'manifest.json');

    let manifest = null;
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {
        console.warn(`Failed to load manifest for ${key}:`, e.message);
      }
    }

    plugins.push({
      id: key,
      pluginId: config.id,
      hasConsole: !!manifest,
      manifest: manifest ? {
        name: manifest.name,
        version: manifest.version,
        icon: manifest.icon,
        description: manifest.description
      } : null
    });
  }

  res.json(plugins);
});

/**
 * GET /api/plugins/:id/manifest
 * Get plugin's console manifest
 */
router.get('/:id/manifest', (req, res) => {
  const { id } = req.params;
  const config = PLUGIN_REGISTRY[id];

  if (!config) {
    return res.status(404).json({ error: 'Plugin not found' });
  }

  const manifestPath = path.join(config.basePath, config.webPath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: 'Plugin console manifest not found' });
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    res.json(manifest);
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse manifest' });
  }
});

/**
 * GET /api/plugins/:id/web/*
 * Serve plugin's web assets
 */
router.get('/:id/web/*', (req, res) => {
  const { id } = req.params;
  const config = PLUGIN_REGISTRY[id];

  if (!config) {
    return res.status(404).json({ error: 'Plugin not found' });
  }

  // Get the requested file path after /web/
  const requestedPath = req.params[0] || 'console.html';
  const filePath = path.join(config.basePath, config.webPath, requestedPath);

  // Security: ensure the path is within the plugin's web directory
  const webDir = path.join(config.basePath, config.webPath);
  if (!filePath.startsWith(webDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

/**
 * GET /api/plugins/:id/components/*
 * Serve plugin's reusable components (ES modules)
 */
router.get('/:id/components/*', (req, res) => {
  const { id } = req.params;
  const config = PLUGIN_REGISTRY[id];

  if (!config) {
    return res.status(404).json({ error: 'Plugin not found' });
  }

  const requestedPath = req.params[0] || 'index.js';
  const filePath = path.join(config.basePath, config.webPath, 'components', requestedPath);

  // Security check
  const componentsDir = path.join(config.basePath, config.webPath, 'components');
  if (!filePath.startsWith(componentsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Component not found' });
  }

  // Set correct MIME type for JS modules
  res.type('application/javascript');
  res.sendFile(filePath);
});

/**
 * GET /api/plugins/:id/design-system/*
 * Serve shared design system files for plugins
 */
router.get('/:id/design-system/*', (req, res) => {
  const requestedFile = req.params[0];
  const designSystemPath = path.resolve(__dirname, '../../public/design-system', requestedFile);

  // Security check
  const designSystemDir = path.resolve(__dirname, '../../public/design-system');
  if (!designSystemPath.startsWith(designSystemDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(designSystemPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(designSystemPath);
});

module.exports = router;
module.exports.reloadPlugin = reloadPlugin;
module.exports.reloadAllPlugins = reloadAllPlugins;
