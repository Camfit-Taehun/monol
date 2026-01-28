/**
 * Evolution Module
 * Orchestrates A/B testing and skill evolution
 */
export { CandidateManager, createCandidateManager, createSkill, createSkillFromCandidate, } from './candidate.js';
export { TrialManager, createTrialManager, createTrial, } from './trial.js';
export { Evaluator, createEvaluator, } from './evaluator.js';
export { Promoter, createPromoter, } from './promoter.js';
import { createCandidateManager, createSkillFromCandidate, } from './candidate.js';
import { createTrialManager } from './trial.js';
import { createEvaluator } from './evaluator.js';
import { createPromoter } from './promoter.js';
/**
 * Evolution orchestrator - coordinates candidates, trials, and promotion
 */
export class Evolution {
    candidates;
    trials;
    evaluator;
    promoter;
    options;
    constructor(options = {}) {
        this.options = options;
        this.candidates = createCandidateManager();
        this.trials = createTrialManager();
        this.evaluator = createEvaluator();
        this.promoter = createPromoter(this.candidates, this.trials, this.evaluator, options.promotionConfig);
    }
    /**
     * Register a new skill candidate
     */
    registerCandidate(candidate) {
        const skill = createSkillFromCandidate(candidate);
        this.candidates.add(skill);
        return skill;
    }
    /**
     * Start an A/B trial between baseline and challenger
     */
    startTrial(baselineId, challengerId) {
        const baseline = this.candidates.get(baselineId);
        const challenger = this.candidates.get(challengerId);
        if (!baseline || !challenger) {
            return null;
        }
        // Check if trial already exists
        const existing = this.trials.findBySkillPair(baselineId, challengerId);
        if (existing) {
            return existing;
        }
        // Update challenger status to trial
        this.candidates.updateStatus(challengerId, 'trial');
        return this.trials.start({
            baselineId,
            challengerId,
        });
    }
    /**
     * Record trial result
     */
    recordTrialResult(trialId, baseline, challenger) {
        const result = this.trials.recordPair(trialId, baseline, challenger);
        // Auto-process if enabled
        if (this.options.autoProcess &&
            result?.status === 'completed') {
            this.promoter.autoProcess();
        }
        return result ?? null;
    }
    /**
     * Get trial status
     */
    getTrialStatus(trialId) {
        const trial = this.trials.get(trialId);
        if (!trial)
            return null;
        return {
            trial,
            baseline: this.candidates.get(trial.baselineId),
            challenger: this.candidates.get(trial.challengerId),
            progress: trial.currentTrials / trial.minTrials,
            recommendation: trial.recommendation,
        };
    }
    /**
     * Get all active skills
     */
    getActiveSkills() {
        return this.candidates.getActiveSkills();
    }
    /**
     * Find best skill for a given task
     */
    findBestSkill(criteria) {
        const activeSkills = this.getActiveSkills();
        const filtered = activeSkills.filter((s) => {
            if (criteria.type && s.type !== criteria.type)
                return false;
            if (criteria.tags?.length) {
                const hasTag = criteria.tags.some((t) => s.tags.map((st) => st.toLowerCase()).includes(t.toLowerCase()));
                if (!hasTag)
                    return false;
            }
            return true;
        });
        if (filtered.length === 0)
            return null;
        // Return highest scoring skill
        return filtered.reduce((best, current) => current.compositeScore > best.compositeScore ? current : best);
    }
    /**
     * Process pending promotions
     */
    processPendingPromotions() {
        this.promoter.processCompletedTrials();
    }
    /**
     * Load state from storage
     */
    loadState(state) {
        if (state.skills) {
            this.candidates.load(state.skills);
        }
        if (state.trials) {
            this.trials.load(state.trials);
        }
    }
    /**
     * Export state for storage
     */
    exportState() {
        return {
            skills: this.candidates.export(),
            trials: this.trials.export(),
        };
    }
    /**
     * Get evolution summary
     */
    getSummary() {
        const skills = this.candidates.getAll();
        const trials = this.trials.getAll();
        return {
            totalSkills: skills.length,
            byStatus: {
                candidate: skills.filter((s) => s.status === 'candidate').length,
                trial: skills.filter((s) => s.status === 'trial').length,
                active: skills.filter((s) => s.status === 'active').length,
                archived: skills.filter((s) => s.status === 'archived').length,
            },
            totalTrials: trials.length,
            runningTrials: trials.filter((t) => t.status === 'running').length,
            completedTrials: trials.filter((t) => t.status === 'completed').length,
            pendingPromotions: this.promoter.getPendingActions().length,
        };
    }
}
export function createEvolution(options) {
    return new Evolution(options);
}
//# sourceMappingURL=index.js.map