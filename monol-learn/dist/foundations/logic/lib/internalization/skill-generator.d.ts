/**
 * Skill Generator
 * Generates Claude Code skill definitions from learned skills
 */
import type { Skill } from '../types.js';
import type { ExtractedSkill } from '../discovery/extractor.js';
export interface SkillDefinition {
    name: string;
    description: string;
    trigger: SkillTrigger;
    instructions: string;
    tools: string[];
    examples?: string[];
    constraints?: string[];
    metadata: {
        source: string;
        confidence: number;
        version: string;
    };
}
export interface SkillTrigger {
    type: 'always' | 'glob' | 'regex' | 'keyword';
    pattern?: string;
    keywords?: string[];
}
export interface GeneratorOptions {
    defaultTools?: string[];
    includeExamples?: boolean;
    maxInstructionLength?: number;
}
/**
 * Skill Generator class
 */
export declare class SkillGenerator {
    private options;
    constructor(options?: GeneratorOptions);
    /**
     * Generate a skill definition from a Skill entity
     */
    fromSkill(skill: Skill): SkillDefinition;
    /**
     * Generate a skill definition from extracted skill
     */
    fromExtracted(extracted: ExtractedSkill): SkillDefinition;
    /**
     * Generate markdown skill file content
     */
    toMarkdown(skill: SkillDefinition): string;
    /**
     * Generate multiple skills
     */
    generateAll(skills: Skill[]): SkillDefinition[];
    /**
     * Validate a skill definition
     */
    validate(skill: SkillDefinition): {
        valid: boolean;
        errors: string[];
    };
    private formatSkillName;
    private inferTrigger;
    private inferTriggerFromType;
    private generateInstructions;
    private generateGenericInstructions;
    private inferTools;
    private generateConstraints;
}
export declare function createSkillGenerator(options?: GeneratorOptions): SkillGenerator;
//# sourceMappingURL=skill-generator.d.ts.map