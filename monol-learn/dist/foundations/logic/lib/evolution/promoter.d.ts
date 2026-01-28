/**
 * Skill Promoter
 * Handles promotion, demotion, and archival of skills
 */
import type { Skill, SkillStatus, EvolutionTrial } from '../types.js';
import { CandidateManager } from './candidate.js';
import { TrialManager } from './trial.js';
import { Evaluator } from './evaluator.js';
export interface PromotionConfig {
    minTrialsForPromotion: number;
    promotionThreshold: number;
    demotionThreshold: number;
    autoPromote: boolean;
    requireUserApproval: boolean;
}
export interface PromotionAction {
    type: 'promote' | 'demote' | 'archive' | 'maintain';
    skillId: string;
    fromStatus: SkillStatus;
    toStatus: SkillStatus;
    reason: string;
    confidence: number;
    trialId?: string;
    requiresApproval: boolean;
}
/**
 * Skill Promoter class
 */
export declare class Promoter {
    private config;
    private candidateManager;
    private trialManager;
    private evaluator;
    private pendingActions;
    constructor(candidateManager: CandidateManager, trialManager: TrialManager, evaluator: Evaluator, config?: Partial<PromotionConfig>);
    /**
     * Process completed trials and determine promotions
     */
    processCompletedTrials(): PromotionAction[];
    /**
     * Evaluate a single trial for promotion
     */
    evaluateTrialForPromotion(trial: EvolutionTrial): PromotionAction | null;
    /**
     * Manually promote a skill
     */
    promote(skillId: string, reason?: string): Skill | null;
    /**
     * Manually demote a skill
     */
    demote(skillId: string, reason?: string): Skill | null;
    /**
     * Archive a skill
     */
    archive(skillId: string, reason?: string): Skill | null;
    /**
     * Execute a pending promotion action
     */
    executeAction(actionId: string): Skill | null;
    /**
     * Get all pending promotion actions
     */
    getPendingActions(): PromotionAction[];
    /**
     * Cancel a pending action
     */
    cancelAction(actionId: string): boolean;
    /**
     * Automatically process promotions for skills meeting criteria
     */
    autoProcess(): PromotionAction[];
    /**
     * Check if skill is eligible for promotion
     */
    isEligibleForPromotion(skillId: string): {
        eligible: boolean;
        reason: string;
    };
    private createPromotionAction;
    private createArchiveAction;
    private emitEvent;
}
export declare function createPromoter(candidateManager: CandidateManager, trialManager: TrialManager, evaluator: Evaluator, config?: Partial<PromotionConfig>): Promoter;
//# sourceMappingURL=promoter.d.ts.map