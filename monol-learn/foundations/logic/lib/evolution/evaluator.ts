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
  decayFactor: number; // How much to weight recent trials
}

const DEFAULT_CONFIG: EvaluationConfig = {
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
  private config: EvaluationConfig;

  constructor(config: Partial<EvaluationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evaluate a skill based on trial scores
   */
  evaluate(skill: Skill, scores: TrialScore[]): EvaluationResult {
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
    const compositeScore =
      qualityScore * this.config.weights.quality +
      speedScore * this.config.weights.speed +
      userSatisfaction * this.config.weights.satisfaction;

    // Calculate confidence based on sample size
    const confidence = Math.min(
      1,
      scores.length / this.config.minTrialsForConfidence
    );

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
  compare(
    baseline: { skill: Skill; scores: TrialScore[] },
    challenger: { skill: Skill; scores: TrialScore[] }
  ): ComparisonResult {
    const baselineEval = this.evaluate(baseline.skill, baseline.scores);
    const challengerEval = this.evaluate(challenger.skill, challenger.scores);

    const delta = challengerEval.compositeScore - baselineEval.compositeScore;
    const significance = this.calculateSignificance(
      baseline.scores,
      challenger.scores
    );

    let verdict: 'challenger_better' | 'baseline_better' | 'no_difference';
    if (delta > 5 && significance > 0.7) {
      verdict = 'challenger_better';
    } else if (delta < -5 && significance > 0.7) {
      verdict = 'baseline_better';
    } else {
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
        satisfactionDelta:
          challengerEval.userSatisfaction - baselineEval.userSatisfaction,
      },
    };
  }

  /**
   * Evaluate a completed trial
   */
  evaluateTrial(trial: EvolutionTrial): TrialEvaluationResult {
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
  private applyTimeDecay(scores: TrialScore[]): WeightedScore[] {
    const sorted = [...scores].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return sorted.map((score, index) => ({
      ...score,
      weight: Math.pow(this.config.decayFactor, index),
    }));
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(scores: WeightedScore[]): number {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce(
      (sum, s) => sum + s.quality * s.weight,
      0
    );
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate speed score
   */
  private calculateSpeedScore(scores: WeightedScore[]): number {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce((sum, s) => sum + s.speed * s.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate satisfaction score
   */
  private calculateSatisfactionScore(scores: WeightedScore[]): number {
    const scoresWithFeedback = scores.filter(
      (s) => s.userFeedback !== undefined
    );
    if (scoresWithFeedback.length === 0) {
      return 50; // Neutral default
    }

    const totalWeight = scoresWithFeedback.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scoresWithFeedback.reduce(
      (sum, s) => sum + (s.userFeedback ?? 50) * s.weight,
      0
    );
    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  }

  /**
   * Calculate detailed breakdown
   */
  private calculateBreakdown(scores: WeightedScore[]): EvaluationBreakdown {
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
  private calculateSignificance(
    baselineScores: TrialScore[],
    challengerScores: TrialScore[]
  ): number {
    if (baselineScores.length < 3 || challengerScores.length < 3) {
      return 0;
    }

    // Simple effect size calculation (Cohen's d approximation)
    const baselineMean = this.mean(baselineScores.map((s) => s.quality));
    const challengerMean = this.mean(challengerScores.map((s) => s.quality));
    const pooledStd =
      (this.std(baselineScores.map((s) => s.quality)) +
        this.std(challengerScores.map((s) => s.quality))) /
      2;

    if (pooledStd === 0) return 1;

    const effectSize = Math.abs(challengerMean - baselineMean) / pooledStd;
    // Convert effect size to 0-1 scale
    return Math.min(1, effectSize / 2);
  }

  /**
   * Average scores into a single composite
   */
  private averageScores(
    scores: TrialScore[]
  ): { composite: number; quality: number; speed: number } {
    if (scores.length === 0) {
      return { composite: 0, quality: 0, speed: 0 };
    }

    const quality = this.mean(scores.map((s) => s.quality));
    const speed = this.mean(scores.map((s) => s.speed));
    const composite =
      quality * this.config.weights.quality +
      speed * this.config.weights.speed;

    return { composite, quality, speed };
  }

  private mean(values: number[]): number {
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  }

  private std(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = this.mean(values);
    const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  private createEmptyResult(skillId: string): EvaluationResult {
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

interface WeightedScore extends TrialScore {
  weight: number;
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

export function createEvaluator(config?: Partial<EvaluationConfig>): Evaluator {
  return new Evaluator(config);
}
