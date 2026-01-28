/**
 * monol-learn Type Definitions
 * Self-learning infrastructure types
 */

// ============================================================================
// Skill Types
// ============================================================================

export type SkillType = 'pattern' | 'technique' | 'tool' | 'rule';
export type SkillStatus = 'candidate' | 'trial' | 'active' | 'archived';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  sourceUrl?: string;
  sourceType: 'plugin' | 'blog' | 'docs' | 'manual' | 'derived';

  // Scores (0-100)
  compositeScore: number;
  qualityScore: number;
  speedScore: number;
  userSatisfaction: number;

  // Confidence and trials
  confidence: number; // 0-1
  trialsCount: number;
  successCount: number;
  failureCount: number;

  status: SkillStatus;

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  promotedAt?: Date;
  archivedAt?: Date;

  // Related entities
  parentSkillId?: string;
  replacedBySkillId?: string;
}

// ============================================================================
// Evolution Trial Types
// ============================================================================

export type TrialStatus = 'pending' | 'running' | 'completed' | 'cancelled';
export type TrialRecommendation = 'promote' | 'demote' | 'continue' | 'archive' | 'undecided';

export interface EvolutionTrial {
  id: string;
  baselineId: string;
  challengerId: string;

  status: TrialStatus;
  minTrials: number;
  currentTrials: number;

  // Results
  baselineWins: number;
  challengerWins: number;
  ties: number;

  // Detailed scores
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

// ============================================================================
// Trend Types
// ============================================================================

export type TrendCategory = 'design' | 'tech' | 'style' | 'workflow' | 'tooling';

export interface TrendSnapshot {
  id: string;
  category: TrendCategory;
  period: string; // e.g., "2026-W04"

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
  relevance: number; // 0-100
  sources: string[];
}

// ============================================================================
// Discovery Types
// ============================================================================

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

// ============================================================================
// Lesson Types (Integration with monol-x)
// ============================================================================

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

// ============================================================================
// Learning Session Types
// ============================================================================

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

// ============================================================================
// Configuration Types
// ============================================================================

export interface LearnConfig {
  // Discovery settings
  discoverySources: DiscoverySource[];
  scanSchedule: {
    dailyScan: string; // cron expression
    weeklyReview: string;
  };

  // Evolution settings
  minTrialsForPromotion: number;
  promotionThreshold: number; // composite score threshold
  demotionThreshold: number;

  // Integration settings
  datastorePath?: string;
  rulebookPath?: string;
  pluginScoutEndpoint?: string;

  // Feature flags
  enableAutoDiscovery: boolean;
  enableAutoPromotion: boolean;
  enableTrendAbsorption: boolean;
}

export const DEFAULT_CONFIG: LearnConfig = {
  discoverySources: [],
  scanSchedule: {
    dailyScan: '0 3 * * *',
    weeklyReview: '0 4 * * 0',
  },
  minTrialsForPromotion: 10,
  promotionThreshold: 70,
  demotionThreshold: 40,
  enableAutoDiscovery: true,
  enableAutoPromotion: false,
  enableTrendAbsorption: true,
};

// ============================================================================
// Event Types
// ============================================================================

export type LearnEventType =
  | 'skill:discovered'
  | 'skill:promoted'
  | 'skill:demoted'
  | 'skill:archived'
  | 'trial:started'
  | 'trial:completed'
  | 'lesson:created'
  | 'trend:detected'
  | 'scan:completed';

export interface LearnEvent {
  type: LearnEventType;
  timestamp: Date;
  data: Record<string, unknown>;
}
