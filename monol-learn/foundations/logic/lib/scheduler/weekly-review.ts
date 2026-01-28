/**
 * Weekly Review Scheduler
 * Runs weekly analysis and cleanup tasks
 */

import { Evolution } from '../evolution/index.js';
import { Internalization } from '../internalization/index.js';
import type { Skill, TrendSnapshot, LessonPoint } from '../types.js';

export interface WeeklyReviewConfig {
  archiveThreshold?: number; // Archive skills below this score
  staleTrialDays?: number; // Cancel trials older than this
  maxLessonsPerCategory?: number;
  trendAnalysisEnabled?: boolean;
}

export interface WeeklyReviewResult {
  timestamp: Date;
  period: string; // e.g., "2026-W04"
  duration: number;
  cleanup: {
    staleTrialsCancelled: number;
    lowPerformersArchived: number;
    duplicatesRemoved: number;
  };
  analysis: {
    topPerformingSkills: SkillPerformanceSummary[];
    underperformingSkills: SkillPerformanceSummary[];
    trendSnapshot?: TrendSnapshot;
  };
  recommendations: string[];
  errors: string[];
}

export interface SkillPerformanceSummary {
  id: string;
  name: string;
  compositeScore: number;
  trialsCount: number;
  trend: 'improving' | 'stable' | 'declining';
}

const DEFAULT_CONFIG: WeeklyReviewConfig = {
  archiveThreshold: 30,
  staleTrialDays: 30,
  maxLessonsPerCategory: 50,
  trendAnalysisEnabled: true,
};

/**
 * Weekly Review Job
 */
export class WeeklyReview {
  private config: WeeklyReviewConfig;
  private evolution: Evolution;
  private internalization: Internalization;

  private lastRun?: Date;
  private results: WeeklyReviewResult[] = [];

  constructor(
    evolution: Evolution,
    internalization: Internalization,
    config: WeeklyReviewConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.evolution = evolution;
    this.internalization = internalization;
  }

  /**
   * Execute the weekly review
   */
  async run(): Promise<WeeklyReviewResult> {
    const startTime = Date.now();
    const result: WeeklyReviewResult = {
      timestamp: new Date(),
      period: this.getCurrentWeek(),
      duration: 0,
      cleanup: {
        staleTrialsCancelled: 0,
        lowPerformersArchived: 0,
        duplicatesRemoved: 0,
      },
      analysis: {
        topPerformingSkills: [],
        underperformingSkills: [],
      },
      recommendations: [],
      errors: [],
    };

    try {
      // Phase 1: Cleanup
      await this.runCleanupPhase(result);

      // Phase 2: Analysis
      await this.runAnalysisPhase(result);

      // Phase 3: Generate recommendations
      this.generateRecommendations(result);
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error)
      );
    }

    result.duration = Date.now() - startTime;
    this.lastRun = result.timestamp;
    this.results.push(result);

    return result;
  }

  /**
   * Run cleanup phase
   */
  private async runCleanupPhase(result: WeeklyReviewResult): Promise<void> {
    try {
      // Cancel stale trials
      const staleTrials = this.findStaleTrials();
      for (const trialId of staleTrials) {
        this.evolution.trials.cancel(trialId);
        result.cleanup.staleTrialsCancelled++;
      }

      // Archive low performers
      const lowPerformers = this.findLowPerformers();
      for (const skill of lowPerformers) {
        this.evolution.promoter.archive(
          skill.id,
          `Archived due to low performance (score: ${skill.compositeScore.toFixed(1)})`
        );
        result.cleanup.lowPerformersArchived++;

        // Create lesson from archived skill
        this.internalization.internalizeArchivedSkill(
          skill,
          'Low performance in weekly review'
        );
      }

      // Remove duplicates
      const duplicates = this.findDuplicateSkills();
      for (const skillId of duplicates) {
        this.evolution.candidates.remove(skillId);
        result.cleanup.duplicatesRemoved++;
      }
    } catch (error) {
      result.errors.push(
        `Cleanup failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Run analysis phase
   */
  private async runAnalysisPhase(result: WeeklyReviewResult): Promise<void> {
    try {
      const allSkills = this.evolution.candidates.getAll();

      // Find top performers
      result.analysis.topPerformingSkills = allSkills
        .filter((s) => s.status === 'active')
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, 5)
        .map((s) => this.createPerformanceSummary(s));

      // Find underperformers
      result.analysis.underperformingSkills = allSkills
        .filter(
          (s) =>
            s.status === 'active' &&
            s.compositeScore < (this.config.archiveThreshold ?? 30) * 1.5
        )
        .sort((a, b) => a.compositeScore - b.compositeScore)
        .slice(0, 5)
        .map((s) => this.createPerformanceSummary(s));

      // Generate trend snapshot if enabled
      if (this.config.trendAnalysisEnabled) {
        result.analysis.trendSnapshot = this.generateTrendSnapshot();
      }
    } catch (error) {
      result.errors.push(
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(result: WeeklyReviewResult): void {
    const summary = this.evolution.getSummary();

    // Recommendation based on current state
    if (summary.byStatus.candidate > 10) {
      result.recommendations.push(
        `Consider starting more trials - ${summary.byStatus.candidate} candidates waiting`
      );
    }

    if (summary.runningTrials > 20) {
      result.recommendations.push(
        `Many trials running (${summary.runningTrials}) - consider focusing on completion`
      );
    }

    if (result.analysis.underperformingSkills.length > 3) {
      result.recommendations.push(
        `Review underperforming skills - ${result.analysis.underperformingSkills.length} skills near archive threshold`
      );
    }

    if (summary.byStatus.active < 5) {
      result.recommendations.push(
        'Active skill count is low - consider promoting high-confidence candidates'
      );
    }

    if (result.cleanup.staleTrialsCancelled > 5) {
      result.recommendations.push(
        'Many stale trials found - review trial completion process'
      );
    }
  }

  /**
   * Find stale trials
   */
  private findStaleTrials(): string[] {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - (this.config.staleTrialDays ?? 30));

    return this.evolution.trials
      .getRunningTrials()
      .filter((t) => t.createdAt < staleDate)
      .map((t) => t.id);
  }

  /**
   * Find low performing skills
   */
  private findLowPerformers(): Skill[] {
    const threshold = this.config.archiveThreshold ?? 30;
    return this.evolution.candidates
      .getByStatus('active')
      .filter(
        (s) =>
          s.compositeScore < threshold &&
          s.trialsCount >= 10 // Only archive after sufficient trials
      );
  }

  /**
   * Find duplicate skills
   */
  private findDuplicateSkills(): string[] {
    const duplicates: string[] = [];
    const skills = this.evolution.candidates.getAll();
    const seen = new Map<string, string>();

    for (const skill of skills) {
      const key = skill.name.toLowerCase().trim();
      if (seen.has(key)) {
        // Keep the one with higher score
        const existingId = seen.get(key)!;
        const existing = this.evolution.candidates.get(existingId);
        if (existing && skill.compositeScore > existing.compositeScore) {
          duplicates.push(existingId);
          seen.set(key, skill.id);
        } else {
          duplicates.push(skill.id);
        }
      } else {
        seen.set(key, skill.id);
      }
    }

    return duplicates;
  }

  /**
   * Create performance summary for a skill
   */
  private createPerformanceSummary(skill: Skill): SkillPerformanceSummary {
    return {
      id: skill.id,
      name: skill.name,
      compositeScore: skill.compositeScore,
      trialsCount: skill.trialsCount,
      trend: this.determineTrend(skill),
    };
  }

  /**
   * Determine skill trend
   */
  private determineTrend(skill: Skill): 'improving' | 'stable' | 'declining' {
    // Simplified trend calculation
    // In real implementation, would compare scores over time
    const successRate = skill.successCount / Math.max(1, skill.trialsCount);

    if (successRate > 0.7) return 'improving';
    if (successRate < 0.4) return 'declining';
    return 'stable';
  }

  /**
   * Generate trend snapshot
   */
  private generateTrendSnapshot(): TrendSnapshot {
    return {
      id: `trend_${Date.now()}`,
      category: 'tech',
      period: this.getCurrentWeek(),
      trends: [],
      analysis: 'Weekly trend analysis',
      relevanceScore: 0,
      actionsTaken: [],
      createdAt: new Date(),
    };
  }

  /**
   * Get current week string
   */
  private getCurrentWeek(): string {
    const date = new Date();
    const year = date.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const week = Math.ceil(
      ((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
    );
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get last run timestamp
   */
  getLastRun(): Date | undefined {
    return this.lastRun;
  }

  /**
   * Get recent results
   */
  getRecentResults(count: number = 4): WeeklyReviewResult[] {
    return this.results.slice(-count);
  }

  /**
   * Generate summary report
   */
  generateReport(result: WeeklyReviewResult): string {
    const lines: string[] = [];

    lines.push('# Weekly Review Report');
    lines.push(`**Period**: ${result.period}`);
    lines.push(`**Date**: ${result.timestamp.toISOString()}`);
    lines.push(`**Duration**: ${result.duration}ms`);
    lines.push('');

    lines.push('## Cleanup');
    lines.push(`- Stale trials cancelled: ${result.cleanup.staleTrialsCancelled}`);
    lines.push(`- Low performers archived: ${result.cleanup.lowPerformersArchived}`);
    lines.push(`- Duplicates removed: ${result.cleanup.duplicatesRemoved}`);
    lines.push('');

    lines.push('## Top Performing Skills');
    for (const skill of result.analysis.topPerformingSkills) {
      lines.push(
        `- **${skill.name}**: ${skill.compositeScore.toFixed(1)} (${skill.trend})`
      );
    }
    lines.push('');

    if (result.analysis.underperformingSkills.length > 0) {
      lines.push('## Skills Needing Attention');
      for (const skill of result.analysis.underperformingSkills) {
        lines.push(
          `- **${skill.name}**: ${skill.compositeScore.toFixed(1)} (${skill.trend})`
        );
      }
      lines.push('');
    }

    if (result.recommendations.length > 0) {
      lines.push('## Recommendations');
      for (const rec of result.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push('');
    }

    if (result.errors.length > 0) {
      lines.push('## Errors');
      for (const error of result.errors) {
        lines.push(`- ${error}`);
      }
    }

    return lines.join('\n');
  }
}

export function createWeeklyReview(
  evolution: Evolution,
  internalization: Internalization,
  config?: WeeklyReviewConfig
): WeeklyReview {
  return new WeeklyReview(evolution, internalization, config);
}
