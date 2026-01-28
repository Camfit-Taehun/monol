#!/usr/bin/env node
/**
 * monol-learn CLI
 * Command-line interface for self-learning infrastructure
 */

import { createMonolLearn } from '../foundations/logic/lib/index.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const learn = createMonolLearn();

  switch (command) {
    case 'status':
      await showStatus(learn);
      break;

    case 'discover':
      await runDiscover(learn, args.slice(1));
      break;

    case 'daily-scan':
      await runDailyScan(learn);
      break;

    case 'weekly-review':
      await runWeeklyReview(learn);
      break;

    case 'export':
      await exportKnowledge(learn, args[1]);
      break;

    case 'import':
      await importKnowledge(learn, args[1]);
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

async function showStatus(learn: ReturnType<typeof createMonolLearn>) {
  const status = learn.getStatus();

  console.log('\n📊 monol-learn Status\n');
  console.log('═══════════════════════════════════════\n');

  console.log('Skills:');
  console.log(`  Total: ${status.evolution.totalSkills}`);
  console.log(`  Active: ${status.evolution.byStatus.active}`);
  console.log(`  Trial: ${status.evolution.byStatus.trial}`);
  console.log(`  Candidate: ${status.evolution.byStatus.candidate}`);
  console.log(`  Archived: ${status.evolution.byStatus.archived}`);
  console.log();

  console.log('Trials:');
  console.log(`  Running: ${status.evolution.runningTrials}`);
  console.log(`  Completed: ${status.evolution.completedTrials}`);
  console.log(`  Pending Promotions: ${status.evolution.pendingPromotions}`);
  console.log();

  console.log('Scheduler:');
  console.log(`  Daily Scan Last: ${status.scheduler.dailyScan.lastRun?.toISOString() ?? 'Never'}`);
  console.log(`  Weekly Review Last: ${status.scheduler.weeklyReview.lastRun?.toISOString() ?? 'Never'}`);
  console.log();
}

async function runDiscover(
  learn: ReturnType<typeof createMonolLearn>,
  args: string[]
) {
  console.log('\n🔍 Running Discovery...\n');

  try {
    const result = await learn.discovery.discover();

    console.log(`Sources scanned: ${result.summary.sourcesScanned}`);
    console.log(`Total candidates: ${result.summary.totalCandidates}`);
    console.log(`High relevance: ${result.summary.highRelevanceCandidates}`);
    console.log();

    if (result.summary.topCandidates.length > 0) {
      console.log('Top Candidates:');
      for (const candidate of result.summary.topCandidates) {
        console.log(`  - ${candidate.name} (${candidate.type}): ${candidate.relevance.toFixed(0)}%`);
      }
    }
  } catch (error) {
    console.error('Discovery failed:', error);
    process.exit(1);
  }
}

async function runDailyScan(learn: ReturnType<typeof createMonolLearn>) {
  console.log('\n📅 Running Daily Scan...\n');

  try {
    const result = await learn.scheduler.runDailyScan();

    console.log('Discovery:');
    console.log(`  Sources: ${result.discovery.sourcesScanned}`);
    console.log(`  Candidates: ${result.discovery.candidatesFound}`);
    console.log();

    console.log('Evolution:');
    console.log(`  Trials started: ${result.evolution.trialsStarted}`);
    console.log(`  Promotions: ${result.evolution.promotions}`);
    console.log();

    console.log('Internalization:');
    console.log(`  Rules: ${result.internalization.rulesCreated}`);
    console.log(`  Skills: ${result.internalization.skillsGenerated}`);
    console.log(`  Lessons: ${result.internalization.lessonsCreated}`);
    console.log();

    console.log(`Duration: ${result.duration}ms`);

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      for (const error of result.errors) {
        console.log(`  - ${error}`);
      }
    }
  } catch (error) {
    console.error('Daily scan failed:', error);
    process.exit(1);
  }
}

async function runWeeklyReview(learn: ReturnType<typeof createMonolLearn>) {
  console.log('\n📋 Running Weekly Review...\n');

  try {
    const result = await learn.scheduler.runWeeklyReview();

    console.log(`Period: ${result.period}`);
    console.log();

    console.log('Cleanup:');
    console.log(`  Stale trials cancelled: ${result.cleanup.staleTrialsCancelled}`);
    console.log(`  Low performers archived: ${result.cleanup.lowPerformersArchived}`);
    console.log(`  Duplicates removed: ${result.cleanup.duplicatesRemoved}`);
    console.log();

    if (result.analysis.topPerformingSkills.length > 0) {
      console.log('Top Performers:');
      for (const skill of result.analysis.topPerformingSkills) {
        console.log(`  - ${skill.name}: ${skill.compositeScore.toFixed(1)} (${skill.trend})`);
      }
      console.log();
    }

    if (result.recommendations.length > 0) {
      console.log('Recommendations:');
      for (const rec of result.recommendations) {
        console.log(`  - ${rec}`);
      }
    }

    console.log(`\nDuration: ${result.duration}ms`);
  } catch (error) {
    console.error('Weekly review failed:', error);
    process.exit(1);
  }
}

async function exportKnowledge(
  learn: ReturnType<typeof createMonolLearn>,
  outputPath?: string
) {
  const knowledge = learn.exportKnowledge();
  const output = JSON.stringify(knowledge, null, 2);

  if (outputPath) {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, output);
    console.log(`Knowledge exported to: ${outputPath}`);
  } else {
    console.log(output);
  }
}

async function importKnowledge(
  learn: ReturnType<typeof createMonolLearn>,
  inputPath: string
) {
  if (!inputPath) {
    console.error('Input path required');
    process.exit(1);
  }

  const fs = await import('fs/promises');
  const content = await fs.readFile(inputPath, 'utf-8');
  const knowledge = JSON.parse(content);

  learn.importKnowledge(knowledge);
  console.log('Knowledge imported successfully');
}

function showHelp() {
  console.log(`
monol-learn - Self-Learning Infrastructure

Usage: monol-learn <command> [options]

Commands:
  status          Show learning system status
  discover        Run discovery scan
  daily-scan      Run daily scan job
  weekly-review   Run weekly review job
  export [path]   Export learned knowledge
  import <path>   Import knowledge from file
  help            Show this help

Examples:
  monol-learn status
  monol-learn discover
  monol-learn export ./backup.json
  monol-learn import ./backup.json
`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
