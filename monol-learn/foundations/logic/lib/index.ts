/**
 * monol-learn - Self-Learning Infrastructure for Claude Code Agents
 *
 * This module provides the foundational infrastructure for agents to:
 * - Discover new skills and knowledge from external sources
 * - Evolve skills through A/B testing and comparison
 * - Internalize learned knowledge as rules, skills, and lessons
 * - Schedule regular learning and maintenance tasks
 */

// Types
export * from './types.js';

// Discovery Module
export {
  Discovery,
  createDiscovery,
  Scanner,
  createScanner,
  Extractor,
  createExtractor,
  RelevanceAnalyzer,
  createRelevanceAnalyzer,
  type DiscoveryOptions,
  type DiscoveryPipelineResult,
  type DiscoverySummary,
  type ScannerOptions,
  type ExtractionResult,
  type ExtractedSkill,
  type ExtractedLesson,
  type ExtractedPattern,
  type RelevanceContext,
  type RelevanceScore,
} from './discovery/index.js';

// Evolution Module
export {
  Evolution,
  createEvolution,
  CandidateManager,
  createCandidateManager,
  TrialManager,
  createTrialManager,
  Evaluator,
  createEvaluator,
  Promoter,
  createPromoter,
  createSkill,
  createSkillFromCandidate,
  createTrial,
  type EvolutionOptions,
  type EvolutionTrialStatus,
  type EvolutionSummary,
  type CandidateCreationInput,
  type TrialCreationInput,
  type TrialRecordInput,
  type EvaluationResult,
  type EvaluationBreakdown,
  type EvaluationConfig,
  type ComparisonResult,
  type TrialEvaluationResult,
  type PromotionConfig,
  type PromotionAction,
} from './evolution/index.js';

// Internalization Module
export {
  Internalization,
  createInternalization,
  RuleConverter,
  createRuleConverter,
  SkillGenerator,
  createSkillGenerator,
  LessonCreator,
  createLessonCreator,
  type InternalizationOptions,
  type InternalizationResult,
  type InternalizationSummary,
  type RuleDefinition,
  type ConversionOptions,
  type SkillDefinition,
  type SkillTrigger,
  type GeneratorOptions,
  type LessonCreationInput,
  type LessonTemplate,
} from './internalization/index.js';

// Scheduler Module
export {
  Scheduler,
  createScheduler,
  DailyScan,
  createDailyScan,
  WeeklyReview,
  createWeeklyReview,
  type SchedulerConfig,
  type SchedulerStatus,
  type SchedulerSummary,
  type DailyScanConfig,
  type DailyScanResult,
  type WeeklyReviewConfig,
  type WeeklyReviewResult,
  type SkillPerformanceSummary,
} from './scheduler/index.js';

// Re-export commonly used types
export type {
  Skill,
  SkillType,
  SkillStatus,
  SkillCandidate,
  EvolutionTrial,
  TrialStatus,
  TrialRecommendation,
  TrialScore,
  TrendSnapshot,
  TrendItem,
  TrendCategory,
  LessonPoint,
  LearningSession,
  SessionMetrics,
  SkillPerformance,
  DiscoverySource,
  DiscoveryResult,
  LearnConfig,
  LearnEvent,
  LearnEventType,
} from './types.js';

import { Discovery, createDiscovery, type DiscoveryOptions } from './discovery/index.js';
import { Evolution, createEvolution, type EvolutionOptions } from './evolution/index.js';
import { Internalization, createInternalization, type InternalizationOptions } from './internalization/index.js';
import { Scheduler, createScheduler, type SchedulerConfig } from './scheduler/index.js';
import { DEFAULT_CONFIG, type LearnConfig } from './types.js';

/**
 * MonolLearn - Main entry point for the self-learning infrastructure
 */
export class MonolLearn {
  readonly discovery: Discovery;
  readonly evolution: Evolution;
  readonly internalization: Internalization;
  readonly scheduler: Scheduler;

  private config: LearnConfig;

  constructor(config: Partial<LearnConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize modules
    this.discovery = createDiscovery({
      sources: this.config.discoverySources,
      minRelevance: 30,
    });

    this.evolution = createEvolution({
      promotionConfig: {
        minTrialsForPromotion: this.config.minTrialsForPromotion,
        promotionThreshold: this.config.promotionThreshold,
        demotionThreshold: this.config.demotionThreshold,
        autoPromote: this.config.enableAutoPromotion,
      },
    });

    this.internalization = createInternalization({
      rulebookPath: this.config.rulebookPath,
    });

    this.scheduler = createScheduler(
      this.discovery,
      this.evolution,
      this.internalization,
      {
        schedules: this.config.scanSchedule,
      }
    );
  }

  /**
   * Run a full learning cycle (discovery → evolution → internalization)
   */
  async runLearningCycle(): Promise<LearningCycleResult> {
    const startTime = Date.now();

    // 1. Discover new skills
    const discoveryResult = await this.discovery.discover();

    // 2. Register candidates
    for (const candidate of discoveryResult.candidates.slice(0, 10)) {
      this.evolution.registerCandidate(candidate);
    }

    // 3. Process pending promotions
    this.evolution.processPendingPromotions();

    // 4. Internalize promoted skills
    const actions = this.evolution.promoter.getPendingActions();
    const internalizationResults = [];

    for (const action of actions.filter((a) => a.type === 'promote')) {
      const skill = this.evolution.candidates.get(action.skillId);
      if (skill) {
        const result = this.internalization.internalizePromotedSkill(skill);
        internalizationResults.push(result);
      }
    }

    return {
      duration: Date.now() - startTime,
      discovery: discoveryResult.summary,
      evolution: this.evolution.getSummary(),
      internalization: {
        rulesCreated: internalizationResults.reduce(
          (sum, r) => sum + r.summary.rulesCreated,
          0
        ),
        skillsGenerated: internalizationResults.reduce(
          (sum, r) => sum + r.summary.skillsGenerated,
          0
        ),
        lessonsCreated: internalizationResults.reduce(
          (sum, r) => sum + r.summary.lessonsCreated,
          0
        ),
      },
    };
  }

  /**
   * Get overall system status
   */
  getStatus(): SystemStatus {
    return {
      config: this.config,
      evolution: this.evolution.getSummary(),
      scheduler: this.scheduler.getStatus(),
      schedulerSummary: this.scheduler.getSummary(),
    };
  }

  /**
   * Export all learned knowledge
   */
  exportKnowledge(): ExportedKnowledge {
    const evolutionState = this.evolution.exportState();

    return {
      skills: evolutionState.skills,
      trials: evolutionState.trials,
      config: this.config,
      exportedAt: new Date(),
    };
  }

  /**
   * Import previously exported knowledge
   */
  importKnowledge(knowledge: ExportedKnowledge): void {
    this.evolution.loadState({
      skills: knowledge.skills,
      trials: knowledge.trials,
    });
  }

  /**
   * Get configuration
   */
  getConfig(): LearnConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<LearnConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export interface LearningCycleResult {
  duration: number;
  discovery: import('./discovery/index.js').DiscoverySummary;
  evolution: import('./evolution/index.js').EvolutionSummary;
  internalization: {
    rulesCreated: number;
    skillsGenerated: number;
    lessonsCreated: number;
  };
}

export interface SystemStatus {
  config: LearnConfig;
  evolution: import('./evolution/index.js').EvolutionSummary;
  scheduler: import('./scheduler/index.js').SchedulerStatus;
  schedulerSummary: import('./scheduler/index.js').SchedulerSummary;
}

export interface ExportedKnowledge {
  skills: import('./types.js').Skill[];
  trials: import('./types.js').EvolutionTrial[];
  config: LearnConfig;
  exportedAt: Date;
}

/**
 * Create a new MonolLearn instance
 */
export function createMonolLearn(config?: Partial<LearnConfig>): MonolLearn {
  return new MonolLearn(config);
}

// Default export
export default MonolLearn;
