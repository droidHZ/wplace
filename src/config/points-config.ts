import type { PointsConfigKeys } from '@/types/points';

/**
 * Points system configuration
 * This file allows you to configure the points system behavior
 */
export const pointsConfig = {
  // System settings
  enabled: true,
  displayName: 'Points',

  // Signup bonus
  signupBonus: 100,

  // Subscription rewards
  subscriptionSignupBonus: 200,
  subscriptionRenewalBonus: 100,
  subscriptionRewardRate: 10, // Points per dollar spent

  // Plan-specific bonuses (bonus points for subscribing to specific plans)
  planBonuses: {
    plus: 300,
    pro: 500,
    ultra: 1000,
  },

  // Points expiry and conversion
  pointsExpiryDays: 0, // 0 = never expire
  pointsToCurrencyRate: 100, // 100 points = $1
};
