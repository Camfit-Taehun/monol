/**
 * Skill Evaluator
 * Evaluates skills based on multiple dimensions
 */
import type { Skill, EvolutionTrial, TrialScore } from '../types.js';
export interface EvaluationResult {
    skillId: string;
    compositeScore: number;
    qualityScore: number;
    speedScore: number;
    userSatisfaction: number;
    confidence: number;
    breakdown: EvaluationBreakdown;
}
export interface EvaluationBreakdown {
    qualityFactors: {
        correctness: number;
        completeness: number;
        consistency: number;
    };
    speedFactors: {
        responseTime: number;
        efficiency: number;
    };
    satisfactionFactors: {
        explicitFeedback: number;
        implicitSignals: number;
    };
}
export interface EvaluationConfig {
    weights: {
        quality: number;
        speed: number;
        satisfaction: number;
    };
    minTrialsForConfidence: number;
    decayFactor: number;
}
/**
 * Skill Evaluator class
 */
export declare class Evaluator {
    private config;
    constructor(config?: Partial<EvaluationConfig>);
    /**
     * Evaluate a skill based on trial scores
     */
    evaluate(skill: Skill, scores: TrialScore[]): EvaluationResult;
    /**
     * Compare two skills based on trial results
     */
    compare(baseline: {
        skill: Skill;
        scores: TrialScore[];
    }, challenger: {
        skill: Skill;
        scores: TrialScore[];
    }): ComparisonResult;
    /**
     * Evaluate a completed trial
     */
    evaluateTrial(trial: EvolutionTrial): TrialEvaluationResult;
    /**
     * Apply time decay to scores
     */
    private applyTimeDecay;
    /**
     * Calculate quality score
     */
    private calculateQualityScore;
    /**
     * Calculate speed score
     */
    private calculateSpeedScore;
    /**
     * Calculate satisfaction score
     */
    private calculateSatisfactionScore;
    /**
     * Calculate detailed breakdown
     */
    private calculateBreakdown;
    /**
     * Calculate statistical significance
     */
    private calculateSignificance;
    /**
     * Average scores into a single composite
     */
    private averageScores;
    private mean;
    private std;
    private createEmptyResult;
}
export interface ComparisonResult {
    baseline: EvaluationResult;
    challenger: EvaluationResult;
    delta: number;
    significance: number;
    verdict: 'challenger_better' | 'baseline_better' | 'no_difference';
    details: {
        qualityDelta: number;
        speedDelta: number;
        satisfactionDelta: number;
    };
}
export interface TrialEvaluationResult {
    trialId: string;
    baselineScore: number;
    challengerScore: number;
    winRate: number;
    improvement: number;
    shouldPromote: boolean;
    shouldArchive: boolean;
}
export declare function createEvaluator(config?: Partial<EvaluationConfig>): Evaluator;
//# sourceMappingURL=evaluator.d.ts.map