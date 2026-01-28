/**
 * Relevance Analyzer
 * Analyzes relevance of discovered skills to current project/context
 */
export class RelevanceAnalyzer {
    context = {};
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    getContext() {
        return { ...this.context };
    }
    /**
     * Analyze relevance of a skill candidate
     */
    analyze(candidate) {
        const projectMatch = this.calculateProjectMatch(candidate);
        const novelty = this.calculateNovelty(candidate);
        const utility = this.calculateUtility(candidate);
        const quality = this.estimateQuality(candidate);
        // Weighted average
        const overall = projectMatch * 0.35 + novelty * 0.25 + utility * 0.25 + quality * 0.15;
        return {
            overall,
            breakdown: { projectMatch, novelty, utility, quality },
            reasoning: this.generateReasoning(candidate, {
                projectMatch,
                novelty,
                utility,
                quality,
            }),
        };
    }
    /**
     * Batch analyze multiple candidates
     */
    analyzeAll(candidates) {
        const results = new Map();
        for (const candidate of candidates) {
            results.set(candidate.name, this.analyze(candidate));
        }
        return results;
    }
    /**
     * Filter candidates by relevance threshold
     */
    filterByRelevance(candidates, threshold = 50) {
        return candidates.filter((c) => this.analyze(c).overall >= threshold);
    }
    /**
     * Rank candidates by relevance
     */
    rankByRelevance(candidates) {
        return [...candidates].sort((a, b) => this.analyze(b).overall - this.analyze(a).overall);
    }
    calculateProjectMatch(candidate) {
        let score = 50; // Base score
        // Check language/framework match
        if (this.context.languages?.length) {
            const langMatch = this.matchTerms(candidate.description, this.context.languages);
            score += langMatch * 20;
        }
        if (this.context.frameworks?.length) {
            const fwMatch = this.matchTerms(candidate.description, this.context.frameworks);
            score += fwMatch * 15;
        }
        // Check project type match
        if (this.context.projectType) {
            if (candidate.description
                .toLowerCase()
                .includes(this.context.projectType.toLowerCase())) {
                score += 15;
            }
        }
        return Math.min(100, Math.max(0, score));
    }
    calculateNovelty(candidate) {
        if (!this.context.existingSkills?.length) {
            return 70; // Default novelty score
        }
        // Check if similar skill exists
        const existingNames = this.context.existingSkills.map((s) => s.name.toLowerCase());
        if (existingNames.includes(candidate.name.toLowerCase())) {
            return 10; // Low novelty - already exists
        }
        // Check for similar descriptions
        const similarity = this.calculateSimilarity(candidate, this.context.existingSkills);
        return Math.max(0, 100 - similarity);
    }
    calculateUtility(candidate) {
        let score = 50;
        // Utility keywords boost
        const utilityKeywords = [
            'automate',
            'optimize',
            'improve',
            'faster',
            'easier',
            'simplify',
            'reduce',
            'enhance',
        ];
        for (const keyword of utilityKeywords) {
            if (candidate.description.toLowerCase().includes(keyword)) {
                score += 8;
            }
        }
        // Penalize overly general skills
        const vagueKeywords = ['general', 'basic', 'simple', 'intro', 'beginner'];
        for (const keyword of vagueKeywords) {
            if (candidate.name.toLowerCase().includes(keyword)) {
                score -= 10;
            }
        }
        return Math.min(100, Math.max(0, score));
    }
    estimateQuality(candidate) {
        // Initial quality estimate based on source and metadata
        let score = 50;
        // Higher quality for well-documented candidates
        if (candidate.description.length > 100) {
            score += 15;
        }
        // Use relevance score as proxy for quality
        score += candidate.relevanceScore * 0.2;
        return Math.min(100, Math.max(0, score));
    }
    matchTerms(text, terms) {
        const lowerText = text.toLowerCase();
        let matches = 0;
        for (const term of terms) {
            if (lowerText.includes(term.toLowerCase())) {
                matches++;
            }
        }
        return terms.length > 0 ? matches / terms.length : 0;
    }
    calculateSimilarity(candidate, existingSkills) {
        let maxSimilarity = 0;
        const candidateWords = new Set(candidate.description.toLowerCase().split(/\s+/));
        for (const skill of existingSkills) {
            const skillWords = new Set(skill.description.toLowerCase().split(/\s+/));
            const intersection = [...candidateWords].filter((w) => skillWords.has(w));
            const similarity = (intersection.length * 2) / (candidateWords.size + skillWords.size);
            maxSimilarity = Math.max(maxSimilarity, similarity * 100);
        }
        return maxSimilarity;
    }
    generateReasoning(candidate, scores) {
        const parts = [];
        if (scores.projectMatch >= 70) {
            parts.push('Strong project fit');
        }
        else if (scores.projectMatch < 40) {
            parts.push('Limited project relevance');
        }
        if (scores.novelty >= 70) {
            parts.push('Novel skill');
        }
        else if (scores.novelty < 30) {
            parts.push('Similar skill exists');
        }
        if (scores.utility >= 70) {
            parts.push('High utility potential');
        }
        if (scores.quality >= 70) {
            parts.push('Well-documented');
        }
        return parts.length > 0 ? parts.join(', ') : 'Average relevance';
    }
}
export function createRelevanceAnalyzer(context) {
    const analyzer = new RelevanceAnalyzer();
    if (context) {
        analyzer.setContext(context);
    }
    return analyzer;
}
//# sourceMappingURL=relevance.js.map