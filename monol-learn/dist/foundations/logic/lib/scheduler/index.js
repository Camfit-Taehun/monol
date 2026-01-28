/**
 * Scheduler Module
 * Orchestrates scheduled learning tasks
 */
export { DailyScan, createDailyScan, } from './daily-scan.js';
export { WeeklyReview, createWeeklyReview, } from './weekly-review.js';
import { createDailyScan } from './daily-scan.js';
import { createWeeklyReview } from './weekly-review.js';
const DEFAULT_CONFIG = {
    schedules: {
        dailyScan: '0 3 * * *', // 3 AM daily
        weeklyReview: '0 4 * * 0', // 4 AM Sunday
    },
};
/**
 * Scheduler orchestrator
 */
export class Scheduler {
    dailyScan;
    weeklyReview;
    config;
    running = false;
    timers = [];
    constructor(discovery, evolution, internalization, config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.dailyScan = createDailyScan(discovery, evolution, internalization, config.dailyScan);
        this.weeklyReview = createWeeklyReview(evolution, internalization, config.weeklyReview);
    }
    /**
     * Run daily scan manually
     */
    async runDailyScan() {
        return this.dailyScan.run();
    }
    /**
     * Run weekly review manually
     */
    async runWeeklyReview() {
        return this.weeklyReview.run();
    }
    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            running: this.running,
            dailyScan: {
                lastRun: this.dailyScan.getLastRun(),
                nextRun: this.getNextRunTime('dailyScan'),
            },
            weeklyReview: {
                lastRun: this.weeklyReview.getLastRun(),
                nextRun: this.getNextRunTime('weeklyReview'),
            },
        };
    }
    /**
     * Get summary of recent activity
     */
    getSummary() {
        const dailyResults = this.dailyScan.getRecentResults(7);
        const weeklyResults = this.weeklyReview.getRecentResults(4);
        return {
            dailyScans: {
                count: dailyResults.length,
                totalCandidates: dailyResults.reduce((sum, r) => sum + r.discovery.candidatesFound, 0),
                totalPromotions: dailyResults.reduce((sum, r) => sum + r.evolution.promotions, 0),
                totalErrors: dailyResults.reduce((sum, r) => sum + r.errors.length, 0),
            },
            weeklyReviews: {
                count: weeklyResults.length,
                totalArchived: weeklyResults.reduce((sum, r) => sum + r.cleanup.lowPerformersArchived, 0),
                totalCleanup: weeklyResults.reduce((sum, r) => sum +
                    r.cleanup.staleTrialsCancelled +
                    r.cleanup.duplicatesRemoved, 0),
            },
        };
    }
    /**
     * Calculate next run time
     */
    getNextRunTime(job) {
        const schedule = this.config.schedules?.[job];
        if (!schedule)
            return undefined;
        // Simplified cron parsing - in real implementation would use a cron library
        return this.parseSimpleCron(schedule);
    }
    /**
     * Simple cron parsing (handles basic patterns)
     */
    parseSimpleCron(cron) {
        const parts = cron.split(' ');
        if (parts.length !== 5)
            return undefined;
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        const now = new Date();
        const next = new Date(now);
        // Set time
        next.setMinutes(parseInt(minute) || 0);
        next.setHours(parseInt(hour) || 0);
        next.setSeconds(0);
        next.setMilliseconds(0);
        // If time is in the past, move to next day
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
        // Handle day of week
        if (dayOfWeek !== '*') {
            const targetDay = parseInt(dayOfWeek);
            while (next.getDay() !== targetDay) {
                next.setDate(next.getDate() + 1);
            }
        }
        return next;
    }
    /**
     * Generate combined report
     */
    generateReport() {
        const status = this.getStatus();
        const summary = this.getSummary();
        const lines = [];
        lines.push('# Learning Scheduler Report');
        lines.push('');
        lines.push('## Status');
        lines.push(`Running: ${status.running ? 'Yes' : 'No'}`);
        lines.push('');
        lines.push('### Daily Scan');
        lines.push(`- Last run: ${status.dailyScan.lastRun?.toISOString() ?? 'Never'}`);
        lines.push(`- Next run: ${status.dailyScan.nextRun?.toISOString() ?? 'Not scheduled'}`);
        lines.push('');
        lines.push('### Weekly Review');
        lines.push(`- Last run: ${status.weeklyReview.lastRun?.toISOString() ?? 'Never'}`);
        lines.push(`- Next run: ${status.weeklyReview.nextRun?.toISOString() ?? 'Not scheduled'}`);
        lines.push('');
        lines.push('## Recent Activity Summary');
        lines.push('');
        lines.push('### Daily Scans (Last 7 days)');
        lines.push(`- Scans completed: ${summary.dailyScans.count}`);
        lines.push(`- Candidates discovered: ${summary.dailyScans.totalCandidates}`);
        lines.push(`- Skills promoted: ${summary.dailyScans.totalPromotions}`);
        lines.push(`- Errors: ${summary.dailyScans.totalErrors}`);
        lines.push('');
        lines.push('### Weekly Reviews (Last 4 weeks)');
        lines.push(`- Reviews completed: ${summary.weeklyReviews.count}`);
        lines.push(`- Skills archived: ${summary.weeklyReviews.totalArchived}`);
        lines.push(`- Items cleaned up: ${summary.weeklyReviews.totalCleanup}`);
        return lines.join('\n');
    }
}
export function createScheduler(discovery, evolution, internalization, config) {
    return new Scheduler(discovery, evolution, internalization, config);
}
//# sourceMappingURL=index.js.map