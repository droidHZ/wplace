import { randomUUID } from 'crypto';
import { console } from '@/lib/logger';
import db from '@/db';
import { payment, user } from '@/db/schema';
import PointsService from '@/lib/points';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { desc, eq } from 'drizzle-orm';
import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
  type Subscription,
  type getSubscriptionsParams,
} from '../types';

/**
 * Creem payment provider implementation
 *
 * docs:
 * https://docs.creem.io/introduction
 */
export class CreemProvider implements PaymentProvider {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl: string;

  /**
   * Initialize Creem provider with API key
   */
  constructor() {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      throw new Error('CREEM_API_KEY environment variable is not set');
    }

    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('CREEM_WEBHOOK_SECRET environment variable is not set');
    }

    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.baseUrl = process.env.CREEM_API_BASE_URL || 'https://api.creem.io';
  }

  /**
   * Make API request to Creem
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Creem API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create or get customer in Creem
   */
  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    try {
      // Try to get existing customer first
      const customers = await this.makeRequest(
        `/customers?email=${encodeURIComponent(email)}`
      );

      if (customers.data && customers.data.length > 0) {
        const customerId = customers.data[0].id;

        // Check if user exists in our database
        const userId = await this.findUserIdByCustomerId(customerId);
        if (!userId) {
          await this.updateUserWithCustomerId(customerId, email);
        }
        return customerId;
      }

      // Create new customer
      const customer = await this.makeRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          name: name || undefined,
        }),
      });

      // Update user record with customer ID
      await this.updateUserWithCustomerId(customer.id, email);

      return customer.id;
    } catch (error) {
      throw new Error(
        `Failed to create or get customer: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  private async updateUserWithCustomerId(
    customerId: string,
    email: string
  ): Promise<void> {
    try {
      await db
        .update(user)
        .set({
          customerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email))
        .returning({ id: user.id });
    } catch (error) {
      throw new Error('Failed to update user with customer ID');
    }
  }

  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    try {
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.customerId, customerId))
        .limit(1);

      return result.length > 0 ? result[0].id : undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Create a checkout session for a plan
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const { planId, priceId, customerEmail, successUrl, cancelUrl, metadata } =
      params;

    try {
      // Get plan and price
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        throw new Error(`Price ID ${priceId} not found in plan ${planId}`);
      }

      // Create checkout session with Creem
      const checkoutData = {
        product_id: priceId, // Creem uses product_id instead of price_id
        units: 1,
        customer: {
          email: customerEmail,
        },
        success_url: successUrl || '',
        metadata: {
          ...metadata,
          planId,
          priceId,
        },
      };

      const session = await this.makeRequest('/v1/checkouts', {
        method: 'POST',
        body: JSON.stringify(checkoutData),
      });

      // Creem checkout response structure may differ from Stripe
      const checkoutUrl = session.checkout_url || session.url;
      const checkoutId = session.id || session.checkout_id;

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned from Creem');
      }

      return {
        url: checkoutUrl,
        id: checkoutId,
      };
    } catch (error) {
      throw new Error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Create a customer portal session
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl } = params;

    try {
      const session = await this.makeRequest('/portal/sessions', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customerId,
          return_url: returnUrl || '',
        }),
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Create customer portal error:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  /**
   * Get subscriptions for a user
   */
  public async getSubscriptions(
    params: getSubscriptionsParams
  ): Promise<Subscription[]> {
    const { userId } = params;

    try {
      // Get subscriptions from database
      const subscriptions = await db
        .select()
        .from(payment)
        .where(eq(payment.userId, userId))
        .orderBy(desc(payment.createdAt));

      return subscriptions.map((subscription) => ({
        id: subscription.subscriptionId || '',
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status as PaymentStatus,
        type: subscription.type as PaymentTypes,
        interval: subscription.interval as PlanInterval,
        currentPeriodStart: subscription.periodStart || undefined,
        currentPeriodEnd: subscription.periodEnd || undefined,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        trialStartDate: subscription.trialStart || undefined,
        trialEndDate: subscription.trialEnd || undefined,
        createdAt: subscription.createdAt,
      }));
    } catch (error) {
      console.error('List customer subscriptions error:', error);
      return [];
    }
  }

  /**
   * Handle webhook event
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(payload);
      // Creem uses 'eventType' instead of 'type'
      const eventType = event.eventType || event.type;
      // Creem uses 'object' instead of 'data' for the main data
      const eventData = event.object || event.data;

      console.log('Creem webhook event:', { eventType, eventData });

      // Handle subscription events
      if (eventType && eventType.startsWith('subscription.')) {
        switch (eventType) {
          case 'subscription.active':
          case 'subscription.created': {
            await this.onCreateSubscription(eventData);
            break;
          }
          case 'subscription.updated': {
            await this.onUpdateSubscription(eventData);
            break;
          }
          case 'subscription.paid': {
            await this.onSubscriptionPaid(eventData);
            break;
          }
          case 'subscription.canceled':
          case 'subscription.cancelled': {
            await this.onDeleteSubscription(eventData);
            break;
          }
          case 'subscription.expired': {
            await this.onSubscriptionExpired(eventData);
            break;
          }
          case 'subscription.paused': {
            await this.onSubscriptionPaused(eventData);
            break;
          }
          case 'subscription.resumed': {
            await this.onSubscriptionResumed(eventData);
            break;
          }
        }
      } else if (eventType === 'payment.completed') {
        if (eventData?.type === 'one_time') {
          await this.onOnetimePayment(eventData);
        } else {
          // Handle subscription payment completed
          await this.onSubscriptionPaymentCompleted(eventData);
        }
      } else if (eventType === 'checkout.completed') {
        await this.onCheckoutCompleted(eventData);
      } else if (eventType === 'payment.failed') {
        await this.onPaymentFailed(eventData);
      } else if (eventType === 'payment.refunded') {
        await this.onPaymentRefunded(eventData);
      }
    } catch (error) {
      console.error('Creem webhook processing error:', error);
      throw new Error('Failed to handle webhook event');
    }
  }

  private verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Temporary: Skip signature verification for debugging
      // TODO: Remove this after identifying the correct signature header
      if (!signature || signature.length === 0) {
        console.warn(
          'Creem webhook: Skipping signature verification (no signature provided)'
        );
        return true;
      }

      // Common webhook signature verification using HMAC-SHA256
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      // Handle different signature formats (with or without prefix)
      const cleanSignature = signature.replace(/^(sha256=|creem_)/, '');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(cleanSignature, 'hex')
      );

      console.log('Creem webhook signature verification:', {
        isValid,
        expectedSignature: expectedSignature.substring(0, 20) + '...',
        receivedSignature: cleanSignature.substring(0, 20) + '...',
      });

      return isValid;
    } catch (error) {
      console.error('Creem webhook signature verification error:', error);
      return false;
    }
  }

  private async onCreateSubscription(creemSubscription: any): Promise<void> {
    console.log('Creem webhook: onCreateSubscription called with:', JSON.stringify(creemSubscription, null, 2));
    
    const customerId =
      creemSubscription.customer?.id || creemSubscription.customer_id;
    const priceId = creemSubscription.product?.id || creemSubscription.price_id;
    const userId = creemSubscription.metadata?.userId;
    const planId = creemSubscription.metadata?.planId;

    console.log('Extracted data:', { customerId, priceId, userId, planId });

    if (!userId) {
      console.error('Creem webhook: No userId in subscription.active metadata, subscription:', creemSubscription.id);
      return;
    }

    if (!planId) {
      console.error('Creem webhook: No planId in subscription.active metadata, userId:', userId);
    }

    const createFields = {
      id: randomUUID(),
      priceId: priceId,
      type: PaymentTypes.SUBSCRIPTION,
      userId: userId,
      customerId: customerId,
      subscriptionId: creemSubscription.id,
      interval: this.mapCreemIntervalToPlanInterval(creemSubscription),
      status: this.mapCreemStatusToPaymentStatus(creemSubscription.status),
      periodStart: creemSubscription.current_period_start_date
        ? new Date(creemSubscription.current_period_start_date)
        : null,
      periodEnd: creemSubscription.current_period_end_date
        ? new Date(creemSubscription.current_period_end_date)
        : null,
      cancelAtPeriodEnd: creemSubscription.cancel_at_period_end || false,
      trialStart: creemSubscription.trial_start
        ? new Date(creemSubscription.trial_start)
        : null,
      trialEnd: creemSubscription.trial_end
        ? new Date(creemSubscription.trial_end)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(payment)
      .values(createFields)
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log(
        `Created new payment record ${result[0].id} for Creem subscription ${creemSubscription.id}`
      );

      // Points will be awarded in subscription.paid event
    }
  }

  private async onUpdateSubscription(creemSubscription: any): Promise<void> {
    const updateFields = {
      priceId: creemSubscription.product?.id || creemSubscription.price_id,
      interval: this.mapCreemIntervalToPlanInterval(creemSubscription),
      status: this.mapCreemStatusToPaymentStatus(creemSubscription.status),
      periodStart: creemSubscription.current_period_start_date
        ? new Date(creemSubscription.current_period_start_date)
        : undefined,
      periodEnd: creemSubscription.current_period_end_date
        ? new Date(creemSubscription.current_period_end_date)
        : undefined,
      cancelAtPeriodEnd: creemSubscription.cancel_at_period_end || false,
      trialStart: creemSubscription.trial_start
        ? new Date(creemSubscription.trial_start)
        : undefined,
      trialEnd: creemSubscription.trial_end
        ? new Date(creemSubscription.trial_end)
        : undefined,
      updatedAt: new Date(),
    };

    await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ id: payment.id });
  }

  private async onDeleteSubscription(creemSubscription: any): Promise<void> {
    await db
      .update(payment)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ id: payment.id });
  }

  private async onOnetimePayment(creemPayment: any): Promise<void> {
    const customerId = creemPayment.customer_id;
    const userId = creemPayment.metadata?.userId;
    const priceId = creemPayment.metadata?.priceId;

    if (!userId || !priceId) {
      return;
    }

    const now = new Date();
    const result = await db
      .insert(payment)
      .values({
        id: randomUUID(),
        priceId: priceId,
        type: PaymentTypes.ONE_TIME,
        userId: userId,
        customerId: customerId,
        status: 'completed',
        periodStart: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log(
        `Created one-time payment record for user ${userId}, price: ${priceId}`
      );

      // Points will be awarded in subscription.paid event
    }
  }

  private mapCreemIntervalToPlanInterval(subscription: any): PlanInterval {
    const interval =
      subscription.product?.billing_period || subscription.interval;

    if (interval?.includes('month')) {
      return PlanIntervals.MONTH;
    } else if (interval?.includes('year')) {
      return PlanIntervals.YEAR;
    } else {
      return PlanIntervals.MONTH;
    }
  }

  private mapCreemStatusToPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
      expired: 'expired',
      failed: 'failed',
    };

    return statusMap[status] || 'failed';
  }

  private async onSubscriptionPaid(creemSubscription: any): Promise<void> {
    console.log('Creem webhook: subscription.paid', JSON.stringify(creemSubscription, null, 2));

    // Update subscription status to active and update payment dates
    const updateFields = {
      status: 'active' as PaymentStatus,
      periodStart: creemSubscription.current_period_start_date
        ? new Date(creemSubscription.current_period_start_date)
        : undefined,
      periodEnd: creemSubscription.current_period_end_date
        ? new Date(creemSubscription.current_period_end_date)
        : undefined,
      updatedAt: new Date(),
    };

    const result = await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ 
        id: payment.id, 
        userId: payment.userId,
        createdAt: payment.createdAt,
        interval: payment.interval 
      });

    // Award subscription points
    if (result.length > 0) {
      try {
        const userId = result[0].userId;
        const planId = creemSubscription.metadata?.planId;
        const interval = this.mapCreemIntervalToPlanInterval(creemSubscription);
        const periodStart = creemSubscription.current_period_start_date
          ? new Date(creemSubscription.current_period_start_date)
          : new Date();
        
        // Check if this is the first payment (subscription creation)
        const paymentCreatedAt = new Date(result[0].createdAt);
        const timeDifference = Math.abs(periodStart.getTime() - paymentCreatedAt.getTime());
        const isFirstPayment = timeDifference < 24 * 60 * 60 * 1000; // Within 24 hours of creation

        console.log(`Attempting to award subscription points: userId=${userId}, planId=${planId}, interval=${interval}, isFirstPayment=${isFirstPayment}`);

        if (planId && userId) {
          await PointsService.handleSubscriptionPayment(
            userId,
            planId,
            interval === 'year' ? 'year' : 'month',
            periodStart,
            isFirstPayment
          );
          console.log(
            `✅ Successfully awarded subscription points to user ${userId} for plan ${planId}`
          );
        } else {
          console.error(`❌ Missing required data for subscription points: userId=${userId}, planId=${planId}`);
        }
      } catch (error) {
        console.error('❌ Error awarding subscription points:', error);
      }
    }
  }

  private async onSubscriptionExpired(creemSubscription: any): Promise<void> {
    console.log('Creem webhook: subscription.expired', creemSubscription);

    await db
      .update(payment)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ id: payment.id });
  }

  private async onSubscriptionPaused(creemSubscription: any): Promise<void> {
    console.log('Creem webhook: subscription.paused', creemSubscription);

    await db
      .update(payment)
      .set({
        status: 'paused',
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ id: payment.id });
  }

  private async onSubscriptionResumed(creemSubscription: any): Promise<void> {
    console.log('Creem webhook: subscription.resumed', creemSubscription);

    await db
      .update(payment)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, creemSubscription.id))
      .returning({ id: payment.id });
  }

  private async onSubscriptionPaymentCompleted(
    creemPayment: any
  ): Promise<void> {
    console.log('Creem webhook: subscription payment completed', creemPayment);

    // For subscription payments, update the subscription status and period
    if (creemPayment.subscription_id) {
      await db
        .update(payment)
        .set({
          status: 'active',
          periodStart: creemPayment.period_start
            ? new Date(creemPayment.period_start * 1000)
            : undefined,
          periodEnd: creemPayment.period_end
            ? new Date(creemPayment.period_end * 1000)
            : undefined,
          updatedAt: new Date(),
        })
        .where(eq(payment.subscriptionId, creemPayment.subscription_id))
        .returning({ id: payment.id });
    }
  }

  private async onCheckoutCompleted(checkoutData: any): Promise<void> {
    console.log('Creem webhook: checkout.completed', checkoutData);

    const customerId = checkoutData.customer_id;
    const userId = checkoutData.metadata?.userId;

    if (!userId) {
      console.warn('Creem webhook: No userId in checkout.completed metadata');
      return;
    }

    // If this is a subscription checkout, the subscription will be handled by subscription.created
    // If this is a one-time payment, handle it here
    if (checkoutData.mode === 'one_time' || checkoutData.type === 'one_time') {
      const priceId = checkoutData.metadata?.priceId || checkoutData.price_id;

      if (priceId) {
        const now = new Date();
        await db
          .insert(payment)
          .values({
            id: randomUUID(),
            priceId: priceId,
            type: PaymentTypes.ONE_TIME,
            userId: userId,
            customerId: customerId,
            status: 'completed',
            periodStart: now,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: payment.id });
      }
    }
  }

  private async onPaymentFailed(creemPayment: any): Promise<void> {
    console.log('Creem webhook: payment.failed', creemPayment);

    // Update subscription status to past_due if it's a subscription payment
    if (creemPayment.subscription_id) {
      await db
        .update(payment)
        .set({
          status: 'past_due',
          updatedAt: new Date(),
        })
        .where(eq(payment.subscriptionId, creemPayment.subscription_id))
        .returning({ id: payment.id });
    }
  }

  private async onPaymentRefunded(creemPayment: any): Promise<void> {
    console.log('Creem webhook: payment.refunded', creemPayment);

    // For subscription payments, update status
    if (creemPayment.subscription_id) {
      await db
        .update(payment)
        .set({
          status: 'refunded',
          updatedAt: new Date(),
        })
        .where(eq(payment.subscriptionId, creemPayment.subscription_id))
        .returning({ id: payment.id });
    } else {
      // For one-time payments, update status based on customer/payment info
      const customerId = creemPayment.customer_id;
      const userId = creemPayment.metadata?.userId;

      if (userId && customerId) {
        await db
          .update(payment)
          .set({
            status: 'refunded',
            updatedAt: new Date(),
          })
          .where(eq(payment.userId, userId))
          .returning({ id: payment.id });
      }
    }
  }
}
