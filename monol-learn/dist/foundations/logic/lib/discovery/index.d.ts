/**
 * Discovery Module
 * Orchestrates skill and knowledge discovery from external sources
 */
export { Scanner, createScanner, type ScannerOptions } from './scanner.js';
export { Extractor, createExtractor, type ExtractionResult, type ExtractedSkill, type ExtractedLesson, type ExtractedPattern, } from './extractor.js';
export { RelevanceAnalyzer, createRelevanceAnalyzer, type RelevanceContext, type RelevanceScore, } from './relevance.js';
import { type RelevanceContext } from './relevance.js';
import type { DiscoverySource, DiscoveryResult, SkillCandidate } from '../types.js';
export interface DiscoveryOptions {
    sources?: DiscoverySource[];
    relevanceContext?: RelevanceContext;
    minRelevance?: number;
    maxCandidates?: number;
}
/**
 * Discovery orchestrator - coordinates scanning, extraction, and relevance
 */
export declare class Discovery {
    private scanner;
    private extractor;
    private relevanceAnalyzer;
    private options;
    constructor(options?: DiscoveryOptions);
    /**
     * Run full discovery pipeline
     */
    discover(): Promise<DiscoveryPipelineResult>;
    /**
     * Quick scan without extraction
     */
    quickScan(): Promise<SkillCandidate[]>;
    /**
     * Add a discovery source
     */
    addSource(source: DiscoverySource): void;
    /**
     * Update relevance context
     */
    setContext(context: RelevanceContext): void;
    private deduplicateCandidates;
    private generateSummary;
}
export interface DiscoveryPipelineResult {
    scanResults: DiscoveryResult[];
    candidates: SkillCandidate[];
    relevanceScores: Map<string, {
        overall: number;
    }>;
    extraction: import('./extractor.js').ExtractionResult;
    summary: DiscoverySummary;
}
export interface DiscoverySummary {
    sourcesScanned: number;
    totalCandidates: number;
    highRelevanceCandidates: number;
    topCandidates: Array<{
        name: string;
        type: string;
        relevance: number;
    }>;
    timestamp: Date;
}
export declare function createDiscovery(options?: DiscoveryOptions): Discovery;
//# sourceMappingURL=index.d.ts.map