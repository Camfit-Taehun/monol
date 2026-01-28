/**
 * Lesson Creator
 * Creates lesson points from skills, trials, and patterns
 */

import type { Skill, EvolutionTrial, LessonPoint } from '../types.js';
import type { ExtractedLesson } from '../discovery/extractor.js';

export interface LessonCreationInput {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  sourceSkillId?: string;
  sourceTrialId?: string;
}

export interface LessonTemplate {
  id: string;
  name: string;
  format: string;
  variables: string[];
}

/**
 * Lesson Creator class
 */
export class LessonCreator {
  private templates: Map<string, LessonTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Create a lesson from input
   */
  create(input: LessonCreationInput): LessonPoint {
    const now = new Date();
    return {
      id: generateLessonId(),
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags ?? [],
      sourceSkillId: input.sourceSkillId,
      sourceTrialId: input.sourceTrialId,
      appliedCount: 0,
      effectivenessScore: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a lesson from a promoted skill
   */
  fromPromotedSkill(skill: Skill): LessonPoint {
    return this.create({
      title: `Effective: ${skill.name}`,
      content: this.formatSkillLesson(skill),
      category: this.inferCategoryFromSkill(skill),
      tags: [...skill.tags, 'skill-based', 'promoted'],
      sourceSkillId: skill.id,
    });
  }

  /**
   * Create a lesson from an archived skill
   */
  fromArchivedSkill(skill: Skill, reason: string): LessonPoint {
    return this.create({
      title: `Avoid: ${skill.name}`,
      content: this.formatArchivedSkillLesson(skill, reason),
      category: this.inferCategoryFromSkill(skill),
      tags: [...skill.tags, 'skill-based', 'archived', 'anti-pattern'],
      sourceSkillId: skill.id,
    });
  }

  /**
   * Create lessons from a completed trial
   */
  fromTrial(trial: EvolutionTrial, baseline: Skill, challenger: Skill): LessonPoint[] {
    const lessons: LessonPoint[] = [];

    // Lesson about the comparison
    lessons.push(
      this.create({
        title: `Trial: ${baseline.name} vs ${challenger.name}`,
        content: this.formatTrialLesson(trial, baseline, challenger),
        category: 'evolution',
        tags: ['trial-based', 'comparison'],
        sourceTrialId: trial.id,
      })
    );

    // Lesson about what worked better
    if (trial.recommendation === 'promote') {
      lessons.push(
        this.create({
          title: `Preference: ${challenger.name} over ${baseline.name}`,
          content: this.formatPreferenceLesson(trial, challenger, baseline),
          category: 'preferences',
          tags: ['trial-based', 'preference'],
          sourceTrialId: trial.id,
        })
      );
    }

    return lessons;
  }

  /**
   * Create a lesson from extracted lesson
   */
  fromExtracted(extracted: ExtractedLesson): LessonPoint {
    return this.create({
      title: extracted.title,
      content: extracted.content,
      category: extracted.category,
      tags: extracted.applicability,
    });
  }

  /**
   * Use a template to create a lesson
   */
  fromTemplate(
    templateId: string,
    variables: Record<string, string>
  ): LessonPoint | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    let content = template.format;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }

    return this.create({
      title: variables['title'] ?? template.name,
      content,
      category: variables['category'] ?? 'general',
      tags: ['from-template', templateId],
    });
  }

  /**
   * Update lesson effectiveness based on usage
   */
  recordUsage(
    lesson: LessonPoint,
    wasEffective: boolean
  ): LessonPoint {
    lesson.appliedCount++;

    // Exponential moving average for effectiveness
    const alpha = 0.3;
    const effectiveValue = wasEffective ? 100 : 0;
    lesson.effectivenessScore =
      alpha * effectiveValue + (1 - alpha) * lesson.effectivenessScore;

    lesson.updatedAt = new Date();

    return lesson;
  }

  /**
   * Get available templates
   */
  getTemplates(): LessonTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add a custom template
   */
  addTemplate(template: LessonTemplate): void {
    this.templates.set(template.id, template);
  }

  private initializeTemplates(): void {
    // Built-in templates
    this.templates.set('skill-promoted', {
      id: 'skill-promoted',
      name: 'Skill Promoted',
      format: `## {{skill_name}}

**Status**: Promoted to active

**Why it works**: {{reason}}

**When to use**: {{when_to_use}}

**Key points**:
{{key_points}}`,
      variables: ['skill_name', 'reason', 'when_to_use', 'key_points'],
    });

    this.templates.set('trial-completed', {
      id: 'trial-completed',
      name: 'Trial Completed',
      format: `## A/B Trial: {{baseline}} vs {{challenger}}

**Winner**: {{winner}}
**Margin**: {{margin}}

**Key Differences**:
{{differences}}

**Recommendation**: {{recommendation}}`,
      variables: [
        'baseline',
        'challenger',
        'winner',
        'margin',
        'differences',
        'recommendation',
      ],
    });

    this.templates.set('pattern-discovered', {
      id: 'pattern-discovered',
      name: 'Pattern Discovered',
      format: `## Pattern: {{pattern_name}}

**Context**: {{context}}

**Description**: {{description}}

**Example**:
\`\`\`
{{example}}
\`\`\`

**Anti-pattern** (avoid):
\`\`\`
{{anti_pattern}}
\`\`\``,
      variables: [
        'pattern_name',
        'context',
        'description',
        'example',
        'anti_pattern',
      ],
    });
  }

  private formatSkillLesson(skill: Skill): string {
    return `## ${skill.name}

**Type**: ${skill.type}
**Score**: ${skill.compositeScore.toFixed(1)}/100
**Confidence**: ${(skill.confidence * 100).toFixed(0)}%

### Description
${skill.description}

### Performance
- Quality: ${skill.qualityScore.toFixed(1)}
- Speed: ${skill.speedScore.toFixed(1)}
- User Satisfaction: ${skill.userSatisfaction.toFixed(1)}

### Usage
This skill has been promoted to active status after ${skill.trialsCount} trials with a ${((skill.successCount / Math.max(1, skill.trialsCount)) * 100).toFixed(0)}% success rate.

Apply this skill when working on related tasks.`;
  }

  private formatArchivedSkillLesson(skill: Skill, reason: string): string {
    return `## ${skill.name} (Archived)

**Reason for archival**: ${reason}

### What didn't work
${skill.description}

### Performance issues
- Quality: ${skill.qualityScore.toFixed(1)}
- Speed: ${skill.speedScore.toFixed(1)}
- Success rate: ${((skill.successCount / Math.max(1, skill.trialsCount)) * 100).toFixed(0)}%

### Alternative
Consider alternative approaches that have shown better results.`;
  }

  private formatTrialLesson(
    trial: EvolutionTrial,
    baseline: Skill,
    challenger: Skill
  ): string {
    const total = trial.baselineWins + trial.challengerWins + trial.ties;
    const baselineRate = ((trial.baselineWins / total) * 100).toFixed(0);
    const challengerRate = ((trial.challengerWins / total) * 100).toFixed(0);

    return `## Trial: ${baseline.name} vs ${challenger.name}

**Total rounds**: ${total}
**Baseline wins**: ${trial.baselineWins} (${baselineRate}%)
**Challenger wins**: ${trial.challengerWins} (${challengerRate}%)
**Ties**: ${trial.ties}

### Recommendation
${trial.recommendation.charAt(0).toUpperCase() + trial.recommendation.slice(1)} the challenger with ${(trial.recommendationConfidence * 100).toFixed(0)}% confidence.

### Analysis
${challenger.name} ${trial.challengerWins > trial.baselineWins ? 'outperformed' : 'underperformed compared to'} ${baseline.name} in this trial.`;
  }

  private formatPreferenceLesson(
    trial: EvolutionTrial,
    preferred: Skill,
    alternative: Skill
  ): string {
    return `## Preference: ${preferred.name}

When choosing between **${preferred.name}** and **${alternative.name}**, prefer **${preferred.name}**.

### Why
Based on ${trial.currentTrials} trials, ${preferred.name} demonstrated:
- Higher quality scores
- Better user satisfaction
- More consistent results

### When to reconsider
- If the context significantly changes
- If ${alternative.name} receives improvements
- If new alternatives become available`;
  }

  private inferCategoryFromSkill(skill: Skill): string {
    switch (skill.type) {
      case 'pattern':
        return 'patterns';
      case 'technique':
        return 'techniques';
      case 'tool':
        return 'tools';
      case 'rule':
        return 'rules';
      default:
        return 'general';
    }
  }
}

function generateLessonId(): string {
  return `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createLessonCreator(): LessonCreator {
  return new LessonCreator();
}
