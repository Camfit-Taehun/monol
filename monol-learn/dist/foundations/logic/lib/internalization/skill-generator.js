/**
 * Skill Generator
 * Generates Claude Code skill definitions from learned skills
 */
const DEFAULT_OPTIONS = {
    defaultTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep'],
    includeExamples: true,
    maxInstructionLength: 2000,
};
/**
 * Skill Generator class
 */
export class SkillGenerator {
    options;
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }
    /**
     * Generate a skill definition from a Skill entity
     */
    fromSkill(skill) {
        return {
            name: this.formatSkillName(skill.name),
            description: skill.description,
            trigger: this.inferTrigger(skill),
            instructions: this.generateInstructions(skill),
            tools: this.inferTools(skill),
            examples: [],
            constraints: this.generateConstraints(skill),
            metadata: {
                source: `skill:${skill.id}`,
                confidence: skill.confidence,
                version: '1.0.0',
            },
        };
    }
    /**
     * Generate a skill definition from extracted skill
     */
    fromExtracted(extracted) {
        return {
            name: this.formatSkillName(extracted.name),
            description: extracted.description,
            trigger: this.inferTriggerFromType(extracted.type),
            instructions: extracted.implementation || this.generateGenericInstructions(extracted),
            tools: this.options.defaultTools ?? [],
            examples: [],
            constraints: [],
            metadata: {
                source: 'extracted',
                confidence: 0.5,
                version: '1.0.0',
            },
        };
    }
    /**
     * Generate markdown skill file content
     */
    toMarkdown(skill) {
        const parts = [];
        // Frontmatter
        parts.push('---');
        parts.push(`description: "${skill.description}"`);
        if (skill.trigger.type === 'glob') {
            parts.push(`trigger: ${skill.trigger.pattern}`);
        }
        else if (skill.trigger.type === 'keyword') {
            parts.push(`keywords: [${skill.trigger.keywords?.map(k => `"${k}"`).join(', ')}]`);
        }
        if (skill.tools.length > 0) {
            parts.push(`allowed-tools: [${skill.tools.join(', ')}]`);
        }
        parts.push('---');
        parts.push('');
        // Title
        parts.push(`# ${skill.name}`);
        parts.push('');
        // Description
        parts.push(skill.description);
        parts.push('');
        // Instructions
        parts.push('## Instructions');
        parts.push('');
        parts.push(skill.instructions);
        parts.push('');
        // Examples
        if (skill.examples && skill.examples.length > 0) {
            parts.push('## Examples');
            parts.push('');
            for (const example of skill.examples) {
                parts.push('```');
                parts.push(example);
                parts.push('```');
                parts.push('');
            }
        }
        // Constraints
        if (skill.constraints && skill.constraints.length > 0) {
            parts.push('## Constraints');
            parts.push('');
            for (const constraint of skill.constraints) {
                parts.push(`- ${constraint}`);
            }
            parts.push('');
        }
        // Metadata
        parts.push('---');
        parts.push(`Source: ${skill.metadata.source}`);
        parts.push(`Confidence: ${(skill.metadata.confidence * 100).toFixed(0)}%`);
        parts.push(`Version: ${skill.metadata.version}`);
        return parts.join('\n');
    }
    /**
     * Generate multiple skills
     */
    generateAll(skills) {
        return skills.map((s) => this.fromSkill(s));
    }
    /**
     * Validate a skill definition
     */
    validate(skill) {
        const errors = [];
        if (!skill.name || skill.name.length === 0) {
            errors.push('Skill name is required');
        }
        if (!skill.description || skill.description.length === 0) {
            errors.push('Skill description is required');
        }
        if (!skill.instructions || skill.instructions.length === 0) {
            errors.push('Skill instructions are required');
        }
        if (skill.instructions.length > (this.options.maxInstructionLength ?? 2000)) {
            errors.push('Skill instructions exceed maximum length');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    formatSkillName(name) {
        return name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
    }
    inferTrigger(skill) {
        // Infer trigger based on skill type and tags
        switch (skill.type) {
            case 'pattern':
                return { type: 'always' };
            case 'technique':
                return {
                    type: 'keyword',
                    keywords: skill.tags.slice(0, 5),
                };
            case 'tool':
                return { type: 'always' };
            case 'rule':
                return {
                    type: 'glob',
                    pattern: '**/*',
                };
            default:
                return { type: 'always' };
        }
    }
    inferTriggerFromType(type) {
        switch (type) {
            case 'pattern':
            case 'tool':
                return { type: 'always' };
            case 'technique':
                return { type: 'keyword', keywords: [] };
            default:
                return { type: 'always' };
        }
    }
    generateInstructions(skill) {
        const parts = [];
        parts.push(`When applying "${skill.name}":`);
        parts.push('');
        parts.push(`1. ${skill.description}`);
        parts.push('');
        parts.push('2. Apply this skill when the context is appropriate');
        parts.push('');
        parts.push('3. Validate the results and iterate if needed');
        return parts.join('\n');
    }
    generateGenericInstructions(extracted) {
        const parts = [];
        parts.push(`Apply the "${extracted.name}" skill:`);
        parts.push('');
        parts.push(extracted.description);
        if (extracted.prerequisites.length > 0) {
            parts.push('');
            parts.push('Prerequisites:');
            for (const prereq of extracted.prerequisites) {
                parts.push(`- ${prereq}`);
            }
        }
        return parts.join('\n');
    }
    inferTools(skill) {
        const tools = new Set(this.options.defaultTools);
        // Add tools based on skill type
        switch (skill.type) {
            case 'pattern':
                tools.add('Grep');
                tools.add('Glob');
                break;
            case 'technique':
                tools.add('Edit');
                break;
            case 'tool':
                tools.add('Bash');
                break;
        }
        return Array.from(tools);
    }
    generateConstraints(skill) {
        const constraints = [];
        if (skill.confidence < 0.7) {
            constraints.push('Apply with caution - confidence is below threshold');
        }
        if (skill.status === 'trial') {
            constraints.push('This skill is in trial mode - results are being evaluated');
        }
        return constraints;
    }
}
export function createSkillGenerator(options) {
    return new SkillGenerator(options);
}
//# sourceMappingURL=skill-generator.js.map