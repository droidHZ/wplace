import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 *
 * docs:
 * https://mksaas.com/docs/config/website
 */
export const websiteConfig: WebsiteConfig = {
  metadata: {
    theme: {
      defaultTheme: 'amber',
      enableSwitch: false,
    },
    mode: {
      defaultMode: 'light',
      enableSwitch: false,
    },
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
    social: {
      github: 'https://github.com/MkSaaSHQ',
      twitter: 'https://x.com/mksaascom',
      discord: 'https://discord.gg/yVwpEtTT',
      youtube: 'https://www.youtube.com/@MkSaaS',
    },
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  auth: {
    enableGoogleLogin: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
      },
      zh: {
        flag: '🇨🇳',
        name: '中文',
      },
    },
  },
  blog: {
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  mail: {
    provider: 'resend',
    contact: 'support@mksaas.com',
  },
  newsletter: {
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  storage: {
    provider: 's3',
  },
  payment: {
    provider: (process.env.PAYMENT_PROVIDER as 'stripe' | 'creem') || 'stripe',
  },
  price: {
    plans: {
      plus: {
        id: 'plus',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_PLUS_MONTHLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_MONTHLY)!,
            amount: 3750,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_PLUS_YEARLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_YEARLY)!,
            amount: 44990,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        pointsReward: {
          signupBonus: 300,
          renewalBonus: 100,
          rewardRateMultiplier: 1.0,
        },
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY)!,
            amount: 7500,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY)!,
            amount: 89990,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        recommended: true,
        pointsReward: {
          signupBonus: 500,
          renewalBonus: 150,
          rewardRateMultiplier: 1.2,
        },
      },
      ultra: {
        id: 'ultra',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_ULTRA_MONTHLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTRA_MONTHLY)!,
            amount: 15000,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'creem'
              ? process.env.NEXT_PUBLIC_CREEM_PRICE_ULTRA_YEARLY
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTRA_YEARLY)!,
            amount: 179990,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        pointsReward: {
          signupBonus: 1000,
          renewalBonus: 250,
          rewardRateMultiplier: 1.5,
        },
      },
    },
  },
};
