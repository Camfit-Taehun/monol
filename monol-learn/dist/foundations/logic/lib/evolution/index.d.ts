/**
 * Evolution Module
 * Orchestrates A/B testing and skill evolution
 */
export { CandidateManager, createCandidateManager, createSkill, createSkillFromCandidate, type CandidateCreationInput, } from './candidate.js';
export { TrialManager, createTrialManager, createTrial, type TrialCreationInput, type TrialRecordInput, } from './trial.js';
export { Evaluator, createEvaluator, type EvaluationResult, type EvaluationBreakdown, type EvaluationConfig, type ComparisonResult, type TrialEvaluationResult, } from './evaluator.js';
export { Promoter, createPromoter, type PromotionConfig, type PromotionAction, } from './promoter.js';
import { CandidateManager } from './candidate.js';
import { TrialManager } from './trial.js';
import { Evaluator } from './evaluator.js';
import { Promoter, type PromotionConfig } from './promoter.js';
import type { Skill, SkillCandidate, EvolutionTrial } from '../types.js';
export interface EvolutionOptions {
    promotionConfig?: Partial<PromotionConfig>;
    autoProcess?: boolean;
}
/**
 * Evolution orchestrator - coordinates candidates, trials, and promotion
 */
export declare class Evolution {
    readonly candidates: CandidateManager;
    readonly trials: TrialManager;
    readonly evaluator: Evaluator;
    readonly promoter: Promoter;
    private options;
    constructor(options?: EvolutionOptions);
    /**
     * Register a new skill candidate
     */
    registerCandidate(candidate: SkillCandidate): Skill;
    /**
     * Start an A/B trial between baseline and challenger
     */
    startTrial(baselineId: string, challengerId: string): EvolutionTrial | null;
    /**
     * Record trial result
     */
    recordTrialResult(trialId: string, baseline: {
        quality: number;
        speed: number;
        userFeedback?: number;
        context: string;
    }, challenger: {
        quality: number;
        speed: number;
        userFeedback?: number;
        context: string;
    }): EvolutionTrial | null;
    /**
     * Get trial status
     */
    getTrialStatus(trialId: string): EvolutionTrialStatus | null;
    /**
     * Get all active skills
     */
    getActiveSkills(): Skill[];
    /**
     * Find best skill for a given task
     */
    findBestSkill(criteria: {
        type?: Skill['type'];
        tags?: string[];
    }): Skill | null;
    /**
     * Process pending promotions
     */
    processPendingPromotions(): void;
    /**
     * Load state from storage
     */
    loadState(state: {
        skills?: Skill[];
        trials?: EvolutionTrial[];
    }): void;
    /**
     * Export state for storage
     */
    exportState(): {
        skills: Skill[];
        trials: EvolutionTrial[];
    };
    /**
     * Get evolution summary
     */
    getSummary(): EvolutionSummary;
}
export interface EvolutionTrialStatus {
    trial: EvolutionTrial;
    baseline: Skill | undefined;
    challenger: Skill | undefined;
    progress: number;
    recommendation: string;
}
export interface EvolutionSummary {
    totalSkills: number;
    byStatus: {
        candidate: number;
        trial: number;
        active: number;
        archived: number;
    };
    totalTrials: number;
    runningTrials: number;
    completedTrials: number;
    pendingPromotions: number;
}
export declare function createEvolution(options?: EvolutionOptions): Evolution;
//# sourceMappingURL=index.d.ts.map