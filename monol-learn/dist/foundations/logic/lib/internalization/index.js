/**
 * Internalization Module
 * Orchestrates conversion of learned knowledge into rules, skills, and lessons
 */
export { RuleConverter, createRuleConverter, } from './rule-converter.js';
export { SkillGenerator, createSkillGenerator, } from './skill-generator.js';
export { LessonCreator, createLessonCreator, } from './lesson-creator.js';
import { createRuleConverter } from './rule-converter.js';
import { createSkillGenerator } from './skill-generator.js';
import { createLessonCreator } from './lesson-creator.js';
/**
 * Internalization orchestrator
 */
export class Internalization {
    ruleConverter;
    skillGenerator;
    lessonCreator;
    options;
    constructor(options = {}) {
        this.options = options;
        this.ruleConverter = createRuleConverter();
        this.skillGenerator = createSkillGenerator();
        this.lessonCreator = createLessonCreator();
    }
    /**
     * Internalize a promoted skill
     */
    internalizePromotedSkill(skill) {
        const rules = [this.ruleConverter.fromSkill(skill)];
        const skills = [this.skillGenerator.fromSkill(skill)];
        const lessons = [this.lessonCreator.fromPromotedSkill(skill)];
        return this.createResult(rules, skills, lessons);
    }
    /**
     * Internalize an archived skill
     */
    internalizeArchivedSkill(skill, reason) {
        // Only create lesson for archived skills
        const lessons = [this.lessonCreator.fromArchivedSkill(skill, reason)];
        return this.createResult([], [], lessons);
    }
    /**
     * Internalize a completed trial
     */
    internalizeCompletedTrial(trial, baseline, challenger) {
        const lessons = this.lessonCreator.fromTrial(trial, baseline, challenger);
        return this.createResult([], [], lessons);
    }
    /**
     * Internalize extracted knowledge
     */
    internalizeExtraction(extraction) {
        const rules = extraction.patterns.map((p) => this.ruleConverter.fromPattern(p));
        const skills = extraction.skills.map((s) => this.skillGenerator.fromExtracted(s));
        const lessons = extraction.lessons.map((l) => this.lessonCreator.fromExtracted(l));
        return this.createResult(rules, skills, lessons);
    }
    /**
     * Bulk internalize multiple skills
     */
    internalizeSkills(skills, options = {}) {
        const { includeRules = true, includeSkills = true, includeLessons = true } = options;
        const rules = includeRules
            ? skills.map((s) => this.ruleConverter.fromSkill(s))
            : [];
        const skillDefs = includeSkills
            ? skills.map((s) => this.skillGenerator.fromSkill(s))
            : [];
        const lessons = includeLessons
            ? skills.map((s) => this.lessonCreator.fromPromotedSkill(s))
            : [];
        return this.createResult(rules, skillDefs, lessons);
    }
    /**
     * Generate files for internalized knowledge
     */
    generateFiles(result) {
        const files = new Map();
        // Generate rule YAML files
        for (const rule of result.rules) {
            const filename = `rules/learned/${this.slugify(rule.name)}.yaml`;
            files.set(filename, this.ruleConverter.toYaml(rule));
        }
        // Generate skill markdown files
        for (const skill of result.skills) {
            const filename = `skills/learned/${this.slugify(skill.name)}.md`;
            files.set(filename, this.skillGenerator.toMarkdown(skill));
        }
        // Generate lessons (could be markdown or structured data)
        for (const lesson of result.lessons) {
            const filename = `lessons/${this.slugify(lesson.title)}.md`;
            files.set(filename, this.formatLessonAsMarkdown(lesson));
        }
        return files;
    }
    createResult(rules, skills, lessons) {
        return {
            rules,
            skills,
            lessons,
            summary: {
                rulesCreated: rules.length,
                skillsGenerated: skills.length,
                lessonsCreated: lessons.length,
                timestamp: new Date(),
            },
        };
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    formatLessonAsMarkdown(lesson) {
        const parts = [];
        parts.push('---');
        parts.push(`category: ${lesson.category}`);
        parts.push(`tags: [${lesson.tags.join(', ')}]`);
        parts.push(`effectiveness: ${lesson.effectivenessScore.toFixed(1)}`);
        parts.push(`applied_count: ${lesson.appliedCount}`);
        parts.push('---');
        parts.push('');
        parts.push(`# ${lesson.title}`);
        parts.push('');
        parts.push(lesson.content);
        return parts.join('\n');
    }
}
export function createInternalization(options) {
    return new Internalization(options);
}
//# sourceMappingURL=index.js.map