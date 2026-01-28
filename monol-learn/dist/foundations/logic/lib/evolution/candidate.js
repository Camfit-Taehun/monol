/**
 * Candidate Manager
 * Manages skill candidates for evolution trials
 */
/**
 * Create a new skill from candidate
 */
export function createSkillFromCandidate(candidate, sourceType = 'derived') {
    const now = new Date();
    return {
        id: generateSkillId(),
        name: candidate.name,
        type: candidate.type,
        description: candidate.description,
        sourceUrl: candidate.sourceUrl,
        sourceType,
        compositeScore: 0,
        qualityScore: 0,
        speedScore: 0,
        userSatisfaction: 0,
        confidence: 0,
        trialsCount: 0,
        successCount: 0,
        failureCount: 0,
        status: 'candidate',
        tags: [],
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Create a new skill from input
 */
export function createSkill(input) {
    const now = new Date();
    return {
        id: generateSkillId(),
        name: input.name,
        type: input.type,
        description: input.description,
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType,
        compositeScore: 0,
        qualityScore: 0,
        speedScore: 0,
        userSatisfaction: 0,
        confidence: 0,
        trialsCount: 0,
        successCount: 0,
        failureCount: 0,
        status: 'candidate',
        tags: input.tags ?? [],
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Candidate Manager class
 */
export class CandidateManager {
    skills = new Map();
    /**
     * Add a new skill candidate
     */
    add(skill) {
        this.skills.set(skill.id, { ...skill, status: 'candidate' });
    }
    /**
     * Get a skill by ID
     */
    get(id) {
        return this.skills.get(id);
    }
    /**
     * Get all skills
     */
    getAll() {
        return Array.from(this.skills.values());
    }
    /**
     * Get skills by status
     */
    getByStatus(status) {
        return this.getAll().filter((s) => s.status === status);
    }
    /**
     * Get candidates ready for trial
     */
    getCandidatesForTrial() {
        return this.getByStatus('candidate');
    }
    /**
     * Get active skills
     */
    getActiveSkills() {
        return this.getByStatus('active');
    }
    /**
     * Update a skill
     */
    update(id, updates) {
        const skill = this.skills.get(id);
        if (!skill)
            return undefined;
        const updated = {
            ...skill,
            ...updates,
            id: skill.id, // Preserve ID
            createdAt: skill.createdAt, // Preserve creation time
            updatedAt: new Date(),
        };
        this.skills.set(id, updated);
        return updated;
    }
    /**
     * Update skill status
     */
    updateStatus(id, status) {
        const skill = this.skills.get(id);
        if (!skill)
            return undefined;
        const now = new Date();
        const updates = { status, updatedAt: now };
        if (status === 'active') {
            updates.promotedAt = now;
        }
        else if (status === 'archived') {
            updates.archivedAt = now;
        }
        return this.update(id, updates);
    }
    /**
     * Remove a skill
     */
    remove(id) {
        return this.skills.delete(id);
    }
    /**
     * Find skill by name
     */
    findByName(name) {
        const lowerName = name.toLowerCase();
        return this.getAll().find((s) => s.name.toLowerCase() === lowerName);
    }
    /**
     * Find similar skills
     */
    findSimilar(skill) {
        const words = new Set(skill.description.toLowerCase().split(/\s+/));
        return this.getAll()
            .filter((s) => s.id !== skill.id)
            .map((s) => {
            const otherWords = new Set(s.description.toLowerCase().split(/\s+/));
            const intersection = [...words].filter((w) => otherWords.has(w));
            const similarity = intersection.length / Math.max(words.size, 1);
            return { skill: s, similarity };
        })
            .filter(({ similarity }) => similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .map(({ skill }) => skill);
    }
    /**
     * Load skills from storage
     */
    load(skills) {
        for (const skill of skills) {
            this.skills.set(skill.id, skill);
        }
    }
    /**
     * Export all skills
     */
    export() {
        return this.getAll();
    }
    /**
     * Clear all skills
     */
    clear() {
        this.skills.clear();
    }
}
function generateSkillId() {
    return `skill_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
export function createCandidateManager() {
    return new CandidateManager();
}
//# sourceMappingURL=candidate.js.map