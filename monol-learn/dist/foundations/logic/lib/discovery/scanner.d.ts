/**
 * Discovery Scanner
 * Scans external sources for new skills and knowledge
 */
import type { DiscoverySource, DiscoveryResult } from '../types.js';
export interface ScannerOptions {
    maxCandidates?: number;
    minRelevance?: number;
    excludePatterns?: string[];
}
export declare class Scanner {
    private sources;
    private options;
    constructor(options?: ScannerOptions);
    addSource(source: DiscoverySource): void;
    removeSource(url: string): void;
    getSources(): DiscoverySource[];
    scan(source?: DiscoverySource): Promise<DiscoveryResult[]>;
    private scanSource;
    private scanPluginMarketplace;
    private scanGitHub;
    private scanBlog;
    private scanDocs;
    private scanRSS;
    private filterCandidates;
}
export declare function createScanner(options?: ScannerOptions): Scanner;
//# sourceMappingURL=scanner.d.ts.map