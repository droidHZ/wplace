'use client';

import type { PricePlan } from '@/payment/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get price plans with translations for client components
 *
 * NOTICE: This function should only be used in client components.
 * If you need to get the price plans in server components, use getAllPricePlans instead.
 * Use this function when showing the pricing table or the billing card to the user.
 *
 * docs:
 * https://mksaas.com/docs/config/price
 *
 * @returns The price plans with translated content
 */
export function getPricePlans(): Record<string, PricePlan> {
  const t = useTranslations('PricePlans');
  const priceConfig = websiteConfig.price;
  const plans: Record<string, PricePlan> = {};

  // Add translated content to each plan
  if (priceConfig.plans.plus) {
    plans.plus = {
      ...priceConfig.plans.plus,
      name: t('plus.name'),
      description: t('plus.description'),
      features: [
        t('plus.features.feature-1'),
        t('plus.features.feature-2'),
        t('plus.features.feature-3'),
        t('plus.features.feature-4'),
        t('plus.features.feature-5'),
        t('plus.features.feature-6'),
        t('plus.features.feature-7'),
      ],
      limits: [t('plus.limits.limit-1'), t('plus.limits.limit-2')],
    };
  }

  if (priceConfig.plans.pro) {
    plans.pro = {
      ...priceConfig.plans.pro,
      name: t('pro.name'),
      description: t('pro.description'),
      features: [
        t('pro.features.feature-1'),
        t('pro.features.feature-2'),
        t('pro.features.feature-3'),
        t('pro.features.feature-4'),
        t('pro.features.feature-5'),
        t('pro.features.feature-6'),
        t('pro.features.feature-7'),
        t('pro.features.feature-8'),
      ],
      limits: [t('pro.limits.limit-1')],
    };
  }

  if (priceConfig.plans.ultra) {
    plans.ultra = {
      ...priceConfig.plans.ultra,
      name: t('ultra.name'),
      description: t('ultra.description'),
      features: [
        t('ultra.features.feature-1'),
        t('ultra.features.feature-2'),
        t('ultra.features.feature-3'),
        t('ultra.features.feature-4'),
        t('ultra.features.feature-5'),
        t('ultra.features.feature-6'),
        t('ultra.features.feature-7'),
        t('ultra.features.feature-8'),
      ],
      limits: [],
    };
  }

  return plans;
}
