/**
 * Trial Manager
 * Manages A/B evolution trials between skills
 */
import type { EvolutionTrial, TrialStatus } from '../types.js';
export interface TrialCreationInput {
    baselineId: string;
    challengerId: string;
    minTrials?: number;
}
export interface TrialRecordInput {
    quality: number;
    speed: number;
    userFeedback?: number;
    context: string;
}
/**
 * Create a new evolution trial
 */
export declare function createTrial(input: TrialCreationInput): EvolutionTrial;
/**
 * Trial Manager class
 */
export declare class TrialManager {
    private trials;
    /**
     * Start a new trial
     */
    start(input: TrialCreationInput): EvolutionTrial;
    /**
     * Get a trial by ID
     */
    get(id: string): EvolutionTrial | undefined;
    /**
     * Get all trials
     */
    getAll(): EvolutionTrial[];
    /**
     * Get trials by status
     */
    getByStatus(status: TrialStatus): EvolutionTrial[];
    /**
     * Get running trials
     */
    getRunningTrials(): EvolutionTrial[];
    /**
     * Find trial by skill pair
     */
    findBySkillPair(baselineId: string, challengerId: string): EvolutionTrial | undefined;
    /**
     * Record a baseline trial result
     */
    recordBaseline(trialId: string, input: TrialRecordInput): EvolutionTrial | undefined;
    /**
     * Record a challenger trial result
     */
    recordChallenger(trialId: string, input: TrialRecordInput): EvolutionTrial | undefined;
    /**
     * Record a paired trial result (both baseline and challenger)
     */
    recordPair(trialId: string, baseline: TrialRecordInput, challenger: TrialRecordInput): EvolutionTrial | undefined;
    /**
     * Cancel a trial
     */
    cancel(trialId: string): EvolutionTrial | undefined;
    /**
     * Check and update trial progress
     */
    private checkTrialProgress;
    /**
     * Evaluate trial and mark as completed
     */
    private evaluateAndComplete;
    /**
     * Update trial recommendation based on current results
     */
    private updateRecommendation;
    /**
     * Load trials from storage
     */
    load(trials: EvolutionTrial[]): void;
    /**
     * Export all trials
     */
    export(): EvolutionTrial[];
    /**
     * Clear all trials
     */
    clear(): void;
}
export declare function createTrialManager(): TrialManager;
//# sourceMappingURL=trial.d.ts.map