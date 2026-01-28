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
export { Discovery, createDiscovery, Scanner, createScanner, Extractor, createExtractor, RelevanceAnalyzer, createRelevanceAnalyzer, } from './discovery/index.js';
// Evolution Module
export { Evolution, createEvolution, CandidateManager, createCandidateManager, TrialManager, createTrialManager, Evaluator, createEvaluator, Promoter, createPromoter, createSkill, createSkillFromCandidate, createTrial, } from './evolution/index.js';
// Internalization Module
export { Internalization, createInternalization, RuleConverter, createRuleConverter, SkillGenerator, createSkillGenerator, LessonCreator, createLessonCreator, } from './internalization/index.js';
// Scheduler Module
export { Scheduler, createScheduler, DailyScan, createDailyScan, WeeklyReview, createWeeklyReview, } from './scheduler/index.js';
import { createDiscovery } from './discovery/index.js';
import { createEvolution } from './evolution/index.js';
import { createInternalization } from './internalization/index.js';
import { createScheduler } from './scheduler/index.js';
import { DEFAULT_CONFIG } from './types.js';
/**
 * MonolLearn - Main entry point for the self-learning infrastructure
 */
export class MonolLearn {
    discovery;
    evolution;
    internalization;
    scheduler;
    config;
    constructor(config = {}) {
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
        this.scheduler = createScheduler(this.discovery, this.evolution, this.internalization, {
            schedules: this.config.scanSchedule,
        });
    }
    /**
     * Run a full learning cycle (discovery → evolution → internalization)
     */
    async runLearningCycle() {
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
                rulesCreated: internalizationResults.reduce((sum, r) => sum + r.summary.rulesCreated, 0),
                skillsGenerated: internalizationResults.reduce((sum, r) => sum + r.summary.skillsGenerated, 0),
                lessonsCreated: internalizationResults.reduce((sum, r) => sum + r.summary.lessonsCreated, 0),
            },
        };
    }
    /**
     * Get overall system status
     */
    getStatus() {
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
    exportKnowledge() {
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
    importKnowledge(knowledge) {
        this.evolution.loadState({
            skills: knowledge.skills,
            trials: knowledge.trials,
        });
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
/**
 * Create a new MonolLearn instance
 */
export function createMonolLearn(config) {
    return new MonolLearn(config);
}
// Default export
export default MonolLearn;
//# sourceMappingURL=index.js.map