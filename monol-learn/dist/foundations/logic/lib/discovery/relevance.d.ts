/**
 * Relevance Analyzer
 * Analyzes relevance of discovered skills to current project/context
 */
import type { SkillCandidate, Skill } from '../types.js';
export interface RelevanceContext {
    projectType?: string;
    languages?: string[];
    frameworks?: string[];
    existingSkills?: Skill[];
    recentTopics?: string[];
    userPreferences?: Record<string, unknown>;
}
export interface RelevanceScore {
    overall: number;
    breakdown: {
        projectMatch: number;
        novelty: number;
        utility: number;
        quality: number;
    };
    reasoning: string;
}
export declare class RelevanceAnalyzer {
    private context;
    setContext(context: RelevanceContext): void;
    getContext(): RelevanceContext;
    /**
     * Analyze relevance of a skill candidate
     */
    analyze(candidate: SkillCandidate): RelevanceScore;
    /**
     * Batch analyze multiple candidates
     */
    analyzeAll(candidates: SkillCandidate[]): Map<string, RelevanceScore>;
    /**
     * Filter candidates by relevance threshold
     */
    filterByRelevance(candidates: SkillCandidate[], threshold?: number): SkillCandidate[];
    /**
     * Rank candidates by relevance
     */
    rankByRelevance(candidates: SkillCandidate[]): SkillCandidate[];
    private calculateProjectMatch;
    private calculateNovelty;
    private calculateUtility;
    private estimateQuality;
    private matchTerms;
    private calculateSimilarity;
    private generateReasoning;
}
export declare function createRelevanceAnalyzer(context?: RelevanceContext): RelevanceAnalyzer;
//# sourceMappingURL=relevance.d.ts.map