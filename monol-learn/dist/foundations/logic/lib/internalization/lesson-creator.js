/**
 * Lesson Creator
 * Creates lesson points from skills, trials, and patterns
 */
/**
 * Lesson Creator class
 */
export class LessonCreator {
    templates = new Map();
    constructor() {
        this.initializeTemplates();
    }
    /**
     * Create a lesson from input
     */
    create(input) {
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
    fromPromotedSkill(skill) {
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
    fromArchivedSkill(skill, reason) {
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
    fromTrial(trial, baseline, challenger) {
        const lessons = [];
        // Lesson about the comparison
        lessons.push(this.create({
            title: `Trial: ${baseline.name} vs ${challenger.name}`,
            content: this.formatTrialLesson(trial, baseline, challenger),
            category: 'evolution',
            tags: ['trial-based', 'comparison'],
            sourceTrialId: trial.id,
        }));
        // Lesson about what worked better
        if (trial.recommendation === 'promote') {
            lessons.push(this.create({
                title: `Preference: ${challenger.name} over ${baseline.name}`,
                content: this.formatPreferenceLesson(trial, challenger, baseline),
                category: 'preferences',
                tags: ['trial-based', 'preference'],
                sourceTrialId: trial.id,
            }));
        }
        return lessons;
    }
    /**
     * Create a lesson from extracted lesson
     */
    fromExtracted(extracted) {
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
    fromTemplate(templateId, variables) {
        const template = this.templates.get(templateId);
        if (!template)
            return null;
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
    recordUsage(lesson, wasEffective) {
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
    getTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Add a custom template
     */
    addTemplate(template) {
        this.templates.set(template.id, template);
    }
    initializeTemplates() {
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
    formatSkillLesson(skill) {
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
    formatArchivedSkillLesson(skill, reason) {
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
    formatTrialLesson(trial, baseline, challenger) {
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
    formatPreferenceLesson(trial, preferred, alternative) {
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
    inferCategoryFromSkill(skill) {
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
function generateLessonId() {
    return `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
export function createLessonCreator() {
    return new LessonCreator();
}
//# sourceMappingURL=lesson-creator.js.map