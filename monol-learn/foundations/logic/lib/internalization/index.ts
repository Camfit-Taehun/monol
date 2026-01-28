/**
 * Internalization Module
 * Orchestrates conversion of learned knowledge into rules, skills, and lessons
 */

export {
  RuleConverter,
  createRuleConverter,
  type RuleDefinition,
  type ConversionOptions,
} from './rule-converter.js';

export {
  SkillGenerator,
  createSkillGenerator,
  type SkillDefinition,
  type SkillTrigger,
  type GeneratorOptions,
} from './skill-generator.js';

export {
  LessonCreator,
  createLessonCreator,
  type LessonCreationInput,
  type LessonTemplate,
} from './lesson-creator.js';

import { RuleConverter, createRuleConverter, type RuleDefinition } from './rule-converter.js';
import { SkillGenerator, createSkillGenerator, type SkillDefinition } from './skill-generator.js';
import { LessonCreator, createLessonCreator } from './lesson-creator.js';
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
export class Internalization {
  readonly ruleConverter: RuleConverter;
  readonly skillGenerator: SkillGenerator;
  readonly lessonCreator: LessonCreator;

  private options: InternalizationOptions;

  constructor(options: InternalizationOptions = {}) {
    this.options = options;
    this.ruleConverter = createRuleConverter();
    this.skillGenerator = createSkillGenerator();
    this.lessonCreator = createLessonCreator();
  }

  /**
   * Internalize a promoted skill
   */
  internalizePromotedSkill(skill: Skill): InternalizationResult {
    const rules = [this.ruleConverter.fromSkill(skill)];
    const skills = [this.skillGenerator.fromSkill(skill)];
    const lessons = [this.lessonCreator.fromPromotedSkill(skill)];

    return this.createResult(rules, skills, lessons);
  }

  /**
   * Internalize an archived skill
   */
  internalizeArchivedSkill(skill: Skill, reason: string): InternalizationResult {
    // Only create lesson for archived skills
    const lessons = [this.lessonCreator.fromArchivedSkill(skill, reason)];

    return this.createResult([], [], lessons);
  }

  /**
   * Internalize a completed trial
   */
  internalizeCompletedTrial(
    trial: EvolutionTrial,
    baseline: Skill,
    challenger: Skill
  ): InternalizationResult {
    const lessons = this.lessonCreator.fromTrial(trial, baseline, challenger);

    return this.createResult([], [], lessons);
  }

  /**
   * Internalize extracted knowledge
   */
  internalizeExtraction(extraction: ExtractionResult): InternalizationResult {
    const rules = extraction.patterns.map((p) =>
      this.ruleConverter.fromPattern(p)
    );

    const skills = extraction.skills.map((s) =>
      this.skillGenerator.fromExtracted(s)
    );

    const lessons = extraction.lessons.map((l) =>
      this.lessonCreator.fromExtracted(l)
    );

    return this.createResult(rules, skills, lessons);
  }

  /**
   * Bulk internalize multiple skills
   */
  internalizeSkills(
    skills: Skill[],
    options: { includeRules?: boolean; includeSkills?: boolean; includeLessons?: boolean } = {}
  ): InternalizationResult {
    const { includeRules = true, includeSkills = true, includeLessons = true } = options;

    const rules: RuleDefinition[] = includeRules
      ? skills.map((s) => this.ruleConverter.fromSkill(s))
      : [];

    const skillDefs: SkillDefinition[] = includeSkills
      ? skills.map((s) => this.skillGenerator.fromSkill(s))
      : [];

    const lessons: LessonPoint[] = includeLessons
      ? skills.map((s) => this.lessonCreator.fromPromotedSkill(s))
      : [];

    return this.createResult(rules, skillDefs, lessons);
  }

  /**
   * Generate files for internalized knowledge
   */
  generateFiles(result: InternalizationResult): Map<string, string> {
    const files = new Map<string, string>();

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

  private createResult(
    rules: RuleDefinition[],
    skills: SkillDefinition[],
    lessons: LessonPoint[]
  ): InternalizationResult {
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

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatLessonAsMarkdown(lesson: LessonPoint): string {
    const parts: string[] = [];

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

export function createInternalization(
  options?: InternalizationOptions
): Internalization {
  return new Internalization(options);
}
