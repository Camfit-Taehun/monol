/**
 * Knowledge Extractor
 * Extracts actionable knowledge from discovered content
 */
import type { SkillCandidate, SkillType } from '../types.js';
export interface ExtractionResult {
    skills: ExtractedSkill[];
    lessons: ExtractedLesson[];
    patterns: ExtractedPattern[];
}
export interface ExtractedSkill {
    name: string;
    type: SkillType;
    description: string;
    implementation: string;
    prerequisites: string[];
    tags: string[];
}
export interface ExtractedLesson {
    title: string;
    content: string;
    category: string;
    applicability: string[];
}
export interface ExtractedPattern {
    name: string;
    description: string;
    context: string;
    example: string;
    antiPattern?: string;
}
export declare class Extractor {
    /**
     * Extract knowledge from a skill candidate
     */
    extractFromCandidate(candidate: SkillCandidate): Promise<ExtractionResult>;
    /**
     * Extract skill from candidate
     */
    private extractSkill;
    /**
     * Extract lessons from candidate
     */
    private extractLessons;
    /**
     * Extract patterns from candidate
     */
    private extractPatterns;
    /**
     * Extract from raw content (URL or text)
     */
    extractFromContent(content: string, contentType: 'url' | 'text' | 'markdown'): Promise<ExtractionResult>;
    /**
     * Merge extraction results
     */
    mergeResults(...results: ExtractionResult[]): ExtractionResult;
}
export declare function createExtractor(): Extractor;
//# sourceMappingURL=extractor.d.ts.map