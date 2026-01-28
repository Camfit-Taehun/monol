/**
 * Skill Promoter
 * Handles promotion, demotion, and archival of skills
 */
const DEFAULT_CONFIG = {
    minTrialsForPromotion: 10,
    promotionThreshold: 70,
    demotionThreshold: 40,
    autoPromote: false,
    requireUserApproval: true,
};
/**
 * Skill Promoter class
 */
export class Promoter {
    config;
    candidateManager;
    trialManager;
    evaluator;
    pendingActions = new Map();
    constructor(candidateManager, trialManager, evaluator, config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.candidateManager = candidateManager;
        this.trialManager = trialManager;
        this.evaluator = evaluator;
    }
    /**
     * Process completed trials and determine promotions
     */
    processCompletedTrials() {
        const completedTrials = this.trialManager.getByStatus('completed');
        const actions = [];
        for (const trial of completedTrials) {
            const action = this.evaluateTrialForPromotion(trial);
            if (action) {
                actions.push(action);
                this.pendingActions.set(action.skillId, action);
            }
        }
        return actions;
    }
    /**
     * Evaluate a single trial for promotion
     */
    evaluateTrialForPromotion(trial) {
        const challenger = this.candidateManager.get(trial.challengerId);
        if (!challenger)
            return null;
        const evalResult = this.evaluator.evaluateTrial(trial);
        if (evalResult.shouldPromote) {
            return this.createPromotionAction(challenger, trial, evalResult);
        }
        else if (evalResult.shouldArchive) {
            return this.createArchiveAction(challenger, trial, evalResult);
        }
        return null;
    }
    /**
     * Manually promote a skill
     */
    promote(skillId, reason = 'Manual promotion') {
        const skill = this.candidateManager.get(skillId);
        if (!skill)
            return null;
        const updated = this.candidateManager.updateStatus(skillId, 'active');
        if (updated) {
            this.emitEvent('promoted', {
                skillId,
                fromStatus: skill.status,
                toStatus: 'active',
                reason,
            });
        }
        return updated ?? null;
    }
    /**
     * Manually demote a skill
     */
    demote(skillId, reason = 'Manual demotion') {
        const skill = this.candidateManager.get(skillId);
        if (!skill)
            return null;
        const newStatus = skill.status === 'active' ? 'trial' : 'candidate';
        const updated = this.candidateManager.updateStatus(skillId, newStatus);
        if (updated) {
            this.emitEvent('demoted', {
                skillId,
                fromStatus: skill.status,
                toStatus: newStatus,
                reason,
            });
        }
        return updated ?? null;
    }
    /**
     * Archive a skill
     */
    archive(skillId, reason = 'Manual archival') {
        const skill = this.candidateManager.get(skillId);
        if (!skill)
            return null;
        const updated = this.candidateManager.updateStatus(skillId, 'archived');
        if (updated) {
            this.emitEvent('archived', {
                skillId,
                fromStatus: skill.status,
                toStatus: 'archived',
                reason,
            });
        }
        return updated ?? null;
    }
    /**
     * Execute a pending promotion action
     */
    executeAction(actionId) {
        const action = this.pendingActions.get(actionId);
        if (!action)
            return null;
        let result = null;
        switch (action.type) {
            case 'promote':
                result = this.promote(action.skillId, action.reason);
                break;
            case 'demote':
                result = this.demote(action.skillId, action.reason);
                break;
            case 'archive':
                result = this.archive(action.skillId, action.reason);
                break;
        }
        if (result) {
            this.pendingActions.delete(actionId);
        }
        return result;
    }
    /**
     * Get all pending promotion actions
     */
    getPendingActions() {
        return Array.from(this.pendingActions.values());
    }
    /**
     * Cancel a pending action
     */
    cancelAction(actionId) {
        return this.pendingActions.delete(actionId);
    }
    /**
     * Automatically process promotions for skills meeting criteria
     */
    autoProcess() {
        if (!this.config.autoPromote) {
            return [];
        }
        const actions = this.processCompletedTrials();
        const executed = [];
        for (const action of actions) {
            if (!action.requiresApproval) {
                const result = this.executeAction(action.skillId);
                if (result) {
                    executed.push(action);
                }
            }
        }
        return executed;
    }
    /**
     * Check if skill is eligible for promotion
     */
    isEligibleForPromotion(skillId) {
        const skill = this.candidateManager.get(skillId);
        if (!skill) {
            return { eligible: false, reason: 'Skill not found' };
        }
        if (skill.status === 'active') {
            return { eligible: false, reason: 'Skill already active' };
        }
        if (skill.status === 'archived') {
            return { eligible: false, reason: 'Skill is archived' };
        }
        if (skill.trialsCount < this.config.minTrialsForPromotion) {
            return {
                eligible: false,
                reason: `Insufficient trials (${skill.trialsCount}/${this.config.minTrialsForPromotion})`,
            };
        }
        if (skill.compositeScore < this.config.promotionThreshold) {
            return {
                eligible: false,
                reason: `Score below threshold (${skill.compositeScore}/${this.config.promotionThreshold})`,
            };
        }
        return { eligible: true, reason: 'Meets all promotion criteria' };
    }
    createPromotionAction(skill, trial, evalResult) {
        return {
            type: 'promote',
            skillId: skill.id,
            fromStatus: skill.status,
            toStatus: 'active',
            reason: `Win rate ${(evalResult.winRate * 100).toFixed(1)}%, improvement ${evalResult.improvement.toFixed(1)} points`,
            confidence: trial.recommendationConfidence,
            trialId: trial.id,
            requiresApproval: this.config.requireUserApproval,
        };
    }
    createArchiveAction(skill, trial, evalResult) {
        return {
            type: 'archive',
            skillId: skill.id,
            fromStatus: skill.status,
            toStatus: 'archived',
            reason: `Poor performance: ${(evalResult.winRate * 100).toFixed(1)}% win rate, ${evalResult.improvement.toFixed(1)} point deficit`,
            confidence: trial.recommendationConfidence,
            trialId: trial.id,
            requiresApproval: this.config.requireUserApproval,
        };
    }
    emitEvent(type, data) {
        // Event emission for integration with other modules
        // In real implementation, this would use an event emitter
        console.log(`[Promoter] ${type}:`, data);
    }
}
export function createPromoter(candidateManager, trialManager, evaluator, config) {
    return new Promoter(candidateManager, trialManager, evaluator, config);
}
//# sourceMappingURL=promoter.js.map