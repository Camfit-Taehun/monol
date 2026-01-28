/**
 * Discovery Module
 * Orchestrates skill and knowledge discovery from external sources
 */
export { Scanner, createScanner } from './scanner.js';
export { Extractor, createExtractor, } from './extractor.js';
export { RelevanceAnalyzer, createRelevanceAnalyzer, } from './relevance.js';
import { createScanner } from './scanner.js';
import { createExtractor } from './extractor.js';
import { createRelevanceAnalyzer, } from './relevance.js';
/**
 * Discovery orchestrator - coordinates scanning, extraction, and relevance
 */
export class Discovery {
    scanner;
    extractor;
    relevanceAnalyzer;
    options;
    constructor(options = {}) {
        this.options = options;
        this.scanner = createScanner({
            maxCandidates: options.maxCandidates ?? 50,
            minRelevance: options.minRelevance ?? 30,
        });
        this.extractor = createExtractor();
        this.relevanceAnalyzer = createRelevanceAnalyzer(options.relevanceContext);
        // Add initial sources
        if (options.sources) {
            for (const source of options.sources) {
                this.scanner.addSource(source);
            }
        }
    }
    /**
     * Run full discovery pipeline
     */
    async discover() {
        // 1. Scan all sources
        const scanResults = await this.scanner.scan();
        // 2. Collect and deduplicate candidates
        const allCandidates = this.deduplicateCandidates(scanResults.flatMap((r) => r.candidates));
        // 3. Analyze relevance
        const relevanceScores = this.relevanceAnalyzer.analyzeAll(allCandidates);
        // 4. Filter by relevance
        const relevantCandidates = allCandidates.filter((c) => (relevanceScores.get(c.name)?.overall ?? 0) >=
            (this.options.minRelevance ?? 30));
        // 5. Extract knowledge from top candidates
        const topCandidates = this.relevanceAnalyzer
            .rankByRelevance(relevantCandidates)
            .slice(0, 10);
        const extractions = await Promise.all(topCandidates.map((c) => this.extractor.extractFromCandidate(c)));
        const extraction = this.extractor.mergeResults(...extractions);
        return {
            scanResults,
            candidates: relevantCandidates,
            relevanceScores,
            extraction,
            summary: this.generateSummary(scanResults, relevantCandidates, relevanceScores),
        };
    }
    /**
     * Quick scan without extraction
     */
    async quickScan() {
        const results = await this.scanner.scan();
        const candidates = this.deduplicateCandidates(results.flatMap((r) => r.candidates));
        return this.relevanceAnalyzer.filterByRelevance(candidates, this.options.minRelevance ?? 30);
    }
    /**
     * Add a discovery source
     */
    addSource(source) {
        this.scanner.addSource(source);
    }
    /**
     * Update relevance context
     */
    setContext(context) {
        this.relevanceAnalyzer.setContext(context);
    }
    deduplicateCandidates(candidates) {
        const seen = new Map();
        for (const candidate of candidates) {
            const key = candidate.name.toLowerCase();
            if (!seen.has(key) ||
                candidate.relevanceScore > (seen.get(key)?.relevanceScore ?? 0)) {
                seen.set(key, candidate);
            }
        }
        return Array.from(seen.values());
    }
    generateSummary(scanResults, candidates, relevanceScores) {
        const highRelevance = candidates.filter((c) => (relevanceScores.get(c.name)?.overall ?? 0) >= 70);
        return {
            sourcesScanned: scanResults.length,
            totalCandidates: candidates.length,
            highRelevanceCandidates: highRelevance.length,
            topCandidates: highRelevance.slice(0, 5).map((c) => ({
                name: c.name,
                type: c.type,
                relevance: relevanceScores.get(c.name)?.overall ?? 0,
            })),
            timestamp: new Date(),
        };
    }
}
export function createDiscovery(options) {
    return new Discovery(options);
}
//# sourceMappingURL=index.js.map