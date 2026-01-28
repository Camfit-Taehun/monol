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
export declare class LessonCreator {
    private templates;
    constructor();
    /**
     * Create a lesson from input
     */
    create(input: LessonCreationInput): LessonPoint;
    /**
     * Create a lesson from a promoted skill
     */
    fromPromotedSkill(skill: Skill): LessonPoint;
    /**
     * Create a lesson from an archived skill
     */
    fromArchivedSkill(skill: Skill, reason: string): LessonPoint;
    /**
     * Create lessons from a completed trial
     */
    fromTrial(trial: EvolutionTrial, baseline: Skill, challenger: Skill): LessonPoint[];
    /**
     * Create a lesson from extracted lesson
     */
    fromExtracted(extracted: ExtractedLesson): LessonPoint;
    /**
     * Use a template to create a lesson
     */
    fromTemplate(templateId: string, variables: Record<string, string>): LessonPoint | null;
    /**
     * Update lesson effectiveness based on usage
     */
    recordUsage(lesson: LessonPoint, wasEffective: boolean): LessonPoint;
    /**
     * Get available templates
     */
    getTemplates(): LessonTemplate[];
    /**
     * Add a custom template
     */
    addTemplate(template: LessonTemplate): void;
    private initializeTemplates;
    private formatSkillLesson;
    private formatArchivedSkillLesson;
    private formatTrialLesson;
    private formatPreferenceLesson;
    private inferCategoryFromSkill;
}
export declare function createLessonCreator(): LessonCreator;
//# sourceMappingURL=lesson-creator.d.ts.map