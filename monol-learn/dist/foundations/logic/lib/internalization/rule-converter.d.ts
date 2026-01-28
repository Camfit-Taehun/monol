/**
 * Rule Converter
 * Converts skills and patterns into rulebook rules
 */
import type { Skill, LessonPoint } from '../types.js';
import type { ExtractedPattern } from '../discovery/extractor.js';
export interface RuleDefinition {
    id: string;
    name: string;
    category: string;
    severity: 'error' | 'warning' | 'info';
    description: string;
    tags: string[];
    examples: {
        good?: string[];
        bad?: string[];
    };
    enforcement?: {
        automated: boolean;
        pattern?: string;
    };
    source: {
        type: 'skill' | 'lesson' | 'pattern' | 'manual';
        id?: string;
    };
    metadata: Record<string, unknown>;
}
export interface ConversionOptions {
    defaultSeverity?: 'error' | 'warning' | 'info';
    defaultCategory?: string;
    includeExamples?: boolean;
    generateEnforcement?: boolean;
}
/**
 * Rule Converter class
 */
export declare class RuleConverter {
    private options;
    constructor(options?: ConversionOptions);
    /**
     * Convert a skill to a rule
     */
    fromSkill(skill: Skill): RuleDefinition;
    /**
     * Convert a lesson point to a rule
     */
    fromLesson(lesson: LessonPoint): RuleDefinition;
    /**
     * Convert a pattern to a rule
     */
    fromPattern(pattern: ExtractedPattern): RuleDefinition;
    /**
     * Convert multiple items to rules
     */
    convertAll(items: {
        skills?: Skill[];
        lessons?: LessonPoint[];
        patterns?: ExtractedPattern[];
    }): RuleDefinition[];
    /**
     * Generate YAML for a rule (for rulebook integration)
     */
    toYaml(rule: RuleDefinition): string;
    /**
     * Validate a rule definition
     */
    validate(rule: RuleDefinition): {
        valid: boolean;
        errors: string[];
    };
    private inferCategory;
    private inferCategoryFromContext;
    private inferSeverity;
    private formatRuleName;
    private slugify;
    private generateEnforcement;
}
export declare function createRuleConverter(options?: ConversionOptions): RuleConverter;
//# sourceMappingURL=rule-converter.d.ts.map