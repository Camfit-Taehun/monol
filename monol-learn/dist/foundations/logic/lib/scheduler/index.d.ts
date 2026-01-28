/**
 * Scheduler Module
 * Orchestrates scheduled learning tasks
 */
export { DailyScan, createDailyScan, type DailyScanConfig, type DailyScanResult, } from './daily-scan.js';
export { WeeklyReview, createWeeklyReview, type WeeklyReviewConfig, type WeeklyReviewResult, type SkillPerformanceSummary, } from './weekly-review.js';
import { DailyScan, type DailyScanConfig } from './daily-scan.js';
import { WeeklyReview, type WeeklyReviewConfig } from './weekly-review.js';
import { Discovery } from '../discovery/index.js';
import { Evolution } from '../evolution/index.js';
import { Internalization } from '../internalization/index.js';
export interface SchedulerConfig {
    dailyScan?: DailyScanConfig;
    weeklyReview?: WeeklyReviewConfig;
    schedules?: {
        dailyScan?: string;
        weeklyReview?: string;
    };
}
/**
 * Scheduler orchestrator
 */
export declare class Scheduler {
    readonly dailyScan: DailyScan;
    readonly weeklyReview: WeeklyReview;
    private config;
    private running;
    private timers;
    constructor(discovery: Discovery, evolution: Evolution, internalization: Internalization, config?: SchedulerConfig);
    /**
     * Run daily scan manually
     */
    runDailyScan(): Promise<import('./daily-scan.js').DailyScanResult>;
    /**
     * Run weekly review manually
     */
    runWeeklyReview(): Promise<import('./weekly-review.js').WeeklyReviewResult>;
    /**
     * Get scheduler status
     */
    getStatus(): SchedulerStatus;
    /**
     * Get summary of recent activity
     */
    getSummary(): SchedulerSummary;
    /**
     * Calculate next run time
     */
    private getNextRunTime;
    /**
     * Simple cron parsing (handles basic patterns)
     */
    private parseSimpleCron;
    /**
     * Generate combined report
     */
    generateReport(): string;
}
export interface SchedulerStatus {
    running: boolean;
    dailyScan: {
        lastRun?: Date;
        nextRun?: Date;
    };
    weeklyReview: {
        lastRun?: Date;
        nextRun?: Date;
    };
}
export interface SchedulerSummary {
    dailyScans: {
        count: number;
        totalCandidates: number;
        totalPromotions: number;
        totalErrors: number;
    };
    weeklyReviews: {
        count: number;
        totalArchived: number;
        totalCleanup: number;
    };
}
export declare function createScheduler(discovery: Discovery, evolution: Evolution, internalization: Internalization, config?: SchedulerConfig): Scheduler;
//# sourceMappingURL=index.d.ts.map