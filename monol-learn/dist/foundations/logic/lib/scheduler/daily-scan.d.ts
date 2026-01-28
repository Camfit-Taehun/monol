/**
 * Daily Scan Scheduler
 * Runs daily discovery and learning tasks
 */
import { Discovery, type DiscoveryOptions } from '../discovery/index.js';
import { Evolution } from '../evolution/index.js';
import { Internalization } from '../internalization/index.js';
export interface DailyScanConfig {
    discoveryOptions?: DiscoveryOptions;
    maxNewCandidates?: number;
    autoStartTrials?: boolean;
    reportPath?: string;
}
export interface DailyScanResult {
    timestamp: Date;
    duration: number;
    discovery: {
        sourcesScanned: number;
        candidatesFound: number;
        relevantCandidates: number;
    };
    evolution: {
        trialsStarted: number;
        trialsCompleted: number;
        promotions: number;
        demotions: number;
    };
    internalization: {
        rulesCreated: number;
        skillsGenerated: number;
        lessonsCreated: number;
    };
    errors: string[];
}
/**
 * Daily Scan Job
 */
export declare class DailyScan {
    private config;
    private discovery;
    private evolution;
    private internalization;
    private lastRun?;
    private results;
    constructor(discovery: Discovery, evolution: Evolution, internalization: Internalization, config?: DailyScanConfig);
    /**
     * Execute the daily scan
     */
    run(): Promise<DailyScanResult>;
    /**
     * Run discovery phase
     */
    private runDiscoveryPhase;
    /**
     * Run evolution phase
     */
    private runEvolutionPhase;
    /**
     * Run internalization phase
     */
    private runInternalizationPhase;
    /**
     * Start trials for new candidates
     */
    private startTrialsForCandidates;
    /**
     * Get last run timestamp
     */
    getLastRun(): Date | undefined;
    /**
     * Get recent results
     */
    getRecentResults(count?: number): DailyScanResult[];
    /**
     * Generate summary report
     */
    generateReport(result: DailyScanResult): string;
}
export declare function createDailyScan(discovery: Discovery, evolution: Evolution, internalization: Internalization, config?: DailyScanConfig): DailyScan;
//# sourceMappingURL=daily-scan.d.ts.map