/**
 * monol-learn - Self-Learning Infrastructure for Claude Code Agents
 *
 * This module provides the foundational infrastructure for agents to:
 * - Discover new skills and knowledge from external sources
 * - Evolve skills through A/B testing and comparison
 * - Internalize learned knowledge as rules, skills, and lessons
 * - Schedule regular learning and maintenance tasks
 */
export * from './types.js';
export { Discovery, createDiscovery, Scanner, createScanner, Extractor, createExtractor, RelevanceAnalyzer, createRelevanceAnalyzer, type DiscoveryOptions, type DiscoveryPipelineResult, type DiscoverySummary, type ScannerOptions, type ExtractionResult, type ExtractedSkill, type ExtractedLesson, type ExtractedPattern, type RelevanceContext, type RelevanceScore, } from './discovery/index.js';
export { Evolution, createEvolution, CandidateManager, createCandidateManager, TrialManager, createTrialManager, Evaluator, createEvaluator, Promoter, createPromoter, createSkill, createSkillFromCandidate, createTrial, type EvolutionOptions, type EvolutionTrialStatus, type EvolutionSummary, type CandidateCreationInput, type TrialCreationInput, type TrialRecordInput, type EvaluationResult, type EvaluationBreakdown, type EvaluationConfig, type ComparisonResult, type TrialEvaluationResult, type PromotionConfig, type PromotionAction, } from './evolution/index.js';
export { Internalization, createInternalization, RuleConverter, createRuleConverter, SkillGenerator, createSkillGenerator, LessonCreator, createLessonCreator, type InternalizationOptions, type InternalizationResult, type InternalizationSummary, type RuleDefinition, type ConversionOptions, type SkillDefinition, type SkillTrigger, type GeneratorOptions, type LessonCreationInput, type LessonTemplate, } from './internalization/index.js';
export { Scheduler, createScheduler, DailyScan, createDailyScan, WeeklyReview, createWeeklyReview, type SchedulerConfig, type SchedulerStatus, type SchedulerSummary, type DailyScanConfig, type DailyScanResult, type WeeklyReviewConfig, type WeeklyReviewResult, type SkillPerformanceSummary, } from './scheduler/index.js';
export type { Skill, SkillType, SkillStatus, SkillCandidate, EvolutionTrial, TrialStatus, TrialRecommendation, TrialScore, TrendSnapshot, TrendItem, TrendCategory, LessonPoint, LearningSession, SessionMetrics, SkillPerformance, DiscoverySource, DiscoveryResult, LearnConfig, LearnEvent, LearnEventType, } from './types.js';
import { Discovery } from './discovery/index.js';
import { Evolution } from './evolution/index.js';
import { Internalization } from './internalization/index.js';
import { Scheduler } from './scheduler/index.js';
import { type LearnConfig } from './types.js';
/**
 * MonolLearn - Main entry point for the self-learning infrastructure
 */
export declare class MonolLearn {
    readonly discovery: Discovery;
    readonly evolution: Evolution;
    readonly internalization: Internalization;
    readonly scheduler: Scheduler;
    private config;
    constructor(config?: Partial<LearnConfig>);
    /**
     * Run a full learning cycle (discovery → evolution → internalization)
     */
    runLearningCycle(): Promise<LearningCycleResult>;
    /**
     * Get overall system status
     */
    getStatus(): SystemStatus;
    /**
     * Export all learned knowledge
     */
    exportKnowledge(): ExportedKnowledge;
    /**
     * Import previously exported knowledge
     */
    importKnowledge(knowledge: ExportedKnowledge): void;
    /**
     * Get configuration
     */
    getConfig(): LearnConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<LearnConfig>): void;
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
export declare function createMonolLearn(config?: Partial<LearnConfig>): MonolLearn;
export default MonolLearn;
//# sourceMappingURL=index.d.ts.map