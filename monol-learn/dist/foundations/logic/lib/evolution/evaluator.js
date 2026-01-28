/**
 * Skill Evaluator
 * Evaluates skills based on multiple dimensions
 */
const DEFAULT_CONFIG = {
    weights: {
        quality: 0.5,
        speed: 0.3,
        satisfaction: 0.2,
    },
    minTrialsForConfidence: 10,
    decayFactor: 0.9,
};
/**
 * Skill Evaluator class
 */
export class Evaluator {
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Evaluate a skill based on trial scores
     */
    evaluate(skill, scores) {
        if (scores.length === 0) {
            return this.createEmptyResult(skill.id);
        }
        // Calculate weighted scores (recent trials weighted more heavily)
        const weightedScores = this.applyTimeDecay(scores);
        // Calculate dimension scores
        const qualityScore = this.calculateQualityScore(weightedScores);
        const speedScore = this.calculateSpeedScore(weightedScores);
        const userSatisfaction = this.calculateSatisfactionScore(weightedScores);
        // Calculate composite score
        const compositeScore = qualityScore * this.config.weights.quality +
            speedScore * this.config.weights.speed +
            userSatisfaction * this.config.weights.satisfaction;
        // Calculate confidence based on sample size
        const confidence = Math.min(1, scores.length / this.config.minTrialsForConfidence);
        return {
            skillId: skill.id,
            compositeScore,
            qualityScore,
            speedScore,
            userSatisfaction,
            confidence,
            breakdown: this.calculateBreakdown(weightedScores),
        };
    }
    /**
     * Compare two skills based on trial results
     */
    compare(baseline, challenger) {
        const baselineEval = this.evaluate(baseline.skill, baseline.scores);
        const challengerEval = this.evaluate(challenger.skill, challenger.scores);
        const delta = challengerEval.compositeScore - baselineEval.compositeScore;
        const significance = this.calculateSignificance(baseline.scores, challenger.scores);
        let verdict;
        if (delta > 5 && significance > 0.7) {
            verdict = 'challenger_better';
        }
        else if (delta < -5 && significance > 0.7) {
            verdict = 'baseline_better';
        }
        else {
            verdict = 'no_difference';
        }
        return {
            baseline: baselineEval,
            challenger: challengerEval,
            delta,
            significance,
            verdict,
            details: {
                qualityDelta: challengerEval.qualityScore - baselineEval.qualityScore,
                speedDelta: challengerEval.speedScore - baselineEval.speedScore,
                satisfactionDelta: challengerEval.userSatisfaction - baselineEval.userSatisfaction,
            },
        };
    }
    /**
     * Evaluate a completed trial
     */
    evaluateTrial(trial) {
        const baselineAvg = this.averageScores(trial.baselineScores);
        const challengerAvg = this.averageScores(trial.challengerScores);
        const winRate = trial.challengerWins / Math.max(1, trial.currentTrials);
        const improvement = challengerAvg.composite - baselineAvg.composite;
        return {
            trialId: trial.id,
            baselineScore: baselineAvg.composite,
            challengerScore: challengerAvg.composite,
            winRate,
            improvement,
            shouldPromote: winRate > 0.6 && improvement > 5,
            shouldArchive: winRate < 0.3 && improvement < -10,
        };
    }
    /**
     * Apply time decay to scores
     */
    applyTimeDecay(scores) {
        const sorted = [...scores].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return sorted.map((score, index) => ({
            ...score,
            weight: Math.pow(this.config.decayFactor, index),
        }));
    }
    /**
     * Calculate quality score
     */
    calculateQualityScore(scores) {
        const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
        const weightedSum = scores.reduce((sum, s) => sum + s.quality * s.weight, 0);
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    /**
     * Calculate speed score
     */
    calculateSpeedScore(scores) {
        const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
        const weightedSum = scores.reduce((sum, s) => sum + s.speed * s.weight, 0);
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    /**
     * Calculate satisfaction score
     */
    calculateSatisfactionScore(scores) {
        const scoresWithFeedback = scores.filter((s) => s.userFeedback !== undefined);
        if (scoresWithFeedback.length === 0) {
            return 50; // Neutral default
        }
        const totalWeight = scoresWithFeedback.reduce((sum, s) => sum + s.weight, 0);
        const weightedSum = scoresWithFeedback.reduce((sum, s) => sum + (s.userFeedback ?? 50) * s.weight, 0);
        return totalWeight > 0 ? weightedSum / totalWeight : 50;
    }
    /**
     * Calculate detailed breakdown
     */
    calculateBreakdown(scores) {
        const qualityScore = this.calculateQualityScore(scores);
        const speedScore = this.calculateSpeedScore(scores);
        const satisfaction = this.calculateSatisfactionScore(scores);
        return {
            qualityFactors: {
                correctness: qualityScore * 0.4,
                completeness: qualityScore * 0.35,
                consistency: qualityScore * 0.25,
            },
            speedFactors: {
                responseTime: speedScore * 0.6,
                efficiency: speedScore * 0.4,
            },
            satisfactionFactors: {
                explicitFeedback: satisfaction * 0.7,
                implicitSignals: satisfaction * 0.3,
            },
        };
    }
    /**
     * Calculate statistical significance
     */
    calculateSignificance(baselineScores, challengerScores) {
        if (baselineScores.length < 3 || challengerScores.length < 3) {
            return 0;
        }
        // Simple effect size calculation (Cohen's d approximation)
        const baselineMean = this.mean(baselineScores.map((s) => s.quality));
        const challengerMean = this.mean(challengerScores.map((s) => s.quality));
        const pooledStd = (this.std(baselineScores.map((s) => s.quality)) +
            this.std(challengerScores.map((s) => s.quality))) /
            2;
        if (pooledStd === 0)
            return 1;
        const effectSize = Math.abs(challengerMean - baselineMean) / pooledStd;
        // Convert effect size to 0-1 scale
        return Math.min(1, effectSize / 2);
    }
    /**
     * Average scores into a single composite
     */
    averageScores(scores) {
        if (scores.length === 0) {
            return { composite: 0, quality: 0, speed: 0 };
        }
        const quality = this.mean(scores.map((s) => s.quality));
        const speed = this.mean(scores.map((s) => s.speed));
        const composite = quality * this.config.weights.quality +
            speed * this.config.weights.speed;
        return { composite, quality, speed };
    }
    mean(values) {
        return values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
    }
    std(values) {
        if (values.length < 2)
            return 0;
        const avg = this.mean(values);
        const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }
    createEmptyResult(skillId) {
        return {
            skillId,
            compositeScore: 0,
            qualityScore: 0,
            speedScore: 0,
            userSatisfaction: 50,
            confidence: 0,
            breakdown: {
                qualityFactors: { correctness: 0, completeness: 0, consistency: 0 },
                speedFactors: { responseTime: 0, efficiency: 0 },
                satisfactionFactors: { explicitFeedback: 0, implicitSignals: 0 },
            },
        };
    }
}
export function createEvaluator(config) {
    return new Evaluator(config);
}
//# sourceMappingURL=evaluator.js.map