#!/usr/bin/env node
/**
 * Post-install script for monol-learn
 * Registers the plugin with Claude Code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

function main() {
  console.log('📦 Installing monol-learn...');

  try {
    // Ensure .claude directory exists
    const claudeDir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }

    // Read or create settings
    let settings = {};
    if (fs.existsSync(SETTINGS_PATH)) {
      const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      settings = JSON.parse(content);
    }

    // Add to extraKnownMarketplaces
    if (!settings.extraKnownMarketplaces) {
      settings.extraKnownMarketplaces = [];
    }

    const npmEntry = '@monol/learn';
    if (!settings.extraKnownMarketplaces.includes(npmEntry)) {
      settings.extraKnownMarketplaces.push(npmEntry);
    }

    // Write settings
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

    console.log('✅ monol-learn installed successfully');
    console.log('');
    console.log('Available commands:');
    console.log('  /discover      - Discover new skills');
    console.log('  /compare       - Run A/B comparisons');
    console.log('  /absorb        - Absorb knowledge from URLs');
    console.log('  /learn-status  - View learning dashboard');

  } catch (error) {
    console.error('⚠️ Installation warning:', error.message);
    console.log('You may need to manually add @monol/learn to your Claude Code settings.');
  }
}

main();
