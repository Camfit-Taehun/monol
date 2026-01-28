/**
 * Trial Manager
 * Manages A/B evolution trials between skills
 */
/**
 * Create a new evolution trial
 */
export function createTrial(input) {
    const now = new Date();
    return {
        id: generateTrialId(),
        baselineId: input.baselineId,
        challengerId: input.challengerId,
        status: 'pending',
        minTrials: input.minTrials ?? 10,
        currentTrials: 0,
        baselineWins: 0,
        challengerWins: 0,
        ties: 0,
        baselineScores: [],
        challengerScores: [],
        recommendation: 'undecided',
        recommendationConfidence: 0,
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Trial Manager class
 */
export class TrialManager {
    trials = new Map();
    /**
     * Start a new trial
     */
    start(input) {
        const trial = createTrial(input);
        trial.status = 'running';
        this.trials.set(trial.id, trial);
        return trial;
    }
    /**
     * Get a trial by ID
     */
    get(id) {
        return this.trials.get(id);
    }
    /**
     * Get all trials
     */
    getAll() {
        return Array.from(this.trials.values());
    }
    /**
     * Get trials by status
     */
    getByStatus(status) {
        return this.getAll().filter((t) => t.status === status);
    }
    /**
     * Get running trials
     */
    getRunningTrials() {
        return this.getByStatus('running');
    }
    /**
     * Find trial by skill pair
     */
    findBySkillPair(baselineId, challengerId) {
        return this.getAll().find((t) => t.status === 'running' &&
            t.baselineId === baselineId &&
            t.challengerId === challengerId);
    }
    /**
     * Record a baseline trial result
     */
    recordBaseline(trialId, input) {
        const trial = this.trials.get(trialId);
        if (!trial || trial.status !== 'running')
            return undefined;
        const score = {
            trialNumber: trial.baselineScores.length + 1,
            timestamp: new Date(),
            quality: input.quality,
            speed: input.speed,
            userFeedback: input.userFeedback,
            context: input.context,
        };
        trial.baselineScores.push(score);
        trial.updatedAt = new Date();
        this.checkTrialProgress(trial);
        return trial;
    }
    /**
     * Record a challenger trial result
     */
    recordChallenger(trialId, input) {
        const trial = this.trials.get(trialId);
        if (!trial || trial.status !== 'running')
            return undefined;
        const score = {
            trialNumber: trial.challengerScores.length + 1,
            timestamp: new Date(),
            quality: input.quality,
            speed: input.speed,
            userFeedback: input.userFeedback,
            context: input.context,
        };
        trial.challengerScores.push(score);
        trial.updatedAt = new Date();
        this.checkTrialProgress(trial);
        return trial;
    }
    /**
     * Record a paired trial result (both baseline and challenger)
     */
    recordPair(trialId, baseline, challenger) {
        const trial = this.trials.get(trialId);
        if (!trial || trial.status !== 'running')
            return undefined;
        // Record both scores
        const trialNumber = trial.currentTrials + 1;
        const timestamp = new Date();
        trial.baselineScores.push({
            trialNumber,
            timestamp,
            quality: baseline.quality,
            speed: baseline.speed,
            userFeedback: baseline.userFeedback,
            context: baseline.context,
        });
        trial.challengerScores.push({
            trialNumber,
            timestamp,
            quality: challenger.quality,
            speed: challenger.speed,
            userFeedback: challenger.userFeedback,
            context: challenger.context,
        });
        // Determine winner
        const baselineTotal = baseline.quality * 0.5 +
            baseline.speed * 0.3 +
            (baseline.userFeedback ?? 50) * 0.2;
        const challengerTotal = challenger.quality * 0.5 +
            challenger.speed * 0.3 +
            (challenger.userFeedback ?? 50) * 0.2;
        if (baselineTotal > challengerTotal + 5) {
            trial.baselineWins++;
        }
        else if (challengerTotal > baselineTotal + 5) {
            trial.challengerWins++;
        }
        else {
            trial.ties++;
        }
        trial.currentTrials++;
        trial.updatedAt = new Date();
        this.checkTrialProgress(trial);
        return trial;
    }
    /**
     * Cancel a trial
     */
    cancel(trialId) {
        const trial = this.trials.get(trialId);
        if (!trial)
            return undefined;
        trial.status = 'cancelled';
        trial.updatedAt = new Date();
        return trial;
    }
    /**
     * Check and update trial progress
     */
    checkTrialProgress(trial) {
        // Update current trials count
        trial.currentTrials = Math.min(trial.baselineScores.length, trial.challengerScores.length);
        // Check if minimum trials reached
        if (trial.currentTrials >= trial.minTrials) {
            this.evaluateAndComplete(trial);
        }
        else {
            // Update interim recommendation
            this.updateRecommendation(trial);
        }
    }
    /**
     * Evaluate trial and mark as completed
     */
    evaluateAndComplete(trial) {
        this.updateRecommendation(trial);
        trial.status = 'completed';
        trial.completedAt = new Date();
    }
    /**
     * Update trial recommendation based on current results
     */
    updateRecommendation(trial) {
        const total = trial.baselineWins + trial.challengerWins + trial.ties;
        if (total === 0) {
            trial.recommendation = 'undecided';
            trial.recommendationConfidence = 0;
            return;
        }
        const challengerWinRate = trial.challengerWins / total;
        const baselineWinRate = trial.baselineWins / total;
        // Calculate confidence based on sample size and margin
        const margin = Math.abs(challengerWinRate - baselineWinRate);
        const sampleFactor = Math.min(1, trial.currentTrials / trial.minTrials);
        trial.recommendationConfidence = margin * sampleFactor;
        // Determine recommendation
        if (challengerWinRate > 0.6) {
            trial.recommendation = 'promote';
        }
        else if (challengerWinRate < 0.3) {
            trial.recommendation = 'demote';
        }
        else if (challengerWinRate >= 0.3 && challengerWinRate <= 0.4) {
            trial.recommendation = 'archive';
        }
        else {
            trial.recommendation = 'continue';
        }
    }
    /**
     * Load trials from storage
     */
    load(trials) {
        for (const trial of trials) {
            this.trials.set(trial.id, trial);
        }
    }
    /**
     * Export all trials
     */
    export() {
        return this.getAll();
    }
    /**
     * Clear all trials
     */
    clear() {
        this.trials.clear();
    }
}
function generateTrialId() {
    return `trial_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
export function createTrialManager() {
    return new TrialManager();
}
//# sourceMappingURL=trial.js.map