/**
 * Weekly Review Scheduler
 * Runs weekly analysis and cleanup tasks
 */
import { Evolution } from '../evolution/index.js';
import { Internalization } from '../internalization/index.js';
import type { TrendSnapshot } from '../types.js';
export interface WeeklyReviewConfig {
    archiveThreshold?: number;
    staleTrialDays?: number;
    maxLessonsPerCategory?: number;
    trendAnalysisEnabled?: boolean;
}
export interface WeeklyReviewResult {
    timestamp: Date;
    period: string;
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
/**
 * Weekly Review Job
 */
export declare class WeeklyReview {
    private config;
    private evolution;
    private internalization;
    private lastRun?;
    private results;
    constructor(evolution: Evolution, internalization: Internalization, config?: WeeklyReviewConfig);
    /**
     * Execute the weekly review
     */
    run(): Promise<WeeklyReviewResult>;
    /**
     * Run cleanup phase
     */
    private runCleanupPhase;
    /**
     * Run analysis phase
     */
    private runAnalysisPhase;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Find stale trials
     */
    private findStaleTrials;
    /**
     * Find low performing skills
     */
    private findLowPerformers;
    /**
     * Find duplicate skills
     */
    private findDuplicateSkills;
    /**
     * Create performance summary for a skill
     */
    private createPerformanceSummary;
    /**
     * Determine skill trend
     */
    private determineTrend;
    /**
     * Generate trend snapshot
     */
    private generateTrendSnapshot;
    /**
     * Get current week string
     */
    private getCurrentWeek;
    /**
     * Get last run timestamp
     */
    getLastRun(): Date | undefined;
    /**
     * Get recent results
     */
    getRecentResults(count?: number): WeeklyReviewResult[];
    /**
     * Generate summary report
     */
    generateReport(result: WeeklyReviewResult): string;
}
export declare function createWeeklyReview(evolution: Evolution, internalization: Internalization, config?: WeeklyReviewConfig): WeeklyReview;
//# sourceMappingURL=weekly-review.d.ts.map