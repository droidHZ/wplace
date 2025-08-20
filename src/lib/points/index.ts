import db from '@/db';
import { payment, pointsConfig, pointsTransaction, user } from '@/db/schema';
import { console } from '@/lib/logger';
import { findPlanByPriceId } from '@/lib/price-plan';
import type {
  PointsConfig,
  PointsConfigType,
  PointsReferenceType,
  PointsTransaction,
  PointsTransactionReason,
  UserPointsSummary,
} from '@/types/points';
import {
  DEFAULT_POINTS_CONFIG,
  PointsConfigKeys,
  type PointsTransactionType,
} from '@/types/points';
import { generateId } from 'better-auth';
import { and, desc, eq, gte, lte, sql, sum } from 'drizzle-orm';

/**
 * Points service class for managing user points and configuration
 */
export class PointsService {
  /**
   * Award points to a user
   */
  static async awardPoints({
    userId,
    amount,
    reason,
    description,
    referenceId,
    referenceType,
  }: {
    userId: string;
    amount: number;
    reason: PointsTransactionReason;
    description?: string;
    referenceId?: string;
    referenceType?: PointsReferenceType;
  }): Promise<PointsTransaction> {
    console.log(
      `💰 [AWARD POINTS] Starting award process for user ${userId}: ${amount} points (${reason})`
    );

    if (amount <= 0) {
      console.error(
        `❌ [AWARD POINTS] Invalid amount: ${amount} (must be positive)`
      );
      throw new Error('Points amount must be positive');
    }

    // Check if points system is enabled
    console.log(`🔍 [AWARD POINTS] Checking if points system is enabled...`);
    const systemEnabled = await this.getConfigValue(
      PointsConfigKeys.POINTS_SYSTEM_ENABLED,
      true
    );
    console.log(`📊 [AWARD POINTS] Points system enabled: ${systemEnabled}`);

    if (!systemEnabled) {
      console.error(
        `❌ [AWARD POINTS] Points system is disabled - cannot award points`
      );
      throw new Error('Points system is disabled');
    }

    const transactionId = generateId();
    console.log(`🆔 [AWARD POINTS] Generated transaction ID: ${transactionId}`);

    // Start a transaction to ensure consistency
    console.log(`🔄 [AWARD POINTS] Starting database transaction...`);
    return await db.transaction(async (tx) => {
      console.log(`📝 [AWARD POINTS] Creating points transaction record...`);
      // Create points transaction record
      const [transaction] = await tx
        .insert(pointsTransaction)
        .values({
          id: transactionId,
          userId,
          amount,
          type: 'earn',
          reason,
          description,
          referenceId,
          referenceType,
        })
        .returning();
      console.log(
        `✅ [AWARD POINTS] Transaction record created: ${transaction.id}`
      );

      console.log(`🔄 [AWARD POINTS] Updating user points balance...`);
      // Update user's total points
      await tx
        .update(user)
        .set({
          points: sql`${user.points} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));
      console.log(
        `✅ [AWARD POINTS] User points balance updated for user ${userId}`
      );

      const result = {
        ...transaction,
        type: transaction.type as PointsTransactionType,
        reason: transaction.reason as PointsTransactionReason,
        referenceType: transaction.referenceType as PointsReferenceType,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      } as PointsTransaction;

      console.log(
        `🎉 [AWARD POINTS] Successfully awarded ${amount} points to user ${userId} - Transaction: ${transactionId}`
      );
      return result;
    });
  }

  /**
   * Spend/deduct points from a user
   */
  static async spendPoints({
    userId,
    amount,
    reason,
    description,
    referenceId,
    referenceType,
  }: {
    userId: string;
    amount: number;
    reason: PointsTransactionReason;
    description?: string;
    referenceId?: string;
    referenceType?: PointsReferenceType;
  }): Promise<PointsTransaction> {
    if (amount <= 0) {
      throw new Error('Points amount must be positive');
    }

    // Check if user has enough points
    const currentUser = await db
      .select({ points: user.points })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!currentUser.length) {
      throw new Error('User not found');
    }

    if (currentUser[0].points < amount) {
      throw new Error('Insufficient points');
    }

    const transactionId = generateId();

    // Start a transaction to ensure consistency
    return await db.transaction(async (tx) => {
      // Create points transaction record (negative amount for spending)
      const [transaction] = await tx
        .insert(pointsTransaction)
        .values({
          id: transactionId,
          userId,
          amount: -amount,
          type: 'spend',
          reason,
          description,
          referenceId,
          referenceType,
        })
        .returning();

      // Update user's total points
      await tx
        .update(user)
        .set({
          points: sql`${user.points} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return {
        ...transaction,
        type: transaction.type as PointsTransactionType,
        reason: transaction.reason as PointsTransactionReason,
        referenceType: transaction.referenceType as PointsReferenceType,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      } as PointsTransaction;
    });
  }

  /**
   * Get user's points summary
   */
  static async getUserPointsSummary(
    userId: string
  ): Promise<UserPointsSummary> {
    // Get current points from user table
    const [userPoints] = await db
      .select({ points: user.points })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userPoints) {
      throw new Error('User not found');
    }

    // Get total earned points
    const totalEarnedResult = await db
      .select({ total: sum(pointsTransaction.amount) })
      .from(pointsTransaction)
      .where(
        and(
          eq(pointsTransaction.userId, userId),
          eq(pointsTransaction.type, 'earn')
        )
      );

    // Get total spent points (absolute value)
    const totalSpentResult = await db
      .select({ total: sum(pointsTransaction.amount) })
      .from(pointsTransaction)
      .where(
        and(
          eq(pointsTransaction.userId, userId),
          eq(pointsTransaction.type, 'spend')
        )
      );

    // Get last transaction
    const [lastTransaction] = await db
      .select()
      .from(pointsTransaction)
      .where(eq(pointsTransaction.userId, userId))
      .orderBy(desc(pointsTransaction.createdAt))
      .limit(1);

    // Get points earned this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pointsThisMonthResult = await db
      .select({ total: sum(pointsTransaction.amount) })
      .from(pointsTransaction)
      .where(
        and(
          eq(pointsTransaction.userId, userId),
          eq(pointsTransaction.type, 'earn'),
          gte(pointsTransaction.createdAt, startOfMonth)
        )
      );

    // Get points earned this year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pointsThisYearResult = await db
      .select({ total: sum(pointsTransaction.amount) })
      .from(pointsTransaction)
      .where(
        and(
          eq(pointsTransaction.userId, userId),
          eq(pointsTransaction.type, 'earn'),
          gte(pointsTransaction.createdAt, startOfYear)
        )
      );

    return {
      userId,
      totalPoints: userPoints.points,
      totalEarned: Number(totalEarnedResult[0]?.total || 0),
      totalSpent: Math.abs(Number(totalSpentResult[0]?.total || 0)),
      lastTransaction: lastTransaction
        ? {
            ...lastTransaction,
            type: lastTransaction.type as PointsTransactionType,
            reason: lastTransaction.reason as PointsTransactionReason,
            referenceType: lastTransaction.referenceType as PointsReferenceType,
          }
        : undefined,
      pointsThisMonth: Number(pointsThisMonthResult[0]?.total || 0),
      pointsThisYear: Number(pointsThisYearResult[0]?.total || 0),
    };
  }

  /**
   * Get user's points transaction history
   */
  static async getUserTransactions(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<PointsTransaction[]> {
    const transactions = await db
      .select()
      .from(pointsTransaction)
      .where(eq(pointsTransaction.userId, userId))
      .orderBy(desc(pointsTransaction.createdAt))
      .limit(limit)
      .offset(offset);

    return transactions.map((transaction) => ({
      ...transaction,
      type: transaction.type as PointsTransactionType,
      reason: transaction.reason as PointsTransactionReason,
      referenceType: transaction.referenceType as PointsReferenceType,
    }));
  }

  /**
   * Set a configuration value (now reads from DEFAULT_POINTS_CONFIG)
   * To modify configuration, update DEFAULT_POINTS_CONFIG in types/points.ts
   */
  static async setConfigValue(
    key: PointsConfigKeys,
    value: unknown,
    type: PointsConfigType = 'string',
    description?: string
  ): Promise<void> {
    console.log(
      `⚠️ [CONFIG] Configuration is now read-only from DEFAULT_POINTS_CONFIG. To modify ${key}, update src/types/points.ts`
    );
  }

  /**
   * Get a configuration value
   */
  static async getConfigValue<T>(
    key: PointsConfigKeys,
    defaultValue?: T
  ): Promise<T> {
    console.log(`🔍 [CONFIG] Getting config value for key: ${key}`);

    // Directly use configuration file values instead of database
    const configValue = DEFAULT_POINTS_CONFIG[key];
    const result = (
      configValue !== undefined ? configValue : defaultValue
    ) as T;
    console.log(
      `📊 [CONFIG] Config value for ${key}: ${JSON.stringify(result)}`
    );
    return result;
  }

  /**
   * Get all configuration values
   */
  static async getAllConfig(): Promise<Record<string, unknown>> {
    return DEFAULT_POINTS_CONFIG;
  }

  /**
   * Initialize default configuration values (now reads from DEFAULT_POINTS_CONFIG)
   * Configuration is automatically available from types/points.ts
   */
  static async initializeDefaultConfig(): Promise<void> {
    console.log(
      `✅ [CONFIG] Configuration is now read directly from DEFAULT_POINTS_CONFIG in types/points.ts`
    );
  }

  /**
   * Handle subscription signup bonus
   */
  static async handleSubscriptionSignup(
    userId: string,
    planId: string
  ): Promise<void> {
    console.log(
      `🎯 [SUBSCRIPTION BONUS] handleSubscriptionSignup called for user: ${userId}, plan: ${planId}`
    );

    try {
      // Check if subscription bonus has already been awarded for this plan
      const existingTransaction = await db
        .select()
        .from(pointsTransaction)
        .where(
          and(
            eq(pointsTransaction.userId, userId),
            eq(pointsTransaction.reason, 'subscription_purchase'),
            eq(pointsTransaction.referenceId, planId),
            eq(pointsTransaction.referenceType, 'subscription')
          )
        )
        .limit(1);

      if (existingTransaction.length > 0) {
        console.log(
          `⚠️ [SUBSCRIPTION BONUS] Subscription bonus already awarded for user ${userId}, plan ${planId}. Skipping.`
        );
        return;
      }

      // Get subscription signup bonus
      const subscriptionBonus = await this.getConfigValue(
        PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS,
        0
      );
      console.log(
        `📊 [SUBSCRIPTION BONUS] Subscription bonus: ${subscriptionBonus}`
      );

      if (subscriptionBonus > 0) {
        console.log(
          `🎉 [SUBSCRIPTION BONUS] Awarding ${subscriptionBonus} subscription bonus points to user ${userId}`
        );
        await this.awardPoints({
          userId,
          amount: subscriptionBonus,
          reason: 'subscription_purchase',
          description: `Subscription signup bonus for ${planId} plan`,
          referenceId: planId,
          referenceType: 'subscription',
        });
        console.log(
          `✅ [SUBSCRIPTION BONUS] Successfully awarded ${subscriptionBonus} subscription bonus points to user ${userId}`
        );
      } else {
        console.log(
          `⚠️ [SUBSCRIPTION BONUS] Subscription bonus is 0, skipping award for user ${userId}`
        );
      }
    } catch (error) {
      console.error(
        `❌ [SUBSCRIPTION BONUS] Error in handleSubscriptionSignup for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle subscription renewal bonus
   */
  static async handleSubscriptionRenewal(
    userId: string,
    planId: string,
    periodStart?: Date
  ): Promise<void> {
    console.log(
      `🎯 [SUBSCRIPTION RENEWAL] handleSubscriptionRenewal called for user: ${userId}, plan: ${planId}`
    );

    try {
      // Create a unique reference for this renewal period (use timestamp or period start)
      const renewalRef = periodStart
        ? periodStart.toISOString()
        : new Date().toISOString();

      // Check if renewal bonus has already been awarded for this period
      const existingTransaction = await db
        .select()
        .from(pointsTransaction)
        .where(
          and(
            eq(pointsTransaction.userId, userId),
            eq(pointsTransaction.reason, 'subscription_renewal'),
            eq(pointsTransaction.referenceId, planId),
            eq(pointsTransaction.referenceType, 'subscription'),
            eq(
              pointsTransaction.description,
              `Subscription renewal bonus for ${planId} plan - ${renewalRef}`
            )
          )
        )
        .limit(1);

      if (existingTransaction.length > 0) {
        console.log(
          `⚠️ [SUBSCRIPTION RENEWAL] Renewal bonus already awarded for user ${userId}, plan ${planId}, period ${renewalRef}. Skipping.`
        );
        return;
      }

      // Get subscription bonus (same for signup and renewal)
      const renewalBonus = await this.getConfigValue(
        PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS,
        0
      );
      console.log(`📊 [SUBSCRIPTION RENEWAL] Renewal bonus: ${renewalBonus}`);

      if (renewalBonus > 0) {
        console.log(
          `🎉 [SUBSCRIPTION RENEWAL] Awarding ${renewalBonus} renewal bonus points to user ${userId}`
        );
        await this.awardPoints({
          userId,
          amount: renewalBonus,
          reason: 'subscription_renewal',
          description: `Subscription renewal bonus for ${planId} plan - ${renewalRef}`,
          referenceId: planId,
          referenceType: 'subscription',
        });
        console.log(
          `✅ [SUBSCRIPTION RENEWAL] Successfully awarded ${renewalBonus} renewal bonus points to user ${userId}`
        );
      } else {
        console.log(
          `⚠️ [SUBSCRIPTION RENEWAL] Renewal bonus is 0, skipping award for user ${userId}`
        );
      }
    } catch (error) {
      console.error(
        `❌ [SUBSCRIPTION RENEWAL] Error in handleSubscriptionRenewal for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle subscription payment (for both new subscriptions and renewals)
   * Supports monthly point awards for annual subscriptions
   */
  static async handleSubscriptionPayment(
    userId: string,
    planId: string,
    interval: 'month' | 'year',
    periodStart: Date,
    isFirstPayment = false
  ): Promise<void> {
    console.log(
      `🎯 [SUBSCRIPTION PAYMENT] handleSubscriptionPayment called for user: ${userId}, plan: ${planId}, interval: ${interval}, isFirstPayment: ${isFirstPayment}`
    );

    try {
      // Get subscription bonus
      const subscriptionBonus = await this.getConfigValue(
        PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS,
        0
      );
      console.log(
        `📊 [SUBSCRIPTION PAYMENT] Subscription bonus: ${subscriptionBonus}`
      );

      if (subscriptionBonus <= 0) {
        console.log(
          `⚠️ [SUBSCRIPTION PAYMENT] Subscription bonus is 0, skipping award for user ${userId}`
        );
        return;
      }

      if (interval === 'month') {
        // Monthly subscription: award points once per payment
        const monthRef = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;

        // Check if points already awarded for this month
        const existingTransaction = await db
          .select()
          .from(pointsTransaction)
          .where(
            and(
              eq(pointsTransaction.userId, userId),
              eq(
                pointsTransaction.reason,
                isFirstPayment
                  ? 'subscription_purchase'
                  : 'subscription_renewal'
              ),
              eq(pointsTransaction.referenceId, planId),
              eq(pointsTransaction.referenceType, 'subscription'),
              eq(
                pointsTransaction.description,
                `Subscription ${isFirstPayment ? 'signup' : 'renewal'} bonus for ${planId} plan - ${monthRef}`
              )
            )
          )
          .limit(1);

        if (existingTransaction.length > 0) {
          console.log(
            `⚠️ [SUBSCRIPTION PAYMENT] Monthly bonus already awarded for user ${userId}, plan ${planId}, month ${monthRef}. Skipping.`
          );
          return;
        }

        console.log(
          `🎉 [SUBSCRIPTION PAYMENT] Awarding ${subscriptionBonus} monthly subscription points to user ${userId}`
        );
        await this.awardPoints({
          userId,
          amount: subscriptionBonus,
          reason: isFirstPayment
            ? 'subscription_purchase'
            : 'subscription_renewal',
          description: `Subscription ${isFirstPayment ? 'signup' : 'renewal'} bonus for ${planId} plan - ${monthRef}`,
          referenceId: planId,
          referenceType: 'subscription',
        });
        console.log(
          `✅ [SUBSCRIPTION PAYMENT] Successfully awarded ${subscriptionBonus} monthly subscription points to user ${userId}`
        );
      } else if (interval === 'year') {
        // Annual subscription: award points for current month only
        const monthRef = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;

        // Check if points already awarded for this month
        const existingTransaction = await db
          .select()
          .from(pointsTransaction)
          .where(
            and(
              eq(pointsTransaction.userId, userId),
              eq(
                pointsTransaction.reason,
                isFirstPayment
                  ? 'subscription_purchase'
                  : 'subscription_renewal'
              ),
              eq(pointsTransaction.referenceId, planId),
              eq(pointsTransaction.referenceType, 'subscription'),
              eq(
                pointsTransaction.description,
                `Annual subscription monthly bonus for ${planId} plan - ${monthRef}`
              )
            )
          )
          .limit(1);

        if (existingTransaction.length === 0) {
          console.log(
            `🎉 [SUBSCRIPTION PAYMENT] Awarding ${subscriptionBonus} annual subscription monthly points to user ${userId} for month ${monthRef}`
          );
          await this.awardPoints({
            userId,
            amount: subscriptionBonus,
            reason: isFirstPayment
              ? 'subscription_purchase'
              : 'subscription_renewal',
            description: `Annual subscription monthly bonus for ${planId} plan - ${monthRef}`,
            referenceId: planId,
            referenceType: 'subscription',
          });
          console.log(
            `✅ [SUBSCRIPTION PAYMENT] Successfully awarded ${subscriptionBonus} annual subscription monthly points to user ${userId} for month ${monthRef}`
          );
        } else {
          console.log(
            `⚠️ [SUBSCRIPTION PAYMENT] Annual monthly bonus already awarded for user ${userId}, plan ${planId}, month ${monthRef}. Skipping.`
          );
        }
      }
    } catch (error) {
      console.error(
        `❌ [SUBSCRIPTION PAYMENT] Error in handleSubscriptionPayment for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Process monthly points for annual subscriptions
   * This should be called monthly by a cron job
   */
  static async processMonthlyAnnualSubscriptionPoints(): Promise<void> {
    console.log(
      `🎯 [MONTHLY POINTS] Starting monthly points processing for annual subscriptions`
    );

    try {
      const currentDate = new Date();
      const monthRef = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      console.log(`📅 [MONTHLY POINTS] Processing for month: ${monthRef}`);

      // Find all active annual subscriptions
      const activeAnnualSubscriptions = await db
        .select({
          userId: payment.userId,
          priceId: payment.priceId,
          subscriptionId: payment.subscriptionId,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
        })
        .from(payment)
        .where(
          and(
            eq(payment.status, 'active'),
            eq(payment.interval, 'year'),
            // Subscription period should include current month
            gte(payment.periodEnd, currentDate),
            lte(payment.periodStart, currentDate)
          )
        );

      console.log(
        `📊 [MONTHLY POINTS] Found ${activeAnnualSubscriptions.length} active annual subscriptions`
      );

      for (const subscription of activeAnnualSubscriptions) {
        try {
          // Get plan ID from price ID
          const plan = findPlanByPriceId(subscription.priceId);
          if (!plan) {
            console.error(
              `❌ [MONTHLY POINTS] Plan not found for priceId: ${subscription.priceId}`
            );
            continue;
          }

          await this.handleSubscriptionPayment(
            subscription.userId,
            plan.id,
            'year',
            currentDate,
            false // Not first payment
          );
        } catch (error) {
          console.error(
            `❌ [MONTHLY POINTS] Error processing monthly points for user ${subscription.userId}, priceId ${subscription.priceId}:`,
            error
          );
        }
      }

      console.log(
        `✅ [MONTHLY POINTS] Completed monthly points processing for ${activeAnnualSubscriptions.length} subscriptions`
      );
    } catch (error) {
      console.error(
        `❌ [MONTHLY POINTS] Error in processMonthlyAnnualSubscriptionPoints:`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle user signup bonus
   */
  static async handleSignupBonus(userId: string): Promise<void> {
    console.log(
      `🎯 [POINTS SERVICE] handleSignupBonus called for user: ${userId}`
    );

    try {
      console.log(`🔍 [POINTS SERVICE] Fetching signup bonus config...`);
      const signupBonus = await this.getConfigValue(
        PointsConfigKeys.SIGNUP_BONUS,
        0
      );
      console.log(`📊 [POINTS SERVICE] Signup bonus amount: ${signupBonus}`);

      if (signupBonus > 0) {
        console.log(
          `💰 [POINTS SERVICE] Awarding ${signupBonus} points to user ${userId}`
        );
        await this.awardPoints({
          userId,
          amount: signupBonus,
          reason: 'signup_bonus',
          description: 'Welcome bonus for signing up',
          referenceType: 'user',
        });
        console.log(
          `✅ [POINTS SERVICE] Successfully awarded ${signupBonus} signup bonus points to user ${userId}`
        );
      } else {
        console.log(
          `⚠️ [POINTS SERVICE] Signup bonus is 0 or disabled, skipping award for user ${userId}`
        );
      }
    } catch (error) {
      console.error(
        `❌ [POINTS SERVICE] Error in handleSignupBonus for user ${userId}:`,
        error
      );
      throw error;
    }
  }
}

export default PointsService;
