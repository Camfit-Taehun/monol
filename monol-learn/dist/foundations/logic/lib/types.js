/**
 * monol-learn Type Definitions
 * Self-learning infrastructure types
 */
export const DEFAULT_CONFIG = {
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
//# sourceMappingURL=types.js.map