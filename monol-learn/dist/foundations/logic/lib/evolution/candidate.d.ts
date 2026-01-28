/**
 * Candidate Manager
 * Manages skill candidates for evolution trials
 */
import type { Skill, SkillStatus, SkillType, SkillCandidate } from '../types.js';
export interface CandidateCreationInput {
    name: string;
    type: SkillType;
    description: string;
    sourceUrl?: string;
    sourceType: Skill['sourceType'];
    tags?: string[];
}
/**
 * Create a new skill from candidate
 */
export declare function createSkillFromCandidate(candidate: SkillCandidate, sourceType?: Skill['sourceType']): Skill;
/**
 * Create a new skill from input
 */
export declare function createSkill(input: CandidateCreationInput): Skill;
/**
 * Candidate Manager class
 */
export declare class CandidateManager {
    private skills;
    /**
     * Add a new skill candidate
     */
    add(skill: Skill): void;
    /**
     * Get a skill by ID
     */
    get(id: string): Skill | undefined;
    /**
     * Get all skills
     */
    getAll(): Skill[];
    /**
     * Get skills by status
     */
    getByStatus(status: SkillStatus): Skill[];
    /**
     * Get candidates ready for trial
     */
    getCandidatesForTrial(): Skill[];
    /**
     * Get active skills
     */
    getActiveSkills(): Skill[];
    /**
     * Update a skill
     */
    update(id: string, updates: Partial<Skill>): Skill | undefined;
    /**
     * Update skill status
     */
    updateStatus(id: string, status: SkillStatus): Skill | undefined;
    /**
     * Remove a skill
     */
    remove(id: string): boolean;
    /**
     * Find skill by name
     */
    findByName(name: string): Skill | undefined;
    /**
     * Find similar skills
     */
    findSimilar(skill: Skill): Skill[];
    /**
     * Load skills from storage
     */
    load(skills: Skill[]): void;
    /**
     * Export all skills
     */
    export(): Skill[];
    /**
     * Clear all skills
     */
    clear(): void;
}
export declare function createCandidateManager(): CandidateManager;
//# sourceMappingURL=candidate.d.ts.map