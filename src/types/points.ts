/**
 * Points system types and interfaces
 */

/**
 * Types of points transactions
 */
export type PointsTransactionType =
  | 'earn'
  | 'spend'
  | 'refund'
  | 'admin_adjust';

/**
 * Reasons for points transactions
 */
export type PointsTransactionReason =
  | 'signup_bonus'
  | 'subscription_purchase'
  | 'subscription_renewal'
  | 'manual_adjustment'
  | 'admin_grant';

/**
 * Reference types for points transactions
 */
export type PointsReferenceType =
  | 'subscription'
  | 'payment'
  | 'user'
  | 'manual'
  | 'system'
  | 'referral';

/**
 * Points transaction interface
 */
export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: PointsTransactionType;
  reason: PointsTransactionReason;
  description?: string | null;
  referenceId?: string | null;
  referenceType?: PointsReferenceType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Points configuration value types
 */
export type PointsConfigType =
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'string';

/**
 * Points configuration interface
 */
export interface PointsConfig {
  id: string;
  key: string;
  value: string; // JSON string
  type: PointsConfigType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Points configuration keys
 */
export enum PointsConfigKeys {
  // Signup and registration bonuses
  SIGNUP_BONUS = 'signup_bonus',

  // Subscription-related rewards
  SUBSCRIPTION_SIGNUP_BONUS = 'subscription_signup_bonus',
  SUBSCRIPTION_RENEWAL_BONUS = 'subscription_renewal_bonus',
  SUBSCRIPTION_REWARD_RATE = 'subscription_reward_rate', // Points per dollar spent

  // Plan-specific bonuses
  PLAN_BONUSES = 'plan_bonuses', // Object mapping plan IDs to bonus points

  // Admin settings
  POINTS_SYSTEM_ENABLED = 'points_system_enabled',
  POINTS_DISPLAY_NAME = 'points_display_name',
  POINTS_EXPIRY_DAYS = 'points_expiry_days', // 0 = never expire

  // Conversion rates
  POINTS_TO_CURRENCY_RATE = 'points_to_currency_rate', // How many points = $1
}

/**
 * User points summary
 */
export interface UserPointsSummary {
  userId: string;
  totalPoints: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction?: PointsTransaction;
  pointsThisMonth: number;
  pointsThisYear: number;
}

/**
 * Points reward configuration for subscription plans
 */
export interface PlanPointsReward {
  planId: string;
  signupBonus: number;
  renewalBonus: number;
  rewardRateMultiplier: number; // Multiplier for base reward rate
}

/**
 * Default points configuration values
 */
export const DEFAULT_POINTS_CONFIG = {
  [PointsConfigKeys.SIGNUP_BONUS]: 100,
  [PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS]: 500, // 订阅积分：月度订阅每月500积分，年度订阅每月500积分×12个月
  [PointsConfigKeys.SUBSCRIPTION_RENEWAL_BONUS]: 500, // 续费奖励积分 (与订阅一致)
  [PointsConfigKeys.SUBSCRIPTION_REWARD_RATE]: 10, // 10 points per dollar
  [PointsConfigKeys.POINTS_SYSTEM_ENABLED]: true,
  [PointsConfigKeys.POINTS_DISPLAY_NAME]: 'Points',
  [PointsConfigKeys.POINTS_EXPIRY_DAYS]: 0, // Never expire
  [PointsConfigKeys.POINTS_TO_CURRENCY_RATE]: 100, // 100 points = $1
  [PointsConfigKeys.PLAN_BONUSES]: {
    plus: 300,
    pro: 500,
    ultra: 1000,
  } as Record<string, number>,
};
