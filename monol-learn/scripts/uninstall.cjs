#!/usr/bin/env node
/**
 * Pre-uninstall script for monol-learn
 * Removes the plugin from Claude Code settings
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

function main() {
  console.log('📦 Uninstalling monol-learn...');

  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      console.log('No settings file found, nothing to clean up.');
      return;
    }

    const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(content);

    // Remove from extraKnownMarketplaces
    if (settings.extraKnownMarketplaces) {
      const npmEntry = '@monol/learn';
      settings.extraKnownMarketplaces = settings.extraKnownMarketplaces.filter(
        (entry) => entry !== npmEntry
      );

      // Clean up empty array
      if (settings.extraKnownMarketplaces.length === 0) {
        delete settings.extraKnownMarketplaces;
      }
    }

    // Write settings
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

    console.log('✅ monol-learn uninstalled successfully');

  } catch (error) {
    console.error('⚠️ Uninstall warning:', error.message);
  }
}

main();
