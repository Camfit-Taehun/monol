/**
 * monol-learn Type Definitions
 * Self-learning infrastructure types
 */
export type SkillType = 'pattern' | 'technique' | 'tool' | 'rule';
export type SkillStatus = 'candidate' | 'trial' | 'active' | 'archived';
export interface Skill {
    id: string;
    name: string;
    type: SkillType;
    description: string;
    sourceUrl?: string;
    sourceType: 'plugin' | 'blog' | 'docs' | 'manual' | 'derived';
    compositeScore: number;
    qualityScore: number;
    speedScore: number;
    userSatisfaction: number;
    confidence: number;
    trialsCount: number;
    successCount: number;
    failureCount: number;
    status: SkillStatus;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    promotedAt?: Date;
    archivedAt?: Date;
    parentSkillId?: string;
    replacedBySkillId?: string;
}
export type TrialStatus = 'pending' | 'running' | 'completed' | 'cancelled';
export type TrialRecommendation = 'promote' | 'demote' | 'continue' | 'archive' | 'undecided';
export interface EvolutionTrial {
    id: string;
    baselineId: string;
    challengerId: string;
    status: TrialStatus;
    minTrials: number;
    currentTrials: number;
    baselineWins: number;
    challengerWins: number;
    ties: number;
    baselineScores: TrialScore[];
    challengerScores: TrialScore[];
    recommendation: TrialRecommendation;
    recommendationConfidence: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
export interface TrialScore {
    trialNumber: number;
    timestamp: Date;
    quality: number;
    speed: number;
    userFeedback?: number;
    context: string;
}
export type TrendCategory = 'design' | 'tech' | 'style' | 'workflow' | 'tooling';
export interface TrendSnapshot {
    id: string;
    category: TrendCategory;
    period: string;
    trends: TrendItem[];
    analysis: string;
    relevanceScore: number;
    actionsTaken: string[];
    createdAt: Date;
}
export interface TrendItem {
    name: string;
    description: string;
    momentum: 'rising' | 'stable' | 'declining';
    relevance: number;
    sources: string[];
}
export interface DiscoverySource {
    type: 'plugin-marketplace' | 'github' | 'blog' | 'docs' | 'rss';
    url: string;
    lastScanned?: Date;
    scanFrequency: 'hourly' | 'daily' | 'weekly';
}
export interface DiscoveryResult {
    source: DiscoverySource;
    timestamp: Date;
    candidates: SkillCandidate[];
    trends: TrendItem[];
}
export interface SkillCandidate {
    name: string;
    type: SkillType;
    description: string;
    sourceUrl: string;
    relevanceScore: number;
    noveltyScore: number;
    suggestedAction: 'evaluate' | 'monitor' | 'ignore';
}
export interface LessonPoint {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    sourceSkillId?: string;
    sourceTrialId?: string;
    appliedCount: number;
    effectivenessScore: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface LearningSession {
    id: string;
    startedAt: Date;
    endedAt?: Date;
    skillsUsed: string[];
    trialsRun: string[];
    lessonsGenerated: string[];
    metrics: SessionMetrics;
}
export interface SessionMetrics {
    totalActions: number;
    successfulActions: number;
    errorCount: number;
    userFeedbackScore?: number;
    skillPerformance: Map<string, SkillPerformance>;
}
export interface SkillPerformance {
    skillId: string;
    usageCount: number;
    successRate: number;
    avgDuration: number;
}
export interface LearnConfig {
    discoverySources: DiscoverySource[];
    scanSchedule: {
        dailyScan: string;
        weeklyReview: string;
    };
    minTrialsForPromotion: number;
    promotionThreshold: number;
    demotionThreshold: number;
    datastorePath?: string;
    rulebookPath?: string;
    pluginScoutEndpoint?: string;
    enableAutoDiscovery: boolean;
    enableAutoPromotion: boolean;
    enableTrendAbsorption: boolean;
}
export declare const DEFAULT_CONFIG: LearnConfig;
export type LearnEventType = 'skill:discovered' | 'skill:promoted' | 'skill:demoted' | 'skill:archived' | 'trial:started' | 'trial:completed' | 'lesson:created' | 'trend:detected' | 'scan:completed';
export interface LearnEvent {
    type: LearnEventType;
    timestamp: Date;
    data: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map