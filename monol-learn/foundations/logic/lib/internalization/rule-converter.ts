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

const DEFAULT_OPTIONS: ConversionOptions = {
  defaultSeverity: 'warning',
  defaultCategory: 'learned',
  includeExamples: true,
  generateEnforcement: false,
};

/**
 * Rule Converter class
 */
export class RuleConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Convert a skill to a rule
   */
  fromSkill(skill: Skill): RuleDefinition {
    const category = this.inferCategory(skill);

    return {
      id: `learned-skill-${skill.id}`,
      name: this.formatRuleName(skill.name),
      category,
      severity: this.inferSeverity(skill),
      description: skill.description,
      tags: [...skill.tags, 'learned', 'from-skill'],
      examples: {
        good: [],
        bad: [],
      },
      enforcement: this.options.generateEnforcement
        ? this.generateEnforcement(skill)
        : undefined,
      source: {
        type: 'skill',
        id: skill.id,
      },
      metadata: {
        skillType: skill.type,
        compositeScore: skill.compositeScore,
        confidence: skill.confidence,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Convert a lesson point to a rule
   */
  fromLesson(lesson: LessonPoint): RuleDefinition {
    return {
      id: `learned-lesson-${lesson.id}`,
      name: this.formatRuleName(lesson.title),
      category: lesson.category,
      severity: this.options.defaultSeverity ?? 'warning',
      description: lesson.content,
      tags: [...lesson.tags, 'learned', 'from-lesson'],
      examples: {
        good: [],
        bad: [],
      },
      source: {
        type: 'lesson',
        id: lesson.id,
      },
      metadata: {
        appliedCount: lesson.appliedCount,
        effectivenessScore: lesson.effectivenessScore,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Convert a pattern to a rule
   */
  fromPattern(pattern: ExtractedPattern): RuleDefinition {
    return {
      id: `learned-pattern-${this.slugify(pattern.name)}`,
      name: this.formatRuleName(pattern.name),
      category: this.inferCategoryFromContext(pattern.context),
      severity: this.options.defaultSeverity ?? 'warning',
      description: pattern.description,
      tags: ['learned', 'from-pattern'],
      examples: {
        good: pattern.example ? [pattern.example] : [],
        bad: pattern.antiPattern ? [pattern.antiPattern] : [],
      },
      source: {
        type: 'pattern',
      },
      metadata: {
        context: pattern.context,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Convert multiple items to rules
   */
  convertAll(items: {
    skills?: Skill[];
    lessons?: LessonPoint[];
    patterns?: ExtractedPattern[];
  }): RuleDefinition[] {
    const rules: RuleDefinition[] = [];

    if (items.skills) {
      rules.push(...items.skills.map((s) => this.fromSkill(s)));
    }
    if (items.lessons) {
      rules.push(...items.lessons.map((l) => this.fromLesson(l)));
    }
    if (items.patterns) {
      rules.push(...items.patterns.map((p) => this.fromPattern(p)));
    }

    return rules;
  }

  /**
   * Generate YAML for a rule (for rulebook integration)
   */
  toYaml(rule: RuleDefinition): string {
    const yaml = [
      `id: ${rule.id}`,
      `name: ${rule.name}`,
      `category: ${rule.category}`,
      `severity: ${rule.severity}`,
      `description: |`,
      ...rule.description.split('\n').map((line) => `  ${line}`),
      `tags:`,
      ...rule.tags.map((t) => `  - ${t}`),
    ];

    if (rule.examples.good?.length || rule.examples.bad?.length) {
      yaml.push(`examples:`);
      if (rule.examples.good?.length) {
        yaml.push(`  good:`);
        for (const ex of rule.examples.good) {
          yaml.push(`    - |`);
          yaml.push(...ex.split('\n').map((line) => `      ${line}`));
        }
      }
      if (rule.examples.bad?.length) {
        yaml.push(`  bad:`);
        for (const ex of rule.examples.bad) {
          yaml.push(`    - |`);
          yaml.push(...ex.split('\n').map((line) => `      ${line}`));
        }
      }
    }

    if (rule.enforcement?.automated) {
      yaml.push(`enforcement:`);
      yaml.push(`  automated: true`);
      if (rule.enforcement.pattern) {
        yaml.push(`  pattern: ${rule.enforcement.pattern}`);
      }
    }

    yaml.push(`source:`);
    yaml.push(`  type: ${rule.source.type}`);
    if (rule.source.id) {
      yaml.push(`  id: ${rule.source.id}`);
    }

    return yaml.join('\n');
  }

  /**
   * Validate a rule definition
   */
  validate(rule: RuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id || rule.id.length === 0) {
      errors.push('Rule ID is required');
    }
    if (!rule.name || rule.name.length === 0) {
      errors.push('Rule name is required');
    }
    if (!rule.description || rule.description.length === 0) {
      errors.push('Rule description is required');
    }
    if (!['error', 'warning', 'info'].includes(rule.severity)) {
      errors.push('Invalid severity level');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private inferCategory(skill: Skill): string {
    switch (skill.type) {
      case 'pattern':
        return 'code/patterns';
      case 'technique':
        return 'workflow/techniques';
      case 'tool':
        return 'tooling';
      case 'rule':
        return 'code/style';
      default:
        return this.options.defaultCategory ?? 'learned';
    }
  }

  private inferCategoryFromContext(context: string): string {
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes('code') || lowerContext.includes('programming')) {
      return 'code/patterns';
    }
    if (lowerContext.includes('test')) {
      return 'code/testing';
    }
    if (lowerContext.includes('git') || lowerContext.includes('version')) {
      return 'workflow/git';
    }
    return this.options.defaultCategory ?? 'learned';
  }

  private inferSeverity(skill: Skill): 'error' | 'warning' | 'info' {
    if (skill.compositeScore >= 80 && skill.confidence >= 0.8) {
      return 'error'; // High confidence, strong rule
    }
    if (skill.compositeScore >= 60) {
      return 'warning'; // Recommended
    }
    return 'info'; // Advisory
  }

  private formatRuleName(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateEnforcement(skill: Skill): { automated: boolean; pattern?: string } | undefined {
    // In real implementation, this would analyze the skill
    // and generate regex patterns or AST matchers
    return {
      automated: false,
    };
  }
}

export function createRuleConverter(options?: ConversionOptions): RuleConverter {
  return new RuleConverter(options);
}
