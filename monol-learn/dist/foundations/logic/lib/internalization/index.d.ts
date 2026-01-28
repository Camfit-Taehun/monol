/**
 * Internalization Module
 * Orchestrates conversion of learned knowledge into rules, skills, and lessons
 */
export { RuleConverter, createRuleConverter, type RuleDefinition, type ConversionOptions, } from './rule-converter.js';
export { SkillGenerator, createSkillGenerator, type SkillDefinition, type SkillTrigger, type GeneratorOptions, } from './skill-generator.js';
export { LessonCreator, createLessonCreator, type LessonCreationInput, type LessonTemplate, } from './lesson-creator.js';
import { RuleConverter, type RuleDefinition } from './rule-converter.js';
import { SkillGenerator, type SkillDefinition } from './skill-generator.js';
import { LessonCreator } from './lesson-creator.js';
import type { Skill, EvolutionTrial, LessonPoint } from '../types.js';
import type { ExtractionResult } from '../discovery/extractor.js';
export interface InternalizationOptions {
    rulebookPath?: string;
    skillsPath?: string;
    lessonsPath?: string;
    autoSave?: boolean;
}
export interface InternalizationResult {
    rules: RuleDefinition[];
    skills: SkillDefinition[];
    lessons: LessonPoint[];
    summary: InternalizationSummary;
}
export interface InternalizationSummary {
    rulesCreated: number;
    skillsGenerated: number;
    lessonsCreated: number;
    timestamp: Date;
}
/**
 * Internalization orchestrator
 */
export declare class Internalization {
    readonly ruleConverter: RuleConverter;
    readonly skillGenerator: SkillGenerator;
    readonly lessonCreator: LessonCreator;
    private options;
    constructor(options?: InternalizationOptions);
    /**
     * Internalize a promoted skill
     */
    internalizePromotedSkill(skill: Skill): InternalizationResult;
    /**
     * Internalize an archived skill
     */
    internalizeArchivedSkill(skill: Skill, reason: string): InternalizationResult;
    /**
     * Internalize a completed trial
     */
    internalizeCompletedTrial(trial: EvolutionTrial, baseline: Skill, challenger: Skill): InternalizationResult;
    /**
     * Internalize extracted knowledge
     */
    internalizeExtraction(extraction: ExtractionResult): InternalizationResult;
    /**
     * Bulk internalize multiple skills
     */
    internalizeSkills(skills: Skill[], options?: {
        includeRules?: boolean;
        includeSkills?: boolean;
        includeLessons?: boolean;
    }): InternalizationResult;
    /**
     * Generate files for internalized knowledge
     */
    generateFiles(result: InternalizationResult): Map<string, string>;
    private createResult;
    private slugify;
    private formatLessonAsMarkdown;
}
export declare function createInternalization(options?: InternalizationOptions): Internalization;
//# sourceMappingURL=index.d.ts.map