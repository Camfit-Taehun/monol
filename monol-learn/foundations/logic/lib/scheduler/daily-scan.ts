/**
 * Daily Scan Scheduler
 * Runs daily discovery and learning tasks
 */

import { Discovery, type DiscoveryOptions } from '../discovery/index.js';
import { Evolution } from '../evolution/index.js';
import { Internalization } from '../internalization/index.js';
import type { Skill, TrendSnapshot, LearnConfig } from '../types.js';

export interface DailyScanConfig {
  discoveryOptions?: DiscoveryOptions;
  maxNewCandidates?: number;
  autoStartTrials?: boolean;
  reportPath?: string;
}

export interface DailyScanResult {
  timestamp: Date;
  duration: number;
  discovery: {
    sourcesScanned: number;
    candidatesFound: number;
    relevantCandidates: number;
  };
  evolution: {
    trialsStarted: number;
    trialsCompleted: number;
    promotions: number;
    demotions: number;
  };
  internalization: {
    rulesCreated: number;
    skillsGenerated: number;
    lessonsCreated: number;
  };
  errors: string[];
}

const DEFAULT_CONFIG: DailyScanConfig = {
  maxNewCandidates: 10,
  autoStartTrials: false,
};

/**
 * Daily Scan Job
 */
export class DailyScan {
  private config: DailyScanConfig;
  private discovery: Discovery;
  private evolution: Evolution;
  private internalization: Internalization;

  private lastRun?: Date;
  private results: DailyScanResult[] = [];

  constructor(
    discovery: Discovery,
    evolution: Evolution,
    internalization: Internalization,
    config: DailyScanConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.discovery = discovery;
    this.evolution = evolution;
    this.internalization = internalization;
  }

  /**
   * Execute the daily scan
   */
  async run(): Promise<DailyScanResult> {
    const startTime = Date.now();
    const result: DailyScanResult = {
      timestamp: new Date(),
      duration: 0,
      discovery: {
        sourcesScanned: 0,
        candidatesFound: 0,
        relevantCandidates: 0,
      },
      evolution: {
        trialsStarted: 0,
        trialsCompleted: 0,
        promotions: 0,
        demotions: 0,
      },
      internalization: {
        rulesCreated: 0,
        skillsGenerated: 0,
        lessonsCreated: 0,
      },
      errors: [],
    };

    try {
      // Phase 1: Discovery
      await this.runDiscoveryPhase(result);

      // Phase 2: Evolution check
      await this.runEvolutionPhase(result);

      // Phase 3: Internalization
      await this.runInternalizationPhase(result);
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error)
      );
    }

    result.duration = Date.now() - startTime;
    this.lastRun = result.timestamp;
    this.results.push(result);

    return result;
  }

  /**
   * Run discovery phase
   */
  private async runDiscoveryPhase(result: DailyScanResult): Promise<void> {
    try {
      const discoveryResult = await this.discovery.discover();

      result.discovery.sourcesScanned = discoveryResult.scanResults.length;
      result.discovery.candidatesFound = discoveryResult.candidates.length;
      result.discovery.relevantCandidates =
        discoveryResult.summary.highRelevanceCandidates;

      // Register top candidates for evolution
      const topCandidates = discoveryResult.candidates.slice(
        0,
        this.config.maxNewCandidates
      );

      for (const candidate of topCandidates) {
        this.evolution.registerCandidate(candidate);
      }

      // Auto-start trials if enabled
      if (this.config.autoStartTrials && topCandidates.length > 0) {
        await this.startTrialsForCandidates(result);
      }
    } catch (error) {
      result.errors.push(
        `Discovery failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Run evolution phase
   */
  private async runEvolutionPhase(result: DailyScanResult): Promise<void> {
    try {
      // Process completed trials
      this.evolution.processPendingPromotions();

      // Get promotion actions
      const actions = this.evolution.promoter.getPendingActions();

      for (const action of actions) {
        if (action.type === 'promote') {
          result.evolution.promotions++;
        } else if (action.type === 'demote' || action.type === 'archive') {
          result.evolution.demotions++;
        }
      }

      // Count trial stats
      const summary = this.evolution.getSummary();
      result.evolution.trialsCompleted = summary.completedTrials;
    } catch (error) {
      result.errors.push(
        `Evolution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Run internalization phase
   */
  private async runInternalizationPhase(result: DailyScanResult): Promise<void> {
    try {
      // Get newly promoted skills
      const actions = this.evolution.promoter.getPendingActions();
      const promotions = actions.filter((a) => a.type === 'promote');

      for (const action of promotions) {
        const skill = this.evolution.candidates.get(action.skillId);
        if (skill) {
          const internalResult = this.internalization.internalizePromotedSkill(skill);
          result.internalization.rulesCreated += internalResult.summary.rulesCreated;
          result.internalization.skillsGenerated += internalResult.summary.skillsGenerated;
          result.internalization.lessonsCreated += internalResult.summary.lessonsCreated;
        }
      }
    } catch (error) {
      result.errors.push(
        `Internalization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Start trials for new candidates
   */
  private async startTrialsForCandidates(result: DailyScanResult): Promise<void> {
    const candidates = this.evolution.candidates.getCandidatesForTrial();
    const activeSkills = this.evolution.getActiveSkills();

    if (activeSkills.length === 0) return;

    for (const candidate of candidates.slice(0, 5)) {
      // Find similar active skill to compare against
      const similar = this.evolution.candidates.findSimilar(candidate);
      const baseline = similar.find((s) => s.status === 'active');

      if (baseline) {
        const trial = this.evolution.startTrial(baseline.id, candidate.id);
        if (trial) {
          result.evolution.trialsStarted++;
        }
      }
    }
  }

  /**
   * Get last run timestamp
   */
  getLastRun(): Date | undefined {
    return this.lastRun;
  }

  /**
   * Get recent results
   */
  getRecentResults(count: number = 7): DailyScanResult[] {
    return this.results.slice(-count);
  }

  /**
   * Generate summary report
   */
  generateReport(result: DailyScanResult): string {
    const lines: string[] = [];

    lines.push('# Daily Scan Report');
    lines.push(`**Date**: ${result.timestamp.toISOString()}`);
    lines.push(`**Duration**: ${result.duration}ms`);
    lines.push('');

    lines.push('## Discovery');
    lines.push(`- Sources scanned: ${result.discovery.sourcesScanned}`);
    lines.push(`- Candidates found: ${result.discovery.candidatesFound}`);
    lines.push(`- Relevant candidates: ${result.discovery.relevantCandidates}`);
    lines.push('');

    lines.push('## Evolution');
    lines.push(`- Trials started: ${result.evolution.trialsStarted}`);
    lines.push(`- Trials completed: ${result.evolution.trialsCompleted}`);
    lines.push(`- Promotions: ${result.evolution.promotions}`);
    lines.push(`- Demotions: ${result.evolution.demotions}`);
    lines.push('');

    lines.push('## Internalization');
    lines.push(`- Rules created: ${result.internalization.rulesCreated}`);
    lines.push(`- Skills generated: ${result.internalization.skillsGenerated}`);
    lines.push(`- Lessons created: ${result.internalization.lessonsCreated}`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push('## Errors');
      for (const error of result.errors) {
        lines.push(`- ${error}`);
      }
    }

    return lines.join('\n');
  }
}

export function createDailyScan(
  discovery: Discovery,
  evolution: Evolution,
  internalization: Internalization,
  config?: DailyScanConfig
): DailyScan {
  return new DailyScan(discovery, evolution, internalization, config);
}
